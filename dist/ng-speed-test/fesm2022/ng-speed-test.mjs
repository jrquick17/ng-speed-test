import * as i0 from '@angular/core';
import { InjectionToken, makeEnvironmentProviders, inject, Injectable, NgModule } from '@angular/core';
import { of, Observable, throwError, merge, fromEvent } from 'rxjs';
import { switchMap, mergeMap, map, timeout, catchError, startWith } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
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
    constructor() {
        this.duration = 0;
        this.hasEnded = false;
        this.startTime = null;
        this.endTime = null;
        this.bytesReceived = 0;
        this.speedBps = 0;
    }
    get speedKbps() {
        return this.speedBps / 1000;
    }
    get speedMbps() {
        return this.speedKbps / 1000;
    }
    _update() {
        if (this.endTime !== null && this.startTime !== null) {
            const milliseconds = this.endTime - this.startTime;
            this.duration = milliseconds / 1000;
            const bitsLoaded = this.bytesReceived * 8;
            // Guard against a zero (or negative, e.g. clock anomalies) duration: dividing by it
            // would otherwise produce Infinity/NaN, which would incorrectly pass the
            // `speedBps > 0` validity filter in SpeedTestService.downloadTest(). Falling back to
            // 0 here keeps the result finite so it is correctly discarded like any other failure.
            this.speedBps = this.duration > 0 ? bitsLoaded / this.duration : 0;
        }
    }
    /** bytesReceived is the actual response body size (e.g. Blob.size), not the configured file hint. */
    end(bytesReceived) {
        if (!this.hasEnded) {
            this.hasEnded = true;
            this.bytesReceived = bytesReceived;
            this.endTime = performance.now();
            this._update();
        }
    }
    error() {
        if (!this.hasEnded) {
            this.hasEnded = true;
            this.endTime = null;
            this._update();
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
        if (settings) {
            if (settings.iterations !== undefined) {
                this.iterations = settings.iterations;
            }
            if (settings.retryDelay !== undefined) {
                this.retryDelay = settings.retryDelay;
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
        this.config = inject(SPEED_TEST_CONFIG, { optional: true }) ?? {};
        this.DEFAULT_TIMEOUT = this.config.timeout ?? 15000; // Reduced from 30s to 15s
        this.OFFLINE_CHECK_TIMEOUT = this.config.connectivityCheckTimeout ?? 3000; // Quick offline check
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
    downloadTest(settings, allResults = []) {
        // Quick connectivity check first
        return this.checkConnectivity().pipe(switchMap(isConnected => {
            if (!isConnected) {
                return throwError(() => new Error('No internet connection available'));
            }
            return new Observable(observer => {
                const testResult = new SpeedTestResultsModel();
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
            });
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
                return this.downloadTest(settings, allResults);
            }
        }));
    }
    validateSettings(settings) {
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
        // Merge file settings
        if (customSettings.file) {
            mergedSettings.file = new SpeedTestFileModel();
            // Merge file path
            mergedSettings.file.path = customSettings.file.path !== undefined
                ? customSettings.file.path
                : defaultSettings.file.path;
            // Merge file size
            mergedSettings.file.size = customSettings.file.size !== undefined
                ? customSettings.file.size
                : defaultSettings.file.size;
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
     * Get internet speed in kilobits per second (Kbps), using the decimal convention
     * (1 Kbps = 1,000 bps) that ISPs and other speed test tools use.
     */
    getKbps(settings) {
        return this.getBps(settings).pipe(map(bps => bps / 1000));
    }
    /**
     * Get internet speed in megabits per second (Mbps), using the decimal convention
     * (1 Mbps = 1,000,000 bps) that ISPs and other speed test tools use.
     */
    getMbps(settings) {
        return this.getKbps(settings).pipe(map(kbps => kbps / 1000));
    }
    /**
     * Get comprehensive speed test results with fast failure for offline scenarios
     */
    getSpeedTestResult(settings) {
        const startTime = Date.now();
        return this.getBps(settings).pipe(map(bps => ({
            bps,
            kbps: bps / 1000,
            mbps: bps / (1000 * 1000),
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
     * Check if the browser is online with enhanced detection
     */
    isOnline() {
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
     * Monitor network connection status with enhanced detection
     */
    getNetworkStatus() {
        const getConnectionInfo = () => {
            const connection = navigator.connection ||
                navigator.mozConnection ||
                navigator.webkitConnection;
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
