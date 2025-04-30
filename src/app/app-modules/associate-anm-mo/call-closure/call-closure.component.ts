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


import { NgPlural } from '@angular/common';
import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { CtiService } from '../../services/cti/cti.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { SmsTemplateService } from '../../services/smsTemplate/sms-template.service';
import { OutboundWorklistComponent } from '../outbound-worklist/outbound-worklist.component'
import { Router } from '@angular/router';
import { MasterService } from '../../services/masterService/master.service';
import { AgentsInnerpageComponent } from '../agents-innerpage/agents-innerpage.component';
import { SpinnerService } from '../../services/spinnerService/spinner.service';
import { Subscription, map, timer } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { VideoConsultationService } from '../video-consultation/videoService';

@Component({
  selector: 'app-call-closure',
  templateUrl: './call-closure.component.html',
  styleUrls: ['./call-closure.component.css']
})
export class CallClosureComponent implements OnInit, DoCheck, AfterContentChecked, AfterViewInit, OnDestroy {
  selectedRole: any;
  currentLanguageSet: any;
  noCallRequired: any[] = [];
  selectOption: any;
  notAnsweredReason: any[] = [];
  complaints: any[] = [];
  showDetails = false;
  showCallAnswerNoDropdown = false
  showVerifiedFields = false;
  time = new Date();
  barMinimized = true;
  ctiHandlerURL: any;
  public phoneNo: any;
  callTypes:any[]=[];
  callTypeId:any;
  minimumDate:any
  nextAttemptDate:any;
  nextAttemptTime:any;
  isCorrectDateAndTime:any=true;
  showStickyAgent =false;
  disableIVRFeedback = true;
  agentStatus: any = "FREE";
  timerSubscription: Subscription = new Subscription;
  callTimerSubscription: Subscription = new Subscription;
  wrapupTimerSubscription: Subscription = new Subscription;
  isNextAttempt = true;
  callClosureForm: FormGroup = this.fb.group({

    isFurtherCallRequired: [],
    reasonForNoFurtherCallsId: [],
    reasonForNoFurtherCalls: [''],
    isCallAnswered: [''],
    reasonForCallNotAnsweredId: [],
    reasonForCallNotAnswered: [''],
    isCallVerified: [''],
    isCallDisconnected: [''],
    isWrongNumber: [''],
    phoneNumber: [null],
    isStickyAgentRequired: false,
    complaintId: [''],
    typeOfComplaint: [''],
    nextAttemptDate: [''],
    // nextAttemptTime: [''],
    complaintRemarks: [''],
    callRemarks: [''],
    preferredLanguage: [null],
    sendAdvice: [null],
    altPhoneNo: [null, [Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
    iVRFeedbackRequired: false
  }
  );
  isCallVerifiedStatus: any;
  isWrongNumberStatus : any;
  languages: any = [];
  enableCallDisconnectAndFurtherCall= false;
  enableWrongNumber = false;
  enablePreferredLanguage = false;
  enablePhoneNumber = false;
  constructor(
    private setLanguageService: SetLanguageService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    public sanitizer: DomSanitizer,
    private associateAnmMoService: AssociateAnmMoService,
    private ctiService: CtiService,
    private loginService: LoginserviceService,
private sms_service: SmsTemplateService,
    private router: Router,
    private masterService:MasterService,
    readonly sessionstorage:SessionStorageService,
    private spinnerService: SpinnerService,
    public videoService: VideoConsultationService,
    
  ) { 
    
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
  ngOnInit(): void {
     this.minimumDate = new Date();
    console.log(this.minimumDate);
    this.phoneNo = this.sessionstorage.getItem("benPhoneNo");
    const url = ""
    this.ctiHandlerURL = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.selectedRole = this.sessionstorage.getItem('role');
    console.log(this.selectedRole);
    this.getSelectedLanguage();
    this.getReasonsOfNotCallRequired();
    this.getReasonsOfNotCallAnswered();
    this.getComplaints();
    this.getCallTypes();
    this.isStickyAgentValid();
    this.getLanguageMaster();

    this.associateAnmMoService.openCompFlag$.subscribe((responseComp) => {
      if (responseComp !== null && responseComp === "Call Closed") {
        if (this.timerSubscription !== undefined) {
          this.timerSubscription.unsubscribe();
        }
        this.unsubscribeWrapupTime();
        if (this.callTimerSubscription !== undefined) {
          this.callTimerSubscription.unsubscribe();
        }
        this.showDetails=false;
        this.showCallAnswerNoDropdown = false;
        this.showVerifiedFields = false;
        this.disableIVRFeedback = true
        this.barMinimized = true;
        this.isCorrectDateAndTime = true;
        this.enableCallDisconnectAndFurtherCall = false;
        this.enableWrongNumber = false;
        this.enablePhoneNumber = false;
        this.clearPreferredLanguageValidator();
        this.clearIsFurtherCallValidator();
        this.enablePreferredLanguage = false;
        this.callClosureForm.reset();
      }
      
  });

  console.log("Calling Agent State API");
  this.timerSubscription = timer(0, 15000).pipe( 
    map(() => { 
       console.log("Calling Agent State API");
      this.getAgentState();  
    }) 
  ).subscribe(); 


    this.associateAnmMoService.callWrapupFlag$.subscribe((response) => {
      if (response > 0) {
        this.submitCallClosure(this.callClosureForm.value);
      }
    });

  }

  ngOnDestroy() {
    console.log("removing message listener");
    if (this.timerSubscription !== undefined) {
      this.timerSubscription.unsubscribe();
    }
    this.unsubscribeWrapupTime();
    if (this.callTimerSubscription !== undefined) {
      this.callTimerSubscription.unsubscribe();
    }
  }

  unsubscribeWrapupTime() {
    if (this.wrapupTimerSubscription) {
      this.wrapupTimerSubscription.unsubscribe();
    }
  }

  getReasonsOfNotCallRequired() {
    this.masterService.getNoFurtherCallsReason().subscribe(
      (response: any) => {
        if (response) {
          this.noCallRequired = response
        } else {
          this.confirmationService.openDialog(response.errorMessage, 'error');
        }
      },
      (err: any) => {
        if(err && err.error)
        this.confirmationService.openDialog(err.error, 'error');
        else
        this.confirmationService.openDialog(err.title + err.detail, 'error')
        }
    );
  }
  getReasonsOfNotCallAnswered() {
      this.masterService.getReasonsOfNotCallAnswered().subscribe(
        (response: any) => {
          if (response) {
            this.notAnsweredReason = response
          } else {
            this.confirmationService.openDialog(response.errorMessage, 'error');
          }
        },
        (err: any) => {
          if(err && err.error)
          this.confirmationService.openDialog(err.error, 'error');
          else
          this.confirmationService.openDialog(err.title + err.detail, 'error')
          }
      );
    }

  getComplaints() {
    this.masterService.getTypeOfComplaints().subscribe(
      (response: any) => {
        if (response) {
          this.complaints = response
        } else {
          this.confirmationService.openDialog(response.errorMessage, 'error');
        }
      },
      (err: any) => {
        if(err && err.error)
        this.confirmationService.openDialog(err.error, 'error');
        else
        this.confirmationService.openDialog(err.title + err.detail, 'error')
        }
    );
  }
  setNoCallRequired(noFutherCallValue: any) {
    // this.selectedAuditorId = qualitorAuditorTypeValue;
    this.noCallRequired.filter((values) => {
      if (values.id === noFutherCallValue) {
        this.callClosureForm.controls['reasonForNoFurtherCalls'].setValue(
          values.name
        );
      }
    });
  }
  setNoAnswerName(noAnswer: any) {
    // this.selectedAuditorId = qualitorAuditorTypeValue;
    this.notAnsweredReason.filter((values) => {
      if (values.id === noAnswer) {
        this.callClosureForm.controls['reasonForCallNotAnswered'].setValue(
          values.name
        );
      }
    });
  }

  setComplaintName(compalintValue: any) {
    // this.selectedAuditorId = qualitorAuditorTypeValue;
    this.complaints.filter((values) => {
      if (values.id === compalintValue) {
        this.callClosureForm.controls['typeOfComplaint'].setValue(
          values.name
        );
      }
    });
  }
  checkCallVerifiedStatus(formData: any){
    this.isCallVerifiedStatus = undefined;
    if(formData.isCallVerified === undefined || formData.isCallVerified === null || formData.isCallVerified === '' ){
      this.isCallVerifiedStatus = null;
    }
    else{
      if(formData.isCallVerified ==="Yes"){
        this.isCallVerifiedStatus = true;
      }else{
        this.isCallVerifiedStatus = false;
      }
    }
   this.isWrongNumberStatus = undefined;
   if(formData.isWrongNumber === undefined || formData.isWrongNumber === null || formData.isWrongNumber === '' ){
    this.isWrongNumberStatus = null;
  }
  else{
    if(formData.isWrongNumber ==="Yes"){
      this.isWrongNumberStatus = true;
    }else{
      this.isWrongNumberStatus = false;
    }
  }
  }
  
  
  submitCallClosure(formData: any) {
    console.log(formData);
   this.checkCallVerifiedStatus(formData);
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
      beneficiaryRegId: (this.associateAnmMoService.selectedBenDetails.beneficiaryRegId === null) ? this.sessionstorage.getItem('beneficiaryRegId'): this.associateAnmMoService.selectedBenDetails.beneficiaryRegId,
      isFurtherCallRequired: (formData.isFurtherCallRequired==="Yes")?true:false,
      reasonForNoFurtherCallsId: formData.reasonForNoFurtherCallsId,
      reasonForNoFurtherCalls: formData.reasonForNoFurtherCalls,
      isCallVerified: this.isCallVerifiedStatus,
      isCallAnswered: (formData.isCallAnswered==="Yes")?true:false,
      reasonForCallNotAnsweredId: formData.reasonForCallNotAnsweredId,
      reasonForCallNotAnswered: formData.reasonForCallNotAnswered, 
      isCallDisconnected: (formData.isCallDisconnected==="Yes")?true:false,
      isWrongNumber: this.isWrongNumberStatus,
      correctPhoneNumber: formData.phoneNumber,
      typeOfComplaint: (formData.typeOfComplaint !== null && formData.typeOfComplaint !== undefined && formData.typeOfComplaint !== "") ? formData.typeOfComplaint : null,
      complaintRemarks: (formData.complaintRemarks !== null && formData.complaintRemarks !== undefined && formData.complaintRemarks !== "") ? formData.complaintRemarks : null,
      nextAttemptDate: (formData.nextAttemptDate !== null && formData.nextAttemptDate !== undefined && formData.nextAttemptDate !== "") ? formData.nextAttemptDate : null,
      callRemarks: (formData.callRemarks !== null && formData.callRemarks !== undefined && formData.callRemarks !== "") ? formData.callRemarks : null,
      sendAdvice: formData.sendAdvice,
      altPhoneNo: formData.altPhoneNo,
      isStickyAgentRequired: formData.isStickyAgentRequired,
      isHrp: this.associateAnmMoService.isMother?this.associateAnmMoService.isHighRiskPregnancy:false,
      isHrni: (this.associateAnmMoService.isMother === false)?this.associateAnmMoService.isHighRiskInfant:false,
      deleted: false,
      createdBy: this.sessionstorage.getItem('userName'),
      modifiedBy: this.sessionstorage.getItem('userName'),
      complaintId: (formData.complaintId !== null && formData.complaintId !== undefined && formData.complaintId !== "") ? formData.complaintId : null,
      preferredLanguage: formData.preferredLanguage
    };
    const commonReqobj = {
      benCallID: this.associateAnmMoService.callDetailId,
      callID: this.sessionstorage.getItem("callId"),
      remarks: formData.callRemarks,
      callTypeID: this.callTypeId,
      emergencyType: 0,
      agentIPAddress: this.sessionstorage.getItem("agentIp"),
      createdBy: this.sessionstorage.getItem('userName'),
      isFollowupRequired: false,
      fitToBlock: false,
      endCall: true,
      agentID: this.loginService.agentId,
      isFeedback:(formData.iVRFeedbackRequired)? formData.iVRFeedbackRequired : false
    }
      console.log(reqObj);
      console.log(commonReqobj)

    // this.openConfirmatoryDialog();
   
    // this.create.reset(this.createQualityAuditorForm.value);
    this.associateAnmMoService.commonCallClosure(commonReqobj).subscribe((response: any) =>{
      this.spinnerService.setLoading(true);
      if (response && response.statusCode === 200 && response.data) {
       console.log("First api working")
       this.associateAnmMoService.callClosure(reqObj).subscribe(
        (response: any) => {
          if (response) {
            console.log("timer yet to stop");
            this.associateAnmMoService.setStopTimer(true);
            console.log("timer stopped");
            this.unsubscribeWrapupTime();
            this.sessionstorage.setItem("onCall", "false");
            this.associateAnmMoService.fromComponent = null;
            this.associateAnmMoService.setCallClosure();
            this.showCallAnswerNoDropdown=false;
            this.showVerifiedFields = false;
            this.showDetails = false;
            this.enableCallDisconnectAndFurtherCall = false;
            this.enableWrongNumber = false;
            this.enablePhoneNumber = false;
            this.clearPreferredLanguageValidator();
            this.clearIsFurtherCallValidator();
            this.enablePreferredLanguage = false;
            this.disableIVRFeedback = true;
            this.resetSessions();
            this.resetForm();
            this.spinnerService.setLoading(false);
            this.router.navigate(
              ['/associate-anm-mo/agents-innerpage']);
            this.associateAnmMoService.setOpenComp("Call Closed");
            this.confirmationService.openDialog(
              this.currentLanguageSet.callClosedSuccessfully,
              'success'
            );
            console.log("Calling Agent State API");
            console.log("Agent Status Observable");
            this.getAgentState();
            console.log("Agent Status Observable");
           
          } else {
            this.spinnerService.setLoading(false);
            this.confirmationService.openDialog(response.errorMessage, 'error');
          }
      },
      (err: any) => {
        this.spinnerService.setLoading(false);
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
  // openConfirmatoryDialog() {
  //   this.confirmationService.openDialog('Call Closure Successfully', `success`);
  // }

  getAgentState() {
    const reqObj = {"agent_id" : this.loginService.agentId};
    this.ctiService.getAgentState(reqObj).subscribe((response:any) => {
        if (response && response.data && response.data.stateObj.stateName) {
            console.log("Agent Status reset");
            this.agentStatus = response.data.stateObj.stateName;
            console.log("Agent Status Observable");
            this.associateAnmMoService.setResetAgentStatus(this.agentStatus);
            console.log("Agent Status reset start");
        }

    }, (err) => {
       console.log("error");
    });
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
   this.associateAnmMoService.autoDialing = false;
  }
  resetForm() {
    this.callClosureForm.reset();
  }
  selectedReasonOfNoFutherCall(value: any) {
    const isDisconnect = this.callClosureForm.controls["isCallDisconnected"].value;
    if (value === 'No') {
      this.showDetails = true
      this.clearPreferredLanguageValidator();
      this.callClosureForm.controls['preferredLanguage'].reset();
      this.enablePreferredLanguage = false;
      this.callClosureForm.controls['reasonForNoFurtherCallsId'].reset();
      this.callClosureForm.controls['reasonForNoFurtherCalls'].reset();
      const reasonForNoFurtherCallsIdControl = this.callClosureForm.get('reasonForNoFurtherCallsId');
      reasonForNoFurtherCallsIdControl?.setValidators([Validators.required]);
      reasonForNoFurtherCallsIdControl?.updateValueAndValidity();
      this.callClosureForm.controls['nextAttemptDate'].reset();
      this.callClosureForm.controls['nextAttemptDate'].disable();
      // this.callClosureForm.addControl('reasonForNoFurtherCallsId', this.fb.control('', Validators.required));
      // this.callClosureForm.addControl('reasonForNoFurtherCalls', this.fb.control('', Validators.required));
    }
    else {
      
      
      
      // this.callClosureForm.removeControl('reasonForNoFurtherCallsId'); 
      // this.callClosureForm.removeControl('reasonForNoFurtherCalls'); 
      this.showDetails = false  
      if(this.selectedRole !== undefined && this.selectedRole !== null && this.selectedRole.toLowerCase() === "associate") {
      const preferredLanguageControl = this.callClosureForm.get('preferredLanguage');
      preferredLanguageControl?.setValidators([Validators.required]);
      preferredLanguageControl?.updateValueAndValidity();
      }
      this.enablePreferredLanguage = true;
      this.callClosureForm.controls['reasonForNoFurtherCallsId'].reset();
      this.callClosureForm.controls['reasonForNoFurtherCalls'].reset();
      this.callClosureForm.controls['reasonForNoFurtherCallsId'].setValue(0);
      this.callClosureForm.controls['reasonForNoFurtherCalls'].setValue('');

      this.clearIsFurtherCallValidator();

      if(isDisconnect === 'Yes') {
        this.callClosureForm.controls['nextAttemptDate'].enable();
      }
    }

  }
  selectNoCallAnswered(value: any) {
    if (value === 'No') {
      this.showCallAnswerNoDropdown = true;
      this.showVerifiedFields = false;
      this.disableIVRFeedback = true;
      this.enableCallDisconnectAndFurtherCall = false;
      this.enableWrongNumber = false;
      this.showDetails = false;
      this.enablePhoneNumber = false;
      this.clearPreferredLanguageValidator();
      this.clearIsFurtherCallValidator();
      this.enablePreferredLanguage = false;
      for(let i=0; i<this.callTypes.length;i++){
        if(this.callTypes[i].callGroupType === "Not Answered"){
          this.callTypeId=this.callTypes[i].callTypeID;
          break;
        }
      }
      console.log(this.callTypeId)
      this.callClosureForm.controls['reasonForCallNotAnsweredId'].reset();
      this.callClosureForm.controls['reasonForCallNotAnswered'].reset();
      this.callClosureForm.controls['iVRFeedbackRequired'].reset();
      this.callClosureForm.controls['isCallVerified'].reset();
      this.callClosureForm.controls['isCallDisconnected'].reset();
      this.callClosureForm.controls['isWrongNumber'].reset();
      this.callClosureForm.controls['nextAttemptDate'].enable();
      this.callClosureForm.controls['isFurtherCallRequired'].reset();
      this.callClosureForm.controls['reasonForNoFurtherCallsId'].reset();
      this.callClosureForm.controls['preferredLanguage'].reset();
      this.callClosureForm.controls['phoneNumber'].reset();

    }
    else {
      this.showCallAnswerNoDropdown = false
      this.disableIVRFeedback = false;
      this.showVerifiedFields = true;
      for(let i=0; i<this.callTypes.length;i++){
        if(this.callTypes[i].callGroupType === "Answered"){
          this.callTypeId=this.callTypes[i].callTypeID;
          break;
        }
       
      }
      console.log(this.callTypeId);
      this.callClosureForm.controls['reasonForCallNotAnsweredId'].reset();
      this.callClosureForm.controls['reasonForCallNotAnswered'].reset();
      this.callClosureForm.controls['reasonForCallNotAnsweredId'].setValue(0);
      this.callClosureForm.controls['reasonForCallNotAnswered'].setValue('');
    }
  }

  back() {
    // this.confirmationService
    //   .openDialog(
    //     "Do you really want to cancel? Any unsaved data would be lost",
    //     'confirm'
    //   )
    //   .afterClosed()
    //   .subscribe((res) => {
    //     if (res) {
    // this.associateAnmMoService.loadComponent(
    //   OutboundWorklistComponent,
    //   null
    // );
    // this.router.navigate(
    //   ['/associate-anm-mo/agents-innerpage'],
    //   {
    //     queryParams: { data: "outBoundWorklist"}
    //   }
      
    // );
  
    // this.associateAnmMoService.setOpenComp("Call Closed");
    
   
    this.associateAnmMoService.setOpenComp(this.associateAnmMoService.fromComponent);
    // this.selectedQuestionnaireList = [];
    // }});
  }

  // openCallClosure(){
  //   this.associateService.loadComponent(
  //     OutboundWorklistComponent,
  //     null
  //   );
  //   }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }
  send_sms(smsAdvice: any, phoneNo: any) {
    let sms_template_id = "";
    let smsTypeID = "";
    const currentServiceID = this.loginService.currentServiceId;
    this.sms_service.getSMStypes(currentServiceID).subscribe(
      (response: any) => {
        if (response !== undefined) {
          if (response.data.length > 0) {
            for (let i = 0; i < response.data.length; i++) {
              if (
                response.data[i].smsType.toLowerCase() ===
                "Advice SMS".toLowerCase()
              ) {
                smsTypeID = response.data[i].smsTypeID;
                break;
              }
            }
          }
        }

        if (smsTypeID !== "") {
          this.sms_service
            .getSMStemplates(
              currentServiceID,
              smsTypeID
            )
            .subscribe(
              (res: any) => {
                if (res !== undefined) {
                  if (res.data.length > 0) {
                    for (let j = 0; j < res.data.length; j++) {
                      if (res.data[j].deleted === false) {
                        sms_template_id = res.data[j].smsTemplateID;
                        break;
                      }
                    }
                  }

                  if (smsTypeID !== "") {
                    const reqObj = {
                      sms_Advice: smsAdvice,
                      phoneNo: phoneNo,
                      // beneficiaryRegID: generated_ben_id,
                      createdBy: this.sessionstorage.getItem('userName'),
                      is1097: false,
                      providerServiceMapID: this.sessionstorage.getItem('providerServiceMapID'),
                      smsTemplateID: sms_template_id,
                      smsTemplateTypeID: smsTypeID
                    };

                    const arr = [];
                    arr.push(reqObj);

                    this.sms_service.sendSMS(arr).subscribe(
                      (ressponse: any) => {
                        console.log(ressponse, "SMS Sent");
                        alert(this.currentLanguageSet.smsSent);
                      },
                      err => {
                        console.log(err, "SMS not sent Error");
                        alert(this.currentLanguageSet.smsNotSent);
                      }
                    );
                  }
                }
              },
              err => {
                console.log(err, "Error in fetching sms templates");
              }
            );
        }
      },
      err => {
        console.log(err, "error while fetching sms types");
      }
    );

  }

  sendSms(sendAdvice: any, mobile_number: any) {
    let userMobileNumber;
    console.log(sendAdvice);
    console.log(mobile_number);
    if (
      mobile_number === undefined || mobile_number === "" || mobile_number === null
    ) {
      // mobile no is undefined or null
      console.log("Registered number will be used"); // Registered number will be used
      // ** code to send SMS **
      userMobileNumber = this.phoneNo
    }

    else if (

      mobile_number !== undefined || mobile_number !== "" || mobile_number !== null
    ) {
      // ** code to send SMS **
      userMobileNumber = mobile_number
    }

    this.send_sms(sendAdvice, userMobileNumber)

      }
  toggleBar() {
    if (this.barMinimized) this.barMinimized = false;
    else this.barMinimized = true;
  }
  keyPress(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  getCallTypes() {
    const reqObj={
      providerServiceMapID: this.sessionstorage.getItem('providerServiceMapID')
    }
    this.associateAnmMoService.getCallTypes(reqObj).subscribe(
      (response:any) => {
        if(response && response.statusCode === 200){
          this.callTypes= response.data;  
        }  
      },
       (err: any) => {
        this.confirmationService.openDialog(err, 'error');
      }
     );
  }
  CheckFutureTime(){
    const nextAttemptDate=this.callClosureForm.controls['nextAttemptDate'].value;
    const currentTime:any = new Date().getTime();//current time
    const currentDate = new Date();//cureent date
    const FullCurrentDate=currentDate.getUTCMonth() + 1 + "/" + currentDate.getUTCDate() + "/" + currentDate.getUTCFullYear()
    this.nextAttemptTime=new Date(nextAttemptDate).getTime();//selected time
    this.nextAttemptDate=new Date(nextAttemptDate);//selectedDate
    const FullnextAttemptDate=this.nextAttemptDate.getUTCMonth() + 1 + "/" + this.nextAttemptDate.getDate() + "/" + this.nextAttemptDate.getUTCFullYear()
    if(FullCurrentDate === FullnextAttemptDate && this.nextAttemptTime<=currentTime){
      this.confirmationService.openDialog(this.currentLanguageSet.pleaseSelectFutureDateTime, 'error');
      this.isCorrectDateAndTime=false
    }
    else{
      this.isCorrectDateAndTime=true
    }
  }
  isStickyAgentValid(){
    if((this.selectedRole === 'ANM' && this.associateAnmMoService.isHighRiskPregnancy === false) ||(this.selectedRole === 'ANM' && this.associateAnmMoService.isHighRiskInfant === false)){
      this.showStickyAgent=true;
    }
    else if((this.selectedRole === 'MO' && this.associateAnmMoService.isHighRiskPregnancy === true) ||(this.selectedRole === 'MO' && this.associateAnmMoService.isHighRiskInfant === true)){
      this.showStickyAgent=true;
    }
    else{
      this.showStickyAgent=false;
    }

  }

  onCallverified(callVerified:string) {
    this.callClosureForm.controls['isCallDisconnected'].reset();
    this.callClosureForm.controls['isWrongNumber'].reset();
    this.callClosureForm.controls['isFurtherCallRequired'].reset();
    this.callClosureForm.controls['reasonForNoFurtherCallsId'].reset();
    this.callClosureForm.controls['nextAttemptDate'].enable();
    this.callClosureForm.controls['preferredLanguage'].reset();
    this.callClosureForm.controls['phoneNumber'].reset();
    this.showDetails = false;
    this.enablePhoneNumber = false;
    this.clearPreferredLanguageValidator();
    this.clearIsFurtherCallValidator();
    this.enablePreferredLanguage = false;
    if(callVerified === "Yes") {
      this.enableCallDisconnectAndFurtherCall = true;
      this.enableWrongNumber = false;
    }
    else {
      this.enableCallDisconnectAndFurtherCall = false;
      this.enableWrongNumber = true;
    }


  }

  checkIsNextAttempt(callDisconnected:string ){
   const isFurtherCall = this.callClosureForm.controls["isFurtherCallRequired"].value;
   if(callDisconnected === "No"){
    this.callClosureForm.controls['nextAttemptDate'].disable();
    this.callClosureForm.controls['nextAttemptDate'].reset();
   }
   else if(isFurtherCall === "Yes") {
    this.callClosureForm.controls['nextAttemptDate'].enable();
    this.isNextAttempt = true;
    }
   
  }

  onWrongNumberChange(wrongNumber:string ){
  
    this.callClosureForm.controls['phoneNumber'].reset();
    if(wrongNumber === "No"){
     this.enablePhoneNumber = false;
    }
    else {
      this.enablePhoneNumber = true;
     }
    
   }

  getLanguageMaster(){
    let agentLanguages: any[] = [];
    if(this.selectedRole !== undefined && this.selectedRole !== null && (this.selectedRole.toLowerCase() === "associate" || this.selectedRole.toLowerCase() === "anm")) {
    const userId = this.sessionstorage.getItem('userID');
    this.masterService.getLanguageMasterByUserId(userId).subscribe((response: any) => {
      if(response && response.length > 0){
        this.languages = response;
        agentLanguages = response;
      }else {
        this.confirmationService.openDialog(this.currentLanguageSet.noLanguagesFound, 'error');
      }
    },
    (err: any) => {
      this.confirmationService.openDialog(err.error, 'error');
    }
    );
  }
  if(this.selectedRole !== undefined && this.selectedRole !== null && this.selectedRole.toLowerCase() === "anm") {
    this.masterService.getLanguageMaster().subscribe((response: any) => {
      if(response && response.length > 0){
        this.languages = [];
        this.languages = response.filter(
          (lang: any) => !agentLanguages.some(agentLang => agentLang.languageName?.toLowerCase() === lang.languageName?.toLowerCase())
         );
      }else {
        this.confirmationService.openDialog(this.currentLanguageSet.noLanguagesFound, 'error');
      }
    },
    (err: any) => {
      this.confirmationService.openDialog(err.error, 'error');
    }
    );
  }
  }

  clearPhoneNoValidator() {
    const phoneNumberontrol = this.callClosureForm.get('phoneNumber');
    phoneNumberontrol?.clearValidators();
    phoneNumberontrol?.updateValueAndValidity();
  }

  clearPreferredLanguageValidator() {
    const preferredLanguageControl = this.callClosureForm.get('preferredLanguage');
    preferredLanguageControl?.clearValidators();
    preferredLanguageControl?.updateValueAndValidity();
  }

  clearIsFurtherCallValidator() {
    const reasonForNoFurtherCallsIdControl = this.callClosureForm.get('reasonForNoFurtherCallsId');
    reasonForNoFurtherCallsIdControl?.clearValidators();
    reasonForNoFurtherCallsIdControl?.updateValueAndValidity();
  }
}
export interface gradeMapping {
  reasonForNoFurtherCallsId: number;
  reasonForNoFurtherCalls: string;
  reasonOfCallNotRequired: any
}