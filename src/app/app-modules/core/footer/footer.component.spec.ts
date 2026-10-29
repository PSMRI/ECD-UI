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


import {
  ComponentFixture,
  TestBed,
  discardPeriodicTasks,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { FooterComponent } from './footer.component';
import { SetLanguageService } from '../../services/set-language/set-language.service';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let langService: any;

  beforeEach(async () => {
    langService = {
      languageData: { footer: 'en' },
      getLanguageData: jasmine.createSpy('getLanguageData').and.returnValue(of({ fetched: true })),
    };
    await TestBed.configureTestingModule({
      declarations: [FooterComponent],
      providers: [{ provide: SetLanguageService, useValue: langService }],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(FooterComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
  });

  it('sets the language and year and polls the online status', fakeAsync(() => {
    fixture.detectChanges();
    expect(component.currentLanguageSet).toEqual({ footer: 'en' });
    expect(component.year).toBe(new Date().getFullYear());
    expect(component.status).toBeUndefined();
    tick(1000);
    expect(component.status).toBe(navigator.onLine);
    discardPeriodicTasks();
  }));

  it('loads English when no language is cached', () => {
    langService.languageData = null;
    component.ngDoCheck();
    expect(langService.getLanguageData).toHaveBeenCalledWith('English');
    expect(component.currentLanguageSet).toEqual({ fetched: true });
  });
});
