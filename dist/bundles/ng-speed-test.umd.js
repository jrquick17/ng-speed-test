(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define('ng-speed-test', ['exports', '@angular/core', 'rxjs', 'rxjs/operators'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['ng-speed-test'] = {}, global.ng.core, global.rxjs, global.rxjs.operators));
}(this, (function (exports, core, rxjs, operators) { 'use strict';

    var SpeedTestFileModel = /** @class */ (function () {
        // https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/500kb.jpg
        // 500kb      // 408949 kb
        // https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/1mb.jpg
        // 1mb        // 1197292 kb
        // https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/5mb.jpg
        // 5mb        // 4952221 kb
        // https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/13mb.jpg
        // 13mb       // 13848150 kb
        function SpeedTestFileModel() {
            this.path = 'https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/5mb.jpg';
            this.shouldBustCache = true;
            this.size = 4952221;
        }
        return SpeedTestFileModel;
    }());

    var SpeedTestResultsModel = /** @class */ (function () {
        function SpeedTestResultsModel(fileSize) {
            this.fileSize = fileSize;
            this.duration = 0;
            this.hasEnded = false;
            this.startTime = null;
            this.endTime = null;
            this.speedBps = 0;
        }
        SpeedTestResultsModel.prototype._update = function () {
            if (this.endTime !== null) {
                var milliseconds = this.endTime - this.startTime;
                if (milliseconds !== 0) {
                    this.duration = milliseconds / 1000;
                }
                var bitsLoaded = this.fileSize * 8;
                this.speedBps = bitsLoaded / this.duration;
            }
        };
        SpeedTestResultsModel.prototype.end = function () {
            if (!this.hasEnded) {
                this.hasEnded = true;
                this.endTime = (new Date()).getTime();
                this._update();
            }
        };
        SpeedTestResultsModel.prototype.error = function () {
            if (!this.hasEnded) {
                this.hasEnded = true;
                this.endTime = null;
                this._update();
            }
        };
        SpeedTestResultsModel.prototype.start = function () {
            this.startTime = (new Date()).getTime();
        };
        return SpeedTestResultsModel;
    }());

    var SpeedTestSettingsModel = /** @class */ (function () {
        function SpeedTestSettingsModel() {
            this.iterations = 3;
            this.file = new SpeedTestFileModel();
            this.retryDelay = 500;
        }
        return SpeedTestSettingsModel;
    }());

    var SpeedTestService = /** @class */ (function () {
        function SpeedTestService() {
            this._applyCacheBuster = function (path) { return path + '?nnn=' + Math.random(); };
        }
        SpeedTestService.prototype._download = function (settings, allDetails) {
            var _this = this;
            return new rxjs.Observable(function (observer) {
                var newSpeedDetails = new SpeedTestResultsModel(settings.file.size);
                var download = new Image();
                download.onload = function () {
                    newSpeedDetails.end();
                    observer.next(newSpeedDetails);
                    observer.complete();
                };
                download.onerror = function () {
                    newSpeedDetails.error();
                    var delay = 0;
                    if (settings.iterations !== 1) {
                        delay = settings.retryDelay;
                    }
                    window.setTimeout(function () {
                        observer.next(newSpeedDetails);
                        observer.complete();
                    }, delay);
                };
                var filePath = settings.file.path;
                if (settings.file.shouldBustCache) {
                    filePath = _this._applyCacheBuster(filePath);
                }
                newSpeedDetails.start();
                download.src = filePath;
            }).pipe(operators.mergeMap(function (newSpeedDetails) {
                if (typeof allDetails === 'undefined') {
                    allDetails = [];
                }
                allDetails.push(newSpeedDetails);
                if (settings.iterations === 1) {
                    var count = allDetails.length;
                    var total = 0;
                    for (var i = 0; i < count; i++) {
                        total += allDetails[i].speedBps;
                    }
                    var speedBps = total / count;
                    return rxjs.of(speedBps);
                }
                else {
                    settings.iterations--;
                    return _this._download(settings, allDetails);
                }
            }));
        };
        SpeedTestService.prototype.getBps = function (settings) {
            var _this = this;
            return new rxjs.Observable(function (observer) {
                window.setTimeout(function () {
                    var defaultSettings = new SpeedTestSettingsModel();
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
                            var defaultFileSettings = new SpeedTestFileModel();
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
                    _this._download(Object.assign({}, settings)).subscribe(function (speedBps) {
                        observer.next(speedBps);
                        observer.complete();
                    });
                }, 1);
            });
        };
        SpeedTestService.prototype.getKbps = function (settings) {
            return this.getBps(settings).pipe(operators.map(function (bps) {
                return bps / 1024;
            }));
        };
        SpeedTestService.prototype.getMbps = function (settings) {
            return this.getKbps(settings).pipe(operators.map(function (kpbs) {
                return kpbs / 1024;
            }));
        };
        SpeedTestService.prototype.isOnline = function () {
            return rxjs.merge(rxjs.fromEvent(window, 'offline').pipe(operators.map(function () { return false; })), rxjs.fromEvent(window, 'online').pipe(operators.map(function () { return true; })), new rxjs.Observable(function (sub) {
                sub.next(navigator.onLine);
                sub.complete();
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

    exports.SpeedTestFileModel = SpeedTestFileModel;
    exports.SpeedTestModule = SpeedTestModule;
    exports.SpeedTestResultsModel = SpeedTestResultsModel;
    exports.SpeedTestService = SpeedTestService;
    exports.SpeedTestSettingsModel = SpeedTestSettingsModel;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ng-speed-test.umd.js.map
