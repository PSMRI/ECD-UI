/* 
* AMRIT – Accessible Medical Records via Integrated Technology 
* Integrated EHR (Electronic Health Records) Solution 
*
* Copyright (C) "Piramal Swasthya Management and Research Institute" 
*
* This file is part of AMRIT.
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see https://www.gnu.org/licenses/.
*/


import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';

import { CommonDialogComponent } from './common-dialog.component';

describe('CommonDialogComponent', () => {
  let component: CommonDialogComponent;
  let dialogRef: jasmine.SpyObj<MatDialogRef<CommonDialogComponent>>;

  function create(data: any) {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    TestBed.configureTestingModule({
      declarations: [CommonDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideTemplate(CommonDialogComponent, '');
    const fixture = TestBed.createComponent(CommonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('takes title and message from the dialog data', () => {
    create({ action: 'confirm', message: 'Sure?' });
    expect(component.title).toBe('confirm');
    expect(component.message).toBe('Sure?');
    expect(component.intervalRef).toBeUndefined();
  });

  it('confirm and cancel close with true or false', () => {
    create({ action: 'confirm', message: 'Sure?' });
    component.onConfirm();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  describe('session timeout', () => {
    it('counts down from 120 seconds and closes on timeout', fakeAsync(() => {
      create({ action: 'sessionTimeOut', message: 'Session expiring' });
      expect(component.timer).toBe(120);
      tick(1000);
      expect(component.timer).toBe(119);
      expect(component.minutes).toBe(2);
      expect(component.seconds).toBe(0);
      tick(120000);
      expect(dialogRef.close).toHaveBeenCalledOnceWith({ action: 'timeout' });
    }));

    it('stopTimer closes with the remaining time', fakeAsync(() => {
      create({ action: 'sessionTimeOut', message: 'x' });
      tick(3000);
      component.stopTimer();
      expect(dialogRef.close).toHaveBeenCalledWith({ action: 'cancel', remainingTime: 117 });
      tick(5000);
      expect(dialogRef.close).toHaveBeenCalledTimes(1);
    }));

    it('continueSession closes with continue', fakeAsync(() => {
      create({ action: 'sessionTimeOut', message: 'x' });
      component.continueSession();
      expect(dialogRef.close).toHaveBeenCalledWith({ action: 'continue' });
      tick(130000);
      expect(dialogRef.close).toHaveBeenCalledTimes(1);
    }));

    it('updateTimer ignores non-positive values', () => {
      create({ action: 'x', message: 'x' });
      component.updateTimer(0);
      expect(component.timer).toBe(0);
      expect(component.intervalRef).toBeUndefined();
    });
  });
});
