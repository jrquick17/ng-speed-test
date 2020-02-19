import {Component} from '@angular/core';

import {finalize} from 'rxjs/operators';

import {SpeedTestService} from 'ng-speed-test';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng-speed-test-demo';

  public hasChecked:boolean = false;
  public hasError:boolean = false;
  public isChecking:boolean = false;
  public speed:string = '';

  constructor(
    private speedTestService:SpeedTestService
  ) {

  }

  getSpeed():void {
    this.isChecking = true;

    this.speedTestService.getMbps().pipe(
      finalize(
        () => {
          this.isChecking = false;
        }
      )
    ).subscribe(
      (speed) => {
        this.hasError = speed === -1;

        if (!this.hasError) {
          this.speed = speed.toFixed(2);
        }

        this.hasChecked = true;
      }
    )
  }
}
