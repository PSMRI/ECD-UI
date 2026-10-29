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
import { CtiService } from './cti.service';

describe('CtiService', () => {
  let service: CtiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CtiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created with default wrapup time and cti urls', () => {
    expect(service).toBeTruthy();
    expect(service.wrapupTime).toBe(120);
    expect(service.ctiUrl).toBe(environment.ctiUrl);
    expect(service.eventCtiUrl).toBe(environment.ctiEventUrl);
  });

  const obj = { agent_id: 10 };
  const cases: Array<[string, (s: CtiService) => any, string, string, any]> = [
    ['getCallStatistics', (s) => s.getCallStatistics(10), 'POST', environment.getCallStatistics, { agent_id: 10 }],
    ['getCallAnsweredCount', (s) => s.getCallAnsweredCount(3), 'GET', environment.getCallAnsweredVerifiedCount + '/3', null],
    ['getCTILoginToken', (s) => s.getCTILoginToken('u', 'p'), 'POST', environment.getLoginKeyUrl, { username: 'u', password: 'p' }],
    ['getAgentState', (s) => s.getAgentState(obj), 'POST', environment.getAgentState, obj],
    ['getAgentIpAddress', (s) => s.getAgentIpAddress(obj), 'POST', environment.getAgentIpAddressUrl, obj],
    ['getRoleBasedWrapuptime', (s) => s.getRoleBasedWrapuptime(4), 'GET', environment.getWrapupTimeUrl + '/4', null],
    ['callBeneficiaryManual', (s) => s.callBeneficiaryManual(10, '9999999999'), 'POST', environment.callBeneficiaryManualUrl, { agent_id: 10, phone_num: '9999999999' }],
    ['disconnectCall', (s) => s.disconnectCall(10), 'POST', environment.getDisconnectCallUrl, { agent_id: 10 }],
    ['agentCtiLogout', (s) => s.agentCtiLogout(obj), 'POST', environment.agentCtiLogOutUrl, obj],
  ];

  cases.forEach(([name, call, method, url, reqBody]) => {
    it(`${name} should ${method} to the expected url with the expected body`, () => {
      let result: any;
      call(service).subscribe((r: any) => (result = r));
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe(method);
      if (reqBody !== null) {
        expect(req.request.body).toEqual(reqBody);
      }
      req.flush({ statusCode: 200, data: {} });
      expect(result).toEqual({ statusCode: 200, data: {} });
    });
  });

  it('callBeneficiaryManual should send undefined phone number as-is (edge case)', () => {
    service.callBeneficiaryManual(10, undefined).subscribe();
    const req = httpMock.expectOne(environment.callBeneficiaryManualUrl);
    expect(req.request.body).toEqual({ agent_id: 10, phone_num: undefined });
    req.flush({});
  });

  it('should propagate errors from the CTI backend', () => {
    let status: any;
    service.getAgentState(obj).subscribe({ error: (e) => (status = e.status) });
    httpMock
      .expectOne(environment.getAgentState)
      .flush(null, { status: 503, statusText: 'Service Unavailable' });
    expect(status).toBe(503);
  });
});
