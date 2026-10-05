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
import { AssociateAnmMoService } from './associate-anm-mo.service';

describe('AssociateAnmMoService', () => {
  let service: AssociateAnmMoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AssociateAnmMoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created with default flags', () => {
    expect(service).toBeTruthy();
    expect(service.isMother).toBeFalse();
    expect(service.callDetailId).toBeNull();
    expect(service.isCallInitiated).toBeFalse();
    expect(service.autoDialing).toBeFalse();
  });

  const body = { benCallID: 1 };
  const cases: Array<[string, (s: AssociateAnmMoService) => any, string, string, any]> = [
    ['callClosure', (s) => s.callClosure(body), 'POST', environment.updateCallClosureUrl, body],
    ['commonCallClosure', (s) => s.commonCallClosure(body), 'POST', environment.updateCommonCallClosureUrl, body],
    ['getCallTypes', (s) => s.getCallTypes(body), 'POST', environment.getCallTypesUrl, body],
    ['saveBenCallDetails', (s) => s.saveBenCallDetails(body), 'POST', environment.saveBenCallDetails, body],
    ['getAutoPreviewDialing', (s) => s.getAutoPreviewDialing(1, 2, 3), 'GET', environment.getAgentAutoPreviewDialingUrl + '/1/2/3', null],
    ['getAgentMasterData', (s) => s.getAgentMasterData(), 'GET', environment.getAgentMasterDataUrl, null],
    ['fetchBeneficiaryQuestionnaire', (s) => s.fetchBeneficiaryQuestionnaire(4, 'Intro', 'ANM'), 'GET', environment.getBeneficiaryQuestionnaire + '4/Intro/ANM', null],
    ['saveQuestionnaireResponse', (s) => s.saveQuestionnaireResponse(body), 'POST', environment.saveBenQuestionnaireResponseUrl, body],
    ['getHRPDetails', (s) => s.getHRPDetails({ motherId: 11 }), 'GET', environment.getBenHrpHrniDetailsUrl + 'motherId=11', null],
    ['getHRNIDetails', (s) => s.getHRNIDetails({ childId: 12 }), 'GET', environment.getBenHrpHrniDetailsUrl + 'childId=12', null],
    ['registerBeneficiary', (s) => s.registerBeneficiary(body), 'POST', environment.registerBeneficiaryUrl, body],
    ['updateBeneficiary', (s) => s.updateBeneficiary(body), 'POST', environment.updateBeneficiaryUrl, body],
    ['getMotherRecord', (s) => s.getMotherRecord({ userId: 5 }), 'GET', environment.getMotherOutboundWorkListUrl + '/5', null],
    ['getChildRecord', (s) => s.getChildRecord({ userId: 5 }), 'GET', environment.getChildOutboundWorkListUrl + '/5', null],
    ['getCallHistoryDetails', (s) => s.getCallHistoryDetails(77), 'GET', environment.getCallHistoryDetailsUrl + '/77', null],
    ['generateLink', (s) => s.generateLink(), 'POST', environment.generateVideoLinkURL, {}],
    ['saveVideoCall', (s) => s.saveVideoCall(body), 'POST', environment.sendSMSAPI, body],
    ['updateCallStatus', (s) => s.updateCallStatus(body), 'POST', environment.updateCallStatusAPI, body],
    ['getAgentToken', (s) => s.getAgentToken('room', 'Agent', 'a@b.c'), 'POST', environment.agentVideoTokenURL, { slug: 'room', agentName: 'Agent', agentEmail: 'a@b.c' }],
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

  it('getBeneficiaryCallHistory should send the request object as query params', () => {
    service.getBeneficiaryCallHistory({ benId: 3, page: 1 }).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === environment.getBeneficiaryCallHistoryUrl
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('benId')).toBe('3');
    expect(req.request.params.get('page')).toBe('1');
    req.flush([]);
  });

  it('getHRPDetails should throw synchronously when reqObj is undefined (edge case)', () => {
    expect(() => service.getHRPDetails(undefined)).toThrowError(TypeError);
  });

  it('should propagate HTTP errors', () => {
    let status: any;
    service.registerBeneficiary(body).subscribe({ error: (e) => (status = e.status) });
    httpMock
      .expectOne(environment.registerBeneficiaryUrl)
      .flush(null, { status: 500, statusText: 'Server Error' });
    expect(status).toBe(500);
  });

  describe('state flags', () => {
    it('set/resetCloseCallOnWrapup should emit 1 then 0', () => {
      const emitted: any[] = [];
      service.callWrapupFlag$.subscribe((v) => emitted.push(v));
      service.setCloseCallOnWrapup();
      expect(service.callWrapup).toBe(1);
      service.resetCloseCallOnWrapup();
      expect(service.callWrapup).toBe(0);
      expect(emitted).toEqual(['', 1, 0]);
    });

    it('set/clearCallClosure should emit 1 then 0', () => {
      const emitted: any[] = [];
      service.callClosureFlag$.subscribe((v) => emitted.push(v));
      service.setCallClosure();
      service.clearCallClosure();
      expect(emitted).toEqual(['', 1, 0]);
    });

    const setReset: Array<[string, string, string, string]> = [
      ['setLoadDetailsInReg', 'resetLoadDetailsInReg', 'loadDetailsInReg', 'loadDetailsInRegFlag$'],
      ['setOpenComp', 'resetOpenComp', 'openComp', 'openCompFlag$'],
      ['setBenHistoryComp', 'resetBenHistoryComp', 'isBenCallHistory', 'isBenCallHistoryData$'],
      ['setBenRegistartionComp', 'resetBenRegistartionComp', 'isBenRegistartion', 'isBenRegistartionData$'],
      ['setStopTimer', 'clearStopTimer', 'stopTimer', 'stopTimerFlag$'],
    ];

    setReset.forEach(([setFn, resetFn, field, stream]) => {
      it(`${setFn}/${resetFn} should update ${field} and emit value then null`, () => {
        const s: any = service;
        const emitted: any[] = [];
        s[stream].subscribe((v: any) => emitted.push(v));
        s[setFn]({ a: 1 });
        expect(s[field]).toEqual({ a: 1 });
        s[resetFn]();
        expect(s[field]).toBeNull();
        expect(emitted).toEqual(['', { a: 1 }, null]);
      });
    });

    it('onClickOfOutboundWorklistScreen should emit the mother-record flag', () => {
      let value: any;
      service.isMotherRecordData$.subscribe((v) => (value = v));
      service.onClickOfOutboundWorklistScreen(true);
      expect(service.isMotherRecord).toBeTrue();
      expect(value).toBeTrue();
    });

    it('onClickOfEcdQuestionnaire should emit the questionnaire flag', () => {
      let value: any;
      service.loadEcdQuestionnaireData$.subscribe((v) => (value = v));
      service.onClickOfEcdQuestionnaire('load');
      expect(value).toBe('load');
    });

    it('setResetAgentStatus should emit the value', () => {
      let value: any;
      service.resetAgentStatusFlag$.subscribe((v) => (value = v));
      service.setResetAgentStatus(true);
      expect(value).toBeTrue();
    });

    it('setAgentState should store and emit the agent status', () => {
      let value: any;
      service.agentCurrentStatusData$.subscribe((v) => (value = v));
      service.setAgentState('READY');
      expect(service.agentCurrentStatus).toBe('READY');
      expect(value).toBe('READY');
    });

    // Documents current behaviour: resetAgentState calls .next() on the
    // (now null) value instead of on agentCurrentStatusData, so it throws.
    it('resetAgentState currently throws because it calls next() on a null value', () => {
      service.setAgentState('READY');
      expect(() => service.resetAgentState()).toThrowError(TypeError);
      expect(service.agentCurrentStatus).toBeNull();
    });

    it('setCallInitiated should toggle isCallInitiated', () => {
      service.setCallInitiated(true);
      expect(service.isCallInitiated).toBeTrue();
      service.setCallInitiated(false);
      expect(service.isCallInitiated).toBeFalse();
    });
  });

  it('loadComponent should insert the created component with data', () => {
    const instance: any = {};
    const hostView = {};
    const factory = jasmine.createSpyObj('factory', ['create']);
    factory.create.and.returnValue({ instance, hostView });
    spyOn((service as any).resolver, 'resolveComponentFactory').and.returnValue(factory);
    const container = jasmine.createSpyObj('container', ['clear', 'insert'], { injector: {} });

    service.setContainer(container);
    service.loadComponent(class Dummy {}, { z: 3 });

    expect(container.clear).toHaveBeenCalled();
    expect(instance.data).toEqual({ z: 3 });
    expect(container.insert).toHaveBeenCalledWith(hostView);
  });
});
