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
import {
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
} from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupervisorService {
  private container: any;
  private componentRef!: ComponentRef<any>;
  constructor(
    private http: HttpClient,
    private resolver: ComponentFactoryResolver
  ) {}

  createComponent(component: any, data: any) {
   
    this.container.clear();
    const factory = this.resolver.resolveComponentFactory(component);
    this.componentRef = factory.create(this.container.injector);
    this.componentRef.instance.data = data;
    this.container.insert(this.componentRef.hostView);
  }

  setContainer(container: any) {
    this.container = container;
  }

  getCallConfigurations(reqObj: any) {
    return this.http.get(environment.getCallConfigsUrl + reqObj);
  }

  getUnallocatedCalls(psmId: any, phoneNoType: any, recordType: any, fDate: any, tDate: any) {
    return this.http.get(environment.getUnallocatedCallsUrl + '/' + psmId + '/' + phoneNoType + '/' + recordType + '/' + fDate + '/' + tDate);
  }

  saveAllocateCalls(reqObj: any) {
    return this.http.post(environment.getAllocateCallsUrl, reqObj);
  }

  deleteReallocatedCalls(reqObj: any) { 
    return this.http.put(environment.deleteReallocationUrl, reqObj);
  }

  getAllocatedCounts(reqObj: any) {
    return this.http.post(environment.getAllocatedCountUrl, reqObj);
  }

  updateReallocateCalls(reqObj: any) {
    return this.http.post(environment.updateRealloateCallsUrl, reqObj);
  }

  saveQuestionnaire(reqObj: any) {
    return this.http.post(environment.saveQuestionnaireUrl, reqObj);
  }

  getQuestionnaires(psmId: any) {
    return this.http.get(environment.getQuestionnaireUrl + "/" + psmId);
  }
  getQuestionnairesForMapping(psmId: any) {
    return this.http.get(environment.getQuestionnairesForMappingURL + "/" + psmId);
  }

  updateQuestionnaire(reqObj: any) {
    return this.http.post(environment.updateQuestionnaireUrl, reqObj);
  }
  createCallConfiguration(reqObj: any) {
    return this.http.post(environment.createCallConfigurationUrl, reqObj);
  }

  updateCallConfiguration(reqObj: any, configId: any) {
    return this.http.put(environment.updateCallConfigurationUrl, reqObj);
  }


  getSectionConfigurations(reqObj: any) {
    return this.http.get(environment.getSectionConfigurationsUrl + reqObj);
  }
  getAlertsData(reqObj:any){
    return this.http.post(environment.getAlertsNotificationUrl, reqObj);
  }
  getNotificationType(reqObj:any){
    return this.http.post(environment.getNotificationTypeUrl, reqObj);
  }

  createSectionConfiguration(reqObj: any) {
    return this.http.post(environment.createSuprSectionConfigurationUrl, reqObj);
  }

  updateSectionConfiguration(reqObj: any) {
    return this.http.put(environment.updateSuprSectionConfigurationUrl, reqObj);
  }

  deleteSectionConfiguration(reqObj: any) {
    return this.http.post(environment.deleteSectionConfigurationUrl, reqObj);
  }
  getRoles(psmId:any) {
    return this.http.get(environment.getRolesURL + '/' + psmId);
  }
  getRole() {
    return this.http.get(environment.getRolesURL);
  }
  getAgentsData(roleId: any) {
    return this.http.get(environment.getAgentsDataUrl + '/' + roleId);
  }
  getAutoPreviewDialByUserIdAndRoleIdAndPsmId(userId: any, roleId: any, psmId: any) {
    return this.http.get(environment.getAgentsDataUrl + '/' + userId + '/' + roleId + '/' + psmId);
  }
  getOffices(psmId:any) {
    return this.http.get(environment.getOfficesFromRoleURL + '/' + psmId);
  }

  saveCreateAlert(reqObj: any) {
    return this.http.post(environment.createNotificationURL, reqObj);
  }
  saveCreateNotification(reqObj: any) {
    return this.http.post(environment.createNotificationURL, reqObj);
  }

  saveEditAlert(reqObj: any) {
    return this.http.post(environment.updateNotificationURL, reqObj);
  }
  saveEditNotification(reqObj: any) {
    return this.http.post(environment.updateNotificationURL, reqObj);
  }
  saveLocationMessages(reqObj: any) {
    return this.http.post(environment.createNotificationURL, reqObj);
  }
  EditLocationMessages(reqObj: any) {
    return this.http.post(environment.updateNotificationURL, reqObj);
  }

  saveQuestionnaireSectionMapping(reqObj: any) {
    return this.http.post(
      environment.saveQuestionnaireSectionMappingUrl,
      reqObj
    );
  }

  updateQuestionnaireSectionMapping(reqObj: any) {
    return this.http.put(
      environment.updateQuestionnaireSectionMappingUrl,
      reqObj
    );
  }

  getSectionQuestionnaireMap(reqObj: any) {
    return this.http.get(
      environment.getSectionQuestionnaireMapUrl + '/' + reqObj
    );
  }

  getUnMappedQuestionnaires(psmId: any, sectionId : any) {
    return this.http.get(
      environment.getUnMappedQuestionnairesUrl + '/' + psmId + '/' + sectionId);
  }
  createCallSectionMapping(reqObj: any) {
    return this.http.post(environment.createCallSectionMappingUrl, reqObj);
  }

  getMappedSections(psmId: any, callConfigId: any) {
    return this.http.get(environment.getMappedSectionsUrl + psmId + '/' + callConfigId);
  }

  getAlertOnSearch(reqObj:any){
    return this.http.post(environment.getSupervisorNotificationsURL, reqObj)
  }
  getNotificationOnSearch(reqObj:any){
    return this.http.post(environment.getSupervisorNotificationsURL, reqObj)
  }
  getLocationOnSearch(reqObj:any){
    return this.http.post(environment.getSupervisorNotificationsURL, reqObj)
  }

  getUserLogout(reqObj:any){
    return this.http.post(environment.forceUserLogoutURL, reqObj)
  }

  publishAlert(reqObj:any){
    return this.http.post(environment.publishAlertURL, reqObj)
  }

  publishNotification(reqObj:any){
    return this.http.post(environment.publishNotificationURL, reqObj)
  }

  publishLocationMessages(reqObj:any){
    return this.http.post(environment.publishLocationMessagesURL, reqObj)
  }

  saveDialPreference(reqObj: any) {
    return this.http.post(environment.dialPreferenceURL, reqObj);
  }

  fetchDialPreference(psmId: any) {
    return this.http.get(environment.fetchDialPreferenceUrl + '/' + psmId); 
  }
  postFormData(requestData:any){
    return this.http.post(environment.getDataUploadURL,requestData)
  }
  postTemplateData(reqData:any){
    return this.http.post(environment.getUploadTemplateURL,reqData)
  }

  getDownloadData(reqObj:any){
    return this.http.get(environment.getDownloadTemplateURL + '/' + reqObj.providerServiceMapID + '/' + reqObj.fileTypeID );
  }
  downloadCumulativeReport(reqData:any){
    return this.http.post(environment.downloadCumulativeReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadCallDetailReport(reqData:any){
    // return this.http.post(environment.downloadCallDetailReportURL,reqData)
    return this.http.post(environment.downloadCallDetailReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadCallSummaryReport(reqData:any){
    // return this.http.post(environment.downloadCallSummaryReportURL,reqData)
    return this.http.post(environment.downloadCallSummaryReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadBenificiaryWiseReport(reqData:any){
    // return this.http.post(environment.downloadBenificiaryWiseReportURL,reqData)
    return this.http.post(environment.downloadBenificiaryWiseReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadCallUniqueReport(reqData:any){
    // return this.http.post(environment.downloadCallUniqueReportURL,reqData)
    return this.http.post(environment.downloadCallUniqueReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadBirthDefectReport(reqData:any){
    // return this.http.post(environment.downloadBirthDefectReportURL,reqData)
    return this.http.post(environment.downloadBirthDefectReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadAshaHomeReport(reqData:any){
    // return this.http.post(environment.downloadAashaHomeReportURL,reqData)
    return this.http.post(environment.downloadAashaHomeReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
    
  }
  downloadCalciumIfaReport(reqData:any){
    // return this.http.post(environment.downloadCalciumIfaReportURL,reqData)
    return this.http.post(environment.downloadCalciumIfaReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadAbsenceVhsndReport(reqData:any){
    // return this.http.post(environment.downloadAbsenceVhsndReportURL,reqData)
    return this.http.post(environment.downloadAbsenceVhsndReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadVaccineDropoutReport(reqData:any){
    // return this.http.post(environment.downloadVaccineDropoutReportURL,reqData)
    return this.http.post(environment.downloadVaccineDropoutReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadVaccineLeftoutReport(reqData:any){
    // return this.http.post(environment.downloadVaccineLeftoutReportURL,reqData)
    return this.http.post(environment.downloadVaccineLeftoutReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadDevDelayReport(reqData:any){
    // return this.http.post(environment.downloadDevDelayReportURL,reqData)
    return this.http.post(environment.downloadDevDelayReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadAbortionReport(reqData:any){
    // return this.http.post(environment.downloadAbortionReportURL,reqData)
    return this.http.post(environment.downloadAbortionReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadDeliveryStatusReport(reqData:any){
    // return this.http.post(environment.downloadDeliveryStatusReportURL,reqData)
    return this.http.post(environment.downloadDeliveryStatusReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadHrpwCasesReport(reqData:any){
    // return this.http.post(environment.downloadHrpwCasesReportURL,reqData)
    return this.http.post(environment.downloadHrpwCasesReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadInfantHighRiskReport(reqData:any){
    // return this.http.post(environment.downloadInfantHighRiskReportURL,reqData)
    return this.http.post(environment.downloadInfantHighRiskReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadMaternalDeathReport(reqData:any){
    // return this.http.post(environment.downloadMaternalDeathReportURL,reqData)
    return this.http.post(environment.downloadMaternalDeathReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadStillBirthReport(reqData:any){
    // return this.http.post(environment.downloadStillBirthReportURL,reqData)
    return this.http.post(environment.downloadStillBirthReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadBabyDeathReport(reqData:any){
    // return this.http.post(environment.downloadBabyDeathReportURL,reqData)
    return this.http.post(environment.downloadBabyDeathReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadNotConnectedReport(reqData:any){
    // return this.http.post(environment.downloadNotConnectedReportURL,reqData)
    return this.http.post(environment.downloadNotConnectedReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadJsyReport(reqData:any){
    // return this.http.post(environment.downloadJsyReportURL,reqData)
    return this.http.post(environment.downloadJsyReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  downloadMiscarriageReport(reqData:any){
    // return this.http.post(environment.downloadMiscarriageReportURL,reqData)
    return this.http.post(environment.downloadMiscarriageReportURL,reqData,{
      responseType: 'blob',
      observe: 'response'
    }).pipe(map((res:any) => {
      return res;
    }));
  }
  createParentChildMapping(reqData:any){
    return this.http.post(environment.createParentChildMappingURL,reqData)
  }
  getMappedQuestions(reqObj:any){
    return this.http.get(environment.getMappedQuestionsURL + '/' + reqObj.providerServiceMapID);
  }
  updateParentChildMapping(reqData:any){
    return this.http.post(environment.updateParentChildMappingURL,reqData)
  }

  getLowRiskRecordsByLanguage(psmId: any, phoneNoType: any, recordType: any, fDate: any, tDate: any, language: any, role: any) {
    return this.http.get(environment.getLowRiskRecordsByLanguageUrl + '/' + psmId + '/' + phoneNoType + '/' + recordType + '/' + fDate + '/' + tDate + '/' + language + '/' + role);
  }
}
