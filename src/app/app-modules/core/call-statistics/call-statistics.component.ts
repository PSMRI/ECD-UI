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


import { Component, DoCheck, OnInit } from '@angular/core';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { CtiService } from '../../services/cti/cti.service';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
/**
 * DE40034072
 * 02-03-2023
 */
@Component({
  selector: 'app-call-statistics',
  templateUrl: './call-statistics.component.html',
  styleUrls: ['./call-statistics.component.css'],
})
export class CallStatisticsComponent implements OnInit, DoCheck {
  today: number = Date.now();
  currentLanguageSet: any;
  statisticsData:any;
  totalCallsAnswered: any;
  totalCallsVerified: any;

  constructor(private setLanguageService: SetLanguageService,
    private loginService: LoginserviceService,
    private ctiService: CtiService,  private confirmationService: ConfirmationService,) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getCallStatistics();
    this.getCallAnsweredVerifiedCount();
  
  }

  ngDoCheck() {
    this.getSelectedLanguage();
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  getCallStatistics() {


 
    const agentId = this.loginService.agentId;
    

    this.ctiService
      .getCallStatistics(agentId)
      .subscribe(
        (response: any) => {
          if (response && response.statusCode === 200 && response.data) {
            this.statisticsData = response.data;
          
          } else {
            this.confirmationService.openDialog(response.errorMessage, 'error');
          }
        },
        (err: any) => {
          if(err && err.error)
          this.confirmationService.openDialog(err.error, 'error');
          else
          this.confirmationService.openDialog(err.title + err.detail, 'error')
          });
    
    
  }

  getCallAnsweredVerifiedCount() {


    const reqObj = this.loginService.agentId;

    this.ctiService
      .getCallAnsweredCount(reqObj)
      .subscribe(
        (response: any) => {
          if (response) {
            this.totalCallsAnswered = response.totalCallsAnswered;
            this.totalCallsVerified = response.totalCallsVerified;
          
          } else {
            this.confirmationService.openDialog(response.errorMessage, 'error');
          }
        },
        (err: any) => {
          if(err && err.error)
          this.confirmationService.openDialog(err.error, 'error');
          else
          this.confirmationService.openDialog(err.title + err.detail, 'error')
          });
    
    
  }



}



