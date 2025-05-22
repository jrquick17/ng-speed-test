// speed-test.module.ts
import { NgModule } from '@angular/core';
import { SpeedTestService } from './services/speed-test.service';

@NgModule({
  providers: [SpeedTestService]
})
export class SpeedTestModule {}

// public-api.ts (replaces main.ts for modern Angular libraries)
export * from './models/speed-test-file.model';
export * from './models/speed-test-results.model';
export * from './models/speed-test-settings.model';
export * from './services/speed-test.service';
export * from './speed-test.module';

// Example usage component
// speed-test.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SpeedTestService, SpeedTestResult } from './services/speed-test.service';
import { SpeedTestSettingsModel } from './models/speed-test-settings.model';

@Component({
  selector: 'app-speed-test',
  template: `
    <div class="speed-test-container">
      <h2>Internet Speed Test</h2>
      
      <div class="network-status" [class.online]="isOnline" [class.offline]="!isOnline">
        <span>Status: {{ isOnline ? 'Online' : 'Offline' }}</span>
        <span *ngIf="networkInfo?.effectiveType">
          Connection: {{ networkInfo.effectiveType }}
        </span>
      </div>

      <div class="test-controls">
        <button 
          [disabled]="isRunning || !isOnline" 
          (click)="runSpeedTest()"
          class="test-button">
          {{ isRunning ? 'Testing...' : 'Run Speed Test' }}
        </button>
        
        <select [(ngModel)]="selectedFileSize" [disabled]="isRunning">
          <option value="500kb">500 KB</option>
          <option value="1mb">1 MB</option>
          <option value="5mb" selected>5 MB</option>
          <option value="13mb">13 MB</option>
        </select>
        
        <input 
          type="number" 
          [(ngModel)]="iterations" 
          min="1" 
          max="10" 
          [disabled]="isRunning"
          placeholder="Iterations">
      </div>

      <div class="progress" *ngIf="isRunning">
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="progress"></div>
        </div>
        <p>{{ progressText }}</p>
      </div>

      <div class="results" *ngIf="lastResult">
        <h3>Speed Test Results</h3>
        <div class="result-item">
          <strong>Download Speed:</strong> {{ lastResult.mbps | number:'1.2-2' }} Mbps
        </div>
        <div class="result-item">
          <strong>Download Speed:</strong> {{ lastResult.kbps | number:'1.0-0' }} Kbps
        </div>
        <div class="result-item">
          <strong>Download Speed:</strong> {{ lastResult.bps | number:'1.0-0' }} bps
        </div>
        <div class="result-item">
          <strong>Test Duration:</strong> {{ lastResult.duration | number:'1.2-2' }} seconds
        </div>
      </div>

      <div class="error" *ngIf="error">
        <p>{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .speed-test-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
      font-family: Arial, sans-serif;
    }

    .network-status {
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 20px;
      text-align: center;
    }

    .network-status.online {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .network-status.offline {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .test-controls {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .test-button {
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }

    .test-button:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .test-button:not(:disabled):hover {
      background-color: #0056b3;
    }

    .progress {
      margin-bottom: 20px;
    }

    .progress-bar {
      width: 100%;
      height: 20px;
      background-color: #e9ecef;
      border-radius: 10px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background-color: #007bff;
      transition: width 0.3s ease;
    }

    .results {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 5px;
      border: 1px solid #dee2e6;
    }

    .result-item {
      margin-bottom: 10px;
      font-size: 16px;
    }

    .error {
      background-color: #f8d7da;
      color: #721c24;
      padding: 15px;
      border-radius: 5px;
      border: 1px solid #f5c6cb;
    }

    select, input {
      padding: 8px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 14px;
    }
  `]
})
export class SpeedTestComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isOnline = true;
  networkInfo: any = null;
  isRunning = false;
  progress = 0;
  progressText = '';
  lastResult: SpeedTestResult | null = null;
  error: string | null = null;
  selectedFileSize = '5mb';
  iterations = 3;

  private readonly fileSizes = {
    '500kb': {
      path: 'https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/500kb.jpg',
      size: 408949
    },
    '1mb': {
      path: 'https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/1mb.jpg',
      size: 1197292
    },
    '5mb': {
      path: 'https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/5mb.jpg',
      size: 4952221
    },
    '13mb': {
      path: 'https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/13mb.jpg',
      size: 13848150
    }
  };

  constructor(private speedTestService: SpeedTestService) {}

  ngOnInit(): void {
    this.monitorNetworkStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private monitorNetworkStatus(): void {
    this.speedTestService.getNetworkStatus()
        .pipe(takeUntil(this.destroy$))
        .subscribe(status => {
          this.isOnline = status.isOnline;
          this.networkInfo = status;
        });
  }

  runSpeedTest(): void {
    if (!this.isOnline || this.isRunning) return;

    this.isRunning = true;
    this.progress = 0;
    this.progressText = 'Initializing speed test...';
    this.error = null;
    this.lastResult = null;

    const fileConfig = this.fileSizes[this.selectedFileSize as keyof typeof this.fileSizes];

    const settings = new SpeedTestSettingsModel({
      iterations: this.iterations,
      file: {
        path: fileConfig.path,
        size: fileConfig.size,
        shouldBustCache: true
      },
      retryDelay: 500
    });

    // Simulate progress
    const progressInterval = setInterval(() => {
      if (this.progress < 90) {
        this.progress += Math.random() * 15;
        this.progressText = `Running test iteration... ${Math.floor(this.progress)}%`;
      }
    }, 200);

    this.speedTestService.getSpeedTestResult(settings)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            clearInterval(progressInterval);
            this.progress = 100;
            this.progressText = 'Test completed!';
            this.lastResult = result;
            this.isRunning = false;
          },
          error: (error) => {
            clearInterval(progressInterval);
            this.progress = 0;
            this.progressText = '';
            this.error = error.message || 'An error occurred during the speed test';
            this.isRunning = false;
          }
        });
  }
}
