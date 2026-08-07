import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SpeedTestResultsModel } from './speed-test-results.model';

describe('SpeedTestResultsModel', () => {
    const BYTES_RECEIVED = 1_000_000; // bytes -> 8,000,000 bits

    beforeEach(() => {
        vi.spyOn(performance, 'now');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('starts with zeroed/unset defaults', () => {
        const result = new SpeedTestResultsModel();

        expect(result.hasEnded).toBe(false);
        expect(result.startTime).toBeNull();
        expect(result.endTime).toBeNull();
        expect(result.duration).toBe(0);
        expect(result.bytesReceived).toBe(0);
        expect(result.speedBps).toBe(0);
    });

    it('computes duration and speed from the elapsed time between start() and end(), using the bytes actually received (C3)', () => {
        vi.mocked(performance.now).mockReturnValueOnce(1000).mockReturnValueOnce(2000);

        const result = new SpeedTestResultsModel();
        result.start();
        result.end(BYTES_RECEIVED);

        expect(result.startTime).toBe(1000);
        expect(result.endTime).toBe(2000);
        expect(result.duration).toBe(1); // 1000ms -> 1s
        expect(result.bytesReceived).toBe(BYTES_RECEIVED);
        expect(result.speedBps).toBe(8_000_000); // 8,000,000 bits / 1s
        expect(result.hasEnded).toBe(true);
    });

    it('derives speedKbps/speedMbps from speedBps using decimal (1000) division (C2)', () => {
        vi.mocked(performance.now).mockReturnValueOnce(0).mockReturnValueOnce(1000);

        const result = new SpeedTestResultsModel();
        result.start();
        result.end(BYTES_RECEIVED);

        expect(result.speedKbps).toBeCloseTo(result.speedBps / 1000);
        expect(result.speedMbps).toBeCloseTo(result.speedBps / 1000 / 1000);
    });

    it('falls back to a speed of 0 instead of Infinity when the duration is zero', () => {
        vi.mocked(performance.now).mockReturnValueOnce(500).mockReturnValueOnce(500);

        const result = new SpeedTestResultsModel();
        result.start();
        result.end(BYTES_RECEIVED);

        expect(result.duration).toBe(0);
        expect(result.speedBps).toBe(0);
        expect(Number.isFinite(result.speedBps)).toBe(true);
    });

    it('ignores a second end() call once already ended', () => {
        vi.mocked(performance.now)
            .mockReturnValueOnce(1000) // start()
            .mockReturnValueOnce(2000); // first end()

        const result = new SpeedTestResultsModel();
        result.start();
        result.end(BYTES_RECEIVED);
        result.end(500); // performance.now() would return 3000 here if called again

        expect(result.endTime).toBe(2000);
        expect(result.bytesReceived).toBe(BYTES_RECEIVED);
        expect(result.speedBps).toBe(8_000_000);
    });

    it('error() marks the iteration ended with a null endTime and a discardable speed of 0', () => {
        vi.mocked(performance.now).mockReturnValueOnce(1000);

        const result = new SpeedTestResultsModel();
        result.start();
        result.error();

        expect(result.hasEnded).toBe(true);
        expect(result.endTime).toBeNull();
        expect(result.duration).toBe(0);
        expect(result.speedBps).toBe(0);
    });

    it('ignores error() once already ended by a successful end()', () => {
        vi.mocked(performance.now).mockReturnValueOnce(1000).mockReturnValueOnce(2000);

        const result = new SpeedTestResultsModel();
        result.start();
        result.end(BYTES_RECEIVED);
        result.error();

        expect(result.endTime).toBe(2000);
        expect(result.speedBps).toBe(8_000_000);
    });

    describe('firstByte() - latency / time-to-first-byte (D9)', () => {
        it('records the elapsed time between start() and firstByte()', () => {
            vi.mocked(performance.now).mockReturnValueOnce(1000).mockReturnValueOnce(1250);

            const result = new SpeedTestResultsModel();
            result.start();
            result.firstByte();

            expect(result.latencyMs).toBe(250);
        });

        it('is a no-op if start() was never called', () => {
            const result = new SpeedTestResultsModel();
            result.firstByte();

            expect(result.latencyMs).toBeNull();
            expect(performance.now).not.toHaveBeenCalled();
        });

        it('ignores a second firstByte() call, keeping the first recorded value', () => {
            vi.mocked(performance.now)
                .mockReturnValueOnce(1000) // start()
                .mockReturnValueOnce(1250); // first firstByte()

            const result = new SpeedTestResultsModel();
            result.start();
            result.firstByte();
            result.firstByte(); // performance.now() would return a later value here if called again

            expect(result.latencyMs).toBe(250);
        });

        it('does not affect duration/speedBps - end() still measures start() to end()', () => {
            vi.mocked(performance.now)
                .mockReturnValueOnce(1000) // start()
                .mockReturnValueOnce(1250) // firstByte()
                .mockReturnValueOnce(2000); // end()

            const result = new SpeedTestResultsModel();
            result.start();
            result.firstByte();
            result.end(BYTES_RECEIVED);

            expect(result.latencyMs).toBe(250);
            expect(result.duration).toBe(1); // 2000 - 1000, unaffected by the firstByte() call in between
            expect(result.speedBps).toBe(8_000_000);
        });

        it('still records latency for a response that later fails via error() (e.g. a non-OK HTTP status)', () => {
            vi.mocked(performance.now)
                .mockReturnValueOnce(1000) // start()
                .mockReturnValueOnce(1300); // firstByte() - headers arrived before the failure

            const result = new SpeedTestResultsModel();
            result.start();
            result.firstByte();
            result.error();

            expect(result.latencyMs).toBe(300);
            expect(result.speedBps).toBe(0); // still discarded from bps aggregation
        });
    });
});
