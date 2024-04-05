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


import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { Router } from '@angular/router';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { OpenAlertsNotificationLocationmessagesComponent } from '../alerts-notifications-locationmessages/open-alerts-notification-locationmessages/open-alerts-notification-locationmessages.component';
import { CoreService } from '../../services/core/core.service';
import { map, Subscription, timer } from 'rxjs';
import { CtiService } from '../../services/cti/cti.service';
import { OutboundWorklistComponent } from '../../associate-anm-mo/outbound-worklist/outbound-worklist.component';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';
import { MasterService } from '../../services/masterService/master.service';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { SupervisorService } from '../../services/supervisor/supervisor.service';
/**
 * DE40034072
 * 18-01-2023
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, DoCheck, OnDestroy {
  selectedRole: any;
  currentLanguageSet: any;
  agentId: any;
  alertsData: any = [];
  sendDialogData: any = [];
  timerSubscription: Subscription = new Subscription;
  alertsUnreadCount: any = [];
  notificationsUnreadCount: any = [];
  locMessagesUnreadCount: any = [];
  frequencyList: any[]=[];
  notificationTypes: any;
  communicationTypeId: any;
  alertCount: any;
  notificationCount: any;
  locationCount: any;
  alertTypeId: any
  notificationTypeId: any;
  dialogDataType: any = [];
  dataCheck:any;
  scoreChartFrequencyList:any=[];


  constructor(
    private loginService: LoginserviceService,
    private setLanguageService: SetLanguageService,
    private router: Router,
    public dialog: MatDialog,
    public coreService: CoreService,
    private ctiService: CtiService,
    private associateAnmMoService: AssociateAnmMoService,
    private masterService: MasterService,
    private confirmationService:ConfirmationService,
    private supervisorService: SupervisorService
  ) {}

  ngOnInit(): void {
    
    this.getFrequencyMaster();
    this.getSelectedLanguage();
    this.selectedRole = sessionStorage.getItem('role');
    this.agentId = this.loginService.agentId;
    this.getALertsNotifLocMessages();
    this.getNotificationType();
    const selectedRoleName = sessionStorage.getItem("role");
    if(selectedRoleName !== undefined && selectedRoleName !== null && (selectedRoleName.toLowerCase() === "associate" || selectedRoleName.toLowerCase() === "anm" || selectedRoleName.toLowerCase() === "mo"))
    {
      this.timerSubscription = timer(0, 15000).pipe( 
        map(() => { 
          this.getAgentState(); 
        }) 
      ).subscribe(); 

    }
    this.coreService.roleChanged$.subscribe(res => {
      if(res === true)
      this.getALertsNotifLocMessages();
    });



  }

  ngDoCheck() {
    this.getSelectedLanguage();
    this.selectedRole = sessionStorage.getItem('role');
    this.agentId = this.loginService.agentId;
    // this.getALertsNotifLocMessages();
  }

  // ngAfterViewInit() {
  //   this.getALertsNotifLocMessages();
  // }

  ngOnDestroy() {
    this.timerSubscription.unsubscribe();
    this.masterService.frequencyMasterList = null;
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

    /** For fetching frequency masters */
    getFrequencyMaster() {
      /**
       * todo Remove this code
       */
      // this.frequencyList = [
      //   {
      //     id: 1,
      //     name: 'Cycle Wise',
      //   },
      //   {
      //     id: 2,
      //     name: 'Month Wise',
      //   },
      //   {
      //     id: 3,
      //     name: 'Quarter Wise',
      //   },
      //   {
      //     id: 4,
      //     name: 'Year Wise',
      //   },
      //   {
      //     id: 5,
      //     name: 'Year to Date',
      //   }
      // ];

      // this.masterService.frequencyMasterList = this.frequencyList;

   
      this.masterService.getFrequencyMaster().subscribe(
        (response: any) => {
          if (response) {
            this.frequencyList = response;
            this.masterService.frequencyMasterList = this.frequencyList;
            this.frequencyList.filter((item: any) => {
              if(item.name.toLowerCase() !== "quarter wise" && item.name.toLowerCase() !== "cycle wise"){
              this.scoreChartFrequencyList.push(item);
              }
            });
            this.masterService.frequencyMasterListOfScoreChart=this.scoreChartFrequencyList;
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

  loadReports() {
    this.router.navigate(['/quality-supervisor/innerpage-quality-supervisor'], {
      queryParams: { data: 'reports' },
    });
  }

  getALertsNotifLocMessages(){
    const reqObj = {
      userID: sessionStorage.getItem('userId'),
      roleID: sessionStorage.getItem('roleId'),
      providerServiceMapID: sessionStorage.getItem('providerServiceMapID')
    }
    this.loginService.getAlertsNotifLocMessagesCount(reqObj).subscribe((res: any) => {
      if(res && res.statusCode === 200){
        if(res.data && res.data.userNotificationTypeList && res.data.userNotificationTypeList.length > 0){
          res.data.userNotificationTypeList.forEach((element : any) => {
            if(element.notificationType && element.notificationType.toLowerCase() === "alert") {
            this.alertsUnreadCount = element;
            this.alertCount = this.alertsUnreadCount.notificationTypeUnreadCount;
            }
            else if(element.notificationType && element.notificationType.toLowerCase() === "notification") {
            this.notificationsUnreadCount = element;
            this.notificationCount = this.notificationsUnreadCount.notificationTypeUnreadCount;
            }
            else if(element.notificationType && element.notificationType.toLowerCase() === "location message") {
            this.locMessagesUnreadCount = element;
            this.locationCount = this.locMessagesUnreadCount.notificationTypeUnreadCount;
            }
          });
        } else {
          this.alertsUnreadCount = null;
          this.notificationsUnreadCount = null;
          this.locMessagesUnreadCount = null;
        }
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
        if(value.notificationType.toLowerCase() === "alert") {
          this.alertTypeId = value.notificationTypeID;
        }
           if(value.notificationType.toLowerCase() === "notification") {
            this.notificationTypeId = value.notificationTypeID;
          }
           if(value.notificationType.toLowerCase() === "location message") {
          this.communicationTypeId = value.notificationTypeID
        }
       })
      }
    })
  }

  openDialogcomponent(notificationData: any, dialogTitle: any, notificationTypeID: any){
    const reqObj = {
      userID: sessionStorage.getItem('userId'),
      roleID: sessionStorage.getItem('roleId'),
      notificationTypeID: notificationTypeID,
      providerServiceMapID: sessionStorage.getItem('providerServiceMapID')
  }
  this.coreService.getAlertsNotifications(reqObj).subscribe((res: any) => {
    if(res.statusCode === 200){
      if(res.data && res.data.length > 0){
      // this.dialogDataType = res.data;
      const data = {
        data: notificationData,
        dialogTitle: dialogTitle,
        notifyTypeID: notificationTypeID
      }
      this.dialog.open(OpenAlertsNotificationLocationmessagesComponent, {
        data: data
      }).afterClosed().subscribe((result : any) => {
        if(result) {
          if(dialogTitle === "Alert"){
          this.alertCount = undefined;
          } 
          if(dialogTitle === "Notification") {
            this.notificationCount = undefined;
          }
          if(dialogTitle === "Location Message") {
            this.locationCount = undefined;
          } 
        }
      });
      }
      else{
        if(dialogTitle === "Alert" || dialogTitle === "Notification") {
        this.confirmationService.openDialog(this.currentLanguageSet.no  +  dialogTitle  +  this.currentLanguageSet.messagesFound, `info`);
        }
        if(dialogTitle === "Location Message") {
          this.confirmationService.openDialog(this.currentLanguageSet.no  +  dialogTitle  +  this.currentLanguageSet.found, `info`);
        }
      }
    }
  });
      // this.getALertsNotifLocMessages();
  }

  getdialogData(dialogTitle: any, notificationTypeID: any){
    const reqObj = {
      userID: sessionStorage.getItem('userId'),
      roleID: sessionStorage.getItem('roleId'),
      notificationTypeID: notificationTypeID,
      providerServiceMapID: sessionStorage.getItem('providerServiceMapID')
  }
  this.coreService.getAlertsNotifications(reqObj).subscribe((res: any) => {
    if(res.statusCode === 200){
      if(res.data && res.data.length > 0){
      this.dialogDataType = res.data;
      }
      else{
        this.dialogDataType=[];
      }
    }
  });
  }
  
  getAgentState() {
    const reqObj = {"agent_id" : this.agentId};
    this.ctiService.getAgentState(reqObj).subscribe((response:any) => {
        if (response && response.data && response.data.stateObj.stateName) {
            const status = response.data.stateObj.stateName;
            
            if (status.toUpperCase() === "INCALL" || status.toUpperCase() === "CLOSURE") {
                const benPhoneNo = response.data.cust_ph_no;
                const callId = response.data.session_id;
                if (callId !== undefined && callId !== null && callId !== "undefined" &&
                callId !== ""
                ) {
                  sessionStorage.setItem("benPhoneNo", benPhoneNo);
                  sessionStorage.setItem("callId", callId);
                  sessionStorage.setItem("onCall", "true");
              
                  this.associateAnmMoService.loadComponent(
                    OutboundWorklistComponent,
                    null
                  );
                }
                
            } 
        }

    }, (err) => {
       console.log("error");
    });
}


}
