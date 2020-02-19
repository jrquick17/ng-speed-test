import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {SpeedTestService} from './services/speed-test.service';

export * from './services/speed-test.service';

@NgModule({
  providers: [
    SpeedTestService
  ],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class NgSpeedTestModule {
  static forRoot():ModuleWithProviders {
    return {
      ngModule: NgSpeedTestModule,
      providers: []
    };
  }
}
