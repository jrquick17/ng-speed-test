import { __decorate } from 'tslib';
import { Injectable, NgModule } from '@angular/core';
import { Observable, of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

var FileDetailsModel = /** @class */ (function () {
    // 408949 // 500kb
    // 1197292 // 1mb
    // 4952221 // 5mb
    // 13848150 // 15mb
    function FileDetailsModel() {
        this.path = 'https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/5mb.jpg';
        this.shouldBustCache = true;
        this.size = 4952221;
    }
    return FileDetailsModel;
}());

var SpeedDetailsModel = /** @class */ (function () {
    function SpeedDetailsModel(fileSize) {
        this.fileSize = fileSize;
    }
    SpeedDetailsModel.prototype.end = function () {
        this.endTime = (new Date()).getTime();
        this.duration = (this.endTime - this.startTime) / 1000;
        var bitsLoaded = this.fileSize * 8;
        this.speedBps = bitsLoaded / this.duration;
    };
    SpeedDetailsModel.prototype.start = function () {
        this.startTime = (new Date()).getTime();
    };
    return SpeedDetailsModel;
}());

var SpeedTestService = /** @class */ (function () {
    function SpeedTestService() {
        this._applyCacheBuster = function (path) { return path + '?nnn=' + Math.random(); };
    }
    SpeedTestService.prototype._download = function (iterations, fileDetails, allDetails) {
        var _this = this;
        return new Observable(function (observer) {
            var newSpeedDetails = new SpeedDetailsModel(fileDetails.size);
            var download = new Image();
            download.onload = function () {
                newSpeedDetails.end();
                observer.next(newSpeedDetails);
                observer.complete();
            };
            download.onerror = function () {
                observer.next(null);
                observer.complete();
            };
            var filePath = fileDetails.path;
            if (fileDetails.shouldBustCache) {
                filePath = _this._applyCacheBuster(filePath);
            }
            newSpeedDetails.start();
            download.src = filePath;
        }).pipe(flatMap(function (newSpeedDetails) {
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
                var count = allDetails.length;
                var total = 0;
                for (var i = 0; i < count; i++) {
                    total += allDetails[i].speedBps;
                }
                var speedBps = total / count;
                return of(speedBps);
            }
            else {
                return _this._download(--iterations, fileDetails, allDetails);
            }
        }));
    };
    SpeedTestService.prototype.getBps = function (iterations, fileDetails) {
        var _this = this;
        return new Observable(function (observer) {
            window.setTimeout(function () {
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
                _this._download(iterations, fileDetails).subscribe(function (speedBps) {
                    observer.next(speedBps);
                    observer.complete();
                });
            }, 1);
        });
    };
    SpeedTestService.prototype.getKbps = function (iterations, fileDetails) {
        return this.getBps(iterations, fileDetails).pipe(map(function (bps) {
            return bps / 1024;
        }));
    };
    SpeedTestService.prototype.getMbps = function (iterations, fileDetails) {
        return this.getKbps(iterations, fileDetails).pipe(map(function (kpbs) {
            return kpbs / 1024;
        }));
    };
    SpeedTestService = __decorate([
        Injectable()
    ], SpeedTestService);
    return SpeedTestService;
}());

var SpeedTestModule = /** @class */ (function () {
    function SpeedTestModule() {
    }
    SpeedTestModule = __decorate([
        NgModule({
            providers: [
                SpeedTestService
            ]
        })
    ], SpeedTestModule);
    return SpeedTestModule;
}());

/**
 * Generated bundle index. Do not edit.
 */

export { FileDetailsModel, SpeedTestModule, SpeedTestService };
//# sourceMappingURL=ng-speed-test.js.map
