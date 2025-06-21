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
      if (settings.iterations !== undefined) {
        this.iterations = settings.iterations;
      }
      if (settings.retryDelay !== undefined) {
        this.retryDelay = settings.retryDelay;
      }
      if (settings.file) {
        this.file = new SpeedTestFileModel();
        if (settings.file.path !== undefined) {
          this.file.path = settings.file.path;
        }
        if (settings.file.size !== undefined) {
          this.file.size = settings.file.size;
        }
        if (settings.file.shouldBustCache !== undefined) {
          this.file.shouldBustCache = settings.file.shouldBustCache;
        }
      }
    }
  }
}
