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
      Object.assign(this, file);
    }
  }
}
