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


import { E } from '@angular/cdk/keycodes';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatStepper } from '@angular/material/stepper';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { MasterService } from '../../services/masterService/master.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { BeneficiaryCallHistoryComponent } from '../beneficiary-call-history/beneficiary-call-history.component';
import { CallClosureComponent } from '../call-closure/call-closure.component';
import { HighRiskReasonsComponent } from '../high-risk-reasons/high-risk-reasons.component';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { VideoConsultationService } from '../video-consultation/videoService';


@Component({
  selector: 'app-ecd-questionnaire',
  templateUrl: './ecd-questionnaire.component.html',
  styleUrls: ['./ecd-questionnaire.component.css']
})
export class EcdQuestionnaireComponent implements OnInit, AfterViewInit {
  @ViewChild("stepper") private myStepper!: MatStepper;
  
  currentLanguageSet: any;
  isEditable = false;
  filteredQuesData: any=[];
  inputField: any;
  formCompleted = false;
  formData: any = {};
  stepValidity: boolean[] = [];
  validateAnswer = false;
  hrpMasterData: any = [];
  hrniMasterData: any = [];
  hrniReasons: any;
  enableCongentialAnomalies = false;
  enableOtherHrni = false;
  congentialAnomaliesData: any = [];
  enableOtherCongential = false;
  enableProbableCauseDefect = false;
  probableDefectCause: any;
  otherCongentialAnomalie: any;
  congentialAnomaliesReasons: any;
  enableHrniReasons = false;
  otherHrniReason: any;
  enableHrpReasons = false;
  enableHrpReason = false;
  hrpReasons: any;
  otherHrPReason: any;
  enableOtherHrp = false;
  motherId: any;
  childId: any;
  role: any;
  enableChildForm = false;
  showstepper = false;
  benData: any;
  disableFields: any = true;
  formattedDOB = '';
  formattedLMP = '';
  formattedEDD = '';

  constructor(
    private setLanguageService: SetLanguageService,
    private fb: FormBuilder,
    private elementRef: ElementRef,
    public associateAnmMoService: AssociateAnmMoService,
    private confirmationService: ConfirmationService,
    public dialog: MatDialog,
    private masterService: MasterService,
    private changeDetectorRefs: ChangeDetectorRef,
    readonly sessionstorage:SessionStorageService,
    public videoService: VideoConsultationService,    
  ) { }

  beneficiaryMotherDataForm = this.fb.group({
    motherId: [''],
    motherName:[''],
    husbandName:[''],
    districtName:[''],
    healthBlock: [''],
    phcName:[''],
    subFacility: [''],
    villageName:[''],
    address:[''],
    whomPhoneNo:[''],
    phoneNoOfWhom:[''],
    alternatePhoneNo:[''],
    ashaName:[''],
    ashaPhoneNo:[''],
    anmName:[''],
    anmPhoneNo:[''],
    lmpDate:[''],
    edd:[''],
    age: ['']
  });

  beneficiaryChildDataForm = this.fb.group({
    childId: [''],
    motherId: [''],
    childName:[''],
    motherName:[''],
    fatherName:[''],
    gender:[''],
    districtName:[''],
    healthBlock: [''],
    phcName:[''],
    subFacility: [''],
    villageName:[''],
    address:[''],
    phoneNo:[''],
    phoneNoOf:[''],
    alternatePhoneNo:[''],
    ashaName:[''],
    ashaPhoneNo:[''],
    anmName:[''],
    anmPhoneNo:[''],
    dob:[''],
  });

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.role = this.sessionstorage.getItem('role')
  
    this.videoService.isMeetAvailable = true;

    if (this.videoService.callStatus === 'Ongoing' && this.videoService.meetLink) {
      this.videoService.isMeetAvailable = true;
    }
    
    this.associateAnmMoService.loadEcdQuestionnaireData$.subscribe(res => {

      if(res === true){
        if(this.associateAnmMoService.selectedBenDetails){
          this.benData = this.associateAnmMoService.selectedBenDetails;
          if(this.benData.mctsidNoChildId && this.benData.dob){
            this.childId = this.benData.mctsidNoChildId;
            this.beneficiaryChildDataForm.patchValue(this.benData);

            this.formattedDOB = new Date(this.benData.dob).toLocaleDateString('en-CA');
            this.beneficiaryChildDataForm.patchValue({
              childId: this.benData.mctsidNoChildId,
              dob: this.formattedDOB
            });
            this.enableChildForm = true;
          } else{
            this.motherId = this.benData.mctsidNo;
            this.beneficiaryMotherDataForm.patchValue(this.benData);
            this.beneficiaryMotherDataForm.patchValue({
              motherName: (this.benData.motherName !== null && this.benData.motherName !== undefined && this.benData.motherName !== "") ? this.benData.motherName : this.benData.name,
              motherId: this.benData.mctsidNo
            });
            this.formattedLMP = new Date(this.benData.lmpDate).toLocaleDateString('en-CA');
            this.beneficiaryMotherDataForm.patchValue({
              lmpDate: this.formattedLMP
            });
            this.formattedEDD = new Date(this.benData.edd).toLocaleDateString('en-CA');
            this.beneficiaryMotherDataForm.patchValue({
              edd: this.formattedEDD
            });
            this.enableChildForm = false;
          }
        } 
      this.getEcdQuestionaire();
      }
    });
    // this.getHrpMaster();
    // this.getHrniMaster();
    // this.getCongentialAnomaliesMaster();
    this.associateAnmMoService.openCompFlag$.subscribe((responseComp) => {
    
      if (responseComp !== null && responseComp === "Call Closed") {
        this.filteredQuesData = [];
        this.enableHrpReasons = false;
        this.enableOtherHrp = false;
        this.hrpReasons = [];
        this.otherHrPReason = null;
        this.enableHrniReasons = false;
        this.enableCongentialAnomalies = false;
        this.enableOtherHrni = false;
        this.enableOtherCongential = false;
        this.enableProbableCauseDefect = false;
        this.otherHrniReason = false;
        this.hrniReasons = [];
        this.otherHrniReason = null;
        this.congentialAnomaliesReasons = null;
        this.otherCongentialAnomalie = null;
        this.probableDefectCause = null;
        this.validateAnswer = false;
        this.step = 0;
        this.page = 0;
        this.myStepper.selectedIndex = 0;
      } 
    });

  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

   // Max number of steps to show at a time in view, Change this to fit your need
   MAX_STEP = 3;
   // Total steps included in mat-stepper in template, Change this to fit your need
   totalSteps = 0;
   // Current page from paginator
   page = 0;
   // Current active step in mat-stepper
   step = 0;
   // Min index of step to show in view
   minStepAllowed = 0;
   // Max index of step to show in view
   maxStepAllowed = this.MAX_STEP - 1;
   // Number of total possible pages
   totalPages = Math.ceil(this.totalSteps / this.MAX_STEP);

 
   ngAfterViewInit() {
     this.rerender();
   }
 
   /**
    * Change the page in view
    */
   pageChangeLogic(isForward = true) {
     if (this.step < this.minStepAllowed || this.step > this.maxStepAllowed) {
       if (isForward) {
         this.page++;
       } else {
         this.page--;
       }
       this.changeMinMaxSteps(isForward);
     }
   }
 
   /**
    * This will change min max steps allowed at any time in view
    */
   changeMinMaxSteps(isForward: boolean) {
     const pageMultiple = this.page * this.MAX_STEP;
 
     // maxStepAllowed will be the least value between minStep + MAX_STEP and total steps
     // minStepAllowed will be the least value between pageMultiple and maxStep - MAX_STEP
     if (pageMultiple + this.MAX_STEP - 1 <= this.totalSteps - 1) {
       this.maxStepAllowed = pageMultiple + this.MAX_STEP - 1;
       this.minStepAllowed = pageMultiple;
     } else {
       this.maxStepAllowed = this.totalSteps - 1;
       this.minStepAllowed = this.maxStepAllowed - this.MAX_STEP + 1;
     }
 
     // This will set the next step into view after clicking on back / next paginator arrows
     if (this.step < this.minStepAllowed || this.step > this.maxStepAllowed) {
       if (isForward) {
         this.step = this.minStepAllowed;
       } else {
         this.step = this.maxStepAllowed;
       }
       this.myStepper.selectedIndex = this.step;
     }
 
     console.log(
       `page: ${this.page + 1}, step: ${this.step + 1}, minStepAllowed: ${this
         .minStepAllowed + 1}, maxStepAllowed: ${this.maxStepAllowed + 1}`
     );
     this.rerender();
   }
 
   /**
    * Function to go back a page from the current step
    */
   paginatorBack() {
     this.page--;
    this.changeMinMaxSteps(false);
   }
 
   /**
    * Function to go next a page from the current step
    */
   paginatorNext() {
     this.page++;
     this.changeMinMaxSteps(true);
   }
 
   /**
    * Function to go back from the current step
    */
   goBack() {
     if (this.step > 0) {
       this.step--;
       this.myStepper.previous();
       this.pageChangeLogic(false);
     }
   }
 
   /**
    * Function to go forward from the current step
    */
   goForward(step: any) {
     if(this.isStepValid(step)){
     if (this.step < this.totalSteps - 1) {
       this.step++;
       this.myStepper.next();
       this.pageChangeLogic(true);
       this.validateAnswer = false;
      }
     } else {
       this.validateAnswer = true;
     }
   }
 
   /**
    * This will display the steps in DOM based on the min max step indexes allowed in view
    */
   private rerender() {
     const headers = this.elementRef.nativeElement.querySelectorAll(
       "mat-step-header"
     );
 
     const lines = this.elementRef.nativeElement.querySelectorAll(
       ".mat-stepper-horizontal-line"
     );
 
     // If the step index is in between min and max allowed indexes, display it into view, otherwise set as none
     for (const h of headers) {
      //  let str = h.getAttribute("ng-reflect-index");
      const str = h.getAttribute("aria-posinset");
      const intStr = parseInt(str) - 1;
       if (
         str !== null &&
         intStr >= this.minStepAllowed &&
         intStr <= this.maxStepAllowed
       ) {
        //  console.log("taking str:", str, "parse str:", intStr)
        //  console.log("working steps:", this.minStepAllowed, this.maxStepAllowed, h)
         h.style.display = "flex";
       } else {
        // console.log("not taking str:", str, "parse str:", intStr)
        h.style.display = "none";
        // console.log("not working steps:", this.minStepAllowed, this.maxStepAllowed, h)
       }
     }
 
     // If the line index is between min and max allowed indexes, display it in view, otherwise set as none
     // One thing to note here: length of lines is 1 less than length of headers
     // For eg, if there are 8 steps, there will be 7 lines joining those 8 steps
     for (const [index, l] of lines.entries()) {
       if (index >= this.minStepAllowed && index < this.maxStepAllowed) {
         l.style.display = "block";
       } else {
         l.style.display = "none";
       }
     }
   }

   onStepSelected(event: any) {
    const currentStepIndex = this.myStepper.selectedIndex;
    
    if (event.selectedIndex !== currentStepIndex) {
      this.myStepper.selectedIndex = currentStepIndex;
    }
  }
 
   stepSelectionChange(event: StepperSelectionEvent) {
    // const currentStepIndex = this.myStepper.selectedIndex;
    // if(event.selectedIndex !== currentStepIndex){
    //   this.step = currentStepIndex;
    // }
     this.step = event.selectedIndex;
     console.log(
       " $event.selectedIndex: " +
         event.selectedIndex +
         "; Stepper.selectedIndex: " +
         this.myStepper.selectedIndex
     );
   }

   openBenHistory(){
    this.associateAnmMoService.setOpenComp("Beneficiary Call History");
    this.associateAnmMoService.setBenHistoryComp(true);
    // this.associateAnmMoService.loadComponent(BeneficiaryCallHistoryComponent,null)
   }

  //  getHrpMaster(){
  //    this.masterService.getHrpReasons().subscribe((res: any) => {
  //     if(res && res.length > 0){
  //        this.hrpMasterData = res;
  //      }else {
  //        this.confirmationService.openDialog(res.errorMessage, 'error');
  //      }
  //    }, (err : any) => {
  //     if(err && err.error)
  //     this.confirmationService.openDialog(err.error, 'error');
  //     else
  //     this.confirmationService.openDialog(err.title + err.detail, 'error')
  //     });
  //  }

  //  getHrniMaster(){
  //   this.masterService.getHniReasons().subscribe((res: any) => {
  //    if(res && res.length > 0){
  //       this.hrniMasterData = res;
  //     }else {
  //       this.confirmationService.openDialog(res.errorMessage, 'error');
  //     }
  //   }, (err : any) => {
  //    if(err && err.error)
  //    this.confirmationService.openDialog(err.error, 'error');
  //    else
  //    this.confirmationService.openDialog(err.title + err.detail, 'error')
  //    });
  // }

  // getCongentialAnomaliesMaster(){
  //   this.masterService.getContentialAnomaliesReasons().subscribe((res: any) => {
  //    if(res && res.length > 0){
  //       this.congentialAnomaliesData = res;
  //     }else {
  //       this.confirmationService.openDialog(res.errorMessage, 'error');
  //     }
  //   }, (err : any) => {
  //    if(err && err.error)
  //    this.confirmationService.openDialog(err.error, 'error');
  //    else
  //    this.confirmationService.openDialog(err.title + err.detail, 'error')
  //    });
  // }

   getEcdQuestionaire(){
     const psmId = this.sessionstorage.getItem('providerServiceMapID');
     const callType = this.benData.outboundCallType;
     const role = this.sessionstorage.getItem('role');
     this.associateAnmMoService.fetchBeneficiaryQuestionnaire( psmId,callType,role).subscribe((res: any) => {
       if(res && res.length > 0){
         this.filterEcdQuestionnaire(res);
         this.refresh()
         console.log(this.filteredQuesData.length);
         for (let i = 0; i < this.filteredQuesData.length; i++) {
           this.stepValidity.push(false);
         }
       }
    //    else {
    //      this.confirmationService.openDialog(res.errorMessage, 'error')
    //    }
    //  },(err : any) => {
    //   if(err && err.error)
    //   this.confirmationService.openDialog(err.error, 'error');
    //   else
    //   this.confirmationService.openDialog(err.title + err.detail, 'error')
      });
      this.associateAnmMoService.onClickOfEcdQuestionnaire(false);
  }

  // filterEcdQuestionnaire(res: any){
  //   this.filteredQuesData = res.reduce((acc: { sectionId: number; sectionName: string; sectionRank: number; questionnaires: any[] }[], curr: any) => {
  //     const existingSection = acc.find(section => section.sectionRank === curr.callSectionRank);
  
  //     if (existingSection) {
  //       existingSection.questionnaires.push(curr);
  //     } else {
  //       acc.push({
  //         sectionId: curr.sectionid,
  //         sectionName: curr.sectionName,
  //         sectionRank: curr.callSectionRank,
  //         questionnaires: [{...curr, answer: null}]
  //       });
  //     }
  
  //     return acc;
  //     }, []).sort((a: { sectionRank: number; }, b: { sectionRank: number; }) => a.sectionRank - b.sectionRank)
  //     .map((section: any) => ({
  //       ...section,
  //       questionnaires: section.questionnaires.sort((a: { sectionQuestionRank: number; }, b: { sectionQuestionRank: number; }) => a.sectionQuestionRank - b.sectionQuestionRank)
  //     }));
  //     console.log("filtered data", this.filteredQuesData);
  //     // if(this.benData.outboundCallType.toLowerCase() === "introductory"){
  //     //   this.filterHrpHrniQuesForIntroductoryCall();
  //     // }
  // }

  filterEcdQuestionnaire(res: any) {
    this.filteredQuesData = res.reduce((acc: { sectionId: number; sectionName: string; sectionRank: number; questionnaires: any[] }[], curr: any) => {
        const existingSection = acc.find(section => section.sectionRank === curr.callSectionRank);
        if (existingSection) {
            existingSection.questionnaires.push({...curr, answer: null, enabledQues: this.isQuestionEnabled(curr)});
        } else {
            acc.push({
                sectionId: curr.sectionid,
                sectionName: curr.sectionName,
                sectionRank: curr.callSectionRank,
                questionnaires: [{...curr, answer: null, enabledQues: this.isQuestionEnabled(curr)}]
            });
        }
        return acc;
    }, []).sort((a: { sectionRank: number; }, b: { sectionRank: number; }) => a.sectionRank - b.sectionRank)
      .map((section: any) => ({
        ...section,
        questionnaires: section.questionnaires.sort((a: { sectionQuestionRank: number; }, b: { sectionQuestionRank: number; }) => a.sectionQuestionRank - b.sectionQuestionRank)
    }));
    console.log("filtered data", this.filteredQuesData);
     if(this.benData.outboundCallType.toLowerCase() === "introductory"){
         this.filterHrpHrniQuesForIntroductoryCall();
       }
  }

    isQuestionEnabled(question: any) {
      const arr : any= [];
        if (question.parentQuestionId !== undefined && question.parentQuestionId !== null && question.parentQuestionId.length > 0
            && question.parentAnswer !== undefined && question.parentAnswer !== null && question.parentAnswer.length > 0 ) {
            return arr;
        } else {
          arr.push("Parent Ques")
        return arr;
        }
    }

    processFilteredQuestionnaires(selectedAnsweredQues: any) {
      console.log('Processing questionnaires:', selectedAnsweredQues);
      this.filteredQuesData.forEach((section: any) => {
        section.questionnaires.forEach((questionnaire: any) => {
          if (selectedAnsweredQues.answerType !== null && selectedAnsweredQues.answerType !== undefined &&
            (selectedAnsweredQues.answerType.toLowerCase() === "radio" || selectedAnsweredQues.answerType.toLowerCase() === "dropdown")) {
            if(questionnaire.parentQuestionId !== null && questionnaire.parentQuestionId.includes(selectedAnsweredQues.questionid) &&
              selectedAnsweredQues.answer !== null){ //&& questionnaire.parentAnswer.includes(selectedAnsweredQues.answer)) {
                questionnaire.parentAnswer.forEach((answer: any) => {
                  if(answer.parentQuesId === selectedAnsweredQues.questionid){
                    if(answer.parentAnswerList.includes(selectedAnsweredQues.answer)){
                      if(!questionnaire.enabledQues.includes(answer.parentQuesId) ){
                    questionnaire.enabledQues.push(answer.parentQuesId);
                      }
                    } else {
                      const indexToRemove = questionnaire.enabledQues.indexOf(answer.parentQuesId);
                      if (indexToRemove !== -1) { 
                        questionnaire.enabledQues.splice(indexToRemove, 1);
                        if(questionnaire.enabledQues.length <= 0){
                          questionnaire.answer = null;
                        }
                        this.processFilteredQuestionnaires(questionnaire);
                      }                    
                    }
                }
                })
              
            } else if(questionnaire.parentQuestionId !== null && questionnaire.parentQuestionId.includes(selectedAnsweredQues.questionid) &&
                        selectedAnsweredQues.answer === null){ // || !questionnaire.parentAnswer.includes(selectedAnsweredQues.answer) )) {
                          questionnaire.parentAnswer.forEach((answer: any) => {
                        const indexToRemove = questionnaire.enabledQues.indexOf(answer.parentQuesId);
                          if (indexToRemove !== -1) { 
                            questionnaire.enabledQues.splice(indexToRemove, 1);
                            if(questionnaire.enabledQues.length <= 0){
                              questionnaire.answer = null;
                          this.processFilteredQuestionnaires(questionnaire);
              }
            }
          });
            }
          } else if (selectedAnsweredQues.answerType !== null && selectedAnsweredQues.answerType !== undefined &&
            selectedAnsweredQues.answerType.toLowerCase() === "multiple") {
              if(questionnaire.parentQuestionId !== null && questionnaire.parentQuestionId.includes(selectedAnsweredQues.questionid) &&
                selectedAnsweredQues.answer !== null){ // && selectedAnsweredQues.answer.includes(questionnaire.parentAnswer)) {
                  questionnaire.parentAnswer.forEach((answer: any) => {
                    if(answer.parentQuesId === selectedAnsweredQues.questionid) 
                    if (answer.parentAnswerList.some((item: any) => selectedAnsweredQues.answer.includes(item))) {
                      console.log("Condition passed: at least one item in answer.parentAnswerList matches selectedAnsweredQues.answer");                
                      if(!questionnaire.enabledQues.includes(answer.parentQuesId) ){
                        questionnaire.enabledQues.push(answer.parentQuesId);
                          }
                        } else {
                          const indexToRemove = questionnaire.enabledQues.indexOf(answer.parentQuesId);
                          if (indexToRemove !== -1) { 
                            questionnaire.enabledQues.splice(indexToRemove, 1);
                            if(questionnaire.enabledQues.length <= 0){
                              questionnaire.answer = null;
                            }
                            this.processFilteredQuestionnaires(questionnaire);
                          }                    
                        }
                  });
              } 
            else if(questionnaire.parentQuestionId !== null && questionnaire.parentQuestionId.includes(selectedAnsweredQues.questionid) && 
                        (selectedAnsweredQues.answer === null)){ //|| !selectedAnsweredQues.answer.includes(questionnaire.parentAnswer))) {
                          questionnaire.parentAnswer.forEach((answer: any) => {
                          const indexToRemove = questionnaire.enabledQues.indexOf(answer.parentQuesId);
                          if (indexToRemove !== -1) { 
                            questionnaire.enabledQues.splice(indexToRemove, 1);
                            if(questionnaire.enabledQues.length <= 0){
                              questionnaire.answer = null;
                          this.processFilteredQuestionnaires(questionnaire);
              }
          }
        });
        }
      }
        });
      });
    }

    // Trigger change detection for data source to identify it 
    refresh(){
      this.changeDetectorRefs.detectChanges();
      this.totalSteps = this.filteredQuesData.length;
      this.changeMinMaxSteps(false);
    }

    // filter ques and splice object in the array
    filterHrpHrniQuesForIntroductoryCall(){
      this.filteredQuesData.forEach((section: any, j: number) => {
        section.questionnaires.forEach((question: any, i: number) => {
          if(this.enableChildForm && (question.question.toLowerCase().includes('is hrp')  || question.question.toLowerCase().includes('high risk pregnancy'))){
            this.filteredQuesData[j].questionnaires.splice(i, 1);
          } else if(!this.enableChildForm && (question.question.toLowerCase().includes('is hrni') || question.question.toLowerCase().includes('high risk newborn') 
          || question.question.toLowerCase().includes('high risk infant'))){
            this.filteredQuesData[j].questionnaires.splice(i, 1);
          }
        });
      });
    }

  isStepValid(stepIndex: number): boolean {
      const step = this.filteredQuesData[stepIndex];
      for (const question of step.questionnaires) {
        if (question && question.questionType === 'Question') {
          // if (question.enabledQues !== false && (question.answer === null || question.answer === '' || question.answer === undefined)) {
            if (question.enabledQues.length > 0 && (question.answer === null || question.answer === '' || question.answer === undefined)) {
            return false; 
          }
        }
      }
      return true; 
  }

  isFormValid(): boolean {
    for (let i = 0; i < this.filteredQuesData.length; i++) {
      if (!this.isStepValid(i)) {
        return false;
      }
    }
    return true;
  }
  

  goToClosure(){
    this.confirmationService
    .openDialog(
      this.currentLanguageSet.doYouWantToCloseTheCall,
      'confirm'
    )
    .afterClosed()
    .subscribe((response) => {
      if(response){
        this.associateAnmMoService.fromComponent = "ECD Questionnaire";
        this.associateAnmMoService.setOpenComp("Call Closure");
      }

    });
   
    // this.associateAnmMoService.loadComponent(CallClosureComponent, null)
  }

  getHRPReasons(){
    this.dialog.open(HighRiskReasonsComponent, {
      data: {
        motherId:this.motherId, //223406825640372000,
        childId: this.childId //53063813493560
      }
    });
  }

  // checkIsHrp(value: any){
  //   if(value.toLowerCase() === "yes")
  //   this.enableHrpReasons = true;
  //   else {
  //     this.enableHrpReasons = false;
  //     this.enableOtherHrp = false;
  //     this.hrpReasons = null;
  //     this.otherHrPReason = null;
  //     }
  //   }

  // checkHrpReasons(hrpReasons: any){
  //   if(hrpReasons.includes("Other"))
  //   this.enableOtherHrp = true;
  //   else {
  //     this.enableOtherHrp = false;
  //     this.otherHrPReason = null;
  //   }
    
  // }

  // checkHrniReasons(hrniReasons: any){
  //   if(hrniReasons.includes("Newborn with Congenital Anomalies"))
  //   this.enableCongentialAnomalies = true;
  //   else {
  //   this.enableCongentialAnomalies = false;
  //   this.enableOtherCongential = false;
  //   this.enableProbableCauseDefect = false;
  //   this.congentialAnomaliesReasons = null;
  //   this.otherCongentialAnomalie = null;
  //   this.probableDefectCause = null;
  //   }

  //   if(hrniReasons.includes("Other"))
  //   this.enableOtherHrni = true;
  //   else {
  //   this.enableOtherHrni = false;
  //   this.otherHrniReason = null;
  //   }
  // }

  // checkCongentialAnomaliesReasons(congentialAnomaliesReasons: any){
  //   if(congentialAnomaliesReasons.includes("Others"))
  //   this.enableOtherCongential = true;
  //   else {
  //   this.enableOtherCongential = false;
  //   this.otherCongentialAnomalie = null;
  //   }
  //   if(congentialAnomaliesReasons.includes("Possible Cause of defect"))
  //   this.enableProbableCauseDefect = true;
  //   else {
  //   this.enableProbableCauseDefect = false;
  //   this.probableDefectCause = null;
  //   }
  // }

  // checkIsHrni(value: any){
  //   if(value.toLowerCase() === "yes")
  //   this.enableHrniReasons = true;
  //   else {
  //   this.enableHrniReasons = false;
  //   this.enableCongentialAnomalies = false;
  //   this.enableOtherHrni = false;
  //   this.enableOtherCongential = false;
  //   this.enableProbableCauseDefect = false;
  //   this.otherHrniReason = false;
  //   this.hrniReasons = null;
  //   this.otherHrniReason = null;
  //   this.congentialAnomaliesReasons = null;
  //   this.otherCongentialAnomalie = null;
  //   this.probableDefectCause = null;
  //   }

  // }

  saveQuestionnaire(){
    if(!this.isFormValid()){
      this.confirmationService.openDialog(this.currentLanguageSet.pleaseFillAllTheQuestions, "error");
      this.validateAnswer = true;
    } else {
      this.validateAnswer = false;
    const saveQuestionsData: any = [];
    let arr: any = [];
    this.filteredQuesData.forEach((element: any) => {
      if(element.questionnaires){
      element.questionnaires.forEach((item: any) => {
        if(item.questionType.toLowerCase() === "question"){
          if(item.question.toLowerCase().includes('is hrp')  || item.question.toLowerCase().includes('high risk pregnancy')) { 
            // arr = {
            //   sectionId: item.sectionid,
            //   questionId: item.questionid,
            //   question: item.question,
            //   answer: (item.answer !== null && item.answer !== "") ? item.answer : null,
            //   reasonsForHrp: this.hrpReasons,
            //   otherHrpReason: (this.otherHrPReason !== null && this.otherHrPReason !== "") ? this.otherHrPReason : null
            // }
            // if(this.hrpReasons && this.hrpReasons.length > 0){
            // this.associateAnmMoService.isHighRiskPregnancy = true;
            // }
            if(item.answer !== null && item.answer !== "" && (item.answer.toLowerCase() === 'yes' || item.answer === true)){
              this.associateAnmMoService.isHighRiskPregnancy = true;
              }
          }
          else if(item.question.toLowerCase().includes('is hrni') || item.question.toLowerCase().includes('high risk newborn') 
          || item.question.toLowerCase().includes('high risk infant')){
          // arr = {
          //   sectionId: item.sectionid,
          //   questionId: item.questionid,
          //   question: item.question,
          //   answer: (item.answer !== null && item.answer !== "") ? item.answer : null,
          //   reasonsForHrni: this.hrniReasons,
          //   otherHrni: (this.otherHrniReason !== null && this.otherHrniReason !== "") ? this.otherHrniReason : null,
          //   congentialAnomalies: this.congentialAnomaliesReasons,
          //   otherCongentialAnomalies: (this.otherCongentialAnomalie !== null && this.otherCongentialAnomalie !== "") ? this.otherCongentialAnomalie : null,
          //   probableCauseOfDefect: (this.probableDefectCause !== null && this.probableDefectCause !== "") ? this.probableDefectCause : null
          // }
          // if(this.hrniReasons && this.hrniReasons.length > 0){
          // this.associateAnmMoService.isHighRiskInfant = true;
          // }
          if(item.answer !== null && item.answer !== "" && (item.answer.toLowerCase() === 'yes' || item.answer === true)){
            this.associateAnmMoService.isHighRiskInfant = true;
            }
        } 
        // else {
          arr = {
            sectionId: item.sectionid,
            questionId: item.questionid,
            question: item.question,
            answer: (item.answer !== null && item.answer !== "") 
                    ? (Array.isArray(item.answer) 
                    ? item.answer.join(" || ") : item.answer) : null
          }
        //  }
          saveQuestionsData.push(arr);
        }
      });
    }
    });
    console.log("saveQuestionsData", saveQuestionsData);
    const reqObj = {
      obCallId: this.benData.obCallId,
      motherId: this.motherId,
      childId: this.childId,
      ecdCallType: this.benData.outboundCallType,
      benCallId: this.associateAnmMoService.callDetailId,
      questionnaireResponse: saveQuestionsData,
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
      createdBy: this.sessionstorage.getItem('userName')
    }
    this.associateAnmMoService.saveQuestionnaireResponse(reqObj).subscribe((res: any) => {
      if(res){
        this.confirmationService.openDialog(res.response, "success");
        this.associateAnmMoService.fromComponent = "ECD Questionnaire";
        this.associateAnmMoService.setOpenComp("Call Closure");
      } else {
        this.confirmationService.openDialog(res.errorMessage, "error");
      }
    },
      (err: any) => {
        this.confirmationService.openDialog(err.error, "error");
      }
    );
    }
    
  }
  

}
