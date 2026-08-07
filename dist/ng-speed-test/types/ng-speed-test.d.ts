import * as i0 from '@angular/core';
import { InjectionToken, EnvironmentProviders, Injector, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import * as i1 from '@angular/common';
import * as i2 from '@angular/forms';

interface SpeedTestFile {
    path: string;
    shouldBustCache: boolean;
    /**
     * Optional hint for the file's byte size. Not used to compute speed - the actual response
     * body size is what's measured (C3). Safe to omit for a custom path.
     */
    size?: number;
}
declare class SpeedTestFileModel implements SpeedTestFile {
    path: string;
    shouldBustCache: boolean;
    size?: number;
    constructor(file?: Partial<SpeedTestFile>);
}

interface SpeedTestResults {
    duration: number;
    hasEnded: boolean;
    startTime: number | null;
    endTime: number | null;
    bytesReceived: number;
    speedBps: number;
    speedKbps: number;
    speedMbps: number;
}
declare class SpeedTestResultsModel implements SpeedTestResults {
    duration: number;
    hasEnded: boolean;
    startTime: number | null;
    endTime: number | null;
    bytesReceived: number;
    speedBps: number;
    get speedKbps(): number;
    get speedMbps(): number;
    private _update;
    /**
     * bytesReceived is the actual response body size (e.g. Blob.size, or the accumulated total
     * from readResponseBody()), not the configured file.size hint. Speed is always computed from
     * this - a redirected, re-encoded, truncated, or otherwise changed file reports its real
     * speed instead of a confidently wrong number derived from the configured hint (C3, re-applied
     * for real in 4.0.0 after first landing in error as an undisclosed breaking change in 3.4.0
     * and being reverted in 3.4.1 - see CHANGELOG.md).
     */
    end(bytesReceived: number): void;
    error(): void;
    start(): void;
}

interface SpeedTestSettings {
    iterations?: number;
    file?: SpeedTestFile;
    retryDelay?: number;
    /**
     * Optional cap, in milliseconds, on how long a single iteration reads the response body for
     * (D7). Once elapsed time since the first byte reaches this value, the read is cancelled and
     * the iteration's speed is computed from the bytes received so far instead of waiting for the
     * full file. Undefined (the default) preserves prior behavior: the full response body is
     * always read to completion.
     */
    maxSampleDuration?: number;
}
declare class SpeedTestSettingsModel implements SpeedTestSettings {
    iterations?: number;
    file?: SpeedTestFileModel;
    retryDelay?: number;
    maxSampleDuration?: number;
    constructor(settings?: Partial<SpeedTestSettings>);
}

interface SpeedTestConfig {
    /**
     * URL used for the pre-flight connectivity check that runs before every speed test and every
     * isOnline() / getNetworkStatus() emission. When not provided, no third-party host is
     * contacted for connectivity verification - the library relies on navigator.onLine and on the
     * actual file fetch failing (with a real, attributable error) if the network is unreachable.
     */
    connectivityCheckUrl?: string;
    /** Timeout in ms for the connectivity check, if connectivityCheckUrl is set. Defaults to 3000. */
    connectivityCheckTimeout?: number;
    /** Overrides the built-in default test file for calls that do not supply their own. */
    file?: Partial<SpeedTestFile>;
    /** Timeout in ms for the file download of a single iteration. Defaults to 15000. */
    timeout?: number;
}
declare const SPEED_TEST_CONFIG: InjectionToken<SpeedTestConfig>;
/**
 * Configures SpeedTestService. Optional - every field has a working default and this call is
 * not required to use the library. Pass connectivityCheckUrl only if you want an extra,
 * network-verified connectivity check in addition to navigator.onLine; ng-speed-test does not
 * contact any third-party host on its own unless you configure one here.
 */
declare function provideSpeedTest(config?: SpeedTestConfig): EnvironmentProviders;

interface SpeedTestResult {
    bps: number;
    kbps: number;
    mbps: number;
    duration: number;
}
declare class SpeedTestService {
    private readonly isBrowser;
    private readonly config;
    private readonly DEFAULT_TIMEOUT;
    private readonly OFFLINE_CHECK_TIMEOUT;
    private readonly WARM_UP_TIMEOUT;
    constructor();
    private applyCacheBuster;
    /**
     * Quick connectivity check before running speed test.
     *
     * Only contacts a third-party host if the consumer opted in via
     * provideSpeedTest({ connectivityCheckUrl }) - otherwise this trusts navigator.onLine, and an
     * unreachable network still surfaces as a real, attributable error from the file fetch itself.
     */
    private checkConnectivity;
    /**
     * Runs one untimed GET against the configured file before the first timed iteration, so
     * DNS lookup / TLS handshake / TCP slow-start aren't counted as transfer time on that first
     * measurement (D6). The response is discarded and any failure here is swallowed - a real
     * connectivity problem still surfaces from the timed fetch that follows.
     */
    private warmUp;
    /**
     * Reads a fetch Response body via its ReadableStream (D7), accumulating bytes chunk by chunk
     * instead of buffering the whole body via response.blob() before anything is measurable.
     *
     * `onProgress` fires after every chunk with the running byte total and elapsed milliseconds
     * since the first chunk - this is the "progress observable mid-request" mechanism the D7
     * checklist item asks for. It is not yet wired to anything on the public API surface (no
     * public method accepts a progress callback or emits progress events); a future item can plug
     * a public-facing progress Observable into this hook without changing how bytes are read.
     *
     * If `maxDurationMs` is set, the read stops - via `reader.cancel()` - as soon as elapsed time
     * reaches it, and the promise resolves with only the bytes read so far. This is what lets a
     * single iteration finish without downloading the entire configured file: duration-based
     * sampling rather than always measuring a fixed total. Left undefined (the default), the full
     * body is read to completion, identical to the pre-D7 behavior.
     *
     * Falls back to response.blob() when response.body is unavailable (e.g. a HEAD response, an
     * opaque no-cors response, or a test double that doesn't model a streaming body) - this keeps
     * every pre-D7 test's mocked Response working unchanged.
     */
    private readResponseBody;
    /**
     * Middle value of the sorted valid results, or the average of the two middle values when the
     * count is even (D8, re-applied for real in 4.0.0 after the checklist previously claimed this
     * landed when the code still used a plain arithmetic mean). Chosen over a trimmed mean: the
     * default `iterations` is 3, too small to trim an equal count off both ends and still have
     * more than one sample left, whereas a median degrades gracefully at any count - 1 iteration
     * returns that value unchanged, 2 average both (identical to a mean at n=2), and only at 3+
     * does it diverge, which is exactly where a single outlier can be outvoted instead of dragging
     * the result toward it.
     */
    private median;
    private downloadTest;
    private validateSettings;
    /**
     * Get internet speed in bits per second (bps)
     * Fails fast if no internet connection is available
     */
    getBps(customSettings?: Partial<SpeedTestSettingsModel>): Observable<number>;
    /**
     * Signal-based equivalent of `getBps()` (C5). Starts `undefined` and updates once the test
     * completes; if the test fails, reading the signal after that point rethrows the error, same
     * as `toSignal()`'s standard behavior for a source that errors.
     *
     * Must be called within an injection context - e.g. as a component field initializer
     * (`speed = this.speedTestService.getBpsSignal();`) - or pass an explicit `injector`
     * otherwise. This is what lets the underlying subscription clean up automatically via the
     * calling component's `DestroyRef` rather than needing manual unsubscription.
     *
     * Uses `toSignal()`, not Angular's newer `resource()`/`rxResource()` - those only became
     * stable `@publicApi` at Angular 22.0, and this library still supports Angular 20/21.
     * `toSignal()` writes plain signals directly, independent of `NgZone`, so this works
     * correctly in a zoneless application - verified in `speed-test.service.spec.ts`.
     */
    getBpsSignal(customSettings?: Partial<SpeedTestSettingsModel>, injector?: Injector): Signal<number | undefined>;
    /**
     * Properly merge custom settings with defaults
     */
    private mergeSettings;
    /**
     * Get internet speed in kilobits per second (Kbps), using the decimal convention
     * (1 Kbps = 1,000 bps) that ISPs and other speed test tools use.
     */
    getKbps(settings?: Partial<SpeedTestSettingsModel>): Observable<number>;
    /**
     * Signal-based equivalent of `getKbps()` (C5). See `getBpsSignal()`'s doc for the injection
     * context requirement and the `toSignal()`-over-`resource()` rationale.
     */
    getKbpsSignal(settings?: Partial<SpeedTestSettingsModel>, injector?: Injector): Signal<number | undefined>;
    /**
     * Get internet speed in megabits per second (Mbps), using the decimal convention
     * (1 Mbps = 1,000,000 bps) that ISPs and other speed test tools use.
     */
    getMbps(settings?: Partial<SpeedTestSettingsModel>): Observable<number>;
    /**
     * Signal-based equivalent of `getMbps()` (C5). See `getBpsSignal()`'s doc for the injection
     * context requirement and the `toSignal()`-over-`resource()` rationale.
     */
    getMbpsSignal(settings?: Partial<SpeedTestSettingsModel>, injector?: Injector): Signal<number | undefined>;
    /**
     * Get comprehensive speed test results with fast failure for offline scenarios
     */
    getSpeedTestResult(settings?: Partial<SpeedTestSettingsModel>): Observable<SpeedTestResult>;
    /**
     * Signal-based equivalent of `getSpeedTestResult()` (C5). See `getBpsSignal()`'s doc for the
     * injection context requirement and the `toSignal()`-over-`resource()` rationale.
     */
    getSpeedTestResultSignal(settings?: Partial<SpeedTestSettingsModel>, injector?: Injector): Signal<SpeedTestResult | undefined>;
    /**
     * Check if the browser is online with enhanced detection.
     *
     * On the server (SSR) there is no `window`/`navigator` to observe, so this reports `true`
     * once and completes rather than touching either - there is no real network signal to read
     * during a server render.
     */
    isOnline(): Observable<boolean>;
    /**
     * Monitor network connection status with enhanced detection.
     *
     * On the server (SSR) there is no `window`/`navigator` to observe, so this reports
     * `{ isOnline: true }` once and completes rather than touching either - `effectiveType`/
     * `downlink` are left undefined since there is no connection to read during a server render.
     */
    getNetworkStatus(): Observable<{
        isOnline: boolean;
        effectiveType?: string;
        downlink?: number;
    }>;
    static ɵfac: i0.ɵɵFactoryDeclaration<SpeedTestService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<SpeedTestService>;
}

declare class SpeedTestModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<SpeedTestModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<SpeedTestModule, never, [typeof i1.CommonModule, typeof i2.FormsModule], never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<SpeedTestModule>;
}

export { SPEED_TEST_CONFIG, SpeedTestFileModel, SpeedTestModule, SpeedTestResultsModel, SpeedTestService, SpeedTestSettingsModel, provideSpeedTest };
export type { SpeedTestConfig, SpeedTestFile, SpeedTestResult, SpeedTestResults, SpeedTestSettings };
