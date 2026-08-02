import { Injector, runInInjectionContext } from '@angular/core';
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

function okResponse(): Response {
    return { ok: true, status: 200, statusText: 'OK', blob: () => Promise.resolve({} as Blob) } as unknown as Response;
}

/**
 * Installs a global fetch mock that resolves a call to CONNECTIVITY_URL immediately and serves
 * `fileOutcomes` in order for every other call (the actual file fetch). Only relevant when a test
 * has opted into connectivityCheckUrl - by default the service never calls fetch for connectivity.
 */
function stubFetch(fileOutcomes: FetchOutcome[] = []): ReturnType<typeof vi.fn> {
    let fileCallIndex = 0;
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
        if (requestUrl(input) === CONNECTIVITY_URL) {
            return Promise.resolve(okResponse());
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
function createService(config?: SpeedTestConfig): SpeedTestService {
    const injector = Injector.create({
        providers: config ? [{ provide: SPEED_TEST_CONFIG, useValue: config }] : []
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

        it('rejects a zero or negative file size', async () => {
            await expect(
                firstValueFrom(service.getBps({ file: { ...testFile, size: 0 } }))
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

            expect(fetchMock).toHaveBeenCalledTimes(1); // only the file fetch, no connectivity probe
        });

        it('runs exactly one file fetch per iteration when no connectivityCheckUrl is configured', async () => {
            const fetchMock = stubFetch(['ok', 'ok']);

            await firstValueFrom(service.getBps({ iterations: 2, retryDelay: 0, file: testFile }));

            expect(fetchMock).toHaveBeenCalledTimes(2);
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

            it('runs a connectivity check and a file fetch for every iteration', async () => {
                const fetchMock = stubFetch(['ok', 'ok']);

                await firstValueFrom(service.getBps({ iterations: 2, retryDelay: 0, file: testFile }));

                expect(fetchMock).toHaveBeenCalledTimes(4); // 2 iterations x (connectivity + file)
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

    describe('mergeSettings() (via getBps())', () => {
        it('uses the default file, including the cache-buster, when no custom settings are given', async () => {
            const fetchMock = stubFetch(['ok']);

            await firstValueFrom(service.getBps({ iterations: 1, retryDelay: 0 }));

            expect(fetchMock).toHaveBeenCalledTimes(1);
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

            await vi.advanceTimersByTimeAsync(6_000); // past the configured 5s timeout, well under the 15s default
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

    describe('known limitations (tracked for milestone C)', () => {
        beforeEach(() => {
            let elapsed = 0;
            vi.spyOn(performance, 'now').mockImplementation(() => (elapsed += 1000));
        });

        it('C3 - computes speed from the configured file.size, ignoring the bytes actually received', async () => {
            const fetchMock = vi.fn(() =>
                // The response body is far smaller than the configured size - a redirected,
                // truncated, or re-encoded file. downloadTest() still trusts settings.file.size.
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

            expect(bps).toBe(8_000_000); // matches the configured 1,000,000-byte size, not the 500-byte body
        });

        it('C4 - a caller supplying only a custom path silently keeps the default file size', async () => {
            stubFetch(['ok']);

            // SpeedTestSettings.file requires the full SpeedTestFile shape, so this is only
            // reachable from a loosely-typed (e.g. plain JS) caller - the cast simulates that.
            const pathOnly = { path: 'https://example.com/my-custom-file.bin' } as unknown as SpeedTestFile;
            const bps = await firstValueFrom(service.getBps({ iterations: 1, retryDelay: 0, file: pathOnly }));

            const defaultSize = new SpeedTestFileModel().size;
            expect(bps).toBe(defaultSize * 8); // reports a speed for a file that was never actually requested at that size
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
    });
});
