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
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { CallAllocationComponent } from './call-allocation.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';

describe('CallAllocationComponent', () => {
  let component: CallAllocationComponent;
  let fixture: ComponentFixture<CallAllocationComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let master: jasmine.SpyObj<MasterService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let langService: any;
  let tracking: jasmine.SpyObj<AmritTrackingService>;

  const lang = { noDataFound: 'noDataFound', noLanguagesFound: 'noLanguagesFound' };
  const session: any = { providerServiceMapID: 4, userName: 'sup1', roleId: '3' };
  const roles = [
    { roleId: 1, roleName: 'ANM' },
    { roleId: 2, roleName: 'MO' },
    { roleId: 3, roleName: 'Associate' },
  ];
  const agents = [{ userId: 10 }, { userId: 11 }];

  function form() {
    return component.callAllocationForm.controls;
  }

  function fillSearch() {
    form().recordType.setValue('Mother');
    form().phoneNoType.setValue('Self');
    component.range.setValue({ start: new Date(2025, 0, 1) as any, end: new Date(2025, 0, 31) as any });
  }

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', ['getLowRiskRecordsByLanguage', 'getUnallocatedCalls', 'saveAllocateCalls']);
    master = jasmine.createSpyObj('MasterService', [
      'getRoleMaster', 'getLanguageMaster', 'getAgentMasterByRoleId', 'getAgentMasterByRoleIdAndLanguage',
    ]);
    master.getRoleMaster.and.returnValue(of(roles));
    master.getLanguageMaster.and.returnValue(of([{ languageName: 'Hindi' }]));
    master.getAgentMasterByRoleId.and.returnValue(of(agents));
    master.getAgentMasterByRoleIdAndLanguage.and.returnValue(of([agents[0]]));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    langService = { languageData: lang, getLanguageData: jasmine.createSpy('getLanguageData').and.returnValue(of({ en: true })) };
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [CallAllocationComponent],
      providers: [
        { provide: SupervisorService, useValue: supervisor },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SetLanguageService, useValue: langService },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] ?? null } },
        { provide: MasterService, useValue: master },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CallAllocationComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(CallAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('init', () => {
    it('should create and load roles, user role and languages', () => {
      expect(component).toBeTruthy();
      expect(component.enableMotherData).toBeTrue();
      expect(component.roles).toEqual(roles);
      expect(component.userRoles).toBe(3);
      expect(component.languages).toEqual([{ languageName: 'None' }, { languageName: 'Hindi' }]);
      expect(component.currentLanguageSet).toBe(lang);
    });

    it('should show noLanguagesFound for an empty language list', () => {
      master.getLanguageMaster.and.returnValue(of([]));
      component.getLanguageMaster();
      expect(confirmation.openDialog).toHaveBeenCalledWith('noLanguagesFound', 'error');
    });

    it('should show err.error when languages fail to load', () => {
      master.getLanguageMaster.and.returnValue(throwError(() => ({ error: 'lang failed' })));
      component.getLanguageMaster();
      expect(confirmation.openDialog).toHaveBeenCalledWith('lang failed', 'error');
    });

    it('should fall back to loading English when no language data is set', () => {
      langService.languageData = null;
      component.ngDoCheck();
      expect(langService.getLanguageData).toHaveBeenCalledWith('English');
      expect(component.languageData).toEqual({ en: true });
    });
  });

  describe('search button state', () => {
    it('should be disabled until record type, phone type and dates are set', () => {
      expect(component.isSubmitDisabled).toBeTrue();
      form().recordType.setValue('Mother');
      form().phoneNoType.setValue('Self');
      component.checkSubmitDisabledButton();
      expect(component.isSubmitDisabled).toBeTrue();
      component.range.setValue({ start: new Date() as any, end: new Date() as any });
      expect(component.isSubmitDisabled).toBeFalse();
    });

    it('onClickOfRecordType / onClickOfPhoneNoType should store the selection', () => {
      component.onClickOfRecordType({ value: 'Child' });
      component.onClickOfPhoneNoType({ value: 'Others' });
      expect(component.recordType).toBe('Child');
      expect(component.phoneNoType).toBe('Others');
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => fillSearch());

    it('should fetch unallocated calls with formatted dates', () => {
      supervisor.getUnallocatedCalls.and.returnValue(of({ totalIntroductoryRecord: 5 }));
      component.recordType = 'Mother';
      component.onSubmit();
      const args = supervisor.getUnallocatedCalls.calls.mostRecent().args;
      expect(args.slice(0, 3)).toEqual([4, 'Self', 'Mother']);
      expect(args[3]).toMatch(/^2025-01-01T/);
      expect(args[4]).toMatch(/^2025-01-31T/);
      expect(component.recordsData).toEqual({ totalIntroductoryRecord: 5 });
      expect(component.enableAllocate).toBeTrue();
      expect(component.enableMotherData).toBeTrue();
      expect(component.enableAgentAllocation).toBeFalse();
    });

    it('should switch to child data for Child records', () => {
      supervisor.getUnallocatedCalls.and.returnValue(of({}));
      component.recordType = 'Child';
      component.onSubmit();
      expect(component.enableMotherData).toBeFalse();
    });

    it('should show noDataFound for an empty response', () => {
      supervisor.getUnallocatedCalls.and.returnValue(of(null as any));
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('noDataFound', 'info');
      expect(component.enableAllocate).toBeFalse();
    });
  });

  describe('onAllocate', () => {
    beforeEach(() => fillSearch());

    it('introductory should select Associate, load agents and allow optional language', () => {
      component.onAllocate('introductory', 40);
      expect(component.isIntroductory).toBeTrue();
      expect(component.rolesArr).toEqual([roles[2]]);
      expect(form().agentType.value as any).toBe(3);
      expect(component.selectedRoleName).toBe('Associate');
      expect(component.enableLanguage).toBeTrue();
      expect(master.getAgentMasterByRoleId).toHaveBeenCalledWith(3);
      expect(form().numericValue.value as any).toBe(40);
      expect(form().preferredLanguage.hasError('required')).toBeFalse();
    });

    it('low risk should select ANM and require a language', () => {
      component.onAllocate('low risk', 20);
      expect(component.isIntroductory).toBeFalse();
      expect(component.rolesArr).toEqual([roles[0]]);
      expect(component.selectedRoleName).toBe('ANM');
      expect(component.enableLanguage).toBeTrue();
      form().preferredLanguage.updateValueAndValidity();
      expect(form().preferredLanguage.hasError('required')).toBeTrue();
    });

    it('high risk should select MO without language', () => {
      component.onAllocate('high risk', 7);
      expect(component.rolesArr).toEqual([roles[1]]);
      expect(component.selectedRoleName).toBe('MO');
      expect(component.enableLanguage).toBeFalse();
      expect(component.enableAgentAllocation).toBeTrue();
      expect(component.currentMaxAllocatedRecords).toBe(7);
    });
  });

  describe('onClickOfAgentType', () => {
    beforeEach(() => fillSearch());

    it('with language enabled should fetch language counts for ANM and language-filtered agents', () => {
      component.onAllocate('low risk', 20);
      form().preferredLanguage.setValue('Hindi' as any);
      supervisor.getLowRiskRecordsByLanguage.and.returnValue(of({ totalLowRiskRecord: 12, totalIntroductoryRecord: 3 }));
      component.onClickOfAgentType();
      expect(supervisor.getLowRiskRecordsByLanguage.calls.mostRecent().args[5]).toBe('Hindi');
      expect(supervisor.getLowRiskRecordsByLanguage.calls.mostRecent().args[6]).toBe('ANM');
      expect(component.allocateNoOfRecords).toBe(12);
      expect(form().numericValue.value as any).toBe(12);
      expect(master.getAgentMasterByRoleIdAndLanguage).toHaveBeenCalledWith(1, 'Hindi');
      expect(component.allocatesTo).toEqual([agents[0]]);
    });

    it('with language enabled should use introductory counts for Associates', () => {
      component.onAllocate('introductory', 20);
      form().preferredLanguage.setValue('Hindi' as any);
      supervisor.getLowRiskRecordsByLanguage.and.returnValue(of({ totalLowRiskRecord: 12, totalIntroductoryRecord: 3 }));
      component.onClickOfAgentType();
      expect(component.allocateNoOfRecords).toBe(3);
    });

    it('should not load agents when the language count response is empty', () => {
      component.onAllocate('low risk', 20);
      form().preferredLanguage.setValue('Hindi' as any);
      supervisor.getLowRiskRecordsByLanguage.and.returnValue(of(null as any));
      master.getAgentMasterByRoleIdAndLanguage.calls.reset();
      component.onClickOfAgentType();
      expect(master.getAgentMasterByRoleIdAndLanguage).not.toHaveBeenCalled();
    });

    it('choosing "None" should reset language and restore total counts', () => {
      component.recordsData = { totalLowRiskRecord: 30, totalIntroductoryRecord: 8 };
      component.onAllocate('low risk', 20);
      form().preferredLanguage.setValue('None' as any);
      component.onClickOfAgentType();
      expect(form().preferredLanguage.value).toBeNull();
      expect(component.allocateNoOfRecords).toBe(30);
      expect(master.getAgentMasterByRoleId).toHaveBeenCalledWith(1);
    });

    it('choosing "None" for Associates should restore introductory counts', () => {
      component.recordsData = { totalLowRiskRecord: 30, totalIntroductoryRecord: 8 };
      component.onAllocate('introductory', 20);
      form().preferredLanguage.setValue('None' as any);
      component.onClickOfAgentType();
      expect(component.allocateNoOfRecords).toBe(8);
    });
  });

  describe('allocation split and validation', () => {
    beforeEach(() => {
      fillSearch();
      component.onAllocate('high risk', 10);
    });

    it('onClickOfAllocateTo should split records evenly (truncated) across agents', () => {
      form().allocateTo.setValue([10, 11, 12] as any);
      component.onClickOfAllocateTo({ value: [10, 11, 12] });
      expect(component.currentMaxAllocatedRecords).toBe(3);
      expect(form().numericValue.value as any).toBe(3);
      expect(component.isAllocateDisabled).toBeFalse();
    });

    it('onClickOfAllocateTo should set 0 when no agent is chosen', () => {
      form().allocateTo.setValue([] as any);
      component.onClickOfAllocateTo({ value: [] });
      expect(component.currentMaxAllocatedRecords).toBe(0);
      expect(component.isAllocateDisabled).toBeTrue();
    });

    it('should disable allocate when the count exceeds the per-agent maximum', () => {
      form().allocateTo.setValue([10, 11] as any);
      component.onClickOfAllocateTo({ value: [10, 11] });
      form().numericValue.setValue('6');
      component.checkAllocateDisabledButton();
      expect(component.isAllocateDisabled).toBeTrue();
    });

    it('should disable allocate for zero or negative counts', () => {
      form().allocateTo.setValue([10] as any);
      component.onClickOfAllocateTo({ value: [10] });
      form().numericValue.setValue('0');
      component.checkAllocateDisabledButton();
      expect(component.isAllocateDisabled).toBeTrue();
    });

    it('ANM with language enabled needs a preferred language', () => {
      component.onAllocate('low risk', 10);
      form().allocateTo.setValue([10] as any);
      component.onClickOfAllocateTo({ value: [10] });
      expect(component.isAllocateDisabled).toBeTrue();
      form().preferredLanguage.setValue('Hindi' as any);
      component.checkAllocateDisabledButton();
      expect(component.isAllocateDisabled).toBeFalse();
    });
  });

  describe('onClickOfAllocate', () => {
    beforeEach(() => {
      fillSearch();
      component.onAllocate('high risk', 10);
      form().allocateTo.setValue([10, 11] as any);
      form().numericValue.setValue('5');
    });

    it('should send the allocation request and reset on success', () => {
      supervisor.saveAllocateCalls.and.returnValue(of({ response: 'Allocated 10 calls' }));
      component.onClickOfAllocate();
      const req: any = supervisor.saveAllocateCalls.calls.mostRecent().args[0];
      expect(req).toEqual(jasmine.objectContaining({
        fromUserIds: [0], toUserIds: [10, 11], noOfCalls: '5', roleId: 2, roleName: 'MO',
        recordType: 'Mother', phoneNoType: 'Self', psmId: 4, createdBy: 'sup1', isIntroductory: false,
        preferredLanguage: null,
      }));
      expect(req.fdate).toMatch(/^2025-01-01T/);
      expect(confirmation.openDialog).toHaveBeenCalledWith('Allocated 10 calls', 'success');
      expect(form().recordType.value).toBeNull();
      expect(component.enableAgentAllocation).toBeFalse();
      expect(component.isSubmitDisabled).toBeTrue();
      expect(component.selectedRoleName).toBeNull();
    });

    it('should show the error message when allocation is rejected', () => {
      supervisor.saveAllocateCalls.and.returnValue(of({ errorMessage: 'Not enough records' }));
      component.onClickOfAllocate();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Not enough records', 'error');
      expect(component.enableAgentAllocation).toBeTrue();
    });

    it('should show err.error when allocation fails', () => {
      supervisor.saveAllocateCalls.and.returnValue(throwError(() => ({ error: 'alloc failed' })));
      component.onClickOfAllocate();
      expect(confirmation.openDialog).toHaveBeenCalledWith('alloc failed', 'error');
    });

    it('should show title + detail when allocation fails without err.error', () => {
      supervisor.saveAllocateCalls.and.returnValue(throwError(() => ({ title: 'A', detail: 'B' })));
      component.onClickOfAllocate();
      expect(confirmation.openDialog).toHaveBeenCalledWith('AB', 'error');
    });
  });

  it('trackFieldInteraction should report to tracking', () => {
    component.trackFieldInteraction('agentType');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('agentType', 'Call Allocation');
  });
});
