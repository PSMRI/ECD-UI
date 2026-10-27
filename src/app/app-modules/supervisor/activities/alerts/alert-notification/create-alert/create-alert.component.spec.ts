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


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { CreateAlertComponent } from './create-alert.component';
import { AlertNotificationComponent } from '../alert-notification.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';

describe('CreateAlertComponent', () => {
  let component: CreateAlertComponent;
  let fixture: ComponentFixture<CreateAlertComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let master: jasmine.SpyObj<MasterService>;
  let tracking: jasmine.SpyObj<AmritTrackingService>;
  const lang = { doYouReallyWantToCancelUnsavedData: 'cancelUnsaved', createdAlertSuccessfully: 'created' };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', ['getNotificationType', 'saveCreateAlert', 'createComponent']);
    supervisor.getNotificationType.and.returnValue(
      of({ statusCode: 200, data: [{ notificationType: 'Alert', notificationTypeID: 7 }] }),
    );
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    master = jasmine.createSpyObj('MasterService', ['getRoleMaster', 'getOfficesMaster', 'getLocationsMaster']);
    master.getRoleMaster.and.returnValue(of([{ roleName: 'Supervisor' }, { roleName: 'ANM', roleId: 2 }]));
    master.getLocationsMaster.and.returnValue(of({ data: [{ id: 31 }] }));
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [CreateAlertComponent],
      providers: [
        FormBuilder,
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: SupervisorService, useValue: supervisor },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: MasterService, useValue: master },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CreateAlertComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(CreateAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const form = (): any => component.createAlertNotificationForm;

  it('loads the alert type, non-supervisor roles and locations', () => {
    expect(component.communicationTypeId).toBe(7);
    expect(component.uname).toBe('sup1');
    expect(component.roles.map((r: any) => r.roleName)).toEqual(['ANM']);
    expect(master.getLocationsMaster).toHaveBeenCalledWith(4, '');
    expect(component.locationData).toEqual([{ id: 31 }]);
  });

  it('getOfficesForAlert stores offices', () => {
    master.getOfficesMaster.and.returnValue(of(['Office A']));
    component.getOfficesForAlert();
    expect(master.getOfficesMaster).toHaveBeenCalledWith(4);
    expect(component.offices).toEqual(['Office A']);
  });

  describe('validateTime', () => {
    const day = (d: number) => new Date(2026, 0, d);

    it('flags an end time before or equal to the start on the same day', () => {
      component.validateTime(day(5), day(5), '10:00', '09:00');
      expect(component.invalidTimeFlag).toBeTrue();
      component.validateTime(day(5), day(5), '09:00', '10:00');
      expect(component.invalidTimeFlag).toBeFalse();
      component.validateTime(day(5), day(5), '09:00', '09:00');
      expect(component.invalidTimeFlag).toBeTrue();
    });

    it('accepts any times on different days and ignores missing times', () => {
      component.validateTime(day(5), day(6), '10:00', '09:00');
      expect(component.invalidTimeFlag).toBeFalse();
      component.invalidTimeFlag = true;
      component.validateTime(day(5), day(5), '', '09:00');
      expect(component.invalidTimeFlag).toBeTrue();
    });
  });

  describe('saveAlertForm', () => {
    beforeEach(() => {
      form().setValue({
        roleType: 2,
        officeType: [31, 32],
        subject: 'Flood',
        message: 'Stay safe',
        startTime: '09:30',
        endTime: '',
      });
      component.range.setValue({ start: new Date(2026, 0, 5) as any, end: new Date(2026, 0, 6) as any });
    });

    it('creates one alert per office with local times', () => {
      supervisor.saveCreateAlert.and.returnValue(of({ statusCode: 200, data: [{}] }));
      component.saveAlertForm();
      const req: any[] = supervisor.saveCreateAlert.calls.mostRecent().args[0];
      expect(req.length).toBe(2);
      expect(req[1]).toEqual(
        jasmine.objectContaining({
          createdBy: 'sup1',
          notification: 'Flood',
          notificationDesc: 'Stay safe',
          notificationTypeID: 7,
          providerServiceMapID: 4,
          roleID: 2,
          workingLocationID: 32,
        }),
      );
      expect(req[0].validFrom.toISOString()).toBe('2026-01-05T09:30:00.000Z');
      expect(req[0].validTill.toISOString()).toBe('2026-01-06T23:59:59.000Z');
      expect(confirmation.openDialog).toHaveBeenCalledWith('created', 'success');
      expect(form().value.subject).toBeNull();
    });

    it('uses an explicit end time and midnight without a start time', () => {
      form().patchValue({ startTime: '', endTime: '18:15' });
      supervisor.saveCreateAlert.and.returnValue(of({ statusCode: 200, data: null }));
      component.saveAlertForm();
      const req: any[] = supervisor.saveCreateAlert.calls.mostRecent().args[0];
      expect(req[0].validFrom.toISOString()).toBe('2026-01-05T00:00:00.000Z');
      expect(req[0].validTill.toISOString()).toBe('2026-01-06T18:15:00.000Z');
      expect(confirmation.openDialog).not.toHaveBeenCalled();
    });

    it('shows the error message on failure', () => {
      supervisor.saveCreateAlert.and.returnValue(of({ statusCode: 5000, errorMessage: 'overlap' }));
      component.saveAlertForm();
      expect(confirmation.openDialog).toHaveBeenCalledWith('overlap', 'error');
    });
  });

  describe('showTable', () => {
    it('resets and returns to the alert list after confirmation', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      form().patchValue({ subject: 'x' });
      component.showTable();
      expect(confirmation.openDialog).toHaveBeenCalledWith('cancelUnsaved', 'confirm');
      expect(form().value.subject).toBeNull();
      expect(supervisor.createComponent).toHaveBeenCalledWith(AlertNotificationComponent, null);
    });

    it('stays when declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.showTable();
      expect(supervisor.createComponent).not.toHaveBeenCalled();
    });
  });

  it('dateFilter allows only dates from now on', () => {
    expect(component.dateFilter(new Date(Date.now() + 86400000))).toBeTrue();
    expect(component.dateFilter(new Date(2000, 0, 1))).toBeFalse();
  });

  it('alertCheck logs and tracks interactions', () => {
    component.alertCheck();
    expect(console.log).toHaveBeenCalledWith('heloo');
    component.trackFieldInteraction('subject');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('subject', 'Create Alert');
  });
});
