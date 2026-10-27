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
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { CallConfigurationComponent } from './call-configuration.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { CallSectionQuestionaireMappingComponent } from '../call-section-questionaire-mapping/call-section-questionaire-mapping.component';
import { CreateCallConfigurationComponent } from '../create-call-configuration/create-call-configuration.component';
import { EditCallConfigurationComponent } from '../edit-call-configuration/edit-call-configuration.component';

describe('CallConfigurationComponent', () => {
  let component: CallConfigurationComponent;
  let fixture: ComponentFixture<CallConfigurationComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let langService: any;
  const lang = { areYouSureYouWantToDelete: 'sureDelete', callConfigurationDeleted: 'deleted' };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };

  const row = (configId: number, callType: number, baseLine: string | null, start: string, end: string) => ({
    configId,
    callType,
    baseLine,
    effectiveStartDate: start,
    effectiveEndDate: end,
  });
  const ROWS = [
    row(2, 2, 'DOB', '2026-01-01', '2026-12-31'),
    row(1, 2, 'LMP', '2025-01-01', '2025-12-31'),
    row(1, 1, null, '2025-01-01', '2025-12-31'),
    row(2, 1, 'LMP', '2026-01-01', '2026-12-31'),
    row(0, 1, 'LMP', '2024-01-01', '2024-12-31'),
  ];

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', [
      'getCallConfigurations',
      'updateCallConfiguration',
      'createComponent',
    ]);
    supervisor.getCallConfigurations.and.returnValue(of(ROWS.map((r) => ({ ...r }))));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    langService = { languageData: lang, getLanguageData: jasmine.createSpy().and.returnValue(of({ en: 1 })) };

    await TestBed.configureTestingModule({
      declarations: [CallConfigurationComponent],
      providers: [
        { provide: Router, useValue: {} },
        { provide: SupervisorService, useValue: supervisor },
        { provide: SetLanguageService, useValue: langService },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: ConfirmationService, useValue: confirmation },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CallConfigurationComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(CallConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('groups rows by configuration, oldest first, and skips rows without an id', () => {
    expect(supervisor.getCallConfigurations).toHaveBeenCalledWith(4);
    const data: any[] = component.callConfigData.data;
    expect(data.map((c) => c.configId)).toEqual([1, 2]);
    expect(data[0].configurations.map((c: any) => c.callType)).toEqual([1, 2]);
    expect(data[0].effectiveStartDate).toEqual(new Date('2025-01-01'));
    expect(component.paginationLength).toBe(2);
  });

  it('shows request errors', () => {
    supervisor.getCallConfigurations.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getCallConfigurations();
    supervisor.getCallConfigurations.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
    component.getCallConfigurations();
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
  });

  it('loads English language data when none is cached', () => {
    langService.languageData = null;
    component.ngDoCheck();
    expect(langService.getLanguageData).toHaveBeenCalledWith('English');
    expect(component.languageData).toEqual({ en: 1 });
  });

  it('stores the selected configuration', () => {
    component.onConfigSelected({ configurations: [1, 2] });
    expect(component.selectedConfig).toEqual([1, 2]);
  });

  describe('createCallConfiguration', () => {
    it('passes the last end date', () => {
      component.createCallConfiguration();
      expect(supervisor.createComponent).toHaveBeenCalledWith(CreateCallConfigurationComponent, {
        data: new Date('2026-12-31'),
      });
    });

    it('passes null when there are no configurations', () => {
      component.callConfigData.data = [];
      component.createCallConfiguration();
      expect(supervisor.createComponent).toHaveBeenCalledWith(CreateCallConfigurationComponent, { data: null });
    });
  });

  it('isDeleteEnabled is true for current or future end dates', () => {
    const future = new Date(Date.now() + 86400000);
    expect(component.isDeleteEnabled(future)).toBeTrue();
    expect(component.isDeleteEnabled(new Date('2000-01-01'))).toBeFalse();
  });

  it('captureCallsData counts ANC (LMP) and PNC (DOB) calls', () => {
    component.captureCallsData(2);
    expect(component.ancCalls).toBe(1);
    expect(component.pncCalls).toBe(1);
    component.captureCallsData(1);
    expect(component.ancCalls).toBe(1);
    expect(component.pncCalls).toBe(0);
  });

  it('goToEditCallConfig opens the editor with call counts and last end date', () => {
    const config = component.callConfigData.data[0];
    component.goToEditCallConfig(config);
    expect(supervisor.createComponent).toHaveBeenCalledWith(EditCallConfigurationComponent, {
      data: config,
      ancCalls: 1,
      pncCalls: 0,
      lastEndDate: new Date('2026-12-31'),
    });
  });

  it('mapSectionarieQuestionaire opens the mapping screen', () => {
    component.mapSectionarieQuestionaire({ callType: 1 });
    expect(supervisor.createComponent).toHaveBeenCalledWith(CallSectionQuestionaireMappingComponent, {
      data: { callType: 1 },
    });
  });

  describe('deleteConfiguration', () => {
    it('marks every call of the configuration deleted and reloads', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      supervisor.updateCallConfiguration.and.returnValue(of({ ok: true }));
      supervisor.getCallConfigurations.calls.reset();
      const config: any = component.callConfigData.data[1];
      component.deleteConfiguration(config);
      expect(confirmation.openDialog).toHaveBeenCalledWith('sureDelete', 'warn');
      const [reqObj, configId] = supervisor.updateCallConfiguration.calls.mostRecent().args as any[];
      expect(configId).toBe(2);
      expect(reqObj.length).toBe(2);
      expect(reqObj[0]).toEqual(
        jasmine.objectContaining({ deleted: true, createdBy: 'sup1', modifiedBy: 'sup1', psmId: 4 }),
      );
      expect(confirmation.openDialog).toHaveBeenCalledWith('deleted', 'success');
      expect(supervisor.getCallConfigurations).toHaveBeenCalled();
    });

    it('does nothing when declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.deleteConfiguration(component.callConfigData.data[0]);
      expect(supervisor.updateCallConfiguration).not.toHaveBeenCalled();
    });
  });
});
