import { Observable } from 'rxjs';
import { FileDetailsModel } from '../models/file-details.model';
export declare class SpeedTestService {
    constructor();
    private _applyCacheBuster;
    getBps(fileDetails?: FileDetailsModel, iterations?: number): Observable<number | null>;
    getKbps(): Observable<number>;
    getMbps(): Observable<number>;
}
