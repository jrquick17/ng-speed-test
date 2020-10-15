import { Observable } from 'rxjs';
import { FileDetailsModel } from '../models/file-details.model';
export declare class SpeedTestService {
    constructor();
    private _applyCacheBuster;
    private _download;
    getBps(iterations?: number, fileDetails?: FileDetailsModel): Observable<number | null>;
    getKbps(iterations?: number, fileDetails?: FileDetailsModel): Observable<number>;
    getMbps(iterations?: number, fileDetails?: FileDetailsModel): Observable<number>;
    isOnline(): Observable<boolean>;
}
