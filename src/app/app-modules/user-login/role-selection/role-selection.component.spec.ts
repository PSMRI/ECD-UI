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
import { Router } from '@angular/router';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { RoleSelectionComponent } from './role-selection.component';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';

describe('RoleSelectionComponent', () => {
  let component: RoleSelectionComponent;
  let fixture: ComponentFixture<RoleSelectionComponent>;
  let router: jasmine.SpyObj<Router>;
  let session: jasmine.SpyObj<SessionStorageService>;
  let tracking: jasmine.SpyObj<AmritTrackingService>;

  const roles = [{ RoleID: 1, RoleName: 'ANM' }, { RoleID: 2, RoleName: 'Supervisor' }];

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    session = jasmine.createSpyObj('SessionStorageService', ['setItem', 'getItem']);
    session.getItem.and.returnValue(JSON.stringify(roles));
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [RoleSelectionComponent],
      providers: [
        FormBuilder,
        { provide: Router, useValue: router },
        { provide: SessionStorageService, useValue: session },
        { provide: LoginserviceService, useValue: {} },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(RoleSelectionComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(RoleSelectionComponent);
    component = fixture.componentInstance;
  });

  it('should create, clear the role and parse stored user roles', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(session.setItem).toHaveBeenCalledWith('role', '');
    expect(session.getItem).toHaveBeenCalledWith('userRoles');
    expect(component.userRoles).toEqual(roles);
  });

  it('should leave userRoles undefined when none are stored', () => {
    session.getItem.and.returnValue(null);
    fixture.detectChanges();
    expect(component.userRoles).toBeUndefined();
  });

  it('should throw on malformed stored roles (edge case)', () => {
    session.getItem.and.returnValue('{not json');
    expect(() => fixture.detectChanges()).toThrowError(SyntaxError);
  });

  it('selectRole should store the role and navigate to the dashboard', () => {
    fixture.detectChanges();
    component.selectRole(1, 'Supervisor', 2);
    expect(component.selectedIndex).toBe(1);
    expect(component.isSelected).toBeTrue();
    expect(session.setItem).toHaveBeenCalledWith('role', 'Supervisor');
    expect(session.setItem).toHaveBeenCalledWith('roleId', 2);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('selectRole should toggle isSelected on repeated selection', () => {
    component.selectRole(0, 'ANM', 1);
    component.selectRole(0, 'ANM', 1);
    expect(component.isSelected).toBeFalse();
  });

  it('trackFieldInteraction should report to tracking with the page name', () => {
    component.trackFieldInteraction('roleCard');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('roleCard', 'Role Selection');
  });
});
