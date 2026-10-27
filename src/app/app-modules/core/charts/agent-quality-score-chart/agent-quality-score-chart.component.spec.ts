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

import { AgentQualityScoreChartComponent } from './agent-quality-score-chart.component';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';

describe('AgentQualityScoreChartComponent', () => {
  let component: AgentQualityScoreChartComponent;
  let fixture: ComponentFixture<AgentQualityScoreChartComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let master: any;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let resizeHandler: (() => void) | undefined;
  const DATA = [{ name: 'A', value: 5 }, { name: 'B', value: 3 }];

  beforeEach(async () => {
    resizeHandler = undefined;
    (window as any).jQuery = () => ({ on: (_e: string, fn: () => void) => (resizeHandler = fn) });
    qs = jasmine.createSpyObj('QualitySupervisorService', ['getNumberOfAgentScoreData']);
    qs.getNumberOfAgentScoreData.and.returnValue(of(DATA));
    master = {
      frequencyMasterList: ['Cycle Wise', 'Month Wise'],
      frequencyMasterListOfScoreChart: ['Year Wise', 'Month Wise'],
      getRoleMaster: jasmine.createSpy('getRoleMaster').and.returnValue(
        of([{ roleName: 'Associate' }, { roleName: 'ANM' }, { roleName: 'Supervisor' }, { roleName: 'MO' }]),
      ),
    };
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);

    await TestBed.configureTestingModule({
      declarations: [AgentQualityScoreChartComponent],
      providers: [
        { provide: SetLanguageService, useValue: { languageData: { downloadChart: 'Download' } } },
        { provide: QualitySupervisorService, useValue: qs },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: () => 4 } },
        { provide: MasterService, useValue: master },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(AgentQualityScoreChartComponent, '<div id="agentQualityMain" style="width: 300px; height: 200px"></div>')
      .compileComponents();
    fixture = TestBed.createComponent(AgentQualityScoreChartComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    const dom = document.getElementById('agentQualityMain');
    if (dom) echarts.getInstanceByDom(dom)?.dispose();
    fixture.destroy();
    delete (window as any).jQuery;
  });

  const chartOption = (): any => echarts.getInstanceByDom(document.getElementById('agentQualityMain') as HTMLElement)?.getOption();

  it('loads Year Wise data on init and draws the chart', () => {
    fixture.detectChanges();
    expect(component.frequency).toBe('Year Wise');
    expect(component.frequencyList).toEqual(master.frequencyMasterListOfScoreChart);
    expect(qs.getNumberOfAgentScoreData).toHaveBeenCalledWith(4, 'Year Wise', null);
    expect(component.qualityGradeData).toEqual(DATA);
    expect(component.lastSixMonths.length).toBe(6);
    expect(component.lastSixMonths[5].id).toBe(new Date().getMonth() + 1);
    const option = chartOption();
    expect(option.series[0].data.map((d: any) => [d.name, d.value])).toEqual([['A', 5], ['B', 3]]);
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
    expect(qs.getNumberOfAgentScoreData).toHaveBeenCalledWith(4, 'Month Wise', month);
    component.frequency = 'Year Wise';
    component.checkFrequency();
    expect(component.enableMonthFilter).toBeFalse();
    expect(component.month).toBeNull();
  });

  it('keeps an empty chart for empty responses and errors', () => {
    qs.getNumberOfAgentScoreData.and.returnValue(of(null) as any);
    fixture.detectChanges();
    expect(component.qualityGradeData).toEqual([]);
    qs.getNumberOfAgentScoreData.and.returnValue(throwError(() => 'down'));
    expect(() => component.getAgentQualityScoreData()).not.toThrow();
  });

  it('skips drawing without the chart element', () => {
    fixture.detectChanges();
    document.getElementById('agentQualityMain')?.remove();
    expect(() => component.setAgentGradeData(DATA)).not.toThrow();
  });

  it('refreshes the frequency list on ngDoCheck', () => {
    fixture.detectChanges();
    master.frequencyMasterListOfScoreChart = ['Only'];
    component.ngDoCheck();
    expect(component.frequencyList).toEqual(['Only']);
  });

});
