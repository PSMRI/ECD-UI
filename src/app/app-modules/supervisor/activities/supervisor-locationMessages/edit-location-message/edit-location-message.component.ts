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


import { Component, DoCheck, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { LocationMessagesComponent } from '../location-messages/location-messages.component';
import * as moment from 'moment';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-edit-location-message',
  templateUrl: './edit-location-message.component.html',
  styleUrls: ['./edit-location-message.component.css']
})
export class EditLocationMessageComponent implements OnInit, DoCheck {
  offices = ['Outbound Helpline', 'Test Assam'];
  displayedColumns: string[]= ['sno','type','subject','description','validFrom','validTill','publish','action','edit'];
  selectedType: any;
  searchTerm : any;
  dataSource = new MatTableDataSource();
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @Input()
  public data: any;
  currentLanguageSet : any;
  time = new Date();
  roleID: any;
  uname: any;
  workLocationId: any = [];
  notificationTypes: any;
  communicationTypeId : any;
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  Stime = '';
  Etime = '';
  minDate = new Date();
  dateFilter = (date: Date) => date.getTime() >= this.minDate.getTime();

  constructor(
    private fb: FormBuilder,
    private setLanguageService: SetLanguageService,
    private supervisorService: SupervisorService,
    readonly sessionstorage:SessionStorageService,
    private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    let startDate = new Date(this.data.validFrom);
    startDate = new Date(startDate.getTime() + startDate.getTimezoneOffset() * 60000);

    let endDate = new Date(this.data.validTill);
    endDate = new Date(endDate.getTime() + endDate.getTimezoneOffset() * 60000);

    const startTime =
    this.data.validFrom.split("T")[1].split(":")[0] +
    ":" +
    this.data.validFrom.split("T")[1].split(":")[1];
    const endTime =
    this.data.validTill.split("T")[1].split(":")[0] +
    ":" +
    this.data.validTill.split("T")[1].split(":")[1];

    this.range.controls.start.setValue(startDate);
    this.range.controls.end.setValue(endDate);
    this.editLocationForm.controls.startTime.patchValue(startTime);
    this.editLocationForm.controls.endTime.patchValue(endTime); 
    this.editLocationForm.controls.subject.patchValue(this.data.notification);
    this.editLocationForm.controls.message.patchValue(this.data.notificationDesc);
    this.getSelectedLanguage();
    this.getNotificationType();
    this.uname = this.sessionstorage.getItem('userName');
  }

    editLocationForm = this.fb.group({
    subject: ['', Validators.required],
    message: ['', Validators.required],
    startTime: ['',Validators.required],
    endTime: ['',Validators.required],

  })

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

   getOfficesForAlert(){
    const reqObj = { 
      providerServiceMapId: this.sessionstorage.getItem('providerServiceMapID'),
      roleID: this.roleID
     }
    this.supervisorService.getOffices(reqObj).subscribe((res:any)=>{
      if(res.data !== undefined && res.data !== null &&  res.statusCode === 200 ){
        this.offices = res.data;
      }
    })
   }
   getNotificationType(){
    const reqObj = {
      providerServiceMapID : this.sessionstorage.getItem('providerServiceMapID')
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

   saveEditLocationForm(){
    //  let form_values: any;
     const form_values: any = this.editLocationForm.value;
     let startDate: any;
     if (this.range.controls.start.value) {
      startDate = new Date(this.range.controls.start.value);
     }
 
    let endDate: any;
     if (this.range.controls.end.value) {
      endDate = new Date(this.range.controls.end.value);
     }
 
    if (form_values.startTime) {
      startDate.setHours(form_values.startTime.split(":")[0]);
      startDate.setMinutes(form_values.startTime.split(":")[1]);
    } else {
      startDate.setHours(0);
      startDate.setMinutes(0);
    }
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
 
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

     const reqObj = {
       providerServiceMapID: this.sessionstorage.getItem('providerServiceMapID'),
       notificationTypeID:this.communicationTypeId,
       notificationID:this.data.notificationID,
       validFrom: new Date(
        startDate.valueOf() - 1 * startDate.getTimezoneOffset() * 60 * 1000
      ),
      validTill: new Date(
        endDate.valueOf() - 1 * endDate.getTimezoneOffset() * 60 * 1000
      ),
       notification: this.editLocationForm.controls.subject.value,
       notificationDesc: this.editLocationForm.controls.message.value,
       deleted: false,
       modifiedBy: this.uname
     }
     this.supervisorService.saveEditNotification(reqObj).subscribe((res:any)=>{
       if(res.statusCode === 200){
        if(res.data !== undefined && res.data !== null){
          this.confirmationService.openDialog(this.currentLanguageSet.locationMessageUpdatedSuccessfully, 'success');
          this.editLocationForm.reset();
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
        this.editLocationForm.reset();
        this.supervisorService.createComponent(LocationMessagesComponent,null);
      }
    });
  }

  ngDoCheck() {
    this.getSelectedLanguage();
  }

}
