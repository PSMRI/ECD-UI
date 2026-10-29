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
import { MasterService } from './master.service';

describe('MasterService', () => {
  let service: MasterService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(MasterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // [name, call, url, sort key]
  const sortedGets: Array<[string, (s: MasterService) => any, string, string]> = [
    ['getQuestionnaireTypeMaster', (s) => s.getQuestionnaireTypeMaster(), environment.getQuestionnaireTypeUrl, 'questionType'],
    ['getAnswerTypeMaster', (s) => s.getAnswerTypeMaster(), environment.getAnswerTypeUrl, 'answerType'],
    ['getSectionMaster', (s) => s.getSectionMaster(4), environment.getSectionMastersUrl + '/4', 'sectionName'],
    ['getSMSMaster', (s) => s.getSMSMaster(), environment.getSMSTypeUrl, 'smsType'],
    ['getRoleMaster', (s) => s.getRoleMaster(4), environment.getRoleMasterUrl + '/4', 'roleName'],
    ['getOfficesMaster', (s) => s.getOfficesMaster(4), environment.getOfficeMasterUrl + '/4', 'locationName'],
    ['getFrequencyMaster', (s) => s.getFrequencyMaster(), environment.getFrequencyMasterUrl, 'name'],
    ['getGradeMaster', (s) => s.getGradeMaster({}), environment.getGradeMastersUrl, 'name'],
    ['getCyclesMaster', (s) => s.getCyclesMaster({}), environment.getCycleMastersUrl, 'name'],
    ['getNoFurtherCallsReason', (s) => s.getNoFurtherCallsReason(), environment.getNoFurtherCallsReasonUrl, 'name'],
    ['getReasonsOfNotCallAnswered', (s) => s.getReasonsOfNotCallAnswered(), environment.getReasonsOfNotCallAnsweredUrl, 'name'],
    ['getTypeOfComplaints', (s) => s.getTypeOfComplaints(), environment.getTypeOfComplaintsUrl, 'name'],
    ['getLanguageMaster', (s) => s.getLanguageMaster(), environment.getLanguageMasterUrl, 'languageName'],
    ['getLanguageMasterByUserId', (s) => s.getLanguageMasterByUserId(9), environment.getLanguageMasterByUserIdUrl + 9, 'languageName'],
    ['getHrpReasons', (s) => s.getHrpReasons(), environment.getHrpReasonMasterUrl, 'name'],
    ['getHniReasons', (s) => s.getHniReasons(), environment.getHrniReasonMasterUrl, 'name'],
    ['getContentialAnomaliesReasons', (s) => s.getContentialAnomaliesReasons(), environment.getCongentialAnomaliesMasterUrl, 'name'],
    ['getStateMaster', (s) => s.getStateMaster(1), environment.getStatesMasterUrl + '/1', 'stateName'],
    ['getDistrictMaster', (s) => s.getDistrictMaster(2), environment.getDistrictMasterUrl + '/2', 'districtName'],
    ['getBlockMaster', (s) => s.getBlockMaster(3), environment.getBlockMasterUrl + '/3', 'blockName'],
    ['getVillageMaster', (s) => s.getVillageMaster(4), environment.getVillageMasterUrl + '/4', 'villageName'],
    ['getGenderMaster', (s) => s.getGenderMaster(), environment.getGenderMasterUrl, 'genderName'],
  ];

  sortedGets.forEach(([name, call, url, key]) => {
    it(`${name} should GET and return items sorted case-insensitively by ${key}`, () => {
      let result: any[] = [];
      call(service).subscribe((r: any) => (result = r));
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush([{ [key]: 'beta' }, { [key]: 'Alpha' }, { [key]: 'gamma' }]);
      expect(result.map((i) => i[key])).toEqual(['Alpha', 'beta', 'gamma']);
    });
  });

  it('sorted masters should return an empty array unchanged', () => {
    let result: any;
    service.getGenderMaster().subscribe((r) => (result = r));
    httpMock.expectOne(environment.getGenderMasterUrl).flush([]);
    expect(result).toEqual([]);
  });

  it('sorted masters should return null response unchanged', () => {
    let result: any = 'x';
    service.getGenderMaster().subscribe((r) => (result = r));
    httpMock.expectOne(environment.getGenderMasterUrl).flush(null);
    expect(result).toBeNull();
  });

  it('sorted masters should place items with a missing sort key first', () => {
    let result: any[] = [];
    service.getFrequencyMaster().subscribe((r: any) => (result = r));
    httpMock
      .expectOne(environment.getFrequencyMasterUrl)
      .flush([{ name: 'Weekly' }, { id: 1 }, { name: 'Daily' }]);
    expect(result).toEqual([{ id: 1 }, { name: 'Daily' }, { name: 'Weekly' }]);
  });

  // Agent/auditor lists sort by "firstName lastName"
  const nameSorted: Array<[string, (s: MasterService) => any, string]> = [
    ['getAuditorMaster', (s) => s.getAuditorMaster(4), environment.getAuditorMastersUrl + '/4'],
    ['getAgentMaster', (s) => s.getAgentMaster({ roleId: 6 }), environment.getAgentMastersUrl + '/6'],
    ['getAgentMasterByRoleId', (s) => s.getAgentMasterByRoleId(6), environment.getAgentMastersUrl + '/6'],
    ['getAgentMasterByRoleIdAndLanguage', (s) => s.getAgentMasterByRoleIdAndLanguage(6, 'Hindi'), environment.getAgentMasterByRoleIdAndLanguageUrl + '/6/Hindi'],
  ];

  nameSorted.forEach(([name, call, url]) => {
    it(`${name} should sort agents by full name`, () => {
      let result: any[] = [];
      call(service).subscribe((r: any) => (result = r));
      httpMock.expectOne(url).flush([
        { firstName: 'ravi', lastName: 'Kumar' },
        { firstName: 'Anita', lastName: 'Shah' },
        { firstName: 'Ravi', lastName: 'Bose' },
      ]);
      expect(result.map((a) => `${a.firstName} ${a.lastName}`)).toEqual([
        'Anita Shah',
        'Ravi Bose',
        'ravi Kumar',
      ]);
    });
  });

  it('getAgentMaster should throw synchronously when reqObj is undefined (edge case)', () => {
    expect(() => service.getAgentMaster(undefined)).toThrowError(TypeError);
  });

  it('getAuditorMaster should cope with missing first/last names', () => {
    let result: any[] = [];
    service.getAuditorMaster(4).subscribe((r: any) => (result = r));
    httpMock
      .expectOne(environment.getAuditorMastersUrl + '/4')
      .flush([{ firstName: 'Zed' }, { lastName: 'Adams' }]);
    expect(result).toEqual([{ lastName: 'Adams' }, { firstName: 'Zed' }]);
  });

  describe('POST masters wrapped in { data }', () => {
    it('getOfficeMasterData should POST psmId and sort res.data by locationName', () => {
      let result: any;
      service.getOfficeMasterData(4).subscribe((r) => (result = r));
      const req = httpMock.expectOne(environment.getOfficeMasterDataUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ providerServiceMapID: 4 });
      req.flush({ statusCode: 200, data: [{ locationName: 'Pune' }, { locationName: 'agra' }] });
      expect(result.data.map((d: any) => d.locationName)).toEqual(['agra', 'Pune']);
      expect(result.statusCode).toBe(200);
    });

    it('getLocationsMaster should POST psmId and roleID and sort res.data', () => {
      let result: any;
      service.getLocationsMaster(4, 7).subscribe((r) => (result = r));
      const req = httpMock.expectOne(environment.getLocationsURL);
      expect(req.request.body).toEqual({ providerServiceMapID: 4, roleID: 7 });
      req.flush({ data: [{ locationName: 'b' }, { locationName: 'a' }] });
      expect(result.data).toEqual([{ locationName: 'a' }, { locationName: 'b' }]);
    });

    it('getLocationsMaster should return response untouched when data is missing', () => {
      let result: any;
      service.getLocationsMaster(4, 7).subscribe((r) => (result = r));
      httpMock.expectOne(environment.getLocationsURL).flush({ statusCode: 5000, errorMessage: 'fail' });
      expect(result).toEqual({ statusCode: 5000, errorMessage: 'fail' });
    });

    it('getOfficeMasterData should return null response untouched', () => {
      let result: any = 'x';
      service.getOfficeMasterData(4).subscribe((r) => (result = r));
      httpMock.expectOne(environment.getOfficeMasterDataUrl).flush(null);
      expect(result).toBeNull();
    });
  });

  it('should propagate HTTP errors without sorting', () => {
    let status: any;
    service.getStateMaster(1).subscribe({
      next: () => fail('should not emit'),
      error: (e) => (status = e.status),
    });
    httpMock
      .expectOne(environment.getStatesMasterUrl + '/1')
      .flush(null, { status: 500, statusText: 'Server Error' });
    expect(status).toBe(500);
  });
});
