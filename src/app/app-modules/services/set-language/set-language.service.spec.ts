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
import { SetLanguageService } from './set-language.service';

describe('SetLanguageService', () => {
  let service: SetLanguageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(SetLanguageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getLanguageData should GET assets/<language>.json and cache the result', () => {
    const data = { hello: 'Hello' };
    let result: any;
    service.getLanguageData('English').subscribe((r) => (result = r));
    const req = httpMock.expectOne('assets/English.json');
    expect(req.request.method).toBe('GET');
    req.flush(data);
    expect(result).toEqual(data);
    expect(service.languageData).toEqual(data);
  });

  it('getLanguageData should return the cached languageData when language is empty', () => {
    service.languageData = { cached: true };
    const result = service.getLanguageData('');
    httpMock.expectNone(() => true);
    expect(result).toEqual({ cached: true } as any);
  });

  it('getLanguageData should return undefined when language is empty and nothing is cached', () => {
    expect(service.getLanguageData('')).toBeUndefined();
  });

  it('getLanguageData should not overwrite cached data on failure', () => {
    service.languageData = { old: true };
    let error: any;
    service.getLanguageData('Hindi').subscribe({ error: (e) => (error = e) });
    httpMock
      .expectOne('assets/Hindi.json')
      .flush(null, { status: 404, statusText: 'Not Found' });
    expect(error.status).toBe(404);
    expect(service.languageData).toEqual({ old: true });
  });
});
