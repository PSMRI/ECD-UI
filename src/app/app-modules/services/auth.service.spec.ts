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
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('logoutUser should POST an empty body to the logout url', () => {
    service.logoutUser().subscribe();
    const req = httpMock.expectOne(environment.logoutUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe('');
    req.flush({});
  });

  it('getUIVersionAndCommitDetails should GET the given url', () => {
    let result: any;
    service.getUIVersionAndCommitDetails('assets/git-version.json').subscribe((r) => (result = r));
    const req = httpMock.expectOne('assets/git-version.json');
    expect(req.request.method).toBe('GET');
    req.flush({ version: '1.0' });
    expect(result).toEqual({ version: '1.0' });
  });

  it('login should POST credentials with doLogout and withCredentials flags', () => {
    service.login('user1', 'pass1', true).subscribe();
    const req = httpMock.expectOne(environment.getLoginURL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      userName: 'user1',
      password: 'pass1',
      doLogout: true,
      withCredentials: true,
    });
    req.flush({});
  });

  it('login should pass empty credentials through unchanged (edge case)', () => {
    service.login('', '', false).subscribe();
    const req = httpMock.expectOne(environment.getLoginURL);
    expect(req.request.body.userName).toBe('');
    expect(req.request.body.password).toBe('');
    expect(req.request.body.doLogout).toBeFalse();
    req.flush({});
  });

  it('getUserDetails should POST an empty object to the session url', () => {
    service.getUserDetails().subscribe();
    const req = httpMock.expectOne(environment.getSessionExistsURL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({});
  });

  it('login should surface a 401 error to the subscriber', () => {
    let status: any;
    service.login('u', 'wrong', false).subscribe({ error: (e) => (status = e.status) });
    httpMock
      .expectOne(environment.getLoginURL)
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    expect(status).toBe(401);
  });
});
