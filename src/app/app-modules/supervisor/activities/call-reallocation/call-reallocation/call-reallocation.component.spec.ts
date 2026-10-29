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

import { CallReallocationComponent } from './call-reallocation.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';

describe('CallReallocationComponent', () => {
  let component: CallReallocationComponent;
  let fixture: ComponentFixture<CallReallocationComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let master: jasmine.SpyObj<MasterService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let langService: any;
  let tracking: jasmine.SpyObj<AmritTrackingService>;

  const lang = { noDataFound: 'noDataFound', noLanguagesFound: 'noLanguagesFound' };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };
  const roles = [
    { roleId: 1, roleName: 'ANM' },
    { roleId: 2, roleName: 'MO' },
    { roleId: 3, roleName: 'Associate' },
    { roleId: 4, roleName: 'Supervisor' },
  ];
  const agents = [{ userId: 10 }, { userId: 11 }, { userId: 12 }];

  function f() {
    return component.callReallocationForm.controls;
  }

  function fillSearch(role = 'MO', roleId = 2) {
    f().selectedRadioButton.setValue('1');
    f().agentTypes.setValue(roleId as any);
    f().agentName.setValue(10 as any);
    f().recordType.setValue('Mother');
    f().phoneNoType.setValue('Self');
    component.range.setValue({ start: new Date(2025, 0, 1) as any, end: new Date(2025, 0, 31) as any });
    component.setAgentRoleName(role);
  }

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', ['getAllocatedCounts', 'updateReallocateCalls', 'deleteReallocatedCalls']);
    master = jasmine.createSpyObj('MasterService', ['getRoleMaster', 'getLanguageMaster', 'getAgentMasterByRoleId', 'getAgentMasterByRoleIdAndLanguage']);
    master.getRoleMaster.and.returnValue(of(roles));
    master.getLanguageMaster.and.returnValue(of([{ languageName: 'Hindi' }]));
    master.getAgentMasterByRoleId.and.returnValue(of(agents));
    master.getAgentMasterByRoleIdAndLanguage.and.returnValue(of([agents[0]]));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    langService = { languageData: lang, getLanguageData: jasmine.createSpy('getLanguageData').and.returnValue(of({ en: 1 })) };
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [CallReallocationComponent],
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
      .overrideTemplate(CallReallocationComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(CallReallocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('init', () => {
    it('should create with agent roles (Associate/ANM/MO) and languages', () => {
      expect(component).toBeTruthy();
      expect(component.rolesArr.map((r: any) => r.roleName)).toEqual(['ANM', 'MO', 'Associate']);
      expect(component.languages).toEqual([{ languageName: 'Hindi' }]);
      expect(component.currentLanguageSet).toBe(lang);
    });

    it('should show noLanguagesFound for an empty language list', () => {
      master.getLanguageMaster.and.returnValue(of([]));
      component.getLanguageMaster();
      expect(confirmation.openDialog).toHaveBeenCalledWith('noLanguagesFound', 'error');
    });

    it('should show err.error when languages fail', () => {
      master.getLanguageMaster.and.returnValue(throwError(() => ({ error: 'l failed' })));
      component.getLanguageMaster();
      expect(confirmation.openDialog).toHaveBeenCalledWith('l failed', 'error');
    });

    it('should load English when no language data is set', () => {
      langService.languageData = undefined;
      component.ngDoCheck();
      expect(langService.getLanguageData).toHaveBeenCalledWith('English');
    });
  });

  describe('role and agent selection', () => {
    it('onClickOfRoles should load agents for non-ANM roles', () => {
      component.onClickOfRoles({ value: 2 });
      expect(master.getAgentMasterByRoleId).toHaveBeenCalledWith(2);
      expect(component.agentNames).toEqual(agents);
      expect(component.allocatesTo).toEqual(agents);
      expect(f().agentName.value).toBeNull();
    });

    it('onClickOfRoles should wait for a language before loading ANM agents', () => {
      component.onClickOfRoles({ value: 1 });
      expect(master.getAgentMasterByRoleId).not.toHaveBeenCalled();
      expect(component.agentNames).toEqual([]);
    });

    it('onClickOfRoles should ignore unknown roles', () => {
      component.onClickOfRoles({ value: 99 });
      expect(master.getAgentMasterByRoleId).not.toHaveBeenCalled();
    });

    it('onSelectionOfLanguage should load agents for the role and language', () => {
      f().agentTypes.setValue(1 as any);
      f().preferredLanguage.setValue('Hindi' as any);
      component.onSelectionOfLanguage();
      expect(master.getAgentMasterByRoleIdAndLanguage).toHaveBeenCalledWith(1, 'Hindi');
      expect(component.agentNames).toEqual([agents[0]]);
    });

    it('setAgentRoleName should enable language and reset sticky flag for Associates', () => {
      f().isStickyAgent.setValue(true);
      component.setAgentRoleName('Associate');
      expect(component.enableLanguage).toBeTrue();
      expect(f().isStickyAgent.value).toBeFalse();
      expect(f().preferredLanguage.hasError('required')).toBeFalse();
    });

    it('setAgentRoleName should require a language for ANM', () => {
      component.setAgentRoleName('ANM');
      f().preferredLanguage.updateValueAndValidity();
      expect(component.enableLanguage).toBeTrue();
      expect(f().preferredLanguage.hasError('required')).toBeTrue();
    });

    it('setAgentRoleName should disable and clear language for MO', () => {
      f().preferredLanguage.setValue('Hindi' as any);
      component.setAgentRoleName('MO');
      expect(component.enableLanguage).toBeFalse();
      expect(f().preferredLanguage.value).toBeNull();
    });

    it('setAgentRoleName should handle a null role', () => {
      component.setAgentRoleName(null);
      expect(component.enableLanguage).toBeFalse();
    });
  });

  describe('search button state', () => {
    it('should be enabled only when all search fields are filled', () => {
      expect(component.isSubmitDisabled).toBeTrue();
      fillSearch();
      component.checkSubmitDisabledButton();
      expect(component.isSubmitDisabled).toBeFalse();
      f().agentName.setValue(null);
      component.onClickOfAgents({ value: null });
      expect(component.isSubmitDisabled).toBeTrue();
    });

    it('selection handlers should store values', () => {
      component.onClickOfRecordType({ value: 'Child' });
      component.onClickOfPhoneNoType({ value: 'Others' });
      component.onClickOfAgents({ value: 10 });
      expect(component.recordType).toBe('Child');
      expect(component.phoneNoType).toBe('Others');
      expect(component.agentName).toBe(10);
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.onClickOfRoles({ value: 2 });
      fillSearch();
    });

    it('should fetch allocated counts and exclude the source agent from targets', () => {
      supervisor.getAllocatedCounts.and.returnValue(of({ totalCount: 9 }));
      component.onSubmit();
      const req: any = supervisor.getAllocatedCounts.calls.mostRecent().args[0];
      expect(req).toEqual(jasmine.objectContaining({
        userId: 10, roleId: 2, roleName: 'MO', recordType: 'Mother', phoneNoType: 'Self',
        psmId: 4, createdBy: 'sup1', isStickyAgent: false, preferredLanguage: null,
      }));
      expect(req.fdate).toMatch(/^2025-01-01T/);
      expect(component.totalCount).toBe(9);
      expect(component.callReallocateForm.controls.numericValue.value as any).toBe(9);
      expect(component.agentArr.map((a: any) => a.userId)).toEqual([11, 12]);
      expect(component.enableAllocate).toBeTrue();
      expect(component.isDisableUnallocateButton).toBeFalse();
      expect(component.reallocateEnabled).toBeTrue();
      expect(component.unallocateEnabled).toBeFalse();
    });

    it('should switch to unallocate mode for option 2', () => {
      supervisor.getAllocatedCounts.and.returnValue(of({ totalCount: 0 }));
      f().selectedRadioButton.setValue('2');
      component.onSubmit();
      expect(component.unallocateEnabled).toBeTrue();
      expect(component.reallocateEnabled).toBeFalse();
      expect(component.isDisableUnallocateButton).toBeTrue();
    });

    it('should show noDataFound for an empty response', () => {
      supervisor.getAllocatedCounts.and.returnValue(of(null as any));
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('noDataFound', 'info');
      expect(component.enableAllocate).toBeFalse();
    });
  });

  describe('reallocation split', () => {
    beforeEach(() => {
      component.totalCount = 10;
    });

    it('should split counts evenly (truncated) across target agents', () => {
      component.callReallocateForm.controls.allocateTo.setValue([11, 12, 13] as any);
      component.onClickOfAllocateTo();
      expect(component.currentMaxAllocatedRecords).toBe(3);
      expect(component.callReallocateForm.controls.numericValue.value as any).toBe(3);
      expect(component.isDisableUnallocateButton).toBeFalse();
    });

    it('should set 0 and disable when no target is chosen', () => {
      component.callReallocateForm.controls.allocateTo.setValue([] as any);
      component.onClickOfAllocateTo();
      expect(component.currentMaxAllocatedRecords).toBe(0);
      expect(component.isDisableUnallocateButton).toBeTrue();
    });

    it('should disable for counts above the maximum or not positive', () => {
      component.currentMaxAllocatedRecords = 5;
      component.callReallocateForm.controls.numericValue.setValue('6');
      component.enableUnallocateReallocateButton();
      expect(component.isDisableUnallocateButton).toBeTrue();
      component.callReallocateForm.controls.numericValue.setValue('0');
      component.enableUnallocateReallocateButton();
      expect(component.isDisableUnallocateButton).toBeTrue();
      component.callReallocateForm.controls.numericValue.setValue('5');
      component.enableUnallocateReallocateButton();
      expect(component.isDisableUnallocateButton).toBeFalse();
    });
  });

  describe('onClickOfAllocate (reallocate)', () => {
    beforeEach(() => {
      fillSearch();
      component.callReallocateForm.setValue({ allocateTo: [11, 12] as any, numericValue: '4' });
    });

    it('should send the reallocation and reset on success', () => {
      supervisor.updateReallocateCalls.and.returnValue(of({ response: 'Reallocated' }));
      component.enableAgentAllocation = true;
      component.onClickOfAllocate();
      const req: any = supervisor.updateReallocateCalls.calls.mostRecent().args[0];
      expect(req).toEqual(jasmine.objectContaining({ toUserIds: [11, 12], userId: 10, noOfCalls: '4', roleName: 'MO' }));
      expect(confirmation.openDialog).toHaveBeenCalledWith('Reallocated', 'success');
      expect(component.enableAgentAllocation).toBeFalse();
      expect(component.callReallocateForm.controls.allocateTo.value).toBeNull();
    });

    it('should show the error message when rejected', () => {
      supervisor.updateReallocateCalls.and.returnValue(of({ response: null, errorMessage: 'nope' }));
      component.onClickOfAllocate();
      expect(confirmation.openDialog).toHaveBeenCalledWith('nope', 'error');
      expect(component.enableAllocate).toBeFalse();
    });

    it('should show err.error when it fails', () => {
      supervisor.updateReallocateCalls.and.returnValue(throwError(() => ({ error: 'r failed' })));
      component.onClickOfAllocate();
      expect(confirmation.openDialog).toHaveBeenCalledWith('r failed', 'error');
    });

    it('should show title + detail when it fails without err.error', () => {
      supervisor.updateReallocateCalls.and.returnValue(throwError(() => ({ title: 'A', detail: 'B' })));
      component.onClickOfAllocate();
      expect(confirmation.openDialog).toHaveBeenCalledWith('AB', 'error');
    });
  });

  describe('onClickOfBin (unallocate)', () => {
    beforeEach(() => {
      component.callReallocateForm.controls.numericValue.setValue('3');
    });

    it('should flag Associate unallocation as introductory', () => {
      fillSearch('Associate', 3);
      supervisor.deleteReallocatedCalls.and.returnValue(of({ response: 'Removed' }));
      component.onClickOfBin();
      const req: any = supervisor.deleteReallocatedCalls.calls.mostRecent().args[0];
      expect(req.isIntroductory).toBeTrue();
      expect(req.toUserIds).toEqual([0]);
      expect(req.noOfCalls).toBe('3');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Removed', 'success');
    });

    it('should not flag MO unallocation as introductory', () => {
      fillSearch('MO', 2);
      supervisor.deleteReallocatedCalls.and.returnValue(of({ response: 'Removed' }));
      component.onClickOfBin();
      expect((supervisor.deleteReallocatedCalls.calls.mostRecent().args[0] as any).isIntroductory).toBeFalse();
    });

    it('should show the error message when rejected', () => {
      fillSearch();
      supervisor.deleteReallocatedCalls.and.returnValue(of({ response: null, errorMessage: 'cannot' }));
      component.onClickOfBin();
      expect(confirmation.openDialog).toHaveBeenCalledWith('cannot', 'error');
    });

    it('should show err.error when it fails', () => {
      fillSearch();
      supervisor.deleteReallocatedCalls.and.returnValue(throwError(() => ({ error: 'd failed' })));
      component.onClickOfBin();
      expect(confirmation.openDialog).toHaveBeenCalledWith('d failed', 'error');
    });

    it('should show title + detail when it fails without err.error', () => {
      fillSearch();
      supervisor.deleteReallocatedCalls.and.returnValue(throwError(() => ({ title: 'X', detail: 'Y' })));
      component.onClickOfBin();
      expect(confirmation.openDialog).toHaveBeenCalledWith('XY', 'error');
    });

    it('should throw when no role has been selected (edge case)', () => {
      expect(() => component.onClickOfBin()).toThrowError(TypeError);
    });
  });

  it('onRadioButtonChange should reset everything', () => {
    fillSearch('ANM', 1);
    component.reallocateEnabled = true;
    component.onRadioButtonChange();
    expect(component.selectedRadioButtonChange).toBeTrue();
    expect(component.reallocateEnabled).toBeFalse();
    expect(component.selectedRoleName).toBeNull();
    expect(component.enableLanguage).toBeFalse();
    expect(f().agentName.value).toBeNull();
    expect(f().isStickyAgent.value).toBeFalse();
    expect(component.range.value.start).toBeNull();
  });

  it('trackFieldInteraction should report to tracking', () => {
    component.trackFieldInteraction('agentName');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('agentName', 'Call Reallocation');
  });
});
