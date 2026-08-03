import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { fromEvent, merge, Observable, of, Subscription, throwError } from 'rxjs';
import { map, mergeMap, catchError, timeout, switchMap, startWith } from 'rxjs/operators';

import { SpeedTestFileModel } from '../models/speed-test-file.model';
import { SpeedTestSettingsModel } from '../models/speed-test-settings.model';
import { SpeedTestResultsModel } from '../models/speed-test-results.model';
import { SPEED_TEST_CONFIG } from '../providers/speed-test-config';

export interface SpeedTestResult {
    bps: number;
    kbps: number;
    mbps: number;
    duration: number;
}

interface NetworkInformation {
    effectiveType?: string;
    downlink?: number;
}

interface NavigatorWithConnection extends Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
}

@Injectable({
    providedIn: 'root'
})
export class SpeedTestService {
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly config = inject(SPEED_TEST_CONFIG, { optional: true }) ?? {};
    private readonly DEFAULT_TIMEOUT = this.config.timeout ?? 15000; // Reduced from 30s to 15s
    private readonly OFFLINE_CHECK_TIMEOUT = this.config.connectivityCheckTimeout ?? 3000; // Quick offline check
    private readonly WARM_UP_TIMEOUT = 3000; // Fixed, short budget - independent of the configurable download timeout

    constructor() {}

    private applyCacheBuster(path: string): string {
        const separator = path.includes('?') ? '&' : '?';
        return `${path}${separator}cache_bust=${Date.now()}_${Math.random()}`;
    }

    /**
     * Quick connectivity check before running speed test.
     *
     * Only contacts a third-party host if the consumer opted in via
     * provideSpeedTest({ connectivityCheckUrl }) - otherwise this trusts navigator.onLine, and an
     * unreachable network still surfaces as a real, attributable error from the file fetch itself.
     */
    private checkConnectivity(): Observable<boolean> {
        // First check navigator.onLine
        if (!navigator.onLine) {
            return of(false);
        }

        if (!this.config.connectivityCheckUrl) {
            return of(true);
        }

        // Then do a quick network request to verify actual connectivity
        return new Observable<boolean>(observer => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                observer.next(false);
                observer.complete();
            }, this.OFFLINE_CHECK_TIMEOUT);

            fetch(this.config.connectivityCheckUrl!, {
                method: 'HEAD',
                mode: 'no-cors',
                signal: controller.signal,
                cache: 'no-cache'
            })
                .then(() => {
                    clearTimeout(timeoutId);
                    observer.next(true);
                    observer.complete();
                })
                .catch(() => {
                    clearTimeout(timeoutId);
                    observer.next(false);
                    observer.complete();
                });

            return () => {
                clearTimeout(timeoutId);
                controller.abort();
            };
        });
    }

    /**
     * Runs one untimed GET against the configured file before the first timed iteration, so
     * DNS lookup / TLS handshake / TCP slow-start aren't counted as transfer time on that first
     * measurement (D6). The response is discarded and any failure here is swallowed - a real
     * connectivity problem still surfaces from the timed fetch that follows.
     */
    private warmUp(settings: SpeedTestSettingsModel): Observable<void> {
        return new Observable<void>(observer => {
            const abortController = new AbortController();

            let filePath = settings.file!.path;
            if (settings.file!.shouldBustCache) {
                filePath = this.applyCacheBuster(filePath);
            }

            // Mirrors the real download's fetchTimeout below: complete directly from the timeout
            // rather than waiting on the fetch promise to settle after abort() - a fetch that
            // never reacts to its AbortSignal (e.g. one that hangs indefinitely) would otherwise
            // never let this warm-up finish.
            const warmUpTimeout = setTimeout(() => {
                abortController.abort();
                observer.next();
                observer.complete();
            }, this.WARM_UP_TIMEOUT);

            fetch(filePath, {
                method: 'GET',
                signal: abortController.signal,
                cache: 'no-cache'
            })
                .then(response => response.blob())
                .catch(() => {
                    // Ignored - a real problem still surfaces from the timed fetch that follows.
                })
                .finally(() => {
                    clearTimeout(warmUpTimeout);
                    observer.next();
                    observer.complete();
                });

            return () => {
                clearTimeout(warmUpTimeout);
                abortController.abort();
            };
        });
    }

    private downloadTest(settings: SpeedTestSettingsModel, allResults: SpeedTestResultsModel[] = [], warmedUp = false): Observable<number> {
        // Quick connectivity check first
        return this.checkConnectivity().pipe(
            switchMap(isConnected => {
                if (!isConnected) {
                    return throwError(() => new Error('No internet connection available'));
                }

                // Warm up once, before the first timed iteration - skipped on the recursive
                // calls for iterations 2+ within the same getBps() call (warmedUp === true).
                const warmUp$ = warmedUp ? of(undefined) : this.warmUp(settings);

                return warmUp$.pipe(
                    switchMap(() => new Observable<SpeedTestResultsModel>(observer => {
                        const testResult = new SpeedTestResultsModel();
                        const abortController = new AbortController();

                        let filePath = settings.file!.path;
                        if (settings.file!.shouldBustCache) {
                            filePath = this.applyCacheBuster(filePath);
                        }

                        testResult.start();

                        // Set a more aggressive timeout for the fetch request
                        const fetchTimeout = setTimeout(() => {
                            abortController.abort();
                            testResult.error();
                            observer.next(testResult);
                            observer.complete();
                        }, this.DEFAULT_TIMEOUT);

                        fetch(filePath, {
                            method: 'GET',
                            signal: abortController.signal,
                            cache: 'no-cache'
                        })
                            .then(response => {
                                clearTimeout(fetchTimeout);
                                if (!response.ok) {
                                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                                }
                                return response.blob();
                            })
                            .then(blob => {
                                testResult.end(blob.size);
                                observer.next(testResult);
                                observer.complete();
                            })
                            .catch(() => {
                                clearTimeout(fetchTimeout);
                                // Surfaced via the existing error channel: testResult.error() marks
                                // this iteration as failed (speedBps stays 0), so it is discarded by
                                // the `speedBps > 0` filter below rather than logged to the console.
                                // If every iteration fails, the mergeMap below throws a descriptive
                                // error that propagates out through the returned Observable.
                                testResult.error();

                                const delay = settings.iterations !== 1 ? settings.retryDelay! : 0;

                                setTimeout(() => {
                                    observer.next(testResult);
                                    observer.complete();
                                }, delay);
                            });

                        // Cleanup function
                        return () => {
                            clearTimeout(fetchTimeout);
                            abortController.abort();
                        };
                    }))
                );
            }),
            mergeMap((testResult: SpeedTestResultsModel) => {
                allResults.push(testResult);

                if (settings.iterations! <= 1) {
                    // Calculate average speed from all valid results
                    const validResults = allResults.filter(result => result.speedBps > 0);

                    if (validResults.length === 0) {
                        return throwError(() => new Error('All speed test iterations failed - no internet connection or server unreachable'));
                    }

                    const totalSpeed = validResults.reduce((sum, result) => sum + result.speedBps, 0);
                    const averageSpeed = totalSpeed / validResults.length;

                    return of(averageSpeed);
                } else {
                    settings.iterations!--;
                    return this.downloadTest(settings, allResults, true);
                }
            })
        );
    }

    private validateSettings(settings: SpeedTestSettingsModel): void {
        if (!settings.file?.path) {
            throw new Error('ng-speed-test: File path is required');
        }

        if (settings.iterations !== undefined && settings.iterations < 1) {
            throw new Error('ng-speed-test: Iterations must be at least 1');
        }
    }

    /**
     * Get internet speed in bits per second (bps)
     * Fails fast if no internet connection is available
     */
    getBps(customSettings?: Partial<SpeedTestSettingsModel>): Observable<number> {
        return new Observable(observer => {
            // Check connectivity immediately
            if (!navigator.onLine) {
                observer.error(new Error('No internet connection - browser reports offline'));
                return;
            }

            let downloadSubscription: Subscription | undefined;

            // Small delay to ensure proper initialization
            const initTimeoutId = setTimeout(() => {
                // Create settings with proper merging
                const defaultSettings = new SpeedTestSettingsModel();
                if (this.config.file) {
                    defaultSettings.file = new SpeedTestFileModel(this.config.file);
                }
                const settings = this.mergeSettings(defaultSettings, customSettings);

                try {
                    this.validateSettings(settings);

                    downloadSubscription = this.downloadTest(settings).subscribe({
                        next: (speedBps) => {
                            observer.next(speedBps);
                            observer.complete();
                        },
                        error: (error) => {
                            observer.error(error);
                        }
                    });
                } catch (error) {
                    observer.error(error);
                }
            }, 1);

            // Teardown: runs on unsubscribe (including via takeUntil/timeout upstream, or normal
            // completion/error). Clears the pending init setTimeout so it can't fire after
            // teardown, and unsubscribes the inner downloadTest() subscription, which propagates
            // down through its switchMap/mergeMap chain to the per-iteration fetch Observable and
            // triggers its own teardown (clearTimeout(fetchTimeout) + abortController.abort()),
            // actually cancelling the in-flight fetch instead of letting it run to completion.
            return () => {
                clearTimeout(initTimeoutId);
                downloadSubscription?.unsubscribe();
            };
        });
    }

    /**
     * Properly merge custom settings with defaults
     */
    private mergeSettings(defaultSettings: SpeedTestSettingsModel, customSettings?: Partial<SpeedTestSettingsModel>): SpeedTestSettingsModel {
        if (!customSettings) {
            return defaultSettings;
        }

        const mergedSettings = new SpeedTestSettingsModel();

        // Merge iterations
        mergedSettings.iterations = customSettings.iterations !== undefined
            ? customSettings.iterations
            : defaultSettings.iterations;

        // Merge retryDelay
        mergedSettings.retryDelay = customSettings.retryDelay !== undefined
            ? customSettings.retryDelay
            : defaultSettings.retryDelay;

        // Merge file settings
        if (customSettings.file) {
            mergedSettings.file = new SpeedTestFileModel();

            // Merge file path
            mergedSettings.file.path = customSettings.file.path !== undefined
                ? customSettings.file.path
                : defaultSettings.file!.path;

            // Merge file size
            mergedSettings.file.size = customSettings.file.size !== undefined
                ? customSettings.file.size
                : defaultSettings.file!.size;

            // Merge shouldBustCache
            mergedSettings.file.shouldBustCache = customSettings.file.shouldBustCache !== undefined
                ? customSettings.file.shouldBustCache
                : defaultSettings.file!.shouldBustCache;
        } else {
            mergedSettings.file = defaultSettings.file;
        }

        return mergedSettings;
    }

    /**
     * Get internet speed in kilobits per second (Kbps), using the decimal convention
     * (1 Kbps = 1,000 bps) that ISPs and other speed test tools use.
     */
    getKbps(settings?: Partial<SpeedTestSettingsModel>): Observable<number> {
        return this.getBps(settings).pipe(
            map(bps => bps / 1000)
        );
    }

    /**
     * Get internet speed in megabits per second (Mbps), using the decimal convention
     * (1 Mbps = 1,000,000 bps) that ISPs and other speed test tools use.
     */
    getMbps(settings?: Partial<SpeedTestSettingsModel>): Observable<number> {
        return this.getKbps(settings).pipe(
            map(kbps => kbps / 1000)
        );
    }

    /**
     * Get comprehensive speed test results with fast failure for offline scenarios
     */
    getSpeedTestResult(settings?: Partial<SpeedTestSettingsModel>): Observable<SpeedTestResult> {
        const startTime = Date.now();

        return this.getBps(settings).pipe(
            map(bps => ({
                bps,
                kbps: bps / 1000,
                mbps: bps / (1000 * 1000),
                duration: (Date.now() - startTime) / 1000
            })),
            timeout(this.DEFAULT_TIMEOUT + 5000), // Overall timeout slightly longer than individual request timeout
            catchError(error => {
                if (error.name === 'TimeoutError') {
                    return throwError(() => new Error('Speed test timed out - please check your internet connection'));
                }
                return throwError(() => error);
            })
        );
    }

    /**
     * Check if the browser is online with enhanced detection.
     *
     * On the server (SSR) there is no `window`/`navigator` to observe, so this reports `true`
     * once and completes rather than touching either - there is no real network signal to read
     * during a server render.
     */
    isOnline(): Observable<boolean> {
        if (!this.isBrowser) {
            return of(true);
        }

        return merge(
            fromEvent(window, 'offline').pipe(map(() => false)),
            fromEvent(window, 'online').pipe(map(() => true)),
            of(navigator.onLine)
        ).pipe(
            startWith(navigator.onLine),
            // Verify actual connectivity for online state
            switchMap(browserOnline => {
                if (!browserOnline) {
                    return of(false);
                }
                // Quick connectivity verification
                return this.checkConnectivity();
            })
        );
    }

    /**
     * Monitor network connection status with enhanced detection.
     *
     * On the server (SSR) there is no `window`/`navigator` to observe, so this reports
     * `{ isOnline: true }` once and completes rather than touching either - `effectiveType`/
     * `downlink` are left undefined since there is no connection to read during a server render.
     */
    getNetworkStatus(): Observable<{ isOnline: boolean; effectiveType?: string; downlink?: number }> {
        if (!this.isBrowser) {
            return of({ isOnline: true });
        }

        const getConnectionInfo = () => {
            const nav = navigator as NavigatorWithConnection;
            const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

            return {
                isOnline: navigator.onLine,
                effectiveType: connection?.effectiveType,
                downlink: connection?.downlink
            };
        };

        return merge(
            fromEvent(window, 'offline').pipe(
                map(() => ({ ...getConnectionInfo(), isOnline: false }))
            ),
            fromEvent(window, 'online').pipe(
                map(() => getConnectionInfo()),
                // Verify actual connectivity when browser reports online
                switchMap(info =>
                    this.checkConnectivity().pipe(
                        map(actuallyOnline => ({ ...info, isOnline: actuallyOnline }))
                    )
                )
            ),
            of(getConnectionInfo()).pipe(
                switchMap(info =>
                    info.isOnline
                        ? this.checkConnectivity().pipe(
                            map(actuallyOnline => ({ ...info, isOnline: actuallyOnline }))
                        )
                        : of(info)
                )
            )
        );
    }
}
