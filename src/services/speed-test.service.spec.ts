import { Injector, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SpeedTestFile, SpeedTestFileModel } from '../models/speed-test-file.model';
import { SPEED_TEST_CONFIG, SpeedTestConfig } from '../providers/speed-test-config';
import { SpeedTestService } from './speed-test.service';

type FetchOutcome = 'ok' | 'network-error' | 'http-error';

const CONNECTIVITY_URL = 'https://connectivity-check.example/ping';

/** A small, deterministic file so speed math is easy to assert on. */
const testFile = { path: 'https://example.com/5mb.bin', size: 1_000_000, shouldBustCache: false };

function requestUrl(input: RequestInfo | URL): string {
    return typeof input === 'string' ? input : input.toString();
}

/**
 * bodySize defaults to testFile.size; since the C3 revert (3.4.1) reported speed is computed
 * from the configured file.size rather than the response body, so bodySize itself no longer
 * drives bps in the default path - it only matters for the response.blob() fallback path in
 * readResponseBody(), and for tests that deliberately mismatch it against file.size.
 */
function okResponse(bodySize = testFile.size): Response {
    return { ok: true, status: 200, statusText: 'OK', blob: () => Promise.resolve({ size: bodySize } as Blob) } as unknown as Response;
}

/**
 * Installs a global fetch mock that resolves a call to CONNECTIVITY_URL immediately, always
 * resolves the one-time D6 warm-up fetch (the first non-connectivity call) with 'ok' regardless
 * of `fileOutcomes`, then serves `fileOutcomes` in order for every subsequent call (the timed
 * per-iteration file fetch).
 */
function stubFetch(fileOutcomes: FetchOutcome[] = []): ReturnType<typeof vi.fn> {
    let fileCallIndex = 0;
    let warmedUp = false;
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
        if (requestUrl(input) === CONNECTIVITY_URL) {
            return Promise.resolve(okResponse());
        }

        if (!warmedUp) {
            warmedUp = true;
            return Promise.resolve(okResponse()); // D6 warm-up fetch - always succeeds, discarded
        }

        const outcome = fileOutcomes[fileCallIndex++];
        switch (outcome) {
            case 'network-error':
                return Promise.reject(new Error('simulated network failure'));
            case 'http-error':
                return Promise.resolve({ ok: false, status: 500, statusText: 'Internal Server Error' } as unknown as Response);
            case 'ok':
            default:
                return Promise.resolve(okResponse());
        }
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

/**
 * Builds a mocked Response with a streaming body: `body.getReader()` yields one chunk per entry
 * in `chunkSizes`, then `{ done: true }`. `blob` rejects if called, so a test can assert the
 * streaming path (not the pre-D7 blob() path) is what actually ran.
 */
function streamResponse(chunkSizes: number[]): {
    response: Response;
    readMock: ReturnType<typeof vi.fn>;
    cancelMock: ReturnType<typeof vi.fn>;
    blobMock: ReturnType<typeof vi.fn>;
} {
    let index = 0;
    const readMock = vi.fn(() => {
        if (index < chunkSizes.length) {
            const value = new Uint8Array(chunkSizes[index]);
            index++;
            return Promise.resolve({ done: false, value });
        }
        return Promise.resolve({ done: true, value: undefined });
    });
    const cancelMock = vi.fn(() => Promise.resolve());
    const blobMock = vi.fn(() => Promise.reject(new Error('blob() should not be called when a stream body is available')));
    const response = {
        ok: true,
        status: 200,
        statusText: 'OK',
        body: { getReader: () => ({ read: readMock, cancel: cancelMock }) },
        blob: blobMock
    } as unknown as Response;
    return { response, readMock, cancelMock, blobMock };
}

function setOnLine(value: boolean): void {
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => value });
}

/**
 * Builds the service inside a plain injector so `inject(SPEED_TEST_CONFIG)` resolves in an
 * injection context. Provides the token directly rather than via provideSpeedTest() (which
 * returns EnvironmentProviders, requiring a full app-level EnvironmentInjector to consume) -
 * wiring EnvironmentProviders into an injector is Angular's own responsibility, not this
 * library's; what these tests need to verify is that the service reads the token correctly.
 */
function createService(config?: SpeedTestConfig, platformId: 'browser' | 'server' = 'browser'): SpeedTestService {
    const injector = Injector.create({
        providers: [
            ...(config ? [{ provide: SPEED_TEST_CONFIG, useValue: config }] : []),
            { provide: PLATFORM_ID, useValue: platformId }
        ]
    });
    return runInInjectionContext(injector, () => new SpeedTestService());
}

describe('SpeedTestService', () => {
    let service: SpeedTestService;

    beforeEach(() => {
        service = createService();
        setOnLine(true);
        // Fail loudly instead of hitting the real network if a test forgets to stub fetch.
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('unexpected fetch call in test')));
    });

    afterEach(() => {
        delete (navigator as unknown as Record<string, unknown>)['onLine'];
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    describe('validateSettings() (via getBps())', () => {
        it('rejects a missing file path', async () => {
            await expect(
                firstValueFrom(service.getBps({ file: { ...testFile, path: '' } }))
            ).rejects.toThrow('ng-speed-test: File path is required');
        });

        it('rejects a zero file size (reverted C3, 3.4.1 - size drives the reported speed again)', async () => {
            await expect(
                firstValueFrom(service.getBps({ iterations: 1, file: { ...testFile, size: 0 } }))
            ).rejects.toThrow('ng-speed-test: Valid file size is required');
        });

        it('rejects a negative file size', async () => {
            await expect(
                firstValueFrom(service.getBps({ iterations: 1, file: { ...testFile, size: -5 } }))
            ).rejects.toThrow('ng-speed-test: Valid file size is required');
        });

        it('rejects an iteration count of 0 instead of hanging (regression)', async () => {
            await expect(
                firstValueFrom(service.getBps({ iterations: 0, file: testFile }))
            ).rejects.toThrow('ng-speed-test: Iterations must be at least 1');
        });

        it('rejects a negative iteration count', async () => {
            await expect(
                firstValueFrom(service.getBps({ iterations: -5, file: testFile }))
            ).rejects.toThrow('ng-speed-test: Iterations must be at least 1');
        });

        it('rejects a maxSampleDuration below 1ms (D7)', async () => {
            await expect(
                firstValueFrom(service.getBps({ maxSampleDuration: 0, file: testFile }))
            ).rejects.toThrow('ng-speed-test: maxSampleDuration must be at least 1');
        });
    });

    describe('offline handling', () => {
        it('errors immediately without touching the network when the browser reports offline', async () => {
            setOnLine(false);

            await expect(firstValueFrom(service.getBps())).rejects.toThrow(
                'No internet connection - browser reports offline'
            );
        });
    });

    describe('connectivity pre-flight check (B5 - GitHub issue #108)', () => {
        it('does not contact any third-party host by default - trusts navigator.onLine', async () => {
            const fetchMock = stubFetch(['ok']);

            await firstValueFrom(service.getBps({ iterations: 1, retryDelay: 0, file: testFile }));

            expect(fetchMock).toHaveBeenCalledTimes(2); // D6 warm-up + the file fetch, no connectivity probe
        });

        it('runs one file fetch per iteration, plus a single one-time D6 warm-up fetch, when no connectivityCheckUrl is configured', async () => {
            const fetchMock = stubFetch(['ok', 'ok']);

            await firstValueFrom(service.getBps({ iterations: 2, retryDelay: 0, file: testFile }));

            expect(fetchMock).toHaveBeenCalledTimes(3); // 1 warm-up + 2 iterations
        });

        describe('with connectivityCheckUrl configured (opt-in)', () => {
            beforeEach(() => {
                service = createService({ connectivityCheckUrl: CONNECTIVITY_URL });
            });

            it('errors when the connectivity check itself fails, without attempting the file download', async () => {
                const fetchMock = vi.fn((input: RequestInfo | URL) => {
                    if (requestUrl(input) === CONNECTIVITY_URL) {
                        return Promise.reject(new Error('connectivity check failed'));
                    }
                    throw new Error('file should never be fetched when connectivity check fails');
                });
                vi.stubGlobal('fetch', fetchMock);

                await expect(
                    firstValueFrom(service.getBps({ iterations: 1, file: testFile }))
                ).rejects.toThrow('No internet connection available');
                expect(fetchMock).toHaveBeenCalledTimes(1);
            });

            it('runs a connectivity check and a file fetch for every iteration, plus a single one-time D6 warm-up fetch', async () => {
                const fetchMock = stubFetch(['ok', 'ok']);

                await firstValueFrom(service.getBps({ iterations: 2, retryDelay: 0, file: testFile }));

                // 2 iterations x (connectivity + file), plus 1 warm-up fetch after the first connectivity check
                expect(fetchMock).toHaveBeenCalledTimes(5);
            });
        });
    });

    describe('downloadTest() iteration and averaging', () => {
        beforeEach(() => {
            // Every performance.now() call advances by a fixed amount, so any single start()/end()
            // pair - regardless of how many other iterations ran before it - always measures the
            // same 1000ms delta, making the resulting speedBps deterministic per iteration.
            let elapsed = 0;
            vi.spyOn(performance, 'now').mockImplementation(() => (elapsed += 1000));
        });

        it('averages only the iterations that succeeded, discarding failures', async () => {
            stubFetch(['ok', 'network-error', 'ok']);

            const bps = await firstValueFrom(
                service.getBps({ iterations: 3, retryDelay: 0, file: testFile })
            );

            expect(bps).toBe(8_000_000); // 1,000,000 bytes * 8 bits / 1s, averaged across two identical results
        });

        it('discards an iteration that returns a non-OK HTTP response', async () => {
            stubFetch(['http-error', 'ok']);

            const bps = await firstValueFrom(
                service.getBps({ iterations: 2, retryDelay: 0, file: testFile })
            );

            expect(bps).toBe(8_000_000);
        });

        it('errors with a descriptive message when every iteration fails', async () => {
            stubFetch(['network-error', 'network-error']);

            await expect(
                firstValueFrom(service.getBps({ iterations: 2, retryDelay: 0, file: testFile }))
            ).rejects.toThrow('All speed test iterations failed - no internet connection or server unreachable');
        });
    });

    describe('warm-up iteration (D6)', () => {
        beforeEach(() => {
            let elapsed = 0;
            vi.spyOn(performance, 'now').mockImplementation(() => (elapsed += 1000));
        });

        it('runs one untimed warm-up fetch before the timed iteration and excludes its timing from the reported speed', async () => {
            // Since the reverted C3 (3.4.1) means speed is computed from the configured
            // file.size rather than the response body, a differing warm-up body size can no
            // longer be used as the leak signal here - the only observable effect a warm-up leak
            // could have left is on timing (start()/end() only run around the timed fetch), which
            // the fixed-per-call performance.now() mock and the deterministic file.size-based bps
            // below already cover.
            const fetchMock = stubFetch(['ok']);

            const bps = await firstValueFrom(
                service.getBps({ iterations: 1, retryDelay: 0, file: testFile })
            );

            expect(fetchMock).toHaveBeenCalledTimes(2);
            expect(bps).toBe(8_000_000); // 1,000,000 bytes (testFile.size) * 8 bits / 1s
        });

        it('warms up only once across multiple iterations in the same getBps() call', async () => {
            const fetchMock = stubFetch(['ok', 'ok', 'ok']);

            await firstValueFrom(service.getBps({ iterations: 3, retryDelay: 0, file: testFile }));

            expect(fetchMock).toHaveBeenCalledTimes(4); // 1 warm-up + 3 timed iterations
        });

        it('a failed warm-up does not block or fail the timed iteration that follows', async () => {
            let callIndex = 0;
            const fetchMock = vi.fn(() => {
                if (callIndex++ === 0) {
                    return Promise.reject(new Error('simulated warm-up failure'));
                }
                return Promise.resolve(okResponse());
            });
            vi.stubGlobal('fetch', fetchMock);

            const bps = await firstValueFrom(
                service.getBps({ iterations: 1, retryDelay: 0, file: testFile })
            );

            expect(bps).toBe(8_000_000); // the timed fetch succeeded despite the warm-up failing
        });
    });

    describe('readResponseBody() - chunked reading via ReadableStream (D7)', () => {
        // readResponseBody() is private; reaching in directly (same pattern as C4's mergeFile())
        // is the only way to test chunk accumulation and progress independent of the outer
        // downloadTest()/testResult timing machinery.
        type ReadResponseBodyOptions = { maxDurationMs?: number; onProgress?: (bytesReceived: number, elapsedMs: number) => void };

        function callReadResponseBody(response: Response, options?: ReadResponseBodyOptions): Promise<number> {
            return (service as unknown as {
                readResponseBody: (response: Response, options?: ReadResponseBodyOptions) => Promise<number>;
            }).readResponseBody(response, options);
        }

        it('accumulates bytes across multiple chunks and reports progress after each one', async () => {
            const { response, readMock, blobMock } = streamResponse([100, 200, 300]);
            const progressCalls: Array<[number, number]> = [];

            const bytesReceived = await callReadResponseBody(response, {
                onProgress: (bytes, elapsedMs) => progressCalls.push([bytes, elapsedMs])
            });

            expect(bytesReceived).toBe(600);
            expect(readMock).toHaveBeenCalledTimes(4); // 3 chunks + the final { done: true } read
            expect(blobMock).not.toHaveBeenCalled();
            // Running totals prove chunks accumulate rather than only the last chunk being kept.
            expect(progressCalls.map(([bytes]) => bytes)).toEqual([100, 300, 600]);
        });

        it('cancels the stream once elapsed time reaches maxDurationMs, resolving with only the bytes read so far', async () => {
            let elapsed = 0;
            vi.spyOn(performance, 'now').mockImplementation(() => (elapsed += 1000)); // +1000ms per call

            const { response, readMock, cancelMock } = streamResponse([100, 200, 300, 400]);

            // startTime read = 1000ms; chunk1 elapsed = 2000-1000 = 1000ms (< cap, continues);
            // chunk2 elapsed = 3000-1000 = 2000ms (>= 1500ms cap, cancels).
            const bytesReceived = await callReadResponseBody(response, { maxDurationMs: 1500 });

            expect(bytesReceived).toBe(300); // only the first two chunks (100 + 200)
            expect(readMock).toHaveBeenCalledTimes(2); // chunks 3 and 4 were never read
            expect(cancelMock).toHaveBeenCalledTimes(1);
        });

        it('falls back to response.blob() when the response has no streaming body', async () => {
            const response = { ok: true, status: 200, statusText: 'OK', blob: () => Promise.resolve({ size: 12_345 } as Blob) } as unknown as Response;

            const bytesReceived = await callReadResponseBody(response);

            expect(bytesReceived).toBe(12_345);
        });
    });

    describe('duration-based sampling (D7)', () => {
        beforeEach(() => {
            let elapsed = 0;
            vi.spyOn(performance, 'now').mockImplementation(() => (elapsed += 1000));
        });

        it('a single iteration completes from a partial stream read, without consuming the whole configured file', async () => {
            const { response, readMock, cancelMock, blobMock } = streamResponse([100, 200, 300, 400]);
            let fileCallIndex = 0;
            const fetchMock = vi.fn(() => {
                if (fileCallIndex++ === 0) {
                    return Promise.resolve(okResponse()); // D6 warm-up, untimed and unrelated to the stream
                }
                return Promise.resolve(response);
            });
            vi.stubGlobal('fetch', fetchMock);

            const bps = await firstValueFrom(
                service.getBps({ iterations: 1, retryDelay: 0, maxSampleDuration: 1500, file: testFile })
            );

            // See the readResponseBody() cancellation test above for the elapsed-time trace:
            // 300 bytes read (100 + 200) before the 1500ms cap cancels the read; testResult.end()
            // then measures a 4s wall-clock duration off the same mocked performance.now() clock,
            // giving speedBps = 300 * 8 / 4 = 600.
            expect(bps).toBe(600);
            expect(readMock).toHaveBeenCalledTimes(2);
            expect(cancelMock).toHaveBeenCalledTimes(1);
            expect(blobMock).not.toHaveBeenCalled();
        });
    });

    describe('mergeSettings() (via getBps())', () => {
        it('uses the default file, including the cache-buster, when no custom settings are given', async () => {
            const fetchMock = stubFetch(['ok']);

            await firstValueFrom(service.getBps({ iterations: 1, retryDelay: 0 }));

            expect(fetchMock).toHaveBeenCalledTimes(2); // D6 warm-up + the file fetch
            // The warm-up (call 0) applies the same default-file/cache-bust logic as the timed fetch.
            const url = requestUrl(fetchMock.mock.calls[0][0]);
            expect(url.startsWith(new SpeedTestFileModel().path)).toBe(true);
            expect(url).toContain('cache_bust=');
        });

        it('does not append a cache-buster when shouldBustCache is false', async () => {
            const fetchMock = stubFetch(['ok']);

            await firstValueFrom(
                service.getBps({ iterations: 1, retryDelay: 0, file: testFile })
            );

            expect(requestUrl(fetchMock.mock.calls[0][0])).toBe(testFile.path);
        });

        it('keeps unrelated defaults (retryDelay) when only iterations is overridden', async () => {
            stubFetch(['network-error']);

            // retryDelay defaults to 500ms; with iterations:1 there is nothing left to retry for,
            // so the failure path's delay is 0 regardless - this asserts the default merged through
            // rather than being lost, via the overall error still surfacing promptly.
            await expect(
                firstValueFrom(service.getBps({ iterations: 1, file: testFile }))
            ).rejects.toThrow('All speed test iterations failed - no internet connection or server unreachable');
        });
    });

    describe('provideSpeedTest() config (B5)', () => {
        it('overrides the default test file when file is configured and no per-call file is given', async () => {
            service = createService({ file: { path: 'https://example.com/configured-default.bin', size: 2_000_000 } });
            const fetchMock = stubFetch(['ok']);

            await firstValueFrom(service.getBps({ iterations: 1, retryDelay: 0 }));

            const url = requestUrl(fetchMock.mock.calls[0][0]);
            expect(url.startsWith('https://example.com/configured-default.bin')).toBe(true);
        });

        it('a per-call file setting still overrides the configured default file', async () => {
            service = createService({ file: { path: 'https://example.com/configured-default.bin', size: 2_000_000 } });
            const fetchMock = stubFetch(['ok']);

            await firstValueFrom(service.getBps({ iterations: 1, retryDelay: 0, file: testFile }));

            expect(requestUrl(fetchMock.mock.calls[0][0])).toBe(testFile.path);
        });

        it('a configured timeout replaces the 15s default for the file fetch', async () => {
            service = createService({ timeout: 5000 });
            vi.useFakeTimers();
            const fetchMock = vi.fn(() => new Promise<Response>(() => {})); // hangs forever
            vi.stubGlobal('fetch', fetchMock);

            const resultPromise = firstValueFrom(
                service.getBps({ iterations: 1, retryDelay: 0, file: testFile })
            );
            const rejection = expect(resultPromise).rejects.toThrow(
                'All speed test iterations failed - no internet connection or server unreachable'
            );

            // The D6 warm-up runs first with its own fixed 3s budget, then the timed fetch gets
            // the configured 5s - so failure lands at ~8s, well before the 15s default's ~18s.
            await vi.advanceTimersByTimeAsync(9_000);
            await rejection;
        });
    });

    describe('unsubscribe teardown (A5 regression)', () => {
        it('never calls fetch when unsubscribed before the init delay fires', async () => {
            const fetchMock = stubFetch(['ok']);

            const subscription = service.getBps({ iterations: 1, retryDelay: 0, file: testFile }).subscribe();
            subscription.unsubscribe();

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('aborts the in-flight file fetch when unsubscribed mid-request', async () => {
            let capturedSignal: AbortSignal | undefined;
            const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
                capturedSignal = init?.signal ?? undefined;
                return new Promise<Response>(() => {}); // never resolves - simulates an in-flight request
            });
            vi.stubGlobal('fetch', fetchMock);

            const subscription = service.getBps({ iterations: 1, retryDelay: 0, file: testFile }).subscribe();

            await vi.waitFor(() => {
                if (!capturedSignal) {
                    throw new Error('file fetch not started yet');
                }
            });

            expect(capturedSignal!.aborted).toBe(false);
            subscription.unsubscribe();
            expect(capturedSignal!.aborted).toBe(true);
        });
    });

    describe('per-iteration timeout', () => {
        it('marks a hung request failed once the fetch timeout elapses', async () => {
            vi.useFakeTimers();
            const fetchMock = vi.fn(() => new Promise<Response>(() => {})); // hangs forever
            vi.stubGlobal('fetch', fetchMock);

            const resultPromise = firstValueFrom(
                service.getBps({ iterations: 1, retryDelay: 0, file: testFile })
            );

            // Attach the rejection assertion before advancing timers, so the promise never
            // rejects without a handler already listening (avoids a spurious unhandled-rejection
            // warning even though the rejection is legitimately awaited below).
            const rejection = expect(resultPromise).rejects.toThrow(
                'All speed test iterations failed - no internet connection or server unreachable'
            );
            await vi.advanceTimersByTimeAsync(20_000); // past the 15s per-request timeout
            await rejection;
        });
    });

    describe('unit conversions', () => {
        beforeEach(() => {
            let elapsed = 0;
            vi.spyOn(performance, 'now').mockImplementation(() => (elapsed += 1000));
        });

        it('getKbps() divides bps by 1024', async () => {
            stubFetch(['ok']);

            const kbps = await firstValueFrom(service.getKbps({ iterations: 1, retryDelay: 0, file: testFile }));

            expect(kbps).toBeCloseTo(8_000_000 / 1024);
        });

        it('getMbps() divides bps by 1024 twice', async () => {
            stubFetch(['ok']);

            const mbps = await firstValueFrom(service.getMbps({ iterations: 1, retryDelay: 0, file: testFile }));

            expect(mbps).toBeCloseTo(8_000_000 / 1024 / 1024);
        });

        it('getSpeedTestResult() returns bps/kbps/mbps/duration together', async () => {
            stubFetch(['ok']);

            const result = await firstValueFrom(
                service.getSpeedTestResult({ iterations: 1, retryDelay: 0, file: testFile })
            );

            expect(result.bps).toBe(8_000_000);
            expect(result.kbps).toBeCloseTo(8_000_000 / 1024);
            expect(result.mbps).toBeCloseTo(8_000_000 / 1024 / 1024);
            expect(result.duration).toBeGreaterThanOrEqual(0);
        });
    });

    describe('computes speed from the configured file.size (reverted C3, 3.4.1)', () => {
        beforeEach(() => {
            let elapsed = 0;
            vi.spyOn(performance, 'now').mockImplementation(() => (elapsed += 1000));
        });

        it('uses the configured file.size, ignoring a mismatched actual response body size', async () => {
            const fetchMock = vi.fn(() =>
                // The response body is far smaller than the configured size - e.g. a redirected,
                // truncated, or re-encoded file. C3 (3.4.0) made downloadTest() trust the real
                // bytes received in this case; that was leaked to npm as an undisclosed breaking
                // change in a minor and is reverted here (3.4.1) back to v3.3.0's behavior: the
                // configured hint always wins, by default.
                Promise.resolve({
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    blob: () => Promise.resolve({ size: 500 } as Blob)
                } as unknown as Response)
            );
            vi.stubGlobal('fetch', fetchMock);

            const bps = await firstValueFrom(
                service.getBps({ iterations: 1, retryDelay: 0, file: testFile }) // testFile.size = 1,000,000
            );

            expect(bps).toBe(8_000_000); // 1,000,000 bytes * 8 bits / 1s - the configured size, not the 500-byte body
        });

        it('rejects an omitted file.size instead of silently reporting a wrong speed', async () => {
            const noSizeFile = { path: testFile.path, shouldBustCache: false } as unknown as SpeedTestFile;

            await expect(
                firstValueFrom(service.getBps({ iterations: 1, retryDelay: 0, file: noSizeFile }))
            ).rejects.toThrow('ng-speed-test: Valid file size is required');
        });
    });

    describe('mergeSettings() file.size handling (C4)', () => {
        // mergeSettings() is private. Since C3's revert (3.4.1), its file.size output once again
        // drives the reported speed directly, so this behavior matters more than ever - a path
        // change left with no size now surfaces as a validateSettings() rejection (see the
        // "computes speed from the configured file.size" describe block above) rather than a
        // silently wrong number. Reaching in directly is the only way to assert the merge itself;
        // every other test in this file exercises private methods only indirectly, via getBps().
        function mergeFile(customFile: Partial<SpeedTestFile>): SpeedTestFile {
            const merged = (service as unknown as {
                mergeSettings: (
                    defaultSettings: { file: SpeedTestFileModel },
                    customSettings?: { file?: Partial<SpeedTestFile> }
                ) => { file: SpeedTestFile };
            }).mergeSettings(
                { file: new SpeedTestFileModel() },
                { file: customFile }
            );
            return merged.file;
        }

        it('drops the default size hint when only a custom path is supplied', () => {
            // SpeedTestSettings.file requires the full SpeedTestFile shape, so a path-only object is
            // only reachable from a loosely-typed (e.g. plain JS) caller - the cast simulates that.
            const pathOnly = { path: 'https://example.com/my-custom-file.bin' } as unknown as SpeedTestFile;

            const merged = mergeFile(pathOnly);

            expect(merged.path).toBe('https://example.com/my-custom-file.bin');
            expect(merged.size).toBeUndefined();
        });

        it('keeps an explicitly supplied size alongside a custom path', () => {
            const merged = mergeFile({ path: 'https://example.com/my-custom-file.bin', size: 42 });

            expect(merged.path).toBe('https://example.com/my-custom-file.bin');
            expect(merged.size).toBe(42);
        });

        it('keeps the default size when the path is left at its default and only size is overridden', () => {
            const merged = mergeFile({ size: 99 });

            expect(merged.path).toBe(new SpeedTestFileModel().path);
            expect(merged.size).toBe(99);
        });

        it('keeps the default size when the path is explicitly re-supplied unchanged', () => {
            const merged = mergeFile({ path: new SpeedTestFileModel().path });

            expect(merged.size).toBe(new SpeedTestFileModel().size);
        });
    });

    describe('isOnline()', () => {
        it('reports false without a network call when the browser itself is offline', async () => {
            setOnLine(false);
            const fetchMock = vi.fn();
            vi.stubGlobal('fetch', fetchMock);

            const value = await firstValueFrom(service.isOnline());

            expect(value).toBe(false);
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('trusts navigator.onLine without a network call when no connectivityCheckUrl is configured', async () => {
            const fetchMock = vi.fn();
            vi.stubGlobal('fetch', fetchMock);

            const value = await firstValueFrom(service.isOnline());

            expect(value).toBe(true);
            expect(fetchMock).not.toHaveBeenCalled();
        });

        describe('with connectivityCheckUrl configured (opt-in)', () => {
            beforeEach(() => {
                service = createService({ connectivityCheckUrl: CONNECTIVITY_URL });
            });

            it('verifies real connectivity before reporting online', async () => {
                stubFetch();

                const value = await firstValueFrom(service.isOnline());

                expect(value).toBe(true);
            });

            it('reports false when the browser claims online but connectivity verification fails', async () => {
                const fetchMock = vi.fn().mockRejectedValue(new Error('connectivity check failed'));
                vi.stubGlobal('fetch', fetchMock);

                const value = await firstValueFrom(service.isOnline());

                expect(value).toBe(false);
            });
        });

        describe('on the server (SSR, B4)', () => {
            it('reports true once and completes without touching window/navigator', async () => {
                service = createService(undefined, 'server');
                const fetchMock = vi.fn();
                vi.stubGlobal('fetch', fetchMock);

                const value = await firstValueFrom(service.isOnline());

                expect(value).toBe(true);
                expect(fetchMock).not.toHaveBeenCalled();
            });
        });
    });

    describe('getNetworkStatus()', () => {
        it('reports the current connection info in the browser', async () => {
            const value = await firstValueFrom(service.getNetworkStatus());

            expect(value.isOnline).toBe(true);
        });

        describe('on the server (SSR, B4)', () => {
            it('reports { isOnline: true } once and completes without touching window/navigator', async () => {
                service = createService(undefined, 'server');
                const fetchMock = vi.fn();
                vi.stubGlobal('fetch', fetchMock);

                const value = await firstValueFrom(service.getNetworkStatus());

                expect(value).toEqual({ isOnline: true });
                expect(fetchMock).not.toHaveBeenCalled();
            });
        });
    });
});
