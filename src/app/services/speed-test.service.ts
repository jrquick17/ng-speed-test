import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';

@Injectable()
export class SpeedTestService {
  constructor() {

  }

  getSpeed():Observable<string|boolean> {
    return new Observable(
      (observer) => {
        window.setTimeout(
          () => {
            const imageAddr = 'https://ng-speed-test.jrquick.com/assets/internet-speed-image.jpg';

            let startTime, endTime;
            const download = new Image();

            download.onload = () => {
              endTime = (new Date()).getTime();

              const downloadSize = 4995374;

              const duration = (endTime - startTime) / 1000;

              const bitsLoaded = downloadSize * 8;

              const speedBps:any = (bitsLoaded / duration).toFixed(2);
              const speedKbps:any = (speedBps / 1024).toFixed(2);

              const speedMbps = (speedKbps / 1024).toFixed(2);

              observer.next(speedMbps);
              observer.complete();
            };

            download.onerror = () => {
              observer.next(false);
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
}
