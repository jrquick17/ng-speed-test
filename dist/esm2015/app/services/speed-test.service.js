import { Injectable } from '@angular/core';
import { fromEvent, merge, Observable, of } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { SpeedTestFileModel } from '../models/speed-test-file.model';
import { SpeedTestResultsModel } from '../models/speed-test-results.model';
import { deepCopy } from '@angular-devkit/core';
export class SpeedTestService {
    constructor() {
        this._applyCacheBuster = (path) => path + '?nnn=' + Math.random();
    }
    _download(settings, allDetails) {
        return new Observable((observer) => {
            const newSpeedDetails = new SpeedTestResultsModel(settings.file.size);
            const download = new Image();
            download.onload = () => {
                newSpeedDetails.end();
                observer.next(newSpeedDetails);
                observer.complete();
            };
            download.onerror = () => {
                newSpeedDetails.error();
                observer.next(newSpeedDetails);
                observer.complete();
            };
            let filePath = settings.file.path;
            if (settings.file.shouldBustCache) {
                filePath = this._applyCacheBuster(filePath);
            }
            newSpeedDetails.start();
            download.src = filePath;
        }).pipe(mergeMap((newSpeedDetails) => {
            if (typeof allDetails === 'undefined') {
                allDetails = [];
            }
            allDetails.push(newSpeedDetails);
            if (settings.iterations === 1) {
                const count = allDetails.length;
                let total = 0;
                for (let i = 0; i < count; i++) {
                    total += allDetails[i].speedBps;
                }
                const speedBps = total / count;
                return of(speedBps);
            }
            else {
                settings.iterations--;
                return this._download(settings, allDetails);
            }
        }));
    }
    getBps(settings) {
        return new Observable((observer) => {
            window.setTimeout(() => {
                if (typeof settings.iterations === 'undefined') {
                    settings.iterations = 3;
                }
                if (typeof settings.file === 'undefined') {
                    settings.file = new SpeedTestFileModel();
                }
                else {
                    if (typeof settings.file.path === 'undefined') {
                        console.error('ng-speed-test: File path is missing.');
                        return null;
                    }
                    if (typeof settings.file.size === 'undefined') {
                        console.error('ng-speed-test: File size is missing.');
                        return null;
                    }
                    if (typeof settings.file.shouldBustCache === 'undefined') {
                        settings.file.shouldBustCache = true;
                    }
                    else {
                        settings.file.shouldBustCache = settings.file.shouldBustCache === true;
                    }
                }
                this._download(deepCopy(settings)).subscribe((speedBps) => {
                    observer.next(speedBps);
                    observer.complete();
                });
            }, 1);
        });
    }
    getKbps(settings) {
        return this.getBps(settings).pipe(map((bps) => {
            return bps / 1024;
        }));
    }
    getMbps(settings) {
        return this.getKbps(settings).pipe(map((kpbs) => {
            return kpbs / 1024;
        }));
    }
    isOnline() {
        return merge(fromEvent(window, 'offline').pipe(map(() => false)), fromEvent(window, 'online').pipe(map(() => true)), new Observable((sub) => {
            sub.next(navigator.onLine);
            sub.complete();
        }));
    }
}
SpeedTestService.decorators = [
    { type: Injectable }
];
SpeedTestService.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlZWQtdGVzdC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9qcnF1aWNrL2RldmVsb3BtZW50L2VuY291bnRpbmcvbmctc3BlZWQtdGVzdC9zcmMvIiwic291cmNlcyI6WyJhcHAvc2VydmljZXMvc3BlZWQtdGVzdC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFZLEVBQUUsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNoRSxPQUFPLEVBQUMsUUFBUSxFQUFFLEdBQUcsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRTdDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ25FLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLG9DQUFvQyxDQUFDO0FBRXpFLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUc5QyxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCO1FBSVEsc0JBQWlCLEdBQUcsQ0FBQyxJQUFXLEVBQVUsRUFBRSxDQUFDLElBQUksR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBRnBGLENBQUM7SUFJTyxTQUFTLENBQUMsUUFBK0IsRUFBRSxVQUFtQztRQUNwRixPQUFPLElBQUksVUFBVSxDQUNuQixDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ1gsTUFBTSxlQUFlLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXRFLE1BQU0sUUFBUSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFFN0IsUUFBUSxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7Z0JBQ3JCLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFFdEIsUUFBUSxDQUFDLElBQUksQ0FBQyxl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UyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNCLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqQixDQUFDLENBQ0YsQ0FDRixDQUFDO0lBQ0osQ0FBQzs7O1lBdkpGLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge2Zyb21FdmVudCwgbWVyZ2UsIE9ic2VydmFibGUsIE9ic2VydmVyLCBvZn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge21lcmdlTWFwLCBtYXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtTcGVlZFRlc3RGaWxlTW9kZWx9IGZyb20gJy4uL21vZGVscy9zcGVlZC10ZXN0LWZpbGUubW9kZWwnO1xuaW1wb3J0IHtTcGVlZFRlc3RSZXN1bHRzTW9kZWx9IGZyb20gJy4uL21vZGVscy9zcGVlZC10ZXN0LXJlc3VsdHMubW9kZWwnO1xuaW1wb3J0IHtTcGVlZFRlc3RTZXR0aW5nc01vZGVsfSBmcm9tICcuLi9tb2RlbHMvc3BlZWQtdGVzdC1zZXR0aW5ncy5tb2RlbCc7XG5pbXBvcnQge2RlZXBDb3B5fSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTcGVlZFRlc3RTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoKSB7XG5cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5Q2FjaGVCdXN0ZXIgPSAocGF0aDpzdHJpbmcpOiBzdHJpbmcgPT4gcGF0aCArICc/bm5uPScgKyBNYXRoLnJhbmRvbSgpO1xuXG4gIHByaXZhdGUgX2Rvd25sb2FkKHNldHRpbmdzOlNwZWVkVGVzdFNldHRpbmdzTW9kZWwsIGFsbERldGFpbHM/OlNwZWVkVGVzdFJlc3VsdHNNb2RlbFtdKTpPYnNlcnZhYmxlPG51bWJlcj4ge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZTxTcGVlZFRlc3RSZXN1bHRzTW9kZWw+KFxuICAgICAgKG9ic2VydmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1NwZWVkRGV0YWlscyA9IG5ldyBTcGVlZFRlc3RSZXN1bHRzTW9kZWwoc2V0dGluZ3MuZmlsZS5zaXplKTtcblxuICAgICAgICBjb25zdCBkb3dubG9hZCA9IG5ldyBJbWFnZSgpO1xuXG4gICAgICAgIGRvd25sb2FkLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICBuZXdTcGVlZERldGFpbHMuZW5kKCk7XG5cbiAgICAgICAgICBvYnNlcnZlci5uZXh0KG5ld1NwZWVkRGV0YWlscyk7XG4gICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBkb3dubG9hZC5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgIG5ld1NwZWVkRGV0YWlscy5lcnJvcigpO1xuXG4gICAgICAgICAgb2JzZXJ2ZXIubmV4dChuZXdTcGVlZERldGFpbHMpO1xuICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGZpbGVQYXRoID0gc2V0dGluZ3MuZmlsZS5wYXRoO1xuICAgICAgICBpZiAoc2V0dGluZ3MuZmlsZS5zaG91bGRCdXN0Q2FjaGUpIHtcbiAgICAgICAgICBmaWxlUGF0aCA9IHRoaXMuX2FwcGx5Q2FjaGVCdXN0ZXIoZmlsZVBhdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV3U3BlZWREZXRhaWxzLnN0YXJ0KCk7XG5cbiAgICAgICAgZG93bmxvYWQuc3JjID0gZmlsZVBhdGg7XG4gICAgICB9XG4gICAgKS5waXBlKFxuICAgICAgbWVyZ2VNYXAoXG4gICAgICAgIChuZXdTcGVlZERldGFpbHM6U3BlZWRUZXN0UmVzdWx0c01vZGVsfG51bGwpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIGFsbERldGFpbHMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBhbGxEZXRhaWxzID0gW107XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYWxsRGV0YWlscy5wdXNoKG5ld1NwZWVkRGV0YWlscyk7XG5cbiAgICAgICAgICBpZiAoc2V0dGluZ3MuaXRlcmF0aW9ucyA9PT0gMSkge1xuICAgICAgICAgICAgY29uc3QgY291bnQgPSBhbGxEZXRhaWxzLmxlbmd0aDtcbiAgICAgICAgICAgIGxldCB0b3RhbCA9IDA7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgICB0b3RhbCArPSBhbGxEZXRhaWxzW2ldLnNwZWVkQnBzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBzcGVlZEJwcyA9IHRvdGFsIC8gY291bnQ7XG5cbiAgICAgICAgICAgIHJldHVybiBvZihzcGVlZEJwcyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldHRpbmdzLml0ZXJhdGlvbnMtLTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Rvd25sb2FkKHNldHRpbmdzLCBhbGxEZXRhaWxzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgZ2V0QnBzKHNldHRpbmdzOlNwZWVkVGVzdFNldHRpbmdzTW9kZWwpOk9ic2VydmFibGU8bnVtYmVyfG51bGw+IHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoXG4gICAgICAob2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoXG4gICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZXR0aW5ncy5pdGVyYXRpb25zID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICBzZXR0aW5ncy5pdGVyYXRpb25zID0gMztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZXR0aW5ncy5maWxlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICBzZXR0aW5ncy5maWxlID0gbmV3IFNwZWVkVGVzdEZpbGVNb2RlbCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzZXR0aW5ncy5maWxlLnBhdGggPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignbmctc3BlZWQtdGVzdDogRmlsZSBwYXRoIGlzIG1pc3NpbmcuJyk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3MuZmlsZS5zaXplID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ25nLXNwZWVkLXRlc3Q6IEZpbGUgc2l6ZSBpcyBtaXNzaW5nLicpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAodHlwZW9mIHNldHRpbmdzLmZpbGUuc2hvdWxkQnVzdENhY2hlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHNldHRpbmdzLmZpbGUuc2hvdWxkQnVzdENhY2hlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5maWxlLnNob3VsZEJ1c3RDYWNoZSA9IHNldHRpbmdzLmZpbGUuc2hvdWxkQnVzdENhY2hlID09PSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2Rvd25sb2FkKGRlZXBDb3B5KHNldHRpbmdzKSkuc3Vic2NyaWJlKFxuICAgICAgICAgICAgICAoc3BlZWRCcHMpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHNwZWVkQnBzKTtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgMVxuICAgICAgICApO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBnZXRLYnBzKHNldHRpbmdzOlNwZWVkVGVzdFNldHRpbmdzTW9kZWwpOk9ic2VydmFibGU8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QnBzKHNldHRpbmdzKS5waXBlKFxuICAgICAgbWFwKFxuICAgICAgICAoYnBzKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGJwcyAvIDEwMjQ7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgZ2V0TWJwcyhzZXR0aW5nczpTcGVlZFRlc3RTZXR0aW5nc01vZGVsKTpPYnNlcnZhYmxlPG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmdldEticHMoc2V0dGluZ3MpLnBpcGUoXG4gICAgICBtYXAoXG4gICAgICAgIChrcGJzKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGtwYnMgLyAxMDI0O1xuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIGlzT25saW5lKCk6T2JzZXJ2YWJsZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG1lcmdlPGJvb2xlYW4+KFxuICAgICAgZnJvbUV2ZW50KHdpbmRvdywgJ29mZmxpbmUnKS5waXBlKFxuICAgICAgICBtYXAoXG4gICAgICAgICAgKCkgPT4gZmFsc2VcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIGZyb21FdmVudCh3aW5kb3csICdvbmxpbmUnKS5waXBlKFxuICAgICAgICBtYXAoXG4gICAgICAgICAgKCkgPT4gdHJ1ZVxuICAgICAgICApXG4gICAgICApLFxuICAgICAgbmV3IE9ic2VydmFibGUoXG4gICAgICAgIChzdWI6T2JzZXJ2ZXI8Ym9vbGVhbj4pID0+IHtcbiAgICAgICAgICBzdWIubmV4dChuYXZpZ2F0b3Iub25MaW5lKTtcbiAgICAgICAgICBzdWIuY29tcGxldGUoKTtcbiAgICAgICAgfVxuICAgICAgKVxuICAgICk7XG4gIH1cbn1cbiJdfQ==