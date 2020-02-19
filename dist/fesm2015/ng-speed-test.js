import { __decorate } from 'tslib';
import { Injectable, NgModule } from '@angular/core';
import { Observable } from 'rxjs';

let SpeedTestService = class SpeedTestService {
    constructor() {
    }
    getSpeed() {
        return new Observable((observer) => {
            window.setTimeout(() => {
                const imageAddr = 'https://webapp.uic-chp.org/internet-speed-image.jpg';
                let startTime, endTime;
                const download = new Image();
                download.onload = () => {
                    endTime = (new Date()).getTime();
                    const downloadSize = 4995374;
                    const duration = (endTime - startTime) / 1000;
                    const bitsLoaded = downloadSize * 8;
                    const speedBps = (bitsLoaded / duration).toFixed(2);
                    const speedKbps = (speedBps / 1024).toFixed(2);
                    const speedMbps = (speedKbps / 1024).toFixed(2);
                    observer.next(speedMbps);
                    observer.complete();
                };
                download.onerror = () => {
                    observer.next(false);
                    observer.complete();
                };
                startTime = (new Date()).getTime();
                const cacheBuster = '?nnn=' + startTime;
                download.src = imageAddr + cacheBuster;
            }, 1);
        });
    }
};
SpeedTestService = __decorate([
    Injectable()
], SpeedTestService);

let NgSpeedTestModule = class NgSpeedTestModule {
};
NgSpeedTestModule = __decorate([
    NgModule({
        providers: [
            SpeedTestService
        ]
    })
], NgSpeedTestModule);

/**
 * Generated bundle index. Do not edit.
 */

export { NgSpeedTestModule, SpeedTestService };
//# sourceMappingURL=ng-speed-test.js.map
