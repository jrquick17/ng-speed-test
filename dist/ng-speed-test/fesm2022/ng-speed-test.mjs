import * as i0 from '@angular/core';
import { Injectable, NgModule } from '@angular/core';
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
    constructor(fileSize) {
        this.fileSize = fileSize;
        this.duration = 0;
        this.hasEnded = false;
        this.startTime = null;
        this.endTime = null;
        this.speedBps = 0;
    }
    get speedKbps() {
        return this.speedBps / 1024;
    }
    get speedMbps() {
        return this.speedKbps / 1024;
    }
    _update() {
        if (this.endTime !== null && this.startTime !== null) {
            const milliseconds = this.endTime - this.startTime;
            if (milliseconds !== 0) {
                this.duration = milliseconds / 1000;
            }
            const bitsLoaded = this.fileSize * 8;
            this.speedBps = bitsLoaded / this.duration;
        }
    }
    end() {
        if (!this.hasEnded) {
            this.hasEnded = true;
            this.endTime = Date.now();
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
        this.startTime = Date.now();
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

class SpeedTestService {
    constructor() {
        this.DEFAULT_TIMEOUT = 15000; // Reduced from 30s to 15s
        this.OFFLINE_CHECK_TIMEOUT = 3000; // Quick offline check
    }
    applyCacheBuster(path) {
        const separator = path.includes('?') ? '&' : '?';
        return `${path}${separator}cache_bust=${Date.now()}_${Math.random()}`;
    }
    /**
     * Quick connectivity check before running speed test
     */
    checkConnectivity() {
        // First check navigator.onLine
        if (!navigator.onLine) {
            return of(false);
        }
        // Then do a quick network request to verify actual connectivity
        return new Observable(observer => {
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
    downloadTest(settings, allResults = []) {
        // Quick connectivity check first
        return this.checkConnectivity().pipe(switchMap(isConnected => {
            if (!isConnected) {
                return throwError(() => new Error('No internet connection available'));
            }
            return new Observable(observer => {
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
            if (settings.iterations === 1) {
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
    getBps(customSettings) {
        return new Observable(observer => {
            // Check connectivity immediately
            if (!navigator.onLine) {
                observer.error(new Error('No internet connection - browser reports offline'));
                return;
            }
            // Small delay to ensure proper initialization
            setTimeout(() => {
                // Create settings with proper merging
                const defaultSettings = new SpeedTestSettingsModel();
                const settings = this.mergeSettings(defaultSettings, customSettings);
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
                }
                catch (error) {
                    observer.error(error);
                }
            }, 1);
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: SpeedTestService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: SpeedTestService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: SpeedTestService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });

class SpeedTestModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: SpeedTestModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.13", ngImport: i0, type: SpeedTestModule, imports: [CommonModule, FormsModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: SpeedTestModule, providers: [SpeedTestService], imports: [CommonModule, FormsModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: SpeedTestModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, FormsModule],
                    providers: [SpeedTestService]
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { SpeedTestFileModel, SpeedTestModule, SpeedTestResultsModel, SpeedTestService, SpeedTestSettingsModel };
//# sourceMappingURL=ng-speed-test.mjs.map
