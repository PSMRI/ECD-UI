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


import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormControl} from '@angular/forms';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { QualitySectionConfigurationComponent } from '../quality-section-configuration/quality-section-configuration.component';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-edit-quality-section-configuration',
  templateUrl: './edit-quality-section-configuration.component.html',
  styleUrls: ['./edit-quality-section-configuration.component.css']
})
export class EditQualitySectionConfigurationComponent implements OnInit {
  currentLanguageSet: any;
  qualityAuditSectionList:any =[];
  dataSource = new MatTableDataSource<sectionElement>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  selectedQualitySectionList: any;
  sectionRank: any;
  @Input()
  public data: any;
  sectionName: any;


  constructor(private fb: FormBuilder,private setLanguageService: SetLanguageService,
    readonly sessionstorage:SessionStorageService,private qualitySupervisorService: QualitySupervisorService,private confirmationService: ConfirmationService) { }
  
  validateWhitespace(control: FormControl) {
    if(control.value !== null && control.value !== undefined){
    const isWhitespace = control.value.trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
    }
  }

  validateNonWhitespace(control: FormControl) {
    const value = control.value;
    if (value === null || value === undefined || value === "" || value.trim().length > 0) {
      return null; // Field is valid if null or contains only whitespace
    }
  
    return { nonWhitespace: true }; // Field is invalid if it contains non-whitespace characters
  }
  ngOnInit(): void {
    this.getSelectedLanguage();
    if (
      this.data.qualityAuditSectionData !== null &&
      this.data.qualityAuditSectionData !== undefined
    ) {
      this.qualityAuditSectionList = this.data.qualityAuditSectionData;
    }

    if (
      this.data.selectedAuditSectionData !== null &&
      this.data.selectedAuditSectionData !== undefined
    ) {
      this.selectedQualitySectionList = this.data.selectedAuditSectionData;
      console.log(this.selectedQualitySectionList);
      this.patchValuesForEdit();
    }
  }

  editqualityAuditSectionForm = this.fb.group({
    sectionId:[''],
    sectionName: ['', [Validators.required, this.validateWhitespace]],
    rank: ['', Validators.required],
    sectionDesc: ['',[this.validateNonWhitespace]]
  })  
  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  } 

  patchValuesForEdit(){
    this.editqualityAuditSectionForm.controls['sectionId'].patchValue(
      this.selectedQualitySectionList.sectionId
    );

    this.editqualityAuditSectionForm.controls['sectionName'].patchValue(
      this.selectedQualitySectionList.sectionName
    );  
    this.editqualityAuditSectionForm.controls['rank'].patchValue(
      this.selectedQualitySectionList.rank
    );
     this.editqualityAuditSectionForm.controls['sectionDesc'].patchValue(
      this.selectedQualitySectionList.sectionDesc
    );  	
  }
  
 
  updateSectionConfiguration(editValue: any){
    const reqObj ={
      sectionId : editValue.sectionId,
      sectionName:editValue.sectionName ,
      rank: editValue.rank,
      sectionDesc: editValue.sectionDesc,
      createdBy: this.sessionstorage.getItem('userName'),
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
      deleted: false,
      modifiedBy: this.sessionstorage.getItem('userName'),
    };
    const checkFromMainList = this.checkDuplicateRangeFromMainList(reqObj)
    console.log(reqObj);
    if(checkFromMainList===false){
      this.qualitySupervisorService.updateSectionConfiguration(reqObj).subscribe(
        (response: any) => {
          if (response && response.response) {
            this.confirmationService.openDialog(
              response.response,
              'success'
            );
            this.editqualityAuditSectionForm.reset(this.editqualityAuditSectionForm.value);
            this.qualitySupervisorService.createComponent(
              QualitySectionConfigurationComponent,
              null
            );
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
    else {
      this.confirmationService.openDialog(
        this.currentLanguageSet.rankExist,
        'error'
      );
    }
      
    }

    checkDuplicateRangeFromMainList(rankObj: any) {
      let value = false;
      if (this.qualityAuditSectionList.length > 0) {
        if (rankObj.rank === this.selectedQualitySectionList.rank) {
          value = false;
        }
        else {
          for (let j = 0; j < this.qualityAuditSectionList.length; j++) {
            if (this.qualityAuditSectionList[j].deleted === false) {
              if (this.qualityAuditSectionList[j].rank === rankObj.rank) {
                value = true
              }
            }
  
          }
        }
  
        if (value === true) {
          return true
        }
        else {
          return false
        }
      }
      else{
        return false;
      }
    }

  back() {
    this.confirmationService
      .openDialog(
        "Do you really want to cancel? Any unsaved data would be lost",
        'confirm'
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
         this.resetForm();
          this.dataSource.data = [];
          this.dataSource.paginator = this.paginator;
          this.qualitySupervisorService.createComponent(
            QualitySectionConfigurationComponent,
            null
          );
        }
      });
  }
  resetForm() {
    this.editqualityAuditSectionForm.reset();
   }

}
export interface sectionElement {
  id:number;
  sectionName: string;
  sectionDescription: string;
  rank: number;
  action: any;
}
