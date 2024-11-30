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


import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { QualitySectionConfigurationComponent } from '../quality-section-configuration/quality-section-configuration.component';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/app-modules/services/core/session-storage.service';


@Component({
  selector: 'app-createquality-section-configuration',
  templateUrl: './createquality-section-configuration.component.html',
  styleUrls: ['./createquality-section-configuration.component.css']
})
export class CreatequalitySectionConfigurationComponent implements OnInit, AfterViewInit {
  currentLanguageSet: any;
  item:any;
  qualityAuditSectionList:any=[];
  enableEdit = false;
  displayedColumns: string[] = ['sectionName', 'sectionDescription', 'rank','action'];
  dataSource = new MatTableDataSource<sectionElement>();
  // dataSource = new MatTableDataSource<sectionElement>();
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @Input()
  public data: any;
  sectionName: any;
  sectionRank: any;
  
  constructor(private fb: FormBuilder,private setLanguageService: SetLanguageService,
    readonly sessionstorage:SessionStorageService,private qualitySupervisorService: QualitySupervisorService,private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.getSelectedLanguage();
  }

  createQualityAuditSectionForm = this.fb.group({
    sectionName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50),this.validateWhitespace]],
    sectionDescription: ['', [Validators.minLength(5), Validators.maxLength(500), this.validateNonWhitespace]],
    rank: ['', Validators.required]
  })  


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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  } 


  addSections(formData: any) {
    console.log(formData)
    let sectionObj: any = {};
    sectionObj = {
      sectionName: formData.sectionName,
      sectionDesc: formData.sectionDescription,
      rank: formData.rank,
      createdBy: this.sessionstorage.userName,
      psmId: this.sessionstorage.getItem('providerServiceMapID')
    };

    const checkfromBufferList = this.checkDuplicateRank(sectionObj);
    const checkFromMainList = this.checkDuplicateRangeFromMainList(sectionObj)
    if (checkfromBufferList === false && checkFromMainList === false) {
      this.dataSource.data.push(sectionObj);
      this.dataSource.paginator = this.paginator;
      this.createQualityAuditSectionForm.reset();
    }
    else {
      this.confirmationService.openDialog(
        this.currentLanguageSet.rankExist,
        'error'
      );
    }

  }

  checkDuplicateRank(sectionObj: any) {
    let value = false;
    for (let j = 0; j < this.dataSource.data.length; j++) {
      if (this.dataSource.data[j].rank === sectionObj.rank) {
        value = true
      }
    }
    if (value === true) {
      return true
    }
    else {
      return false
    }
  }

  checkDuplicateRangeFromMainList(sectionObj: any){
    if(this.data.qualityAuditSectionData.length>0){
      let value = false;
    for (let j = 0; j < this.data.qualityAuditSectionData.length; j++) {
      if(this.data.qualityAuditSectionData[j].deleted===false){
        if(this.data.qualityAuditSectionData[j].rank===sectionObj.rank){
          value=true
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

  removeSection(index: any) {
    this.dataSource.data.splice(index, 1);
    this.dataSource.paginator = this.paginator;
  }

    
      /**
     * Validating duplicate rank from selected questionnaires
     * @param item
     * @returns
     */
    
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
          // else this.resetFormEdit();
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
    this.createQualityAuditSectionForm.reset();
  }

  createSectionConfiguration(){
    const reqObj ={
      sampleObj:this.dataSource.data
    }
    console.log('reqObj', reqObj);
    this.qualitySupervisorService.createSectionConfiguration(reqObj.sampleObj).subscribe(
      (response: any) => {    
        if (response) {
          this.confirmationService.openDialog(
            this.currentLanguageSet.sectionCreatedSuccessfully,
            'success'
          );
          this.resetForm();
          this.dataSource.data = [];
          this.dataSource.paginator = this.paginator;
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
}
export interface sectionElement {
  sectionName: string;
  sectionDescription: string;
  rank: number;
  action: any;
}
