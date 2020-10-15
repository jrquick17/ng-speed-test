import {SpeedTestFileModel} from './speed-test-file.model';

export class SpeedTestSettingsModel {
  public iterations?:number = 3;
  public file?:SpeedTestFileModel = new SpeedTestFileModel();
  public retryDelay?:number = 500;
}
