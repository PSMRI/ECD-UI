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
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { SupervisorNotificationComponent } from '../supervisor-notification/supervisor-notification.component';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import * as moment from 'moment';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/app-modules/services/core/session-storage.service';

@Component({
  selector: 'app-create-notification',
  templateUrl: './create-notification.component.html',
  styleUrls: ['./create-notification.component.css']
})
export class CreateNotificationComponent implements OnInit, DoCheck {
  types = ['Alerts','Notification'];
  // roles = ['ANM','MO','Supervisor'];
  roles :any = [];
  // offices = ['Outbound Helpline', 'Test Assam'];
  offices : any =[];
  displayedColumns: string[]= ['sno','type','role','office','subject','description','validFrom','validTill','publish','action','edit'];
  selectedType: any;
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  searchTerm : any;
  dataSource = new MatTableDataSource();
  currentLanguageSet : any;
  time = new Date();
  roleID: any;
  uname: any;
  notificationData : any=[];
  workLocationId: any = [];
  notificationTypes: any;
  communicationTypeId: any;
  date = new Date();
  minDate = new Date();
  dateFilter = (date: Date) => date.getTime() >= this.minDate.getTime();
  range = new FormGroup({
    start: new FormControl('', [Validators.required]),
    end: new FormControl('', [Validators.required])
  });
  locationData: any = [];
  Stime = '';
  Etime = '';

  constructor(readonly sessionstorage:SessionStorageService, private fb: FormBuilder,private setLanguageService: SetLanguageService,private supervisorService: SupervisorService,private confirmationService: ConfirmationService,private masterService: MasterService) { }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getNotificationType();
    this.getRolesForAlert();
    this.getLocationsForAlert();
    this.uname = this.sessionstorage.userName;
  }

  createAlertForm = this.fb.group({
    roleType: [''],
    officeType: [''],
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

  getRolesForAlert(){
    const  providerServiceMapId = this.sessionstorage.getItem('providerServiceMapID');
    this.masterService.getRoleMaster(providerServiceMapId).subscribe((res:any)=>{
      if(res){
        res.filter((role: any) => {
          if(role.roleName.toLowerCase() !== "supervisor"){
            this.roles.push(role)
          }
        })
      }
    })
   }
   getOfficesForAlert(){
    const providerServiceMapId = this.sessionstorage.getItem('providerServiceMapID');
    this.masterService.getOfficesMaster(providerServiceMapId).subscribe((res:any)=>{
      if(res){
        this.offices = res;
      }
    })
   }

   getLocationsForAlert() {
    const providerServiceMapID = this.sessionstorage.getItem('providerServiceMapID');
    const roleID = this.createAlertForm.controls.roleType.value;
    this.masterService.getLocationsMaster(providerServiceMapID, roleID).subscribe((res: any) => {
      if (res !== undefined && res.data !== undefined) {
        this.locationData = res.data;
      }
    });
  }  

   getNotificationType(){
    const reqObj = {
      providerServiceMapID : this.sessionstorage.getItem('providerServiceMapID')
  } 
    this.supervisorService.getNotificationType(reqObj).subscribe((res:any)=>{
      if(res.statusCode === 200){
       this.notificationTypes = res.data;
       this.notificationTypes.filter((value:any)=>{
        if(value.notificationType.toLowerCase() === "notification"){
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

  saveNotificationForm(){
    const requestObj = [];
    // let form_values: any; 
    const form_values: any = this.createAlertForm.value;

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
      // let workLocationId: any;
     const workLocationId: any = this.createAlertForm.controls.officeType.value;
      for(let i=0; i < workLocationId.length; i++ ){
          const reqObj = {
            createdBy: this.uname,
            notification: this.createAlertForm.controls.subject.value,
            notificationDesc: this.createAlertForm.controls.message.value,
            notificationTypeID : this.communicationTypeId,
            providerServiceMapID: this.sessionstorage.getItem('providerServiceMapID'),
            roleID : this.createAlertForm.controls.roleType.value,
            workingLocationID : workLocationId[i],
            validFrom: new Date(
              startDate.valueOf() - 1 * startDate.getTimezoneOffset() * 60 * 1000
            ),
            validTill: new Date(
              endDate.valueOf() - 1 * endDate.getTimezoneOffset() * 60 * 1000
            ),
          }
          requestObj.push(reqObj);
          console.log('reqObj',requestObj);
        }
   this.supervisorService.saveCreateAlert(requestObj).subscribe((res:any)=>{
    if(res.statusCode === 200){
      if(res.data !== undefined && res.data !== null){
      this.confirmationService.openDialog(this.currentLanguageSet.createdNotificationSuccessfully, 'success');
      this.createAlertForm.reset();
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
        this.createAlertForm.reset();
        this.range.reset();
        this.supervisorService.createComponent(SupervisorNotificationComponent,null);
      }
    });
   }

  ngDoCheck() {
    this.getSelectedLanguage();
  }

}
