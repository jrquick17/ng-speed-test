import * as i0 from '@angular/core';
import { InjectionToken, EnvironmentProviders } from '@angular/core';
import { Observable } from 'rxjs';
import * as i1 from '@angular/common';
import * as i2 from '@angular/forms';

interface SpeedTestFile {
    path: string;
    shouldBustCache: boolean;
    /**
     * Optional hint for the file's byte size. No longer used to compute speed - the actual
     * response body size (Blob.size) is what's measured. Safe to omit for a custom path.
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
    /** bytesReceived is the actual response body size (e.g. Blob.size), not the configured file hint. */
    end(bytesReceived: number): void;
    error(): void;
    start(): void;
}

interface SpeedTestSettings {
    iterations?: number;
    file?: SpeedTestFile;
    retryDelay?: number;
}
declare class SpeedTestSettingsModel implements SpeedTestSettings {
    iterations?: number;
    file?: SpeedTestFileModel;
    retryDelay?: number;
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
    private readonly config;
    private readonly DEFAULT_TIMEOUT;
    private readonly OFFLINE_CHECK_TIMEOUT;
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
     * Get internet speed in kilobits per second (Kbps), using the decimal convention
     * (1 Kbps = 1,000 bps) that ISPs and other speed test tools use.
     */
    getKbps(settings?: Partial<SpeedTestSettingsModel>): Observable<number>;
    /**
     * Get internet speed in megabits per second (Mbps), using the decimal convention
     * (1 Mbps = 1,000,000 bps) that ISPs and other speed test tools use.
     */
    getMbps(settings?: Partial<SpeedTestSettingsModel>): Observable<number>;
    /**
     * Get comprehensive speed test results with fast failure for offline scenarios
     */
    getSpeedTestResult(settings?: Partial<SpeedTestSettingsModel>): Observable<SpeedTestResult>;
    /**
     * Check if the browser is online with enhanced detection
     */
    isOnline(): Observable<boolean>;
    /**
     * Monitor network connection status with enhanced detection
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
