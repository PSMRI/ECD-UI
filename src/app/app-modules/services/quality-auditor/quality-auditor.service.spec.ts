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
import { QualityAuditorService } from './quality-auditor.service';

describe('QualityAuditorService', () => {
  let service: QualityAuditorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(QualityAuditorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created with default state', () => {
    expect(service).toBeTruthy();
    expect(service.callAuditData).toEqual([]);
    expect(service.isCycleWiseForm).toBeTrue();
    expect(service.showForm).toBeTrue();
  });

  const body = { psmId: 1, userId: 2 };
  const cases: Array<[string, (s: QualityAuditorService) => any, string, string, any]> = [
    ['getQualityAuditorWorklist', (s) => s.getQualityAuditorWorklist(body), 'POST', environment.getAuditorWorklistUrl, body],
    ['getQualityAuditorDateWorklist', (s) => s.getQualityAuditorDateWorklist(body), 'POST', environment.getDateWiseAuditorWorklistUrl, body],
    ['getQualityAuditGrades', (s) => s.getQualityAuditGrades(10), 'GET', environment.getQualityAuditGradesByPsmIdUrl + 10, null],
    ['getQuesSecForCallRatings', (s) => s.getQuesSecForCallRatings(10), 'GET', environment.getQuesSecForQualityUrl + 10, null],
    ['saveCallRatings', (s) => s.saveCallRatings(body), 'POST', environment.saveQualityRatingsUrl, body],
    ['updateCallRatings', (s) => s.updateCallRatings(body), 'POST', environment.updateQualityRatingsUrl, body],
    ['getBenCallRatings', (s) => s.getBenCallRatings(55), 'GET', environment.getBenCallRatingsUrl + 55, null],
    ['getCallRecording', (s) => s.getCallRecording(body), 'POST', environment.getCallRecordingUrl, body],
    ['getCaseSheetDataFromService', (s) => s.getCaseSheetDataFromService(body), 'POST', environment.getCaseSheetDataURL, body],
  ];

  cases.forEach(([name, call, method, url, reqBody]) => {
    it(`${name} should ${method} to the expected url and return the response`, () => {
      const response = { statusCode: 200, data: [{ id: 1 }] };
      let result: any;
      call(service).subscribe((res: any) => (result = res));

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe(method);
      if (reqBody !== null) {
        expect(req.request.body).toEqual(reqBody);
      }
      req.flush(response);
      expect(result).toEqual(response);
    });
  });

  it('should propagate HTTP errors to the subscriber', () => {
    let error: any;
    service.saveCallRatings(body).subscribe({
      next: () => fail('expected an error'),
      error: (err) => (error = err),
    });
    httpMock
      .expectOne(environment.saveQualityRatingsUrl)
      .flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    expect(error.status).toBe(500);
  });

  it('should build the url with "undefined" when the id is missing (edge case)', () => {
    service.getBenCallRatings(undefined).subscribe();
    const req = httpMock.expectOne(environment.getBenCallRatingsUrl + 'undefined');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  describe('dynamic component loading', () => {
    it('loadComponent should clear the container and insert the created component with data', () => {
      const instance: any = {};
      const hostView = {};
      const factory = jasmine.createSpyObj('factory', ['create']);
      factory.create.and.returnValue({ instance, hostView });
      const resolver: any = (service as any).resolver;
      spyOn(resolver, 'resolveComponentFactory').and.returnValue(factory);
      const container = jasmine.createSpyObj('container', ['clear', 'insert'], { injector: {} });

      service.setContainer(container);
      service.loadComponent(class Dummy {}, { foo: 'bar' });

      expect(container.clear).toHaveBeenCalled();
      expect(instance.data).toEqual({ foo: 'bar' });
      expect(container.insert).toHaveBeenCalledWith(hostView);
    });

    it('loadComponent should throw when no container has been set', () => {
      expect(() => service.loadComponent(class Dummy {}, {})).toThrowError();
    });
  });
});
