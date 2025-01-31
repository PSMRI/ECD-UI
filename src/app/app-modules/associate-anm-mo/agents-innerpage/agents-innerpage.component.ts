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


import { Component, DoCheck, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, map, Observable, Subject, Subscription, take, timer } from 'rxjs';
import { OutboundWorklistComponent } from '../outbound-worklist/outbound-worklist.component';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { BenRegistrationComponent } from '../beneficiary-registration/ben-registration/ben-registration.component';
import { FormBuilder } from '@angular/forms';
import { CtiService } from '../../services/cti/cti.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { DomSanitizer } from '@angular/platform-browser';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-agents-innerpage',
  templateUrl: './agents-innerpage.component.html',
  styleUrls: ['./agents-innerpage.component.css']
})
export class AgentsInnerpageComponent implements OnInit, DoCheck, OnDestroy {

 selectedRoute: any;
  selectedRole: any;
  timerSubscription: Subscription = new Subscription;
  callTimerSubscription: Subscription = new Subscription;
  agentStatus: any = "FREE";
  benPhoneNo: any;
  callId: any;
  timeRemaining: any;
  ctiHandlerURL: any;
  callDuration = "00:00:00";
  seconds = 0;
  minutes = 0;
  hours = 0;
  counter = 0;
  toRemove: any;
  eventSpiltData: any;
  custDisconnectCallId: any;
  ticks = 0;
  wrapupCount = 0;
  roleId: any;
  wrapupTimerSubscription: Subscription = new Subscription;
  currentLanguageSet: any;
  isEnableComp: any = "Outbound Worklist";
  callTypes:any[]=[];
  callTypeId:any;


  constructor(
    private associateAnmMoService: AssociateAnmMoService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private router: Router,
    private fb: FormBuilder,
    private ctiService: CtiService,
    private loginService: LoginserviceService,
    public sanitizer: DomSanitizer,
    readonly sessionstorage:SessionStorageService,
    private setLanguageService: SetLanguageService,
  ) { }

  
  // @ViewChild('dynamicContent', { read: ViewContainerRef, static: true })
  // container!: ViewContainerRef;
  // private components: { [key: string]: any } = { 
  //   outboundWorklist: OutboundWorklistComponent,
  //   benRegistration: BenRegistrationComponent,
  // };

  ngOnInit(): void {
   

    this.associateAnmMoService.resetOpenComp();
    this.associateAnmMoService.clearStopTimer();
    this.associateAnmMoService.clearCallClosure();
    this.getSelectedLanguage();
    this.addListener();
    this.isEnableComp = "Outbound Worklist";
    this.roleId = this.sessionstorage.getItem('roleId');
    // this.associateAnmMoService.setContainer(this.container);
    this.route.queryParams.subscribe((params: any) => {
      if(params !== undefined && params !==null){
      this.selectedRoute = params.data;
      // this.associateAnmMoService.loadComponent(this.components[this.selectedRoute], null);
      } else{
        this.confirmationService.openDialog(this.currentLanguageSet.unableToRoute, 'info')
      }
    });
   
    this.associateAnmMoService.openCompFlag$.subscribe((responseComp) => {
      if (responseComp !== null && (responseComp === "Call Closure" || responseComp === "Outbound Worklist" || responseComp === "Beneficiary Call History" || responseComp === "Beneficiary Registration" || responseComp === "ECD Questionnaire" || responseComp === "Call Closed")) {
        if(responseComp === "Call Closed") {
          this.unsubscribeWrapupTime();
          if (this.callTimerSubscription !== undefined) {
            this.callTimerSubscription.unsubscribe();
          }
          this.callDuration = "00:00:00";
          this.seconds = 0;
          this.minutes = 0;
          this.hours = 0;
          this.counter = 0;
          this.ticks = 0;
          this.wrapupCount = 0;
          responseComp = "Outbound Worklist";
        }
        this.isEnableComp = responseComp;
      }

  
      
  });

    this.getAgentIpAddress();
 
    this.timerSubscription = timer(0, 15000).pipe( 
      map(() => { 
        this.getAgentState();  
      }) 
    ).subscribe(); 

    console.log("Agent Status Observable");
    this.associateAnmMoService.resetAgentStatusFlag$.subscribe((resetStatus) => {
      console.log("Agent Status Observable");
      if(resetStatus !== undefined && resetStatus !== null) {
        console.log("Agent Status Observable");
        this.agentStatus = resetStatus;
        console.log("Agent Status resetting");
      }
    })
  
   

    this.benPhoneNo = this.sessionstorage.getItem("benPhoneNo");
    this.callId = this.sessionstorage.getItem("callId");
    // this.sessionstorage.setItem("onCall", "true");


    this.timeRemaining = this.ctiService.wrapupTime;
    const ctiUrl = this.ctiService.ctiUrl + this.ctiService.eventCtiUrl + this.loginService.agentId;
    this.ctiHandlerURL = this.sanitizer.bypassSecurityTrustResourceUrl(ctiUrl);
    // this.getCallStats();

    
  this.associateAnmMoService.callClosureFlag$.subscribe((response) => {
    if (response > 0) {
      this.callDuration = "00:00:00";
      this.seconds = 0;
      this.minutes = 0;
      this.hours = 0;
      this.counter = 0;
      this.ticks = 0;
      this.wrapupCount = 0;
    } 
  });
   

   
    this.associateAnmMoService.setOpenComp("Outbound Worklist");
    this.getCallTypes();
  

    
  this.associateAnmMoService.stopTimerFlag$.subscribe((res: any) => {
    if(res !== undefined && res !== null && res === true){
      this.ticks = 0;
    }
    console.log("timer stopped", this.ticks);
  })
  console.log("timer stopped now", this.ticks);
  }
  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  } 

  ngDoCheck() {
    this.getSelectedLanguage();
  }

  ngOnDestroy() {
    this.associateAnmMoService.isStartAutoPreviewDial = false;
    this.associateAnmMoService.autoDialing = false;
    console.log("removing message listener");
    removeEventListener("message", this.toRemove, false);
    if (this.timerSubscription !== undefined) {
      this.timerSubscription.unsubscribe();
    }
    this.unsubscribeWrapupTime();
    if (this.callTimerSubscription !== undefined) {
      this.callTimerSubscription.unsubscribe();
    }
  }
  listener(event:any) {
    console.log("listener invoked: ");
    console.log("event received" + JSON.stringify(event));
   

    if (event.data) {
      this.eventSpiltData = event.data.split("|");
   
    } else {
      this.eventSpiltData = event.detail.data.split("|");
    }
    this.handleEvent(this.eventSpiltData);
  }

  handleEvent(eventData :any) {
      // var idx = jQuery(".carousel-inner div.active").index();
  
      if (
        eventData[0] === "CustDisconnect" &&
        // idx != 0 &&
        eventData[1] === this.callId
      ) {
        this.custDisconnectCallId = eventData[1];
        console.log("Cust Disconnect Event", eventData[0])
        if (this.ticks === 0) {
          // let obj = {
          //   transferCallFlag: false,
          //   transferCallToANMFlag: false,
          //   transferCallTo104Flag: false,
          //   transferCallTo108Flag: false,
          //   callAnsweredFlag: false,
          // };
          this.wrapupCount = this.wrapupCount + 1;
        
          // this.viewClosure(obj);

         
          this.startCallWraupup();
        } else {
          console.log("CallWraupup is not started, ticks:" + this.ticks);
        }
      } else if (
        eventData[0] === "Accept" &&
        eventData[2] !== undefined &&
        eventData[4] !== undefined &&
        eventData[4] === "0"
      ) {
       

        
        
  
        if ((this.associateAnmMoService.callDetailId === undefined || this.associateAnmMoService.callDetailId  === null) && this.associateAnmMoService.selectedBenDetails !== undefined  && this.associateAnmMoService.selectedBenDetails !== null) {
         
          this.callId = eventData[2];
          this.ticks = 0;
          this.unsubscribeWrapupTime();
         
          let phNo = null;
          if(this.associateAnmMoService.isMother !== undefined && this.associateAnmMoService.isMother !== null && this.associateAnmMoService.isMother === true) {
            phNo = this.associateAnmMoService.selectedBenDetails.whomPhoneNo;
          }
          else if(this.associateAnmMoService.isMother !== undefined && this.associateAnmMoService.isMother !== null && this.associateAnmMoService.isMother === false) {
         
           
            phNo = this.associateAnmMoService.selectedBenDetails.phoneNo;
          }
          console.log("Selected Ben" , this.associateAnmMoService.selectedBenDetails);
          console.log("Phone Number of ben" , phNo);
          
          const reqObj = {
            obCallId: this.associateAnmMoService.selectedBenDetails.obCallId,
            callReceivedUserId: this.sessionstorage.getItem('userID'),
            beneficiaryRegId: this.associateAnmMoService.selectedBenDetails.beneficiaryRegId,
            calledServiceId: this.sessionstorage.getItem('providerServiceMapID'),
            psmId: this.sessionstorage.getItem('providerServiceMapID'),
            subCategory: this.associateAnmMoService.selectedBenDetails.ecdCallType,
            callId: eventData[2],
            createdBy: this.sessionstorage.getItem('userName'),
            agentId: this.loginService.agentId,
            receivedRoleName: this.sessionstorage.getItem('role'),
            phoneNo: phNo,
            isMother: this.associateAnmMoService.isMother,
          };


        
          this.associateAnmMoService.saveBenCallDetails(reqObj).subscribe(
            (response:any) => {
         
              if(response && response.response) {
              this.associateAnmMoService.callDetailId = response.response.benCallId;

              this.sessionstorage.setItem("onCall", "true");
              this.callId = eventData[2];
              this.sessionstorage.setItem("benPhoneNo", eventData[1]);
              this.sessionstorage.setItem("callId",  eventData[2]);
      
              this.benPhoneNo = this.sessionstorage.getItem("benPhoneNo");
              this.callId = this.sessionstorage.getItem("callId");
              
       
              this.associateAnmMoService.setLoadDetailsInReg(true);
              this.viewBenRegScreen();
              }
          
            },
            (error) => {
              console.log(error);
            }
          );

          /**
           * todo remove this code
           */
          // this.viewBenRegScreen();
        }
      } else if (
        this.eventSpiltData[0] === "Accept" &&
        this.eventSpiltData[2] !== undefined &&
        this.eventSpiltData[4] !== undefined &&
        this.eventSpiltData[4] === "1"
      ) {
        console.log(
          "transfer event received, routing to inner page agent and then from their route to call screen"
        );
       
        this.sessionstorage.setItem("onCall", "true");
        this.callId = eventData[2];
        this.sessionstorage.setItem("benPhoneNo", this.eventSpiltData[1]);
        this.sessionstorage.setItem("callId",  this.eventSpiltData[2]);

        this.benPhoneNo = this.sessionstorage.getItem("benPhoneNo");
        this.callId = this.sessionstorage.getItem("callId");
        this.associateAnmMoService.setOpenComp("Call Closed");
        // this.associateAnmMoService.loadComponent(
        //   OutboundWorklistComponent,
        //   null
        // );
      }
      this.getAgentState();
    }

    viewBenRegScreen() {

      console.log("Timer Invoked");
      if(this.seconds !== undefined && this.seconds !== null && this.seconds === 0 && this.minutes === 0 && this.callDuration === "00:00:00" ) {
      this.callTimerSubscription = timer(0,1000).pipe( 
      map(() => { 
     
        if (this.seconds === this.counter + 59) {
          this.minutes = this.minutes + 1;
          this.seconds = 0;
        }
        else {
          this.seconds = this.seconds + 1;
        }
        if(this.minutes === 59) {
          this.hours = this.hours + 1;
          this.minutes = 0;
          // this.seconds = 0;
        }
       
        let hourCount = null;
        let minuteCount = null;
        let secondCount = null;
        if(this.hours >= 0 && this.hours < 10) {
          
          hourCount = "0" + this.hours;
        }
        else {
          hourCount = this.hours;
        }
        if(this.minutes >= 0 && this.minutes < 10) {
          
          minuteCount = "0" + this.minutes;
        }
        else {
          minuteCount = this.minutes;
        }

        if(this.seconds >= 0 && this.seconds < 10) {
          
          secondCount = "0" + this.seconds;
        }
        else {
          secondCount = this.seconds;
        }
        console.log("TimerCount" +  hourCount + ":" + minuteCount + ":" + secondCount)
        this.callDuration = hourCount + ":" + minuteCount + ":" + secondCount;

        }) 
      ).subscribe(); 

      this.associateAnmMoService.setOpenComp("Beneficiary Registration");
    }
      // this.associateAnmMoService.loadComponent(
      //   BenRegistrationComponent,
      //   null
      // );
      
    
    }

    unsubscribeWrapupTime() {
      if (this.wrapupTimerSubscription) {
        this.wrapupTimerSubscription.unsubscribe();
      }
    }

    startCallWraupup() {
      this.ctiService.getRoleBasedWrapuptime(this.roleId)
        .subscribe(
          (roleWrapupTime:any) => {
            if (
              roleWrapupTime.data !== undefined &&
              roleWrapupTime.data.isWrapUpTime !== undefined &&
              roleWrapupTime.data.WrapUpTime !== undefined &&
              roleWrapupTime.data.isWrapUpTime
            ) {
              this.roleBasedCallWrapupTime(roleWrapupTime.data.WrapUpTime);
            } else {
              const time = this.timeRemaining;
              this.roleBasedCallWrapupTime(time);
             
            }
          },
          (err) => {
            const time = this.timeRemaining;
            this.roleBasedCallWrapupTime(time);
            console.log("Need to configure wrap up time", err.errorMessage);
          }
        );
  

    }


    roleBasedCallWrapupTime(timeRemaining:any) {
      console.log("Call Id wrapup", this.callId);
      console.log("custDisconnectCallId wrapup", this.callId);
      if (this.callId === this.custDisconnectCallId) {
        console.log("wrap time is invoked");
      this.wrapupTimerSubscription = timer(2000, 1000).subscribe((timerValue) => {
        this.ticks = timeRemaining - timerValue;
        console.log("ticks", this.ticks);
        if (timerValue === timeRemaining) {
          this.wrapupTimerSubscription.unsubscribe();
          timerValue = 0;
          this.ticks = 0;
          
            console.log("Wrapup timer callId", this.callId);
            console.log("Wrapup timer custDisconnectCallId", this.custDisconnectCallId);
            if (this.callId === this.custDisconnectCallId) {
            // this.associateAnmMoService.setCloseCallOnWrapup();
            this.closeCall();
            }
          
        }
      });
    }
    }

    closeCall() {
    let reqObj: any = {};
    reqObj = {
      benCallId : this.associateAnmMoService.callDetailId,
      obCallId: this.associateAnmMoService.selectedBenDetails.obCallId,
      motherId :this.associateAnmMoService.selectedBenDetails.mctsidNo?this.associateAnmMoService.selectedBenDetails.mctsidNo:this.associateAnmMoService.selectedBenDetails.motherId,
      childId:this.associateAnmMoService.selectedBenDetails.mctsidNoChildId?this.associateAnmMoService.selectedBenDetails.mctsidNoChildId:null,
      userId: this.sessionstorage.getItem('userID'),
      agentId: this.loginService.agentId,
      role: this.sessionstorage.getItem('role'),
      phoneNo: this.sessionstorage.getItem("benPhoneNo"),
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
      ecdCallType:this.associateAnmMoService.selectedBenDetails.outboundCallType,
      callId: this.sessionstorage.getItem("callId"),
      isOutbound: true,
      beneficiaryRegId: (this.associateAnmMoService.selectedBenDetails.beneficiaryRegId === null) ? this.sessionstorage.getItem("beneficiaryRegId"): this.associateAnmMoService.selectedBenDetails.beneficiaryRegId,
      isFurtherCallRequired: true,
      reasonForNoFurtherCallsId: null,
      reasonForNoFurtherCalls: null,
      isCallVerified: false,
      isCallAnswered: true,
      reasonForCallNotAnsweredId: null,
      reasonForCallNotAnswered:null, 
      isCallDisconnected: true,
      typeOfComplaint: null,
      complaintRemarks: null,
      nextAttemptDate: null,
      callRemarks: null,
      sendAdvice: null,
      altPhoneNo: null,
      isStickyAgentRequired: null,
      isHrp: this.associateAnmMoService.isMother?this.associateAnmMoService.isHighRiskPregnancy:false,
      isHrni: (this.associateAnmMoService.isMother === false)?this.associateAnmMoService.isHighRiskInfant:false,
      deleted: false,
      createdBy: this.sessionstorage.getItem('userName'),
      modifiedBy: this.sessionstorage.getItem('userName'),
      complaintId: null,
      isWrongNumber: false,
      preferredLanguage: null
    };
    const commonReqobj = {
      benCallID: this.associateAnmMoService.callDetailId,
      callID: this.sessionstorage.getItem("callId"),
      remarks: null,
      callTypeID: this.callTypeId,
      emergencyType: 0,
      agentIPAddress: this.sessionstorage.getItem("agentIp"),
      createdBy: this.sessionstorage.getItem('userName'),
      isFollowupRequired: false,
      fitToBlock: false,
      endCall: true,
      agentID: this.loginService.agentId
    }
      console.log(reqObj);
      console.log(commonReqobj)

    // this.openConfirmatoryDialog();
    // this.create.reset(this.createQualityAuditorForm.value);
    this.associateAnmMoService.commonCallClosure(commonReqobj).subscribe((response: any) =>{
      if (response && response.statusCode === 200 && response.data) {
       console.log("First api working")
       this.associateAnmMoService.callClosure(reqObj).subscribe(
        (response: any) => {
          if (response) {
            this.associateAnmMoService.setStopTimer(true);
            this.confirmationService.openDialog(
              this.currentLanguageSet.callClosedSuccessfully,
              'success'
            );
            this.unsubscribeWrapupTime();
            this.sessionstorage.setItem("onCall", "false");
            this.associateAnmMoService.fromComponent = null;
            this.associateAnmMoService.setCallClosure();
            this.resetSessions();
            this.router.navigate(
              ['/associate-anm-mo/agents-innerpage'],
              {
                queryParams: { data: "outBoundWorklist"}
              }
              
            );
            this.associateAnmMoService.setOpenComp("Call Closed");
          } else {
            this.confirmationService.openDialog(response.errorMessage, 'error');
          }
      },
      (err: any) => {
        this.confirmationService.openDialog(err.error, 'error');
      });
    }
    (err: any) => {
      if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
      else
      this.confirmationService.openDialog(err.title + err.detail, 'error')
      }
  });
    }

    getCallTypes() {
      const reqObj={
        providerServiceMapID: this.sessionstorage.getItem('providerServiceMapID')
      }
      this.associateAnmMoService.getCallTypes(reqObj).subscribe(
        (response:any) => {
          if(response && response.statusCode === 200){
            this.callTypes= response.data;  
            for(let i=0; i<this.callTypes.length;i++){
              if(this.callTypes[i].callGroupType === "Wrapup Exceeds"){
                this.callTypeId=this.callTypes[i].callTypeID;
                break;
              }
            }
          }  
        },
         (err: any) => {
          this.confirmationService.openDialog(err, 'error');
        }
       );
    }
    
    resetSessions() {
      sessionStorage.removeItem("benPhoneNo");
      sessionStorage.removeItem("callId");
      sessionStorage.removeItem('beneficiaryRegId');
      this.associateAnmMoService.resetLoadDetailsInReg();
      this.associateAnmMoService.callDetailId = null;
      this.associateAnmMoService.selectedBenDetails = null;
      this.associateAnmMoService.resetCloseCallOnWrapup();
      this.associateAnmMoService.isHighRiskPregnancy = false;
   this.associateAnmMoService.isHighRiskInfant = false;
    }
  


  addListener() {
    const windowEvent:any= window.parent.parent.addEventListener;
    if (windowEvent) {
      console.log("adding message listener");
      this.toRemove = this.listener.bind(this);
      addEventListener("message", this.toRemove, false);
     
    } else {
      console.log("adding onmessage listener");
      
    }
  }



  getAgentState() {
    const reqObj = {"agent_id" : this.loginService.agentId};
    this.ctiService.getAgentState(reqObj).subscribe((response:any) => {
        if (response && response.data && response.data.stateObj.stateName) {
            this.agentStatus = response.data.stateObj.stateName;
            this.associateAnmMoService.setAgentState(this.agentStatus);
        }

    }, (err) => {
       console.log("error");
    });
}

  getAgentIpAddress() {
    const reqObj={
      "agent_id" : this.loginService.agentId
    }
    this.ctiService
    .getAgentIpAddress(reqObj)
    .subscribe(
      (response: any) => {
        if (response && response.statusCode === 200 && response.data) {
          const agentIp = response.data.agent_ip
          this.sessionstorage.setItem('agentIp', agentIp);
        
        } else {
          this.confirmationService.openDialog(response.errorMessage, `info`);
        }
      },
      (err: any) => {
        if(err && err.error)
        this.confirmationService.openDialog(err.error, 'error');
        else
        this.confirmationService.openDialog(err.title + err.detail, 'error')
        });
  }

  agentInnerpageForm = this.fb.group({
  })

  backToDashboard(){
    if(this.sessionstorage.getItem("onCall") === "true") {
      this.confirmationService.openDialog(this.currentLanguageSet.youAreNotAllowedToGoBackToDashboard, 'info')
      
    }
    else {
      this.confirmationService.openDialog(this.currentLanguageSet.areYouSureYouWouldLikeToGoBack, 'confirm')
      .afterClosed().subscribe(res => {
        if(res)
        this.router.navigate(['/dashboard']);
      });
    }

  }

}
