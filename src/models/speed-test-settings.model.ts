import {SpeedTestFile, SpeedTestFileModel} from './speed-test-file.model';

export interface SpeedTestSettings {
  iterations?: number;
  file?: SpeedTestFile;
  retryDelay?: number;
  /**
   * Optional cap, in milliseconds, on how long a single iteration reads the response body for
   * (D7). Once elapsed time since the first byte reaches this value, the read is cancelled and
   * the iteration's speed is computed from the bytes received so far instead of waiting for the
   * full file. Undefined (the default) preserves prior behavior: the full response body is
   * always read to completion.
   */
  maxSampleDuration?: number;
}

export class SpeedTestSettingsModel implements SpeedTestSettings {
  public iterations?: number = 3;
  public file?: SpeedTestFileModel = new SpeedTestFileModel();
  public retryDelay?: number = 500;
  public maxSampleDuration?: number = undefined;

  constructor(settings?: Partial<SpeedTestSettings>) {
    if (settings) {
      if (settings.iterations !== undefined) {
        this.iterations = settings.iterations;
      }
      if (settings.retryDelay !== undefined) {
        this.retryDelay = settings.retryDelay;
      }
      if (settings.maxSampleDuration !== undefined) {
        this.maxSampleDuration = settings.maxSampleDuration;
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
