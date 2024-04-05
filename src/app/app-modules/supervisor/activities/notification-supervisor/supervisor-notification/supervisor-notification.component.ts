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


import { AfterViewInit, Component, DoCheck, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { LoginserviceService } from 'src/app/app-modules/services/loginservice/loginservice.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { EditNotificationComponent } from '../edit-notification/edit-notification.component';
import { CreateNotificationComponent } from '../create-notification/create-notification.component';
import * as moment from 'moment';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';

@Component({
  selector: 'app-supervisor-notification',
  templateUrl: './supervisor-notification.component.html',
  styleUrls: ['./supervisor-notification.component.css']
})
export class SupervisorNotificationComponent implements OnInit, DoCheck, AfterViewInit {

  types = ['Alerts','Notification'];
  // roles = ['ANM','MO','Supervisor'];
  roles :any = [];
  offices = ['Outbound Helpline', 'Test Assam'];
  displayedColumns: string[]= ['sno','role','office','subject','validFrom','validTill','edit','action'];
  selectedType: any;
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  searchTerm : any;

  alertDataSource: any = new MatTableDataSource();
 

  searchMode = true;
  editMode = false;
  createMode = false;
  currentLanguageSet : any;
  time = new Date();
  uname: any;
  roleId : any;
  notificationData : any=[];
  workLocationId: any = [];
  allRoleIDs: any = [];
  notificationTypes: any;
  communicationTypeId: any;
  maxDate = new Date();
  dateFilter = (date: Date) => date.getTime() >= this.maxDate.getTime();



  constructor(private fb: FormBuilder,private setLanguageService: SetLanguageService,private supervisorService: SupervisorService,private confirmationService: ConfirmationService, private masterService: MasterService,) { }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getNotificationType();
    this.getRolesForAlert();
    this.uname = sessionStorage.getItem("userName");
    // this.getRolesForAlert();
  }

  alertNotificationForm = this.fb.group({
    start: ['',Validators.required],
    end: ['',Validators.required],
    searchTerm: ['']
  });
  
  getNotificationOnSearch(){
    this.alertDataSource.data = [];
    this.alertDataSource.paginator = this.paginator;
    this.alertDataSource.sort = this.sort;
    const startDate = this.alertNotificationForm.controls.start.value;
    const endDate = this.alertNotificationForm.controls.end.value;

    const validStartDate = moment(startDate).format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
    const validEndDate = moment(endDate).endOf('day').format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');    
    const reqObj = {
      providerServiceMapID : sessionStorage.getItem('providerServiceMapID'),
      notificationTypeID : this.communicationTypeId,
      roleIDs : this.allRoleIDs,
      validEndDate : validEndDate ,
      validStartDate : validStartDate
    } 
    this.supervisorService.getAlertsData(reqObj).subscribe((res: any) => {
      if(res.statusCode === 200 ){
          this.alertDataSource.data = res.data;
          this.notificationData = res.data;
          this.alertDataSource.data.forEach((quesValues: any, index: number) => {
            quesValues.sno = index + 1;
          });
          this.alertDataSource.paginator = this.paginator;
          this.alertDataSource.sort = this.sort;
      } else {
        this.confirmationService.openDialog(res.errorMessage, 'error');
      }
    });
    (err: any) => {
      if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
      else
      this.confirmationService.openDialog(err.title + err.detail, 'error')
    }
  }
  editAlert(data:any){
   this.supervisorService.createComponent(EditNotificationComponent,data);
  }
  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  getRolesForAlert(){
    const  providerServiceMapId = sessionStorage.getItem('providerServiceMapID');
    this.masterService.getRoleMaster(providerServiceMapId).subscribe((res:any)=>{
      if (res.length !== 0) {
        this.roles = res.filter((item : any) => {
          return item.roleId.length !== 0;
        });
        for (let i = 0; i < this.roles.length; i++) {
         this.allRoleIDs.push(this.roles[i].roleId)
        }
      } else {
        this.confirmationService.openDialog(res.errorMessage, 'No roles found');
      }
    },
    (error) => {
      console.log(error);
    })
   }

  //  activateDeactivateConfig(element: any, status: any){
  //   this.confirmationService.openDialog("Are you sure you would like " + status + " this configuration ?", 'info')
  //   .afterClosed().subscribe(res => {
  //     if(res){
  //       let reqObj = {
  //         element: element,
  //         deleted: status
  //       }
  //       this.supervisorService.saveEditNotification(reqObj).subscribe((res: any) => {
  //         if(res.statusCode == 200)
  //         this.confirmationService.openDialog("Successfully deleted configuration", 'success');
  //         else{
  //           this.confirmationService.openDialog(res.errorMessage, 'error')
  //         }
  //       });
  //     }    
  //   });
  //   (err: any) => {
  //     this.confirmationService.openDialog(err.error, 'error');
  //   }
  // }
  getNotificationType(){
    const reqObj = {
      providerServiceMapID : sessionStorage.getItem('providerServiceMapID')
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
  activateDeactivateConfig(element: any,type: any) {
    let status: any = null;
    if (type === 'activate') {
      status = 'Activate';
    } else {
      status = 'Deactivate';
    }
    this.confirmationService
      .openDialog(
        this.currentLanguageSet.areYouSureWantTo + ' ' + status + '?',
        'confirm'
      )
      .afterClosed()
      .subscribe((response) => {
        if (response) {
          const reqObj: any = {
            providerServiceMapID : sessionStorage.getItem('providerServiceMapID'),
            notificationTypeID: this.communicationTypeId,
            notificationID: element.notificationID ,
            roleID: element.roleID,
            validFrom : element.validFrom,
            validTill : element.validTill,
            notification: element.notification,
            notificationDesc: element.notificationDesc,
            deleted: type === 'activate' ? 'false' : 'true',
            modifiedBy: sessionStorage.getItem('userName'),
          };

          this.supervisorService.saveEditAlert(reqObj).subscribe(
            (response: any) => {
              if (response.statusCode === 200 ){
                this.confirmationService.openDialog(
                  status + 'd ' + this.currentLanguageSet.successfully,
                  'success'
                );
                this.searchTerm = null;
                this.alertDataSource.data = [];
                this.alertDataSource.paginator = this.paginator;
                this.getNotificationOnSearch();
              } else {
                this.confirmationService.openDialog(
                  response.errorMessage,
                  'error'
                );
              }
            },
            (err: any) => {
              if(err && err.error)
              this.confirmationService.openDialog(err.error, 'error');
              else
              this.confirmationService.openDialog(err.title + err.detail, 'error')
              });
        
        }
      });
    
  
}
  // onPublish(){
  //   let reqObj= {
  //     providerServiceMapId: sessionStorage.getItem('providerServiceMapID'),
  //     modifiedBy: sessionStorage.getItem('userName'),
  //   }
  //   this.supervisorService.publishNotification(reqObj).subscribe((res:any)=>{
  //   if(res.data !== undefined && res.data !== null){
  //     this.confirmationService.openDialog("Notification Published Successfully" , 'success');
  //   }else{
  //     this.confirmationService.openDialog(res.errorMessage, 'error');
  //   }
  //   }) 
  //  }


  showForm(){
    this.supervisorService.createComponent(CreateNotificationComponent,null);
  }
 
  ngDoCheck() {
    this.getSelectedLanguage();
  }

  ngAfterViewInit() {
    this.alertDataSource.paginator = this.paginator;
    this.alertDataSource.sort = this.sort;
  }

      /**
   * For In Table Search
   * @param searchTerm
   */
      filterSearchTerm(searchTerm?: string) {
        if (!searchTerm) {
          this.alertDataSource.data = this.notificationData;
          this.alertDataSource.paginator = this.paginator;
          this.alertDataSource.sort = this.sort;
        } else {
          this.alertDataSource.data = [];
          this.alertDataSource.paginator = this.paginator;
          this.alertDataSource.sort = this.sort;
          this.notificationData.forEach((item:any) => {
            for (const key in item) {
              if (
                key === 'notification' ||
                key === 'role.RoleName'
              ) {
                const value: string = '' + item[key];
                if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
                  this.alertDataSource.data.push(item);
                  this.alertDataSource.paginator = this.paginator;
                  this.alertDataSource.sort = this.sort;
                  break;
                }
              }
            }
          });
        }
      }

}
