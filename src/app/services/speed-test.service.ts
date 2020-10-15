import {Injectable} from '@angular/core';

import {fromEvent, merge, Observable, Observer, of} from 'rxjs';
import {mergeMap, map} from 'rxjs/operators';

import {SpeedTestFileModel} from '../models/speed-test-file.model';
import {SpeedTestResultsModel} from '../models/speed-test-results.model';
import {SpeedTestSettingsModel} from '../models/speed-test-settings.model';
import {deepCopy} from '@angular-devkit/core';

@Injectable()
export class SpeedTestService {
  constructor() {

  }

  private _applyCacheBuster = (path:string): string => path + '?nnn=' + Math.random();

  private _download(settings:SpeedTestSettingsModel, allDetails?:SpeedTestResultsModel[]):Observable<number> {
    return new Observable<SpeedTestResultsModel>(
      (observer) => {
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
      }
    ).pipe(
      mergeMap(
        (newSpeedDetails:SpeedTestResultsModel|null) => {
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
          } else {
            settings.iterations--;

            return this._download(settings, allDetails);
          }
        }
      )
    );
  }

  getBps(settings:SpeedTestSettingsModel):Observable<number|null> {
    return new Observable(
      (observer) => {
        window.setTimeout(
          () => {
            if (typeof settings.iterations === 'undefined') {
              settings.iterations = 3;
            }

            if (typeof settings.file === 'undefined') {
              settings.file = new SpeedTestFileModel();
            } else {
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
              } else {
                settings.file.shouldBustCache = settings.file.shouldBustCache === true;
              }
            }

            this._download(deepCopy(settings)).subscribe(
              (speedBps) => {
                observer.next(speedBps);
                observer.complete();
              }
            );
          },
          1
        );
      }
    );
  }

  getKbps(settings:SpeedTestSettingsModel):Observable<number> {
    return this.getBps(settings).pipe(
      map(
        (bps) => {
          return bps / 1024;
        }
      )
    );
  }

  getMbps(settings:SpeedTestSettingsModel):Observable<number> {
    return this.getKbps(settings).pipe(
      map(
        (kpbs) => {
          return kpbs / 1024;
        }
      )
    );
  }

  isOnline():Observable<boolean> {
    return merge<boolean>(
      fromEvent(window, 'offline').pipe(
        map(
          () => false
        )
      ),
      fromEvent(window, 'online').pipe(
        map(
          () => true
        )
      ),
      new Observable(
        (sub:Observer<boolean>) => {
          sub.next(navigator.onLine);
          sub.complete();
        }
      )
    );
  }
}
