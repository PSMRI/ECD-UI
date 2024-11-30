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
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { SessionStorageService } from 'src/app/app-modules/services/core/session-storage.service';
import { SectionConfigurationComponent } from '../section-configuration/section-configuration.component';

/**
 * KA40094929
 */

@Component({
  selector: 'app-edit-section-configuration',
  templateUrl: './edit-section-configuration.component.html',
  styleUrls: ['./edit-section-configuration.component.css']
})
export class EditSectionConfigurationComponent implements OnInit, DoCheck {
  @Input()
  public data: any;
  
  currentLanguageSet: any;
  languageData: any;

  constructor(
    private fb: FormBuilder,
    private setLanguageService: SetLanguageService,
    private supervisorService: SupervisorService,
    private confirmationService: ConfirmationService,
    readonly sessionstorage:SessionStorageService,
  ) { }

  editsectionconfigurationform = this.fb.group({
    sectionId: [''],
    sectionName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(300),this.validateWhitespace]],
    sectionDescription: ['', [Validators.minLength(5), Validators.maxLength(500), this.validateNonWhitespace]],
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
  
  ngOnInit(): void {
    this.editsectionconfigurationform.controls.sectionId.patchValue(this.data.sectionId)
    this.editsectionconfigurationform.controls.sectionName.patchValue(this.data.sectionName);
    this.editsectionconfigurationform.controls.sectionDescription.patchValue(this.data.sectionDesc);
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
        this.editsectionconfigurationform.reset();
        this.supervisorService.createComponent(SectionConfigurationComponent, null);
      }
    });
  }

  updateSectionConfiguration(){
    const reqObj ={
      sectionId: this.editsectionconfigurationform.controls.sectionId.value,
      sectionName: this.editsectionconfigurationform.controls.sectionName.value,
      sectionDesc: this.editsectionconfigurationform.controls.sectionDescription.value,
      createdBy: this.sessionstorage.userName,
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
      modifiedBy: this.sessionstorage.userName,
      deleted: false
    }
    this.supervisorService.updateSectionConfiguration(reqObj).subscribe((res: any) => {
      if(res){
      this.confirmationService.openDialog(this.currentLanguageSet.updatedSectionConfigurationSuccessfully, 'success');
      this.editsectionconfigurationform.reset();
      this.supervisorService.createComponent(SectionConfigurationComponent, null);
      }
      else{
        this.confirmationService.openDialog(res.errorMessage, 'error');
      }
    });
    (err: any) => {
    this.confirmationService.openDialog(err.error, 'error');
    }
  }

}
