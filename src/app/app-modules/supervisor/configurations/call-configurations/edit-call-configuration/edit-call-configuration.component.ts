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


import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-edit-call-configuration',
  templateUrl: './edit-call-configuration.component.html',
  styleUrls: ['./edit-call-configuration.component.css']
})
export class EditCallConfigurationComponent implements OnInit, DoCheck {

  @Input()
  data: any;

  displayedColumns: string[] = ['callType', 'displayName', 'baseLine', 'termRange'];
  ancCallData: any = [];
  pncCallData: any = [];
  displayCallTypes = false;
  currentLanguageSet: any;
  languageData: any;
  isDisabled = true;
  disableUpdate = false;
  enableNextCallAttempt = false;
  enableDateRange = false;
  minDate: any;
  disabledStartDate = false;
  startDate: any;
  showStartDateValidation = false;
  introCallData: any = [];


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private setLanguageService: SetLanguageService,
    private route: ActivatedRoute,
    readonly sessionstorage:SessionStorageService,
    private supervisorService: SupervisorService

  ) { }

  editcallconfigurationform = this.fb.group({
    noOfIntroductoryCalls: [{value: '1', disabled: true}, [Validators.required, Validators.min(1)]],
    noOfEcdCalls: [{value: '', disabled: true}, [Validators.required, Validators.min(3)]],
    noOfAncCalls: [{value: '',  disabled: true}, [Validators.required, Validators.min(1)]],
    noOfPncCalls: [{value: '',  disabled: true}, [Validators.required, Validators.min(1)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    configTerms: ['', Validators.required],
    noOfAttempts: [''],
    nextCallAttempt: [''],
  });

 
  ngOnInit(): void {
    this.getSelectedLanguage();
    if(this.data){
      if(this.data.ancCalls !== null && this.data.pncCalls !== null){
        this.editcallconfigurationform.patchValue({
          noOfEcdCalls: this.data.ancCalls + this.data.pncCalls + 1,
          noOfAncCalls: this.data.ancCalls,
          noOfPncCalls: this.data.pncCalls,
          configTerms: this.data.data.configurations[0].configTerms,
          startDate: this.data.data.configurations[0].effectiveStartDate,
          endDate: this.data.data.configurations[0].effectiveEndDate,
          noOfAttempts: this.data.data.configurations[0].noOfAttempts,
          nextCallAttempt: this.data.data.configurations[0].nextAttemptPeriod     
        });
        this.checkNoOfAttempts();
        this.addCallTypes();
      }
      if (this.data.lastEndDate) {
        const currentEndDateString = this.editcallconfigurationform.controls.endDate.value as unknown as Date;
        const currentEndDate = currentEndDateString ? new Date(currentEndDateString) : null;
        const lastEndDate = new Date(this.data.lastEndDate);
        if (currentEndDate && currentEndDate.getTime() === lastEndDate.getTime()) {
          this.enableDateRange = true;
          this.disabledStartDate = true;
          this.startDate = this.editcallconfigurationform.controls.startDate.value;
        } else {
          this.enableDateRange = false;
          this.disabledStartDate = true;
        }
      }
      
    }      
    this.minDate = this.editcallconfigurationform.controls.startDate.value;

  }

  validateDateRange() {
    const start = this.editcallconfigurationform.controls.startDate.value as unknown as Date;
    const end = this.editcallconfigurationform.controls.endDate.value as unknown as Date;
    
    const validationStartDate = new Date(this.startDate);
    const validationStartDateNew = validationStartDate.getUTCMonth() + 1 + "/" + validationStartDate.getUTCDate() + "/" + validationStartDate.getUTCFullYear();
    const startValueInitial =   moment(start).format('YYYY-MM-DDThh:mm:ssZ');
    const startValue = new Date(startValueInitial);
    const startDateNew = startValue.getUTCMonth() + 1 + "/" + startValue.getUTCDate() + "/" + startValue.getUTCFullYear();
    if(startDateNew !== validationStartDateNew){
      this.showStartDateValidation = true;
    } else {
      this.showStartDateValidation = false;
    }
    // let start =  this.editcallconfigurationform.controls.startDate.value;
    // let end = this.editcallconfigurationform.controls.endDate.value;
    // if(start !== this.startDate){
    //   this.showStartDateValidation = true;
    // } else {
    //   this.showStartDateValidation = false;
    // }

  }

  checkIfValidAttempts(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return { invalidAttempts: true };
    }
    return value >= 0 ? null : { invalidAttempts: true };
  }


  ngDoCheck(){
    this.getSelectedLanguage();
  }


  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null)
      this.currentLanguageSet = this.setLanguageService.languageData;
    else {
      this.changeLanguage('English');
    }
  }

  changeLanguage(language: string) {
    this.setLanguageService.getLanguageData(language).subscribe(data => {
      this.languageData = data;
    });
  }
  

  addCallTypes(){
    // let ancCallNumRows: any;
    // let pncCallNumRows: any;
    const ancCallNumRows: any = this.editcallconfigurationform.controls['noOfAncCalls'].value;
    const pncCallNumRows : any = this.editcallconfigurationform.controls['noOfPncCalls'].value;
    if(ancCallNumRows !== undefined && ancCallNumRows !== null && 
      pncCallNumRows !== undefined && pncCallNumRows !== null){
      
      const callConfigData = this.data.data.configurations;

      // Add the introductory call
      this.introCallData.push({
        callType: 'Introductory',
        displayName: '',
        baseLine: null,
        termRange: null,
        rowErrorMessage: ''
      });
      
      // Initialize ancCallData if empty
      this.ancCallData = [];
      for (let i = 1; i <= ancCallNumRows; i++) {
        this.ancCallData.push({
          callType: 'ECD' + i,
          displayName: '',
          baseLine: 'LMP',
          termRange: '',
          callConfigId: '',
          configId: '',
          rowErrorMessage: ''
        });
      }

    // Initialize pncCallData if empty
      this.pncCallData = [];
      const pncStartNumber = this.ancCallData.length + 1;
      for (let i = pncStartNumber; i < pncStartNumber + pncCallNumRows; i++) {
        this.pncCallData.push({
          callType: 'ECD' + i,
          displayName: '',
          baseLine: 'DOB',
          termRange: '',
          callConfigId: '',
          configId: '',
          rowErrorMessage: ''
        });
      }

      // Update IntroCallData
      for (let i = 0; i < this.introCallData.length; i++) {
        const callType = this.introCallData[i].callType;
        const matchingCallConfig = callConfigData.find((callConfig: any) => callConfig.callType === callType);
        if (matchingCallConfig) {
          this.introCallData[i].callConfigId = matchingCallConfig.callConfigId;
          this.introCallData[i].configId = matchingCallConfig.configId;
          this.introCallData[i].displayName = matchingCallConfig.displayName;
          this.introCallData[i].baseLine = matchingCallConfig.baseLine;
          this.introCallData[i].termRange = matchingCallConfig.termRange;
        }
      }

      // Update ancCallData
      for (let i = 0; i < this.ancCallData.length; i++) {
        const callType = this.ancCallData[i].callType;
        const matchingCallConfig = callConfigData.find((callConfig: any) => callConfig.callType === callType);
        if (matchingCallConfig) {
          this.ancCallData[i].callConfigId = matchingCallConfig.callConfigId;
          this.ancCallData[i].configId = matchingCallConfig.configId;
          this.ancCallData[i].displayName = matchingCallConfig.displayName;
          this.ancCallData[i].baseLine = matchingCallConfig.baseLine;
          this.ancCallData[i].termRange = matchingCallConfig.termRange;
        }
      }

      // Update pncCallData
      for (let i = 0; i < this.pncCallData.length; i++) {
        const callType = this.pncCallData[i].callType;
        const matchingCallConfig = callConfigData.find((callConfig: any) => callConfig.callType === callType);
        if (matchingCallConfig) {
          this.pncCallData[i].callConfigId = matchingCallConfig.callConfigId;
          this.pncCallData[i].configId = matchingCallConfig.configId;
          this.pncCallData[i].displayName = matchingCallConfig.displayName;
          this.pncCallData[i].baseLine = matchingCallConfig.baseLine;
          this.pncCallData[i].termRange = matchingCallConfig.termRange;
        }
      }
    this.displayCallTypes = true;
  }
    else{
      this.confirmationService.openDialog(this.currentLanguageSet.issueInGeneratingCallTypes, 'error')
    }
  }

  goBack(){
    this.supervisorService.createComponent(CallConfigurationComponent, null);
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
        this.disableUpdate = true;
      } else if (nextRow && nxtTermRange !== null && currentTermRange !== null && currentTermRange >= nxtTermRange) {
        row.rowErrorMessage = 'Term range should be less than next term range';
        this.disableUpdate = true;
      } else if(this.editcallconfigurationform.controls.configTerms.value === "days" && currentTermRange !== null && currentTermRange >= 1000){
        row.rowErrorMessage = 'Term range cannot exceed the 1000 days';
        this.disableUpdate = true;
      }  else if (this.editcallconfigurationform.controls.configTerms.value === "months" && currentTermRange !== null && currentTermRange >= 32){
        row.rowErrorMessage = 'Term range cannot exceed the 32 months';
        this.disableUpdate = true;
      } else {
        row.rowErrorMessage = '';
        this.disableUpdate = false;
      }
    });
    this.editcallconfigurationform.markAsDirty();

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
        this.disableUpdate = true;
      } else if (nextRow && nxtTermRange !== null && currentTermRange !== null && currentTermRange >= nxtTermRange) {
        row.rowErrorMessage = 'Term range should be less than next term range';
        this.disableUpdate = true;
      } else if(this.editcallconfigurationform.controls.configTerms.value === "days" && currentTermRange !== null && currentTermRange >= 1000){
        row.rowErrorMessage = 'Term range cannot exceed the 1000 days';
        this.disableUpdate = true;
      }  else if (this.editcallconfigurationform.controls.configTerms.value === "months" && currentTermRange !== null && currentTermRange >= 32){
        row.rowErrorMessage = 'Term range cannot exceed the 32 months';
        this.disableUpdate = true;
      } else {
        row.rowErrorMessage = '';
        this.disableUpdate = false;
      }
    });
    this.editcallconfigurationform.markAsDirty();
  }

  checkIfValidSubmit(): boolean {
    const callData = [...this.ancCallData, ...this.pncCallData];
    return callData.every(call => call.displayName && call.termRange && (call.rowErrorMessage === null || call.rowErrorMessage === ''));
  }

  checkNoOfAttempts(){
    const noOfAttempts = this.editcallconfigurationform.controls.noOfAttempts.value ? parseInt(this.editcallconfigurationform.controls.noOfAttempts.value) : 0;
    if(noOfAttempts > 0){
      this.enableNextCallAttempt = true;
      if(this.editcallconfigurationform.controls.nextCallAttempt.value){
      this.disableUpdate = false;
      } else {
        this.disableUpdate = true;
      }
    } else {
      this.enableNextCallAttempt = false;
      this.disableUpdate = false;
      this.editcallconfigurationform.controls.nextCallAttempt.patchValue(null);
    }
  }

  enableSubmitOnFill(){
    const nextCallAttemptValue = this.editcallconfigurationform.controls.nextCallAttempt.value;
    const noOfAttemptsValue = this.editcallconfigurationform.controls.noOfAttempts.value ? (this.editcallconfigurationform.controls.noOfAttempts.value) : 0;
    if(noOfAttemptsValue === 0){
      this.disableUpdate = false;
    } else {
      if(nextCallAttemptValue?.toString() === '0'){
        this.disableUpdate = false;
      } 
      else if(nextCallAttemptValue){
        this.disableUpdate = false;
      } 
      else {
        this.disableUpdate = true;
      }
    }
  }
  

  updateCallConfiguration(){
    if(this.checkIfValidSubmit()){
      const fromDate =  moment(this.editcallconfigurationform.controls.startDate.value).format('YYYY-MM-DDThh:mm:ssZ');
      const toDate =  moment(this.editcallconfigurationform.controls.endDate.value).format('YYYY-MM-DDThh:mm:ssZ');
    const dataArray = [...this.introCallData, ...this.ancCallData, ...this.pncCallData].map(element => ({
      ...element,
      effectiveStartDate: fromDate,
      effectiveEndDate: toDate,
      configTerms: this.editcallconfigurationform.controls.configTerms.value,
      noOfAttempts: this.editcallconfigurationform.controls.noOfAttempts.value,
      nextAttemptPeriod: this.editcallconfigurationform.controls.nextCallAttempt.value,
      deleted: false,
      createdBy: this.sessionstorage.userName,
      modifiedBy: this.sessionstorage.userName,
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
    }));
    const reqObj = dataArray;
    console.log("reqObj", reqObj)
    this.supervisorService.updateCallConfiguration(reqObj, this.data.data.configId).subscribe((res: any) => {
      if(res && res.length > 0){
        this.confirmationService.openDialog(this.currentLanguageSet.callConfigurationUpdatedSuccessfully, 'success');
        this.editcallconfigurationform.reset();
        this.supervisorService.createComponent(CallConfigurationComponent, null);
      } else{
        this.confirmationService.openDialog(res.errorMessage, 'error');
    }
    });
  }else {
    this.confirmationService.openDialog(this.currentLanguageSet.pleaseFillAllTheValuesToProceedFurther, 'info');
  }
}
}
