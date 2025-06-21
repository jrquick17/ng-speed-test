import {Component, OnDestroy, OnInit} from '@angular/core';
import {interval, Subject, takeUntil} from 'rxjs';
import {SpeedTestService} from '../../../../src/services/speed-test.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Network status
  isOnline = true;
  networkStatus: any = null;
  lastConnectivityCheck = new Date();

  // Speed test state
  title = 'ng-speed-test-demo';
  hasTracked = false;
  isTracking = false;
  iterations = 1;
  speeds: number[] = [];

  // Enhanced UI state
  currentIteration = 0;
  progressPercentage = 0;
  estimatedTimeRemaining = 0;
  errorMessage = '';
  lastTestDuration = 0;
  averageSpeed = 0;

  // Connection quality indicators
  connectionQuality = 'unknown';
  connectionIcon = '🔄';

  constructor(private speedTestService: SpeedTestService) {}

  ngOnInit(): void {
    this.initializeNetworkMonitoring();
    this.startPeriodicConnectivityCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize comprehensive network monitoring
   */
  private initializeNetworkMonitoring(): void {
    // Enhanced network status monitoring
    this.speedTestService.getNetworkStatus()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (status) => {
            this.networkStatus = status;
            this.isOnline = status.isOnline;
            this.lastConnectivityCheck = new Date();
            this.updateConnectionQuality(status);

            // Clear error if connection restored
            if (this.isOnline && this.errorMessage.includes('connection')) {
              this.errorMessage = '';
            }

            console.log('Network status updated:', status);
          },
          error: (error) => {
            console.warn('Network monitoring error:', error);
            this.isOnline = false;
            this.setOfflineState();
          }
        });

    // Basic online/offline detection as fallback
    this.speedTestService.isOnline()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (online) => {
            if (this.isOnline !== online) {
              this.isOnline = online;
              this.lastConnectivityCheck = new Date();

              if (!online) {
                this.setOfflineState();
              } else {
                this.errorMessage = '';
                this.connectionIcon = '✅';
              }
            }
          },
          error: () => {
            this.setOfflineState();
          }
        });
  }

  /**
   * Periodic connectivity verification
   */
  private startPeriodicConnectivityCheck(): void {
    // Check connectivity every 30 seconds
    interval(30000)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (this.isOnline) {
            this.speedTestService.isOnline()
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: (online) => {
                    if (!online && this.isOnline) {
                      this.setOfflineState();
                    }
                  },
                  error: () => {
                    this.setOfflineState();
                  }
                });
          }
        });
  }

  /**
   * Set offline state and stop any running tests
   */
  private setOfflineState(): void {
    this.isOnline = false;
    this.connectionIcon = '❌';
    this.connectionQuality = 'offline';

    if (this.isTracking) {
      this.isTracking = false;
      this.errorMessage = 'Connection lost during speed test';
    }
  }

  /**
   * Update connection quality indicators
   */
  private updateConnectionQuality(status: any): void {
    if (!status.isOnline) {
      this.connectionQuality = 'offline';
      this.connectionIcon = '❌';
      return;
    }

    // Use connection info if available
    if (status.effectiveType) {
      switch (status.effectiveType) {
        case 'slow-2g':
          this.connectionQuality = 'very poor';
          this.connectionIcon = '🐌';
          break;
        case '2g':
          this.connectionQuality = 'poor';
          this.connectionIcon = '📶';
          break;
        case '3g':
          this.connectionQuality = 'fair';
          this.connectionIcon = '📶📶';
          break;
        case '4g':
          this.connectionQuality = 'good';
          this.connectionIcon = '📶📶📶';
          break;
        default:
          this.connectionQuality = 'excellent';
          this.connectionIcon = '🚀';
      }
    } else {
      this.connectionQuality = 'unknown';
      this.connectionIcon = '✅';
    }
  }

  /**
   * Navigate to GitHub with connectivity check
   */
  goToGitHub(): void {
    if (!this.isOnline) {
      this.errorMessage = 'Cannot open GitHub - no internet connection';
      return;
    }
    window.open('https://github.com/jrquick17/ng-speed-test', '_blank');
  }

  /**
   * Enhanced speed test with better error handling and progress
   */
  trackSpeed(): void {
    // Pre-flight checks
    if (!this.preFlightCheck()) {
      return;
    }

    this.initializeSpeedTest();
    this.runSingleSpeedTest();
  }

  /**
   * Run a single speed test iteration
   */
  private runSingleSpeedTest(): void {
    const testStartTime = Date.now();

    this.speedTestService.getMbps({
      iterations: 1,
      retryDelay: 1500
    }).subscribe({
      next: (speed) => {
        this.handleSpeedTestSuccess(speed, testStartTime);
      },
      error: (error) => {
        this.handleSpeedTestError(error);
      }
    });
  }

  /**
   * Pre-flight connectivity and validation checks
   */
  private preFlightCheck(): boolean {
    // Clear previous errors
    this.errorMessage = '';

    // Check if already running
    if (this.isTracking) {
      this.errorMessage = 'Speed test already in progress';
      return false;
    }

    // Validate iterations
    if (this.iterations > 100) {
      this.iterations = 100;
      this.errorMessage = 'Maximum 100 iterations allowed';
    }

    if (this.iterations < 1) {
      this.iterations = 1;
      this.errorMessage = 'Minimum 1 iteration required';
    }

    // Critical: Check connectivity
    if (!this.isOnline) {
      this.errorMessage = 'No internet connection detected. Please check your connection and try again.';
      return false;
    }

    // Check if connection is too slow for reliable testing
    if (this.connectionQuality === 'very poor') {
      this.errorMessage = 'Connection appears very slow. Results may be unreliable.';
      // Still allow the test but warn user
    }

    return true;
  }

  /**
   * Initialize speed test state
   */
  private initializeSpeedTest(): void {
    // Reset state for new test
    this.speeds = [];
    this.hasTracked = false;
    this.isTracking = true;
    this.currentIteration = 0;
    this.progressPercentage = 0;
    this.estimatedTimeRemaining = this.iterations * 3; // Rough estimate
    this.errorMessage = '';
  }

  /**
   * Handle successful speed test result
   */
  private handleSpeedTestSuccess(speed: number, testStartTime: number): void {
    const testDuration = (Date.now() - testStartTime) / 1000;

    this.speeds.unshift(speed);
    this.currentIteration++;
    this.progressPercentage = (this.currentIteration / this.iterations) * 100;

    // Update time estimates
    this.lastTestDuration = testDuration;
    const remainingTests = this.iterations - this.currentIteration;
    this.estimatedTimeRemaining = remainingTests * testDuration;

    if (this.currentIteration < this.iterations) {
      // Continue testing
      setTimeout(() => {
        if (this.isOnline) {
          this.runSingleSpeedTest();
        } else {
          this.handleSpeedTestError(new Error('Connection lost during test'));
        }
      }, 100);
    } else {
      // Test complete
      this.completeSpeedTest();
    }
  }

  /**
   * Handle speed test errors with specific messaging
   */
  private handleSpeedTestError(error: any): void {
    this.isTracking = false;
    this.progressPercentage = 0;
    this.estimatedTimeRemaining = 0;

    console.error('Speed test error:', error);

    // Provide specific error messages
    if (error.message?.includes('No internet connection')) {
      this.errorMessage = '❌ No internet connection detected';
      this.isOnline = false;
    } else if (error.message?.includes('timed out')) {
      this.errorMessage = '⏱️ Speed test timed out - connection may be very slow';
    } else if (error.message?.includes('Failed to fetch')) {
      this.errorMessage = '🔗 Failed to reach test server - check your connection';
    } else {
      this.errorMessage = `⚠️ Speed test failed: ${error.message || 'Unknown error'}`;
    }

    // Trigger connectivity recheck
    this.recheckConnectivity();
  }

  /**
   * Complete speed test and calculate statistics
   */
  private completeSpeedTest(): void {
    this.isTracking = false;
    this.hasTracked = true;
    this.progressPercentage = 100;
    this.estimatedTimeRemaining = 0;

    // Calculate average speed
    if (this.speeds.length > 0) {
      this.averageSpeed = this.speeds.reduce((a, b) => a + b, 0) / this.speeds.length;
    }

    // Update connection quality based on speed results
    this.updateConnectionQualityFromSpeed();
  }

  /**
   * Update connection quality based on actual speed test results
   */
  private updateConnectionQualityFromSpeed(): void {
    if (this.averageSpeed < 1) {
      this.connectionQuality = 'very poor';
      this.connectionIcon = '🐌';
    } else if (this.averageSpeed < 5) {
      this.connectionQuality = 'poor';
      this.connectionIcon = '📶';
    } else if (this.averageSpeed < 25) {
      this.connectionQuality = 'fair';
      this.connectionIcon = '📶📶';
    } else if (this.averageSpeed < 100) {
      this.connectionQuality = 'good';
      this.connectionIcon = '📶📶📶';
    } else {
      this.connectionQuality = 'excellent';
      this.connectionIcon = '🚀';
    }
  }

  /**
   * Force connectivity recheck
   */
  recheckConnectivity(): void {
    this.connectionIcon = '🔄';
    this.speedTestService.isOnline()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (online) => {
            this.isOnline = online;
            this.lastConnectivityCheck = new Date();
            if (online) {
              this.errorMessage = '';
              this.connectionIcon = '✅';
            } else {
              this.setOfflineState();
            }
          },
          error: () => {
            this.setOfflineState();
          }
        });
  }

  /**
   * Get formatted speed for display
   */
  getFormattedSpeed(speed: number): string {
    return speed?.toFixed(2) || '0.00';
  }

  /**
   * Get maximum speed from results
   */
  getMaxSpeed(): number {
    return this.speeds.length > 0 ? Math.max(...this.speeds) : 0;
  }

  /**
   * Get minimum speed from results
   */
  getMinSpeed(): number {
    return this.speeds.length > 0 ? Math.min(...this.speeds) : 0;
  }

  /**
   * Get speed range
   */
  getSpeedRange(): number {
    return this.getMaxSpeed() - this.getMinSpeed();
  }

  /**
   * Get progress bar max value
   */
  getProgressBarMax(): number {
    return this.getMaxSpeed() * 1.1;
  }

  /**
   * Get connection status text
   */
  getConnectionStatusText(): string {
    if (!this.isOnline) {
      return 'Offline';
    }
    return `Online - ${this.connectionQuality} ${this.connectionIcon}`;
  }

  /**
   * Get progress text for speed test
   */
  getProgressText(): string {
    if (!this.isTracking) return '';

    const remaining = Math.ceil(this.estimatedTimeRemaining);
    return `Testing... ${this.currentIteration}/${this.iterations} (${remaining}s remaining)`;
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorMessage = '';
  }
}
