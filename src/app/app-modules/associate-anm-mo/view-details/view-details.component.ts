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


import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { AmritTrackingService } from 'Common-UI/src/tracking';
import { HighRiskReasonsComponent } from '../high-risk-reasons/high-risk-reasons.component';
import { SetLanguageService } from '../../services/set-language/set-language.service';

@Component({
  selector: 'app-view-details',
  templateUrl: './view-details.component.html',
  styleUrls: ['./view-details.component.css']
,
  standalone: false})
export class ViewDetailsComponent implements OnInit {
  datePipeString : any='2023-02-13T00:00:00.000Z';
  viewDetails:any=this.data.selectedDetails;
  currentLanguageSet: any;
  viewOutboundWorklistForm = this.fb.group({
        id: [''],
        phoneNo:[''],
        wPhoneNumber:[''],
        motherId:[''],
        lapseTime: [''],
        callAttemptNo:[''],
        callStatus: [''],
        recordUploadDate:[''],
        ecdCallType:[''],
        motherName:[''],
        husbandName:[''],
        Address:[''],
        healthBlock:[''],
        phcName:[''],
        subFacility:[''],
        Aasha:[''],
        anmName:[''],
        lmpDate:[''],
        edd:[''],
        nextAnc : [''],
        age: [''],
        highRiskStatus: [''],
  })
  viewOutboundWorklistFormForChild = this.fb.group({
    id: [''],
    phoneNo:[''],
    wPhoneNumber:[''],
    childId:[''],
    lapseTime: [''],
    callAttemptNo:[''],
    callStatus: [''],
    recordUploadDate:[''],
    ecdCallType:[''],
    childName:[''],
    Address:[''],
    healthBlock:[''],
    phcName:[''],
    subFacility:[''],
    Aasha:[''],
    anmName:[''],
    nextPnc : [''],
    hrniStatus: [''],
})
  constructor(
     @Inject(MAT_DIALOG_DATA) public data: any,
     public dialogRef: MatDialogRef<ViewDetailsComponent>,
     private fb: FormBuilder,
     private datePipe: DatePipe,
     private trackingService: AmritTrackingService,
     public dialog: MatDialog,
     private setLanguageService: SetLanguageService,
  ) {
    this.datePipeString = this.datePipe.transform(this.datePipeString,'MM/dd/yyyy');
    console.log(this.datePipeString);
  }

  getmodifiedViewDetails(viewDetails:any){
    const modifiedObjForMother={
      recordUploadDate:this.datePipe.transform(viewDetails.recordUploadDate,'MM/dd/yyyy'),
      motherId:viewDetails.mctsidNo,
      motherName:viewDetails.name,
      husbandName:viewDetails.husbandName,
      healthBlock:viewDetails.healthBlock,
      phcName:viewDetails.phcName,
      Address:viewDetails.address,
      subFacility:viewDetails.subFacility,
      phoneNo:viewDetails.whomPhoneNo,
      Aasha:viewDetails.ashaName,
      anmName:viewDetails.anmName,
      lmpDate:this.datePipe.transform(viewDetails.lmpDate,'MM/dd/yyyy'),
      edd:this.datePipe.transform(viewDetails.edd,'MM/dd/yyyy'),
      nextAnc:this.datePipe.transform(viewDetails.nextAnc,'MM/dd/yyyy'),
      highRiskStatus: viewDetails.highRisk ? 'Yes' : 'No',

    }
    const modifiedObjForChild={
      recordUploadDate:this.datePipe.transform(viewDetails.recordUploadDate,'MM/dd/yyyy'),
      childId:viewDetails.mctsidNoChildId,
      childName:viewDetails.childName,
      healthBlock:viewDetails.healthBlock,
      phcName:viewDetails.phcName,
      Address:viewDetails.address,
      subFacility:viewDetails.subFacility,
      phoneNo:viewDetails.phoneNo,
      Aasha:viewDetails.ashaName,
      anmName:viewDetails.anmName,
      nextPnc:this.datePipe.transform(viewDetails.nextPnc,'MM/dd/yyyy'),
      hrniStatus: viewDetails.isHrni ? 'Yes' : 'No',
    }

    if(this.data.activeMother){
      return modifiedObjForMother
    }
    else{
      return modifiedObjForChild
    }

  }

  patchValueForviewDetails(viewDetails:any){
    const viewObj=this.getmodifiedViewDetails(viewDetails);
    if(this.data.activeMother){
      this.viewOutboundWorklistForm.patchValue(viewObj);
    }
    else{
      this.viewOutboundWorklistFormForChild.patchValue(viewObj);
    }
    
    }


  //   onNoClick(): void {
  //   this.dialogRef.close(false);
  // }
  

  ngOnInit(): void {
     this.getSelectedLanguage();
     this.patchValueForviewDetails(this.viewDetails);
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  openHrpReasonsDialog() {
    this.dialog.open(HighRiskReasonsComponent, {
      data: {
        motherId: this.viewDetails.mctsidNo,
        childId: this.viewDetails.mctsidNoChildId ?? null
      }
    });
  }

  trackFieldInteraction(fieldName: string) {
    this.trackingService.trackFieldInteraction(fieldName, 'View Details');
  }

}

export interface sampleMapping {
        id: number
        phoneNo:number
        wPhoneNumber:number
        motherId:number
        lapseTime: number
        callAttemptNo:number
        callStatus: string
        recordUploadDate:string
        ecdCallType:string
        motherName:string
        husbandName:string
        Address:string
        healthBlock:string
        phcName:string
        subFacility:string
        Aasha:string
        anmName:string
        lmpDate:string
        edd:string
        nextAnc : string
}
