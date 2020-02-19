import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SpeedTestModule } from 'ng-speed-test';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    SpeedTestModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
