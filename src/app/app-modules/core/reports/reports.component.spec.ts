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
import { Router } from '@angular/router';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { ReportsComponent } from './reports.component';
import { SetLanguageService } from '../../services/set-language/set-language.service';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;
  let router: jasmine.SpyObj<Router>;
  let langService: any;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    langService = { languageData: { reports: 'en' } };
    await TestBed.configureTestingModule({
      declarations: [ReportsComponent],
      providers: [
        { provide: SetLanguageService, useValue: langService },
        { provide: SessionStorageService, useValue: { getItem: () => 'Supervisor' } },
        { provide: Router, useValue: router },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(ReportsComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the language and role', () => {
    expect(component.currentLanguageSet).toEqual({ reports: 'en' });
    expect(component.selectedRole).toBe('Supervisor');
    expect(component.reportName).toEqual([{ screen: 'ECD Reports', value: 'reports' }]);
  });

  it('keeps the language when none is cached', () => {
    langService.languageData = undefined;
    component.ngDoCheck();
    expect(component.currentLanguageSet).toEqual({ reports: 'en' });
  });

  it('opens a report in the supervisor inner page', () => {
    component.openReport('reports');
    expect(router.navigate).toHaveBeenCalledWith(['/supervisor/innerpage-supervisor'], {
      queryParams: { data: 'reports' },
    });
  });

  it('opens the activity area', () => {
    component.openActivityArea();
    expect(router.navigate).toHaveBeenCalledWith(['/supervisor-inner-page']);
  });
});
