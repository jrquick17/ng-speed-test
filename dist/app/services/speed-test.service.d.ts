import { Observable } from 'rxjs';
import { SpeedTestSettingsModel } from '../models/speed-test-settings.model';
export declare class SpeedTestService {
    constructor();
    private _applyCacheBuster;
    private _download;
    getBps(settings?: SpeedTestSettingsModel): Observable<number | null>;
    getKbps(settings?: SpeedTestSettingsModel): Observable<number>;
    getMbps(settings?: SpeedTestSettingsModel): Observable<number>;
    isOnline(): Observable<boolean>;
}
