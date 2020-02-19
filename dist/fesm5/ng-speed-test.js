import { __decorate } from 'tslib';
import { Injectable, NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

var SpeedTestService = /** @class */ (function () {
    function SpeedTestService() {
    }
    SpeedTestService.prototype.getBps = function () {
        return new Observable(function (observer) {
            window.setTimeout(function () {
                // const imageAddr = 'https://ng-speed-test.jrquick.com/assets/internet-speed-image.jpg';
                var imageAddr = 'https://webapp.uic-chp.org/internet-speed-image.jpg';
                var startTime, endTime;
                var download = new Image();
                download.onload = function (a) {
                    endTime = (new Date()).getTime();
                    var downloadSize = 4995374;
                    var duration = (endTime - startTime) / 1000;
                    var bitsLoaded = downloadSize * 8;
                    var speedBps = bitsLoaded / duration;
                    observer.next(speedBps);
                    observer.complete();
                };
                download.onerror = function () {
                    observer.next(-1);
                    observer.complete();
                };
                startTime = (new Date()).getTime();
                var cacheBuster = '?nnn=' + startTime;
                download.src = imageAddr + cacheBuster;
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

export { SpeedTestModule, SpeedTestService };
//# sourceMappingURL=ng-speed-test.js.map
