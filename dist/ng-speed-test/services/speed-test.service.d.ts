import { Observable } from 'rxjs';
import { SpeedTestSettingsModel } from '../models/speed-test-settings.model';
import { SpeedTestResult } from '../models/speed-test-result.model';
import * as i0 from "@angular/core";
export declare class SpeedTestService {
    private readonly DEFAULT_TIMEOUT;
    constructor();
    private applyCacheBuster;
    private downloadTest;
    private validateSettings;
    /**
     * Get internet speed in bits per second (bps)
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
     * Get comprehensive speed test results
     */
    getSpeedTestResult(settings?: Partial<SpeedTestSettingsModel>): Observable<SpeedTestResult>;
    /**
     * Check if the browser is online
     */
    isOnline(): Observable<boolean>;
    /**
     * Monitor network connection status
     */
    getNetworkStatus(): Observable<{
        isOnline: boolean;
        effectiveType?: string;
        downlink?: number;
    }>;
    static ɵfac: i0.ɵɵFactoryDeclaration<SpeedTestService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<SpeedTestService>;
}
