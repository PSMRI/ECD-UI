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


import { DatePipe } from '@angular/common';
import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AssociateService } from '../../services/associate/associate.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { Router } from '@angular/router';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';

@Component({
  selector: 'app-beneficiary-call-history',
  templateUrl: './beneficiary-call-history.component.html',
  styleUrls: ['./beneficiary-call-history.component.css']
})
export class BeneficiaryCallHistoryComponent implements OnInit, OnDestroy, DoCheck {
  datePipeString : any='2023-02-13T00:00:00.000Z';
  currentLanguageSet: any;
  isDisabled = true;
  motherID: any;
  benData: any;
  searchTerm:any;
  // viewDetails:any=this.data.selectedDetails;
  sortDirection: 'asc' | 'desc' = 'asc';
  data: any;
  benHistoryData: any[]=[];
  sortOrder = 1;
  sortProperty: any ;
  sort: any;
  ecdCallType: any;
  callTime: any;
  record:any={};
  isMother=true
  beneficiaryCallDetails:any={};
  benCallData:any={};
  values = [
    {id:'1',
  name: "select"},
  {id:'2',
  name: "callTime"},
  {id:'3',
  name: "ecdCallType"}
    
  ]
  callId: any;
  
  constructor( private setLanguageService: SetLanguageService,
    private fb: FormBuilder,
    private associateAnmMoService: AssociateAnmMoService,
    private confirmationService:ConfirmationService,
    private associateService:AssociateService, private router: Router,) { }

  ngOnInit(): void {
    this.associateAnmMoService.isBenCallHistoryData$.subscribe((responseComp) => {
      if (responseComp !== null && responseComp ===true ) {
        this.getBenCallHistory();
      }
      
  });
    this.getSelectedLanguage();
    
  }
  ngOnDestroy(){
    this.associateAnmMoService.resetBenHistoryComp();
  }
  benCallHistoryForm = this.fb.group({
    callId: [' '],
    motherID: [' '],
    motherName: [' '],
    childID: [' '],
    childName: ['',Validators.required],
    phoneNo: ['',Validators.required],
    asha: [' '],
    anmName: [' '],
    lmpDate: [' '],
    dateOfBirth: [' '],
    startDate: [' '],
    startTime: [' '],
    endTime: [' '],
    ecdCallType: [' '],
    adivceProvided: [' '],
    complaint: [' '],
    searchTerm: [''],

  })

  patchValueForviewDetails(viewDetails:any){
    if(viewDetails){
      this. benCallHistoryForm.controls['callId'].patchValue(viewDetails.callId);
      // this. benCallHistoryForm.controls['dateOfBirth'].patchValue(this.datePipe.transform(viewDetails.dateOfBirth,'dd/MM/yyyy'));
      this. benCallHistoryForm.controls['childID'].patchValue(viewDetails.childID);
      this. benCallHistoryForm.controls['motherID'].patchValue(viewDetails.motherID);
      this. benCallHistoryForm.controls['motherName'].patchValue(viewDetails.motherName);
       this. benCallHistoryForm.controls['asha'].patchValue(viewDetails.asha);
       this. benCallHistoryForm.controls['anmName'].patchValue(viewDetails.anmName);
      //  this. benCallHistoryForm.controls['lmpDate'].patchValue(this.datePipe.transform(viewDetails.lmpDate,'dd/MM/yyyy'));
      //  this. benCaxllHistoryForm.controls['startDate'].patchValue(this.datePipe.transform(viewDetails.startDate,'dd/MM/yyyy'));
      }
      this. benCallHistoryForm.controls['startTime'].patchValue(viewDetails.startTime); 
      this. benCallHistoryForm.controls['endTime'].patchValue(viewDetails.endTime); 
      this. benCallHistoryForm.controls['childName'].patchValue(viewDetails.childName);
      this. benCallHistoryForm.controls['ecdCallType'].patchValue(viewDetails.ecdCallType);
      this. benCallHistoryForm.controls['adivceProvided'].patchValue(viewDetails.adivceProvided);
      this. benCallHistoryForm.controls['complaint'].patchValue(viewDetails.complaint);
  }
  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  } 
  
  sortBy(property: any) {
    this.sortOrder = property === this.sortProperty ? (this.sortOrder * -1) : 1;
    this.sortProperty = property;
    this.benData = [...this.benData.sort((a: any, b: any) => {
        // sort comparison function
        let result = 0;
        if (a[property] < b[property]) {
            result = -1;
        }
        if (a[property] > b[property]) {
            result = 1;
        }
        return result * this.sortOrder;
    })];
}
  

  getBenCallHistory(){
    this.isMother=this.associateAnmMoService.isMother;
    if(this.isMother===true){
      this.benCallData={
        "motherId":this.associateAnmMoService.selectedBenDetails.mctsidNo
      }
    }
      else{
        this.benCallData={
          "childId":this.associateAnmMoService.selectedBenDetails.mctsidNoChildId
        }
      }
    const requestObj = {
      "childId" : "53063813493560"
    }
          this.associateAnmMoService.getBeneficiaryCallHistory(this.benCallData).subscribe(
            (response: any) => {
              if (response) {
                this.benData=response;
                this.benHistoryData=response;
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
  
    /**
   * For In Table Search
   * @param searchTerm
   */
    filterSearchTerm(searchTerm?: string) {
      console.log(searchTerm);
      if (!searchTerm) {
        this.benHistoryData = this.benData;
        // this.benHistoryData.sort = this.sort;
      } else {
         this.benHistoryData = [];
        // this.benHistoryData.sort = this.sort;
        this.benData.forEach((item:any) => {
          for (const key in item) {
            if (
              key === 'displayEcdCallType' ||
              key ==='lastModDate'
            ) {
              const value: string = '' + item[key];
              if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
                this.benHistoryData.push(item);
                break;
              }
            }
          }
        });
      }
    }



  ngDoCheck() {
    this.getSelectedLanguage();
  }
  backToQuestinare(){
    // this.router.navigate(['/dashboardQuestionare']);
    this.associateAnmMoService.setOpenComp("ECD Questionnaire");
  }
  getCallHistoryDetails(obcallId:any){

     this.record={
      motherName:"Test"
    }

    this.associateAnmMoService.getCallHistoryDetails(obcallId).subscribe(
      (response: any) => {
        if (response) {
          this.beneficiaryCallDetails=response;
          console.log( this.beneficiaryCallDetails);
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
}
