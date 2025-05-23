export interface SpeedTestFile {
  path: string;
  shouldBustCache: boolean;
  size: number;
}

export class SpeedTestFileModel implements SpeedTestFile {
  public path: string = 'https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/5mb.jpg';
  public shouldBustCache: boolean = true;
  public size: number = 4952221;

  // Available test files:
  // https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/500kb.jpg
  // 500kb - 408949 bytes
  // https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/1mb.jpg
  // 1mb - 1197292 bytes
  // https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/5mb.jpg
  // 5mb - 4952221 bytes
  // https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/13mb.jpg
  // 13mb - 13848150 bytes

  constructor(file?: Partial<SpeedTestFile>) {
    if (file) {
      // Only override provided properties, keep defaults for others
      if (file.path !== undefined) {
        this.path = file.path;
      }

      if (file.size !== undefined) {
        this.size = file.size;
      }

      if (file.shouldBustCache !== undefined) {
        this.shouldBustCache = file.shouldBustCache;
      }
    }
  }
}

// speed-test-settings.model.ts
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
      // Handle iterations
      if (settings.iterations !== undefined) {
        this.iterations = settings.iterations;
      }

      // Handle retryDelay
      if (settings.retryDelay !== undefined) {
        this.retryDelay = settings.retryDelay;
      }

      // Handle file settings - merge with defaults
      if (settings.file) {
        this.file = new SpeedTestFileModel();

        // Only override provided file properties
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
