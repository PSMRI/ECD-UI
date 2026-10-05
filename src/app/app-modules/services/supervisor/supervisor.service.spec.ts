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
import { HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SupervisorService } from './supervisor.service';

describe('SupervisorService', () => {
  let service: SupervisorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(SupervisorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  const body = { providerServiceMapID: 4, fileTypeID: 2 };
  const cases: Array<[string, (s: SupervisorService) => any, string, string, any]> = [
    ['getCallConfigurations', (s) => s.getCallConfigurations(4), 'GET', environment.getCallConfigsUrl + 4, null],
    ['getUnallocatedCalls', (s) => s.getUnallocatedCalls(4, 'P', 'Mother', '2026-01-01', '2026-01-31'), 'GET', environment.getUnallocatedCallsUrl + '/4/P/Mother/2026-01-01/2026-01-31', null],
    ['saveAllocateCalls', (s) => s.saveAllocateCalls(body), 'POST', environment.getAllocateCallsUrl, body],
    ['deleteReallocatedCalls', (s) => s.deleteReallocatedCalls(body), 'PUT', environment.deleteReallocationUrl, body],
    ['getAllocatedCounts', (s) => s.getAllocatedCounts(body), 'POST', environment.getAllocatedCountUrl, body],
    ['updateReallocateCalls', (s) => s.updateReallocateCalls(body), 'POST', environment.updateRealloateCallsUrl, body],
    ['saveQuestionnaire', (s) => s.saveQuestionnaire(body), 'POST', environment.saveQuestionnaireUrl, body],
    ['getQuestionnaires', (s) => s.getQuestionnaires(4), 'GET', environment.getQuestionnaireUrl + '/4', null],
    ['getQuestionnairesForMapping', (s) => s.getQuestionnairesForMapping(4), 'GET', environment.getQuestionnairesForMappingURL + '/4', null],
    ['updateQuestionnaire', (s) => s.updateQuestionnaire(body), 'POST', environment.updateQuestionnaireUrl, body],
    ['createCallConfiguration', (s) => s.createCallConfiguration(body), 'POST', environment.createCallConfigurationUrl, body],
    ['updateCallConfiguration', (s) => s.updateCallConfiguration(body, 1), 'PUT', environment.updateCallConfigurationUrl, body],
    ['getSectionConfigurations', (s) => s.getSectionConfigurations(4), 'GET', environment.getSectionConfigurationsUrl + 4, null],
    ['getAlertsData', (s) => s.getAlertsData(body), 'POST', environment.getAlertsNotificationUrl, body],
    ['getNotificationType', (s) => s.getNotificationType(body), 'POST', environment.getNotificationTypeUrl, body],
    ['createSectionConfiguration', (s) => s.createSectionConfiguration(body), 'POST', environment.createSuprSectionConfigurationUrl, body],
    ['updateSectionConfiguration', (s) => s.updateSectionConfiguration(body), 'PUT', environment.updateSuprSectionConfigurationUrl, body],
    ['deleteSectionConfiguration', (s) => s.deleteSectionConfiguration(body), 'POST', environment.deleteSectionConfigurationUrl, body],
    ['getRoles', (s) => s.getRoles(4), 'GET', environment.getRolesURL + '/4', null],
    ['getRole', (s) => s.getRole(), 'GET', environment.getRolesURL, null],
    ['getAgentsData', (s) => s.getAgentsData(6), 'GET', environment.getAgentsDataUrl + '/6', null],
    ['getAutoPreviewDialByUserIdAndRoleIdAndPsmId', (s) => s.getAutoPreviewDialByUserIdAndRoleIdAndPsmId(1, 6, 4), 'GET', environment.getAgentsDataUrl + '/1/6/4', null],
    ['getOffices', (s) => s.getOffices(4), 'GET', environment.getOfficesFromRoleURL + '/4', null],
    ['saveCreateAlert', (s) => s.saveCreateAlert(body), 'POST', environment.createNotificationURL, body],
    ['saveCreateNotification', (s) => s.saveCreateNotification(body), 'POST', environment.createNotificationURL, body],
    ['saveEditAlert', (s) => s.saveEditAlert(body), 'POST', environment.updateNotificationURL, body],
    ['saveEditNotification', (s) => s.saveEditNotification(body), 'POST', environment.updateNotificationURL, body],
    ['saveLocationMessages', (s) => s.saveLocationMessages(body), 'POST', environment.createNotificationURL, body],
    ['EditLocationMessages', (s) => s.EditLocationMessages(body), 'POST', environment.updateNotificationURL, body],
    ['saveQuestionnaireSectionMapping', (s) => s.saveQuestionnaireSectionMapping(body), 'POST', environment.saveQuestionnaireSectionMappingUrl, body],
    ['updateQuestionnaireSectionMapping', (s) => s.updateQuestionnaireSectionMapping(body), 'PUT', environment.updateQuestionnaireSectionMappingUrl, body],
    ['getSectionQuestionnaireMap', (s) => s.getSectionQuestionnaireMap(4), 'GET', environment.getSectionQuestionnaireMapUrl + '/4', null],
    ['getUnMappedQuestionnaires', (s) => s.getUnMappedQuestionnaires(4, 9), 'GET', environment.getUnMappedQuestionnairesUrl + '/4/9', null],
    ['createCallSectionMapping', (s) => s.createCallSectionMapping(body), 'POST', environment.createCallSectionMappingUrl, body],
    ['getMappedSections', (s) => s.getMappedSections(4, 3), 'GET', environment.getMappedSectionsUrl + '4/3', null],
    ['getAlertOnSearch', (s) => s.getAlertOnSearch(body), 'POST', environment.getSupervisorNotificationsURL, body],
    ['getNotificationOnSearch', (s) => s.getNotificationOnSearch(body), 'POST', environment.getSupervisorNotificationsURL, body],
    ['getLocationOnSearch', (s) => s.getLocationOnSearch(body), 'POST', environment.getSupervisorNotificationsURL, body],
    ['getUserLogout', (s) => s.getUserLogout(body), 'POST', environment.forceUserLogoutURL, body],
    ['publishAlert', (s) => s.publishAlert(body), 'POST', environment.publishAlertURL, body],
    ['publishNotification', (s) => s.publishNotification(body), 'POST', environment.publishNotificationURL, body],
    ['publishLocationMessages', (s) => s.publishLocationMessages(body), 'POST', environment.publishLocationMessagesURL, body],
    ['saveDialPreference', (s) => s.saveDialPreference(body), 'POST', environment.dialPreferenceURL, body],
    ['fetchDialPreference', (s) => s.fetchDialPreference(4), 'GET', environment.fetchDialPreferenceUrl + '/4', null],
    ['postFormData', (s) => s.postFormData(body), 'POST', environment.getDataUploadURL, body],
    ['postTemplateData', (s) => s.postTemplateData(body), 'POST', environment.getUploadTemplateURL, body],
    ['getDownloadData', (s) => s.getDownloadData(body), 'GET', environment.getDownloadTemplateURL + '/4/2', null],
    ['createParentChildMapping', (s) => s.createParentChildMapping(body), 'POST', environment.createParentChildMappingURL, body],
    ['getMappedQuestions', (s) => s.getMappedQuestions(body), 'GET', environment.getMappedQuestionsURL + '/4', null],
    ['updateParentChildMapping', (s) => s.updateParentChildMapping(body), 'POST', environment.updateParentChildMappingURL, body],
    ['getLowRiskRecordsByLanguage', (s) => s.getLowRiskRecordsByLanguage(4, 'P', 'Child', 'f', 't', 'Hindi', 'ANM'), 'GET', environment.getLowRiskRecordsByLanguageUrl + '/4/P/Child/f/t/Hindi/ANM', null],
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

  const reports: Array<[string, (s: SupervisorService, b: any) => any, string]> = [
    ['downloadCumulativeReport', (s, b) => s.downloadCumulativeReport(b), environment.downloadCumulativeReportURL],
    ['downloadCallDetailReport', (s, b) => s.downloadCallDetailReport(b), environment.downloadCallDetailReportURL],
    ['downloadCallSummaryReport', (s, b) => s.downloadCallSummaryReport(b), environment.downloadCallSummaryReportURL],
    ['downloadBenificiaryWiseReport', (s, b) => s.downloadBenificiaryWiseReport(b), environment.downloadBenificiaryWiseReportURL],
    ['downloadCallUniqueReport', (s, b) => s.downloadCallUniqueReport(b), environment.downloadCallUniqueReportURL],
    ['downloadBirthDefectReport', (s, b) => s.downloadBirthDefectReport(b), environment.downloadBirthDefectReportURL],
    ['downloadAshaHomeReport', (s, b) => s.downloadAshaHomeReport(b), environment.downloadAashaHomeReportURL],
    ['downloadCalciumIfaReport', (s, b) => s.downloadCalciumIfaReport(b), environment.downloadCalciumIfaReportURL],
    ['downloadAbsenceVhsndReport', (s, b) => s.downloadAbsenceVhsndReport(b), environment.downloadAbsenceVhsndReportURL],
    ['downloadVaccineDropoutReport', (s, b) => s.downloadVaccineDropoutReport(b), environment.downloadVaccineDropoutReportURL],
    ['downloadVaccineLeftoutReport', (s, b) => s.downloadVaccineLeftoutReport(b), environment.downloadVaccineLeftoutReportURL],
    ['downloadDevDelayReport', (s, b) => s.downloadDevDelayReport(b), environment.downloadDevDelayReportURL],
    ['downloadAbortionReport', (s, b) => s.downloadAbortionReport(b), environment.downloadAbortionReportURL],
    ['downloadDeliveryStatusReport', (s, b) => s.downloadDeliveryStatusReport(b), environment.downloadDeliveryStatusReportURL],
    ['downloadHrpwCasesReport', (s, b) => s.downloadHrpwCasesReport(b), environment.downloadHrpwCasesReportURL],
    ['downloadInfantHighRiskReport', (s, b) => s.downloadInfantHighRiskReport(b), environment.downloadInfantHighRiskReportURL],
    ['downloadMaternalDeathReport', (s, b) => s.downloadMaternalDeathReport(b), environment.downloadMaternalDeathReportURL],
    ['downloadStillBirthReport', (s, b) => s.downloadStillBirthReport(b), environment.downloadStillBirthReportURL],
    ['downloadBabyDeathReport', (s, b) => s.downloadBabyDeathReport(b), environment.downloadBabyDeathReportURL],
    ['downloadNotConnectedReport', (s, b) => s.downloadNotConnectedReport(b), environment.downloadNotConnectedReportURL],
    ['downloadJsyReport', (s, b) => s.downloadJsyReport(b), environment.downloadJsyReportURL],
    ['downloadMiscarriageReport', (s, b) => s.downloadMiscarriageReport(b), environment.downloadMiscarriageReportURL],
  ];

  reports.forEach(([name, call, url]) => {
    it(`${name} should POST and return the full blob HttpResponse`, () => {
      const reqData = { startDate: '2026-01-01', endDate: '2026-01-31' };
      let result: any;
      call(service, reqData).subscribe((r: any) => (result = r));
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(reqData);
      expect(req.request.responseType).toBe('blob');
      const blob = new Blob(['x'], { type: 'application/vnd.ms-excel' });
      req.flush(blob, { headers: { 'Content-Disposition': 'attachment; filename=r.xlsx' } });
      expect(result instanceof HttpResponse).toBeTrue();
      expect(result.body).toEqual(blob);
      expect(result.headers.get('Content-Disposition')).toContain('r.xlsx');
    });
  });

  it('report download should propagate a server error', () => {
    let status: any;
    service.downloadCallDetailReport({}).subscribe({ error: (e) => (status = e.status) });
    httpMock
      .expectOne(environment.downloadCallDetailReportURL)
      .flush(new Blob(), { status: 500, statusText: 'Server Error' });
    expect(status).toBe(500);
  });

  it('getDownloadData should throw synchronously when reqObj is undefined (edge case)', () => {
    expect(() => service.getDownloadData(undefined)).toThrowError(TypeError);
  });

  it('should propagate HTTP errors from JSON endpoints', () => {
    let status: any;
    service.saveAllocateCalls(body).subscribe({ error: (e) => (status = e.status) });
    httpMock
      .expectOne(environment.getAllocateCallsUrl)
      .flush(null, { status: 400, statusText: 'Bad Request' });
    expect(status).toBe(400);
  });

  it('createComponent should insert the created component with data', () => {
    const instance: any = {};
    const hostView = {};
    const factory = jasmine.createSpyObj('factory', ['create']);
    factory.create.and.returnValue({ instance, hostView });
    spyOn((service as any).resolver, 'resolveComponentFactory').and.returnValue(factory);
    const container = jasmine.createSpyObj('container', ['clear', 'insert'], { injector: {} });

    service.setContainer(container);
    service.createComponent(class Dummy {}, { y: 2 });

    expect(container.clear).toHaveBeenCalled();
    expect(instance.data).toEqual({ y: 2 });
    expect(container.insert).toHaveBeenCalledWith(hostView);
  });
});
