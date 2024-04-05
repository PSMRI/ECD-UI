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


import { AfterViewInit, Component, DoCheck, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { SectionConfigurationComponent } from '../section-configuration/section-configuration.component';

/**
 * KA40094929
 */

@Component({
  selector: 'app-create-section-configuration',
  templateUrl: './create-section-configuration.component.html',
  styleUrls: ['./create-section-configuration.component.css']
})
export class CreateSectionConfigurationComponent implements OnInit, AfterViewInit, DoCheck {
  currentLanguageSet: any;
  languageData: any;
  displayedColumns: string[] = ['sNo', 'ecdSectionName', 'ecdSectionDescription', 'action'];

  addSection = new MatTableDataSource<sectionElement>();
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  constructor(
    private fb: FormBuilder,
    private setLanguageService: SetLanguageService,
    private supervisorService: SupervisorService,
    private confirmationService: ConfirmationService,
  ) { }

  sectionconfigurationform = this.fb.group({
    sectionName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(300), this.validateWhitespace]],
    sectionDesc: ['', [Validators.minLength(5), Validators.maxLength(500), this.validateNonWhitespace]],
  });


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
    this.addSection.paginator = this.paginator;
    this.addSection.sort = this.sort;
  }

  ngOnInit(): void {
    this.addSection.paginator = this.paginator;
    this.addSection.sort = this.sort;
  }

  ngDoCheck(){
    this.getSelectedLanguage();
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null)
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  goBack(){
    this.confirmationService
    .openDialog(
      this.currentLanguageSet.doYouReallyWantToCancelUnsavedData,
      'confirm'
    )
    .afterClosed() 
    .subscribe((res) => {
      if (res) {
        this.sectionconfigurationform.reset();
        this.supervisorService.createComponent(SectionConfigurationComponent, null);
      }
    });
  }

  addSections(formData: any) { 
    console.log("formData", formData)
      this.addSection.data.push(formData);
      this.addSection.paginator = this.paginator;
      console.log("addSection", this.addSection);
      this.sectionconfigurationform.reset();
  }

  removeSection(index: any) {
    this.addSection.data.splice(index, 1);
    this.addSection.paginator = this.paginator;
  }

  createSectionConfiguration(){
    const dataArray = [...this.addSection.data].map(element => ({
      ...element,
      createdBy: sessionStorage.getItem('userName'),
      psmId: sessionStorage.getItem('providerServiceMapID')
    }));
    const reqObj = dataArray;
    console.log('reqObj', reqObj);
    this.supervisorService.createSectionConfiguration(reqObj).subscribe((res: any) => {
      if(res){
      this.confirmationService.openDialog(this.currentLanguageSet.sectionConfigurationCreatedSuccessfully, 'success');
      this.sectionconfigurationform.reset();
      this.supervisorService.createComponent(SectionConfigurationComponent, null);
      }
      else{
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

}

export interface sectionElement {
  sNo: number;
  ecdSectionName: string;
  edit: any;
  action: any;
}
