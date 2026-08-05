export interface SpeedTestResults {
    duration: number;
    hasEnded: boolean;
    startTime: number | null;
    endTime: number | null;
    bytesReceived: number;
    speedBps: number;
    speedKbps: number;
    speedMbps: number;
}

export class SpeedTestResultsModel implements SpeedTestResults {
    public duration: number = 0;
    public hasEnded: boolean = false;
    public startTime: number | null = null;
    public endTime: number | null = null;
    public bytesReceived: number = 0;
    public speedBps: number = 0;

    constructor(private fileSize: number) {}

    get speedKbps(): number {
        return this.speedBps / 1024;
    }

    get speedMbps(): number {
        return this.speedKbps / 1024;
    }

    private _update(bytesLoaded: number): void {
        if (this.endTime !== null && this.startTime !== null) {
            const milliseconds = this.endTime - this.startTime;
            this.duration = milliseconds / 1000;
            const bitsLoaded = bytesLoaded * 8;
            // Guard against a zero (or negative, e.g. clock anomalies) duration: dividing by it
            // would otherwise produce Infinity/NaN, which would incorrectly pass the
            // `speedBps > 0` validity filter in SpeedTestService.downloadTest(). Falling back to
            // 0 here keeps the result finite so it is correctly discarded like any other failure.
            this.speedBps = this.duration > 0 ? bitsLoaded / this.duration : 0;
        }
    }

    /**
     * Reverting C3 (3.4.1): speed is once again computed from the configured `fileSize` by
     * default, matching v3.3.0 exactly - `end()` with no argument (every call site except the
     * one below) behaves identically to pre-3.4.0.
     *
     * `bytesReceived`, if passed, is used instead. This one exception exists only to support
     * `maxSampleDuration` (D7, not part of C3, kept on purpose): when a read is cancelled early,
     * `fileSize` describes the whole configured file, not what was actually sampled, so dividing
     * by it would wildly overstate speed. Only the caller opting into `maxSampleDuration` passes
     * a value here; everyone else keeps the reverted, file-size-based behavior unchanged.
     */
    end(bytesReceived?: number): void {
        if (!this.hasEnded) {
            this.hasEnded = true;
            this.bytesReceived = bytesReceived !== undefined ? bytesReceived : this.fileSize;
            this.endTime = performance.now();
            this._update(this.bytesReceived);
        }
    }

    error(): void {
        if (!this.hasEnded) {
            this.hasEnded = true;
            this.endTime = null;
            this._update(this.bytesReceived);
        }
    }

    start(): void {
        this.startTime = performance.now();
    }
}
