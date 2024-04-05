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
import { MatSort } from '@angular/material/sort';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { EditLocationMessageComponent } from '../edit-location-message/edit-location-message.component';
import { CreateLocationMessageComponent } from '../create-location-message/create-location-message.component';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import * as moment from 'moment';


@Component({
  selector: 'app-location-messages',
  templateUrl: './location-messages.component.html',
  styleUrls: ['./location-messages.component.css']
})
export class LocationMessagesComponent implements OnInit, DoCheck, AfterViewInit {
  offices : any = [];
  displayedColumns: string[]= ['sno','subject','validFrom','validTill','edit','action'];
  selectedType: any;
  searchTerm : any;
  dataSource = new MatTableDataSource();
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  locationData: any = [];
  searchMode = true;
  editMode = false;
  createMode = false;
  currentLanguageSet : any;
  time = new Date();
  roleID: any;
  uname: any;
  communicationTypeId: any;
  notificationTypes: any;
  workLocationId: any = [];
  allOfficeIDs: any = [];
  maxDate = new Date();
  dateFilter = (date: Date) => date.getTime() >= this.maxDate.getTime();



  constructor(private fb: FormBuilder,private setLanguageService: SetLanguageService,private supervisorService: SupervisorService,private confirmationService: ConfirmationService,  private masterService: MasterService) { }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getNotificationType();
    this.getOfficesForAlert();
    this.uname = sessionStorage.getItem("userName");
    // this.getRolesForAlert();

// this.dataSource.data = this.locationData;
  }
    locationSearchForm = this.fb.group({
    start: ['',Validators.required],
    end: ['',Validators.required],
    searchTerm: ['']
  });

  getLocationOnSearch(){
    this.dataSource.data = [];
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    const startDate = this.locationSearchForm.controls.start.value;
    const endDate = this.locationSearchForm.controls.end.value;

    const validStartDate = moment(startDate).format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
    const validEndDate = moment(endDate).endOf('day').format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');    
    const reqObj = {
      providerServiceMapID: sessionStorage.getItem('providerServiceMapID'),
      notificationTypeID: this.communicationTypeId,
      workingLocationIDs:this.allOfficeIDs,
      validStartDate : validStartDate,
      validEndDate : validEndDate,
    }
    this.supervisorService.getLocationOnSearch(reqObj).subscribe((res:any)=>{
        if(res.statusCode === 200){
          this.dataSource.data = res.data;
          this.locationData = res.data;
          this.dataSource.data.forEach((quesValues: any, index: number) => {
            quesValues.sno = index + 1;
          });
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
        else {
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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  editLocation(data:any){
   this.supervisorService.createComponent(EditLocationMessageComponent,data);
  }

  // activateDeactivateConfig(element: any, status: any){
  //   this.confirmationService.openDialog("Are you sure you would like " + status + " this configuration ?", 'info')
  //   .afterClosed().subscribe(res => {
  //     if(res){
  //       let reqObj = {
  //         element: element,
  //         deleted: status
  //       }
  //       this.supervisorService.EditLocationMessages(reqObj).subscribe((res: any) => {
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
                    this.dataSource.data = [];
                    this.dataSource.paginator = this.paginator;
                    this.getLocationOnSearch();
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

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  // onPublish(){
  //   let reqObj= {
  //     providerServiceMapId: sessionStorage.getItem('providerServiceMapID'),
  //     modifiedBy: sessionStorage.getItem('userName'),
  //   }
  //   this.supervisorService.publishLocationMessages(reqObj).subscribe((res:any)=>{
  //   if(res.data !== undefined && res.data !== null){
  //     this.confirmationService.openDialog("Location Message Published Successfully" , 'success');
  //   }else{
  //     this.confirmationService.openDialog(res.errorMessage, 'error');
  //   }
  //   }) 
  //  }
  //  getOfficesForAlert(){
  //   let reqObj = { 
  //     providerServiceMapId: sessionStorage.getItem('providerServiceMapID'),
  //     roleID: this.roleID
  //    }
  //   this.supervisorService.getOffices(reqObj).subscribe((res:any)=>{
  //     if(res.data !== undefined && res.data !== null &&  res.statusCode == 200 ){
  //       this.offices = res.data;
  //     }
  //   })
  //  }
   getOfficesForAlert(){
    const  providerServiceMapId = sessionStorage.getItem('providerServiceMapID');
    this.masterService.getOfficeMasterData(providerServiceMapId).subscribe((res:any)=>{
      if(res !== undefined && res.data !== undefined){
        this.offices = res.data.filter((item : any) => {
          return item.pSAddMapID.length !== 0;
        });
        for (let i = 0; i < this.offices.length; i++) {
         this.allOfficeIDs.push(this.offices[i].pSAddMapID)
        }
      } else {
        this.confirmationService.openDialog(res.errorMessage, 'error');
      }
    },
    (error) => {
      console.log(error);
    })
   }


  showForm(){
   this.supervisorService.createComponent(CreateLocationMessageComponent,null);
  }
  showTable() {
    this.searchMode = true;
    this.editMode = false;
    this.createMode = false;
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
        this.dataSource.data = this.locationData;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      } else {
        this.dataSource.data = [];
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.locationData.forEach((item:any) => {
          for (const key in item) {
            if (
              key === 'notification' 
            ) {
              const value: string = '' + item[key];
              if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
                this.dataSource.data.push(item);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                break;
              }
            }
          }
        });
      }
    }


}
