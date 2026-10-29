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


import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { DashboardComponent } from './dashboard.component';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { CoreService } from '../../services/core/core.service';
import { CtiService } from '../../services/cti/cti.service';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';
import { MasterService } from '../../services/masterService/master.service';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { SupervisorService } from '../../services/supervisor/supervisor.service';
import { OpenAlertsNotificationLocationmessagesComponent } from '../alerts-notifications-locationmessages/open-alerts-notification-locationmessages/open-alerts-notification-locationmessages.component';
import { OutboundWorklistComponent } from '../../associate-anm-mo/outbound-worklist/outbound-worklist.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let store: Record<string, any>;
  let login: any;
  let core: any;
  let cti: jasmine.SpyObj<CtiService>;
  let associate: jasmine.SpyObj<AssociateAnmMoService>;
  let master: any;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let router: jasmine.SpyObj<Router>;
  let roleChanged$: BehaviorSubject<boolean>;
  const lang = { no: 'No ', messagesFound: ' messages found', found: ' found' };
  const COUNTS = {
    statusCode: 200,
    data: {
      userNotificationTypeList: [
        { notificationType: 'Alert', notificationTypeUnreadCount: 2 },
        { notificationType: 'Notification', notificationTypeUnreadCount: 3 },
        { notificationType: 'Location Message', notificationTypeUnreadCount: 4 },
      ],
    },
  };

  beforeEach(async () => {
    store = { role: 'Supervisor', userID: 9, roleId: 1, providerServiceMapID: 4 };
    roleChanged$ = new BehaviorSubject<boolean>(false);
    login = {
      agentId: 1001,
      getAlertsNotifLocMessagesCount: jasmine.createSpy('count').and.returnValue(of(COUNTS)),
    };
    core = {
      roleChanged$: roleChanged$.asObservable(),
      getAlertsNotifications: jasmine.createSpy('getAlertsNotifications').and.returnValue(of({ statusCode: 200, data: [{ id: 1 }] })),
    };
    cti = jasmine.createSpyObj('CtiService', ['getAgentState']);
    associate = jasmine.createSpyObj('AssociateAnmMoService', ['loadComponent']);
    master = {
      getFrequencyMaster: jasmine.createSpy('getFrequencyMaster').and.returnValue(
        of([{ name: 'Cycle Wise' }, { name: 'Month Wise' }, { name: 'Quarter Wise' }, { name: 'Year Wise' }]),
      ),
    };
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    supervisor = jasmine.createSpyObj('SupervisorService', ['getNotificationType']);
    supervisor.getNotificationType.and.returnValue(
      of({
        statusCode: 200,
        data: [
          { notificationType: 'Alert', notificationTypeID: 1 },
          { notificationType: 'Notification', notificationTypeID: 2 },
          { notificationType: 'Location Message', notificationTypeID: 3 },
        ],
      }),
    );
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        { provide: LoginserviceService, useValue: login },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: Router, useValue: router },
        { provide: MatDialog, useValue: dialog },
        { provide: CoreService, useValue: core },
        { provide: CtiService, useValue: cti },
        { provide: AssociateAnmMoService, useValue: associate },
        { provide: MasterService, useValue: master },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => (k in store ? store[k] : null), setItem: (k: string, v: any) => (store[k] = v) } },
        { provide: SupervisorService, useValue: supervisor },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(DashboardComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  describe('init', () => {
    beforeEach(() => fixture.detectChanges());

    it('loads frequencies, role, unread counts and notification types', () => {
      expect(master.frequencyMasterList.length).toBe(4);
      expect(master.frequencyMasterListOfScoreChart.map((f: any) => f.name)).toEqual(['Month Wise', 'Year Wise']);
      expect(component.selectedRole).toBe('Supervisor');
      expect(component.agentId).toBe(1001);
      expect(login.getAlertsNotifLocMessagesCount).toHaveBeenCalledWith({ userID: 9, roleID: 1, providerServiceMapID: 4 });
      expect([component.alertCount, component.notificationCount, component.locationCount]).toEqual([2, 3, 4]);
      expect([component.alertTypeId, component.notificationTypeId, component.communicationTypeId]).toEqual([1, 2, 3]);
      expect(cti.getAgentState).not.toHaveBeenCalled();
    });

    it('reloads counts when the role changes', () => {
      login.getAlertsNotifLocMessagesCount.calls.reset();
      roleChanged$.next(true);
      expect(login.getAlertsNotifLocMessagesCount).toHaveBeenCalled();
    });

    it('clears counts when nothing is unread', () => {
      login.getAlertsNotifLocMessagesCount.and.returnValue(of({ statusCode: 200, data: {} }));
      component.getALertsNotifLocMessages();
      expect(component.alertsUnreadCount).toBeNull();
      expect(component.notificationsUnreadCount).toBeNull();
      expect(component.locMessagesUnreadCount).toBeNull();
    });

    it('opens the reports page', () => {
      component.loadReports();
      expect(router.navigate).toHaveBeenCalledWith(['/quality-supervisor/innerpage-quality-supervisor'], {
        queryParams: { data: 'reports' },
      });
    });

    it('clears the frequency master on destroy', () => {
      fixture.destroy();
      expect(master.frequencyMasterList).toBeNull();
    });
  });

  it('shows frequency master errors', () => {
    master.getFrequencyMaster.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getFrequencyMaster();
    master.getFrequencyMaster.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
    component.getFrequencyMaster();
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
  });

  describe('openDialogcomponent', () => {
    beforeEach(() => fixture.detectChanges());

    [
      ['Alert', 'alertCount'],
      ['Notification', 'notificationCount'],
      ['Location Message', 'locationCount'],
    ].forEach(([title, countProp]) => {
      it(`opens ${title} messages and clears the count when read`, () => {
        dialog.open.and.returnValue({ afterClosed: () => of({ result: true }) } as any);
        component.openDialogcomponent({ x: 1 }, title, 7);
        expect(core.getAlertsNotifications).toHaveBeenCalledWith({ userID: 9, roleID: 1, notificationTypeID: 7, providerServiceMapID: 4 });
        expect(dialog.open).toHaveBeenCalledWith(OpenAlertsNotificationLocationmessagesComponent, {
          data: { data: { x: 1 }, dialogTitle: title, notifyTypeID: 7 },
        });
        expect((component as any)[countProp]).toBeUndefined();
      });
    });

    it('keeps counts when the dialog closes without reading', () => {
      dialog.open.and.returnValue({ afterClosed: () => of(undefined) } as any);
      component.openDialogcomponent({}, 'Alert', 1);
      expect(component.alertCount).toBe(2);
    });

    it('reports when there are no messages', () => {
      core.getAlertsNotifications.and.returnValue(of({ statusCode: 200, data: [] }));
      component.openDialogcomponent({}, 'Alert', 1);
      component.openDialogcomponent({}, 'Location Message', 3);
      expect(confirmation.openDialog).toHaveBeenCalledWith('No Alert messages found', 'info');
      expect(confirmation.openDialog).toHaveBeenCalledWith('No Location Message found', 'info');
      expect(dialog.open).not.toHaveBeenCalled();
    });
  });

  it('getdialogData stores or clears the messages', () => {
    fixture.detectChanges();
    component.getdialogData('Alert', 1);
    expect(component.dialogDataType).toEqual([{ id: 1 }]);
    core.getAlertsNotifications.and.returnValue(of({ statusCode: 200, data: [] }));
    component.getdialogData('Alert', 1);
    expect(component.dialogDataType).toEqual([]);
  });

  describe('agent state polling', () => {
    beforeEach(() => (store['role'] = 'ANM'));

    it('opens the outbound worklist when the agent is in a call', fakeAsync(() => {
      cti.getAgentState.and.returnValue(
        of({ data: { stateObj: { stateName: 'incall' }, cust_ph_no: '999', session_id: 'S1' } }),
      );
      fixture.detectChanges();
      tick(0);
      expect(cti.getAgentState).toHaveBeenCalledWith({ agent_id: 1001 });
      expect(store['benPhoneNo']).toBe('999');
      expect(store['callId']).toBe('S1');
      expect(store['onCall']).toBe('true');
      expect(associate.loadComponent).toHaveBeenCalledWith(OutboundWorklistComponent, null);
      tick(15000);
      expect(cti.getAgentState).toHaveBeenCalledTimes(2);
      fixture.destroy();
      discardPeriodicTasks();
    }));

    it('ignores idle agents, missing call ids and errors', fakeAsync(() => {
      cti.getAgentState.and.returnValue(of({ data: { stateObj: { stateName: 'FREE' } } }));
      fixture.detectChanges();
      tick(0);
      cti.getAgentState.and.returnValue(of({ data: { stateObj: { stateName: 'CLOSURE' }, session_id: 'undefined' } }));
      component.getAgentState();
      cti.getAgentState.and.returnValue(throwError(() => 'down'));
      component.getAgentState();
      expect(associate.loadComponent).not.toHaveBeenCalled();
      fixture.destroy();
      discardPeriodicTasks();
    }));
  });
});
