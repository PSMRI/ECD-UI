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
import { AlertNotificationComponent } from '../alert-notification.component';
import * as moment from 'moment';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-edit-alert',
  templateUrl: './edit-alert.component.html',
  styleUrls: ['./edit-alert.component.css']
})
export class EditAlertComponent implements OnInit, DoCheck {
  types = ['Alerts','Notification'];
  roles = ['ANM','MO','Supervisor'];
  // roles :any = [];
  offices = ['Outbound Helpline', 'Test Assam'];
  displayedColumns: string[]= ['sno','type','role','office','subject','description','validFrom','validTill','publish','action','edit'];
  selectedType: any;
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  searchTerm : any;
  @Input()
  public data: any;

  dataSource = new MatTableDataSource();
  currentLanguageSet : any;
  time = new Date();
  roleID: any;
  uname: any;
  date = new Date();
  minDate = new Date();
  dateFilter = (date: Date) => date.getTime() >= this.minDate.getTime();
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  workLocationId: any = [];
  notificationTypes: any;
  communicationTypeId : any;
  Stime = '';
  Etime = '';

  constructor(private fb: FormBuilder,private setLanguageService: SetLanguageService,private supervisorService: SupervisorService,private confirmationService: ConfirmationService) { }

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

    this.getSelectedLanguage();
    this.getNotificationType();
    this.uname = sessionStorage.getItem("userName");
    this.range.controls.start.setValue(startDate);
    this.range.controls.end.setValue(endDate);
    this.editAlertForm.controls.startTime.patchValue(startTime);
    this.editAlertForm.controls.endTime.patchValue(endTime);    
    this.editAlertForm.controls.subject.patchValue(this.data.notification);
    this.editAlertForm.controls.message.patchValue(this.data.notificationDesc);
  }

  editAlertForm = this.fb.group({
    startTime: ['',Validators.required],
    endTime: ['',Validators.required],
    subject: ['', Validators.required],
    message: ['', Validators.required]

  })

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  } 


  getRolesForAlert(){
    // let reqObj = { 
    //   providerServiceMapId: sessionStorage.getItem('providerServiceMapID')
    //  }
    this.supervisorService.getRole().subscribe((res:any)=>{
      if(res.data !== undefined && res.data !== null &&  res.statusCode === 200 ){
        this.roles = res.data;
        this.roleID = res.data.roleID;
      }
    })
   }

   showTable(){
    this.confirmationService
    .openDialog(
      this.currentLanguageSet.doYouReallyWantToCancelUnsavedData,
      'confirm'
    )
    .afterClosed() 
    .subscribe((res) => {
      if (res) {
        this.editAlertForm.reset();
        this.supervisorService.createComponent(AlertNotificationComponent, null);
      }
    });
   }

   getOfficesForAlert(){
    const reqObj = { 
      providerServiceMapId: sessionStorage.getItem('providerServiceMapID'),
      roleID: this.roleID
     }
    this.supervisorService.getOffices(reqObj).subscribe((res:any)=>{
      if(res.data !== undefined && res.data !== null &&  res.statusCode === 200 ){
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

   saveEditAlertForm(){   
    const form_values: any = this.editAlertForm.value;
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
      providerServiceMapID: sessionStorage.getItem('providerServiceMapID'),
      notificationTypeID: this.communicationTypeId,
      roleID: this.data.role.RoleID,
      notificationID: this.data.notificationID,
      validFrom: new Date(
        startDate.valueOf() - 1 * startDate.getTimezoneOffset() * 60 * 1000
      ),
      validTill: new Date(
        endDate.valueOf() - 1 * endDate.getTimezoneOffset() * 60 * 1000
      ),
      notification: this.editAlertForm.controls.subject.value,
      notificationDesc: this.editAlertForm.controls.message.value,
      deleted: false,
      modifiedBy: this.uname
    }

    this.supervisorService.saveEditAlert(reqObj).subscribe((res:any)=>{
      if(res.statusCode === 200){
        if(res.data !== undefined && res.data !== null){
          this.confirmationService.openDialog(this.currentLanguageSet.alertUpdatedSuccessfully, 'success');
          this.editAlertForm.reset();
          this.range.reset();
          // this.showTable();
        }
      }
      else{
        this.confirmationService.openDialog(res.errorMessage, 'error')
      }
     })
   }

  ngDoCheck() {
    this.getSelectedLanguage();
  }
  getNotificationType(){
    const reqObj = {
      providerServiceMapID : sessionStorage.getItem('providerServiceMapID')
  } 
    this.supervisorService.getNotificationType(reqObj).subscribe((res:any)=>{
      if(res.statusCode === 200){
       this.notificationTypes = res.data;
       this.notificationTypes.filter((value:any)=>{
        if(value.notificationType.toLowerCase() === "alert"){
          this.communicationTypeId = value.notificationTypeID
        }
       })
      }
    })
  }

}
