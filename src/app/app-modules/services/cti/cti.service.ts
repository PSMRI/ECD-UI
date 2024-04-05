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
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CtiService {

  wrapupTime: any = 120;
  ctiUrl: any = environment.ctiUrl;
  eventCtiUrl: any = environment.ctiEventUrl;

  constructor(private http: HttpClient) { }



  getCallStatistics(agentId:any){
    const reqObj = {
      "agent_id": agentId
    };
    return this.http.post(environment.getCallStatistics,reqObj)
  }

  getCallAnsweredCount(reqObj:any){
   
    return this.http.get(environment.getCallAnsweredVerifiedCount + "/" + reqObj)
  }



  getCTILoginToken(uname:any, password:any) {

    const reqObj = { 'username': uname, 'password': password };
    return this.http.post(environment.getLoginKeyUrl, reqObj);
}

getAgentState(reqObj: any) {

  return this.http.post(environment.getAgentState, reqObj);

}

getAgentIpAddress(reqObj: any) {
  return this.http.post(environment.getAgentIpAddressUrl, reqObj);
}

getRoleBasedWrapuptime(roleId: any) {
  return this.http.get(environment.getWrapupTimeUrl + "/" + roleId);
}

callBeneficiaryManual(agentId: any, phoneNo: any) {
  const reqObj = { 'agent_id': agentId, 'phone_num': phoneNo };
  return this.http.post(environment.callBeneficiaryManualUrl, reqObj);
}

disconnectCall(agentId:any) {
  const reqObj = {
    'agent_id': agentId
  }
  return this.http.post(environment.getDisconnectCallUrl,reqObj);
}

agentCtiLogout(reqObj: any) {
  return this.http.post(environment.agentCtiLogOutUrl, reqObj);
}

}
