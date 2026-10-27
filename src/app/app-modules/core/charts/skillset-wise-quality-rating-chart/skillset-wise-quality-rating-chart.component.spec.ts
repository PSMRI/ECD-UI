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

import { SkillsetWiseQualityRatingChartComponent } from './skillset-wise-quality-rating-chart.component';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';

describe('SkillsetWiseQualityRatingChartComponent', () => {
  let component: SkillsetWiseQualityRatingChartComponent;
  let fixture: ComponentFixture<SkillsetWiseQualityRatingChartComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let master: any;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let resizeHandler: (() => void) | undefined;
  const DATA = [{ name: 'A', value: 5 }, { name: 'B', value: 3 }];

  beforeEach(async () => {
    resizeHandler = undefined;
    (window as any).jQuery = () => ({ on: (_e: string, fn: () => void) => (resizeHandler = fn) });
    qs = jasmine.createSpyObj('QualitySupervisorService', ['getSkillSetQualityRatingsData']);
    qs.getSkillSetQualityRatingsData.and.returnValue(of(DATA));
    master = {
      frequencyMasterList: ['Cycle Wise', 'Month Wise'],
      frequencyMasterListOfScoreChart: ['Year Wise', 'Month Wise'],
      getRoleMaster: jasmine.createSpy('getRoleMaster').and.returnValue(
        of([{ roleName: 'Associate' }, { roleName: 'ANM' }, { roleName: 'Supervisor' }, { roleName: 'MO' }]),
      ),
    };
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);

    await TestBed.configureTestingModule({
      declarations: [SkillsetWiseQualityRatingChartComponent],
      providers: [
        { provide: SetLanguageService, useValue: { languageData: { downloadChart: 'Download' } } },
        { provide: QualitySupervisorService, useValue: qs },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: () => 4 } },
        { provide: MasterService, useValue: master },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(SkillsetWiseQualityRatingChartComponent, '<div id="mainQualityChart" style="width: 300px; height: 200px"></div>')
      .compileComponents();
    fixture = TestBed.createComponent(SkillsetWiseQualityRatingChartComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    const dom = document.getElementById('mainQualityChart');
    if (dom) echarts.getInstanceByDom(dom)?.dispose();
    fixture.destroy();
    delete (window as any).jQuery;
  });

  const chartOption = (): any => echarts.getInstanceByDom(document.getElementById('mainQualityChart') as HTMLElement)?.getOption();

  it('loads ANM ratings for the current month and lists agent roles', () => {
    fixture.detectChanges();
    const month = new Date().toLocaleString('default', { month: 'long' });
    expect(component.agentRole).toBe('ANM');
    expect(component.month).toBe(month);
    expect(component.monthsOfCurrentYear.length).toBe(new Date().getMonth() + 1);
    expect(component.roleList.map((r: any) => r.roleName)).toEqual(['Associate', 'ANM', 'MO']);
    expect(component.frequencyList).toEqual(master.frequencyMasterList);
    expect(qs.getSkillSetQualityRatingsData).toHaveBeenCalledWith(4, 'ANM', month);
    expect(chartOption().series[0].data.map((d: any) => [d.name, d.value])).toEqual([['A', 5], ['B', 3]]);
    expect(() => resizeHandler && resizeHandler()).not.toThrow();
  });

  it('alerts on request errors', () => {
    fixture.detectChanges();
    qs.getSkillSetQualityRatingsData.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getSkillSetQualityRatingsData();
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
  });

  it('ignores role master errors and refreshes the frequency list', () => {
    fixture.detectChanges();
    master.getRoleMaster.and.returnValue(throwError(() => 'down'));
    expect(() => component.getRoleMaster()).not.toThrow();
    master.frequencyMasterList = ['Only'];
    component.ngDoCheck();
    expect(component.frequencyList).toEqual(['Only']);
  });

});
