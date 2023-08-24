import { Injectable } from '@angular/core';
import { fromEvent, merge, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { SpeedTestFileModel } from '../models/speed-test-file.model';
import { SpeedTestResultsModel } from '../models/speed-test-results.model';
import { SpeedTestSettingsModel } from '../models/speed-test-settings.model';
import * as i0 from "@angular/core";
export class SpeedTestService {
    constructor() {
    }
    _applyCacheBuster = (path) => path + '?nnn=' + Math.random();
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
                if (typeof window === 'undefined') {
                    console.error("ng-speed-test: window is not defined.");
                    return;
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.2", ngImport: i0, type: SpeedTestService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.2.2", ngImport: i0, type: SpeedTestService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.2", ngImport: i0, type: SpeedTestService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlZWQtdGVzdC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlcy9zcGVlZC10ZXN0LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV6QyxPQUFPLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQVksRUFBRSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2hFLE9BQU8sRUFBQyxHQUFHLEVBQUUsUUFBUSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFN0MsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0saUNBQWlDLENBQUM7QUFDbkUsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sb0NBQW9DLENBQUM7QUFDekUsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0scUNBQXFDLENBQUM7O0FBRzNFLE1BQU0sT0FBTyxnQkFBZ0I7SUFDM0I7SUFFQSxDQUFDO0lBRU8saUJBQWlCLEdBQUcsQ0FBQyxJQUFXLEVBQVUsRUFBRSxDQUFDLElBQUksR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBRTVFLFNBQVMsQ0FBQyxRQUErQixFQUFFLFVBQW1DO1FBQ3BGLE9BQU8sSUFBSSxVQUFVLENBQ25CLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDWCxNQUFNLGVBQWUsR0FBRyxJQUFJLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUU3QixRQUFRLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTtnQkFDckIsZUFBZSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUV0QixRQUFRLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUMvQixRQUFRLENBQUMsUUFBUSxF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O0lBQ0osQ0FBQztJQUVELE9BQU8sQ0FBQyxRQUFnQztRQUN0QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUNoQyxHQUFHLENBQ0QsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNQLE9BQU8sSUFBSSxHQUFHLElBQUksQ0FBQztRQUNyQixDQUFDLENBQ0YsQ0FDRixDQUFDO0lBQ0osQ0FBQztJQUVELFFBQVE7UUFDTixPQUFPLEtBQUssQ0FDVixTQUFTLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FDL0IsR0FBRyxDQUNELEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FDWixDQUNGLEVBQ0QsU0FBUyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQzlCLEdBQUcsQ0FDRCxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQ1gsQ0FDRixFQUNELElBQUksVUFBVSxDQUNaLENBQUMsR0FBcUIsRUFBRSxFQUFFO1lBQ3hCLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNCLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqQixDQUFDLENBQ0YsQ0FDRixDQUFDO0lBQ0osQ0FBQzt1R0E5S1UsZ0JBQWdCOzJHQUFoQixnQkFBZ0I7OzJGQUFoQixnQkFBZ0I7a0JBRDVCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuaW1wb3J0IHtmcm9tRXZlbnQsIG1lcmdlLCBPYnNlcnZhYmxlLCBPYnNlcnZlciwgb2Z9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge21hcCwgbWVyZ2VNYXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuXHJcbmltcG9ydCB7U3BlZWRUZXN0RmlsZU1vZGVsfSBmcm9tICcuLi9tb2RlbHMvc3BlZWQtdGVzdC1maWxlLm1vZGVsJztcclxuaW1wb3J0IHtTcGVlZFRlc3RSZXN1bHRzTW9kZWx9IGZyb20gJy4uL21vZGVscy9zcGVlZC10ZXN0LXJlc3VsdHMubW9kZWwnO1xyXG5pbXBvcnQge1NwZWVkVGVzdFNldHRpbmdzTW9kZWx9IGZyb20gJy4uL21vZGVscy9zcGVlZC10ZXN0LXNldHRpbmdzLm1vZGVsJztcclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIFNwZWVkVGVzdFNlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2FwcGx5Q2FjaGVCdXN0ZXIgPSAocGF0aDpzdHJpbmcpOiBzdHJpbmcgPT4gcGF0aCArICc/bm5uPScgKyBNYXRoLnJhbmRvbSgpO1xyXG5cclxuICBwcml2YXRlIF9kb3dubG9hZChzZXR0aW5nczpTcGVlZFRlc3RTZXR0aW5nc01vZGVsLCBhbGxEZXRhaWxzPzpTcGVlZFRlc3RSZXN1bHRzTW9kZWxbXSk6T2JzZXJ2YWJsZTxudW1iZXI+IHtcclxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZTxTcGVlZFRlc3RSZXN1bHRzTW9kZWw+KFxyXG4gICAgICAob2JzZXJ2ZXIpID0+IHtcclxuICAgICAgICBjb25zdCBuZXdTcGVlZERldGFpbHMgPSBuZXcgU3BlZWRUZXN0UmVzdWx0c01vZGVsKHNldHRpbmdzLmZpbGUuc2l6ZSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGRvd25sb2FkID0gbmV3IEltYWdlKCk7XHJcblxyXG4gICAgICAgIGRvd25sb2FkLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgICAgIG5ld1NwZWVkRGV0YWlscy5lbmQoKTtcclxuXHJcbiAgICAgICAgICBvYnNlcnZlci5uZXh0KG5ld1NwZWVkRGV0YWlscyk7XHJcbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRvd25sb2FkLm9uZXJyb3IgPSAoKSA9PiB7XHJcbiAgICAgICAgICBuZXdTcGVlZERldGFpbHMuZXJyb3IoKTtcclxuXHJcbiAgICAgICAgICBsZXQgZGVsYXkgPSAwO1xyXG4gICAgICAgICAgaWYgKHNldHRpbmdzLml0ZXJhdGlvbnMgIT09IDEpIHtcclxuICAgICAgICAgICAgZGVsYXkgPSBzZXR0aW5ncy5yZXRyeURlbGF5O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwibmctc3BlZWQtdGVzdDogd2luZG93IGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KFxyXG4gICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChuZXdTcGVlZERldGFpbHMpO1xyXG4gICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRlbGF5XHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBmaWxlUGF0aCA9IHNldHRpbmdzLmZpbGUucGF0aDtcclxuICAgICAgICBpZiAoc2V0dGluZ3MuZmlsZS5zaG91bGRCdXN0Q2FjaGUpIHtcclxuICAgICAgICAgIGZpbGVQYXRoID0gdGhpcy5fYXBwbHlDYWNoZUJ1c3RlcihmaWxlUGF0aCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuZXdTcGVlZERldGFpbHMuc3RhcnQoKTtcclxuXHJcbiAgICAgICAgZG93bmxvYWQuc3JjID0gZmlsZVBhdGg7XHJcbiAgICAgIH1cclxuICAgICkucGlwZShcclxuICAgICAgbWVyZ2VNYXAoXHJcbiAgICAgICAgKG5ld1NwZWVkRGV0YWlsczpTcGVlZFRlc3RSZXN1bHRzTW9kZWx8bnVsbCkgPT4ge1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiBhbGxEZXRhaWxzID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBhbGxEZXRhaWxzID0gW107XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgYWxsRGV0YWlscy5wdXNoKG5ld1NwZWVkRGV0YWlscyk7XHJcblxyXG4gICAgICAgICAgaWYgKHNldHRpbmdzLml0ZXJhdGlvbnMgPT09IDEpIHtcclxuICAgICAgICAgICAgY29uc3QgY291bnQgPSBhbGxEZXRhaWxzLmxlbmd0aDtcclxuICAgICAgICAgICAgbGV0IHRvdGFsID0gMDtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICAgIHRvdGFsICs9IGFsbERldGFpbHNbaV0uc3BlZWRCcHM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHNwZWVkQnBzID0gdG90YWwgLyBjb3VudDtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBvZihzcGVlZEJwcyk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzZXR0aW5ncy5pdGVyYXRpb25zLS07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZG93bmxvYWQoc2V0dGluZ3MsIGFsbERldGFpbHMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGdldEJwcyhzZXR0aW5ncz86U3BlZWRUZXN0U2V0dGluZ3NNb2RlbCk6T2JzZXJ2YWJsZTxudW1iZXJ8bnVsbD4ge1xyXG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKFxyXG4gICAgICAob2JzZXJ2ZXIpID0+IHtcclxuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChcclxuICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZGVmYXVsdFNldHRpbmdzID0gbmV3IFNwZWVkVGVzdFNldHRpbmdzTW9kZWwoKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZXR0aW5ncyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICBzZXR0aW5ncyA9IHsgLi4uZGVmYXVsdFNldHRpbmdzIH07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzZXR0aW5ncy5pdGVyYXRpb25zID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuaXRlcmF0aW9ucyA9IGRlZmF1bHRTZXR0aW5ncy5pdGVyYXRpb25zO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzZXR0aW5ncy5maWxlID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuZmlsZSA9IGRlZmF1bHRTZXR0aW5ncy5maWxlO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkZWZhdWx0RmlsZVNldHRpbmdzID0gbmV3IFNwZWVkVGVzdEZpbGVNb2RlbCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3MuZmlsZS5wYXRoID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCduZy1zcGVlZC10ZXN0OiBGaWxlIHBhdGggaXMgbWlzc2luZy4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3MuZmlsZS5zaXplID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCduZy1zcGVlZC10ZXN0OiBGaWxlIHNpemUgaXMgbWlzc2luZy4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3MuZmlsZS5zaG91bGRCdXN0Q2FjaGUgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmZpbGUuc2hvdWxkQnVzdENhY2hlID0gZGVmYXVsdEZpbGVTZXR0aW5ncy5zaG91bGRCdXN0Q2FjaGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzZXR0aW5ncy5yZXRyeURlbGF5ID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICBzZXR0aW5ncy5yZXRyeURlbGF5ID0gZGVmYXVsdFNldHRpbmdzLnJldHJ5RGVsYXk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9kb3dubG9hZCh7IC4uLnNldHRpbmdzIH0pLnN1YnNjcmliZShcclxuICAgICAgICAgICAgICAoc3BlZWRCcHMpID0+IHtcclxuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoc3BlZWRCcHMpO1xyXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgMVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBnZXRLYnBzKHNldHRpbmdzPzpTcGVlZFRlc3RTZXR0aW5nc01vZGVsKTpPYnNlcnZhYmxlPG51bWJlcj4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0QnBzKHNldHRpbmdzKS5waXBlKFxyXG4gICAgICBtYXAoXHJcbiAgICAgICAgKGJwcykgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGJwcyAvIDEwMjQ7XHJcbiAgICAgICAgfVxyXG4gICAgICApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgZ2V0TWJwcyhzZXR0aW5ncz86U3BlZWRUZXN0U2V0dGluZ3NNb2RlbCk6T2JzZXJ2YWJsZTxudW1iZXI+IHtcclxuICAgIHJldHVybiB0aGlzLmdldEticHMoc2V0dGluZ3MpLnBpcGUoXHJcbiAgICAgIG1hcChcclxuICAgICAgICAoa3BicykgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGtwYnMgLyAxMDI0O1xyXG4gICAgICAgIH1cclxuICAgICAgKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGlzT25saW5lKCk6T2JzZXJ2YWJsZTxib29sZWFuPiB7XHJcbiAgICByZXR1cm4gbWVyZ2U8Ym9vbGVhbj4oXHJcbiAgICAgIGZyb21FdmVudCh3aW5kb3csICdvZmZsaW5lJykucGlwZShcclxuICAgICAgICBtYXAoXHJcbiAgICAgICAgICAoKSA9PiBmYWxzZVxyXG4gICAgICAgIClcclxuICAgICAgKSxcclxuICAgICAgZnJvbUV2ZW50KHdpbmRvdywgJ29ubGluZScpLnBpcGUoXHJcbiAgICAgICAgbWFwKFxyXG4gICAgICAgICAgKCkgPT4gdHJ1ZVxyXG4gICAgICAgIClcclxuICAgICAgKSxcclxuICAgICAgbmV3IE9ic2VydmFibGUoXHJcbiAgICAgICAgKHN1YjpPYnNlcnZlcjxib29sZWFuPikgPT4ge1xyXG4gICAgICAgICAgc3ViLm5leHQobmF2aWdhdG9yLm9uTGluZSk7XHJcbiAgICAgICAgICBzdWIuY29tcGxldGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIClcclxuICAgICk7XHJcbiAgfVxyXG59XHJcbiJdfQ==