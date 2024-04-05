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


import { AfterViewInit, Component, DoCheck, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { CreatequalitySectionConfigurationComponent } from 'src/app/app-modules/quality-supervisor/activites/qualityAudit-sectionConfiguration/createquality-section-configuration/createquality-section-configuration.component';
import { EditQualitySectionConfigurationComponent } from 'src/app/app-modules/quality-supervisor/activites/qualityAudit-sectionConfiguration/edit-quality-section-configuration/edit-quality-section-configuration.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { LoginserviceService } from 'src/app/app-modules/services/loginservice/loginservice.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { CreateAlertComponent } from './create-alert/create-alert.component';
import { EditAlertComponent } from './edit-alert/edit-alert.component';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import * as moment from 'moment';

@Component({
  selector: 'app-alert-notification',
  templateUrl: './alert-notification.component.html',
  styleUrls: ['./alert-notification.component.css']
})
export class AlertNotificationComponent implements OnInit, DoCheck, AfterViewInit {
  types = ['Alerts','Notification'];
  // roles = ['ANM','MO','Supervisor'];
  roles :any = [];
  offices = ['Outbound Helpline', 'Test Assam'];
  displayedColumns: string[]= ['sno','role','office','subject','validFrom','validTill','edit','action'];
  selectedType: any;
  searchTerm : any;

  alertDataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;
  mapSectionQuestionnaireMainList: any;
  filteredData: any;
  data: any;
 
  isActive  = false;
  canEdit = true;
  currentLanguageSet : any;
  time = new Date();
  roleID: any;
  uname: any;
  date = new Date();
  maxDate = new Date();
  dateFilter = (date: Date) => date.getTime() >= this.maxDate.getTime();
  disableSaveButton = true;
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null)
  });
  alertData: any = [];
  alertFilteredData : any =[];
  filterAlertData: any =[];
  notificationTypes: any;
  communicationTypeId: any;
  locationData : any = [];
  roleId: any;
  allRoleIDs: any = [];

  constructor(private fb: FormBuilder,private setLanguageService: SetLanguageService,private supervisorService: SupervisorService,private confirmationService: ConfirmationService , private masterService: MasterService,) { }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getNotificationType();
    this.getRolesForAlert();
    // this.alertDataSource.data = this.alertData;
    
    this.uname = sessionStorage.getItem("userName");
  }

  alertNotificationForm = this.fb.group({
    start: ['',Validators.required],
    end: ['',Validators.required],
    searchTerm: [''],
  });

  deactivate() {
    this.isActive = false;
    // this.activateDeactivateConfig(item:any,'deactive');
  }
  activate() {
    this.isActive = true;
    // this.activateDeactivateConfig(item:any,'activate');
  }
  // publish() {
  //   this.canEdit = false;
  //   this.isActive = false;
  //   this.onPublish();
  // }

  
  getAlertsOnSearch(){
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
          this.alertData = res.data;
          this.alertDataSource.data.forEach((quesValues: any, index: number) => {
            quesValues.sno = index + 1;
          });
          this.alertDataSource.paginator = this.paginator;
          this.alertDataSource.sort = this.sort;
          console.log(this.filterAlertData);
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
  getRolesForAlert(){
    const  providerServiceMapId = sessionStorage.getItem('providerServiceMapID');
    this.masterService.getRoleMaster(providerServiceMapId).subscribe((res:any)=>{
      if (res.length !== 0) {
        this.roles = res.filter((item : any) => {
          return item.roleId.length !== 0;
        });
        for (let i = 0; i < this.roles.length; i++) {
          this.allRoleIDs.push(this.roles[i].roleId);
        }
      } else {
        this.confirmationService.openDialog(res.errorMessage, 'No roles found');
      }
    },
    (error) => {
      console.log(error);
    })
   }


  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  } 
  ngAfterViewInit() {
    this.alertDataSource.paginator = this.paginator;
    this.alertDataSource.sort = this.sort;
  }

  editAlert(data:any){
   this.supervisorService.createComponent(EditAlertComponent,data)
  }

  // activateDeactivateConfig(element: any, status: any){
  //   this.confirmationService.openDialog("Are you sure you would like " + status + " this configuration ?", 'info')
  //   .afterClosed().subscribe(res => {
  //     if(res){
  //       let reqObj = {
  //         element: element,
  //         deleted: status
  //       }
  //       this.supervisorService.saveEditAlert(reqObj).subscribe((res: any) => {
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
                this.getAlertsOnSearch();
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

 
  //  onPublish(){
  //   // this.canEdit = false;
  //   let reqObj= {
  //     providerServiceMapId: sessionStorage.getItem('providerServiceMapID'),
  //     modifiedBy: sessionStorage.getItem('userName'),
  //   }
  //   this.supervisorService.publishAlert(reqObj).subscribe((res:any)=>{
  //   if(res.data !== undefined && res.data !== null){
  //     this.confirmationService.openDialog("Alert Published Successfully" , 'success');
  //   }else{
  //     this.confirmationService.openDialog(res.errorMessage, 'error');
  //   }
  //   }) 
  //  }

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

  showForm(){
    this.supervisorService.createComponent(CreateAlertComponent,null)
  }
  ngDoCheck() {
    this.getSelectedLanguage();
  }

    /**
   * For In Table Search
   * @param searchTerm
   */
    filterSearchTerm(searchTerm?: string) {
      if (!searchTerm) {
        this.alertDataSource.data = this.alertData;
        this.alertDataSource.paginator = this.paginator;
        this.alertDataSource.sort = this.sort;
      } else {
        this.alertDataSource.data = [];
        this.alertDataSource.paginator = this.paginator;
        this.alertDataSource.sort = this.sort;
        this.alertData.forEach((item:any) => {
          for (const key in item) {
            if (
              key === 'notification'
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
