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

import { SupervisorNotificationComponent } from './supervisor-notification.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { CreateNotificationComponent } from '../create-notification/create-notification.component';
import { EditNotificationComponent } from '../edit-notification/edit-notification.component';

describe('SupervisorNotificationComponent', () => {
  let component: SupervisorNotificationComponent;
  let fixture: ComponentFixture<SupervisorNotificationComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let master: jasmine.SpyObj<MasterService>;
  const lang = { areYouSureWantTo: 'Are you sure want to', successfully: 'successfully' };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };
  const ALERTS = () => [
    { notificationID: 1, notification: 'Flood warning', roleID: 2, validFrom: 'a', validTill: 'b', notificationDesc: 'd' },
    { notificationID: 2, notification: 'Holiday', roleID: 3 },
  ];

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', [
      'getAlertsData', 'getNotificationType', 'saveEditAlert', 'createComponent',
    ]);
    supervisor.getNotificationType.and.returnValue(
      of({ statusCode: 200, data: [{ notificationType: 'Notification', notificationTypeID: 1 }, { notificationType: 'Alert', notificationTypeID: 7 }] }),
    );
    supervisor.getAlertsData.and.returnValue(of({ statusCode: 200, data: ALERTS() }));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    master = jasmine.createSpyObj('MasterService', ['getRoleMaster']);
    master.getRoleMaster.and.returnValue(of([{ roleId: 2, roleName: 'ANM' }, { roleId: 3, roleName: 'MO' }]));

    await TestBed.configureTestingModule({
      declarations: [SupervisorNotificationComponent],
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
      .overrideTemplate(SupervisorNotificationComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(SupervisorNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the notification type, roles and user', () => {
    expect(supervisor.getNotificationType).toHaveBeenCalledWith({ providerServiceMapID: 4 });
    expect(component.communicationTypeId).toBe(1);
    expect(master.getRoleMaster).toHaveBeenCalledWith(4);
    expect(component.allRoleIDs).toEqual([2, 3]);
    expect(component.uname).toBe('sup1');
    expect(component.currentLanguageSet).toBe(lang);
  });

  it('reports when no roles are found', () => {
    master.getRoleMaster.and.returnValue(of([]));
    component.getRolesForAlert();
    expect(confirmation.openDialog).toHaveBeenCalledWith(undefined as any, 'No roles found');
  });

  it('logs role lookup errors', () => {
    master.getRoleMaster.and.returnValue(throwError(() => 'boom'));
    component.getRolesForAlert();
    expect(console.log).toHaveBeenCalledWith('boom');
  });


  describe('getNotificationOnSearch', () => {
    it('searches the date range for all roles and numbers the rows', () => {
      component.alertNotificationForm.setValue({
        start: new Date(2026, 0, 1) as any,
        end: new Date(2026, 0, 31) as any,
        searchTerm: '',
      });
      component.getNotificationOnSearch();
      const req: any = supervisor.getAlertsData.calls.mostRecent().args[0];
      expect(req.providerServiceMapID).toBe(4);
      expect(req.notificationTypeID).toBe(1);
      expect(req.roleIDs).toEqual([2, 3]);
      expect(req.validStartDate).toMatch(/^2026-01-01T00:00:00/);
      expect(req.validEndDate).toMatch(/^2026-01-31T23:59:59/);
      expect(component.alertDataSource.data.map((a: any) => a.sno)).toEqual([1, 2]);
    });

    it('shows the error message for a failed search', () => {
      supervisor.getAlertsData.and.returnValue(of({ statusCode: 5000, errorMessage: 'bad range' }));
      component.getNotificationOnSearch();
      expect(confirmation.openDialog).toHaveBeenCalledWith('bad range', 'error');
    });
  });

  it('opens the create and edit screens', () => {
    component.showForm();
    expect(supervisor.createComponent).toHaveBeenCalledWith(CreateNotificationComponent, null);
    component.editAlert({ notificationID: 1 });
    expect(supervisor.createComponent).toHaveBeenCalledWith(EditNotificationComponent, { notificationID: 1 });
  });

  describe('activateDeactivateConfig', () => {
    it('deactivates the notification and refreshes the search', () => {
      supervisor.saveEditAlert.and.returnValue(of({ statusCode: 200 }));
      supervisor.getAlertsData.calls.reset();
      component.searchTerm = 'flood';
      component.activateDeactivateConfig(ALERTS()[0], 'deactivate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Are you sure want to Deactivate?', 'confirm');
      expect(supervisor.saveEditAlert).toHaveBeenCalledWith({
        providerServiceMapID: 4,
        notificationTypeID: 1,
        notificationID: 1,
        roleID: 2,
        validFrom: 'a',
        validTill: 'b',
        notification: 'Flood warning',
        notificationDesc: 'd',
        deleted: 'true',
        modifiedBy: 'sup1',
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('Deactivated successfully', 'success');
      expect(component.searchTerm).toBeNull();
      expect(supervisor.getAlertsData).toHaveBeenCalled();
    });

    it('activates with deleted false', () => {
      supervisor.saveEditAlert.and.returnValue(of({ statusCode: 200 }));
      component.activateDeactivateConfig(ALERTS()[0], 'activate');
      expect(supervisor.saveEditAlert.calls.mostRecent().args[0].deleted).toBe('false');
    });

    it('shows failures and errors', () => {
      supervisor.saveEditAlert.and.returnValue(of({ statusCode: 5000, errorMessage: 'nope' }));
      component.activateDeactivateConfig(ALERTS()[0], 'activate');
      supervisor.saveEditAlert.and.returnValue(throwError(() => ({ error: 'down' })));
      component.activateDeactivateConfig(ALERTS()[0], 'activate');
      supervisor.saveEditAlert.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.activateDeactivateConfig(ALERTS()[0], 'activate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('nope', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });

    it('does nothing when declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.activateDeactivateConfig(ALERTS()[0], 'activate');
      expect(supervisor.saveEditAlert).not.toHaveBeenCalled();
    });
  });


  it('filterSearchTerm filters by notification text', () => {
    component.getNotificationOnSearch();
    component.filterSearchTerm('flood');
    expect(component.alertDataSource.data.map((a: any) => a.notificationID)).toEqual([1]);
    component.filterSearchTerm('');
    expect(component.alertDataSource.data.length).toBe(2);
  });
});
