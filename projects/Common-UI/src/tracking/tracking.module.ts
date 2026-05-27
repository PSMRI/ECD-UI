import { ModuleWithProviders, NgModule } from '@angular/core';
import { AmritTrackingService } from './amrit-tracking.service';

@NgModule()
export class TrackingModule {
  static forRoot(): ModuleWithProviders<TrackingModule> {
    return {
      ngModule: TrackingModule,
      providers: [AmritTrackingService],
    };
  }
}
