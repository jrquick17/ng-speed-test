import {Injectable} from '@angular/core';

import {Observable, of} from 'rxjs';
import {flatMap, map} from 'rxjs/operators';
import {FileDetailsModel} from '../models/file-details.model';
import {SpeedDetailsModel} from '../models/speed-details.model';

@Injectable()
export class SpeedTestService {
  constructor() {

  }

  private _applyCacheBuster = (path:string): string => path + '?nnn=' + Math.random();

  private _download(fileDetails:FileDetailsModel, iterations?:number, allDetails?:SpeedDetailsModel[]):Observable<number> {
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
          observer.next(null);
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
      flatMap(
        (newSpeedDetails:SpeedDetailsModel|null) => {
          if (newSpeedDetails === null) {
            console.error('ng-speed-test: Error downloading file.');
          } else {
            if (typeof allDetails === 'undefined') {
              allDetails = [];
            }

            allDetails.push(newSpeedDetails);
          }

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
            return this._download(fileDetails, --iterations, allDetails);
          }
        }
      )
    );
  }

  getBps(fileDetails?:FileDetailsModel, iterations?:number):Observable<number|null> {
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

            this._download(fileDetails, iterations).subscribe(
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

  getKbps():Observable<number> {
    return this.getBps().pipe(
      map(
        (bps) => {
          return bps / 1024;
        }
      )
    );
  }

  getMbps():Observable<number> {
    return this.getKbps().pipe(
      map(
        (kpbs) => {
          return kpbs / 1024;
        }
      )
    );
  }
}
