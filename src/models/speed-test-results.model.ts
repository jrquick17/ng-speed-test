export interface SpeedTestResults {
    duration: number;
    hasEnded: boolean;
    startTime: number | null;
    endTime: number | null;
    speedBps: number;
    speedKbps: number;
    speedMbps: number;
}

export class SpeedTestResultsModel implements SpeedTestResults {
    public duration: number = 0;
    public hasEnded: boolean = false;
    public startTime: number | null = null;
    public endTime: number | null = null;
    public speedBps: number = 0;

    constructor(private fileSize: number) {}

    get speedKbps(): number {
        return this.speedBps / 1024;
    }

    get speedMbps(): number {
        return this.speedKbps / 1024;
    }

    private _update(): void {
        if (this.endTime !== null && this.startTime !== null) {
            const milliseconds = this.endTime - this.startTime;
            this.duration = milliseconds / 1000;
            const bitsLoaded = this.fileSize * 8;
            // Guard against a zero (or negative, e.g. clock anomalies) duration: dividing by it
            // would otherwise produce Infinity/NaN, which would incorrectly pass the
            // `speedBps > 0` validity filter in SpeedTestService.downloadTest(). Falling back to
            // 0 here keeps the result finite so it is correctly discarded like any other failure.
            this.speedBps = this.duration > 0 ? bitsLoaded / this.duration : 0;
        }
    }

    end(): void {
        if (!this.hasEnded) {
            this.hasEnded = true;
            this.endTime = performance.now();
            this._update();
        }
    }

    error(): void {
        if (!this.hasEnded) {
            this.hasEnded = true;
            this.endTime = null;
            this._update();
        }
    }

    start(): void {
        this.startTime = performance.now();
    }
}
