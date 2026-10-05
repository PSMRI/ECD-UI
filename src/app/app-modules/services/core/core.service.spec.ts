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
import { CoreService } from './core.service';

describe('CoreService', () => {
  let service: CoreService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CoreService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('roleChanged$ should emit the initial empty role', () => {
    let value: any;
    service.roleChanged$.subscribe((v) => (value = v));
    expect(value).toBe('');
  });

  it('onRoleChange should store and emit the new role', () => {
    const emitted: any[] = [];
    service.roleChanged$.subscribe((v) => emitted.push(v));
    service.onRoleChange('Supervisor');
    expect(service.roleChange).toBe('Supervisor');
    expect(emitted).toEqual(['', 'Supervisor']);
  });

  it('onRoleChange should emit null/undefined values as-is (edge case)', () => {
    let value: any = 'x';
    service.roleChanged$.subscribe((v) => (value = v));
    service.onRoleChange(null);
    expect(value).toBeNull();
  });

  const body = { userId: 1 };
  const cases: Array<[string, (s: CoreService) => any, string, string, any]> = [
    ['getAlertsNotifications', (s) => s.getAlertsNotifications(body), 'POST', environment.getAlertsAndNotificatonsUrl, body],
    ['getAgentAuditScore', (s) => s.getAgentAuditScore(5, 7), 'GET', environment.getAgentAuditScoreUrl + '/5/7', null],
    ['deleteAlertNotificationLocMessages', (s) => s.deleteAlertNotificationLocMessages(body), 'POST', environment.deleteAlertNotifLocMsgsUrl, body],
    ['markNotificationsAsRead', (s) => s.markNotificationsAsRead(body), 'POST', environment.changeNotificationStatusUrl, body],
  ];

  cases.forEach(([name, call, method, url, reqBody]) => {
    it(`${name} should ${method} to the expected url`, () => {
      let result: any;
      call(service).subscribe((res: any) => (result = res));
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe(method);
      if (reqBody !== null) {
        expect(req.request.body).toEqual(reqBody);
      }
      req.flush({ statusCode: 200 });
      expect(result).toEqual({ statusCode: 200 });
    });
  });

  it('should propagate HTTP errors', () => {
    let status: any;
    service.getAlertsNotifications(body).subscribe({
      error: (err) => (status = err.status),
    });
    httpMock
      .expectOne(environment.getAlertsAndNotificatonsUrl)
      .flush(null, { status: 404, statusText: 'Not Found' });
    expect(status).toBe(404);
  });
});
