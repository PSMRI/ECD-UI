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
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { OpenAlertsNotificationLocationmessagesComponent } from './open-alerts-notification-locationmessages.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { CoreService } from 'src/app/app-modules/services/core/core.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';

describe('OpenAlertsNotificationLocationmessagesComponent', () => {
  let component: OpenAlertsNotificationLocationmessagesComponent;
  let fixture: ComponentFixture<OpenAlertsNotificationLocationmessagesComponent>;
  let core: jasmine.SpyObj<CoreService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<OpenAlertsNotificationLocationmessagesComponent>>;
  const lang = {
    no: 'No ',
    messagesFound: ' messages found',
    found: ' found',
    areYouSureYouWantToDeleteThis: 'Delete this ',
  };
  const session: any = { userID: 9, roleId: 2, providerServiceMapID: 4 };
  const item = (id: number, type: string, extra: any = {}) => ({
    userNotificationMapID: id,
    notificationID: id * 10,
    notification: { notificationType: { notificationType: type } },
    ...extra,
  });
  const ITEMS = [item(1, 'Alert'), item(2, 'Notification'), item(3, 'alert'), { userNotificationMapID: 4 }];

  async function setup(title = 'Alert', response: any = { statusCode: 200, data: ITEMS }) {
    core = jasmine.createSpyObj('CoreService', [
      'getAlertsNotifications', 'deleteAlertNotificationLocMessages', 'markNotificationsAsRead',
    ]);
    core.getAlertsNotifications.and.returnValue(of(response));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [OpenAlertsNotificationLocationmessagesComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { dialogTitle: title, notifyTypeID: 7, data: { notificationTypeID: 7 } } },
        { provide: CoreService, useValue: core },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: ConfirmationService, useValue: confirmation },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(OpenAlertsNotificationLocationmessagesComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(OpenAlertsNotificationLocationmessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads messages for the user and keeps those of the dialog type', async () => {
    await setup();
    expect(component.dialogTitle).toBe('Alert');
    expect(core.getAlertsNotifications).toHaveBeenCalledWith({
      userID: 9,
      roleID: 2,
      notificationTypeID: 7,
      providerServiceMapID: 4,
    });
    expect(component.dialogContent.map((i: any) => i.userNotificationMapID)).toEqual([1, 3]);
    expect(component.currentLanguageSet).toBe(lang);
  });

  describe('when there are no messages', () => {
    beforeEach(() => setup('Alert'));

    it('closes the dialog and reports no alerts', () => {
      component.dialogData = [];
      core.getAlertsNotifications.and.returnValue(of({ statusCode: 200, data: [] }));
      component.getdialogData();
      expect(dialogRef.close).toHaveBeenCalledWith({ result: false });
      expect(confirmation.openDialog).toHaveBeenCalledWith('No Alert messages found', 'info');
    });

    it('keeps the dialog open after deleting the last message', () => {
      core.getAlertsNotifications.and.returnValue(of({ statusCode: 200, data: [] }));
      component.getdialogData();
      expect(dialogRef.close).not.toHaveBeenCalled();
      expect(confirmation.openDialog).toHaveBeenCalledWith('No Alert messages found', 'info');
    });

    it('uses the location message wording', () => {
      component.dialogTitle = 'Location Message';
      core.getAlertsNotifications.and.returnValue(of({ statusCode: 200, data: [] }));
      component.getdialogData();
      component.dialogData = [];
      component.getdialogData();
      expect(confirmation.openDialog).toHaveBeenCalledWith('No Location Message found', 'info');
      expect(confirmation.openDialog).toHaveBeenCalledTimes(2);
    });

    it('ignores unsuccessful responses', () => {
      core.getAlertsNotifications.and.returnValue(of({ statusCode: 5000 }));
      component.getdialogData();
      expect(confirmation.openDialog).not.toHaveBeenCalled();
    });
  });

  describe('deleteNotification', () => {
    beforeEach(() => setup());

    it('deletes after confirmation and reloads', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      core.deleteAlertNotificationLocMessages.and.returnValue(of({ statusCode: 200, data: {} }));
      core.getAlertsNotifications.calls.reset();
      component.deleteNotification(1, 'Alert');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Delete this Alert', 'confirm');
      expect(core.deleteAlertNotificationLocMessages).toHaveBeenCalledWith({ isDeleted: true, userNotificationMapIDList: [1] });
      expect(core.getAlertsNotifications).toHaveBeenCalled();
      expect(component.dialogContent.map((i: any) => i.userNotificationMapID)).toEqual([1, 3]);
    });

    it('shows delete failures and does nothing when declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      core.deleteAlertNotificationLocMessages.and.returnValue(of({ statusCode: 5000, errorMessage: 'nope' }));
      component.deleteNotification(1, 'Alert');
      expect(confirmation.openDialog).toHaveBeenCalledWith('nope', 'error');
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      core.deleteAlertNotificationLocMessages.calls.reset();
      component.deleteNotification(1, 'Alert');
      expect(core.deleteAlertNotificationLocMessages).not.toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    beforeEach(() => setup());

    it('marks the shown messages read and closes with a result', () => {
      core.markNotificationsAsRead.and.returnValue(of({ data: { operation: 'read', status: 'success' } }));
      component.markAllAsRead(ITEMS);
      expect(core.markNotificationsAsRead).toHaveBeenCalledWith({
        notficationStatus: 'read',
        userNotificationMapIDList: [1, 2, 3],
      });
      expect(dialogRef.close).toHaveBeenCalledWith({ result: true });
    });

    it('closes without a result when nothing could be marked', () => {
      core.markNotificationsAsRead.and.returnValue(of({ data: { operation: 'read', status: 'failed' } }));
      component.markAllAsRead([{ userNotificationMapID: 4 }]);
      expect(dialogRef.close).toHaveBeenCalledWith({ result: false });
    });
  });

  it('reInitialize reloads current messages', async () => {
    await setup();
    core.getAlertsNotifications.and.returnValue(
      of({ data: [item(1, 'Alert'), item(5, 'Alert', { notificationState: 'future' })] }),
    );
    component.reInitialize();
    expect(core.getAlertsNotifications.calls.mostRecent().args[0].notificationTypeID).toBe(7);
    expect(component.userIdsArray).toEqual([1]);
    core.getAlertsNotifications.and.returnValue(throwError(() => 'down'));
    expect(() => component.reInitialize()).not.toThrow();
  });
});
