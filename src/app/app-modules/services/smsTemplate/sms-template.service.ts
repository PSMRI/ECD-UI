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
import { HttpInterceptorService } from '../http-inteceptor/http-interceptor.service';
@Injectable({
  providedIn: 'root'
})
export class SmsTemplateService {

  constructor(
    private httpIntercept: HttpInterceptorService,
    private http: HttpClient,
  ) { }

  getSMStemplates(providerServiceMapID: any, smsTypeID?: any) {
    return this.http.post(environment.getSMStemplates_url,
        {
            'providerServiceMapID': providerServiceMapID,
            'smsTemplateTypeID': smsTypeID ? smsTypeID : undefined
        })

}

getSMSTemplates(providerServiceMapID: any) {
  return this.http.post(environment.getSMStemplates_url,
    {
    'providerServiceMapID': providerServiceMapID,
  })

}

  getSMStypes(serviceID:any) {
      return this.http.post(environment.getSMStypes_url,
          { 'serviceID': serviceID })
         
  }
  sendSMS(obj:any) {
    return this.http.post(environment.sendSMS_url, obj)
  }

  getSMSTypes() {
    return this.http.get(environment.getSMSTypesURL)
  }

  getSMSParameters() {
    return this.http.get(environment.getSMSValuesURL)
  }

  getSMSparameters(serviceID: any) {
  return this.http.post(environment.getSMSparameters_url,
      { 'serviceID': serviceID })
      // .map(this.handleSuccess)
      // .catch(this.handleError);
  }

  saveSMStemplate(obj: any) {
      return this.http.post(environment.saveSMStemplate_url, obj)
          // .map(this.handleSuccess)
          // .catch(this.handleError);
  }

  updateSMStemplate(obj: any) {
      return this.http.post(environment.updateSMStemplate_url, obj)
          // .map(this.handleSuccess)
          // .catch(this.handleError);
  }

  getFullSMSTemplate(providerServiceMapID: any, smsTemplateID: any) {
      return this.http.post(environment.getFullSMSTemplate_url,
          {
              'providerServiceMapID': providerServiceMapID,
              'smsTemplateID': smsTemplateID
          })
          // .map(this.handleSuccess)
          // .catch(this.handleError);
  }

// handleSuccess(response: Response) {
//   if (response.json().data) {
//       return response.json().data;
//   } else {
//       return Observable.throw(response.json());
//   }
// }

// private handleError(error: Response | any) {
//   return Observable.throw(error.json());
// };

}
