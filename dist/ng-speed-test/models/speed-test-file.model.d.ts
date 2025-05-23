export interface SpeedTestFile {
    path: string;
    shouldBustCache: boolean;
    size: number;
}
export declare class SpeedTestFileModel implements SpeedTestFile {
    path: string;
    shouldBustCache: boolean;
    size: number;
    constructor(file?: Partial<SpeedTestFile>);
}
