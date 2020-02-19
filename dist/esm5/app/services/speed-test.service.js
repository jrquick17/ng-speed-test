import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
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
    SpeedTestService = tslib_1.__decorate([
        Injectable()
    ], SpeedTestService);
    return SpeedTestService;
}());
export { SpeedTestService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlZWQtdGVzdC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctc3BlZWQtdGVzdC8iLCJzb3VyY2VzIjpbImFwcC9zZXJ2aWNlcy9zcGVlZC10ZXN0LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUdoQztJQUNFO0lBRUEsQ0FBQztJQUVELG1DQUFRLEdBQVI7UUFDRSxPQUFPLElBQUksVUFBVSxDQUNuQixVQUFDLFFBQVE7WUFDUCxNQUFNLENBQUMsVUFBVSxDQUNmO2dCQUNFLElBQU0sU0FBUyxHQUFHLHFEQUFxRCxDQUFDO2dCQUV4RSxJQUFJLFNBQVMsRUFBRSxPQUFPLENBQUM7Z0JBQ3ZCLElBQU0sUUFBUSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBRTdCLFFBQVEsQ0FBQyxNQUFNLEdBQUc7b0JBQ2hCLE9BQU8sR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFFakMsSUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDO29CQUU3QixJQUFNLFFBQVEsR0FBRyxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUM7b0JBRTlDLElBQU0sVUFBVSxHQUFHLFlBQVksR0FBRyxDQUFDLENBQUM7b0JBRXBDLElBQU0sUUFBUSxHQUFPLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEQsSUFBTSxTQUFTLEdBQU8sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUVuRCxJQUFNLFNBQVMsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRWhELFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ3pCLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDdEIsQ0FBQyxDQUFDO2dCQUVGLFFBQVEsQ0FBQyxPQUFPLEdBQUc7b0JBQ2pCLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3JCLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDdEIsQ0FBQyxDQUFDO2dCQUVGLFNBQVMsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFFbkMsSUFBTSxXQUFXLEdBQUcsT0FBTyxHQUFHLFNBQVMsQ0FBQztnQkFDeEMsUUFBUSxDQUFDLEdBQUcsR0FBRyxTQUFTLEdBQUcsV0FBVyxDQUFDO1lBQ3pDLENBQUMsRUFDRCxDQUFDLENBQ0YsQ0FBQztRQUNKLENBQUMsQ0FDRixDQUFDO0lBQ0osQ0FBQztJQS9DVSxnQkFBZ0I7UUFENUIsVUFBVSxFQUFFO09BQ0EsZ0JBQWdCLENBZ0Q1QjtJQUFELHVCQUFDO0NBQUEsQUFoREQsSUFnREM7U0FoRFksZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFNwZWVkVGVzdFNlcnZpY2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcblxuICB9XG5cbiAgZ2V0U3BlZWQoKTpPYnNlcnZhYmxlPHN0cmluZ3xib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKFxuICAgICAgKG9ic2VydmVyKSA9PiB7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KFxuICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlQWRkciA9ICdodHRwczovL3dlYmFwcC51aWMtY2hwLm9yZy9pbnRlcm5ldC1zcGVlZC1pbWFnZS5qcGcnO1xuXG4gICAgICAgICAgICBsZXQgc3RhcnRUaW1lLCBlbmRUaW1lO1xuICAgICAgICAgICAgY29uc3QgZG93bmxvYWQgPSBuZXcgSW1hZ2UoKTtcblxuICAgICAgICAgICAgZG93bmxvYWQub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICBlbmRUaW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcblxuICAgICAgICAgICAgICBjb25zdCBkb3dubG9hZFNpemUgPSA0OTk1Mzc0O1xuXG4gICAgICAgICAgICAgIGNvbnN0IGR1cmF0aW9uID0gKGVuZFRpbWUgLSBzdGFydFRpbWUpIC8gMTAwMDtcblxuICAgICAgICAgICAgICBjb25zdCBiaXRzTG9hZGVkID0gZG93bmxvYWRTaXplICogODtcblxuICAgICAgICAgICAgICBjb25zdCBzcGVlZEJwczphbnkgPSAoYml0c0xvYWRlZCAvIGR1cmF0aW9uKS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgICBjb25zdCBzcGVlZEticHM6YW55ID0gKHNwZWVkQnBzIC8gMTAyNCkudG9GaXhlZCgyKTtcblxuICAgICAgICAgICAgICBjb25zdCBzcGVlZE1icHMgPSAoc3BlZWRLYnBzIC8gMTAyNCkudG9GaXhlZCgyKTtcblxuICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHNwZWVkTWJwcyk7XG4gICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBkb3dubG9hZC5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGZhbHNlKTtcbiAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNhY2hlQnVzdGVyID0gJz9ubm49JyArIHN0YXJ0VGltZTtcbiAgICAgICAgICAgIGRvd25sb2FkLnNyYyA9IGltYWdlQWRkciArIGNhY2hlQnVzdGVyO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgMVxuICAgICAgICApO1xuICAgICAgfVxuICAgICk7XG4gIH1cbn1cbiJdfQ==