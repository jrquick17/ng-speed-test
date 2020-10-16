export declare class SpeedTestResultsModel {
    private fileSize;
    duration: number;
    hasEnded: boolean;
    startTime: number;
    endTime: number;
    speedBps: number;
    constructor(fileSize: number);
    private _update;
    end(): void;
    error(): void;
    start(): void;
}
