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

@Injectable({
  providedIn: 'root',
})
export class MasterService {

  frequencyMasterList:any;
  frequencyMasterListOfScoreChart:any
  constructor(private http: HttpClient) {}

  getQuestionnaireTypeMaster() {
    return this.http.get(environment.getQuestionnaireTypeUrl);
  }

  getAnswerTypeMaster() {
    return this.http.get(environment.getAnswerTypeUrl);
  }

  getSectionMaster(reqObj: any) {
    return this.http.get(environment.getSectionMastersUrl + '/' + reqObj);
  }
  getSMSMaster() {
    return this.http.get(environment.getSMSTypeUrl);
  }

  getRoleMaster(reqObj: any) {
    return this.http.get(environment.getRoleMasterUrl + '/' + reqObj);
  }
  getOfficesMaster(reqObj: any) {
    return this.http.get(environment.getOfficeMasterUrl + '/' + reqObj);
  }

  getOfficeMasterData(providerServiceMapID: any) {
    return this.http.post(environment.getOfficeMasterDataUrl,
      {
        'providerServiceMapID': providerServiceMapID
      });
  }

  getLocationsMaster(providerServiceMapID: any, roleID: any) {
    return this.http.post(environment.getLocationsURL,
      {
        'providerServiceMapID': providerServiceMapID,
        'roleID': roleID
      });
  }

  getFrequencyMaster() {
    return this.http.get(environment.getFrequencyMasterUrl);
  }
  getAuditorMaster(reqObj: any) {
    return this.http.get(environment.getAuditorMastersUrl + '/' + reqObj);
  }
  getGradeMaster(reqObj:any){
    return this.http.get(environment.getGradeMastersUrl);
  }
  getCyclesMaster(reqObj: any){
    return this.http.get(environment.getCycleMastersUrl);
  }
  getAgentMaster(reqObj: any){
    return this.http.get(environment.getAgentMastersUrl +'/' + reqObj.roleId );
  }

  getAgentMasterByRoleId(reqObj: any){
    return this.http.get(environment.getAgentMastersUrl +'/' + reqObj );
  }
  getNoFurtherCallsReason(){
    return this.http.get(environment.getNoFurtherCallsReasonUrl);
  }
  getReasonsOfNotCallAnswered(){
    return this.http.get(environment.getReasonsOfNotCallAnsweredUrl);
  }
  getTypeOfComplaints(){
    return this.http.get(environment.getTypeOfComplaintsUrl);
  }

  getLanguageMaster(){
    return this.http.get(environment.getLanguageMasterUrl );
  }

  getLanguageMasterByUserId(userId: any){
    return this.http.get(environment.getLanguageMasterByUserIdUrl + userId);
  }

  getHrpReasons(){
    return this.http.get(environment.getHrpReasonMasterUrl);
  }

  getHniReasons(){
    return this.http.get(environment.getHrniReasonMasterUrl);
  }

  getContentialAnomaliesReasons(){
    return this.http.get(environment.getCongentialAnomaliesMasterUrl);
  }

  getStateMaster(countryId:any) {
    return this.http.get(environment.getStatesMasterUrl + "/" + countryId);
  }

  getDistrictMaster(stateId:any) {
    return this.http.get(environment.getDistrictMasterUrl + "/" + stateId);
  }

  getBlockMaster(districtId:any) {
    return this.http.get(environment.getBlockMasterUrl + "/" + districtId);
  }

  getVillageMaster(blockId:any) {
    return this.http.get(environment.getVillageMasterUrl + "/" + blockId);
  }

  getGenderMaster() {
    return this.http.get(environment.getGenderMasterUrl);
  }

  getAgentMasterByRoleIdAndLanguage(roleId : any,language : any){
      return this.http.get(environment.getAgentMasterByRoleIdAndLanguageUrl + "/" + roleId + "/" + language);
  }

}
