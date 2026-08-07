import { inject, Injectable, Injector, PLATFORM_ID, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
    /**
     * Latency (time-to-first-byte), in milliseconds - the median across the iterations that
     * succeeded (D9). Unlike `duration`, this is milliseconds, not seconds - TTFB is normally a
     * two- or three-digit number of ms, so seconds would round it away. 0 if no iteration ever
     * received a response.
     */
    latency: number;
    /**
     * Jitter, in milliseconds: the population standard deviation of the per-iteration latency
     * samples that made up `latency` (D9). A larger value means TTFB varied more between
     * iterations. Always 0 when fewer than 2 iterations succeeded - there's no variance to
     * measure from a single sample.
     */
    jitter: number;
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

    /**
     * Reads a fetch Response body via its ReadableStream (D7), accumulating bytes chunk by chunk
     * instead of buffering the whole body via response.blob() before anything is measurable.
     *
     * `onProgress` fires after every chunk with the running byte total and elapsed milliseconds
     * since the first chunk - this is the "progress observable mid-request" mechanism the D7
     * checklist item asks for. It is not yet wired to anything on the public API surface (no
     * public method accepts a progress callback or emits progress events); a future item can plug
     * a public-facing progress Observable into this hook without changing how bytes are read.
     *
     * If `maxDurationMs` is set, the read stops - via `reader.cancel()` - as soon as elapsed time
     * reaches it, and the promise resolves with only the bytes read so far. This is what lets a
     * single iteration finish without downloading the entire configured file: duration-based
     * sampling rather than always measuring a fixed total. Left undefined (the default), the full
     * body is read to completion, identical to the pre-D7 behavior.
     *
     * Falls back to response.blob() when response.body is unavailable (e.g. a HEAD response, an
     * opaque no-cors response, or a test double that doesn't model a streaming body) - this keeps
     * every pre-D7 test's mocked Response working unchanged.
     */
    private readResponseBody(
        response: Response,
        options: { maxDurationMs?: number; onProgress?: (bytesReceived: number, elapsedMs: number) => void } = {}
    ): Promise<number> {
        const reader = response.body?.getReader();
        if (!reader) {
            return response.blob().then(blob => blob.size);
        }

        const startTime = performance.now();
        let bytesReceived = 0;

        const pump = (): Promise<number> =>
            reader.read().then(({ done, value }) => {
                if (done) {
                    return bytesReceived;
                }

                bytesReceived += value.byteLength;
                const elapsedMs = performance.now() - startTime;
                options.onProgress?.(bytesReceived, elapsedMs);

                if (options.maxDurationMs !== undefined && elapsedMs >= options.maxDurationMs) {
                    return reader.cancel().then(() => bytesReceived, () => bytesReceived);
                }

                return pump();
            });

        return pump();
    }

    /**
     * Middle value of the sorted valid results, or the average of the two middle values when the
     * count is even (D8, re-applied for real in 4.0.0 after the checklist previously claimed this
     * landed when the code still used a plain arithmetic mean). Chosen over a trimmed mean: the
     * default `iterations` is 3, too small to trim an equal count off both ends and still have
     * more than one sample left, whereas a median degrades gracefully at any count - 1 iteration
     * returns that value unchanged, 2 average both (identical to a mean at n=2), and only at 3+
     * does it diverge, which is exactly where a single outlier can be outvoted instead of dragging
     * the result toward it.
     */
    private median(values: number[]): number {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    /**
     * Population standard deviation of a set of latency samples (D9) - the jitter figure exposed
     * on `SpeedTestResult`. A larger result means more variance between samples. Needs at least 2
     * samples to mean anything; with 0 or 1 there's no variance to measure, so this returns 0
     * rather than NaN.
     */
    private jitter(values: number[]): number {
        if (values.length < 2) {
            return 0;
        }

        const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
        const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
        return Math.sqrt(variance);
    }

    private downloadTest(settings: SpeedTestSettingsModel, allResults: SpeedTestResultsModel[] = [], warmedUp = false): Observable<{ bps: number; latencyMs: number; jitterMs: number }> {
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
                                // Response headers have arrived - this is time-to-first-byte
                                // (D9), whether or not the response ends up being usable, so it's
                                // recorded before the ok check below.
                                testResult.firstByte();
                                if (!response.ok) {
                                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                                }
                                return this.readResponseBody(response, { maxDurationMs: settings.maxSampleDuration });
                            })
                            .then(bytesReceived => {
                                testResult.end(bytesReceived);
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
                    const validResults = allResults.filter(result => result.speedBps > 0);

                    if (validResults.length === 0) {
                        return throwError(() => new Error('All speed test iterations failed - no internet connection or server unreachable'));
                    }

                    // Latency/jitter (D9) are derived only from the same valid results bps is -
                    // a failed iteration's latency (if it even has one; a network error never
                    // gets that far) shouldn't skew either figure.
                    const latencies = validResults
                        .map(result => result.latencyMs)
                        .filter((latencyMs): latencyMs is number => latencyMs !== null);

                    return of({
                        bps: this.median(validResults.map(result => result.speedBps)),
                        latencyMs: latencies.length > 0 ? this.median(latencies) : 0,
                        jitterMs: this.jitter(latencies)
                    });
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

        if (settings.maxSampleDuration !== undefined && settings.maxSampleDuration < 1) {
            throw new Error('ng-speed-test: maxSampleDuration must be at least 1');
        }
    }

    /**
     * Runs a full speed test and resolves the raw aggregate: bps plus latency/jitter (D9).
     * `getBps()` and `getSpeedTestResult()` both build on this rather than duplicating the
     * connectivity/init-delay/teardown machinery below.
     */
    private runSpeedTest(customSettings?: Partial<SpeedTestSettingsModel>): Observable<{ bps: number; latencyMs: number; jitterMs: number }> {
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
                        next: (result) => {
                            observer.next(result);
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
     * Get internet speed in bits per second (bps)
     * Fails fast if no internet connection is available
     */
    getBps(customSettings?: Partial<SpeedTestSettingsModel>): Observable<number> {
        return this.runSpeedTest(customSettings).pipe(map(result => result.bps));
    }

    /**
     * Signal-based equivalent of `getBps()` (C5). Starts `undefined` and updates once the test
     * completes; if the test fails, reading the signal after that point rethrows the error, same
     * as `toSignal()`'s standard behavior for a source that errors.
     *
     * Must be called within an injection context - e.g. as a component field initializer
     * (`speed = this.speedTestService.getBpsSignal();`) - or pass an explicit `injector`
     * otherwise. This is what lets the underlying subscription clean up automatically via the
     * calling component's `DestroyRef` rather than needing manual unsubscription.
     *
     * Uses `toSignal()`, not Angular's newer `resource()`/`rxResource()` - those only became
     * stable `@publicApi` at Angular 22.0, and this library still supports Angular 20/21.
     * `toSignal()` writes plain signals directly, independent of `NgZone`, so this works
     * correctly in a zoneless application - verified in `speed-test.service.spec.ts`.
     */
    getBpsSignal(customSettings?: Partial<SpeedTestSettingsModel>, injector?: Injector): Signal<number | undefined> {
        return injector
            ? toSignal(this.getBps(customSettings), { injector })
            : toSignal(this.getBps(customSettings));
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

        // Merge maxSampleDuration (D7)
        mergedSettings.maxSampleDuration = customSettings.maxSampleDuration !== undefined
            ? customSettings.maxSampleDuration
            : defaultSettings.maxSampleDuration;

        // Merge file settings
        if (customSettings.file) {
            mergedSettings.file = new SpeedTestFileModel();

            // Merge file path
            const pathChanged = customSettings.file.path !== undefined
                && customSettings.file.path !== defaultSettings.file!.path;
            mergedSettings.file.path = customSettings.file.path !== undefined
                ? customSettings.file.path
                : defaultSettings.file!.path;

            // Merge file size - the default size describes the default file, so it must not carry
            // over onto a caller-supplied path it doesn't actually describe (C4). Since C3, size
            // is only a cosmetic hint (speed is computed from the actual bytes received), so this
            // just keeps what a caller reads back from merged settings accurate - it has no effect
            // on the reported speed either way.
            if (customSettings.file.size !== undefined) {
                mergedSettings.file.size = customSettings.file.size;
            } else if (pathChanged) {
                mergedSettings.file.size = undefined;
            } else {
                mergedSettings.file.size = defaultSettings.file!.size;
            }

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
     * Signal-based equivalent of `getKbps()` (C5). See `getBpsSignal()`'s doc for the injection
     * context requirement and the `toSignal()`-over-`resource()` rationale.
     */
    getKbpsSignal(settings?: Partial<SpeedTestSettingsModel>, injector?: Injector): Signal<number | undefined> {
        return injector
            ? toSignal(this.getKbps(settings), { injector })
            : toSignal(this.getKbps(settings));
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
     * Signal-based equivalent of `getMbps()` (C5). See `getBpsSignal()`'s doc for the injection
     * context requirement and the `toSignal()`-over-`resource()` rationale.
     */
    getMbpsSignal(settings?: Partial<SpeedTestSettingsModel>, injector?: Injector): Signal<number | undefined> {
        return injector
            ? toSignal(this.getMbps(settings), { injector })
            : toSignal(this.getMbps(settings));
    }

    /**
     * Get comprehensive speed test results with fast failure for offline scenarios
     */
    getSpeedTestResult(settings?: Partial<SpeedTestSettingsModel>): Observable<SpeedTestResult> {
        const startTime = Date.now();

        return this.runSpeedTest(settings).pipe(
            map(result => ({
                bps: result.bps,
                kbps: result.bps / 1000,
                mbps: result.bps / (1000 * 1000),
                duration: (Date.now() - startTime) / 1000,
                latency: result.latencyMs,
                jitter: result.jitterMs
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
     * Signal-based equivalent of `getSpeedTestResult()` (C5). See `getBpsSignal()`'s doc for the
     * injection context requirement and the `toSignal()`-over-`resource()` rationale.
     */
    getSpeedTestResultSignal(settings?: Partial<SpeedTestSettingsModel>, injector?: Injector): Signal<SpeedTestResult | undefined> {
        return injector
            ? toSignal(this.getSpeedTestResult(settings), { injector })
            : toSignal(this.getSpeedTestResult(settings));
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
