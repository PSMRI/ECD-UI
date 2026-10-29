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
import * as echarts from 'echarts';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { TenureWiseQualityRatingsComponent } from './tenure-wise-quality-ratings.component';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';

describe('TenureWiseQualityRatingsComponent', () => {
  let component: TenureWiseQualityRatingsComponent;
  let fixture: ComponentFixture<TenureWiseQualityRatingsComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let master: any;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let resizeHandler: (() => void) | undefined;
  const DATA = [{ name: 'A', value: 5 }, { name: 'B', value: 3 }];

  beforeEach(async () => {
    resizeHandler = undefined;
    (window as any).jQuery = () => ({ on: (_e: string, fn: () => void) => (resizeHandler = fn) });
    qs = jasmine.createSpyObj('QualitySupervisorService', ['getTenureWiseQualityRatingsData']);
    qs.getTenureWiseQualityRatingsData.and.returnValue(of(DATA));
    master = {
      frequencyMasterList: ['Cycle Wise', 'Month Wise'],
      frequencyMasterListOfScoreChart: ['Year Wise', 'Month Wise'],
      getRoleMaster: jasmine.createSpy('getRoleMaster').and.returnValue(
        of([{ roleName: 'Associate' }, { roleName: 'ANM' }, { roleName: 'Supervisor' }, { roleName: 'MO' }]),
      ),
    };
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);

    await TestBed.configureTestingModule({
      declarations: [TenureWiseQualityRatingsComponent],
      providers: [
        { provide: SetLanguageService, useValue: { languageData: { downloadChart: 'Download' } } },
        { provide: QualitySupervisorService, useValue: qs },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: () => 4 } },
        { provide: MasterService, useValue: master },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(TenureWiseQualityRatingsComponent, '<div id="mainTenureChart" style="width: 300px; height: 200px"></div>')
      .compileComponents();
    fixture = TestBed.createComponent(TenureWiseQualityRatingsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    const dom = document.getElementById('mainTenureChart');
    if (dom) echarts.getInstanceByDom(dom)?.dispose();
    fixture.destroy();
    delete (window as any).jQuery;
  });

  const chartOption = (): any => echarts.getInstanceByDom(document.getElementById('mainTenureChart') as HTMLElement)?.getOption();

  it('loads ANM tenure ratings and lists agent roles', () => {
    fixture.detectChanges();
    expect(component.agentRole).toBe('ANM');
    expect(component.psmId).toBe(4);
    expect(component.roleList.map((r: any) => r.roleName)).toEqual(['Associate', 'ANM', 'MO']);
    expect(qs.getTenureWiseQualityRatingsData).toHaveBeenCalledWith(4, 'ANM');
    expect(component.qualityRatingData).toEqual(DATA);
    const option = chartOption();
    expect(option.series[0].data).toEqual([5, 3]);
    expect(option.yAxis[0].data).toEqual(['A', 'B']);
    expect(() => resizeHandler && resizeHandler()).not.toThrow();
  });

  it('keeps an empty chart for empty responses and ignores errors', () => {
    qs.getTenureWiseQualityRatingsData.and.returnValue(of(null) as any);
    master.getRoleMaster.and.returnValue(of(null) as any);
    fixture.detectChanges();
    expect(component.qualityRatingData).toEqual([]);
    qs.getTenureWiseQualityRatingsData.and.returnValue(throwError(() => 'down'));
    master.getRoleMaster.and.returnValue(throwError(() => 'down'));
    expect(() => {
      component.getTenureQualityRatingsData();
      component.getRoleMaster();
    }).not.toThrow();
  });

  it('skips drawing without the chart element', () => {
    fixture.detectChanges();
    document.getElementById('mainTenureChart')?.remove();
    expect(() => component.setTenureQualityRatingData(DATA)).not.toThrow();
  });

});
