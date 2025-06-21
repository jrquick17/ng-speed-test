import { Observable } from 'rxjs';
import { SpeedTestSettingsModel } from '../models/speed-test-settings.model';
import * as i0 from "@angular/core";
export interface SpeedTestResult {
    bps: number;
    kbps: number;
    mbps: number;
    duration: number;
}
export declare class SpeedTestService {
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
