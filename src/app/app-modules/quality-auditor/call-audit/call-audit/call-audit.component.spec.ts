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


import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Subject, of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { CallAuditComponent } from './call-audit.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { QualityAuditorService } from 'src/app/app-modules/services/quality-auditor/quality-auditor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { CallRatingComponent } from '../../call-rating/call-rating.component';
import { ViewCasesheetComponent } from '../../view-casesheet/view-casesheet.component';

describe('CallAuditComponent', () => {
  let component: CallAuditComponent;
  let fixture: ComponentFixture<CallAuditComponent>;
  let qaService: any;
  let master: jasmine.SpyObj<MasterService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const lang: any = {
    noRolesFound: 'noRolesFound',
    noCyclesFound: 'noCyclesFound',
    noLanguagesFound: 'noLanguagesFound',
    noAgentsFoundFor: 'noAgentsFoundFor ',
    role: ' role',
    noDataFoundForCallRating: 'noDataFoundForCallRating',
  };
  const session: any = { providerServiceMapID: 4, userID: 77 };
  const roles = [
    { roleId: 1, roleName: 'ANM' },
    { roleId: 2, roleName: 'MO' },
    { roleId: 3, roleName: 'Associate' },
    { roleId: 4, roleName: 'Supervisor' },
  ];
  const worklist = [
    { beneficiaryid: 1001, beneficiaryname: 'Asha', phoneNo: '9876543210', agetname: 'Ravi', outboundCallType: 'Intro', benCallID: 5, remarks: 'hidden' },
    { beneficiaryid: 2002, beneficiaryname: 'Meena', phoneNo: '9123456780', agetname: 'Sita', outboundCallType: 'ANC', benCallID: 6 },
  ];

  function fakePaginator(): any {
    return {
      page: new Subject(),
      initialized: new Subject(),
      pageIndex: 0,
      pageSize: 10,
      length: 0,
      firstPage: jasmine.createSpy('firstPage'),
    };
  }

  function create(data?: any) {
    fixture = TestBed.createComponent(CallAuditComponent);
    component = fixture.componentInstance;
    component.data = data;
    component.paginator = fakePaginator();
  }

  beforeEach(async () => {
    qaService = jasmine.createSpyObj('QualityAuditorService', [
      'getQualityAuditorWorklist',
      'getQualityAuditorDateWorklist',
      'loadComponent',
    ]);
    qaService.showForm = true;
    qaService.isCycleWiseForm = true;
    qaService.callAuditData = [];
    master = jasmine.createSpyObj('MasterService', [
      'getRoleMaster',
      'getCyclesMaster',
      'getLanguageMasterByUserId',
      'getAgentMasterByRoleId',
    ]);
    master.getRoleMaster.and.returnValue(of(roles));
    master.getCyclesMaster.and.returnValue(of([{ id: 1, name: 'Cycle 1' }]));
    master.getLanguageMasterByUserId.and.returnValue(of([{ languageId: 1, languageName: 'Hindi' }]));
    master.getAgentMasterByRoleId.and.returnValue(of([{ userId: 10 }]));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [CallAuditComponent],
      providers: [
        FormBuilder,
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: QualityAuditorService, useValue: qaService },
        { provide: MasterService, useValue: master },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: MatDialog, useValue: dialog },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CallAuditComponent, '')
      .compileComponents();

    create();
  });

  describe('ngOnInit', () => {
    it('should create and load masters', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
      expect(component.currentLanguageSet).toBe(lang);
      expect(master.getRoleMaster).toHaveBeenCalledWith(4);
      expect(master.getCyclesMaster).toHaveBeenCalledWith(4);
      expect(master.getLanguageMasterByUserId).toHaveBeenCalledWith(77);
      expect(component.cycles.length).toBe(1);
      expect(component.languages.length).toBe(1);
    });

    it('should keep only ANM, MO and Associate roles (case-insensitive)', () => {
      fixture.detectChanges();
      expect(component.roles.map((r: any) => r.roleName)).toEqual(['ANM', 'MO', 'Associate']);
    });

    it('should populate the last 6 years and default to cycle-wise', () => {
      fixture.detectChanges();
      const y = new Date().getFullYear();
      expect(component.years).toEqual([y - 5, y - 4, y - 3, y - 2, y - 1, y]);
      expect(component.callAuditForm.controls['selectedRadioButton'].value).toBe('1');
      expect(component.iscycleWiseChangeForm).toBeTrue();
    });

    it('should restore paginator state from input data', fakeAsync(() => {
      const paginator = { ...fakePaginator(), length: 50, pageIndex: 2, pageSize: 25 };
      create({ data: { paginator }, sort: undefined });
      fixture.detectChanges();
      flush();
      expect(component.lastLength).toBe(50);
      expect(component.lastPageIndex).toBe(2);
      expect(component.lastPageSize).toBe(25);
    }));

    it('should restore a cycle-wise search when returning from rating', () => {
      qaService.showForm = false;
      qaService.isCycleWiseForm = true;
      qaService.callAuditData = { role: 'ANM', roleId: 1, language: 1, agentId: 10, isValid: 'true', year: 2020, month: 3, cycle: 1 };
      qaService.getQualityAuditorWorklist.and.returnValue(of(worklist));
      fixture.detectChanges();

      expect(component.cycleWiseForm.controls.agentId.value as any).toBe(10);
      expect(component.months.length).toBe(12);
      expect(master.getAgentMasterByRoleId).toHaveBeenCalledWith(1);
      expect(qaService.getQualityAuditorWorklist).toHaveBeenCalled();
      expect(component.callAuditData.data.length).toBe(2);
    });

    it('should restore a date-wise search when returning from rating', () => {
      qaService.showForm = false;
      qaService.isCycleWiseForm = false;
      qaService.callAuditData = { role: 'MO', roleId: 2, language: 1, agentId: 10, isValid: 'false', start: new Date(), end: new Date(), phoneNo: '' };
      qaService.getQualityAuditorDateWorklist.and.returnValue(of(worklist));
      fixture.detectChanges();

      expect(component.callAuditForm.controls['selectedRadioButton'].value).toBe('2');
      expect(component.iscycleWiseChangeForm).toBeFalse();
      expect(master.getAgentMasterByRoleId).toHaveBeenCalledWith(2);
      expect(qaService.getQualityAuditorDateWorklist).toHaveBeenCalled();
    });

    it('should not restore anything when stored data is null', () => {
      qaService.showForm = false;
      qaService.isCycleWiseForm = false;
      qaService.callAuditData = null;
      fixture.detectChanges();
      expect(qaService.getQualityAuditorWorklist).not.toHaveBeenCalled();
      expect(qaService.getQualityAuditorDateWorklist).not.toHaveBeenCalled();
    });
  });

  describe('master data failures', () => {
    const cases: Array<[string, keyof MasterService, string]> = [
      ['roles', 'getRoleMaster', 'noRolesFound'],
      ['cycles', 'getCyclesMaster', 'noCyclesFound'],
      ['languages', 'getLanguageMasterByUserId', 'noLanguagesFound'],
    ];
    cases.forEach(([label, method, msg]) => {
      it(`should show ${msg} when no ${label} are returned`, () => {
        (master[method] as jasmine.Spy).and.returnValue(of([]));
        fixture.detectChanges();
        expect(confirmation.openDialog).toHaveBeenCalledWith(msg, 'error');
      });

      it(`should show err.error when loading ${label} fails`, () => {
        (master[method] as jasmine.Spy).and.returnValue(throwError(() => ({ error: label + ' failed' })));
        fixture.detectChanges();
        expect(confirmation.openDialog).toHaveBeenCalledWith(label + ' failed', 'error');
      });
    });
  });

  describe('getMonths', () => {
    beforeEach(() => fixture.detectChanges());

    it('should list months up to the current month for the current year', () => {
      component.cycleWiseForm.controls.year.setValue(new Date().getFullYear() as any);
      component.getMonths();
      expect(component.months.length).toBe(new Date().getMonth() + 1);
      expect(component.months[0].id).toBe(1);
    });

    it('should list all 12 months for a past year', () => {
      component.cycleWiseForm.controls.year.setValue('2020');
      component.getMonths();
      expect(component.months.length).toBe(12);
      expect(component.months[11].id).toBe(12);
    });

    it('should list all 12 months when no year is selected', () => {
      component.getMonths();
      expect(component.months.length).toBe(12);
    });
  });

  describe('role and agent selection', () => {
    beforeEach(() => fixture.detectChanges());

    it('getRoleId should set roleId and reset agent in cycle-wise mode', () => {
      component.cycleWiseForm.controls.agentId.setValue('10');
      component.cycleWiseForm.controls.role.setValue('MO');
      component.getRoleId();
      expect(component.cycleWiseForm.controls.roleId.value as any).toBe(2);
      expect(component.cycleWiseForm.controls.agentId.value).toBeNull();
    });

    it('getRoleId should set roleId in date-wise mode', () => {
      component.callAuditForm.controls['selectedRadioButton'].setValue('2');
      component.dateWiseForm.controls.role.setValue('Associate');
      component.getRoleId();
      expect(component.dateWiseForm.controls.roleId.value as any).toBe(3);
    });

    it('getRoleId should leave roleId unchanged for an unknown role', () => {
      component.cycleWiseForm.controls.role.setValue('Unknown');
      component.getRoleId();
      expect(component.cycleWiseForm.controls.roleId.value).toBe('');
    });

    it('getAgentByRole should load agents for cycle-wise role', () => {
      component.cycleWiseForm.controls.roleId.setValue('1');
      component.getAgentByRole();
      expect(master.getAgentMasterByRoleId).toHaveBeenCalledWith('1');
      expect(component.agents).toEqual([{ userId: 10 }]);
    });

    it('getAgentByRole should load agents for date-wise role', () => {
      component.callAuditForm.controls['selectedRadioButton'].setValue('2');
      component.dateWiseForm.controls.roleId.setValue('2');
      component.getAgentByRole();
      expect(master.getAgentMasterByRoleId).toHaveBeenCalledWith('2');
    });

    it('getAgentByRole should show a message when no agents exist', () => {
      master.getAgentMasterByRoleId.and.returnValue(of([]));
      component.cycleWiseForm.controls.role.setValue('ANM');
      component.getAgentByRole();
      expect(confirmation.openDialog).toHaveBeenCalledWith('noAgentsFoundFor ANM role', 'error');
    });

    it('getAgentByRole should show a message when no agents exist (date-wise)', () => {
      master.getAgentMasterByRoleId.and.returnValue(of([]));
      component.callAuditForm.controls['selectedRadioButton'].setValue('2');
      component.dateWiseForm.controls.role.setValue('MO');
      component.getAgentByRole();
      expect(confirmation.openDialog).toHaveBeenCalledWith('noAgentsFoundFor MO role', 'error');
    });

    it('getAgentByRole should show err.error on failure (both modes)', () => {
      master.getAgentMasterByRoleId.and.returnValue(throwError(() => ({ error: 'agents failed' })));
      component.getAgentByRole();
      component.callAuditForm.controls['selectedRadioButton'].setValue('2');
      component.getAgentByRole();
      expect(confirmation.openDialog).toHaveBeenCalledTimes(2);
      expect(confirmation.openDialog).toHaveBeenCalledWith('agents failed', 'error');
    });

    // Documents current behaviour: getRoleNames reads `rolename` (lower-case n),
    // which does not exist on role masters, so the role is patched with undefined.
    it('getRoleNames patches undefined because of the rolename property typo', () => {
      qaService.callAuditData = { roleId: 1 };
      component.getRoleNames();
      expect(component.cycleWiseForm.controls.role.value).toBeUndefined();
      component.callAuditForm.controls['selectedRadioButton'].setValue('2');
      component.getRoleNames();
      expect(component.dateWiseForm.controls.role.value).toBeUndefined();
    });
  });

  describe('cycle-wise worklist', () => {
    beforeEach(() => {
      fixture.detectChanges();
      // @ViewChild resets to undefined with the empty template; re-attach a fake
      component.paginator = fakePaginator();
      component.cycleWiseForm.patchValue({
        role: 'ANM', roleId: '1', language: '1', agentId: '10', isValid: 'true', year: '2025', month: '3', cycle: '2',
      });
    });

    it('should send the cycle-wise request and populate the table', () => {
      qaService.getQualityAuditorWorklist.and.returnValue(of(worklist));
      component.getQualityAudiotorWorklist();

      expect(qaService.getQualityAuditorWorklist).toHaveBeenCalledWith({
        psmId: 4, languageId: '1', agentId: '10', roleId: '1', isValid: true,
        year: '2025', month: '3', cycleId: '2', fromDate: null, toDate: null,
      });
      expect(qaService.callAuditData).toEqual(component.cycleWiseForm.value);
      expect(qaService.isCycleWiseForm).toBeTrue();
      expect(component.callData).toEqual(worklist);
      expect(component.callAuditData.data).toEqual(worklist);
    });

    it('should map isValid "false" to false', () => {
      qaService.getQualityAuditorWorklist.and.returnValue(of(worklist));
      component.cycleWiseForm.controls.isValid.setValue('false');
      component.getQualityAudiotorWorklist();
      expect(qaService.getQualityAuditorWorklist.calls.mostRecent().args[0].isValid).toBeFalse();
    });

    it('should show no-data message and clear the table on empty result', () => {
      component.callData = worklist;
      qaService.getQualityAuditorWorklist.and.returnValue(of([]));
      component.getQualityAudiotorWorklist();
      expect(confirmation.openDialog).toHaveBeenCalledWith('noDataFoundForCallRating', 'error');
      expect(component.callData).toEqual([]);
      expect(component.callAuditData.data).toEqual([]);
    });

    it('should show the API error message for a non-array response', () => {
      qaService.getQualityAuditorWorklist.and.returnValue(of({ errorMessage: 'Invalid cycle' }));
      component.getQualityAudiotorWorklist();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Invalid cycle', 'error');
      expect(component.callData).toEqual([]);
    });

    it('should show err.error when the API fails', () => {
      qaService.getQualityAuditorWorklist.and.returnValue(throwError(() => ({ error: 'wl failed' })));
      component.getQualityAudiotorWorklist();
      expect(confirmation.openDialog).toHaveBeenCalledWith('wl failed', 'error');
    });

    it('onSearchClicked should reset paging and search', () => {
      qaService.getQualityAuditorWorklist.and.returnValue(of(worklist));
      component.lastLength = 5;
      component.onSearchClicked();
      expect(component.paginator.firstPage).toHaveBeenCalled();
      expect(component.lastLength).toBeNull();
      expect(component.lastPageIndex).toBeNull();
      expect(component.lastPageSize).toBeNull();
      expect(qaService.getQualityAuditorWorklist).toHaveBeenCalled();
    });

    it('refresh should restore the previous paginator position when known', () => {
      component.lastLength = 40;
      component.lastPageIndex = 3;
      component.lastPageSize = 5;
      component.refresh(worklist);
      expect(component.paginator.pageIndex).toBe(3);
      expect(component.paginator.pageSize).toBe(5);
    });
  });

  describe('date-wise worklist', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.callAuditForm.controls['selectedRadioButton'].setValue('2');
      component.dateWiseForm.patchValue({
        roleId: '2', language: '1', agentId: '10', isValid: 'true',
        start: new Date(2025, 0, 1) as any, end: new Date(2025, 0, 31) as any, phoneNo: '9876543210',
      });
    });

    it('getQualityAudiotorWorklist should delegate to the date-wise API', () => {
      qaService.getQualityAuditorDateWorklist.and.returnValue(of(worklist));
      component.getQualityAudiotorWorklist();
      expect(qaService.getQualityAuditorWorklist).not.toHaveBeenCalled();
      const req = qaService.getQualityAuditorDateWorklist.calls.mostRecent().args[0];
      expect(req).toEqual(jasmine.objectContaining({
        psmId: 4, languageId: '1', agentId: '10', roleId: '2', isValid: true,
        cycleId: null, beneficiaryPhoneNumber: '9876543210',
      }));
      expect(req.validFrom).toMatch(/^2025-01-01T/);
      expect(req.validTill).toMatch(/^2025-01-31T/);
      expect(component.callAuditData.data).toEqual(worklist);
    });

    it('should show no-data message on empty result', () => {
      qaService.getQualityAuditorDateWorklist.and.returnValue(of([]));
      component.getDateWiseAudiotorWorklist();
      expect(confirmation.openDialog).toHaveBeenCalledWith('noDataFoundForCallRating', 'error');
    });

    it('should show the API error message for a non-array response', () => {
      qaService.getQualityAuditorDateWorklist.and.returnValue(of({ errorMessage: 'Bad dates' }));
      component.getDateWiseAudiotorWorklist();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Bad dates', 'error');
    });

    it('should show err.error when the API fails', () => {
      qaService.getQualityAuditorDateWorklist.and.returnValue(throwError(() => ({ error: 'dw failed' })));
      component.getDateWiseAudiotorWorklist();
      expect(confirmation.openDialog).toHaveBeenCalledWith('dw failed', 'error');
    });
  });

  describe('filterSearchTerm', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.callData = worklist;
    });

    it('should show all rows for an empty search', () => {
      component.filterSearchTerm('');
      expect(component.callAuditData.data).toEqual(worklist);
    });

    it('should match beneficiary name case-insensitively', () => {
      component.filterSearchTerm('meena');
      expect(component.callAuditData.data).toEqual([worklist[1]]);
    });

    it('should match numeric beneficiary id and phone number', () => {
      component.filterSearchTerm('1001');
      expect(component.callAuditData.data).toEqual([worklist[0]]);
      component.filterSearchTerm('91234');
      expect(component.callAuditData.data).toEqual([worklist[1]]);
    });

    it('should not match on non-searchable fields', () => {
      component.filterSearchTerm('hidden');
      expect(component.callAuditData.data.length).toBe(0);
    });

    it('should return no rows when nothing matches', () => {
      component.filterSearchTerm('zzz');
      expect(component.callAuditData.data).toEqual([]);
    });
  });

  describe('validateTime', () => {
    const d1 = new Date(2025, 0, 1);
    const d2 = new Date(2025, 0, 2);

    it('should flag start after end on the same day', () => {
      component.validateTime(d1, d1, '10:00', '09:00');
      expect(component.invalidTimeFlag).toBeTrue();
    });

    it('should flag equal times on the same day', () => {
      component.validateTime(d1, d1, '10:00', '10:00');
      expect(component.invalidTimeFlag).toBeTrue();
    });

    it('should accept start before end on the same day', () => {
      component.invalidTimeFlag = true;
      component.validateTime(d1, d1, '09:00', '10:00');
      expect(component.invalidTimeFlag).toBeFalse();
    });

    it('should accept any times on different days', () => {
      component.invalidTimeFlag = true;
      component.validateTime(d1, d2, '10:00', '09:00');
      expect(component.invalidTimeFlag).toBeFalse();
    });

    it('should leave the flag untouched when a time is missing', () => {
      component.invalidTimeFlag = true;
      component.validateTime(d1, d1, '', '09:00');
      expect(component.invalidTimeFlag).toBeTrue();
    });
  });

  describe('actions', () => {
    beforeEach(() => fixture.detectChanges());

    it('routeToAgentRating should load CallRatingComponent with paging state', () => {
      const row: any = { benCallID: 5 };
      component.routeToAgentRating(row, 'callAudit');
      expect(qaService.loadComponent).toHaveBeenCalledWith(CallRatingComponent, {
        data: row,
        type: 'callAudit',
      });
      expect(row.paginator).toBe(component.paginator);
    });

    it('viewCasheet should open the case sheet dialog', () => {
      component.viewCasheet(worklist[0]);
      expect(dialog.open).toHaveBeenCalledWith(ViewCasesheetComponent, {
        width: '900px',
        disableClose: true,
        data: { benCallId: 5, beneficiaryId: 1001 },
      });
    });

    it('onRadioButtonChange should reset forms and clear the table', () => {
      component.callData = worklist;
      component.cycleWiseForm.controls.agentId.setValue('10');
      component.onRadioButtonChange();
      expect(component.iscycleWiseChangeForm).toBeFalse();
      expect(component.cycleWiseForm.controls.agentId.value).toBeNull();
      expect(component.callAuditForm.controls['selectedRadioButton'].value).toBeNull();
      expect(component.callData).toEqual([]);
      expect(component.callAuditData.data).toEqual([]);
    });

    it('onRadioButtonChange should flip to cycle-wise when date-wise was selected', () => {
      component.callAuditForm.controls['selectedRadioButton'].setValue('2');
      component.onRadioButtonChange();
      expect(component.iscycleWiseChangeForm).toBeTrue();
    });
  });
});
