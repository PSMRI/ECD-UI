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
import { ComponentFactoryResolver, ComponentRef, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssociateAnmMoService {
  private container: any;
  private componentRef!: ComponentRef<any>;

  selectedBenDetails: any;
  isMother = false;
  callDetailId: any = null;
  isStartAutoPreviewDial = false;
  isHighRiskPregnancy = false;
  isHighRiskInfant = false;
  autoDialing = false;

  callWrapup: any = "";
  callWrapupFlag = new BehaviorSubject(this.callWrapup);
  callWrapupFlag$ = this.callWrapupFlag.asObservable();

  resetCallClosure: any = "";
  callClosureFlag = new BehaviorSubject(this.resetCallClosure);
  callClosureFlag$ = this.callClosureFlag.asObservable();

  openComp: any = "";
  openCompFlag = new BehaviorSubject(this.openComp);
  openCompFlag$ = this.openCompFlag.asObservable();
  fromComponent: any = null;

  loadDetailsInReg: any = "";
  loadDetailsInRegFlag = new BehaviorSubject(this.loadDetailsInReg);
  loadDetailsInRegFlag$ = this.loadDetailsInRegFlag.asObservable();

  isMotherRecord: any = "";
  isMotherRecordData = new BehaviorSubject(this.isMotherRecord);
  isMotherRecordData$ = this.isMotherRecordData.asObservable();

  loadEcdQuestionnaire: any = "";
  loadEcdQuestionnaireData = new BehaviorSubject(this.loadEcdQuestionnaire);
  loadEcdQuestionnaireData$ = this.loadEcdQuestionnaireData.asObservable();

  isBenCallHistory: any = "";
  isBenCallHistoryData = new BehaviorSubject(this.isBenCallHistory);
  isBenCallHistoryData$ = this.isBenCallHistoryData.asObservable();

  isBenRegistartion: any = "";
  isBenRegistartionData = new BehaviorSubject(this.isBenRegistartion);
  isBenRegistartionData$ = this.isBenRegistartionData.asObservable();

  resetAgentStatus: any = "";
  resetAgentStatusFlag = new BehaviorSubject(this.resetAgentStatus);
  resetAgentStatusFlag$ = this.resetAgentStatusFlag.asObservable();

  stopTimer: any = "";
  stopTimerFlag = new BehaviorSubject(this.stopTimer);
  stopTimerFlag$ = this.stopTimerFlag.asObservable();

  agentCurrentStatus: any = "";
  agentCurrentStatusData = new BehaviorSubject(this.agentCurrentStatus);
  agentCurrentStatusData$ = this.agentCurrentStatusData.asObservable();


  constructor(private http: HttpClient, private resolver: ComponentFactoryResolver) { }


  loadComponent(component: any, data: any) {
    this.container.clear();
    const factory = this.resolver.resolveComponentFactory(component);
    this.componentRef = factory.create(this.container.injector);
    this.componentRef.instance.data = data;
    this.container.insert(this.componentRef.hostView);
  }
  setContainer(container: any) {
    this.container = container;
  }
  callClosure(reqObj: any) {
    return this.http.post(environment.updateCallClosureUrl, reqObj);
  }

  commonCallClosure(reqObj: any) {
    return this.http.post(environment.updateCommonCallClosureUrl, reqObj);
  }
  getCallTypes(reqObj: any) {
    return this.http.post(environment.getCallTypesUrl, reqObj);

  }

  saveBenCallDetails(reqObj: any) {
    return this.http.post(environment.saveBenCallDetails, reqObj);
  }
  getAutoPreviewDialing(userId: any, roleId: any, psmId: any) {
    return this.http.get(environment.getAgentAutoPreviewDialingUrl + "/" + userId + "/" + roleId + "/" + psmId);
  }

  setCloseCallOnWrapup() {
    this.callWrapup = 1;
    this.callWrapupFlag.next(1);
  }

  resetCloseCallOnWrapup() {
    this.callWrapup = 0;
    this.callWrapupFlag.next(0);
  }

  setCallClosure() {
    this.resetCallClosure = 1;
    this.callClosureFlag.next(1);
  }

  clearCallClosure() {
    this.resetCallClosure = 0;
    this.callClosureFlag.next(0);
  }

  getAgentMasterData() {
    return this.http.get(environment.getAgentMasterDataUrl);
  }

  fetchBeneficiaryQuestionnaire(reqObj: any, callType: any, role: any) {
    return this.http.get(environment.getBeneficiaryQuestionnaire + reqObj + '/' + callType + '/' + role);
  }

  saveQuestionnaireResponse(reqObj: any) {
    return this.http.post(environment.saveBenQuestionnaireResponseUrl, reqObj);
  }

  getHRPDetails(reqObj: any) {
    return this.http.get(environment.getBenHrpHrniDetailsUrl + "motherId=" + reqObj.motherId);
  }

  getHRNIDetails(reqObj: any) {
    return this.http.get(environment.getBenHrpHrniDetailsUrl + "childId=" + reqObj.childId);
  }

  registerBeneficiary(reqObj: any) {
    return this.http.post(environment.registerBeneficiaryUrl, reqObj);
  }

  updateBeneficiary(reqObj: any) {
    return this.http.post(environment.updateBeneficiaryUrl, reqObj);
  }
  setLoadDetailsInReg(value: any) {
    this.loadDetailsInReg = value;
    this.loadDetailsInRegFlag.next(this.loadDetailsInReg);
  }

  resetLoadDetailsInReg() {
    this.loadDetailsInReg = null;
    this.loadDetailsInRegFlag.next(this.loadDetailsInReg);
  }


  setOpenComp(value: any) {
    this.openComp = value;
    this.openCompFlag.next(this.openComp);
  }

  resetOpenComp() {
    this.openComp = null;
    this.openCompFlag.next(this.openComp);
  }

  setBenHistoryComp(value: any) {
    this.isBenCallHistory = value;
    this.isBenCallHistoryData.next(this.isBenCallHistory);
  }

  resetBenHistoryComp() {
    this.isBenCallHistory = null;
    this.isBenCallHistoryData.next(this.isBenCallHistory);
  }

  setBenRegistartionComp(value: any) {
    this.isBenRegistartion = value;
    this.isBenRegistartionData.next(this.isBenRegistartion);
  }

  resetBenRegistartionComp() {
    this.isBenRegistartion = null;
    this.isBenRegistartionData.next(this.isBenRegistartion);
  }

  getMotherRecord(reqObj: any) {
    return this.http.get(environment.getMotherOutboundWorkListUrl + '/' + reqObj.userId);
  }
  getChildRecord(reqObj: any) {
    return this.http.get(environment.getChildOutboundWorkListUrl + '/' + reqObj.userId);
  }


  onClickOfOutboundWorklistScreen(value: any) {
    this.isMotherRecord = value;
    this.isMotherRecordData.next(this.isMotherRecord);
  }

  onClickOfEcdQuestionnaire(value: any) {
    this.loadEcdQuestionnaire = value;
    this.loadEcdQuestionnaireData.next(this.loadEcdQuestionnaire);
  }

  getBeneficiaryCallHistory(reqObj: any) {
    return this.http.get(environment.getBeneficiaryCallHistoryUrl, { params: reqObj });
  }
  getCallHistoryDetails(reqObj: any) {
    return this.http.get(environment.getCallHistoryDetailsUrl + '/' + reqObj);
  }

  setResetAgentStatus(value: any) {
    this.resetAgentStatus = value;
    this.resetAgentStatusFlag.next(this.resetAgentStatus);
  }

  setStopTimer(value: any) {
    this.stopTimer = value;
    this.stopTimerFlag.next(this.stopTimer);
  }

  clearStopTimer() {
    this.stopTimer = null;
    this.stopTimerFlag.next(this.stopTimer);
  }

  setAgentState(value: any) {
    this.agentCurrentStatus = value;
    this.agentCurrentStatusData.next(this.agentCurrentStatus);
  }
  resetAgentState() {
    this.agentCurrentStatus = null;
    this.agentCurrentStatus.next(this.agentCurrentStatus);
  }

  generateLink() {
    return this.http.post(environment.generateVideoLinkURL, {});
  }

  saveVideoCall(reqObj: any) {
    return this.http.post(environment.sendSMSAPI, reqObj);
  }

  updateCallStatus(reqObj: any) {
    return this.http.post(environment.updateCallStatusAPI, reqObj);
  }
}