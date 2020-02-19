import { Observable } from 'rxjs';
export declare class SpeedTestService {
    constructor();
    getBps(): Observable<number>;
    getKbps(): Observable<number>;
    getMbps(): Observable<number>;
}
