export declare class SpeedDetailsModel {
    private fileSize;
    duration: number;
    endTime: number;
    speedBps: number;
    startTime: number;
    constructor(fileSize: number);
    end(): void;
    start(): void;
}
