import { __decorate } from 'tslib';
import { Injectable, NgModule } from '@angular/core';
import { Observable } from 'rxjs';

var SpeedTestService = /** @class */ (function () {
    function SpeedTestService() {
    }
    SpeedTestService.prototype.getSpeed = function () {
        return new Observable(function (observer) {
            window.setTimeout(function () {
                var imageAddr = 'https://webapp.uic-chp.org/internet-speed-image.jpg';
                var startTime, endTime;
                var download = new Image();
                download.onload = function () {
                    endTime = (new Date()).getTime();
                    var downloadSize = 4995374;
                    var duration = (endTime - startTime) / 1000;
                    var bitsLoaded = downloadSize * 8;
                    var speedBps = (bitsLoaded / duration).toFixed(2);
                    var speedKbps = (speedBps / 1024).toFixed(2);
                    var speedMbps = (speedKbps / 1024).toFixed(2);
                    observer.next(speedMbps);
                    observer.complete();
                };
                download.onerror = function () {
                    observer.next(false);
                    observer.complete();
                };
                startTime = (new Date()).getTime();
                var cacheBuster = '?nnn=' + startTime;
                download.src = imageAddr + cacheBuster;
            }, 1);
        });
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

export { SpeedTestModule, SpeedTestService };
//# sourceMappingURL=ng-speed-test.js.map
