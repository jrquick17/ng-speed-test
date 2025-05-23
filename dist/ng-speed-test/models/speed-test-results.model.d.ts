export interface SpeedTestResults {
    duration: number;
    hasEnded: boolean;
    startTime: number | null;
    endTime: number | null;
    speedBps: number;
    speedKbps: number;
    speedMbps: number;
}
export declare class SpeedTestResultsModel implements SpeedTestResults {
    private fileSize;
    duration: number;
    hasEnded: boolean;
    startTime: number | null;
    endTime: number | null;
    speedBps: number;
    constructor(fileSize: number);
    get speedKbps(): number;
    get speedMbps(): number;
    private _update;
    end(): void;
    error(): void;
    start(): void;
}
