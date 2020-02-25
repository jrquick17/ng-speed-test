import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {FileDetailsModel} from '../models/file-details.model';
import {SpeedDetailsModel} from '../models/speed-details.model';

@Injectable()
export class SpeedTestService {
  constructor() {

  }

  private _applyCacheBuster = (path:string): string => path + '?nnn=' + Math.random();

  getBps(fileDetails?:FileDetailsModel):Observable<number|null> {
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

            if (shouldBustCache) {
              filePath = this._applyCacheBuster(filePath);
            }

            const speedDetails = new SpeedDetailsModel(fileSize);

            const download = new Image();

            download.onload = (a) => {
              speedDetails.end();

              observer.next(speedDetails.speedBps);
              observer.complete();
            };

            download.onerror = () => {
              observer.next(null);
              observer.complete();
            };

            speedDetails.start();

            download.src = filePath;
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
