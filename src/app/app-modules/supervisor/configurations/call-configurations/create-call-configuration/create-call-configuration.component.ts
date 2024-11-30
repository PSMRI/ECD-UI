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


import { Component, DoCheck, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { CallConfigurationComponent } from '../call-configuration/call-configuration.component';
import { SessionStorageService } from 'src/app/app-modules/services/core/session-storage.service';

/**
 * KA40094929
 */

@Component({
  selector: 'app-create-call-configuration',
  templateUrl: './create-call-configuration.component.html',
  styleUrls: ['./create-call-configuration.component.css']
})
export class CreateCallConfigurationComponent implements OnInit, DoCheck, OnDestroy {

  @Input()
  data: any;

  displayedColumns: string[] = ['callType', 'displayName', 'baseLine', 'termRange'];
  ancCallData: any = [];
  pncCallData: any = [];
  displayCallTypes = false;
  currentLanguageSet: any;
  languageData: any;
  dataArray: any = [];
  enableNextCallAttempt = false;
  disableAncPncCalls = true;
  disableAddTerms = false;
  showTermRangeValidation = false;
  minDate: any;
  disableFields = false;
  rowErrorMessages: any;
  disableSubmit = true;
  introCallData: any = [];
//   = [
    // {callType: 'callType1', displayName: 'displayName1', baseLine: 'fromTerms1', termRange: 'toTerms1'},
    // {callType: 'callType2', displayName: 'displayName2', baseLine: 'fromTerms2', termRange: 'toTerms2'},
// ];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private setLanguageService: SetLanguageService,
    private supervisorService: SupervisorService,
    readonly sessionstorage:SessionStorageService,
  ) { }

  createcallconfigurationform = this.fb.group({
    noOfIntroductoryCalls: ['1', [Validators.required, Validators.min(1), Validators.max(1)]],
    noOfEcdCalls: ['', [Validators.required, Validators.min(3)]],
    noOfAncCalls: ['', [Validators.required, Validators.min(1)]],
    noOfPncCalls: ['', [Validators.required, Validators.min(1)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    configTerms: ['', Validators.required],
    noOfAttempts: [''],
    nextCallAttempt: [''],
  });

 
  ngOnInit(): void {
    this.getSelectedLanguage(); 
    if(this.data !== null){
    const minDate = this.data.data;
    this.minDate = new Date(minDate);
    }
  }
  

  ngDoCheck(){
    this.getSelectedLanguage();
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  checkTotalEcdCalls(){
    if(this.createcallconfigurationform.controls.noOfEcdCalls.invalid){
    this.disableAncPncCalls = true;
    } else{
      this.disableAncPncCalls = false;
    }
  }

  checkTotalCallsCount(){
    const ancCalls = this.createcallconfigurationform.controls.noOfAncCalls.value ? parseInt(this.createcallconfigurationform.controls.noOfAncCalls.value): 0;
    const pncCalls = this.createcallconfigurationform.controls.noOfPncCalls.value ? parseInt(this.createcallconfigurationform.controls.noOfPncCalls.value) : 0;
    const introductoryCalls = this.createcallconfigurationform.controls.noOfIntroductoryCalls.value ? parseInt(this.createcallconfigurationform.controls.noOfIntroductoryCalls.value) : 0;
    this.createcallconfigurationform.controls.noOfEcdCalls.patchValue((ancCalls + pncCalls + introductoryCalls).toString())
  }

  addCallTypes(){
    this.introCallData = [];
    this.ancCallData = [];
    this.pncCallData = [];
    // let ancCallNumRows: any;
    // let pncCallNumRows: any;
    const ancCallNumRows: any = this.createcallconfigurationform.controls['noOfAncCalls'].value;
    const pncCallNumRows: any = this.createcallconfigurationform.controls['noOfPncCalls'].value;
    if(ancCallNumRows !== undefined && ancCallNumRows !== null && 
      pncCallNumRows !== undefined && pncCallNumRows !== null){
        
      // Add the introductory call
      this.introCallData.push({
        callType: 'Introductory',
        displayName: 'Introductory',
        baseLine: null,
        termRange: null,
        rowErrorMessage: ''
      });
      this.dataArray.push(this.introCallData[0]);

    for (let i = 1; i <= ancCallNumRows; i++) {
      this.ancCallData.push({
        callType: 'ECD' + i,
        displayName: 'ANC' + i,
        baseLine: 'LMP',
        termRange: '',
        rowErrorMessage: ''
      });
      this.dataArray.push(this.ancCallData[i-1]);
    }
    const pncStartNumber = this.ancCallData.length + 1;
    const pncRowNumber =  pncCallNumRows;
    for (let i = pncStartNumber, j = 1; i < pncStartNumber + pncCallNumRows && j <= pncRowNumber; i++, j++) {
      this.pncCallData.push({
        callType: 'ECD' + i,
        displayName: 'PNC' + j,
        baseLine: 'DOB',
        termRange: '',
        rowErrorMessage: ''
      });
      this.dataArray.push(this.pncCallData[i-1]);
    }
    this.displayCallTypes = true;
    this.disableFields = true;
  }
  else{
    this.confirmationService.openDialog(this.currentLanguageSet.issueInGeneratingCallTypes, 'error')
  }
  }

  checkIfValidSubmit(): boolean {
    const callData = [...this.ancCallData, ...this.pncCallData];
    return callData.every(call => call.displayName && call.termRange && (call.rowErrorMessage === null || call.rowErrorMessage === ''));
  }
  

  createCallConfiguration(){
    if(this.checkIfValidSubmit()){
      const fromDate =  moment(this.createcallconfigurationform.controls.startDate.value).format('YYYY-MM-DDThh:mm:ssZ');
      const toDate =  moment(this.createcallconfigurationform.controls.endDate.value).format('YYYY-MM-DDThh:mm:ssZ');
      const dataArray = [...this.introCallData, ...this.ancCallData, ...this.pncCallData].map(element => ({
      ...element,
      effectiveStartDate: fromDate,
      effectiveEndDate: toDate,
      configTerms: this.createcallconfigurationform.controls.configTerms.value,
      noOfAttempts: this.createcallconfigurationform.controls.noOfAttempts.value ? (this.createcallconfigurationform.controls.noOfAttempts.value) : 0,
      nextAttemptPeriod: this.createcallconfigurationform.controls.nextCallAttempt.value,
      createdBy: this.sessionstorage.userName,
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
    }));
    const reqObj = dataArray;
    console.log("reqObj", reqObj)
    this.supervisorService.createCallConfiguration(reqObj).subscribe((res: any) => {
      if(res && res.length > 0){
        this.confirmationService.openDialog(this.currentLanguageSet.callConfigurationCreatedSuccessfully, 'success');
        this.createcallconfigurationform.reset();
        this.supervisorService.createComponent(CallConfigurationComponent, null);
      } else{
        this.confirmationService.openDialog(res.errorMessage, 'error');
    }
    });
  } else {
    this.confirmationService.openDialog(this.currentLanguageSet.pleaseFillAllTheValuesToProceedFurther, 'info');
  }
  }

  onTermRangeChangeForAnc(element: any) {
    const dataArray = [...this.ancCallData];
    const index = dataArray.indexOf(element);
    // const prevRow = dataArray[index - 1];
    // const nextRow = dataArray[index + 1];
    
    // const currentTermRange = (element.termRange !== undefined && element.termRange !== null) ? parseInt(element.termRange) : null;

    dataArray.forEach((row, i) => {
      const currentTermRange = (row.termRange !== undefined && row.termRange !== null) ? parseInt(row.termRange) : null;
      const prevRow = dataArray[i - 1];
      const nextRow = dataArray[i + 1];
      const prevTermRange = (prevRow?.termRange !== undefined && prevRow?.termRange !== null) ? parseInt(prevRow.termRange) : null;
      const nxtTermRange = (nextRow?.termRange !== undefined && nextRow?.termRange !== null) ? parseInt(nextRow.termRange) : null;
      
      if (prevRow && prevTermRange !== null && currentTermRange !== null && currentTermRange <= prevTermRange) {
        row.rowErrorMessage = 'Term range should be greater than previous term range';
        this.disableSubmit = true;
      } else if (nextRow && nxtTermRange !== null && currentTermRange !== null && currentTermRange >= nxtTermRange) {
        row.rowErrorMessage = 'Term range should be less than next term range';
        this.disableSubmit = true;
      } else if(this.createcallconfigurationform.controls.configTerms.value === "days" && currentTermRange !== null && currentTermRange >= 1000){
        row.rowErrorMessage = 'Term range cannot exceed the 1000 days';
        this.disableSubmit = true;
      }  else if (this.createcallconfigurationform.controls.configTerms.value === "months" && currentTermRange !== null && currentTermRange >= 32){
        row.rowErrorMessage = 'Term range cannot exceed the 32 months';
        this.disableSubmit = true;
      } else {
        row.rowErrorMessage = '';
        this.disableSubmit = false;
      }
    });
  }

  onTermRangeChangeForPnc(element: any) {
    const dataArray = [...this.pncCallData];
    const index = dataArray.indexOf(element);
    // const prevRow = dataArray[index - 1];
    // const nextRow = dataArray[index + 1];

    // const currentTermRange = (element.termRange !== undefined && element.termRange !== null) ? parseInt(element.termRange) : null;

    dataArray.forEach((row, i) => {
      const currentTermRange = (row.termRange !== undefined && row.termRange !== null) ? parseInt(row.termRange) : null;
      const prevRow = dataArray[i - 1];
      const nextRow = dataArray[i + 1];
      const prevTermRange = (prevRow?.termRange !== undefined && prevRow?.termRange !== null) ? parseInt(prevRow.termRange) : null;
      const nxtTermRange = (nextRow?.termRange !== undefined && nextRow?.termRange !== null) ? parseInt(nextRow.termRange) : null;
      
      if (prevRow && prevTermRange !== null && currentTermRange !== null && currentTermRange <= prevTermRange) {
        row.rowErrorMessage = 'Term range should be greater than previous term range';
        this.disableSubmit = true;
      } else if (nextRow && nxtTermRange !== null && currentTermRange !== null && currentTermRange >= nxtTermRange) {
        row.rowErrorMessage = 'Term range should be less than next term range';
        this.disableSubmit = true;
      } else if(this.createcallconfigurationform.controls.configTerms.value === "days" && currentTermRange !== null && currentTermRange >= 1000){
        row.rowErrorMessage = 'Term range cannot exceed the 1000 days';
        this.disableSubmit = true;
      }  else if (this.createcallconfigurationform.controls.configTerms.value === "months" && currentTermRange !== null && currentTermRange >= 32){
        row.rowErrorMessage = 'Term range cannot exceed the 32 months';
        this.disableSubmit = true;
      } else {
        row.rowErrorMessage = '';
        this.disableSubmit = false;
      }
    });
  }

  checkNoOfAttempts(){
    const noOfAttempts = this.createcallconfigurationform.controls.noOfAttempts.value ? parseInt(this.createcallconfigurationform.controls.noOfAttempts.value) : 0;
    if(noOfAttempts > 0){
      this.enableNextCallAttempt = true;
      this.disableAddTerms = true;
    } else {
      this.enableNextCallAttempt = false;
      this.disableAddTerms = false;
      this.createcallconfigurationform.controls.nextCallAttempt.patchValue(null);
    }
  }
  
  enableSubmitOnFill(){
    const nextCallAttemptValue = this.createcallconfigurationform.controls.nextCallAttempt.value
    if(nextCallAttemptValue?.toString() === '0'){
      this.disableAddTerms = false;
    } 
    else if(this.createcallconfigurationform.controls.nextCallAttempt.value){
      this.disableAddTerms = false;
    } else
    this.disableAddTerms = true;
    }

  goBack(){
    this.confirmationService
    .openDialog(
      "Do you really want to go back? Any unsaved data would be lost",
      'confirm'
    )
    .afterClosed()
    .subscribe((res) => {
      if (res) {
        this.supervisorService.createComponent(CallConfigurationComponent, null);
      }
    });
  }

  ngOnDestroy(){
    this.createcallconfigurationform.reset()
  }
}
