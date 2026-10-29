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

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthGuardService } from './auth-guard.service';
import { LoginserviceService } from '../loginservice/loginservice.service';

describe('AuthGuardService', () => {
  let guard: AuthGuardService;
  let loginService: jasmine.SpyObj<LoginserviceService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    loginService = jasmine.createSpyObj('LoginserviceService', ['validateSessionKey']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        { provide: LoginserviceService, useValue: loginService },
        { provide: Router, useValue: router },
      ],
    });
    guard = TestBed.inject(AuthGuardService);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should not redirect when the session is valid', () => {
    loginService.validateSessionKey.and.returnValue(of({ statusCode: 200, data: { userId: 1 } }));
    guard.canActivate();
    expect(loginService.validateSessionKey).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when statusCode is not 200', () => {
    loginService.validateSessionKey.and.returnValue(of({ statusCode: 5002, data: {} }));
    guard.canActivate();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to login when data is missing', () => {
    loginService.validateSessionKey.and.returnValue(of({ statusCode: 200, data: null }));
    guard.canActivate();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to login when the response is null', () => {
    loginService.validateSessionKey.and.returnValue(of(null as any));
    guard.canActivate();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to login when the session API fails', () => {
    loginService.validateSessionKey.and.returnValue(throwError(() => ({ status: 500 })));
    guard.canActivate();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  // Documents current behaviour: the result is decided inside subscribe,
  // so canActivate itself always returns undefined.
  it('canActivate returns undefined regardless of session state', () => {
    loginService.validateSessionKey.and.returnValue(of({ statusCode: 200, data: {} }));
    expect(guard.canActivate()).toBeUndefined();
  });
});
