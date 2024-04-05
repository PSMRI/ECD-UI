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
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QualitySupervisorService {
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

  createSectionConfiguration(reqObj: any) {
    return this.http.post(environment.createSectionConfigurationUrl, reqObj);
  }

  updateSectionConfiguration(reqObj: any) {
    return this.http.put(environment.updateSectionConfigurationUrl, reqObj);
  }
  updateAgentQualityConfiguration(reqObj: any) {
    return this.http.put(environment.updateQualityAuditorAgentUrl, reqObj);
  }
  getCentreOverallQualityRatingsData(frequency: any, psmId: any, month: any) {
    return this.http.get(
      environment.getCentreOverallQualityRatingUrl +
        psmId +
        '/' +
        frequency +
        '/' +
        month
    );
  }

  getSkillSetQualityRatingsData(psmId: any, role: any, month: any) {
    return this.http.get(
      environment.getSkillSetQualityRatingUrl +
      psmId +
        '/' +
        role +
        '/' +
        month
    );
  }

  getTenureWiseQualityRatingsData(psmId: any, roleName: any) {
    return this.http.get(
      environment.getTenureWiseQualityRatingUrl + psmId + '/' + roleName
    );
  }

  getNumberOfAgentScoreData(psmId: any, frequency: any, month: any) {
    return this.http.get(environment.getNumberOfAgentScoreUrl + psmId + '/' + frequency + '/' + month);
  }

  getCustomerSatisfactionData(frequency:any,psmId: any) {
    return this.http.get(environment.getCustomerSatisfactionUrl + '/' + frequency  + '/' + psmId);
  }
  saveQualityAuditorAgent(reqObj: any) {
    return this.http.post(environment.saveQualityAuditorAgentUrl, reqObj);
  }
  getAgentMappedData(reqObj: any) {
    return this.http.get(environment.getAgentMappedDataUrl + '/' + reqObj);
  }

  getAuditSectionMap(reqObj:any){
    return this.http.get(environment.getAuditSectionMapUrl + '/' + reqObj);
  }

  saveGrades(reqObj:any){
    return this.http.post(environment.saveGradesUrl, reqObj);
  }
  updateGradeConfiguration(reqObj:any){
  return this.http.put(environment.updateGradeConfigurationUrl , reqObj);
}
getGradesMappedData(reqObj:any){
  return this.http.get(environment.getMappedGradeURL + '/' + reqObj.providerServiceMapID);
}
qualityReportDownload(reqObj:any){
  return this.http.get(environment.qualitySupervisorReportURL,reqObj);
}
saveSampleList(reqObj:any){
  return this.http.post(environment.saveSampleUrl, reqObj);
}
getCycleMappedData(reqObj:any){
  return this.http.get(environment.getMappedCycleURL + '/' + reqObj.providerServiceMapID);
}
updateCycleConfiguration(reqObj:any){
  return this.http.put(environment.updateCycleConfigurationURL,reqObj);
}
getListOfMapQuestionaireConfiguration(reqObj:any){
  return this.http.get(environment.getListOfMapQuestionaireConfigurationUrl+ '/' + reqObj);
}

  getQuestionnaireData(psmId: any) {
    return this.http.get(environment.getQuestionnaireDataUrl + '/' + psmId);
  }

  updateQuestionConfiguration(reqObj: any) {
    return this.http.put(environment.updateQuestionConfigurationUrl, reqObj);
  }

  saveQuestionConfiguration(reqObj: any) {
    return this.http.post(environment.saveQuestionConfigurationUrl, reqObj);
  }
}