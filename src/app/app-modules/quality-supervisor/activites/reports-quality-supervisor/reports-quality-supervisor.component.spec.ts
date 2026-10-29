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


import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { ReportsQualitySupervisorComponent } from './reports-quality-supervisor.component';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';

describe('ReportsQualitySupervisorComponent', () => {
  let component: ReportsQualitySupervisorComponent;
  let fixture: ComponentFixture<ReportsQualitySupervisorComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;

  beforeEach(async () => {
    qs = jasmine.createSpyObj('QualitySupervisorService', ['qualityReportDownload']);
    await TestBed.configureTestingModule({
      declarations: [ReportsQualitySupervisorComponent],
      providers: [
        FormBuilder,
        { provide: SetLanguageService, useValue: { languageData: { r: 1 } } },
        { provide: SessionStorageService, useValue: { getItem: () => 4 } },
        { provide: QualitySupervisorService, useValue: qs },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(ReportsQualitySupervisorComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(ReportsQualitySupervisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('lists the three quality reports', () => {
    expect(component.dataSource.data.map((r: any) => r.reportName)).toEqual([
      'AGENT-WISE\u00a0TOTAL PRIMARY DEFECTS',
      'AGENT-WISE TOTAL SECONDARY DEFECTS',
      'HIGHLIGHTING OF THE AGENTS BELOW 95% QUALITY SCORE FOR Training need identification',
    ]);
    expect(component.today).toEqual(jasmine.any(Date));
    expect(component.reportsForm.valid).toBeFalse();
  });

  it('filterSearchTerm filters by report name', () => {
    component.filterSearchTerm('secondary');
    expect(component.dataSource.data.length).toBe(1);
    component.filterSearchTerm('');
    expect(component.dataSource.data.length).toBe(3);
  });

  describe('searchReport', () => {
    it('requests the report for the date range', () => {
      qs.qualityReportDownload.and.returnValue(of({ statusCode: 200, data: [{ reportName: 'R' }] }) as any);
      component.reportsForm.patchValue({ startDate: '2026-01-01', endDate: '2026-01-31' });
      component.searchReport();
      expect(qs.qualityReportDownload).toHaveBeenCalledWith({
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        providerServiceMapId: 4,
      });
      // NOTE: the table data source is replaced by the raw array (current behaviour)
      expect(component.dataSource as any).toEqual([{ reportName: 'R' }]);
    });

    it('keeps the table for unsuccessful responses', () => {
      qs.qualityReportDownload.and.returnValue(of({ statusCode: 5000 }) as any);
      component.searchReport();
      expect(component.dataSource.data.length).toBe(3);
    });
  });

  it('downloadReport saves the excel data under the report name', fakeAsync(() => {
    const click = spyOn(HTMLAnchorElement.prototype, 'dispatchEvent').and.returnValue(true);
    const createUrl = spyOn(URL, 'createObjectURL').and.callThrough();
    component.downloadReport({ reportName: 'Defects', excelData: 'a,b' });
    tick();
    expect(createUrl).toHaveBeenCalledWith(jasmine.any(Blob));
    expect(click).toHaveBeenCalled();
    const anchor = click.calls.mostRecent().object as HTMLAnchorElement;
    expect(anchor.download).toBe('Defects.xls');
    flush();
  }));
});
