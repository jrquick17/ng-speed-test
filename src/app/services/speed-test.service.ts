import {Injectable} from '@angular/core';

import {fromEvent, merge, Observable, Observer, of} from 'rxjs';
import {mergeMap, map} from 'rxjs/operators';

import {FileDetailsModel} from '../models/file-details.model';
import {SpeedDetailsModel} from '../models/speed-details.model';

@Injectable()
export class SpeedTestService {
  constructor() {

  }

  private _applyCacheBuster = (path:string): string => path + '?nnn=' + Math.random();

  private _download(iterations?:number, fileDetails?:FileDetailsModel, allDetails?:SpeedDetailsModel[]):Observable<number> {
    return new Observable<SpeedDetailsModel>(
      (observer) => {
        const newSpeedDetails = new SpeedDetailsModel(fileDetails.size);

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

        let filePath = fileDetails.path;
        if (fileDetails.shouldBustCache) {
          filePath = this._applyCacheBuster(filePath);
        }

        newSpeedDetails.start();

        download.src = filePath;
      }
    ).pipe(
      mergeMap(
        (newSpeedDetails:SpeedDetailsModel|null) => {
          if (typeof allDetails === 'undefined') {
            allDetails = [];
          }

          allDetails.push(newSpeedDetails);

          if (typeof iterations === 'undefined') {
            iterations = 3;
          }

          if (iterations === 1) {
            const count = allDetails.length;
            let total = 0;

            for (let i = 0; i < count; i++) {
              total += allDetails[i].speedBps;
            }

            const speedBps = total / count;

            return of(speedBps);
          } else {
            return this._download(--iterations, fileDetails, allDetails);
          }
        }
      )
    );
  }

  getBps(iterations?:number, fileDetails?:FileDetailsModel):Observable<number|null> {
    return new Observable(
      (observer) => {
        window.setTimeout(
          () => {
            if (typeof fileDetails === 'undefined') {
              fileDetails = new FileDetailsModel();
            } else {
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
              } else {
                fileDetails.shouldBustCache = fileDetails.shouldBustCache === true;
              }
            }

            this._download(iterations, fileDetails).subscribe(
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

  getKbps(iterations?:number, fileDetails?:FileDetailsModel):Observable<number> {
    return this.getBps(iterations, fileDetails).pipe(
      map(
        (bps) => {
          return bps / 1024;
        }
      )
    );
  }

  getMbps(iterations?:number, fileDetails?:FileDetailsModel):Observable<number> {
    return this.getKbps(iterations, fileDetails).pipe(
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
