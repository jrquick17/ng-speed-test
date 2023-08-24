import { Injectable } from '@angular/core';
import { fromEvent, merge, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { SpeedTestFileModel } from '../models/speed-test-file.model';
import { SpeedTestResultsModel } from '../models/speed-test-results.model';
import { SpeedTestSettingsModel } from '../models/speed-test-settings.model';
import * as i0 from "@angular/core";
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
                let delay = 0;
                if (settings.iterations !== 1) {
                    delay = settings.retryDelay;
                }
                window.setTimeout(() => {
                    observer.next(newSpeedDetails);
                    observer.complete();
                }, delay);
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
                const defaultSettings = new SpeedTestSettingsModel();
                if (typeof settings === 'undefined') {
                    settings = { ...defaultSettings };
                }
                else {
                    if (typeof settings.iterations === 'undefined') {
                        settings.iterations = defaultSettings.iterations;
                    }
                    if (typeof settings.file === 'undefined') {
                        settings.file = defaultSettings.file;
                    }
                    else {
                        const defaultFileSettings = new SpeedTestFileModel();
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
                this._download({ ...settings }).subscribe((speedBps) => {
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
SpeedTestService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.12", ngImport: i0, type: SpeedTestService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
SpeedTestService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.3.12", ngImport: i0, type: SpeedTestService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.12", ngImport: i0, type: SpeedTestService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlZWQtdGVzdC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlcy9zcGVlZC10ZXN0LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV6QyxPQUFPLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQVksRUFBRSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2hFLE9BQU8sRUFBQyxHQUFHLEVBQUUsUUFBUSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFN0MsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0saUNBQWlDLENBQUM7QUFDbkUsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sb0NBQW9DLENBQUM7QUFDekUsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0scUNBQXFDLENBQUM7O0FBRzNFLE1BQU0sT0FBTyxnQkFBZ0I7SUFDM0I7UUFJUSxzQkFBaUIsR0FBRyxDQUFDLElBQVcsRUFBVSxFQUFFLENBQUMsSUFBSSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFGcEYsQ0FBQztJQUlPLFNBQVMsQ0FBQyxRQUErQixFQUFFLFVBQW1DO1FBQ3BGLE9BQU8sSUFBSSxVQUFVLENBQ25CLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDWCxNQUFNLGVBQWUsR0FBRyxJQUFJLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUU3QixRQUFRLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTtnQkFDckIsZUFBZSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUV0QixRQUFRLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUMvQixRQUFRLENBQUMsUUFBUSxF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LENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDUCxPQUFPLElBQUksR0FBRyxJQUFJLENBQUM7UUFDckIsQ0FBQyxDQUNGLENBQ0YsQ0FBQztJQUNKLENBQUM7SUFFRCxRQUFRO1FBQ04sT0FBTyxLQUFLLENBQ1YsU0FBUyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQy9CLEdBQUcsQ0FDRCxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQ1osQ0FDRixFQUNELFNBQVMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUM5QixHQUFHLENBQ0QsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUNYLENBQ0YsRUFDRCxJQUFJLFVBQVUsQ0FDWixDQUFDLEdBQXFCLEVBQUUsRUFBRTtZQUN4QixHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzQixHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakIsQ0FBQyxDQUNGLENBQ0YsQ0FBQztJQUNKLENBQUM7OzhHQXpLVSxnQkFBZ0I7a0hBQWhCLGdCQUFnQjs0RkFBaEIsZ0JBQWdCO2tCQUQ1QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmltcG9ydCB7ZnJvbUV2ZW50LCBtZXJnZSwgT2JzZXJ2YWJsZSwgT2JzZXJ2ZXIsIG9mfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHttYXAsIG1lcmdlTWFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcblxyXG5pbXBvcnQge1NwZWVkVGVzdEZpbGVNb2RlbH0gZnJvbSAnLi4vbW9kZWxzL3NwZWVkLXRlc3QtZmlsZS5tb2RlbCc7XHJcbmltcG9ydCB7U3BlZWRUZXN0UmVzdWx0c01vZGVsfSBmcm9tICcuLi9tb2RlbHMvc3BlZWQtdGVzdC1yZXN1bHRzLm1vZGVsJztcclxuaW1wb3J0IHtTcGVlZFRlc3RTZXR0aW5nc01vZGVsfSBmcm9tICcuLi9tb2RlbHMvc3BlZWQtdGVzdC1zZXR0aW5ncy5tb2RlbCc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBTcGVlZFRlc3RTZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9hcHBseUNhY2hlQnVzdGVyID0gKHBhdGg6c3RyaW5nKTogc3RyaW5nID0+IHBhdGggKyAnP25ubj0nICsgTWF0aC5yYW5kb20oKTtcclxuXHJcbiAgcHJpdmF0ZSBfZG93bmxvYWQoc2V0dGluZ3M6U3BlZWRUZXN0U2V0dGluZ3NNb2RlbCwgYWxsRGV0YWlscz86U3BlZWRUZXN0UmVzdWx0c01vZGVsW10pOk9ic2VydmFibGU8bnVtYmVyPiB7XHJcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGU8U3BlZWRUZXN0UmVzdWx0c01vZGVsPihcclxuICAgICAgKG9ic2VydmVyKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbmV3U3BlZWREZXRhaWxzID0gbmV3IFNwZWVkVGVzdFJlc3VsdHNNb2RlbChzZXR0aW5ncy5maWxlLnNpemUpO1xyXG5cclxuICAgICAgICBjb25zdCBkb3dubG9hZCA9IG5ldyBJbWFnZSgpO1xyXG5cclxuICAgICAgICBkb3dubG9hZC5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICBuZXdTcGVlZERldGFpbHMuZW5kKCk7XHJcblxyXG4gICAgICAgICAgb2JzZXJ2ZXIubmV4dChuZXdTcGVlZERldGFpbHMpO1xyXG4gICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkb3dubG9hZC5vbmVycm9yID0gKCkgPT4ge1xyXG4gICAgICAgICAgbmV3U3BlZWREZXRhaWxzLmVycm9yKCk7XHJcblxyXG4gICAgICAgICAgbGV0IGRlbGF5ID0gMDtcclxuICAgICAgICAgIGlmIChzZXR0aW5ncy5pdGVyYXRpb25zICE9PSAxKSB7XHJcbiAgICAgICAgICAgIGRlbGF5ID0gc2V0dGluZ3MucmV0cnlEZWxheTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChcclxuICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgIG9ic2VydmVyLm5leHQobmV3U3BlZWREZXRhaWxzKTtcclxuICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkZWxheVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgZmlsZVBhdGggPSBzZXR0aW5ncy5maWxlLnBhdGg7XHJcbiAgICAgICAgaWYgKHNldHRpbmdzLmZpbGUuc2hvdWxkQnVzdENhY2hlKSB7XHJcbiAgICAgICAgICBmaWxlUGF0aCA9IHRoaXMuX2FwcGx5Q2FjaGVCdXN0ZXIoZmlsZVBhdGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbmV3U3BlZWREZXRhaWxzLnN0YXJ0KCk7XHJcblxyXG4gICAgICAgIGRvd25sb2FkLnNyYyA9IGZpbGVQYXRoO1xyXG4gICAgICB9XHJcbiAgICApLnBpcGUoXHJcbiAgICAgIG1lcmdlTWFwKFxyXG4gICAgICAgIChuZXdTcGVlZERldGFpbHM6U3BlZWRUZXN0UmVzdWx0c01vZGVsfG51bGwpID0+IHtcclxuICAgICAgICAgIGlmICh0eXBlb2YgYWxsRGV0YWlscyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgYWxsRGV0YWlscyA9IFtdO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGFsbERldGFpbHMucHVzaChuZXdTcGVlZERldGFpbHMpO1xyXG5cclxuICAgICAgICAgIGlmIChzZXR0aW5ncy5pdGVyYXRpb25zID09PSAxKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvdW50ID0gYWxsRGV0YWlscy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGxldCB0b3RhbCA9IDA7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgICB0b3RhbCArPSBhbGxEZXRhaWxzW2ldLnNwZWVkQnBzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBzcGVlZEJwcyA9IHRvdGFsIC8gY291bnQ7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gb2Yoc3BlZWRCcHMpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2V0dGluZ3MuaXRlcmF0aW9ucy0tO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Rvd25sb2FkKHNldHRpbmdzLCBhbGxEZXRhaWxzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBnZXRCcHMoc2V0dGluZ3M/OlNwZWVkVGVzdFNldHRpbmdzTW9kZWwpOk9ic2VydmFibGU8bnVtYmVyfG51bGw+IHtcclxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShcclxuICAgICAgKG9ic2VydmVyKSA9PiB7XHJcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoXHJcbiAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRTZXR0aW5ncyA9IG5ldyBTcGVlZFRlc3RTZXR0aW5nc01vZGVsKCk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3MgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7IC4uLmRlZmF1bHRTZXR0aW5ncyB9O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3MuaXRlcmF0aW9ucyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzLml0ZXJhdGlvbnMgPSBkZWZhdWx0U2V0dGluZ3MuaXRlcmF0aW9ucztcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3MuZmlsZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzLmZpbGUgPSBkZWZhdWx0U2V0dGluZ3MuZmlsZTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGVmYXVsdEZpbGVTZXR0aW5ncyA9IG5ldyBTcGVlZFRlc3RGaWxlTW9kZWwoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHNldHRpbmdzLmZpbGUucGF0aCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignbmctc3BlZWQtdGVzdDogRmlsZSBwYXRoIGlzIG1pc3NpbmcuJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHNldHRpbmdzLmZpbGUuc2l6ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignbmctc3BlZWQtdGVzdDogRmlsZSBzaXplIGlzIG1pc3NpbmcuJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHNldHRpbmdzLmZpbGUuc2hvdWxkQnVzdENhY2hlID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICBzZXR0aW5ncy5maWxlLnNob3VsZEJ1c3RDYWNoZSA9IGRlZmF1bHRGaWxlU2V0dGluZ3Muc2hvdWxkQnVzdENhY2hlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3MucmV0cnlEZWxheSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgc2V0dGluZ3MucmV0cnlEZWxheSA9IGRlZmF1bHRTZXR0aW5ncy5yZXRyeURlbGF5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5fZG93bmxvYWQoeyAuLi5zZXR0aW5ncyB9KS5zdWJzY3JpYmUoXHJcbiAgICAgICAgICAgICAgKHNwZWVkQnBzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHNwZWVkQnBzKTtcclxuICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIDFcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgZ2V0S2JwcyhzZXR0aW5ncz86U3BlZWRUZXN0U2V0dGluZ3NNb2RlbCk6T2JzZXJ2YWJsZTxudW1iZXI+IHtcclxuICAgIHJldHVybiB0aGlzLmdldEJwcyhzZXR0aW5ncykucGlwZShcclxuICAgICAgbWFwKFxyXG4gICAgICAgIChicHMpID0+IHtcclxuICAgICAgICAgIHJldHVybiBicHMgLyAxMDI0O1xyXG4gICAgICAgIH1cclxuICAgICAgKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGdldE1icHMoc2V0dGluZ3M/OlNwZWVkVGVzdFNldHRpbmdzTW9kZWwpOk9ic2VydmFibGU8bnVtYmVyPiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRLYnBzKHNldHRpbmdzKS5waXBlKFxyXG4gICAgICBtYXAoXHJcbiAgICAgICAgKGtwYnMpID0+IHtcclxuICAgICAgICAgIHJldHVybiBrcGJzIC8gMTAyNDtcclxuICAgICAgICB9XHJcbiAgICAgIClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBpc09ubGluZSgpOk9ic2VydmFibGU8Ym9vbGVhbj4ge1xyXG4gICAgcmV0dXJuIG1lcmdlPGJvb2xlYW4+KFxyXG4gICAgICBmcm9tRXZlbnQod2luZG93LCAnb2ZmbGluZScpLnBpcGUoXHJcbiAgICAgICAgbWFwKFxyXG4gICAgICAgICAgKCkgPT4gZmFsc2VcclxuICAgICAgICApXHJcbiAgICAgICksXHJcbiAgICAgIGZyb21FdmVudCh3aW5kb3csICdvbmxpbmUnKS5waXBlKFxyXG4gICAgICAgIG1hcChcclxuICAgICAgICAgICgpID0+IHRydWVcclxuICAgICAgICApXHJcbiAgICAgICksXHJcbiAgICAgIG5ldyBPYnNlcnZhYmxlKFxyXG4gICAgICAgIChzdWI6T2JzZXJ2ZXI8Ym9vbGVhbj4pID0+IHtcclxuICAgICAgICAgIHN1Yi5uZXh0KG5hdmlnYXRvci5vbkxpbmUpO1xyXG4gICAgICAgICAgc3ViLmNvbXBsZXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICApXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG4iXX0=