import { Injectable } from '@angular/core';
import { fromEvent, merge, Observable, of, throwError } from 'rxjs';
import { map, mergeMap, catchError, timeout } from 'rxjs/operators';

import { SpeedTestResultsModel } from '../models/speed-test-results.model';
import { SpeedTestSettingsModel } from '../models/speed-test-settings.model';
import {SpeedTestResult} from '../models/speed-test-result.model';

@Injectable({
    providedIn: 'root'
})
export class SpeedTestService {
    private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds

    constructor() {}

    private applyCacheBuster(path: string): string {
        const separator = path.includes('?') ? '&' : '?';
        return `${path}${separator}cache_bust=${Date.now()}_${Math.random()}`;
    }

    private downloadTest(settings: SpeedTestSettingsModel, allResults: SpeedTestResultsModel[] = []): Observable<number> {
        return new Observable<SpeedTestResultsModel>(observer => {
            const testResult = new SpeedTestResultsModel(settings.file!.size);

            // Use fetch API for better error handling and modern approach
            const abortController = new AbortController();

            let filePath = settings.file!.path;
            if (settings.file!.shouldBustCache) {
                filePath = this.applyCacheBuster(filePath);
            }

            testResult.start();

            fetch(filePath, {
                method: 'GET',
                signal: abortController.signal,
                cache: 'no-cache'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.blob();
                })
                .then(() => {
                    testResult.end();
                    observer.next(testResult);
                    observer.complete();
                })
                .catch(error => {
                    console.warn('Speed test download failed:', error);
                    testResult.error();

                    const delay = settings.iterations !== 1 ? settings.retryDelay! : 0;

                    setTimeout(() => {
                        observer.next(testResult);
                        observer.complete();
                    }, delay);
                });

            // Cleanup function
            return () => {
                abortController.abort();
            };
        }).pipe(
            timeout(this.DEFAULT_TIMEOUT),
            catchError(error => {
                console.error('Speed test timeout or error:', error);
                const failedResult = new SpeedTestResultsModel(settings.file!.size);
                failedResult.error();
                return of(failedResult);
            }),
            mergeMap((testResult: SpeedTestResultsModel) => {
                allResults.push(testResult);

                if (settings.iterations === 1) {
                    // Calculate average speed from all valid results
                    const validResults = allResults.filter(result => result.speedBps > 0);

                    if (validResults.length === 0) {
                        return throwError(() => new Error('All speed test iterations failed'));
                    }

                    const totalSpeed = validResults.reduce((sum, result) => sum + result.speedBps, 0);
                    const averageSpeed = totalSpeed / validResults.length;

                    return of(averageSpeed);
                } else {
                    settings.iterations!--;
                    return this.downloadTest(settings, allResults);
                }
            })
        );
    }

    private validateSettings(settings: SpeedTestSettingsModel): void {
        if (!settings.file?.path) {
            throw new Error('ng-speed-test: File path is required');
        }

        if (!settings.file?.size || settings.file.size <= 0) {
            throw new Error('ng-speed-test: Valid file size is required');
        }

        if (settings.iterations && settings.iterations < 1) {
            throw new Error('ng-speed-test: Iterations must be at least 1');
        }
    }

    /**
     * Get internet speed in bits per second (bps)
     */
    getBps(customSettings?: Partial<SpeedTestSettingsModel>): Observable<number> {
        return new Observable(observer => {
            // Small delay to ensure proper initialization
            setTimeout(() => {
                const settings = new SpeedTestSettingsModel(customSettings);

                try {
                    this.validateSettings(settings);

                    this.downloadTest(settings).subscribe({
                        next: (speedBps) => {
                            observer.next(speedBps);
                            observer.complete();
                        },
                        error: (error) => {
                            observer.error(error);
                        }
                    });
                } catch (error) {
                    observer.error(error);
                }
            }, 1);
        });
    }

    /**
     * Get internet speed in kilobits per second (Kbps)
     */
    getKbps(settings?: Partial<SpeedTestSettingsModel>): Observable<number> {
        return this.getBps(settings).pipe(
            map(bps => bps / 1024)
        );
    }

    /**
     * Get internet speed in megabits per second (Mbps)
     */
    getMbps(settings?: Partial<SpeedTestSettingsModel>): Observable<number> {
        return this.getKbps(settings).pipe(
            map(kbps => kbps / 1024)
        );
    }

    /**
     * Get comprehensive speed test results
     */
    getSpeedTestResult(settings?: Partial<SpeedTestSettingsModel>): Observable<SpeedTestResult> {
        const startTime = Date.now();

        return this.getBps(settings).pipe(
            map(bps => ({
                bps,
                kbps: bps / 1024,
                mbps: bps / (1024 * 1024),
                duration: (Date.now() - startTime) / 1000
            }))
        );
    }

    /**
     * Check if the browser is online
     */
    isOnline(): Observable<boolean> {
        return merge(
            fromEvent(window, 'offline').pipe(map(() => false)),
            fromEvent(window, 'online').pipe(map(() => true)),
            of(navigator.onLine)
        );
    }

    /**
     * Monitor network connection status
     */
    getNetworkStatus(): Observable<{ isOnline: boolean; effectiveType?: string; downlink?: number }> {
        const getConnectionInfo = () => {
            const connection = (navigator as any).connection ||
                (navigator as any).mozConnection ||
                (navigator as any).webkitConnection;

            return {
                isOnline: navigator.onLine,
                effectiveType: connection?.effectiveType,
                downlink: connection?.downlink
            };
        };

        return merge(
            fromEvent(window, 'offline').pipe(map(() => ({ ...getConnectionInfo(), isOnline: false }))),
            fromEvent(window, 'online').pipe(map(() => ({ ...getConnectionInfo(), isOnline: true }))),
            of(getConnectionInfo())
        );
    }
}
