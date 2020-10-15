import { Injectable, NgModule } from '@angular/core';
import { Observable, of, merge, fromEvent } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

class FileDetailsModel {
    // 408949 // 500kb
    // 1197292 // 1mb
    // 4952221 // 5mb
    // 13848150 // 15mb
    constructor() {
        this.path = 'https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/5mb.jpg';
        this.shouldBustCache = true;
        this.size = 4952221;
    }
}

class SpeedDetailsModel {
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

class SpeedTestService {
    constructor() {
        this._applyCacheBuster = (path) => path + '?nnn=' + Math.random();
    }
    _download(iterations, fileDetails, allDetails) {
        return new Observable((observer) => {
            const newSpeedDetails = new SpeedDetailsModel(fileDetails.size);
            const download = new Image();
            download.onload = () => {
                newSpeedDetails.end();
                observer.next(newSpeedDetails);
                observer.complete();
            };
            download.onerror = () => {
                newSpeedDetails.error();
                observer.next(newSpeedDetails);
                observer.complete();
            };
            let filePath = fileDetails.path;
            if (fileDetails.shouldBustCache) {
                filePath = this._applyCacheBuster(filePath);
            }
            newSpeedDetails.start();
            download.src = filePath;
        }).pipe(mergeMap((newSpeedDetails) => {
            if (typeof allDetails === 'undefined') {
                allDetails = [];
            }
            allDetails.push(newSpeedDetails);
            if (typeof iterations === 'undefined') {
                iterations = 3;
            }
            if (iterations === 1) {
                const count = allDetails.length;
                let total = 0;
                for (let i = 0; i < count; i++) {
                    total += allDetails[i].speedBps;
                }
                const speedBps = total / count;
                return of(speedBps);
            }
            else {
                return this._download(--iterations, fileDetails, allDetails);
            }
        }));
    }
    getBps(iterations, fileDetails) {
        return new Observable((observer) => {
            window.setTimeout(() => {
                if (typeof fileDetails === 'undefined') {
                    fileDetails = new FileDetailsModel();
                }
                else {
                    if (typeof fileDetails.path === 'undefined') {
                        console.error('ng-speed-test: File path is missing.');
                        return null;
                    }
                    if (typeof fileDetails.size === 'undefined') {
                        console.error('ng-speed-test: File size is missing.');
                        return null;
                    }
                    if (typeof fileDetails.shouldBustCache === 'undefined') {
                        fileDetails.shouldBustCache = true;
                    }
                    else {
                        fileDetails.shouldBustCache = fileDetails.shouldBustCache === true;
                    }
                }
                this._download(iterations, fileDetails).subscribe((speedBps) => {
                    observer.next(speedBps);
                    observer.complete();
                });
            }, 1);
        });
    }
    getKbps(iterations, fileDetails) {
        return this.getBps(iterations, fileDetails).pipe(map((bps) => {
            return bps / 1024;
        }));
    }
    getMbps(iterations, fileDetails) {
        return this.getKbps(iterations, fileDetails).pipe(map((kpbs) => {
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
SpeedTestService.decorators = [
    { type: Injectable }
];
SpeedTestService.ctorParameters = () => [];

class SpeedTestModule {
}
SpeedTestModule.decorators = [
    { type: NgModule, args: [{
                providers: [
                    SpeedTestService
                ]
            },] }
];

/**
 * Generated bundle index. Do not edit.
 */

export { FileDetailsModel, SpeedTestModule, SpeedTestService };
//# sourceMappingURL=ng-speed-test.js.map
