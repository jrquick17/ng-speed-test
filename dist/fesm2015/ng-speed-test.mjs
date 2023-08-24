import * as i0 from '@angular/core';
import { Injectable, NgModule } from '@angular/core';
import { Observable, of, merge, fromEvent } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

class SpeedTestFileModel {
    // https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/500kb.jpg
    // 500kb      // 408949 kb
    // https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/1mb.jpg
    // 1mb        // 1197292 kb
    // https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/5mb.jpg
    // 5mb        // 4952221 kb
    // https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/13mb.jpg
    // 13mb       // 13848150 kb
    constructor() {
        this.path = 'https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/5mb.jpg';
        this.shouldBustCache = true;
        this.size = 4952221;
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
    _update() {
        if (this.endTime !== null) {
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
            this.endTime = (new Date()).getTime();
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
        this.startTime = (new Date()).getTime();
    }
}

class SpeedTestSettingsModel {
    constructor() {
        this.iterations = 3;
        this.file = new SpeedTestFileModel();
        this.retryDelay = 500;
    }
}

class SpeedTestService {
    constructor() {
        this._applyCacheBuster = (path) => path + '?nnn=' + Math.random();
    }
    _download(settings, allDetails) {
        return new Observable((observer) => {
            const newSpeedDetails = new SpeedTestResultsModel(settings.file.size);
            const download = new Image();
            download.onload = () => {
                newSpeedDetails.end();
                observer.next(newSpeedDetails);
                observer.complete();
            };
            download.onerror = () => {
                newSpeedDetails.error();
                let delay = 0;
                if (settings.iterations !== 1) {
                    delay = settings.retryDelay;
                }
                window.setTimeout(() => {
                    observer.next(newSpeedDetails);
                    observer.complete();
                }, delay);
            };
            let filePath = settings.file.path;
            if (settings.file.shouldBustCache) {
                filePath = this._applyCacheBuster(filePath);
            }
            newSpeedDetails.start();
            download.src = filePath;
        }).pipe(mergeMap((newSpeedDetails) => {
            if (typeof allDetails === 'undefined') {
                allDetails = [];
            }
            allDetails.push(newSpeedDetails);
            if (settings.iterations === 1) {
                const count = allDetails.length;
                let total = 0;
                for (let i = 0; i < count; i++) {
                    total += allDetails[i].speedBps;
                }
                const speedBps = total / count;
                return of(speedBps);
            }
            else {
                settings.iterations--;
                return this._download(settings, allDetails);
            }
        }));
    }
    getBps(settings) {
        return new Observable((observer) => {
            window.setTimeout(() => {
                const defaultSettings = new SpeedTestSettingsModel();
                if (typeof settings === 'undefined') {
                    settings = Object.assign({}, defaultSettings);
                }
                else {
                    if (typeof settings.iterations === 'undefined') {
                        settings.iterations = defaultSettings.iterations;
                    }
                    if (typeof settings.file === 'undefined') {
                        settings.file = defaultSettings.file;
                    }
                    else {
                        const defaultFileSettings = new SpeedTestFileModel();
                        if (typeof settings.file.path === 'undefined') {
                            console.error('ng-speed-test: File path is missing.');
                            return null;
                        }
                        if (typeof settings.file.size === 'undefined') {
                            console.error('ng-speed-test: File size is missing.');
                            return null;
                        }
                        if (typeof settings.file.shouldBustCache === 'undefined') {
                            settings.file.shouldBustCache = defaultFileSettings.shouldBustCache;
                        }
                        if (typeof settings.retryDelay === 'undefined') {
                            settings.retryDelay = defaultSettings.retryDelay;
                        }
                    }
                }
                this._download(Object.assign({}, settings)).subscribe((speedBps) => {
                    observer.next(speedBps);
                    observer.complete();
                });
            }, 1);
        });
    }
    getKbps(settings) {
        return this.getBps(settings).pipe(map((bps) => {
            return bps / 1024;
        }));
    }
    getMbps(settings) {
        return this.getKbps(settings).pipe(map((kpbs) => {
            return kpbs / 1024;
        }));
    }
    isOnline() {
        return merge(fromEvent(window, 'offline').pipe(map(() => false)), fromEvent(window, 'online').pipe(map(() => true)), new Observable((sub) => {
            sub.next(navigator.onLine);
            sub.complete();
        }));
    }
}
SpeedTestService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: SpeedTestService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
SpeedTestService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: SpeedTestService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: SpeedTestService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return []; } });

class SpeedTestModule {
}
SpeedTestModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: SpeedTestModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
SpeedTestModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: SpeedTestModule });
SpeedTestModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: SpeedTestModule, providers: [
        SpeedTestService
    ] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: SpeedTestModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [
                        SpeedTestService
                    ]
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { SpeedTestFileModel, SpeedTestModule, SpeedTestResultsModel, SpeedTestService, SpeedTestSettingsModel };
//# sourceMappingURL=ng-speed-test.mjs.map
