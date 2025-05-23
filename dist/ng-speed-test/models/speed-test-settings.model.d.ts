import { SpeedTestFile, SpeedTestFileModel } from './speed-test-file.model';
export interface SpeedTestSettings {
    iterations?: number;
    file?: SpeedTestFile;
    retryDelay?: number;
}
export declare class SpeedTestSettingsModel implements SpeedTestSettings {
    iterations?: number;
    file?: SpeedTestFileModel;
    retryDelay?: number;
    constructor(settings?: Partial<SpeedTestSettings>);
}
