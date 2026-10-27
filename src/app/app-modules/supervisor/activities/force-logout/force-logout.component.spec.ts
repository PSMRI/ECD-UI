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
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { ForceLogoutComponent } from './force-logout.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';

describe('ForceLogoutComponent', () => {
  let component: ForceLogoutComponent;
  let fixture: ComponentFixture<ForceLogoutComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let tracking: jasmine.SpyObj<AmritTrackingService>;
  const lang = { userLoggedOutSuccessfully: 'userLoggedOutSuccessfully' };

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', ['getUserLogout']);
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [ForceLogoutComponent],
      providers: [
        FormBuilder,
        { provide: SessionStorageService, useValue: { getItem: () => 4 } },
        { provide: SetLanguageService, useValue: { getLanguageData: () => of(lang) } },
        { provide: SupervisorService, useValue: supervisor },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(ForceLogoutComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(ForceLogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the language and requires a user name', () => {
    expect(component.currentLanguageSet).toBe(lang);
    expect(component.languageData).toBe(lang);
    expect(component.kickoutForm.valid).toBeFalse();
  });

  it('logs the user out and resets the form', () => {
    supervisor.getUserLogout.and.returnValue(of({ statusCode: 200 }));
    component.kickoutForm.setValue({ userName: 'agent1' });
    component.kickoutUsername();
    expect(supervisor.getUserLogout).toHaveBeenCalledWith({
      providerServiceMapID: 4,
      userName: 'agent1',
    });
    expect(confirmation.openDialog).toHaveBeenCalledWith('userLoggedOutSuccessfully', 'success');
    expect(component.kickoutForm.value.userName).toBeNull();
  });

  it('shows the error message on failure', () => {
    supervisor.getUserLogout.and.returnValue(of({ statusCode: 5000, errorMessage: 'not logged in' }));
    component.kickoutForm.setValue({ userName: 'agent1' });
    component.kickoutUsername();
    expect(confirmation.openDialog).toHaveBeenCalledWith('not logged in', 'error');
    expect(component.kickoutForm.value.userName).toBe('agent1');
  });

  it('tracks field interactions', () => {
    component.trackFieldInteraction('userName');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('userName', 'Force Logout');
  });
});
