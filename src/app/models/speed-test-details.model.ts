export class SpeedTestDetailsModel {
  public duration:number  = 0;
  public hasEnded:boolean = false;

  public startTime:number = null;
  public endTime:number = null;

  public speedBps:number = 0;

  constructor(
    private fileSize:number
  ) {

  }

  private _update():void {
    if (this.endTime !== null) {
      const milliseconds = this.endTime - this.startTime;
      if (milliseconds !== 0) {
        this.duration = milliseconds / 1000;
      }

      const bitsLoaded = this.fileSize * 8;

      this.speedBps = bitsLoaded / this.duration;
    }
  }

  end():void {
    if (!this.hasEnded) {
      this.hasEnded = true;

      this.endTime = (new Date()).getTime();

      this._update();
    }
  }

  error():void {
    if (!this.hasEnded) {
      this.hasEnded = true;

      this.endTime = null;

      this._update();
    }
  }

  start():void {
    this.startTime = (new Date()).getTime();
  }
}
