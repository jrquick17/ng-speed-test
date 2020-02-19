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
    SpeedTestService = tslib_1.__decorate([
        Injectable()
    ], SpeedTestService);
    return SpeedTestService;
}());
export { SpeedTestService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlZWQtdGVzdC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctc3BlZWQtdGVzdC8iLCJzb3VyY2VzIjpbImFwcC9zZXJ2aWNlcy9zcGVlZC10ZXN0LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNoQyxPQUFPLEVBQUMsR0FBRyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFHbkM7SUFDRTtJQUVBLENBQUM7SUFFRCxpQ0FBTSxHQUFOO1FBQ0UsT0FBTyxJQUFJLFVBQVUsQ0FDbkIsVUFBQyxRQUFRO1lBQ1AsTUFBTSxDQUFDLFVBQVUsQ0FDZjtnQkFDRSx5RkFBeUY7Z0JBQ3pGLElBQU0sU0FBUyxHQUFHLHFEQUFxRCxDQUFDO2dCQUV4RSxJQUFJLFNBQVMsRUFBRSxPQUFPLENBQUM7Z0JBQ3ZCLElBQU0sUUFBUSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBRTdCLFFBQVEsQ0FBQyxNQUFNLEdBQUcsVUFBQyxDQUFDO29CQUNsQixPQUFPLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBRWpDLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQztvQkFFN0IsSUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDO29CQUU5QyxJQUFNLFVBQVUsR0FBRyxZQUFZLEdBQUcsQ0FBQyxDQUFDO29CQUVwQyxJQUFNLFFBQVEsR0FBRyxVQUFVLEdBQUcsUUFBUSxDQUFDO29CQUV2QyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUN4QixRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3RCLENBQUMsQ0FBQztnQkFFRixRQUFRLENBQUMsT0FBTyxHQUFHO29CQUNqQixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2xCLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDdEIsQ0FBQyxDQUFDO2dCQUVGLFNBQVMsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFFbkMsSUFBTSxXQUFXLEdBQUcsT0FBTyxHQUFHLFNBQVMsQ0FBQztnQkFDeEMsUUFBUSxDQUFDLEdBQUcsR0FBRyxTQUFTLEdBQUcsV0FBVyxDQUFDO1lBQ3pDLENBQUMsRUFDRCxDQUFDLENBQ0YsQ0FBQztRQUNKLENBQUMsQ0FDRixDQUFDO0lBQ0osQ0FBQztJQUVELGtDQUFPLEdBQVA7UUFDRSxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQ3ZCLEdBQUcsQ0FDRCxVQUFDLEdBQUc7WUFDRixPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDcEIsQ0FBQyxDQUNGLENBQ0YsQ0FBQztJQUNKLENBQUM7SUFFRCxrQ0FBTyxHQUFQO1FBQ0UsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUN4QixHQUFHLENBQ0QsVUFBQyxJQUFJO1lBQ0gsT0FBTyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLENBQUMsQ0FDRixDQUNGLENBQUM7SUFDSixDQUFDO0lBakVVLGdCQUFnQjtRQUQ1QixVQUFVLEVBQUU7T0FDQSxnQkFBZ0IsQ0FrRTVCO0lBQUQsdUJBQUM7Q0FBQSxBQWxFRCxJQWtFQztTQWxFWSxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHttYXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFNwZWVkVGVzdFNlcnZpY2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcblxuICB9XG5cbiAgZ2V0QnBzKCk6T2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoXG4gICAgICAob2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoXG4gICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgLy8gY29uc3QgaW1hZ2VBZGRyID0gJ2h0dHBzOi8vbmctc3BlZWQtdGVzdC5qcnF1aWNrLmNvbS9hc3NldHMvaW50ZXJuZXQtc3BlZWQtaW1hZ2UuanBnJztcbiAgICAgICAgICAgIGNvbnN0IGltYWdlQWRkciA9ICdodHRwczovL3dlYmFwcC51aWMtY2hwLm9yZy9pbnRlcm5ldC1zcGVlZC1pbWFnZS5qcGcnO1xuXG4gICAgICAgICAgICBsZXQgc3RhcnRUaW1lLCBlbmRUaW1lO1xuICAgICAgICAgICAgY29uc3QgZG93bmxvYWQgPSBuZXcgSW1hZ2UoKTtcblxuICAgICAgICAgICAgZG93bmxvYWQub25sb2FkID0gKGEpID0+IHtcbiAgICAgICAgICAgICAgZW5kVGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgICAgICAgY29uc3QgZG93bmxvYWRTaXplID0gNDk5NTM3NDtcblxuICAgICAgICAgICAgICBjb25zdCBkdXJhdGlvbiA9IChlbmRUaW1lIC0gc3RhcnRUaW1lKSAvIDEwMDA7XG5cbiAgICAgICAgICAgICAgY29uc3QgYml0c0xvYWRlZCA9IGRvd25sb2FkU2l6ZSAqIDg7XG5cbiAgICAgICAgICAgICAgY29uc3Qgc3BlZWRCcHMgPSBiaXRzTG9hZGVkIC8gZHVyYXRpb247XG5cbiAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChzcGVlZEJwcyk7XG4gICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBkb3dubG9hZC5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KC0xKTtcbiAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNhY2hlQnVzdGVyID0gJz9ubm49JyArIHN0YXJ0VGltZTtcbiAgICAgICAgICAgIGRvd25sb2FkLnNyYyA9IGltYWdlQWRkciArIGNhY2hlQnVzdGVyO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgMVxuICAgICAgICApO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBnZXRLYnBzKCk6T2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5nZXRCcHMoKS5waXBlKFxuICAgICAgbWFwKFxuICAgICAgICAoYnBzKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGJwcyAvIDEwMjQ7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgZ2V0TWJwcygpOk9ic2VydmFibGU8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0S2JwcygpLnBpcGUoXG4gICAgICBtYXAoXG4gICAgICAgIChrcGJzKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGtwYnMgLyAxMDI0O1xuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcbiAgfVxufVxuIl19