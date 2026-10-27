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

import { EditNotificationComponent } from './edit-notification.component';
import { SupervisorNotificationComponent } from '../supervisor-notification/supervisor-notification.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';

describe('EditNotificationComponent', () => {
  let component: EditNotificationComponent;
  let fixture: ComponentFixture<EditNotificationComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const lang = { doYouReallyWantToCancelUnsavedData: 'cancelUnsaved', notificationUpdatedSuccessfully: 'updated' };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };
  const DATA = {
    notificationID: 11,
    notification: 'Old subject',
    notificationDesc: 'Old message',
    validFrom: '2026-01-05T08:30:00.000Z',
    validTill: '2026-01-06T17:45:00.000Z',
    role: { RoleID: 2 },
  };

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', [
      'getNotificationType', 'saveEditNotification', 'getRole', 'getRoles', 'getOffices', 'createComponent',
    ]);
    supervisor.getNotificationType.and.returnValue(
      of({ statusCode: 200, data: [{ notificationType: 'Other', notificationTypeID: 1 }, { notificationType: 'Notification', notificationTypeID: 7 }] }),
    );
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);

    await TestBed.configureTestingModule({
      declarations: [EditNotificationComponent],
      providers: [
        FormBuilder,
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: SupervisorService, useValue: supervisor },
        { provide: ConfirmationService, useValue: confirmation },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(EditNotificationComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(EditNotificationComponent);
    component = fixture.componentInstance;
    component.data = { ...DATA };
    fixture.detectChanges();
  });

  const form = (): any => component.editNotifyForm;

  it('patches the existing message and its validity window', () => {
    expect(form().value).toEqual(
      jasmine.objectContaining({ startTime: '08:30', endTime: '17:45', subject: 'Old subject', message: 'Old message' }),
    );
    const start: Date = component.range.controls.start.value;
    expect([start.getFullYear(), start.getMonth(), start.getDate(), start.getHours(), start.getMinutes()]).toEqual([2026, 0, 5, 8, 30]);
    expect(component.communicationTypeId).toBe(7);
    expect(component.uname).toBe('sup1');
  });

  describe('save', () => {
    it('saves the edited message with local times', () => {
      supervisor.saveEditNotification.and.returnValue(of({ statusCode: 200, data: {} }));
      form().patchValue({ subject: 'New subject', startTime: '09:00', endTime: '' });
      component.saveEditNotificationForm();
      const req: any = supervisor.saveEditNotification.calls.mostRecent().args[0];
      expect(req).toEqual(
        jasmine.objectContaining({
          providerServiceMapID: 4,
          notificationTypeID: 7,
          notificationID: 11,
          notification: 'New subject',
          notificationDesc: 'Old message',
          deleted: false,
          modifiedBy: 'sup1',
          roleID: 2,
        }),
      );
      expect(req.validFrom.toISOString()).toBe('2026-01-05T09:00:00.000Z');
      expect(req.validTill.toISOString()).toBe('2026-01-06T23:59:59.000Z');
      expect(confirmation.openDialog).toHaveBeenCalledWith('updated', 'success');
      expect(form().value.subject).toBeNull();
    });

    it('uses midnight without a start time and keeps the form when nothing is returned', () => {
      supervisor.saveEditNotification.and.returnValue(of({ statusCode: 200, data: null }));
      form().patchValue({ startTime: '' });
      component.saveEditNotificationForm();
      const req: any = supervisor.saveEditNotification.calls.mostRecent().args[0];
      expect(req.validFrom.toISOString()).toBe('2026-01-05T00:00:00.000Z');
      expect(req.validTill.toISOString()).toBe('2026-01-06T17:45:00.000Z');
      expect(confirmation.openDialog).not.toHaveBeenCalled();
    });

    it('shows the error message on failure', () => {
      supervisor.saveEditNotification.and.returnValue(of({ statusCode: 5000, errorMessage: 'overlap' }));
      component.saveEditNotificationForm();
      expect(confirmation.openDialog).toHaveBeenCalledWith('overlap', 'error');
    });
  });

  it('validateTime flags invalid same-day ranges', () => {
    const day = new Date(2026, 0, 5);
    component.validateTime(day, day, '10:00', '09:00');
    expect(component.invalidTimeFlag).toBeTrue();
    component.validateTime(day, day, '08:00', '09:00');
    expect(component.invalidTimeFlag).toBeFalse();
    component.validateTime(day, day, '09:00', '09:00');
    expect(component.invalidTimeFlag).toBeTrue();
    component.validateTime(day, new Date(2026, 0, 6), '10:00', '09:00');
    expect(component.invalidTimeFlag).toBeFalse();
  });

  it('getOfficesForAlert stores offices from a successful response', () => {
    supervisor.getOffices.and.returnValue(of({ statusCode: 200, data: ['Office A'] }));
    component.getOfficesForAlert();
    expect(supervisor.getOffices).toHaveBeenCalledWith({ providerServiceMapId: 4, roleID: undefined });
    expect(component.offices).toEqual(['Office A']);
  });

  it('getRolesForAlert stores roles from a successful response', () => {
    supervisor.getRoles.and.returnValue(of({ statusCode: 200, data: [{ roleID: 2 }] }));
    component.getRolesForAlert();
    expect(supervisor.getRoles).toHaveBeenCalledWith({ providerServiceMapId: 4 });
    expect(component.roles as any).toEqual([{ roleID: 2 }]);
  });

  describe('showTable', () => {
    it('resets and returns to the list after confirmation', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      component.showTable();
      expect(confirmation.openDialog).toHaveBeenCalledWith('cancelUnsaved', 'confirm');
      expect(form().value.subject).toBeNull();
      expect(supervisor.createComponent).toHaveBeenCalledWith(SupervisorNotificationComponent, null);
    });

    it('stays when declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.showTable();
      expect(supervisor.createComponent).not.toHaveBeenCalled();
    });
  });
});
