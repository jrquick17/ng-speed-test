import { Injectable } from '@angular/core';
import { fromEvent, merge, Observable, of, throwError } from 'rxjs';
import { map, mergeMap, catchError, timeout, switchMap, startWith } from 'rxjs/operators';

import { SpeedTestResultsModel } from '../models/speed-test-results.model';
import { SpeedTestSettingsModel } from '../models/speed-test-settings.model';

export interface SpeedTestResult {
    bps: number;
    kbps: number;
    mbps: number;
    duration: number;
}

@Injectable({
    providedIn: 'root'
})
export class SpeedTestService {
    private readonly DEFAULT_TIMEOUT = 15000; // Reduced from 30s to 15s
    private readonly OFFLINE_CHECK_TIMEOUT = 3000; // Quick offline check

    constructor() {}

    private applyCacheBuster(path: string): string {
        const separator = path.includes('?') ? '&' : '?';
        return `${path}${separator}cache_bust=${Date.now()}_${Math.random()}`;
    }

    /**
     * Quick connectivity check before running speed test
     */
    private checkConnectivity(): Observable<boolean> {
        // First check navigator.onLine
        if (!navigator.onLine) {
            return of(false);
        }

        // Then do a quick network request to verify actual connectivity
        return new Observable<boolean>(observer => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                observer.next(false);
                observer.complete();
            }, this.OFFLINE_CHECK_TIMEOUT);

            // Use a small, fast endpoint for connectivity check
            fetch('https://httpbin.org/get?minimal=true', {
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

    private downloadTest(settings: SpeedTestSettingsModel, allResults: SpeedTestResultsModel[] = []): Observable<number> {
        // Quick connectivity check first
        return this.checkConnectivity().pipe(
            switchMap(isConnected => {
                if (!isConnected) {
                    return throwError(() => new Error('No internet connection available'));
                }

                return new Observable<SpeedTestResultsModel>(observer => {
                    const testResult = new SpeedTestResultsModel(settings.file!.size);
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
                        .then(() => {
                            testResult.end();
                            observer.next(testResult);
                            observer.complete();
                        })
                        .catch(error => {
                            clearTimeout(fetchTimeout);
                            console.warn('Speed test download failed:', error);
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
                });
            }),
            mergeMap((testResult: SpeedTestResultsModel) => {
                allResults.push(testResult);

                if (settings.iterations === 1) {
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
                    return this.downloadTest(settings, allResults);
                }
            })
        );
    }

    private validateSettings(settings: SpeedTestSettingsModel): void {
        if (!settings.file?.path) {
            throw new Error('ng-speed-test: File path is required');
        }

        if (!settings.file?.size || settings.file.size <= 0) {
            throw new Error('ng-speed-test: Valid file size is required');
        }

        if (settings.iterations && settings.iterations < 1) {
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

            // Small delay to ensure proper initialization
            setTimeout(() => {
                const settings = new SpeedTestSettingsModel(customSettings);

                try {
                    this.validateSettings(settings);

                    this.downloadTest(settings).subscribe({
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
        });
    }

    /**
     * Get internet speed in kilobits per second (Kbps)
     */
    getKbps(settings?: Partial<SpeedTestSettingsModel>): Observable<number> {
        return this.getBps(settings).pipe(
            map(bps => bps / 1024)
        );
    }

    /**
     * Get internet speed in megabits per second (Mbps)
     */
    getMbps(settings?: Partial<SpeedTestSettingsModel>): Observable<number> {
        return this.getKbps(settings).pipe(
            map(kbps => kbps / 1024)
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
                kbps: bps / 1024,
                mbps: bps / (1024 * 1024),
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
     * Check if the browser is online with enhanced detection
     */
    isOnline(): Observable<boolean> {
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
     * Monitor network connection status with enhanced detection
     */
    getNetworkStatus(): Observable<{ isOnline: boolean; effectiveType?: string; downlink?: number }> {
        const getConnectionInfo = () => {
            const connection = (navigator as any).connection ||
                (navigator as any).mozConnection ||
                (navigator as any).webkitConnection;

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
