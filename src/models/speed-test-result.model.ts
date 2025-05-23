export interface SpeedTestResults {
    duration: number;
    hasEnded: boolean;
    startTime: number | null;
    endTime: number | null;
    speedBps: number;
    speedKbps: number;
    speedMbps: number;
}
