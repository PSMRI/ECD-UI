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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
// import * as moment from 'moment';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { SessionStorageService } from 'src/app/app-modules/services/core/session-storage.service';


@Component({
  selector: 'app-call-allocation',
  templateUrl: './call-allocation.component.html',
  styleUrls: ['./call-allocation.component.css']
})
export class CallAllocationComponent implements OnInit, DoCheck {
  recordType: any;
  phoneNoType: any;
  agent: any;
  allocate: any;
  isAllocateEnabled = false;
  isFormValid = false;
  isSubmitDisabled = true; 
  isAllocateDisabled = true;
  enableAllocate = false;
  recordsData: any= [];
  enableAgentAllocation = false;
  enableMotherData = false;
  userRoles: any;
  allocatesTo: any[] = [];
  isIntroductory = false;

  currentLanguageSet: any;
  languageData: any;
  rolesArr:any[] = [];

  recordData = [
    {
      id: 1,
      name: "Mother", 
    },
    {
      id: 2,
      name: "Child",
    },
  ];

  phoneNumber = [
    {
      id: 1,
      name: "Self",
    },
    {
      id: 2,
      name: "Others",
    }
  ];

  roles: any;
  maxDate = new Date();



  @Input() minValue = 1;
  @Input() maxValue = 10;
  range = new FormGroup({
    start: new FormControl('', [Validators.required]),
    end: new FormControl('', [Validators.required])
  });
  selectedRoleName: any;
  allocateNoOfRecords: any;
  currentMaxAllocatedRecords: any;

  constructor(
    private supervisorService: SupervisorService,
    private confirmationService: ConfirmationService,
    private setLanguageService: SetLanguageService,
    readonly sessionstorage:SessionStorageService,
    private masterService: MasterService) {    
    }

  ngOnInit(): void {
    this.enableMotherData = true;
    this.range.valueChanges.subscribe(() => {
      this.checkSubmitDisabledButton();
    });
    this.getMasterData();
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

  callAllocationForm = new FormGroup({
    recordType: new FormControl('', [Validators.required]),
    phoneNoType: new FormControl('', [Validators.required]),
    agentType: new FormControl('', [Validators.required]),
    allocateTo: new FormControl('', [Validators.required]),
    numericValue: new FormControl('', [Validators.required]),
  });


  onClickOfRecordType(event: any) {
    this.recordType = event.value;
   
    this.checkSubmitDisabledButton();
    console.log(this.recordType);
  }

  onClickOfPhoneNoType(event: any) {
    this.phoneNoType = event.value;
    this.checkSubmitDisabledButton();
    console.log(this.phoneNoType);
  }

  onClickOfAgentType() {
    const agentTypeValue =  this.callAllocationForm.controls["agentType"].value;
    this.checkAllocateDisabledButton();
   

   
this.allocatesTo = [];
this.callAllocationForm.controls.allocateTo.patchValue(null);
    this.masterService.getAgentMasterByRoleId(agentTypeValue).subscribe((response:any)=>{
      if(response){
        this.allocatesTo = response;
      }
    })

  }

  setSelectedRoleName(roleName:any) {
    this.selectedRoleName = roleName;
  }

  onClickOfAllocateTo(event: any) {

    if(this.callAllocationForm.controls.allocateTo.value !== undefined && this.callAllocationForm.controls.allocateTo.value !== null && 
      this.callAllocationForm.controls.allocateTo.value.length > 0) {
    this.currentMaxAllocatedRecords   =  this.allocateNoOfRecords / this.callAllocationForm.controls.allocateTo.value.length; 
      }
      else {
        this.currentMaxAllocatedRecords = 0;
      }
      this.currentMaxAllocatedRecords = Math.trunc(this.currentMaxAllocatedRecords);
      this.callAllocationForm.controls.numericValue.patchValue(this.currentMaxAllocatedRecords);
    const allocateToValue = event.value;
    this.checkAllocateDisabledButton();
    console.log(event.value);
  }

  checkSubmitDisabledButton() {
    if (this.callAllocationForm.controls.recordType.value && 
      this.callAllocationForm.controls.phoneNoType.value && 
      this.range.controls.start.value && 
      this.range.controls.end.value) {
      this.isSubmitDisabled = false;
    } else {
      this.isSubmitDisabled = true;
    }
  }

  checkAllocateDisabledButton() {
   
    let numValue = false;
     if((this.callAllocationForm.controls.numericValue.value !== undefined &&  this.callAllocationForm.controls.numericValue.value !== null
       && parseInt(this.callAllocationForm.controls.numericValue.value) > 0 && 
      this.callAllocationForm.controls.numericValue.value <= this.currentMaxAllocatedRecords)) {
      numValue = true;
     }
     else {
      numValue = false;
     }

  
    if (this.callAllocationForm.controls.agentType.value !== null && this.callAllocationForm.controls.allocateTo.value !== null && numValue) {
      this.isAllocateDisabled = false;
    } else {
      this.isAllocateDisabled = true;
    }

  }

  getMasterData() {
    const psmId = this.sessionstorage.getItem('providerServiceMapID');
    this.masterService.getRoleMaster(psmId).subscribe((res:any)=>{
      if(res){
        this.roles = res;
      }
    })
    const roleId = this.sessionstorage.getItem('roleId');
     if (roleId !== null) {
       this.userRoles = JSON.parse(roleId);
     }
    console.log('userPrivileges', this.userRoles);
     
  }

  onSubmit() {
     const recordType= this.callAllocationForm.controls.recordType.value;
     const phoneNoType= this.callAllocationForm.controls.phoneNoType.value;
   
    
     
     const psmId= this.sessionstorage.getItem('providerServiceMapID');
    //  let fromDate = moment(fDate).toISOString();
    //  let toDate = moment(tDate).toISOString();
    const fromDate =  moment(this.range.controls.start.value).format('YYYY-MM-DDThh:mm:ssZ');
    const toDate =  moment(this.range.controls.end.value).format('YYYY-MM-DDThh:mm:ssZ');
    this.supervisorService.getUnallocatedCalls(psmId, phoneNoType, recordType, fromDate, toDate).subscribe((res: any) =>
    {
      if(res && res !== null) {
          this.recordsData = res;
          this.enableAllocate = true;

          if(this.recordType === "Mother") {
            this.enableMotherData = true;
          } else {
            this.enableMotherData = false;
          }
          this.enableAgentAllocation = false;
      } else {
          this.confirmationService.openDialog(this.currentLanguageSet.noDataFound, `info`);
          this.enableAllocate = false;
        }
    })
  }

  onAllocate(value: any, noOfRecords:any) {
   
    this.allocateNoOfRecords = noOfRecords;
    this.currentMaxAllocatedRecords = noOfRecords;
    this.enableAgentAllocation = true;
    this.isSubmitDisabled = false;
    this.resetInnerAllocateForm();

    if(value === 'introductory') {
      this.rolesArr = [];
    this.isIntroductory = true;
    this.roles.filter((values:any) => {
      if (values.roleName.toLowerCase() === "associate") {
          this.rolesArr.push(values);
          this.callAllocationForm.controls["agentType"].patchValue(values.roleId);
          this.onClickOfAgentType();
          this.setSelectedRoleName(values.roleName);
      }
    });
    } else {
      this.rolesArr = [];
     if(value === "low risk") {
      this.roles.filter((values:any) => {
        if (values.roleName.toLowerCase() === "anm") {
            this.rolesArr.push(values);
            this.callAllocationForm.controls["agentType"].patchValue(values.roleId);
            this.onClickOfAgentType();
            this.setSelectedRoleName(values.roleName);
        }
      });
    }
    else {
      this.roles.filter((values:any) => {
        if (values.roleName.toLowerCase() === "mo") {
            this.rolesArr.push(values);
            this.callAllocationForm.controls["agentType"].patchValue(values.roleId);
            this.onClickOfAgentType();
            this.setSelectedRoleName(values.roleName);
        }
        });
    }
      this.isIntroductory = false;
    }
    this.callAllocationForm.controls.numericValue.patchValue(this.allocateNoOfRecords);
    // this.numericValue = this.recordsData.totalRecord || this.recordsData.totalIntroductoryRecord || this.recordsData.totalLowRiskRecord || this.recordsData.totalHighRiskRecord || this.recordsData.totalAllocatedRecord;
    // this.overallAllocatedNo = this.numericValue;
    console.log("allocate Agents");
  }

  resetInnerAllocateForm()  {
    this.allocatesTo = [];
    this.callAllocationForm.controls.agentType.patchValue(null);
    this.callAllocationForm.controls.agentType.patchValue(null);
    this.callAllocationForm.controls.numericValue.patchValue(null);

    this.checkAllocateDisabledButton();
  }

  onClickOfAllocate() {
   
  

    const fromDate =  moment(this.range.controls.start.value).format('YYYY-MM-DDThh:mm:ssZ');
    const toDate =  moment(this.range.controls.end.value).format('YYYY-MM-DDThh:mm:ssZ');


    const allocateReqObj = {
      "fromUserIds": [
        0
      ],
      "toUserIds": this.callAllocationForm.controls.allocateTo.value,
      "noOfCalls": this.callAllocationForm.controls.numericValue.value,
      "roleId": this.callAllocationForm.controls.agentType.value,
      "roleName": this.selectedRoleName,
      "recordType": this.callAllocationForm.controls.recordType.value,
      "phoneNoType": this.callAllocationForm.controls.phoneNoType.value,
      "psmId": this.sessionstorage.getItem('providerServiceMapID'),
      "createdBy": this.sessionstorage.userName,
      "isIntroductory": this.isIntroductory,
      "tdate": toDate,
      "fdate": fromDate
    };


  
    this.supervisorService.saveAllocateCalls(allocateReqObj).subscribe(
      (response: any) => {
   
      if(response !== null && response.response !== null) {
        this.confirmationService.openDialog(response.response, `success`);
        // this.confirmationService.openDialog(this.currentLanguageSet.callsAllocatedSuccessfully, `success`);
        this.callAllocationForm.reset();
        this.range.reset();
        this.enableAgentAllocation = false;
        this.isSubmitDisabled = false;
        this.selectedRoleName = null;
        this.recordsData = [];
      
      } 
      else {
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
}
