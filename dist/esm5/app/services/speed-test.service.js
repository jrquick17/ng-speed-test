import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
var SpeedTestService = /** @class */ (function () {
    function SpeedTestService() {
    }
    SpeedTestService.prototype.getBps = function () {
        return new Observable(function (observer) {
            window.setTimeout(function () {
                var imageAddr = 'https://ng-speed-test.jrquick.com/assets/internet-speed-image.jpg';
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
    SpeedTestService = tslib_1.__decorate([
        Injectable()
    ], SpeedTestService);
    return SpeedTestService;
}());
export { SpeedTestService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlZWQtdGVzdC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctc3BlZWQtdGVzdC8iLCJzb3VyY2VzIjpbImFwcC9zZXJ2aWNlcy9zcGVlZC10ZXN0LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNoQyxPQUFPLEVBQUMsR0FBRyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFHbkM7SUFDRTtJQUVBLENBQUM7SUFFRCxpQ0FBTSxHQUFOO1FBQ0UsT0FBTyxJQUFJLFVBQVUsQ0FDbkIsVUFBQyxRQUFRO1lBQ1AsTUFBTSxDQUFDLFVBQVUsQ0FDZjtnQkFDRSxJQUFNLFNBQVMsR0FBRyxtRUFBbUUsQ0FBQztnQkFFdEYsSUFBSSxTQUFTLEVBQUUsT0FBTyxDQUFDO2dCQUN2QixJQUFNLFFBQVEsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO2dCQUU3QixRQUFRLENBQUMsTUFBTSxHQUFHLFVBQUMsQ0FBQztvQkFDbEIsT0FBTyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUVqQyxJQUFNLFlBQVksR0FBRyxPQUFPLENBQUM7b0JBRTdCLElBQU0sUUFBUSxHQUFHLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQztvQkFFOUMsSUFBTSxVQUFVLEdBQUcsWUFBWSxHQUFHLENBQUMsQ0FBQztvQkFFcEMsSUFBTSxRQUFRLEdBQUcsVUFBVSxHQUFHLFFBQVEsQ0FBQztvQkFFdkMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDeEIsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN0QixDQUFDLENBQUM7Z0JBRUYsUUFBUSxDQUFDLE9BQU8sR0FBRztvQkFDakIsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNsQixRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3RCLENBQUMsQ0FBQztnQkFFRixTQUFTLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBRW5DLElBQU0sV0FBVyxHQUFHLE9BQU8sR0FBRyxTQUFTLENBQUM7Z0JBQ3hDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsU0FBUyxHQUFHLFdBQVcsQ0FBQztZQUN6QyxDQUFDLEVBQ0QsQ0FBQyxDQUNGLENBQUM7UUFDSixDQUFDLENBQ0YsQ0FBQztJQUNKLENBQUM7SUFFRCxrQ0FBTyxHQUFQO1FBQ0UsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUN2QixHQUFHLENBQ0QsVUFBQyxHQUFHO1lBQ0YsT0FBTyxHQUFHLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLENBQUMsQ0FDRixDQUNGLENBQUM7SUFDSixDQUFDO0lBRUQsa0NBQU8sR0FBUDtRQUNFLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FDeEIsR0FBRyxDQUNELFVBQUMsSUFBSTtZQUNILE9BQU8sSUFBSSxHQUFHLElBQUksQ0FBQztRQUNyQixDQUFDLENBQ0YsQ0FDRixDQUFDO0lBQ0osQ0FBQztJQWhFVSxnQkFBZ0I7UUFENUIsVUFBVSxFQUFFO09BQ0EsZ0JBQWdCLENBaUU1QjtJQUFELHVCQUFDO0NBQUEsQUFqRUQsSUFpRUM7U0FqRVksZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcbmltcG9ydCB7bWFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTcGVlZFRlc3RTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoKSB7XG5cbiAgfVxuXG4gIGdldEJwcygpOk9ic2VydmFibGU8bnVtYmVyPiB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKFxuICAgICAgKG9ic2VydmVyKSA9PiB7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KFxuICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlQWRkciA9ICdodHRwczovL25nLXNwZWVkLXRlc3QuanJxdWljay5jb20vYXNzZXRzL2ludGVybmV0LXNwZWVkLWltYWdlLmpwZyc7XG5cbiAgICAgICAgICAgIGxldCBzdGFydFRpbWUsIGVuZFRpbWU7XG4gICAgICAgICAgICBjb25zdCBkb3dubG9hZCA9IG5ldyBJbWFnZSgpO1xuXG4gICAgICAgICAgICBkb3dubG9hZC5vbmxvYWQgPSAoYSkgPT4ge1xuICAgICAgICAgICAgICBlbmRUaW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcblxuICAgICAgICAgICAgICBjb25zdCBkb3dubG9hZFNpemUgPSA0OTk1Mzc0O1xuXG4gICAgICAgICAgICAgIGNvbnN0IGR1cmF0aW9uID0gKGVuZFRpbWUgLSBzdGFydFRpbWUpIC8gMTAwMDtcblxuICAgICAgICAgICAgICBjb25zdCBiaXRzTG9hZGVkID0gZG93bmxvYWRTaXplICogODtcblxuICAgICAgICAgICAgICBjb25zdCBzcGVlZEJwcyA9IGJpdHNMb2FkZWQgLyBkdXJhdGlvbjtcblxuICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHNwZWVkQnBzKTtcbiAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGRvd25sb2FkLm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoLTEpO1xuICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc3RhcnRUaW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcblxuICAgICAgICAgICAgY29uc3QgY2FjaGVCdXN0ZXIgPSAnP25ubj0nICsgc3RhcnRUaW1lO1xuICAgICAgICAgICAgZG93bmxvYWQuc3JjID0gaW1hZ2VBZGRyICsgY2FjaGVCdXN0ZXI7XG4gICAgICAgICAgfSxcbiAgICAgICAgICAxXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIGdldEticHMoKTpPYnNlcnZhYmxlPG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmdldEJwcygpLnBpcGUoXG4gICAgICBtYXAoXG4gICAgICAgIChicHMpID0+IHtcbiAgICAgICAgICByZXR1cm4gYnBzIC8gMTAyNDtcbiAgICAgICAgfVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBnZXRNYnBzKCk6T2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5nZXRLYnBzKCkucGlwZShcbiAgICAgIG1hcChcbiAgICAgICAgKGtwYnMpID0+IHtcbiAgICAgICAgICByZXR1cm4ga3BicyAvIDEwMjQ7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuICB9XG59XG4iXX0=