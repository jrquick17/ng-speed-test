import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { FileDetailsModel } from '../models/file-details.model';
import { SpeedDetailsModel } from '../models/speed-details.model';
var SpeedTestService = /** @class */ (function () {
    function SpeedTestService() {
        this._applyCacheBuster = function (path) { return path + '?nnn=' + Math.random(); };
    }
    SpeedTestService.prototype._download = function (fileDetails, iterations, allDetails) {
        var _this = this;
        return new Observable(function (observer) {
            var newSpeedDetails = new SpeedDetailsModel(fileDetails.size);
            var download = new Image();
            download.onload = function (a) {
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
                return _this._download(fileDetails, --iterations, allDetails);
            }
        }));
    };
    SpeedTestService.prototype.getBps = function (fileDetails, iterations, previousSpeed) {
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
                _this._download(fileDetails, iterations).subscribe(function (speedBps) {
                    observer.next(speedBps);
                    observer.complete();
                });
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
    SpeedTestService = tslib_1.__decorate([
        Injectable()
    ], SpeedTestService);
    return SpeedTestService;
}());
export { SpeedTestService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlZWQtdGVzdC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctc3BlZWQtdGVzdC8iLCJzb3VyY2VzIjpbImFwcC9zZXJ2aWNlcy9zcGVlZC10ZXN0LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDcEMsT0FBTyxFQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1QyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUdoRTtJQUNFO1FBSVEsc0JBQWlCLEdBQUcsVUFBQyxJQUFXLElBQWEsT0FBQSxJQUFJLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBOUIsQ0FBOEIsQ0FBQztJQUZwRixDQUFDO0lBSU8sb0NBQVMsR0FBakIsVUFBa0IsV0FBNEIsRUFBRSxVQUFrQixFQUFFLFVBQStCO1FBQW5HLGlCQThEQztRQTdEQyxPQUFPLElBQUksVUFBVSxDQUNuQixVQUFDLFFBQVE7WUFDUCxJQUFNLGVBQWUsR0FBRyxJQUFJLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVoRSxJQUFNLFFBQVEsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1lBRTdCLFFBQVEsQ0FBQyxNQUFNLEdBQUcsVUFBQyxDQUFDO2dCQUNsQixlQUFlLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBRXRCLFFBQVEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQy9CLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN0QixDQUFDLENBQUM7WUFFRixRQUFRLENBQUMsT0FBTyxHQUFHO2dCQUNqQixRQUFR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LENBQUMsQ0FDRixDQUFDO1lBQ0osQ0FBQyxFQUNELENBQUMsQ0FDRixDQUFDO1FBQ0osQ0FBQyxDQUNGLENBQUM7SUFDSixDQUFDO0lBRUQsa0NBQU8sR0FBUDtRQUNFLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FDdkIsR0FBRyxDQUNELFVBQUMsR0FBRztZQUNGLE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQztRQUNwQixDQUFDLENBQ0YsQ0FDRixDQUFDO0lBQ0osQ0FBQztJQUVELGtDQUFPLEdBQVA7UUFDRSxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQ3hCLEdBQUcsQ0FDRCxVQUFDLElBQUk7WUFDSCxPQUFPLElBQUksR0FBRyxJQUFJLENBQUM7UUFDckIsQ0FBQyxDQUNGLENBQ0YsQ0FBQztJQUNKLENBQUM7SUFqSVUsZ0JBQWdCO1FBRDVCLFVBQVUsRUFBRTtPQUNBLGdCQUFnQixDQWtJNUI7SUFBRCx1QkFBQztDQUFBLEFBbElELElBa0lDO1NBbElZLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7T2JzZXJ2YWJsZSwgb2Z9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtmbGF0TWFwLCBtYXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7RmlsZURldGFpbHNNb2RlbH0gZnJvbSAnLi4vbW9kZWxzL2ZpbGUtZGV0YWlscy5tb2RlbCc7XG5pbXBvcnQge1NwZWVkRGV0YWlsc01vZGVsfSBmcm9tICcuLi9tb2RlbHMvc3BlZWQtZGV0YWlscy5tb2RlbCc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTcGVlZFRlc3RTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoKSB7XG5cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5Q2FjaGVCdXN0ZXIgPSAocGF0aDpzdHJpbmcpOiBzdHJpbmcgPT4gcGF0aCArICc/bm5uPScgKyBNYXRoLnJhbmRvbSgpO1xuXG4gIHByaXZhdGUgX2Rvd25sb2FkKGZpbGVEZXRhaWxzOkZpbGVEZXRhaWxzTW9kZWwsIGl0ZXJhdGlvbnM/Om51bWJlciwgYWxsRGV0YWlscz86U3BlZWREZXRhaWxzTW9kZWxbXSk6T2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGU8U3BlZWREZXRhaWxzTW9kZWw+KFxuICAgICAgKG9ic2VydmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1NwZWVkRGV0YWlscyA9IG5ldyBTcGVlZERldGFpbHNNb2RlbChmaWxlRGV0YWlscy5zaXplKTtcblxuICAgICAgICBjb25zdCBkb3dubG9hZCA9IG5ldyBJbWFnZSgpO1xuXG4gICAgICAgIGRvd25sb2FkLm9ubG9hZCA9IChhKSA9PiB7XG4gICAgICAgICAgbmV3U3BlZWREZXRhaWxzLmVuZCgpO1xuXG4gICAgICAgICAgb2JzZXJ2ZXIubmV4dChuZXdTcGVlZERldGFpbHMpO1xuICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZG93bmxvYWQub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICBvYnNlcnZlci5uZXh0KG51bGwpO1xuICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGZpbGVQYXRoID0gZmlsZURldGFpbHMucGF0aDtcbiAgICAgICAgaWYgKGZpbGVEZXRhaWxzLnNob3VsZEJ1c3RDYWNoZSkge1xuICAgICAgICAgIGZpbGVQYXRoID0gdGhpcy5fYXBwbHlDYWNoZUJ1c3RlcihmaWxlUGF0aCk7XG4gICAgICAgIH1cblxuICAgICAgICBuZXdTcGVlZERldGFpbHMuc3RhcnQoKTtcblxuICAgICAgICBkb3dubG9hZC5zcmMgPSBmaWxlUGF0aDtcbiAgICAgIH1cbiAgICApLnBpcGUoXG4gICAgICBmbGF0TWFwKFxuICAgICAgICAobmV3U3BlZWREZXRhaWxzOlNwZWVkRGV0YWlsc01vZGVsfG51bGwpID0+IHtcbiAgICAgICAgICBpZiAobmV3U3BlZWREZXRhaWxzID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCduZy1zcGVlZC10ZXN0OiBFcnJvciBkb3dubG9hZGluZyBmaWxlLicpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGFsbERldGFpbHMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIGFsbERldGFpbHMgPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYWxsRGV0YWlscy5wdXNoKG5ld1NwZWVkRGV0YWlscyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHR5cGVvZiBpdGVyYXRpb25zID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgaXRlcmF0aW9ucyA9IDM7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGl0ZXJhdGlvbnMgPT09IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvdW50ID0gYWxsRGV0YWlscy5sZW5ndGg7XG4gICAgICAgICAgICBsZXQgdG90YWwgPSAwO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgdG90YWwgKz0gYWxsRGV0YWlsc1tpXS5zcGVlZEJwcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgc3BlZWRCcHMgPSB0b3RhbCAvIGNvdW50O1xuXG4gICAgICAgICAgICByZXR1cm4gb2Yoc3BlZWRCcHMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZG93bmxvYWQoZmlsZURldGFpbHMsIC0taXRlcmF0aW9ucywgYWxsRGV0YWlscyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIGdldEJwcyhmaWxlRGV0YWlscz86RmlsZURldGFpbHNNb2RlbCwgaXRlcmF0aW9ucz86bnVtYmVyLCBwcmV2aW91c1NwZWVkPzpudW1iZXIpOk9ic2VydmFibGU8bnVtYmVyfG51bGw+IHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoXG4gICAgICAob2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoXG4gICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBmaWxlRGV0YWlscyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgZmlsZURldGFpbHMgPSBuZXcgRmlsZURldGFpbHNNb2RlbCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmaWxlRGV0YWlscy5wYXRoID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ25nLXNwZWVkLXRlc3Q6IEZpbGUgcGF0aCBpcyBtaXNzaW5nLicpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAodHlwZW9mIGZpbGVEZXRhaWxzLnNpemUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignbmctc3BlZWQtdGVzdDogRmlsZSBzaXplIGlzIG1pc3NpbmcuJyk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgZmlsZURldGFpbHMuc2hvdWxkQnVzdENhY2hlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGZpbGVEZXRhaWxzLnNob3VsZEJ1c3RDYWNoZSA9IHRydWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmlsZURldGFpbHMuc2hvdWxkQnVzdENhY2hlID0gZmlsZURldGFpbHMuc2hvdWxkQnVzdENhY2hlID09PSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2Rvd25sb2FkKGZpbGVEZXRhaWxzLCBpdGVyYXRpb25zKS5zdWJzY3JpYmUoXG4gICAgICAgICAgICAgIChzcGVlZEJwcykgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoc3BlZWRCcHMpO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICAxXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIGdldEticHMoKTpPYnNlcnZhYmxlPG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmdldEJwcygpLnBpcGUoXG4gICAgICBtYXAoXG4gICAgICAgIChicHMpID0+IHtcbiAgICAgICAgICByZXR1cm4gYnBzIC8gMTAyNDtcbiAgICAgICAgfVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBnZXRNYnBzKCk6T2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5nZXRLYnBzKCkucGlwZShcbiAgICAgIG1hcChcbiAgICAgICAgKGtwYnMpID0+IHtcbiAgICAgICAgICByZXR1cm4ga3BicyAvIDEwMjQ7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuICB9XG59XG4iXX0=