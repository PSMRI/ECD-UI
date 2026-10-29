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

import { CreateLocationMessageComponent } from './create-location-message.component';
import { LocationMessagesComponent } from '../location-messages/location-messages.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';

describe('CreateLocationMessageComponent', () => {
  let component: CreateLocationMessageComponent;
  let fixture: ComponentFixture<CreateLocationMessageComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let master: jasmine.SpyObj<MasterService>;
  const lang = { doYouReallyWantToCancelUnsavedData: 'cancelUnsaved', createdLocationMessageSuccessfully: 'created' };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', ['getNotificationType', 'saveCreateAlert', 'createComponent']);
    supervisor.getNotificationType.and.returnValue(
      of({ statusCode: 200, data: [{ notificationType: 'Location Message', notificationTypeID: 9 }] }),
    );
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    master = jasmine.createSpyObj('MasterService', ['getOfficeMasterData']);
    master.getOfficeMasterData.and.returnValue(of({ data: [{ pSAddMapID: 31 }] }));

    await TestBed.configureTestingModule({
      declarations: [CreateLocationMessageComponent],
      providers: [
        FormBuilder,
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: SupervisorService, useValue: supervisor },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: MasterService, useValue: master },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CreateLocationMessageComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(CreateLocationMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const form = (): any => component.createLocationForm;

  it('loads offices, the location message type and user', () => {
    expect(master.getOfficeMasterData).toHaveBeenCalledWith(4);
    expect(component.offices).toEqual([{ pSAddMapID: 31 }]);
    expect(component.communicationTypeId).toBe(9);
    expect(component.uname).toBe('sup1');
  });

  it('requires office, subject and message', () => {
    expect(form().valid).toBeFalse();
    form().patchValue({ officeType: 31, subject: 'Closed', message: 'Office closed today' });
    expect(form().valid).toBeTrue();
  });

  it('validateTime flags invalid same-day ranges', () => {
    const day = new Date(2026, 0, 5);
    component.validateTime(day, day, '10:00', '09:00');
    expect(component.invalidTimeFlag).toBeTrue();
    component.validateTime(day, new Date(2026, 0, 6), '10:00', '09:00');
    expect(component.invalidTimeFlag).toBeFalse();
    component.validateTime(day, day, '09:00', '09:00');
    expect(component.invalidTimeFlag).toBeTrue();
    component.validateTime(day, day, '08:00', '09:00');
    expect(component.invalidTimeFlag).toBeFalse();
  });

  describe('saveLocationMessageForm', () => {
    beforeEach(() =>
      form().setValue({ officeType: 31, subject: 'Closed', message: 'Office closed', startTime: '08:00', endTime: '17:45' }),
    );

    it('saves the message for the office with local times', () => {
      component.range.setValue({ start: new Date(2026, 0, 5) as any, end: new Date(2026, 0, 6) as any });
      supervisor.saveCreateAlert.and.returnValue(of({ statusCode: 200, data: [{}] }));
      component.saveLocationMessageForm();
      const [req] = supervisor.saveCreateAlert.calls.mostRecent().args[0] as any[];
      expect(req).toEqual(
        jasmine.objectContaining({
          createdBy: 'sup1',
          notification: 'Closed',
          notificationDesc: 'Office closed',
          notificationTypeID: 9,
          providerServiceMapID: 4,
          workingLocationID: 31,
        }),
      );
      expect(req.validFrom.toISOString()).toBe('2026-01-05T08:00:00.000Z');
      expect(req.validTill.toISOString()).toBe('2026-01-06T17:45:00.000Z');
      expect(confirmation.openDialog).toHaveBeenCalledWith('created', 'success');
      expect(form().value.subject).toBeNull();
    });

    it('defaults missing dates to today with full-day times', () => {
      form().patchValue({ startTime: '', endTime: '' });
      supervisor.saveCreateAlert.and.returnValue(of({ statusCode: 200, data: null }));
      component.saveLocationMessageForm();
      const [req] = supervisor.saveCreateAlert.calls.mostRecent().args[0] as any[];
      expect(req.validFrom.toISOString()).toMatch(/T00:00:00\.000Z$/);
      expect(req.validTill.toISOString()).toMatch(/T23:59:59\.000Z$/);
      expect(confirmation.openDialog).not.toHaveBeenCalled();
    });

    it('shows the error message on failure', () => {
      supervisor.saveCreateAlert.and.returnValue(of({ statusCode: 5000, errorMessage: 'overlap' }));
      component.saveLocationMessageForm();
      expect(confirmation.openDialog).toHaveBeenCalledWith('overlap', 'error');
    });
  });

  describe('showTable', () => {
    it('resets and returns to the list after confirmation', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      form().patchValue({ subject: 'x' });
      component.showTable();
      expect(form().value.subject).toBeNull();
      expect(supervisor.createComponent).toHaveBeenCalledWith(LocationMessagesComponent, null);
    });

    it('stays when declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.showTable();
      expect(supervisor.createComponent).not.toHaveBeenCalled();
    });
  });
});
