import { Component } from '@angular/core';
import { SpeedTestService } from 'ng-speed-test';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng-speed-test-demo';

  public hasTracked: boolean = false;
  public isTracking: boolean = false;
  public iterations: number = 1;
  public speeds: number[] = []; // Changed from string[] to number[]

  constructor(private speedTestService: SpeedTestService) {}

  goToGitHub(): void {
    window.location.href = 'https://github.com/jrquick17/ng-speed-test';
  }

  trackSpeed(): void {
    if (this.hasTracked) {
      this.speeds = [];
      this.hasTracked = false;
    }

    if (this.iterations > 100) {
      this.iterations = 100;
    }

    this.isTracking = true;

    this.speedTestService.getMbps({ iterations: 1, retryDelay: 1500 }).subscribe(
        (speed) => {
          // Store as number for progress bar, but display formatted
          this.speeds.unshift(speed);

          if (this.speeds.length < this.iterations) {
            this.trackSpeed();
          } else {
            this.isTracking = false;
            this.hasTracked = true;
          }
        }
    );
  }

  // Helper method for displaying speed
  getFormattedSpeed(speed: number): string {
    return speed.toFixed(2);
  }
}
