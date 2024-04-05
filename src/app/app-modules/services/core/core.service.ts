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

@Injectable({
  providedIn: 'root'
})
export class CoreService {


  roleChange: any="";
  roleChanged = new BehaviorSubject(this.roleChange);
  roleChanged$ = this.roleChanged.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  onRoleChange(value:any) {
    this.roleChange = value;
    this.roleChanged.next(this.roleChange);
  }

  getAlertsNotifications(reqObj: any){
    return this.http.post(environment.getAlertsAndNotificatonsUrl, reqObj);
  }

  getAgentAuditScore(userId: any,psmId: any){
    return this.http.get(environment.getAgentAuditScoreUrl + "/" + userId + "/" + psmId);
  }

  deleteAlertNotificationLocMessages(reqObj: any){
    return this.http.post(environment.deleteAlertNotifLocMsgsUrl, reqObj);
  }

  markNotificationsAsRead(reqObj: any){
    return this.http.post(environment.changeNotificationStatusUrl, reqObj);
  }
}
