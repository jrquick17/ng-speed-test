import * as i0 from '@angular/core';
import { InjectionToken, EnvironmentProviders } from '@angular/core';
import { Observable } from 'rxjs';
import * as i1 from '@angular/common';
import * as i2 from '@angular/forms';

interface SpeedTestFile {
    path: string;
    shouldBustCache: boolean;
    size: number;
}
declare class SpeedTestFileModel implements SpeedTestFile {
    path: string;
    shouldBustCache: boolean;
    size: number;
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
    private fileSize;
    duration: number;
    hasEnded: boolean;
    startTime: number | null;
    endTime: number | null;
    bytesReceived: number;
    speedBps: number;
    constructor(fileSize: number);
    get speedKbps(): number;
    get speedMbps(): number;
    private _update;
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
    end(bytesReceived?: number): void;
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
    private downloadTest;
    private validateSettings;
    /**
     * Get internet speed in bits per second (bps)
     * Fails fast if no internet connection is available
     */
    getBps(customSettings?: Partial<SpeedTestSettingsModel>): Observable<number>;
    /**
     * Properly merge custom settings with defaults
     */
    private mergeSettings;
    /**
     * Get internet speed in kilobits per second (Kbps)
     */
    getKbps(settings?: Partial<SpeedTestSettingsModel>): Observable<number>;
    /**
     * Get internet speed in megabits per second (Mbps)
     */
    getMbps(settings?: Partial<SpeedTestSettingsModel>): Observable<number>;
    /**
     * Get comprehensive speed test results with fast failure for offline scenarios
     */
    getSpeedTestResult(settings?: Partial<SpeedTestSettingsModel>): Observable<SpeedTestResult>;
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
