import { __decorate } from 'tslib';
import { Injectable, NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

var FileDetailsModel = /** @class */ (function () {
    function FileDetailsModel() {
        this.shouldBustCache = true;
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
    SpeedTestService.prototype.getBps = function (fileDetails, iterations) {
        var _this = this;
        return new Observable(function (observer) {
            window.setTimeout(function () {
                var filePath = 'https://ng-speed-test.jrquick.com/assets/1mb.jpg';
                var fileSize = 1197292;
                var shouldBustCache = true;
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
                    filePath = _this._applyCacheBuster(filePath);
                }
                if (typeof iterations === 'undefined') {
                    iterations = 1;
                }
                var speedDetails = new SpeedDetailsModel(fileSize);
                var download = new Image();
                download.onload = function (a) {
                    speedDetails.end();
                    observer.next(speedDetails.speedBps);
                    observer.complete();
                };
                download.onerror = function () {
                    observer.next(null);
                    observer.complete();
                };
                speedDetails.start();
                download.src = filePath;
            }, 1);
        });
    };
    SpeedTestService.prototype.getKbps = function () {
        return this.getBps().pipe(map(function (bps) {
            return bps / 1024;
        }));
    };
    SpeedTestService.prototype.getMbps = function () {
        return this.getKbps().pipe(map(function (kpbs) {
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
