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


import { Component, DoCheck, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { LocationMessagesComponent } from '../location-messages/location-messages.component';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import * as moment from 'moment';

@Component({
  selector: 'app-create-location-message',
  templateUrl: './create-location-message.component.html',
  styleUrls: ['./create-location-message.component.css']
})
export class CreateLocationMessageComponent implements OnInit, DoCheck {

  // offices = ['Outbound Helpline', 'Test Assam'];
  offices : any = [];
  selectedType: any;
  searchTerm : any;
  dataSource = new MatTableDataSource();
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  currentLanguageSet : any;
  time = new Date();
  minDate = new Date();
  dateFilter = (date: Date) => date.getTime() >= this.minDate.getTime();
  roleID: any;
  uname: any;
  workLocationId: any = [];
  notificationTypes: any;
  communicationTypeId : any;
  range = new FormGroup({
    start: new FormControl('', [Validators.required]),
    end: new FormControl('', [Validators.required])
  });


  Stime = '';
  Etime = '';
  constructor(private fb: FormBuilder,private setLanguageService: SetLanguageService,private supervisorService: SupervisorService,private confirmationService: ConfirmationService,private masterService: MasterService) { }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getOfficesForAlert();
    this.getNotificationType();
    this.uname = sessionStorage.getItem("userName");
  }
   
    createLocationForm = this.fb.group({
    officeType: ['', Validators.required],
    subject: ['', Validators.required],
    message: ['', Validators.required],
    startTime:[''],
    endTime:['']

  })
  

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

   getOfficesForAlert(){
    const providerServiceMapId = sessionStorage.getItem('providerServiceMapID');
    this.masterService.getOfficeMasterData(providerServiceMapId).subscribe((res:any)=>{
      if(res !== undefined && res.data !== undefined){
        this.offices = res.data;
      }
    })
   }
   
   invalidTimeFlag = false;
   validateTime(start_date: any, end_date: any, start_time: any, end_time: any) {
    // if (start_time === undefined && end_time === undefined && start_time ==="" && end_time ==="") {
    // }
    if (start_time !== undefined && start_time !== "" && end_time !== undefined && end_time !== "" && start_date.getDate() !== undefined && start_date.getDate() !== "" && end_date.getDate() !== undefined && end_date.getDate() !== ""
    ) {
      if (
        start_date.getDate() === end_date.getDate() &&
        start_time > end_time
      ) {
        this.invalidTimeFlag = true;
      }
      if (
        start_date.getDate() === end_date.getDate() &&
        start_time < end_time
      ) {
        this.invalidTimeFlag = false;
      }
      if (
        start_date.getDate() === end_date.getDate() &&
        start_time === end_time
      ) {
        this.invalidTimeFlag = true;
      }
      if (start_date.getDate() !== end_date.getDate()) {
        this.invalidTimeFlag = false;
      }
    }
  }

   saveLocationMessageForm(){
     const requestObj = [];
    //  let form_values: any;
     const form_values: any = this.createLocationForm.value;
     let startDate: Date | undefined;
     if (this.range.controls.start.value) {
      startDate = new Date(this.range.controls.start.value);
     }

     let endDate: Date | undefined;
     if (this.range.controls.end.value) {
      endDate = new Date(this.range.controls.end.value);
     }

     // Provide a default value for startDate if it's undefined
      if (!startDate) {
        startDate = new Date();
      }

      if (!endDate) {
        endDate = new Date();
      }

    if (startDate) {
      if (form_values.startTime) {
        startDate.setHours(form_values.startTime.split(":")[0]);
        startDate.setMinutes(form_values.startTime.split(":")[1]);
      } else {
        startDate.setHours(0);
        startDate.setMinutes(0);
      }
      startDate.setSeconds(0);
      startDate.setMilliseconds(0);
    }

    if (endDate) {
      if (form_values.endTime) {
        endDate.setHours(form_values.endTime.split(":")[0]);
        endDate.setMinutes(form_values.endTime.split(":")[1]);
        endDate.setSeconds(0);
      } else {
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
      }
      endDate.setMilliseconds(0);
    }

    const reqObj = {
      createdBy: this.uname,
      notification: this.createLocationForm.controls.subject.value,
      notificationDesc: this.createLocationForm.controls.message.value,
      notificationTypeID : this.communicationTypeId,
      providerServiceMapID: sessionStorage.getItem('providerServiceMapID'),
      workingLocationID : this.createLocationForm.controls.officeType.value,
      validFrom: new Date(
        startDate.valueOf() - 1 * startDate.getTimezoneOffset() * 60 * 1000
      ),
      validTill: new Date(
        endDate.valueOf() - 1 * endDate.getTimezoneOffset() * 60 * 1000
      ),
    }
    requestObj.push(reqObj);
  
    console.log('reqObj',requestObj);
   this.supervisorService.saveCreateAlert(requestObj).subscribe((res:any)=>{
    if(res.statusCode === 200){
      if(res.data !== undefined && res.data !== null){
      this.confirmationService.openDialog(this.currentLanguageSet.createdLocationMessageSuccessfully, 'success');
      this.createLocationForm.reset();
      this.range.reset();
      // this.showTable();
      }
    }
    else{
      this.confirmationService.openDialog(res.errorMessage, 'error')
    }
   })
   }

  showTable() {
    this.confirmationService
    .openDialog(
      this.currentLanguageSet.doYouReallyWantToCancelUnsavedData,
      'confirm'
    )
    .afterClosed() 
    .subscribe((res) => {
      if (res) {
        this.createLocationForm.reset();
        this.range.reset();
        this.supervisorService.createComponent(LocationMessagesComponent,null);
      }
    });
  }
  getNotificationType(){
    const reqObj = {
      providerServiceMapID : sessionStorage.getItem('providerServiceMapID')
  } 
    this.supervisorService.getNotificationType(reqObj).subscribe((res:any)=>{
      if(res.statusCode === 200){
       this.notificationTypes = res.data;
       this.notificationTypes.filter((value:any)=>{
        if(value.notificationType.toLowerCase() === "location message"){
          this.communicationTypeId = value.notificationTypeID
        }
       })
      }
    })
  }


  ngDoCheck() {
    this.getSelectedLanguage();
  }

}

