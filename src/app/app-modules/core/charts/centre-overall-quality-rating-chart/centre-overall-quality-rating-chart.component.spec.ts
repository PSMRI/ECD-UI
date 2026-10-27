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

import { CentreOverallQualityRatingChartComponent } from './centre-overall-quality-rating-chart.component';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';

describe('CentreOverallQualityRatingChartComponent', () => {
  let component: CentreOverallQualityRatingChartComponent;
  let fixture: ComponentFixture<CentreOverallQualityRatingChartComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let master: any;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let resizeHandler: (() => void) | undefined;
  const DATA = [{ name: 'A', value: 5 }, { name: 'B', value: 3 }];

  beforeEach(async () => {
    resizeHandler = undefined;
    (window as any).jQuery = () => ({ on: (_e: string, fn: () => void) => (resizeHandler = fn) });
    qs = jasmine.createSpyObj('QualitySupervisorService', ['getCentreOverallQualityRatingsData']);
    qs.getCentreOverallQualityRatingsData.and.returnValue(of(DATA));
    master = {
      frequencyMasterList: ['Cycle Wise', 'Month Wise'],
      frequencyMasterListOfScoreChart: ['Year Wise', 'Month Wise'],
      getRoleMaster: jasmine.createSpy('getRoleMaster').and.returnValue(
        of([{ roleName: 'Associate' }, { roleName: 'ANM' }, { roleName: 'Supervisor' }, { roleName: 'MO' }]),
      ),
    };
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);

    await TestBed.configureTestingModule({
      declarations: [CentreOverallQualityRatingChartComponent],
      providers: [
        { provide: SetLanguageService, useValue: { languageData: { downloadChart: 'Download' } } },
        { provide: QualitySupervisorService, useValue: qs },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: () => 4 } },
        { provide: MasterService, useValue: master },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CentreOverallQualityRatingChartComponent, '<div id="main" style="width: 300px; height: 200px"></div>')
      .compileComponents();
    fixture = TestBed.createComponent(CentreOverallQualityRatingChartComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    const dom = document.getElementById('main');
    if (dom) echarts.getInstanceByDom(dom)?.dispose();
    fixture.destroy();
    delete (window as any).jQuery;
  });

  const chartOption = (): any => echarts.getInstanceByDom(document.getElementById('main') as HTMLElement)?.getOption();

  it('loads Cycle Wise data on init and draws the chart', () => {
    fixture.detectChanges();
    expect(component.frequency).toBe('Cycle Wise');
    expect(component.frequencyList).toEqual(master.frequencyMasterList);
    expect(qs.getCentreOverallQualityRatingsData).toHaveBeenCalledWith('Cycle Wise', 4, null);
    expect(component.qualityRatingData).toEqual(DATA);
    expect(component.lastSixMonths.length).toBe(6);
    expect(component.lastSixMonths[5].id).toBe(new Date().getMonth() + 1);
    const option = chartOption();
    expect(option.series[0].data).toEqual([5, 3]);
    expect(resizeHandler).toBeDefined();
    expect(() => resizeHandler && resizeHandler()).not.toThrow();
  });

  it('switching to month wise filters by the current month', () => {
    fixture.detectChanges();
    component.frequency = 'Month Wise';
    component.checkFrequency();
    const month = new Date().toLocaleString('default', { month: 'long' });
    expect(component.enableMonthFilter).toBeTrue();
    expect(component.month).toBe(month);
    expect(qs.getCentreOverallQualityRatingsData).toHaveBeenCalledWith('Month Wise', 4, month);
    component.frequency = 'Cycle Wise';
    component.checkFrequency();
    expect(component.enableMonthFilter).toBeFalse();
    expect(component.month).toBeNull();
  });

  it('keeps an empty chart for empty responses and errors', () => {
    qs.getCentreOverallQualityRatingsData.and.returnValue(of(null) as any);
    fixture.detectChanges();
    expect(component.qualityRatingData).toEqual([]);
    qs.getCentreOverallQualityRatingsData.and.returnValue(throwError(() => 'down'));
    expect(() => component.getOverallQualityRatingsData()).not.toThrow();
  });

  it('skips drawing without the chart element', () => {
    fixture.detectChanges();
    document.getElementById('main')?.remove();
    expect(() => component.setQualityRatingData(DATA)).not.toThrow();
  });

  it('refreshes the frequency list on ngDoCheck', () => {
    fixture.detectChanges();
    master.frequencyMasterList = ['Only'];
    component.ngDoCheck();
    expect(component.frequencyList).toEqual(['Only']);
  });

});
