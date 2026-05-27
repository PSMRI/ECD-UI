import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AmritTrackingService {
  private userId: string | number | null = null;

  setUserId(userId: string | number): void {
    this.userId = userId;
  }

  trackFieldInteraction(fieldName: string, pageName: string): void {
    if (typeof console !== 'undefined' && console.debug) {
      console.debug('Tracking interaction', {
        userId: this.userId,
        fieldName,
        pageName,
      });
    }
  }
}
