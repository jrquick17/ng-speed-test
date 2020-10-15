(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define('ng-speed-test', ['exports', '@angular/core', 'rxjs', 'rxjs/operators'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['ng-speed-test'] = {}, global.ng.core, global.rxjs, global.rxjs.operators));
}(this, (function (exports, core, rxjs, operators) { 'use strict';

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
            this.duration = 0;
            this.hasEnded = false;
            this.startTime = null;
            this.endTime = null;
            this.speedBps = 0;
        }
        SpeedDetailsModel.prototype._update = function () {
            if (this.endTime !== null) {
                var milliseconds = this.endTime - this.startTime;
                if (milliseconds !== 0) {
                    this.duration = milliseconds / 1000;
                }
                var bitsLoaded = this.fileSize * 8;
                this.speedBps = bitsLoaded / this.duration;
            }
        };
        SpeedDetailsModel.prototype.end = function () {
            if (!this.hasEnded) {
                this.hasEnded = true;
                this.endTime = (new Date()).getTime();
                this._update();
            }
        };
        SpeedDetailsModel.prototype.error = function () {
            if (!this.hasEnded) {
                this.hasEnded = true;
                this.endTime = null;
                this._update();
            }
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
            return new rxjs.Observable(function (observer) {
                var newSpeedDetails = new SpeedDetailsModel(fileDetails.size);
                var download = new Image();
                download.onload = function () {
                    newSpeedDetails.end();
                    observer.next(newSpeedDetails);
                    observer.complete();
                };
                download.onerror = function () {
                    newSpeedDetails.error();
                    observer.next(newSpeedDetails);
                    observer.complete();
                };
                var filePath = fileDetails.path;
                if (fileDetails.shouldBustCache) {
                    filePath = _this._applyCacheBuster(filePath);
                }
                newSpeedDetails.start();
                download.src = filePath;
            }).pipe(operators.mergeMap(function (newSpeedDetails) {
                if (typeof allDetails === 'undefined') {
                    allDetails = [];
                }
                allDetails.push(newSpeedDetails);
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
                    return rxjs.of(speedBps);
                }
                else {
                    return _this._download(--iterations, fileDetails, allDetails);
                }
            }));
        };
        SpeedTestService.prototype.getBps = function (iterations, fileDetails) {
            var _this = this;
            return new rxjs.Observable(function (observer) {
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
            return this.getBps(iterations, fileDetails).pipe(operators.map(function (bps) {
                return bps / 1024;
            }));
        };
        SpeedTestService.prototype.getMbps = function (iterations, fileDetails) {
            return this.getKbps(iterations, fileDetails).pipe(operators.map(function (kpbs) {
                return kpbs / 1024;
            }));
        };
        return SpeedTestService;
    }());
    SpeedTestService.decorators = [
        { type: core.Injectable }
    ];
    SpeedTestService.ctorParameters = function () { return []; };

    var SpeedTestModule = /** @class */ (function () {
        function SpeedTestModule() {
        }
        return SpeedTestModule;
    }());
    SpeedTestModule.decorators = [
        { type: core.NgModule, args: [{
                    providers: [
                        SpeedTestService
                    ]
                },] }
    ];

    /**
     * Generated bundle index. Do not edit.
     */

    exports.FileDetailsModel = FileDetailsModel;
    exports.SpeedTestModule = SpeedTestModule;
    exports.SpeedTestService = SpeedTestService;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ng-speed-test.umd.js.map
