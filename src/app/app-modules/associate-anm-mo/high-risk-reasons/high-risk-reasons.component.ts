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


import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';

@Component({
  selector: 'app-high-risk-reasons',
  templateUrl: './high-risk-reasons.component.html',
  styleUrls: ['./high-risk-reasons.component.css']
})
export class HighRiskReasonsComponent implements OnInit {
  motherId: any;
  currentLanguageSet: any;
  childId: any;
  hrpData: any;
  hrniData: any;
  hrpHrniReasons: any =[];
  dialogTitle: any;

  constructor(
    private dialogRef: MatDialogRef<HighRiskReasonsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private confirmationService: ConfirmationService,
    private associateAnmMoService: AssociateAnmMoService,
    private setLanguageService: SetLanguageService,
  ) { }

  ngOnInit(): void {
    this.getSelectedLanguage();
    if(this.data){
      this.motherId = this.data.motherId;
      this.childId = this.data.childId;
    }
    if(this.childId)
    this.dialogTitle = "High Risk New Born Infant Reasons";
    else
    this.dialogTitle = "High Risk Pregnancy Reasons";
    this.getHighRiskReasons();
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  getHighRiskReasons(){
    if(this.childId){
    const reqObj = {
      childId: this.childId,
    } 
    this.associateAnmMoService.getHRNIDetails(reqObj).subscribe((res: any) => {
      if(res){
      this.hrniData = res;
      this.filterHrpHrniData(res);
      } else {
      this.confirmationService.openDialog(res.errorMessage, "error");
      }
    }, (err : any) => {
      if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
      else
      this.confirmationService.openDialog(err.title + err.detail, 'error')
      });
  } else {
    const reqObj = {
      motherId: this.motherId,
    }
    this.associateAnmMoService.getHRPDetails(reqObj).subscribe((res: any) => {
      if(res){
      this.hrpData = res;
      this.filterHrpHrniData(res);
      }
      else {
      this.confirmationService.openDialog(res.errorMessage, "error");
      }
    }, (err : any) => {
      if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
      else
      this.confirmationService.openDialog(err.title + err.detail, 'error')
      });
   }
  }

  filterHrpHrniData(data: any){
    this.hrpHrniReasons = [];
    if(data){
      if(data.childId !== null){
        if(data.reasonsForHrniDB)
        this.hrpHrniReasons.push(...data.reasonsForHrniDB.split('||'));
        if(data.otherHrni)
        this.hrpHrniReasons.push(data.otherHrni);
        if(data.congentialAnomaliesDB)
        this.hrpHrniReasons.push(...data.congentialAnomaliesDB.split('||'));
        if(data.otherCongentialAnomalies)
        this.hrpHrniReasons.push(data.otherCongentialAnomalies);
        if(data.probableCauseOfDefect)
        this.hrpHrniReasons.push(data.probableCauseOfDefect);
      } else {
        if(data.reasonsForHrpDB)
        this.hrpHrniReasons.push(...data.reasonsForHrpDB.split('||'));
        if(data.otherHrpReason)
        this.hrpHrniReasons.push(data.otherHrpReason);
      }
      } 
    }

}
