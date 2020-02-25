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
    SpeedTestService = tslib_1.__decorate([
        Injectable()
    ], SpeedTestService);
    return SpeedTestService;
}());
export { SpeedTestService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlZWQtdGVzdC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctc3BlZWQtdGVzdC8iLCJzb3VyY2VzIjpbImFwcC9zZXJ2aWNlcy9zcGVlZC10ZXN0LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDcEMsT0FBTyxFQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1QyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUdoRTtJQUNFO1FBSVEsc0JBQWlCLEdBQUcsVUFBQyxJQUFXLElBQWEsT0FBQSxJQUFJLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBOUIsQ0FBOEIsQ0FBQztJQUZwRixDQUFDO0lBSU8sb0NBQVMsR0FBakIsVUFBa0IsVUFBa0IsRUFBRSxXQUE2QixFQUFFLFVBQStCO1FBQXBHLGlCQThEQztRQTdEQyxPQUFPLElBQUksVUFBVSxDQUNuQixVQUFDLFFBQVE7WUFDUCxJQUFNLGVBQWUsR0FBRyxJQUFJLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVoRSxJQUFNLFFBQVEsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1lBRTdCLFFBQVEsQ0FBQyxNQUFNLEdBQUc7Z0JBQ2hCLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFFdEIsUUFBUSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDL0IsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3RCLENBQUMsQ0FBQztZQUVGLFFBQVEsQ0FBQyxPQUFPLEdBQUc7Z0JBQ2pCLFFBQVEsQ0FBQyxJQUFJ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Q0FBQyxFQUNELENBQUMsQ0FDRixDQUFDO1FBQ0osQ0FBQyxDQUNGLENBQUM7SUFDSixDQUFDO0lBRUQsa0NBQU8sR0FBUCxVQUFRLFVBQWtCLEVBQUUsV0FBNkI7UUFDdkQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQzlDLEdBQUcsQ0FDRCxVQUFDLEdBQUc7WUFDRixPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDcEIsQ0FBQyxDQUNGLENBQ0YsQ0FBQztJQUNKLENBQUM7SUFFRCxrQ0FBTyxHQUFQLFVBQVEsVUFBa0IsRUFBRSxXQUE2QjtRQUN2RCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FDL0MsR0FBRyxDQUNELFVBQUMsSUFBSTtZQUNILE9BQU8sSUFBSSxHQUFHLElBQUksQ0FBQztRQUNyQixDQUFDLENBQ0YsQ0FDRixDQUFDO0lBQ0osQ0FBQztJQWpJVSxnQkFBZ0I7UUFENUIsVUFBVSxFQUFFO09BQ0EsZ0JBQWdCLENBa0k1QjtJQUFELHVCQUFDO0NBQUEsQUFsSUQsSUFrSUM7U0FsSVksZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtPYnNlcnZhYmxlLCBvZn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2ZsYXRNYXAsIG1hcH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtGaWxlRGV0YWlsc01vZGVsfSBmcm9tICcuLi9tb2RlbHMvZmlsZS1kZXRhaWxzLm1vZGVsJztcbmltcG9ydCB7U3BlZWREZXRhaWxzTW9kZWx9IGZyb20gJy4uL21vZGVscy9zcGVlZC1kZXRhaWxzLm1vZGVsJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFNwZWVkVGVzdFNlcnZpY2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcblxuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlDYWNoZUJ1c3RlciA9IChwYXRoOnN0cmluZyk6IHN0cmluZyA9PiBwYXRoICsgJz9ubm49JyArIE1hdGgucmFuZG9tKCk7XG5cbiAgcHJpdmF0ZSBfZG93bmxvYWQoaXRlcmF0aW9ucz86bnVtYmVyLCBmaWxlRGV0YWlscz86RmlsZURldGFpbHNNb2RlbCwgYWxsRGV0YWlscz86U3BlZWREZXRhaWxzTW9kZWxbXSk6T2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGU8U3BlZWREZXRhaWxzTW9kZWw+KFxuICAgICAgKG9ic2VydmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1NwZWVkRGV0YWlscyA9IG5ldyBTcGVlZERldGFpbHNNb2RlbChmaWxlRGV0YWlscy5zaXplKTtcblxuICAgICAgICBjb25zdCBkb3dubG9hZCA9IG5ldyBJbWFnZSgpO1xuXG4gICAgICAgIGRvd25sb2FkLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICBuZXdTcGVlZERldGFpbHMuZW5kKCk7XG5cbiAgICAgICAgICBvYnNlcnZlci5uZXh0KG5ld1NwZWVkRGV0YWlscyk7XG4gICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBkb3dubG9hZC5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgIG9ic2VydmVyLm5leHQobnVsbCk7XG4gICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgZmlsZVBhdGggPSBmaWxlRGV0YWlscy5wYXRoO1xuICAgICAgICBpZiAoZmlsZURldGFpbHMuc2hvdWxkQnVzdENhY2hlKSB7XG4gICAgICAgICAgZmlsZVBhdGggPSB0aGlzLl9hcHBseUNhY2hlQnVzdGVyKGZpbGVQYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5ld1NwZWVkRGV0YWlscy5zdGFydCgpO1xuXG4gICAgICAgIGRvd25sb2FkLnNyYyA9IGZpbGVQYXRoO1xuICAgICAgfVxuICAgICkucGlwZShcbiAgICAgIGZsYXRNYXAoXG4gICAgICAgIChuZXdTcGVlZERldGFpbHM6U3BlZWREZXRhaWxzTW9kZWx8bnVsbCkgPT4ge1xuICAgICAgICAgIGlmIChuZXdTcGVlZERldGFpbHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ25nLXNwZWVkLXRlc3Q6IEVycm9yIGRvd25sb2FkaW5nIGZpbGUuJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYWxsRGV0YWlscyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgYWxsRGV0YWlscyA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhbGxEZXRhaWxzLnB1c2gobmV3U3BlZWREZXRhaWxzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodHlwZW9mIGl0ZXJhdGlvbnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBpdGVyYXRpb25zID0gMztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaXRlcmF0aW9ucyA9PT0gMSkge1xuICAgICAgICAgICAgY29uc3QgY291bnQgPSBhbGxEZXRhaWxzLmxlbmd0aDtcbiAgICAgICAgICAgIGxldCB0b3RhbCA9IDA7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgICB0b3RhbCArPSBhbGxEZXRhaWxzW2ldLnNwZWVkQnBzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBzcGVlZEJwcyA9IHRvdGFsIC8gY291bnQ7XG5cbiAgICAgICAgICAgIHJldHVybiBvZihzcGVlZEJwcyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kb3dubG9hZCgtLWl0ZXJhdGlvbnMsIGZpbGVEZXRhaWxzLCBhbGxEZXRhaWxzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgZ2V0QnBzKGl0ZXJhdGlvbnM/Om51bWJlciwgZmlsZURldGFpbHM/OkZpbGVEZXRhaWxzTW9kZWwpOk9ic2VydmFibGU8bnVtYmVyfG51bGw+IHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoXG4gICAgICAob2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoXG4gICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBmaWxlRGV0YWlscyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgZmlsZURldGFpbHMgPSBuZXcgRmlsZURldGFpbHNNb2RlbCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmaWxlRGV0YWlscy5wYXRoID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ25nLXNwZWVkLXRlc3Q6IEZpbGUgcGF0aCBpcyBtaXNzaW5nLicpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAodHlwZW9mIGZpbGVEZXRhaWxzLnNpemUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignbmctc3BlZWQtdGVzdDogRmlsZSBzaXplIGlzIG1pc3NpbmcuJyk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgZmlsZURldGFpbHMuc2hvdWxkQnVzdENhY2hlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGZpbGVEZXRhaWxzLnNob3VsZEJ1c3RDYWNoZSA9IHRydWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmlsZURldGFpbHMuc2hvdWxkQnVzdENhY2hlID0gZmlsZURldGFpbHMuc2hvdWxkQnVzdENhY2hlID09PSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2Rvd25sb2FkKGl0ZXJhdGlvbnMsIGZpbGVEZXRhaWxzKS5zdWJzY3JpYmUoXG4gICAgICAgICAgICAgIChzcGVlZEJwcykgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoc3BlZWRCcHMpO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICAxXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIGdldEticHMoaXRlcmF0aW9ucz86bnVtYmVyLCBmaWxlRGV0YWlscz86RmlsZURldGFpbHNNb2RlbCk6T2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5nZXRCcHMoaXRlcmF0aW9ucywgZmlsZURldGFpbHMpLnBpcGUoXG4gICAgICBtYXAoXG4gICAgICAgIChicHMpID0+IHtcbiAgICAgICAgICByZXR1cm4gYnBzIC8gMTAyNDtcbiAgICAgICAgfVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBnZXRNYnBzKGl0ZXJhdGlvbnM/Om51bWJlciwgZmlsZURldGFpbHM/OkZpbGVEZXRhaWxzTW9kZWwpOk9ic2VydmFibGU8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0S2JwcyhpdGVyYXRpb25zLCBmaWxlRGV0YWlscykucGlwZShcbiAgICAgIG1hcChcbiAgICAgICAgKGtwYnMpID0+IHtcbiAgICAgICAgICByZXR1cm4ga3BicyAvIDEwMjQ7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuICB9XG59XG4iXX0=