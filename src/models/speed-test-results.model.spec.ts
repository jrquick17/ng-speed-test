import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SpeedTestResultsModel } from './speed-test-results.model';

describe('SpeedTestResultsModel', () => {
    const FILE_SIZE = 1_000_000; // bytes -> 8,000,000 bits

    beforeEach(() => {
        vi.spyOn(performance, 'now');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('starts with zeroed/unset defaults', () => {
        const result = new SpeedTestResultsModel(FILE_SIZE);

        expect(result.hasEnded).toBe(false);
        expect(result.startTime).toBeNull();
        expect(result.endTime).toBeNull();
        expect(result.duration).toBe(0);
        expect(result.speedBps).toBe(0);
    });

    it('computes duration and speed from the elapsed time between start() and end()', () => {
        vi.mocked(performance.now).mockReturnValueOnce(1000).mockReturnValueOnce(2000);

        const result = new SpeedTestResultsModel(FILE_SIZE);
        result.start();
        result.end();

        expect(result.startTime).toBe(1000);
        expect(result.endTime).toBe(2000);
        expect(result.duration).toBe(1); // 1000ms -> 1s
        expect(result.speedBps).toBe(8_000_000); // 8,000,000 bits / 1s
        expect(result.hasEnded).toBe(true);
    });

    it('derives speedKbps/speedMbps from speedBps using binary (1024) division', () => {
        vi.mocked(performance.now).mockReturnValueOnce(0).mockReturnValueOnce(1000);

        const result = new SpeedTestResultsModel(FILE_SIZE);
        result.start();
        result.end();

        expect(result.speedKbps).toBeCloseTo(result.speedBps / 1024);
        expect(result.speedMbps).toBeCloseTo(result.speedBps / 1024 / 1024);
    });

    it('falls back to a speed of 0 instead of Infinity when the duration is zero', () => {
        vi.mocked(performance.now).mockReturnValueOnce(500).mockReturnValueOnce(500);

        const result = new SpeedTestResultsModel(FILE_SIZE);
        result.start();
        result.end();

        expect(result.duration).toBe(0);
        expect(result.speedBps).toBe(0);
        expect(Number.isFinite(result.speedBps)).toBe(true);
    });

    it('ignores a second end() call once already ended', () => {
        vi.mocked(performance.now)
            .mockReturnValueOnce(1000) // start()
            .mockReturnValueOnce(2000); // first end()

        const result = new SpeedTestResultsModel(FILE_SIZE);
        result.start();
        result.end();
        result.end(); // performance.now() would return 3000 here if called again

        expect(result.endTime).toBe(2000);
        expect(result.speedBps).toBe(8_000_000);
    });

    it('error() marks the iteration ended with a null endTime and a discardable speed of 0', () => {
        vi.mocked(performance.now).mockReturnValueOnce(1000);

        const result = new SpeedTestResultsModel(FILE_SIZE);
        result.start();
        result.error();

        expect(result.hasEnded).toBe(true);
        expect(result.endTime).toBeNull();
        expect(result.duration).toBe(0);
        expect(result.speedBps).toBe(0);
    });

    it('ignores error() once already ended by a successful end()', () => {
        vi.mocked(performance.now).mockReturnValueOnce(1000).mockReturnValueOnce(2000);

        const result = new SpeedTestResultsModel(FILE_SIZE);
        result.start();
        result.end();
        result.error();

        expect(result.endTime).toBe(2000);
        expect(result.speedBps).toBe(8_000_000);
    });
});
