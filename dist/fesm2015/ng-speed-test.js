import { __decorate } from 'tslib';
import { Injectable, NgModule } from '@angular/core';
import { Observable, of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

class FileDetailsModel {
    // 408949 // 500kb
    // 1197292 // 1mb
    // 4952221 // 5mb
    // 13848150 // 15mb
    constructor() {
        this.path = 'https://ng-speed-test.jrquick.com/assets/1mb.jpg';
        this.shouldBustCache = true;
        this.size = 1197292;
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
    _download(fileDetails, iterations, allDetails) {
        return new Observable((observer) => {
            const newSpeedDetails = new SpeedDetailsModel(fileDetails.size);
            const download = new Image();
            download.onload = (a) => {
                newSpeedDetails.end();
                observer.next(newSpeedDetails);
                observer.complete();
            };
            download.onerror = () => {
                observer.next(null);
                observer.complete();
            };
            let filePath = fileDetails.path;
            if (fileDetails.shouldBustCache) {
                filePath = this._applyCacheBuster(filePath);
            }
            newSpeedDetails.start();
            download.src = filePath;
        }).pipe(flatMap((newSpeedDetails) => {
            if (newSpeedDetails === null) {
                console.error('ng-speed-test: Error downloading file.');
            }
            else {
                if (typeof allDetails === 'undefined') {
                    allDetails = [];
                }
                allDetails.push(newSpeedDetails);
            }
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
                return this._download(fileDetails, --iterations, allDetails);
            }
        }));
    }
    getBps(fileDetails, iterations, previousSpeed) {
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
                this._download(fileDetails, iterations).subscribe((speedBps) => {
                    observer.next(speedBps);
                    observer.complete();
                });
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
