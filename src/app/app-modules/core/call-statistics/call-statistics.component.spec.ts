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

import { CallStatisticsComponent } from './call-statistics.component';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { CtiService } from '../../services/cti/cti.service';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';

describe('CallStatisticsComponent', () => {
  let component: CallStatisticsComponent;
  let fixture: ComponentFixture<CallStatisticsComponent>;
  let cti: jasmine.SpyObj<CtiService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;

  beforeEach(async () => {
    cti = jasmine.createSpyObj('CtiService', ['getCallStatistics', 'getCallAnsweredCount']);
    cti.getCallStatistics.and.returnValue(of({ statusCode: 200, data: { calls: 5 } }));
    cti.getCallAnsweredCount.and.returnValue(of({ totalCallsAnswered: 4, totalCallsVerified: 3 }));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);

    await TestBed.configureTestingModule({
      declarations: [CallStatisticsComponent],
      providers: [
        { provide: SetLanguageService, useValue: { languageData: { stats: 'en' } } },
        { provide: LoginserviceService, useValue: { agentId: 1001 } },
        { provide: CtiService, useValue: cti },
        { provide: ConfirmationService, useValue: confirmation },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CallStatisticsComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(CallStatisticsComponent);
    component = fixture.componentInstance;
  });

  it('loads statistics and answered/verified counts for the agent', () => {
    fixture.detectChanges();
    expect(component.currentLanguageSet).toEqual({ stats: 'en' });
    expect(cti.getCallStatistics).toHaveBeenCalledWith(1001);
    expect(cti.getCallAnsweredCount).toHaveBeenCalledWith(1001);
    expect(component.statisticsData).toEqual({ calls: 5 });
    expect(component.totalCallsAnswered).toBe(4);
    expect(component.totalCallsVerified).toBe(3);
  });

  it('shows the error message for unsuccessful statistics', () => {
    cti.getCallStatistics.and.returnValue(of({ statusCode: 5000, errorMessage: 'no data' }));
    fixture.detectChanges();
    expect(confirmation.openDialog).toHaveBeenCalledWith('no data', 'error');
  });

  it('shows http errors for both calls', () => {
    cti.getCallStatistics.and.returnValue(throwError(() => ({ error: 'stats down' })));
    cti.getCallAnsweredCount.and.returnValue(throwError(() => ({ title: 'Count ', detail: 'down' })));
    fixture.detectChanges();
    expect(confirmation.openDialog).toHaveBeenCalledWith('stats down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('Count down', 'error');
  });

  it('falls back to title and detail for statistics errors', () => {
    cti.getCallStatistics.and.returnValue(throwError(() => ({ title: 'A', detail: 'B' })));
    cti.getCallAnsweredCount.and.returnValue(throwError(() => ({ error: 'count' })));
    fixture.detectChanges();
    expect(confirmation.openDialog).toHaveBeenCalledWith('AB', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('count', 'error');
  });
});
