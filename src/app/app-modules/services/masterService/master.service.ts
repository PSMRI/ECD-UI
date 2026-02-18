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


import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { sortByProperty } from '../utils/sort-util';

const sortByName = (item: any) => (item.firstName || '') + ' ' + (item.lastName || '');

@Injectable({
  providedIn: 'root',
})
export class MasterService {

  frequencyMasterList:any;
  frequencyMasterListOfScoreChart:any
  constructor(private http: HttpClient) {}

  getQuestionnaireTypeMaster() {
    return this.http.get(environment.getQuestionnaireTypeUrl).pipe(
      map((res: any) => sortByProperty(res, 'questionType'))
    );
  }

  getAnswerTypeMaster() {
    return this.http.get(environment.getAnswerTypeUrl).pipe(
      map((res: any) => sortByProperty(res, 'answerType'))
    );
  }

  getSectionMaster(reqObj: any) {
    return this.http.get(environment.getSectionMastersUrl + '/' + reqObj).pipe(
      map((res: any) => sortByProperty(res, 'sectionName'))
    );
  }
  getSMSMaster() {
    return this.http.get(environment.getSMSTypeUrl).pipe(
      map((res: any) => sortByProperty(res, 'smsType'))
    );
  }

  getRoleMaster(reqObj: any) {
    return this.http.get(environment.getRoleMasterUrl + '/' + reqObj).pipe(
      map((res: any) => sortByProperty(res, 'roleName'))
    );
  }
  getOfficesMaster(reqObj: any) {
    return this.http.get(environment.getOfficeMasterUrl + '/' + reqObj).pipe(
      map((res: any) => sortByProperty(res, 'locationName'))
    );
  }

  getOfficeMasterData(providerServiceMapID: any) {
    return this.http.post(environment.getOfficeMasterDataUrl,
      {
        'providerServiceMapID': providerServiceMapID
      }).pipe(
      map((res: any) => {
        if (res && res.data) {
          res.data = sortByProperty(res.data, 'locationName');
        }
        return res;
      })
    );
  }

  getLocationsMaster(providerServiceMapID: any, roleID: any) {
    return this.http.post(environment.getLocationsURL,
      {
        'providerServiceMapID': providerServiceMapID,
        'roleID': roleID
      }).pipe(
      map((res: any) => {
        if (res && res.data) {
          res.data = sortByProperty(res.data, 'locationName');
        }
        return res;
      })
    );
  }

  getFrequencyMaster() {
    return this.http.get(environment.getFrequencyMasterUrl).pipe(
      map((res: any) => sortByProperty(res, 'name'))
    );
  }
  getAuditorMaster(reqObj: any) {
    return this.http.get(environment.getAuditorMastersUrl + '/' + reqObj).pipe(
      map((res: any) => sortByProperty(res, sortByName))
    );
  }
  getGradeMaster(reqObj:any){
    return this.http.get(environment.getGradeMastersUrl).pipe(
      map((res: any) => sortByProperty(res, 'name'))
    );
  }
  getCyclesMaster(reqObj: any){
    return this.http.get(environment.getCycleMastersUrl).pipe(
      map((res: any) => sortByProperty(res, 'name'))
    );
  }
  getAgentMaster(reqObj: any){
    return this.http.get(environment.getAgentMastersUrl +'/' + reqObj.roleId ).pipe(
      map((res: any) => sortByProperty(res, sortByName))
    );
  }

  getAgentMasterByRoleId(reqObj: any){
    return this.http.get(environment.getAgentMastersUrl +'/' + reqObj ).pipe(
      map((res: any) => sortByProperty(res, sortByName))
    );
  }
  getNoFurtherCallsReason(){
    return this.http.get(environment.getNoFurtherCallsReasonUrl).pipe(
      map((res: any) => sortByProperty(res, 'name'))
    );
  }
  getReasonsOfNotCallAnswered(){
    return this.http.get(environment.getReasonsOfNotCallAnsweredUrl).pipe(
      map((res: any) => sortByProperty(res, 'name'))
    );
  }
  getTypeOfComplaints(){
    return this.http.get(environment.getTypeOfComplaintsUrl).pipe(
      map((res: any) => sortByProperty(res, 'name'))
    );
  }

  getLanguageMaster(){
    return this.http.get(environment.getLanguageMasterUrl ).pipe(
      map((res: any) => sortByProperty(res, 'languageName'))
    );
  }

  getLanguageMasterByUserId(userId: any){
    return this.http.get(environment.getLanguageMasterByUserIdUrl + userId).pipe(
      map((res: any) => sortByProperty(res, 'languageName'))
    );
  }

  getHrpReasons(){
    return this.http.get(environment.getHrpReasonMasterUrl).pipe(
      map((res: any) => sortByProperty(res, 'name'))
    );
  }

  getHniReasons(){
    return this.http.get(environment.getHrniReasonMasterUrl).pipe(
      map((res: any) => sortByProperty(res, 'name'))
    );
  }

  getContentialAnomaliesReasons(){
    return this.http.get(environment.getCongentialAnomaliesMasterUrl).pipe(
      map((res: any) => sortByProperty(res, 'name'))
    );
  }

  getStateMaster(countryId:any) {
    return this.http.get(environment.getStatesMasterUrl + "/" + countryId).pipe(
      map((res: any) => sortByProperty(res, 'stateName'))
    );
  }

  getDistrictMaster(stateId:any) {
    return this.http.get(environment.getDistrictMasterUrl + "/" + stateId).pipe(
      map((res: any) => sortByProperty(res, 'districtName'))
    );
  }

  getBlockMaster(districtId:any) {
    return this.http.get(environment.getBlockMasterUrl + "/" + districtId).pipe(
      map((res: any) => sortByProperty(res, 'blockName'))
    );
  }

  getVillageMaster(blockId:any) {
    return this.http.get(environment.getVillageMasterUrl + "/" + blockId).pipe(
      map((res: any) => sortByProperty(res, 'villageName'))
    );
  }

  getGenderMaster() {
    return this.http.get(environment.getGenderMasterUrl).pipe(
      map((res: any) => sortByProperty(res, 'genderName'))
    );
  }

  getAgentMasterByRoleIdAndLanguage(roleId : any,language : any){
      return this.http.get(environment.getAgentMasterByRoleIdAndLanguageUrl + "/" + roleId + "/" + language).pipe(
        map((res: any) => sortByProperty(res, sortByName))
      );
  }

}
