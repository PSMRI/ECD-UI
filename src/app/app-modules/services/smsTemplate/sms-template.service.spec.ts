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
import { HttpInterceptorService } from '../http-inteceptor/http-interceptor.service';
import { SmsTemplateService } from './sms-template.service';

describe('SmsTemplateService', () => {
  let service: SmsTemplateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HttpInterceptorService, useValue: {} }],
    });
    service = TestBed.inject(SmsTemplateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  const obj = { smsTemplateName: 't' };
  const cases: Array<[string, (s: SmsTemplateService) => any, string, string, any]> = [
    ['getSMStemplates with type', (s) => s.getSMStemplates(1, 2), 'POST', environment.getSMStemplates_url, { providerServiceMapID: 1, smsTemplateTypeID: 2 }],
    ['getSMSTemplates', (s) => s.getSMSTemplates(1), 'POST', environment.getSMStemplates_url, { providerServiceMapID: 1 }],
    ['getSMStypes', (s) => s.getSMStypes(3), 'POST', environment.getSMStypes_url, { serviceID: 3 }],
    ['sendSMS', (s) => s.sendSMS(obj), 'POST', environment.sendSMS_url, obj],
    ['getSMSTypes', (s) => s.getSMSTypes(), 'GET', environment.getSMSTypesURL, null],
    ['getSMSParameters', (s) => s.getSMSParameters(), 'GET', environment.getSMSValuesURL, null],
    ['getSMSparameters', (s) => s.getSMSparameters(3), 'POST', environment.getSMSparameters_url, { serviceID: 3 }],
    ['saveSMStemplate', (s) => s.saveSMStemplate(obj), 'POST', environment.saveSMStemplate_url, obj],
    ['updateSMStemplate', (s) => s.updateSMStemplate(obj), 'POST', environment.updateSMStemplate_url, obj],
    ['getFullSMSTemplate', (s) => s.getFullSMSTemplate(1, 8), 'POST', environment.getFullSMSTemplate_url, { providerServiceMapID: 1, smsTemplateID: 8 }],
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
      req.flush({ data: [] });
      expect(result).toEqual({ data: [] });
    });
  });

  it('getSMStemplates should send undefined type id when type is not provided', () => {
    service.getSMStemplates(1).subscribe();
    const req = httpMock.expectOne(environment.getSMStemplates_url);
    expect(req.request.body.smsTemplateTypeID).toBeUndefined();
    req.flush({});
  });

  it('getSMStemplates should treat a falsy type id (0) as undefined (edge case)', () => {
    service.getSMStemplates(1, 0).subscribe();
    const req = httpMock.expectOne(environment.getSMStemplates_url);
    expect(req.request.body.smsTemplateTypeID).toBeUndefined();
    req.flush({});
  });

  it('should propagate errors when saving a template fails', () => {
    let status: any;
    service.saveSMStemplate(obj).subscribe({ error: (e) => (status = e.status) });
    httpMock
      .expectOne(environment.saveSMStemplate_url)
      .flush(null, { status: 400, statusText: 'Bad Request' });
    expect(status).toBe(400);
  });
});
