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
import { AssociateService } from './associate.service';

describe('AssociateService', () => {
  let service: AssociateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AssociateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  const body = { benCallID: 1 };
  const cases: Array<[string, (s: AssociateService) => any, string]> = [
    ['callClosure', (s) => s.callClosure(body), environment.updateCallClosureUrl],
    ['getBenCallHist', (s) => s.getBenCallHist(body), environment.getBenHistoryURL],
    ['patchBenCallHist', (s) => s.patchBenCallHist(body), environment.patchBenHistoryURL],
  ];

  cases.forEach(([name, call, url]) => {
    it(`${name} should POST the request object`, () => {
      let result: any;
      call(service).subscribe((r: any) => (result = r));
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush({ statusCode: 200 });
      expect(result).toEqual({ statusCode: 200 });
    });
  });

  it('should propagate HTTP errors', () => {
    let status: any;
    service.callClosure(body).subscribe({ error: (e) => (status = e.status) });
    httpMock
      .expectOne(environment.updateCallClosureUrl)
      .flush(null, { status: 500, statusText: 'Server Error' });
    expect(status).toBe(500);
  });

  it('loadComponent should insert created component with data into the container', () => {
    const instance: any = {};
    const hostView = {};
    const factory = jasmine.createSpyObj('factory', ['create']);
    factory.create.and.returnValue({ instance, hostView });
    spyOn((service as any).resolver, 'resolveComponentFactory').and.returnValue(factory);
    const container = jasmine.createSpyObj('container', ['clear', 'insert'], { injector: {} });

    service.setContainer(container);
    service.loadComponent(class Dummy {}, { id: 9 });

    expect(container.clear).toHaveBeenCalled();
    expect(instance.data).toEqual({ id: 9 });
    expect(container.insert).toHaveBeenCalledWith(hostView);
  });

  it('loadComponent should throw if container is not set', () => {
    expect(() => service.loadComponent(class Dummy {}, {})).toThrowError();
  });
});
