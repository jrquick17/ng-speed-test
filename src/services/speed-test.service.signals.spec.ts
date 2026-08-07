import { Component, inject, Injector, PLATFORM_ID, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SpeedTestService } from './speed-test.service';

const testFile = { path: 'https://example.com/5mb.bin', size: 1_000_000, shouldBustCache: false };

function okResponse(bodySize = testFile.size): Response {
    return { ok: true, status: 200, statusText: 'OK', blob: () => Promise.resolve({ size: bodySize } as Blob) } as unknown as Response;
}

function setOnLine(value: boolean): void {
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => value });
}

describe('SpeedTestService signals API (C5)', () => {
    beforeEach(() => {
        setOnLine(true);
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(okResponse())));
        // Every performance.now() call advances by a fixed amount, so the resulting speedBps is
        // deterministic regardless of how much real wall-clock time actually elapses in the test.
        let elapsed = 0;
        vi.spyOn(performance, 'now').mockImplementation(() => (elapsed += 1000));
    });

    afterEach(() => {
        delete (navigator as unknown as Record<string, unknown>)['onLine'];
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    describe('getBpsSignal()/getKbpsSignal()/getMbpsSignal()/getSpeedTestResultSignal() - basic reactivity', () => {
        function createServiceInInjectionContext(): { service: SpeedTestService; injector: Injector } {
            const injector = Injector.create({
                providers: [{ provide: PLATFORM_ID, useValue: 'browser' }]
            });
            const service = runInInjectionContext(injector, () => new SpeedTestService());
            return { service, injector };
        }

        it('getBpsSignal() starts undefined and updates to the resolved bps once the test completes', async () => {
            const { service, injector } = createServiceInInjectionContext();

            const bps = runInInjectionContext(injector, () =>
                service.getBpsSignal({ iterations: 1, retryDelay: 0, file: testFile })
            );

            expect(bps()).toBeUndefined();

            await vi.waitFor(() => {
                if (bps() === undefined) {
                    throw new Error('speed test has not resolved yet');
                }
            });

            expect(bps()).toBe(8_000_000); // 1,000,000 bytes * 8 bits, over whatever real duration elapsed
        });

        it('getKbpsSignal() and getMbpsSignal() resolve to the decimal (C2) conversion of the same bps', async () => {
            const { service, injector } = createServiceInInjectionContext();

            const kbps = runInInjectionContext(injector, () =>
                service.getKbpsSignal({ iterations: 1, retryDelay: 0, file: testFile })
            );
            const mbps = runInInjectionContext(injector, () =>
                service.getMbpsSignal({ iterations: 1, retryDelay: 0, file: testFile })
            );

            await vi.waitFor(() => {
                if (kbps() === undefined || mbps() === undefined) {
                    throw new Error('speed test has not resolved yet');
                }
            });

            expect(kbps()).toBeCloseTo(8_000_000 / 1000);
            expect(mbps()).toBeCloseTo(8_000_000 / 1000 / 1000);
        });

        it('getSpeedTestResultSignal() resolves to the full SpeedTestResult object', async () => {
            const { service, injector } = createServiceInInjectionContext();

            const result = runInInjectionContext(injector, () =>
                service.getSpeedTestResultSignal({ iterations: 1, retryDelay: 0, file: testFile })
            );

            await vi.waitFor(() => {
                if (result() === undefined) {
                    throw new Error('speed test has not resolved yet');
                }
            });

            expect(result()!.bps).toBe(8_000_000);
            expect(result()!.kbps).toBeCloseTo(8_000_000 / 1000);
            expect(result()!.mbps).toBeCloseTo(8_000_000 / 1000 / 1000);
        });

        it('accepts an explicit injector for use outside an ambient injection context', () => {
            const { service, injector } = createServiceInInjectionContext();

            // Called directly, NOT wrapped in runInInjectionContext() - this only works because
            // an explicit injector is passed through to toSignal().
            expect(() => service.getBpsSignal({ iterations: 1, retryDelay: 0, file: testFile }, injector))
                .not.toThrow();
        });
    });

    describe('zoneless change detection (C5 done-when: verified in a zoneless configuration)', () => {
        // A real Angular component tree, bootstrapped with provideZonelessChangeDetection() (no
        // Zone.js patching of setTimeout/fetch), proves the signal write from toSignal()'s
        // internal subscription actually reaches the rendered DOM - not just that the signal's
        // own value changes, which the "basic reactivity" tests above already cover in isolation.
        @Component({
            selector: 'lib-zoneless-speed-test-host',
            standalone: true,
            template: `<span data-testid="status">{{ bps() === undefined ? 'pending' : 'done:' + bps() }}</span>`
        })
        class ZonelessSpeedTestHost {
            private readonly speedTestService = inject(SpeedTestService);
            bps = this.speedTestService.getBpsSignal({ iterations: 1, retryDelay: 0, file: testFile });
        }

        it('updates the rendered template once the speed test resolves, with no NgZone involved', async () => {
            TestBed.configureTestingModule({
                providers: [provideZonelessChangeDetection()]
            });

            const fixture = TestBed.createComponent(ZonelessSpeedTestHost);
            fixture.detectChanges();

            expect(fixture.nativeElement.textContent).toContain('pending');

            await vi.waitFor(() => {
                if (!fixture.nativeElement.textContent.includes('done:')) {
                    throw new Error('template has not updated yet');
                }
            });

            expect(fixture.nativeElement.textContent).toContain('done:8000000');
        });
    });
});
