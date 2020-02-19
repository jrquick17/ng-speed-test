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
  public isChecking:boolean = false;
  public speed:string|boolean = '';

  constructor(
    private speedTestService:SpeedTestService
  ) {

  }

  getSpeed():void {
    this.isChecking = true;

    this.speedTestService.getSpeed().subscribe(
      (speed) => {
        this.speed = speed;

        this.isChecking = false;
        this.hasChecked = true;
      }
    )
  }
}
