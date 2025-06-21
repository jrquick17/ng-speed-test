import { Observable } from 'rxjs';
import * as i0 from '@angular/core';
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
    speedBps: number;
    constructor(fileSize: number);
    get speedKbps(): number;
    get speedMbps(): number;
    private _update;
    end(): void;
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

interface SpeedTestResult {
    bps: number;
    kbps: number;
    mbps: number;
    duration: number;
}
declare class SpeedTestService {
    private readonly DEFAULT_TIMEOUT;
    private readonly OFFLINE_CHECK_TIMEOUT;
    constructor();
    private applyCacheBuster;
    /**
     * Quick connectivity check before running speed test
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

export { SpeedTestFileModel, SpeedTestModule, SpeedTestResultsModel, SpeedTestService, SpeedTestSettingsModel };
export type { SpeedTestFile, SpeedTestResult, SpeedTestResults, SpeedTestSettings };
