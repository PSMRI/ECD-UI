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


import { Component, DoCheck, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { CoreService } from 'src/app/app-modules/services/core/core.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';

@Component({
  selector: 'app-open-alerts-notification-locationmessages',
  templateUrl: './open-alerts-notification-locationmessages.component.html',
  styleUrls: ['./open-alerts-notification-locationmessages.component.css']
})
export class OpenAlertsNotificationLocationmessagesComponent implements OnInit, DoCheck {
  dialogTitle: any;
  dialogContent: any = [];
  dialogData: any = [];
  userIdsArray: any = [];
  notificationTypeID: any;
  notificationIdType: any;
  currentLanguageSet: any;
 

  constructor(
    private dialogRef: MatDialogRef<OpenAlertsNotificationLocationmessagesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private coreService: CoreService,
    private setLanguageService: SetLanguageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.dialogTitle = this.data.dialogTitle;
    this.notificationIdType = this.data.notifyTypeID;
    this.data = this.data.data;
    this.getdialogData();
    console.log(this.notificationIdType);
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

  getdialogData(){
    const reqObj = {
      userID: sessionStorage.getItem('userId'),
      roleID: sessionStorage.getItem('roleId'),
      notificationTypeID: this.notificationIdType,
      providerServiceMapID: sessionStorage.getItem('providerServiceMapID')
  }
  this.coreService.getAlertsNotifications(reqObj).subscribe((res: any) => {
    if(res.statusCode === 200){
      if(res.data && res.data.length > 0){
      this.dialogData = res.data;
      this.filterDialogData(this.dialogTitle);
      }
      else {
        if(this.dialogData.length>0){
          if(this.dialogTitle === "Alert" || this.dialogTitle === "Notification") {
            this.confirmationService.openDialog(this.currentLanguageSet.no  +  this.dialogTitle  +  this.currentLanguageSet.messagesFound, `info`);
            }
            if(this.dialogTitle === "Location Message") {
              this.confirmationService.openDialog(this.currentLanguageSet.no  +  this.dialogTitle  +  this.currentLanguageSet.found, `info`);
            }
        }
        else{
          this.dialogRef.close({result : false});
          if(this.dialogTitle === "Alert" || this.dialogTitle === "Notification") {
            this.confirmationService.openDialog(this.currentLanguageSet.no  +  this.dialogTitle  +  this.currentLanguageSet.messagesFound, `info`);
            }
            if(this.dialogTitle === "Location Message") {
              this.confirmationService.openDialog(this.currentLanguageSet.no  +  this.dialogTitle  +  this.currentLanguageSet.found, `info`);
            }
        }
        // this.confirmationService.openDialog(this.currentLanguageSet.no  +  this.dialogTitle  +  this.currentLanguageSet.messagesFound, `info`);
        
      }
    }
  });
  }

  filterDialogData(name: any){
    this.dialogData.forEach((item: any)=> {
      if(item.notification && item.notification.notificationType && item.notification.notificationType.notificationType){
      if(item.notification.notificationType.notificationType.toLowerCase() === name.toLowerCase()){
      this.dialogContent.push(item);
      }
    }
    });
  }

  deleteNotification(userNotificationMapID: any, notificationType: any){
    this.confirmationService.openDialog(this.currentLanguageSet.areYouSureYouWantToDeleteThis + notificationType, 'confirm')
    .afterClosed().subscribe((res: any) => {
      if(res){
      const reqObj = {
        isDeleted: true,
        userNotificationMapIDList: [
          userNotificationMapID
        ]
      }
    this.coreService.deleteAlertNotificationLocMessages(reqObj).subscribe((res: any) => {
      if(res.data && res.statusCode === 200){
        // this.reInitialize();
        this.dialogData = [];
        this.dialogContent = [];
        this.getdialogData();
      } else {
        this.confirmationService.openDialog(res.errorMessage, 'error');
      }
    });
    }
  });

  }


  markAllAsRead(data: any){
    const userIdsArray: any = [];
    data.filter((item: any) => {
      if(item.notification && item.notificationID){
        userIdsArray.push(item.userNotificationMapID);
      }
    });
    const reqObj= {
      notficationStatus: "read",
      userNotificationMapIDList: userIdsArray,
    }
    this.coreService.markNotificationsAsRead(reqObj).subscribe((res: any) => {
      if(res)
      if(res !== null && res.data.operation === "read" && res.data.status === "success") {
        this.dialogRef.close({result : true});
      } else {
        if (userIdsArray.length === 0) {
          this.dialogRef.close({result : false});
        }
      }
      // this.reInitialize();
    })
  }

  reInitialize() {
    this.coreService.getAlertsNotifications({
        userID: sessionStorage.getItem('userId'),
        roleID: sessionStorage.getItem('roleId'),
        notificationTypeID: this.data.notificationTypeID,
        providerServiceMapID: sessionStorage.getItem('providerServiceMapID')
    }).subscribe((response: any) => {
      console.log(response.data, "notification messages refreshed response");
      this.dialogData = response.data;
      this.dialogData = this.dialogData.filter((item: any) => item.notificationState !== 'future');
      this.userIdsArray = [];
      this.dialogData.map((item: any) => {
        this.userIdsArray.push(item.userNotificationMapID);
      }, this);
    },
      (error) => {
        console.log(error);
      });
  }

}
