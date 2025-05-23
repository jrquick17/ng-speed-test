export interface SpeedTestResults {
  duration: number;
  hasEnded: boolean;
  startTime: number | null;
  endTime: number | null;
  speedBps: number;
  speedKbps: number;
  speedMbps: number;
}

export class SpeedTestResultsModel implements SpeedTestResults {
  public duration: number = 0;
  public hasEnded: boolean = false;
  public startTime: number | null = null;
  public endTime: number | null = null;
  public speedBps: number = 0;

  constructor(private fileSize: number) {}

  get speedKbps(): number {
    return this.speedBps / 1024;
  }

  get speedMbps(): number {
    return this.speedKbps / 1024;
  }

  private _update(): void {
    if (this.endTime !== null && this.startTime !== null) {
      const milliseconds = this.endTime - this.startTime;
      if (milliseconds !== 0) {
        this.duration = milliseconds / 1000;
      }

      const bitsLoaded = this.fileSize * 8;
      this.speedBps = bitsLoaded / this.duration;
    }
  }

  end(): void {
    if (!this.hasEnded) {
      this.hasEnded = true;
      this.endTime = Date.now();
      this._update();
    }
  }

  error(): void {
    if (!this.hasEnded) {
      this.hasEnded = true;
      this.endTime = null;
      this._update();
    }
  }

  start(): void {
    this.startTime = Date.now();
  }
}
