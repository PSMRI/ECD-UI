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


import { P } from '@angular/cdk/keycodes';
import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';


@Component({
  selector: 'app-call-reallocation',
  templateUrl: './call-reallocation.component.html',
  styleUrls: ['./call-reallocation.component.css']
})
export class CallReallocationComponent implements OnInit, DoCheck {
  recordType: any;
  phoneNoType: any;
  agentName: any;
  allocateTo: any;
  agent: any;
  allocate: any;
  agentType: any;
  isAllocateEnabled = false;
  isFormValid = false;
  isSubmitDisabled = true;
  isAllocateDisabled = true;
  enableAllocate = false;
  totalCount: any;
  currentMaxAllocatedRecords:any;
  enableAgentAllocation = false;
  callReallocationData: any = [];
  enableAgentUnallocation = false;
  formEnabled = false;
  selectedRadioButtonChange = false;
  selectedRadioButton: any;
  reallocateEnabled = false;
  unallocateEnabled = false;
  userRoles: any;

  currentLanguageSet: any;
  languageData: any;
  agentList: any[] = [];
  agentNames: any[] = [];
  allocatesTo: any[] = [];
  agentRoles:any;
  maxDate = new Date();


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
  
  @Input() minValue = 1;
  @Input() maxValue = 10;
  range = new FormGroup({
    start: new FormControl('', [Validators.required]),
    end: new FormControl('', [Validators.required]),
  });
  rolesArr: any;
  selectedRoleName: any;
  agentArr: any = [];
  isDisableUnallocateButton = true;
  enableLanguage = false;
  languages : any = [];
  
  constructor(
    private supervisorService: SupervisorService,
    private confirmationService: ConfirmationService,
    private setLanguageService: SetLanguageService,
    readonly sessionstorage:SessionStorageService,
    private masterService: MasterService) { }

  ngOnInit(): void {
    console.log("Allocation", this.enableAllocate);
    this.getMasterData();
    this.range.valueChanges.subscribe(() => {
      this.checkSubmitDisabledButton();
    });

    this.getLanguageMaster();
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

  callReallocationForm = new FormGroup({
    selectedRadioButton: new FormControl('', [Validators.required]),
    agentTypes: new FormControl('', [Validators.required]),
    preferredLanguage: new FormControl(null),
    agentName: new FormControl('', [Validators.required]),
    recordType: new FormControl('', [Validators.required]),
    phoneNoType: new FormControl('', [Validators.required]),
    isStickyAgent: new FormControl(false)
  });

  callReallocateForm = new FormGroup({
    allocateTo: new FormControl('', [Validators.required]),
    numericValue: new FormControl('', [Validators.required]),
  });

  getMasterData() {
    const psmId = this.sessionstorage.getItem('providerServiceMapID');
    // var psmId = this.sessionstorage.getItem('providerServiceMapID');
    this.masterService.getRoleMaster(psmId).subscribe((res:any)=>{
      if(res){
        this.agentList = res;
        this.rolesArr = [];
     
        this.agentList.filter((values:any) => {
          if (values.roleName.toLowerCase() === "associate" || values.roleName.toLowerCase() === "anm" || values.roleName.toLowerCase() === "mo") {
              this.rolesArr.push(values);
          }
        });
      }
    })
   
    
    
  }

  onClickOfRoles(event: any) {
    this.agentRoles= event.value;
    this.checkSubmitDisabledButton();

    const selectedRole = this.rolesArr.find((values: any) => values.roleId === this.agentRoles);
    
    this.agentNames = [];
    this.allocatesTo = [];
    this.callReallocationForm.controls.agentName.patchValue(null);

    if(selectedRole !== undefined && selectedRole !== null && selectedRole.roleName !== undefined && selectedRole.roleName !== null && selectedRole.roleName.toLowerCase() !== "anm" ) {

    this.masterService.getAgentMasterByRoleId(this.agentRoles).subscribe((response:any)=>{
      if(response){
        this.agentNames = response;
        this.allocatesTo = response;
      }
    })
  }

  }

  onClickOfAgents(event: any) {
   
    this.agentName = event.value;
    this.checkSubmitDisabledButton();
  
    console.log(this.agentName);
  }

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

  checkSubmitDisabledButton() {
    if (this.callReallocationForm.controls.agentTypes.value &&
      this.callReallocationForm.controls.agentName.value && 
      this.callReallocationForm.controls.recordType.value && 
      this.callReallocationForm.controls.phoneNoType.value &&
      this.range.controls.start.value && 
      this.range.controls.end.value) {
      this.isSubmitDisabled = false;
    } else {
      this.isSubmitDisabled = true;
    }
  }

  setAgentRoleName(roleName:any) {
    this.enableLanguage = false;
    this.selectedRoleName = roleName;

    if(this.selectedRoleName !== undefined && this.selectedRoleName !== null && this.selectedRoleName.toLowerCase() === 'associate') {
       this.callReallocationForm.patchValue({isStickyAgent : false});
      }   
      
    if(this.selectedRoleName !== undefined && this.selectedRoleName !== null && this.selectedRoleName.toLowerCase() === 'anm') {
        this.enableLanguage = true;
        this.callReallocationForm.controls["preferredLanguage"].addValidators(Validators.required);
       }   
       else {
        this.callReallocationForm.controls["preferredLanguage"].clearValidators();
        this.callReallocationForm.controls["preferredLanguage"].patchValue(null);
       }

    
  }

  onSubmit() {
    const fromDate =  moment(this.range.controls.start.value).format('YYYY-MM-DDThh:mm:ssZ');
    const toDate =  moment(this.range.controls.end.value).format('YYYY-MM-DDThh:mm:ssZ');

   
  
   

    const reqObj = {
      "fromUserIds": [
        0
      ],
      "toUserIds": [
        0
      ],
      "userId": this.callReallocationForm.controls.agentName.value,
      "roleId": this.callReallocationForm.controls.agentTypes.value,
      "roleName": this.selectedRoleName,
      "recordType": this.callReallocationForm.controls.recordType.value,
      "phoneNoType": this.callReallocationForm.controls.phoneNoType.value,
      "psmId": this.sessionstorage.getItem('providerServiceMapID'),
      "createdBy": this.sessionstorage.getItem('userName'),
      "tdate": toDate,
      "fdate": fromDate,
      "isStickyAgent" : this.callReallocationForm.controls.isStickyAgent.value,
      "preferredLanguage": this.callReallocationForm.controls.preferredLanguage.value
    };
    this.supervisorService.getAllocatedCounts(reqObj).subscribe((res: any) =>
    {
        if(res) {
          this.isDisableUnallocateButton = true;
          this.totalCount = res.totalCount;
          this.currentMaxAllocatedRecords = this.totalCount;
          this.callReallocateForm.controls.allocateTo.patchValue(null);
          this.callReallocateForm.controls.numericValue.patchValue(this.totalCount);
       this.enableUnallocateReallocateButton();
          this.enableAllocate = true;

          this.agentArr = [];
          this.allocatesTo.filter((values:any) => {
            if (values.userId !==  this.callReallocationForm.controls.agentName.value) {
                this.agentArr.push(values);
            }
          });
          // this.selectedRoleName = null;
        }
        else {
          this.confirmationService.openDialog(this.currentLanguageSet.noDataFound, `info`);
          this.enableAllocate = false;
        }
    })
    this.enableAgentAllocation = true;
    if(this.callReallocationForm.controls['selectedRadioButton'].value === '1') {
      this.reallocateEnabled = true;
      this.unallocateEnabled = false;
    } else{
      this.unallocateEnabled = true;
      this.reallocateEnabled = false;
    }
  }

  onClickOfAllocateTo() {
 
  if(this.callReallocateForm.controls.allocateTo.value !== undefined && this.callReallocateForm.controls.allocateTo.value !== null && 
    this.callReallocateForm.controls.allocateTo.value.length > 0) {
  this.currentMaxAllocatedRecords   =  this.totalCount / this.callReallocateForm.controls.allocateTo.value.length; 
    }
    else {
      this.currentMaxAllocatedRecords = 0;
    }
    this.currentMaxAllocatedRecords = Math.trunc(this.currentMaxAllocatedRecords);
    this.callReallocateForm.controls.numericValue.patchValue(this.currentMaxAllocatedRecords);

    this.enableUnallocateReallocateButton();
  }

  onClickOfAllocate() {
    const fromDate =  moment(this.range.controls.start.value).format('YYYY-MM-DDThh:mm:ssZ');
    const toDate =  moment(this.range.controls.end.value).format('YYYY-MM-DDThh:mm:ssZ');

    const userIdString = this.sessionstorage.getItem('userID');
    const roleIdString = this.sessionstorage.getItem('roleId');
    const psmIdString = this.sessionstorage.getItem('providerServiceMapID');

  

    const reqObj = {
      "fromUserIds": [
        0
      ],
      "toUserIds": this.callReallocateForm.controls.allocateTo.value,
      "userId":this.callReallocationForm.controls.agentName.value,
      "noOfCalls": this.callReallocateForm.controls.numericValue.value,
      "roleId":  this.callReallocationForm.controls.agentTypes.value,
      "roleName": this.selectedRoleName,
      "recordType": this.callReallocationForm.controls.recordType.value,
      "phoneNoType": this.callReallocationForm.controls.phoneNoType.value,
      "psmId": this.sessionstorage.getItem('providerServiceMapID'),
      "createdBy": this.sessionstorage.getItem('userName'),
      "tdate": toDate,
      "fdate": fromDate,
      "isStickyAgent" : this.callReallocationForm.controls.isStickyAgent.value,
      "preferredLanguage": this.callReallocationForm.controls.preferredLanguage.value
    };
    this.supervisorService.updateReallocateCalls(reqObj).subscribe((res: any) =>
    {
        if(res && res.response !== null) {
          this.isSubmitDisabled = false;
          this.confirmationService.openDialog(res.response, `success`);
          this.resetReallocateForm();
          // this.selectedRoleName = null;
        }
        else {
          this.confirmationService.openDialog(res.errorMessage, 'error');
          this.enableAllocate = false;
        }
    },
    (err: any) => {
    if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
    else
      this.confirmationService.openDialog(err.title + err.detail, 'error')
    });
    this.isSubmitDisabled = false;
  }

  onClickOfBin() {
  
    const fromDate =  moment(this.range.controls.start.value).format('YYYY-MM-DDThh:mm:ssZ');
    const toDate =  moment(this.range.controls.end.value).format('YYYY-MM-DDThh:mm:ssZ');

   
 
    


    const reqObj = {
      "fromUserIds": [
        0
      ],
      "toUserIds": [
        0
      ],
      "userId":this.callReallocationForm.controls.agentName.value,
      "noOfCalls": this.callReallocateForm.controls.numericValue.value,
      "roleId":  this.callReallocationForm.controls.agentTypes.value,
      "roleName": this.selectedRoleName,
      "recordType": this.callReallocationForm.controls.recordType.value,
      "phoneNoType": this.callReallocationForm.controls.phoneNoType.value,
      "psmId": this.sessionstorage.getItem('providerServiceMapID'),
      "createdBy": this.sessionstorage.getItem('userName'),
      "isIntroductory": this.selectedRoleName.toLowerCase() === 'associate' ? true : false,
      "tdate": toDate,
      "fdate": fromDate,
      "isStickyAgent" : this.callReallocationForm.controls.isStickyAgent.value,
      "preferredLanguage": this.callReallocationForm.controls.preferredLanguage.value
    };
    this.supervisorService.deleteReallocatedCalls(reqObj).subscribe((res: any) =>
    {
        if(res && res.response !== null) {
          this.confirmationService.openDialog(res.response, `success`);
          this.resetReallocateForm();
          // this.selectedRoleName = null;
        } 
        else {
          this.confirmationService.openDialog(res.errorMessage, 'error');
        }
    },
    (err: any) => {
    if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
    else
      this.confirmationService.openDialog(err.title + err.detail, 'error')
    });
  }

  onRadioButtonChange() {
    this.selectedRadioButtonChange = true;
    this.reallocateEnabled = false;
    this.unallocateEnabled = false;
    this.enableAgentAllocation = false;
    this.selectedRoleName = null;
    this.callReallocationForm.reset();
    this.callReallocateForm.reset();
    this.range.reset();
    this.enableLanguage = false;
    this.callReallocationForm.controls["preferredLanguage"].clearValidators();

    this.callReallocationForm.patchValue({isStickyAgent : false});
  }
enableUnallocateReallocateButton() {
  if(this.callReallocateForm.controls.numericValue.value !== null && parseInt(this.callReallocateForm.controls.numericValue.value) > 0 && parseInt(this.callReallocateForm.controls.numericValue.value) <= this.currentMaxAllocatedRecords) {
      this.isDisableUnallocateButton = false
  }
  else
  {
    this.isDisableUnallocateButton = true
  }
}

getLanguageMaster(){
   
  this.masterService.getLanguageMaster().subscribe((response: any) => {
    if(response && response.length > 0){
      this.languages = response;
    }else {
      this.confirmationService.openDialog(this.currentLanguageSet.noLanguagesFound, 'error');
    }
  },
  (err: any) => {
    this.confirmationService.openDialog(err.error, 'error');
  }
  );
}

onSelectionOfLanguage() {
  this.agentRoles= this.callReallocationForm.controls.agentTypes.value;
  const selectedLanguage = this.callReallocationForm.controls.preferredLanguage.value;
  this.checkSubmitDisabledButton();

  
  this.agentNames = [];
  this.allocatesTo = [];
  this.callReallocationForm.controls.agentName.patchValue(null);

  this.masterService.getAgentMasterByRoleIdAndLanguage(this.agentRoles,selectedLanguage).subscribe((response:any)=>{
    if(response){
      this.agentNames = response;
      this.allocatesTo = response;
    }
  })


}

resetReallocateForm() {
  this.callReallocateForm.reset();
  this.enableAgentAllocation = false;
  this.isDisableUnallocateButton = true;
}

}
