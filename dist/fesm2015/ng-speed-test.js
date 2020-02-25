import { __decorate } from 'tslib';
import { Injectable, NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

class FileDetailsModel {
    constructor() {
        this.shouldBustCache = true;
    }
}

class SpeedDetailsModel {
    constructor(fileSize) {
        this.fileSize = fileSize;
    }
    end() {
        this.endTime = (new Date()).getTime();
        this.duration = (this.endTime - this.startTime) / 1000;
        const bitsLoaded = this.fileSize * 8;
        this.speedBps = bitsLoaded / this.duration;
    }
    start() {
        this.startTime = (new Date()).getTime();
    }
}

let SpeedTestService = class SpeedTestService {
    constructor() {
        this._applyCacheBuster = (path) => path + '?nnn=' + Math.random();
    }
    getBps(fileDetails, iterations) {
        return new Observable((observer) => {
            window.setTimeout(() => {
                let filePath = 'https://ng-speed-test.jrquick.com/assets/1mb.jpg';
                let fileSize = 1197292;
                let shouldBustCache = true;
                // 408949 // 500kb
                // 1197292 // 1mb
                // 4952221 // 5mb
                // 13848150 // 15mb
                if (typeof fileDetails !== 'undefined') {
                    if (typeof fileDetails.path === 'undefined') {
                        console.error('ng-speed-test: File path is missing.');
                    }
                    else {
                        filePath = fileDetails.path;
                    }
                    if (typeof fileDetails.shouldBustCache !== 'undefined') {
                        shouldBustCache = fileDetails.shouldBustCache === true;
                    }
                    if (typeof fileDetails.size === 'undefined') {
                        console.error('ng-speed-test: File size is missing.');
                    }
                    else {
                        fileSize = fileDetails.size;
                    }
                }
                if (shouldBustCache) {
                    filePath = this._applyCacheBuster(filePath);
                }
                if (typeof iterations === 'undefined') {
                    iterations = 1;
                }
                const speedDetails = new SpeedDetailsModel(fileSize);
                const download = new Image();
                download.onload = (a) => {
                    speedDetails.end();
                    observer.next(speedDetails.speedBps);
                    observer.complete();
                };
                download.onerror = () => {
                    observer.next(null);
                    observer.complete();
                };
                speedDetails.start();
                download.src = filePath;
            }, 1);
        });
    }
    getKbps() {
        return this.getBps().pipe(map((bps) => {
            return bps / 1024;
        }));
    }
    getMbps() {
        return this.getKbps().pipe(map((kpbs) => {
            return kpbs / 1024;
        }));
    }
};
SpeedTestService = __decorate([
    Injectable()
], SpeedTestService);

let SpeedTestModule = class SpeedTestModule {
};
SpeedTestModule = __decorate([
    NgModule({
        providers: [
            SpeedTestService
        ]
    })
], SpeedTestModule);

/**
 * Generated bundle index. Do not edit.
 */

export { FileDetailsModel, SpeedTestModule, SpeedTestService };
//# sourceMappingURL=ng-speed-test.js.map
