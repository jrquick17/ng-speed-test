import * as i0 from '@angular/core';
import { Injectable, NgModule } from '@angular/core';
import { Observable, of, throwError, merge, fromEvent } from 'rxjs';
import { timeout, catchError, mergeMap, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

class SpeedTestFileModel {
    // Available test files:
    // https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/500kb.jpg
    // 500kb - 408949 bytes
    // https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/1mb.jpg
    // 1mb - 1197292 bytes
    // https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/5mb.jpg
    // 5mb - 4952221 bytes
    // https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/13mb.jpg
    // 13mb - 13848150 bytes
    constructor(file) {
        this.path = 'https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/5mb.jpg';
        this.shouldBustCache = true;
        this.size = 4952221;
        if (file) {
            Object.assign(this, file);
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
            Object.assign(this, settings);
            if (settings.file) {
                this.file = new SpeedTestFileModel(settings.file);
            }
        }
    }
}

class SpeedTestService {
    constructor() {
        this.DEFAULT_TIMEOUT = 30000; // 30 seconds
    }
    applyCacheBuster(path) {
        const separator = path.includes('?') ? '&' : '?';
        return `${path}${separator}cache_bust=${Date.now()}_${Math.random()}`;
    }
    downloadTest(settings, allResults = []) {
        return new Observable(observer => {
            const testResult = new SpeedTestResultsModel(settings.file.size);
            // Use fetch API for better error handling and modern approach
            const abortController = new AbortController();
            let filePath = settings.file.path;
            if (settings.file.shouldBustCache) {
                filePath = this.applyCacheBuster(filePath);
            }
            testResult.start();
            fetch(filePath, {
                method: 'GET',
                signal: abortController.signal,
                cache: 'no-cache'
            })
                .then(response => {
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
                abortController.abort();
            };
        }).pipe(timeout(this.DEFAULT_TIMEOUT), catchError(error => {
            console.error('Speed test timeout or error:', error);
            const failedResult = new SpeedTestResultsModel(settings.file.size);
            failedResult.error();
            return of(failedResult);
        }), mergeMap((testResult) => {
            allResults.push(testResult);
            if (settings.iterations === 1) {
                // Calculate average speed from all valid results
                const validResults = allResults.filter(result => result.speedBps > 0);
                if (validResults.length === 0) {
                    return throwError(() => new Error('All speed test iterations failed'));
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
     */
    getBps(customSettings) {
        return new Observable(observer => {
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
                }
                catch (error) {
                    observer.error(error);
                }
            }, 1);
        });
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
     * Get comprehensive speed test results
     */
    getSpeedTestResult(settings) {
        const startTime = Date.now();
        return this.getBps(settings).pipe(map(bps => ({
            bps,
            kbps: bps / 1024,
            mbps: bps / (1024 * 1024),
            duration: (Date.now() - startTime) / 1000
        })));
    }
    /**
     * Check if the browser is online
     */
    isOnline() {
        return merge(fromEvent(window, 'offline').pipe(map(() => false)), fromEvent(window, 'online').pipe(map(() => true)), of(navigator.onLine));
    }
    /**
     * Monitor network connection status
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
        return merge(fromEvent(window, 'offline').pipe(map(() => ({ ...getConnectionInfo(), isOnline: false }))), fromEvent(window, 'online').pipe(map(() => ({ ...getConnectionInfo(), isOnline: true }))), of(getConnectionInfo()));
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
