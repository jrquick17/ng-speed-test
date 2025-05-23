import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpeedTestService } from './services/speed-test.service';

@NgModule({
  imports: [CommonModule, FormsModule],
  providers: [SpeedTestService]
})
export class SpeedTestModule {}
