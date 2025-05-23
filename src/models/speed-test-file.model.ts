export interface SpeedTestFile {
  path: string;
  shouldBustCache: boolean;
  size: number;
}

export class SpeedTestFileModel implements SpeedTestFile {
  public path: string = 'https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/5mb.jpg';
  public shouldBustCache: boolean = true;
  public size: number = 4952221;

  constructor(file?: Partial<SpeedTestFile>) {
    if (file) {
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
