export class SpeedDetailsModel {
  public duration:number;
  public endTime:number;
  public speedBps:number;
  public startTime:number;

  constructor(
    private fileSize:number
  ) {

  }

  end():void {
    this.endTime = (new Date()).getTime();

    this.duration = (this.endTime - this.startTime) / 1000;

    const bitsLoaded = this.fileSize * 8;

    this.speedBps = bitsLoaded / this.duration;
  }

  start():void {
    this.startTime = (new Date()).getTime();
  }
}
