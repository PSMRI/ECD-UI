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

import { ActivityThisWeekComponent } from './activity-this-week.component';
import { SetLanguageService } from '../../services/set-language/set-language.service';

describe('ActivityThisWeekComponent', () => {
  let component: ActivityThisWeekComponent;
  let fixture: ComponentFixture<ActivityThisWeekComponent>;
  let router: jasmine.SpyObj<Router>;
  const session: any = {};

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    await TestBed.configureTestingModule({
      declarations: [ActivityThisWeekComponent],
      providers: [
        { provide: SetLanguageService, useValue: { languageData: { a: 1 } } },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: Router, useValue: router },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(ActivityThisWeekComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(ActivityThisWeekComponent);
    component = fixture.componentInstance;
  });

  const withRole = (role: string | null) => {
    session.role = role;
    fixture.detectChanges();
  };

  it('shows supervisor activities', () => {
    withRole('Supervisor');
    expect(component.currentLanguageSet).toEqual({ a: 1 });
    expect(component.activities).toBe(component.activitiesForSupervisor);
    expect(component.activities.length).toBe(14);
  });

  it('shows quality supervisor and auditor activities', () => {
    withRole('Quality Supervisor');
    expect(component.activities).toBe(component.activitiesForQualitySupervisor);
    session.role = 'Quality Auditor';
    component.ngDoCheck();
    expect(component.activities).toBe(component.activitiesForQualityAuditor);
  });

  it('shows nothing for agents or without a role', () => {
    withRole('Associate');
    expect(component.activities).toEqual([]);
    session.role = null;
    component.ngDoCheck();
    expect(component.activities).toEqual([]);
  });

  describe('openScreen', () => {
    const cases: [string, string][] = [
      ['Supervisor', '/supervisor/innerpage-supervisor'],
      ['Quality Supervisor', '/quality-supervisor/innerpage-quality-supervisor'],
      ['Quality Auditor', '/quality-auditor/innerpage-quality-auditor'],
      ['Associate', '/associate-anm-mo/agents-innerpage'],
      ['MO', '/associate-anm-mo/agents-innerpage'],
      ['ANM', '/associate-anm-mo/agents-innerpage'],
    ];

    cases.forEach(([role, url]) => {
      it(`opens ${url} for ${role}`, () => {
        withRole(role);
        component.openScreen('alerts');
        expect(router.navigate).toHaveBeenCalledWith([url], { queryParams: { data: 'alerts' } });
      });
    });

    it('does nothing for other roles', () => {
      withRole('Admin');
      component.openScreen('alerts');
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});
