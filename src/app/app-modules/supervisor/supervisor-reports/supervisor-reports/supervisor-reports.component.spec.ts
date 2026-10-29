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
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { SupervisorReportsComponent } from './supervisor-reports.component';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';

describe('SupervisorReportsComponent', () => {
  let component: SupervisorReportsComponent;
  let fixture: ComponentFixture<SupervisorReportsComponent>;
  let master: jasmine.SpyObj<MasterService>;
  let supervisor: any;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let langService: any;

  const lang = { noRecordsFound: 'noRecordsFound', downloadedReportSuccessfully: 'downloadedReportSuccessfully' };

  // report value -> SupervisorService method
  const reportMethods: Array<[string, string]> = [
    ['cumulative_report', 'downloadCumulativeReport'],
    ['call_detail_report', 'downloadCallDetailReport'],
    ['call_summary_report', 'downloadCallSummaryReport'],
    ['benificiary_wise_report', 'downloadBenificiaryWiseReport'],
    ['call_unique_report', 'downloadCallUniqueReport'],
    ['birth_defect_report', 'downloadBirthDefectReport'],
    ['aasha_home_report', 'downloadAshaHomeReport'],
    ['calcium_IFA_report', 'downloadCalciumIfaReport'],
    ['absence_VHSND_report', 'downloadAbsenceVhsndReport'],
    ['vaccine_dropout_report', 'downloadVaccineDropoutReport'],
    ['vaccine_leftout_report', 'downloadVaccineLeftoutReport'],
    ['dev_delay_report', 'downloadDevDelayReport'],
    ['abortion_report', 'downloadAbortionReport'],
    ['delivery_status_report', 'downloadDeliveryStatusReport'],
    ['HRPW_cases_report', 'downloadHrpwCasesReport'],
    ['infants_high_risk_report', 'downloadInfantHighRiskReport'],
    ['maternal_death_report', 'downloadMaternalDeathReport'],
    ['still_birth_report', 'downloadStillBirthReport'],
    ['baby_death_report', 'downloadBabyDeathReport'],
    ['not_connected_report', 'downloadNotConnectedReport'],
    ['JSY_report', 'downloadJsyReport'],
    ['misscarriage_report', 'downloadMiscarriageReport'],
  ];

  const formData = {
    startDate: new Date(2025, 0, 1),
    endDate: new Date(2025, 0, 15),
    roleName: 'ANM',
    agentId: 10,
  };

  function blobResponse(text: string) {
    return of(new HttpResponse({ body: new Blob([text]) }));
  }

  /** Resolves on the next ConfirmationService.openDialog call (FileReader is async). */
  function nextDialog(): Promise<any[]> {
    return new Promise((resolve) => confirmation.openDialog.and.callFake((...args: any[]) => {
      resolve(args);
      return {} as any;
    }));
  }

  beforeEach(async () => {
    master = jasmine.createSpyObj('MasterService', ['getRoleMaster', 'getAgentMaster']);
    master.getRoleMaster.and.returnValue(of([
      { roleId: 1, roleName: 'ANM' },
      { roleId: 2, roleName: 'MO' },
      { roleId: 3, roleName: 'Associate' },
      { roleId: 4, roleName: 'Supervisor' },
    ]));
    master.getAgentMaster.and.returnValue(of([{ agentId: 10 }, { agentId: null }]));
    supervisor = jasmine.createSpyObj('SupervisorService', reportMethods.map(([, m]) => m));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    langService = { languageData: lang };
    // prevent FileSaver from triggering a real download
    spyOn(HTMLAnchorElement.prototype, 'dispatchEvent').and.returnValue(true);

    await TestBed.configureTestingModule({
      declarations: [SupervisorReportsComponent],
      providers: [
        FormBuilder,
        { provide: SetLanguageService, useValue: langService },
        { provide: MasterService, useValue: master },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: () => 4 } },
        { provide: SupervisorService, useValue: supervisor },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(SupervisorReportsComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SupervisorReportsComponent);
    component = fixture.componentInstance;
  });

  describe('init', () => {
    it('should create with 22 numbered reports', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
      expect(component.reportsData.length).toBe(22);
      expect(component.reportsData[0].sno).toBe(1);
      expect(component.reportsData[21].sno).toBe(22);
      expect(component.dataSource.data.length).toBe(22);
    });

    it('should set today to yesterday and disable agent selection', () => {
      fixture.detectChanges();
      const y = new Date();
      y.setDate(y.getDate() - 1);
      expect(component.today.toDateString()).toBe(y.toDateString());
      expect(component.reportForm.get('agentId')?.disabled).toBeTrue();
    });

    it('should keep only Associate, ANM and MO roles', () => {
      fixture.detectChanges();
      expect(component.rolesList.map((r) => r.roleName)).toEqual(['ANM', 'MO', 'Associate']);
      expect(master.getRoleMaster).toHaveBeenCalledWith(4);
    });

    it('should show err.error when loading roles fails', () => {
      master.getRoleMaster.and.returnValue(throwError(() => ({ error: 'roles failed' })));
      fixture.detectChanges();
      expect(confirmation.openDialog).toHaveBeenCalledWith('roles failed', 'error');
    });

    it('should show title + detail when loading roles fails without err.error', () => {
      master.getRoleMaster.and.returnValue(throwError(() => ({ title: 'A', detail: 'B' })));
      fixture.detectChanges();
      expect(confirmation.openDialog).toHaveBeenCalledWith('AB', 'error');
    });

    it('ngDoCheck should refresh language data', () => {
      fixture.detectChanges();
      langService.languageData = { x: 1 };
      component.ngDoCheck();
      expect(component.currentLanguageSet).toEqual({ x: 1 });
    });

    it('every report in the list should map to a download branch', () => {
      fixture.detectChanges();
      expect(component.reportsData.map((r: any) => r.value).sort()).toEqual(reportMethods.map(([v]) => v).sort());
    });
  });

  describe('date range validation', () => {
    beforeEach(() => fixture.detectChanges());

    it('should be invalid without dates', () => {
      expect(component.reportForm.valid).toBeFalse();
    });

    it('should accept a range under 31 days', () => {
      component.reportForm.patchValue({ startDate: new Date(2025, 0, 1) as any, endDate: new Date(2025, 0, 30) as any });
      expect(component.reportForm.controls['startDate'].errors).toBeNull();
      expect(component.reportForm.valid).toBeTrue();
    });

    it('should flag a range of 31 days or more', () => {
      component.reportForm.patchValue({ startDate: new Date(2025, 0, 1) as any, endDate: new Date(2025, 1, 1) as any });
      expect(component.reportForm.controls['startDate'].hasError('valueGreater')).toBeTrue();
      expect(component.reportForm.valid).toBeFalse();
    });

    it('should clear the error once the range is fixed', () => {
      component.reportForm.patchValue({ startDate: new Date(2025, 0, 1) as any, endDate: new Date(2025, 2, 1) as any });
      component.reportForm.patchValue({ endDate: new Date(2025, 0, 10) as any });
      expect(component.reportForm.controls['startDate'].errors).toBeNull();
    });

    it('should skip validation while end date is empty', () => {
      component.reportForm.patchValue({ startDate: new Date(2025, 0, 1) as any, endDate: '' });
      expect(component.reportForm.controls['startDate'].hasError('valueGreater')).toBeFalse();
    });
  });

  describe('role and agent selection', () => {
    beforeEach(() => fixture.detectChanges());

    it('setRoleType should enable agents, load them and set role id/name', () => {
      component.setRoleType(2);
      expect(component.reportForm.get('agentId')?.enabled).toBeTrue();
      expect(master.getAgentMaster).toHaveBeenCalledWith({ roleId: 2 });
      expect(component.reportForm.controls['roleId'].value as any).toBe(2);
      expect(component.reportForm.controls['roleName'].value as any).toBe('MO');
    });

    // Documents current behaviour: the null/undefined check uses ||, so every agent is kept.
    it('getAgentValues keeps all agents, including null agentIds', () => {
      component.getAgentValues(1);
      expect(component.agentNameList.length).toBe(2);
    });

    it('getAgentValues should reset the selected agent', () => {
      component.reportForm.controls['agentId'].enable();
      component.reportForm.controls['agentId'].setValue(5 as any);
      component.getAgentValues(1);
      expect(component.reportForm.controls['agentId'].value).toBeNull();
    });

    it('getAgentValues should show err.error on failure', () => {
      master.getAgentMaster.and.returnValue(throwError(() => ({ error: 'agents failed' })));
      component.getAgentValues(1);
      expect(confirmation.openDialog).toHaveBeenCalledWith('agents failed', 'error');
    });

    it('getAgentValues should show title + detail on failure without err.error', () => {
      master.getAgentMaster.and.returnValue(throwError(() => ({ title: 'X', detail: 'Y' })));
      component.getAgentValues(1);
      expect(confirmation.openDialog).toHaveBeenCalledWith('XY', 'error');
    });
  });

  describe('downloadReport', () => {
    beforeEach(() => fixture.detectChanges());

    reportMethods.forEach(([value, method]) => {
      it(`${value} should call ${method} and save the file`, async () => {
        supervisor[method].and.returnValue(blobResponse('excel-bytes'));
        spyOn(URL, 'createObjectURL').and.returnValue('blob:x');
        const dialog = nextDialog();

        component.downloadReport({ value }, formData);

        expect(supervisor[method]).toHaveBeenCalledWith({
          startDate: '2025-01-01T00:00:00',
          endDate: '2025-01-15T23:59:59',
          role: 'ANM',
          agentId: 10,
          fileName: value,
          psmId: 4,
        });
        expect(await dialog).toEqual(['downloadedReportSuccessfully', 'success']);
        expect(URL.createObjectURL).toHaveBeenCalled();
      });
    });

    it('should send agentId null when it is undefined', () => {
      supervisor.downloadCallDetailReport.and.returnValue(of(null));
      component.downloadReport({ value: 'call_detail_report' }, { ...formData, agentId: undefined });
      expect(supervisor.downloadCallDetailReport.calls.mostRecent().args[0].agentId).toBeNull();
    });

    it('should show noRecordsFound for a "No data found" body', async () => {
      supervisor.downloadCumulativeReport.and.returnValue(blobResponse('No Data Found'));
      const dialog = nextDialog();
      component.downloadReport({ value: 'cumulative_report' }, formData);
      expect(await dialog).toEqual(['noRecordsFound', 'info']);
    });

    it('should show Redis Error when the body contains 5002 after the start', async () => {
      supervisor.downloadCumulativeReport.and.returnValue(blobResponse('{"statusCode":5002}'));
      const dialog = nextDialog();
      component.downloadReport({ value: 'cumulative_report' }, formData);
      expect(await dialog).toEqual(['Redis Error', 'error']);
    });

    it('should do nothing for a null response', () => {
      supervisor.downloadCumulativeReport.and.returnValue(of(null));
      component.downloadReport({ value: 'cumulative_report' }, formData);
      expect(confirmation.openDialog).not.toHaveBeenCalled();
    });

    it('should show a download error when the API fails', () => {
      supervisor.downloadJsyReport.and.returnValue(throwError(() => ({ status: 500 })));
      component.downloadReport({ value: 'JSY_report' }, formData);
      expect(confirmation.openDialog).toHaveBeenCalledWith('Error While Downloading Excel Report', 'error');
    });

    it('should not call any API for an unknown report', () => {
      component.downloadReport({ value: 'unknown' }, formData);
      reportMethods.forEach(([, m]) => expect(supervisor[m]).not.toHaveBeenCalled());
    });
  });

  describe('filterSearchTerm', () => {
    beforeEach(() => fixture.detectChanges());

    it('should show all reports for an empty search', () => {
      component.filterSearchTerm('');
      expect(component.dataSource.data.length).toBe(22);
    });

    it('should filter by report name case-insensitively', () => {
      component.filterSearchTerm('VACCINE');
      expect(component.dataSource.data.map((r) => r.reportName)).toEqual([
        'Vaccine Drop Out Identified Report',
        'Vaccine Left Out Identified Report',
      ]);
    });

    it('should return nothing when no report matches', () => {
      component.filterSearchTerm('zzz');
      expect(component.dataSource.data).toEqual([]);
    });
  });
});
