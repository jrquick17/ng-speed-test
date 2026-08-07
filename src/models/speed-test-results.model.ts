export interface SpeedTestResults {
    duration: number;
    hasEnded: boolean;
    startTime: number | null;
    endTime: number | null;
    bytesReceived: number;
    speedBps: number;
    speedKbps: number;
    speedMbps: number;
    latencyMs: number | null;
}

export class SpeedTestResultsModel implements SpeedTestResults {
    public duration: number = 0;
    public hasEnded: boolean = false;
    public startTime: number | null = null;
    public endTime: number | null = null;
    public bytesReceived: number = 0;
    public speedBps: number = 0;
    public latencyMs: number | null = null;

    get speedKbps(): number {
        return this.speedBps / 1000;
    }

    get speedMbps(): number {
        return this.speedKbps / 1000;
    }

    private _update(): void {
        if (this.endTime !== null && this.startTime !== null) {
            const milliseconds = this.endTime - this.startTime;
            this.duration = milliseconds / 1000;
            const bitsLoaded = this.bytesReceived * 8;
            // Guard against a zero (or negative, e.g. clock anomalies) duration: dividing by it
            // would otherwise produce Infinity/NaN, which would incorrectly pass the
            // `speedBps > 0` validity filter in SpeedTestService.downloadTest(). Falling back to
            // 0 here keeps the result finite so it is correctly discarded like any other failure.
            this.speedBps = this.duration > 0 ? bitsLoaded / this.duration : 0;
        }
    }

    /**
     * bytesReceived is the actual response body size (e.g. Blob.size, or the accumulated total
     * from readResponseBody()), not the configured file.size hint. Speed is always computed from
     * this - a redirected, re-encoded, truncated, or otherwise changed file reports its real
     * speed instead of a confidently wrong number derived from the configured hint (C3, re-applied
     * for real in 4.0.0 after first landing in error as an undisclosed breaking change in 3.4.0
     * and being reverted in 3.4.1 - see CHANGELOG.md).
     */
    end(bytesReceived: number): void {
        if (!this.hasEnded) {
            this.hasEnded = true;
            this.bytesReceived = bytesReceived;
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

    /**
     * Records latency (time-to-first-byte, D9): the elapsed time between start() and the moment
     * the response arrives - i.e. right after fetch()'s promise resolves with a Response, before
     * the body is read. Deliberately separate from end()/error() so it still gets recorded for an
     * iteration that fails with a non-OK HTTP status (headers did arrive) but not for one that
     * fails before a response is ever received (a network error). No-op if start() was never
     * called, or if latency was already recorded once.
     */
    firstByte(): void {
        if (this.startTime !== null && this.latencyMs === null) {
            this.latencyMs = performance.now() - this.startTime;
        }
    }
}
