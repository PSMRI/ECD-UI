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
import { LoginserviceService } from './loginservice.service';

describe('LoginserviceService', () => {
  let service: LoginserviceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(LoginserviceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created with role disabled', () => {
    expect(service).toBeTruthy();
    expect(service.enableRole).toBeFalse();
  });

  describe('enableRoleFlag', () => {
    it('should emit false initially, then true after setEnableRole', () => {
      const emitted: boolean[] = [];
      service.enableRoleFlag$.subscribe((v) => emitted.push(v));
      service.setEnableRole();
      expect(service.enableRole).toBeTrue();
      expect(emitted).toEqual([false, true]);
    });

    it('resetEnableRole should emit false again', () => {
      const emitted: boolean[] = [];
      service.enableRoleFlag$.subscribe((v) => emitted.push(v));
      service.setEnableRole();
      service.resetEnableRole();
      expect(service.enableRole).toBeFalse();
      expect(emitted).toEqual([false, true, false]);
    });
  });

  const body = { userName: 'u' };
  const cases: Array<[string, (s: LoginserviceService) => any, string, string, any]> = [
    ['getLogin', (s) => s.getLogin(body), 'POST', environment.getLoginURL, body],
    ['getLanguages', (s) => s.getLanguages(), 'GET', environment.getLanguageList, null],
    ['getData', (s) => s.getData(), 'GET', environment.getSecurityQuestionURL, null],
    ['validateLogin', (s) => s.validateLogin(body), 'POST', environment.getLoginURL, body],
    ['userLogoutPreviousSession', (s) => s.userLogoutPreviousSession('u1'), 'POST', environment.userLogoutPreviousSessionUrl, { userName: 'u1' }],
    ['updatePassword', (s) => s.updatePassword(body), 'POST', environment.setForgotPasswordURL, body],
    ['saveSecurityQuesAns', (s) => s.saveSecurityQuesAns(body), 'POST', environment.saveUserQuestionAns, body],
    ['validateUserName', (s) => s.validateUserName(body), 'POST', environment.forgotPasswordURL, body],
    ['validateAnswers', (s) => s.validateAnswers(body), 'POST', environment.validateSecQuesAnsURL, body],
    ['validateSessionKey', (s) => s.validateSessionKey(), 'POST', environment.getSessionExistsURL, {}],
    ['sessionLogout', (s) => s.sessionLogout(), 'POST', environment.logoutUrl, ''],
    ['licenseUrl', (s) => s.licenseUrl(), 'GET', environment.licenseUrl, null],
    ['postFormData', (s) => s.postFormData({}), 'GET', environment.getDataUploadURL, null],
    ['getAlertsNotifLocMessagesCount', (s) => s.getAlertsNotifLocMessagesCount(body), 'POST', environment.getAlertsAndNotificatonsCountUrl, body],
    ['uploadTemplate', (s) => s.uploadTemplate({}), 'GET', environment.getUploadTemplateURL, null],
  ];

  cases.forEach(([name, call, method, url, reqBody]) => {
    it(`${name} should ${method} to the expected url`, () => {
      let result: any;
      call(service).subscribe((r: any) => (result = r));
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe(method);
      if (reqBody !== null) {
        expect(req.request.body).toEqual(reqBody);
      }
      req.flush({ statusCode: 200 });
      expect(result).toEqual({ statusCode: 200 });
    });
  });

  it('validateLogin should surface an authentication failure', () => {
    let error: any;
    service.validateLogin(body).subscribe({ error: (e) => (error = e) });
    httpMock
      .expectOne(environment.getLoginURL)
      .flush({ errorMessage: 'Invalid' }, { status: 401, statusText: 'Unauthorized' });
    expect(error.status).toBe(401);
    expect(error.error.errorMessage).toBe('Invalid');
  });

  it('validateSessionKey should surface a network error', () => {
    let error: any;
    service.validateSessionKey().subscribe({ error: (e) => (error = e) });
    httpMock.expectOne(environment.getSessionExistsURL).error(new ProgressEvent('error'));
    expect(error.status).toBe(0);
  });
});
