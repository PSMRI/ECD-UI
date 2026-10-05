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
import { QualitySupervisorService } from './quality-supervisor.service';

describe('QualitySupervisorService', () => {
  let service: QualitySupervisorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(QualitySupervisorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  const body = { providerServiceMapID: 4 };
  const cases: Array<[string, (s: QualitySupervisorService) => any, string, string, any]> = [
    ['createSectionConfiguration', (s) => s.createSectionConfiguration(body), 'POST', environment.createSectionConfigurationUrl, body],
    ['updateSectionConfiguration', (s) => s.updateSectionConfiguration(body), 'PUT', environment.updateSectionConfigurationUrl, body],
    ['updateAgentQualityConfiguration', (s) => s.updateAgentQualityConfiguration(body), 'PUT', environment.updateQualityAuditorAgentUrl, body],
    ['getCentreOverallQualityRatingsData', (s) => s.getCentreOverallQualityRatingsData('Monthly', 4, 'Jan'), 'GET', environment.getCentreOverallQualityRatingUrl + '4/Monthly/Jan', null],
    ['getSkillSetQualityRatingsData', (s) => s.getSkillSetQualityRatingsData(4, 'ANM', 'Jan'), 'GET', environment.getSkillSetQualityRatingUrl + '4/ANM/Jan', null],
    ['getTenureWiseQualityRatingsData', (s) => s.getTenureWiseQualityRatingsData(4, 'ANM'), 'GET', environment.getTenureWiseQualityRatingUrl + '4/ANM', null],
    ['getNumberOfAgentScoreData', (s) => s.getNumberOfAgentScoreData(4, 'Monthly', 'Jan'), 'GET', environment.getNumberOfAgentScoreUrl + '4/Monthly/Jan', null],
    ['getCustomerSatisfactionData', (s) => s.getCustomerSatisfactionData('Monthly', 4), 'GET', environment.getCustomerSatisfactionUrl + '/Monthly/4', null],
    ['saveQualityAuditorAgent', (s) => s.saveQualityAuditorAgent(body), 'POST', environment.saveQualityAuditorAgentUrl, body],
    ['getAgentMappedData', (s) => s.getAgentMappedData(4), 'GET', environment.getAgentMappedDataUrl + '/4', null],
    ['getAuditSectionMap', (s) => s.getAuditSectionMap(4), 'GET', environment.getAuditSectionMapUrl + '/4', null],
    ['saveGrades', (s) => s.saveGrades(body), 'POST', environment.saveGradesUrl, body],
    ['updateGradeConfiguration', (s) => s.updateGradeConfiguration(body), 'PUT', environment.updateGradeConfigurationUrl, body],
    ['getGradesMappedData', (s) => s.getGradesMappedData(body), 'GET', environment.getMappedGradeURL + '/4', null],
    ['qualityReportDownload', (s) => s.qualityReportDownload({}), 'GET', environment.qualitySupervisorReportURL, null],
    ['saveSampleList', (s) => s.saveSampleList(body), 'POST', environment.saveSampleUrl, body],
    ['getCycleMappedData', (s) => s.getCycleMappedData(body), 'GET', environment.getMappedCycleURL + '/4', null],
    ['updateCycleConfiguration', (s) => s.updateCycleConfiguration(body), 'PUT', environment.updateCycleConfigurationURL, body],
    ['getListOfMapQuestionaireConfiguration', (s) => s.getListOfMapQuestionaireConfiguration(4), 'GET', environment.getListOfMapQuestionaireConfigurationUrl + '/4', null],
    ['getQuestionnaireData', (s) => s.getQuestionnaireData(4), 'GET', environment.getQuestionnaireDataUrl + '/4', null],
    ['updateQuestionConfiguration', (s) => s.updateQuestionConfiguration(body), 'PUT', environment.updateQuestionConfigurationUrl, body],
    ['saveQuestionConfiguration', (s) => s.saveQuestionConfiguration(body), 'POST', environment.saveQuestionConfigurationUrl, body],
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

  it('getGradesMappedData should throw synchronously when reqObj is undefined (edge case)', () => {
    expect(() => service.getGradesMappedData(undefined)).toThrowError(TypeError);
  });

  it('should propagate HTTP errors', () => {
    let status: any;
    service.saveGrades(body).subscribe({ error: (e) => (status = e.status) });
    httpMock
      .expectOne(environment.saveGradesUrl)
      .flush(null, { status: 500, statusText: 'Server Error' });
    expect(status).toBe(500);
  });

  it('createComponent should insert the created component with data', () => {
    const instance: any = {};
    const hostView = {};
    const factory = jasmine.createSpyObj('factory', ['create']);
    factory.create.and.returnValue({ instance, hostView });
    spyOn((service as any).resolver, 'resolveComponentFactory').and.returnValue(factory);
    const container = jasmine.createSpyObj('container', ['clear', 'insert'], { injector: {} });

    service.setContainer(container);
    service.createComponent(class Dummy {}, { x: 1 });

    expect(container.clear).toHaveBeenCalled();
    expect(instance.data).toEqual({ x: 1 });
    expect(container.insert).toHaveBeenCalledWith(hostView);
  });
});
