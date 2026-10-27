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
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { LocationMessagesComponent } from './location-messages.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { CreateLocationMessageComponent } from '../create-location-message/create-location-message.component';
import { EditLocationMessageComponent } from '../edit-location-message/edit-location-message.component';

describe('LocationMessagesComponent', () => {
  let component: LocationMessagesComponent;
  let fixture: ComponentFixture<LocationMessagesComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let master: jasmine.SpyObj<MasterService>;
  let tracking: jasmine.SpyObj<AmritTrackingService>;
  const lang = { areYouSureWantTo: 'Are you sure want to', successfully: 'successfully' };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };
  const MESSAGES = () => [
    { notificationID: 1, notification: 'Office closed', validFrom: 'a', validTill: 'b', notificationDesc: 'd' },
    { notificationID: 2, notification: 'New timings' },
  ];

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', [
      'getLocationOnSearch', 'getNotificationType', 'saveEditAlert', 'createComponent',
    ]);
    supervisor.getNotificationType.and.returnValue(
      of({ statusCode: 200, data: [{ notificationType: 'Alert', notificationTypeID: 7 }, { notificationType: 'Location Message', notificationTypeID: 9 }] }),
    );
    supervisor.getLocationOnSearch.and.returnValue(of({ statusCode: 200, data: MESSAGES() }));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    master = jasmine.createSpyObj('MasterService', ['getOfficeMasterData']);
    master.getOfficeMasterData.and.returnValue(of({ data: [{ pSAddMapID: 31 }, { pSAddMapID: 32 }] }));
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [LocationMessagesComponent],
      providers: [
        FormBuilder,
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: SupervisorService, useValue: supervisor },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: AmritTrackingService, useValue: tracking },
        { provide: MasterService, useValue: master },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(LocationMessagesComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(LocationMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the location message type, offices and user', () => {
    expect(component.communicationTypeId).toBe(9);
    expect(master.getOfficeMasterData).toHaveBeenCalledWith(4);
    expect(component.allOfficeIDs).toEqual([31, 32]);
    expect(component.uname).toBe('sup1');
  });

  it('reports a missing office list and logs office errors', () => {
    master.getOfficeMasterData.and.returnValue(of({ errorMessage: 'no offices' }));
    component.getOfficesForAlert();
    expect(confirmation.openDialog).toHaveBeenCalledWith('no offices', 'error');
    master.getOfficeMasterData.and.returnValue(throwError(() => 'boom'));
    component.getOfficesForAlert();
    expect(console.log).toHaveBeenCalledWith('boom');
  });

  describe('getLocationOnSearch', () => {
    it('searches the date range for all offices and numbers the rows', () => {
      component.locationSearchForm.setValue({
        start: new Date(2026, 0, 1) as any,
        end: new Date(2026, 0, 31) as any,
        searchTerm: '',
      });
      component.getLocationOnSearch();
      const req: any = supervisor.getLocationOnSearch.calls.mostRecent().args[0];
      expect(req.providerServiceMapID).toBe(4);
      expect(req.notificationTypeID).toBe(9);
      expect(req.workingLocationIDs).toEqual([31, 32]);
      expect(req.validStartDate).toMatch(/^2026-01-01T00:00:00/);
      expect(req.validEndDate).toMatch(/^2026-01-31T23:59:59/);
      expect(component.dataSource.data.map((m: any) => m.sno)).toEqual([1, 2]);
    });

    it('shows the error message for a failed search', () => {
      supervisor.getLocationOnSearch.and.returnValue(of({ statusCode: 5000, errorMessage: 'bad range' }));
      component.getLocationOnSearch();
      expect(confirmation.openDialog).toHaveBeenCalledWith('bad range', 'error');
    });
  });

  it('opens the create and edit screens and resets to the table', () => {
    component.showForm();
    expect(supervisor.createComponent).toHaveBeenCalledWith(CreateLocationMessageComponent, null);
    component.editLocation({ notificationID: 1 });
    expect(supervisor.createComponent).toHaveBeenCalledWith(EditLocationMessageComponent, { notificationID: 1 });
    component.editMode = true;
    component.createMode = true;
    component.searchMode = false;
    component.showTable();
    expect([component.searchMode, component.editMode, component.createMode]).toEqual([true, false, false]);
  });

  describe('activateDeactivateConfig', () => {
    it('deactivates the message and refreshes the search', () => {
      supervisor.saveEditAlert.and.returnValue(of({ statusCode: 200 }));
      supervisor.getLocationOnSearch.calls.reset();
      component.activateDeactivateConfig(MESSAGES()[0], 'deactivate');
      expect(supervisor.saveEditAlert).toHaveBeenCalledWith({
        providerServiceMapID: 4,
        notificationTypeID: 9,
        notificationID: 1,
        validFrom: 'a',
        validTill: 'b',
        notification: 'Office closed',
        notificationDesc: 'd',
        deleted: 'true',
        modifiedBy: 'sup1',
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('Deactivated successfully', 'success');
      expect(supervisor.getLocationOnSearch).toHaveBeenCalled();
    });

    it('shows failures and errors', () => {
      supervisor.saveEditAlert.and.returnValue(of({ statusCode: 5000, errorMessage: 'nope' }));
      component.activateDeactivateConfig(MESSAGES()[0], 'activate');
      supervisor.saveEditAlert.and.returnValue(throwError(() => ({ error: 'down' })));
      component.activateDeactivateConfig(MESSAGES()[0], 'activate');
      supervisor.saveEditAlert.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.activateDeactivateConfig(MESSAGES()[0], 'activate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('nope', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });

    it('does nothing when declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.activateDeactivateConfig(MESSAGES()[0], 'activate');
      expect(supervisor.saveEditAlert).not.toHaveBeenCalled();
    });
  });

  it('filterSearchTerm filters by message text', () => {
    component.getLocationOnSearch();
    component.filterSearchTerm('closed');
    expect(component.dataSource.data.map((m: any) => m.notificationID)).toEqual([1]);
    component.filterSearchTerm('');
    expect(component.dataSource.data.length).toBe(2);
  });

  it('tracks field interactions', () => {
    component.trackFieldInteraction('start');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('start', 'Location Messages');
  });
});
