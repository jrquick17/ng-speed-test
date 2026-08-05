import * as i0 from '@angular/core';
import { InjectionToken, makeEnvironmentProviders, inject, PLATFORM_ID, Injectable, NgModule } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { of, Observable, throwError, merge, fromEvent } from 'rxjs';
import { switchMap, mergeMap, map, timeout, catchError, startWith } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

class SpeedTestFileModel {
    constructor(file) {
        this.path = 'https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/5mb.jpg';
        this.shouldBustCache = true;
        this.size = 4952221;
        if (file) {
            if (file.path !== undefined) {
                this.path = file.path;
            }
            if (file.size !== undefined) {
                this.size = file.size;
            }
            if (file.shouldBustCache !== undefined) {
                this.shouldBustCache = file.shouldBustCache;
            }
        }
    }
}

class SpeedTestResultsModel {
    constructor(fileSize) {
        this.fileSize = fileSize;
        this.duration = 0;
        this.hasEnded = false;
        this.startTime = null;
        this.endTime = null;
        this.bytesReceived = 0;
        this.speedBps = 0;
    }
    get speedKbps() {
        return this.speedBps / 1024;
    }
    get speedMbps() {
        return this.speedKbps / 1024;
    }
    _update(bytesLoaded) {
        if (this.endTime !== null && this.startTime !== null) {
            const milliseconds = this.endTime - this.startTime;
            this.duration = milliseconds / 1000;
            const bitsLoaded = bytesLoaded * 8;
            // Guard against a zero (or negative, e.g. clock anomalies) duration: dividing by it
            // would otherwise produce Infinity/NaN, which would incorrectly pass the
            // `speedBps > 0` validity filter in SpeedTestService.downloadTest(). Falling back to
            // 0 here keeps the result finite so it is correctly discarded like any other failure.
            this.speedBps = this.duration > 0 ? bitsLoaded / this.duration : 0;
        }
    }
    /**
     * Reverting C3 (3.4.1): speed is once again computed from the configured `fileSize` by
     * default, matching v3.3.0 exactly - `end()` with no argument (every call site except the
     * one below) behaves identically to pre-3.4.0.
     *
     * `bytesReceived`, if passed, is used instead. This one exception exists only to support
     * `maxSampleDuration` (D7, not part of C3, kept on purpose): when a read is cancelled early,
     * `fileSize` describes the whole configured file, not what was actually sampled, so dividing
     * by it would wildly overstate speed. Only the caller opting into `maxSampleDuration` passes
     * a value here; everyone else keeps the reverted, file-size-based behavior unchanged.
     */
    end(bytesReceived) {
        if (!this.hasEnded) {
            this.hasEnded = true;
            this.bytesReceived = bytesReceived !== undefined ? bytesReceived : this.fileSize;
            this.endTime = performance.now();
            this._update(this.bytesReceived);
        }
    }
    error() {
        if (!this.hasEnded) {
            this.hasEnded = true;
            this.endTime = null;
            this._update(this.bytesReceived);
        }
    }
    start() {
        this.startTime = performance.now();
    }
}

class SpeedTestSettingsModel {
    constructor(settings) {
        this.iterations = 3;
        this.file = new SpeedTestFileModel();
        this.retryDelay = 500;
        this.maxSampleDuration = undefined;
        if (settings) {
            if (settings.iterations !== undefined) {
                this.iterations = settings.iterations;
            }
            if (settings.retryDelay !== undefined) {
                this.retryDelay = settings.retryDelay;
            }
            if (settings.maxSampleDuration !== undefined) {
                this.maxSampleDuration = settings.maxSampleDuration;
            }
            if (settings.file) {
                this.file = new SpeedTestFileModel();
                if (settings.file.path !== undefined) {
                    this.file.path = settings.file.path;
                }
                if (settings.file.size !== undefined) {
                    this.file.size = settings.file.size;
                }
                if (settings.file.shouldBustCache !== undefined) {
                    this.file.shouldBustCache = settings.file.shouldBustCache;
                }
            }
        }
    }
}

const SPEED_TEST_CONFIG = new InjectionToken('SPEED_TEST_CONFIG');
/**
 * Configures SpeedTestService. Optional - every field has a working default and this call is
 * not required to use the library. Pass connectivityCheckUrl only if you want an extra,
 * network-verified connectivity check in addition to navigator.onLine; ng-speed-test does not
 * contact any third-party host on its own unless you configure one here.
 */
function provideSpeedTest(config = {}) {
    return makeEnvironmentProviders([
        { provide: SPEED_TEST_CONFIG, useValue: config }
    ]);
}

class SpeedTestService {
    constructor() {
        this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
        this.config = inject(SPEED_TEST_CONFIG, { optional: true }) ?? {};
        this.DEFAULT_TIMEOUT = this.config.timeout ?? 15000; // Reduced from 30s to 15s
        this.OFFLINE_CHECK_TIMEOUT = this.config.connectivityCheckTimeout ?? 3000; // Quick offline check
        this.WARM_UP_TIMEOUT = 3000; // Fixed, short budget - independent of the configurable download timeout
    }
    applyCacheBuster(path) {
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
    checkConnectivity() {
        // First check navigator.onLine
        if (!navigator.onLine) {
            return of(false);
        }
        if (!this.config.connectivityCheckUrl) {
            return of(true);
        }
        // Then do a quick network request to verify actual connectivity
        return new Observable(observer => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                observer.next(false);
                observer.complete();
            }, this.OFFLINE_CHECK_TIMEOUT);
            fetch(this.config.connectivityCheckUrl, {
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
    warmUp(settings) {
        return new Observable(observer => {
            const abortController = new AbortController();
            let filePath = settings.file.path;
            if (settings.file.shouldBustCache) {
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
    readResponseBody(response, options = {}) {
        const reader = response.body?.getReader();
        if (!reader) {
            return response.blob().then(blob => blob.size);
        }
        const startTime = performance.now();
        let bytesReceived = 0;
        const pump = () => reader.read().then(({ done, value }) => {
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
    downloadTest(settings, allResults = [], warmedUp = false) {
        // Quick connectivity check first
        return this.checkConnectivity().pipe(switchMap(isConnected => {
            if (!isConnected) {
                return throwError(() => new Error('No internet connection available'));
            }
            // Warm up once, before the first timed iteration - skipped on the recursive
            // calls for iterations 2+ within the same getBps() call (warmedUp === true).
            const warmUp$ = warmedUp ? of(undefined) : this.warmUp(settings);
            return warmUp$.pipe(switchMap(() => new Observable(observer => {
                const testResult = new SpeedTestResultsModel(settings.file.size);
                const abortController = new AbortController();
                let filePath = settings.file.path;
                if (settings.file.shouldBustCache) {
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
                    return this.readResponseBody(response, { maxDurationMs: settings.maxSampleDuration });
                })
                    .then(bytesReceived => {
                    // Reverted C3 (3.4.1): the default speed calculation goes back to
                    // the configured file.size, matching v3.3.0. bytesReceived is
                    // only passed through when maxSampleDuration is set - see
                    // SpeedTestResultsModel.end()'s doc for why that opt-in case has
                    // to keep using the actual bytes read.
                    testResult.end(settings.maxSampleDuration !== undefined ? bytesReceived : undefined);
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
                    const delay = settings.iterations !== 1 ? settings.retryDelay : 0;
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
            })));
        }), mergeMap((testResult) => {
            allResults.push(testResult);
            if (settings.iterations <= 1) {
                // Calculate average speed from all valid results
                const validResults = allResults.filter(result => result.speedBps > 0);
                if (validResults.length === 0) {
                    return throwError(() => new Error('All speed test iterations failed - no internet connection or server unreachable'));
                }
                const totalSpeed = validResults.reduce((sum, result) => sum + result.speedBps, 0);
                const averageSpeed = totalSpeed / validResults.length;
                return of(averageSpeed);
            }
            else {
                settings.iterations--;
                return this.downloadTest(settings, allResults, true);
            }
        }));
    }
    validateSettings(settings) {
        if (!settings.file?.path) {
            throw new Error('ng-speed-test: File path is required');
        }
        if (!settings.file?.size || settings.file.size <= 0) {
            throw new Error('ng-speed-test: Valid file size is required');
        }
        if (settings.iterations !== undefined && settings.iterations < 1) {
            throw new Error('ng-speed-test: Iterations must be at least 1');
        }
        if (settings.maxSampleDuration !== undefined && settings.maxSampleDuration < 1) {
            throw new Error('ng-speed-test: maxSampleDuration must be at least 1');
        }
    }
    /**
     * Get internet speed in bits per second (bps)
     * Fails fast if no internet connection is available
     */
    getBps(customSettings) {
        return new Observable(observer => {
            // Check connectivity immediately
            if (!navigator.onLine) {
                observer.error(new Error('No internet connection - browser reports offline'));
                return;
            }
            let downloadSubscription;
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
                }
                catch (error) {
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
    mergeSettings(defaultSettings, customSettings) {
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
                && customSettings.file.path !== defaultSettings.file.path;
            mergedSettings.file.path = customSettings.file.path !== undefined
                ? customSettings.file.path
                : defaultSettings.file.path;
            // Merge file size - the default size describes the default file, so it must not carry
            // over onto a caller-supplied path it doesn't actually describe (C4). Since C3's
            // revert (3.4.1) made file.size drive the reported speed again, a path change left
            // with no size resolves to undefined here and validateSettings() now rejects it with
            // a clear error, rather than silently reporting a speed computed against the wrong file.
            if (customSettings.file.size !== undefined) {
                mergedSettings.file.size = customSettings.file.size;
            }
            else if (pathChanged) {
                // SpeedTestFile.size is required (reverted C3, 3.4.1), so this is a deliberately
                // invalid intermediate value - validateSettings() rejects it with a clear error
                // before it can reach a fetch, rather than silently computing a wrong speed
                // against the caller's actual file using the default's stale size.
                mergedSettings.file.size = undefined;
            }
            else {
                mergedSettings.file.size = defaultSettings.file.size;
            }
            // Merge shouldBustCache
            mergedSettings.file.shouldBustCache = customSettings.file.shouldBustCache !== undefined
                ? customSettings.file.shouldBustCache
                : defaultSettings.file.shouldBustCache;
        }
        else {
            mergedSettings.file = defaultSettings.file;
        }
        return mergedSettings;
    }
    /**
     * Get internet speed in kilobits per second (Kbps)
     */
    getKbps(settings) {
        return this.getBps(settings).pipe(map(bps => bps / 1024));
    }
    /**
     * Get internet speed in megabits per second (Mbps)
     */
    getMbps(settings) {
        return this.getKbps(settings).pipe(map(kbps => kbps / 1024));
    }
    /**
     * Get comprehensive speed test results with fast failure for offline scenarios
     */
    getSpeedTestResult(settings) {
        const startTime = Date.now();
        return this.getBps(settings).pipe(map(bps => ({
            bps,
            kbps: bps / 1024,
            mbps: bps / (1024 * 1024),
            duration: (Date.now() - startTime) / 1000
        })), timeout(this.DEFAULT_TIMEOUT + 5000), // Overall timeout slightly longer than individual request timeout
        catchError(error => {
            if (error.name === 'TimeoutError') {
                return throwError(() => new Error('Speed test timed out - please check your internet connection'));
            }
            return throwError(() => error);
        }));
    }
    /**
     * Check if the browser is online with enhanced detection.
     *
     * On the server (SSR) there is no `window`/`navigator` to observe, so this reports `true`
     * once and completes rather than touching either - there is no real network signal to read
     * during a server render.
     */
    isOnline() {
        if (!this.isBrowser) {
            return of(true);
        }
        return merge(fromEvent(window, 'offline').pipe(map(() => false)), fromEvent(window, 'online').pipe(map(() => true)), of(navigator.onLine)).pipe(startWith(navigator.onLine), 
        // Verify actual connectivity for online state
        switchMap(browserOnline => {
            if (!browserOnline) {
                return of(false);
            }
            // Quick connectivity verification
            return this.checkConnectivity();
        }));
    }
    /**
     * Monitor network connection status with enhanced detection.
     *
     * On the server (SSR) there is no `window`/`navigator` to observe, so this reports
     * `{ isOnline: true }` once and completes rather than touching either - `effectiveType`/
     * `downlink` are left undefined since there is no connection to read during a server render.
     */
    getNetworkStatus() {
        if (!this.isBrowser) {
            return of({ isOnline: true });
        }
        const getConnectionInfo = () => {
            const nav = navigator;
            const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
            return {
                isOnline: navigator.onLine,
                effectiveType: connection?.effectiveType,
                downlink: connection?.downlink
            };
        };
        return merge(fromEvent(window, 'offline').pipe(map(() => ({ ...getConnectionInfo(), isOnline: false }))), fromEvent(window, 'online').pipe(map(() => getConnectionInfo()), 
        // Verify actual connectivity when browser reports online
        switchMap(info => this.checkConnectivity().pipe(map(actuallyOnline => ({ ...info, isOnline: actuallyOnline }))))), of(getConnectionInfo()).pipe(switchMap(info => info.isOnline
            ? this.checkConnectivity().pipe(map(actuallyOnline => ({ ...info, isOnline: actuallyOnline })))
            : of(info))));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.27", ngImport: i0, type: SpeedTestService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.27", ngImport: i0, type: SpeedTestService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.27", ngImport: i0, type: SpeedTestService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });

class SpeedTestModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.27", ngImport: i0, type: SpeedTestModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "20.3.27", ngImport: i0, type: SpeedTestModule, imports: [CommonModule, FormsModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "20.3.27", ngImport: i0, type: SpeedTestModule, providers: [SpeedTestService], imports: [CommonModule, FormsModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.27", ngImport: i0, type: SpeedTestModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, FormsModule],
                    providers: [SpeedTestService]
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { SPEED_TEST_CONFIG, SpeedTestFileModel, SpeedTestModule, SpeedTestResultsModel, SpeedTestService, SpeedTestSettingsModel, provideSpeedTest };
//# sourceMappingURL=ng-speed-test.mjs.map
