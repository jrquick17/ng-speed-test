import {SpeedTestFile, SpeedTestFileModel} from './speed-test-file.model';

export interface SpeedTestSettings {
  iterations?: number;
  file?: SpeedTestFile;
  retryDelay?: number;
}

export class SpeedTestSettingsModel implements SpeedTestSettings {
  public iterations?: number = 3;
  public file?: SpeedTestFileModel = new SpeedTestFileModel();
  public retryDelay?: number = 500;

  constructor(settings?: Partial<SpeedTestSettings>) {
    if (settings) {
      Object.assign(this, settings);
      if (settings.file) {
        this.file = new SpeedTestFileModel(settings.file);
      }
    }
  }
}
