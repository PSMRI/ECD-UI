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


import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { environment } from 'src/environments/environment';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

@Component({
  selector: 'app-force-logout',
  templateUrl: './force-logout.component.html',
  styleUrls: ['./force-logout.component.css']
})
export class ForceLogoutComponent implements OnInit {
  currentLanguageSet: any;
  languageData: any;

  constructor(readonly sessionstorage:SessionStorageService,private setLanguageService: SetLanguageService,private fb: FormBuilder,private supervisorService: SupervisorService,private confirmationService: ConfirmationService, private trackingService: AmritTrackingService) { }

  kickoutForm = this.fb.group({
    userName: ['',Validators.required]
  });

  ngOnInit(): void {
    this.setLanguageService
      .getLanguageData(environment.language)
      .subscribe((data) => {
        this.languageData = data;
        this.currentLanguageSet = data;
      });
  }

  kickoutUsername(){
   const reqObj = {
    providerServiceMapID: this.sessionstorage.getItem('providerServiceMapID'),
    userName : this.kickoutForm.controls.userName.value,
   }
   this.supervisorService.getUserLogout(reqObj).subscribe((res:any)=>{
    console.log(res,'success post force logout');
    if(res.statusCode === 200){
    this.confirmationService.openDialog(this.currentLanguageSet.userLoggedOutSuccessfully, 'success');
    this.kickoutForm.reset();
  }
    else{
      this.confirmationService.openDialog(res.errorMessage, 'error')
    }

   })
  }

  trackFieldInteraction(fieldName: string) {
    this.trackingService.trackFieldInteraction(fieldName, 'Force Logout');
  }
}
