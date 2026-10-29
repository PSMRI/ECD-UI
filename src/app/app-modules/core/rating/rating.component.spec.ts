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
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { RatingComponent } from './rating.component';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { CoreService } from '../../services/core/core.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';

describe('RatingComponent', () => {
  let component: RatingComponent;
  let fixture: ComponentFixture<RatingComponent>;
  let core: jasmine.SpyObj<CoreService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let langService: any;
  const session: any = { role: 'Associate', userID: 9, providerServiceMapID: 4 };

  beforeEach(async () => {
    core = jasmine.createSpyObj('CoreService', ['getAgentAuditScore']);
    core.getAgentAuditScore.and.returnValue(of([{ grade: 'A' }]));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    langService = { languageData: { rating: 'en' } };

    await TestBed.configureTestingModule({
      declarations: [RatingComponent],
      providers: [
        { provide: SetLanguageService, useValue: langService },
        { provide: LoginserviceService, useValue: {} },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: CoreService, useValue: core },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(RatingComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(RatingComponent);
    component = fixture.componentInstance;
  });

  it('loads the role, language and the agent audit score', () => {
    fixture.detectChanges();
    expect(component.selectedRole).toBe('Associate');
    expect(component.currentLanguageSet).toEqual({ rating: 'en' });
    expect(core.getAgentAuditScore).toHaveBeenCalledWith(9, 4);
    expect(component.agentRatingData).toEqual([{ grade: 'A' }]);
  });

  it('keeps the previous language when none is cached', () => {
    fixture.detectChanges();
    langService.languageData = null;
    component.ngDoCheck();
    expect(component.currentLanguageSet).toEqual({ rating: 'en' });
  });

  it('shows the error body on failure', () => {
    core.getAgentAuditScore.and.returnValue(throwError(() => ({ error: 'denied' })));
    fixture.detectChanges();
    expect(confirmation.openDialog).toHaveBeenCalledWith('denied', 'error');
  });

  it('falls back to title and detail for problem responses', () => {
    core.getAgentAuditScore.and.returnValue(
      throwError(() => ({ title: 'Bad ', detail: 'request' })),
    );
    fixture.detectChanges();
    expect(confirmation.openDialog).toHaveBeenCalledWith('Bad request', 'error');
  });
});
