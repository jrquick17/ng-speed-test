import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable()
export class SpeedTestService {
  constructor() {

  }

  getBps():Observable<number> {
    return new Observable(
      (observer) => {
        window.setTimeout(
          () => {
            // const imageAddr = 'https://ng-speed-test.jrquick.com/assets/internet-speed-image.jpg';
            const imageAddr = 'https://webapp.uic-chp.org/internet-speed-image.jpg';

            let startTime, endTime;
            const download = new Image();

            download.onload = (a) => {
              endTime = (new Date()).getTime();

              const downloadSize = 4995374;

              const duration = (endTime - startTime) / 1000;

              const bitsLoaded = downloadSize * 8;

              const speedBps = bitsLoaded / duration;

              observer.next(speedBps);
              observer.complete();
            };

            download.onerror = () => {
              observer.next(-1);
              observer.complete();
            };

            startTime = (new Date()).getTime();

            const cacheBuster = '?nnn=' + startTime;
            download.src = imageAddr + cacheBuster;
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
