import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SpeedDetailsModel } from '../models/speed-details.model';
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
    SpeedTestService = tslib_1.__decorate([
        Injectable()
    ], SpeedTestService);
    return SpeedTestService;
}());
export { SpeedTestService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlZWQtdGVzdC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctc3BlZWQtdGVzdC8iLCJzb3VyY2VzIjpbImFwcC9zZXJ2aWNlcy9zcGVlZC10ZXN0LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFDLFVBQVUsRUFBYSxNQUFNLE1BQU0sQ0FBQztBQUM1QyxPQUFPLEVBQUMsR0FBRyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFbkMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFHaEU7SUFDRTtRQUlRLHNCQUFpQixHQUFHLFVBQUMsSUFBVyxJQUFhLE9BQUEsSUFBSSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQTlCLENBQThCLENBQUM7SUFGcEYsQ0FBQztJQUlELGlDQUFNLEdBQU4sVUFBTyxXQUE2QixFQUFFLFVBQWtCO1FBQXhELGlCQWdFQztRQS9EQyxPQUFPLElBQUksVUFBVSxDQUNuQixVQUFDLFFBQVE7WUFDUCxNQUFNLENBQUMsVUFBVSxDQUNmO2dCQUNFLElBQUksUUFBUSxHQUFHLGtEQUFrRCxDQUFDO2dCQUNsRSxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUM7Z0JBQ3ZCLElBQUksZUFBZSxHQUFHLElBQUksQ0FBQztnQkFFM0Isa0JBQWtCO2dCQUNsQixpQkFBaUI7Z0JBQ2pCLGlCQUFpQjtnQkFDakIsbUJBQW1CO2dCQUVuQixJQUFJLE9BQU8sV0FBVyxLQUFLLFdBQVcsRUFBRTtvQkFDdEMsSUFBSSxPQUFPLFdBQVcsQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUFFO3dCQUMzQyxPQUFPLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7cUJBQ3ZEO3lCQUFNO3dCQUNMLFFBQVEsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO3FCQUM3QjtvQkFFRCxJQUFJLE9BQU8sV0FBVyxDQUFDLGVBQWUsS0FBSyxXQUFXLEVBQUU7d0JBQ3RELGVBQWUsR0FBRyxXQUFXLENBQUMsZUFBZSxLQUFLLElBQUksQ0FBQztxQkFDeEQ7b0JBRUQsSUFBSSxPQUFPLFdBQVcsQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUFFO3dCQUMzQyxPQUFPLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7cUJBQ3ZEO3lCQUFNO3dCQUNMLFFBQVEsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO3FCQUM3QjtpQkFDRjtnQkFFRCxJQUFJLGVBQWUsRUFBRTtvQkFDbkIsUUFBUSxHQUFHLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDN0M7Z0JBRUQsSUFBSSxPQUFPLFVBQVUsS0FBSyxXQUFXLEVBQUU7b0JBQ3JDLFVBQVUsR0FBRyxDQUFDLENBQUM7aUJBQ2hCO2dCQUVELElBQU0sWUFBWSxHQUFHLElBQUksaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRXJELElBQU0sUUFBUSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBRTdCLFFBQVEsQ0FBQyxNQUFNLEdBQUcsVUFBQyxDQUFDO29CQUNsQixZQUFZLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBRW5CLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUNyQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3RCLENBQUMsQ0FBQztnQkFFRixRQUFRLENBQUMsT0FBTyxHQUFHO29CQUNqQixRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNwQixRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3RCLENBQUMsQ0FBQztnQkFFRixZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBRXJCLFFBQVEsQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDO1lBQzFCLENBQUMsRUFDRCxDQUFDLENBQ0YsQ0FBQztRQUNKLENBQUMsQ0FDRixDQUFDO0lBQ0osQ0FBQztJQUVELGtDQUFPLEdBQVA7UUFDRSxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQ3ZCLEdBQUcsQ0FDRCxVQUFDLEdBQUc7WUFDRixPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDcEIsQ0FBQyxDQUNGLENBQ0YsQ0FBQztJQUNKLENBQUM7SUFFRCxrQ0FBTyxHQUFQO1FBQ0UsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUN4QixHQUFHLENBQ0QsVUFBQyxJQUFJO1lBQ0gsT0FBTyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLENBQUMsQ0FDRixDQUNGLENBQUM7SUFDSixDQUFDO0lBM0ZVLGdCQUFnQjtRQUQ1QixVQUFVLEVBQUU7T0FDQSxnQkFBZ0IsQ0E0RjVCO0lBQUQsdUJBQUM7Q0FBQSxBQTVGRCxJQTRGQztTQTVGWSxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge09ic2VydmFibGUsIFN1YnNjcmliZXJ9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHttYXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7RmlsZURldGFpbHNNb2RlbH0gZnJvbSAnLi4vbW9kZWxzL2ZpbGUtZGV0YWlscy5tb2RlbCc7XG5pbXBvcnQge1NwZWVkRGV0YWlsc01vZGVsfSBmcm9tICcuLi9tb2RlbHMvc3BlZWQtZGV0YWlscy5tb2RlbCc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTcGVlZFRlc3RTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoKSB7XG5cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5Q2FjaGVCdXN0ZXIgPSAocGF0aDpzdHJpbmcpOiBzdHJpbmcgPT4gcGF0aCArICc/bm5uPScgKyBNYXRoLnJhbmRvbSgpO1xuXG4gIGdldEJwcyhmaWxlRGV0YWlscz86RmlsZURldGFpbHNNb2RlbCwgaXRlcmF0aW9ucz86bnVtYmVyKTpPYnNlcnZhYmxlPG51bWJlcnxudWxsPiB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKFxuICAgICAgKG9ic2VydmVyKSA9PiB7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KFxuICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIGxldCBmaWxlUGF0aCA9ICdodHRwczovL25nLXNwZWVkLXRlc3QuanJxdWljay5jb20vYXNzZXRzLzFtYi5qcGcnO1xuICAgICAgICAgICAgbGV0IGZpbGVTaXplID0gMTE5NzI5MjtcbiAgICAgICAgICAgIGxldCBzaG91bGRCdXN0Q2FjaGUgPSB0cnVlO1xuXG4gICAgICAgICAgICAvLyA0MDg5NDkgLy8gNTAwa2JcbiAgICAgICAgICAgIC8vIDExOTcyOTIgLy8gMW1iXG4gICAgICAgICAgICAvLyA0OTUyMjIxIC8vIDVtYlxuICAgICAgICAgICAgLy8gMTM4NDgxNTAgLy8gMTVtYlxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGZpbGVEZXRhaWxzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIGZpbGVEZXRhaWxzLnBhdGggPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignbmctc3BlZWQtdGVzdDogRmlsZSBwYXRoIGlzIG1pc3NpbmcuJyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmlsZVBhdGggPSBmaWxlRGV0YWlscy5wYXRoO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmaWxlRGV0YWlscy5zaG91bGRCdXN0Q2FjaGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgc2hvdWxkQnVzdENhY2hlID0gZmlsZURldGFpbHMuc2hvdWxkQnVzdENhY2hlID09PSB0cnVlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmaWxlRGV0YWlscy5zaXplID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ25nLXNwZWVkLXRlc3Q6IEZpbGUgc2l6ZSBpcyBtaXNzaW5nLicpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpbGVTaXplID0gZmlsZURldGFpbHMuc2l6ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2hvdWxkQnVzdENhY2hlKSB7XG4gICAgICAgICAgICAgIGZpbGVQYXRoID0gdGhpcy5fYXBwbHlDYWNoZUJ1c3RlcihmaWxlUGF0aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgaXRlcmF0aW9ucyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgaXRlcmF0aW9ucyA9IDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHNwZWVkRGV0YWlscyA9IG5ldyBTcGVlZERldGFpbHNNb2RlbChmaWxlU2l6ZSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGRvd25sb2FkID0gbmV3IEltYWdlKCk7XG5cbiAgICAgICAgICAgIGRvd25sb2FkLm9ubG9hZCA9IChhKSA9PiB7XG4gICAgICAgICAgICAgIHNwZWVkRGV0YWlscy5lbmQoKTtcblxuICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHNwZWVkRGV0YWlscy5zcGVlZEJwcyk7XG4gICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBkb3dubG9hZC5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KG51bGwpO1xuICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc3BlZWREZXRhaWxzLnN0YXJ0KCk7XG5cbiAgICAgICAgICAgIGRvd25sb2FkLnNyYyA9IGZpbGVQYXRoO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgMVxuICAgICAgICApO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBnZXRLYnBzKCk6T2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5nZXRCcHMoKS5waXBlKFxuICAgICAgbWFwKFxuICAgICAgICAoYnBzKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGJwcyAvIDEwMjQ7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgZ2V0TWJwcygpOk9ic2VydmFibGU8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0S2JwcygpLnBpcGUoXG4gICAgICBtYXAoXG4gICAgICAgIChrcGJzKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGtwYnMgLyAxMDI0O1xuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcbiAgfVxufVxuIl19