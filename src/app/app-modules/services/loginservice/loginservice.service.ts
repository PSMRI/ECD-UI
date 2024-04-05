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


import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * DE40034072 - 12-01-2022
 */

@Injectable({
  providedIn: 'root',
})
export class LoginserviceService {
  currentServiceId: any;
  userLoginData: any;
  agentId: any;
  serviceProviderId: any;
  campaignName: any;
  apiManClientKey: any;
  ipAddress: any;
  userPrivileges: any;
  userId: any;
  userName: any;
  transactionId: any;
  loginKey: any;

enableRole = false;
enableRoleFlag = new BehaviorSubject(this.enableRole);
enableRoleFlag$ = this.enableRoleFlag.asObservable();

  constructor(private http: HttpClient) {}

  setEnableRole() {
    this.enableRole = true;
    this.enableRoleFlag.next(this.enableRole);
  }
  
  resetEnableRole()
  {
    this.enableRole = false;
    this.enableRoleFlag.next(this.enableRole);
  }
  

  getLogin(reqObj: any) {
    return this.http.post(environment.getLoginURL, reqObj);
  }

  getLanguages(){
    return this.http.get(environment.getLanguageList);
  }
  getData() {
    return this.http.get(environment.getSecurityQuestionURL);
  }
  validateLogin(reqObj: any) {
    return this.http.post(environment.getLoginURL, reqObj);
  }

  userLogoutPreviousSession(userName: any) {
    return this.http.post(environment.userLogoutPreviousSessionUrl, {
      userName: userName,
    });
  }
  updatePassword(reqObj: any) {
    return this.http.post(environment.setForgotPasswordURL, reqObj);
  }
  saveSecurityQuesAns(reqObj: any){
    return this.http.post(environment.saveUserQuestionAns, reqObj)
  }

  validateUserName(reqObj: any) {
    return this.http.post(environment.forgotPasswordURL, reqObj);
  }

  validateAnswers(reqObj: any) {
    return this.http.post(environment.validateSecQuesAnsURL, reqObj);
  }

  validateSessionKey() {
    return this.http.post(environment.getSessionExistsURL, {});
  }

  sessionLogout() {
    return this.http.post(environment.logoutUrl, '');
  }

  licenseUrl() {
    return this.http.get(environment.licenseUrl);
  }

  postFormData(requestData:any){
    return this.http.get(environment.getDataUploadURL,requestData)
  }
 

  getAlertsNotifLocMessagesCount(reqObj: any){
    return this.http.post(environment.getAlertsAndNotificatonsCountUrl, reqObj)
  }
  
  uploadTemplate(reqObj:any){
  return this.http.get(environment.getUploadTemplateURL,reqObj)
  }
 
}
