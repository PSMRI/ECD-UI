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
import { FormBuilder } from '@angular/forms';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { SectionQuestionnaireMappingComponent } from '../section-questionnaire-mapping/section-questionnaire-mapping.component';
/**
 * DE40034072
 * 02-02-2023
 */
@Component({
  selector: 'app-edit-section-questionnaire-mapping',
  templateUrl: './edit-section-questionnaire-mapping.component.html',
  styleUrls: ['./edit-section-questionnaire-mapping.component.css'],
})
export class EditSectionQuestionnaireMappingComponent implements OnInit, DoCheck {
  currentLanguageSet: any;
  roles :any = [];
  roleName: any =[];
  @Input()
  public data: any;
  selectedQuestionnaireSectionList: any;
  questionnaireSectionMapList: any[] = [];
  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private setLanguageService: SetLanguageService,
    private supervisorService: SupervisorService,
    readonly sessionstorage:SessionStorageService,
    private masterService: MasterService
  ) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getRolesForQuestionare();
    if (
      this.data.selectedQuestionnaireSectionData !== null &&
      this.data.selectedQuestionnaireSectionData !== undefined
    ) {
      this.selectedQuestionnaireSectionList =
        this.data.selectedQuestionnaireSectionData;
    }

    if (
      this.data.questionnaireSectionData !== null &&
      this.data.questionnaireSectionData !== undefined
    ) {
      this.questionnaireSectionMapList = this.data.questionnaireSectionData;
    }

    this.patchSectionQuestionnaireMapDetails();
  }

  editQuestionnaireSectionMappingForm = this.fb.group({
    id: [''],
    sectionid: [''],
    sectionName: [{ value: '', disabled: true }],
    questionType: [{ value: '', disabled: true }],
    questionid: [''],
    question: [{ value: '', disabled: true }],
    sectionQuestionRank: [''],
    deleted: [''],
    roleType:['']
  });

  ngDoCheck() {
    this.getSelectedLanguage();
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  /**
   * Patching section questionnaire map details for update
   */
  patchSectionQuestionnaireMapDetails() {
    if (
      this.selectedQuestionnaireSectionList !== undefined &&
      this.selectedQuestionnaireSectionList !== null
    ) {
      this.editQuestionnaireSectionMappingForm.controls['id'].patchValue(
        this.selectedQuestionnaireSectionList.id
      );
      this.editQuestionnaireSectionMappingForm.controls['sectionid'].patchValue(
        this.selectedQuestionnaireSectionList.sectionid
      );
      this.editQuestionnaireSectionMappingForm.controls[
        'sectionName'
      ].patchValue(this.selectedQuestionnaireSectionList.sectionName);
      this.editQuestionnaireSectionMappingForm.controls[
        'questionType'
      ].patchValue(this.selectedQuestionnaireSectionList.questionType);
      this.editQuestionnaireSectionMappingForm.controls[
        'questionid'
      ].patchValue(this.selectedQuestionnaireSectionList.questionid);
      this.editQuestionnaireSectionMappingForm.controls[
        'question'
      ].patchValue(this.selectedQuestionnaireSectionList.question);
      this.editQuestionnaireSectionMappingForm.controls['sectionQuestionRank'].patchValue(
        this.selectedQuestionnaireSectionList.sectionQuestionRank
      );
      this.editQuestionnaireSectionMappingForm.controls['roleType'].patchValue(
        this.selectedQuestionnaireSectionList.roles
      );
      this.editQuestionnaireSectionMappingForm.controls['deleted'].patchValue(
        this.selectedQuestionnaireSectionList.deleted
      );
    }
  }

  /**
   * Navigating back to section questionnaire mapping screen
   */
  back() {
    this.confirmationService
      .openDialog(
        this.currentLanguageSet.doYouReallyWantToCancelUnsavedData,
        'confirm'
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.resetForm();
          this.supervisorService.createComponent(
            SectionQuestionnaireMappingComponent,
            null
          );
        }
      });
  }

  /** Resetting form data */
  resetForm() {
    this.editQuestionnaireSectionMappingForm.reset();
    this.selectedQuestionnaireSectionList = null;
    this.questionnaireSectionMapList = [];
  }

  /**
   * For updating section questionnaire map details
   * @param editValue
   */
  updateQuestionnairesSectionMap(editValue: any) {
    const reqObj: any = {
      id: editValue.id,
      questionId: editValue.questionid,
      sectionId: editValue.sectionid,
      // sectionName: this.editQuestionnaireSectionMappingForm.controls[
      //   'sectionName'
      // ].value,
      rank: editValue.sectionQuestionRank,
      roles: editValue.roleType,
      createdBy: this.sessionstorage.getItem('userName'),
      modifiedBy: this.sessionstorage.getItem('userName'),
      deleted: false,
      psmId: this.sessionstorage.getItem('providerServiceMapID')
    };
    console.log('reole',this.editQuestionnaireSectionMappingForm.controls.roleType.value);
    const isDuplicateFromMainList =
      this.checkDuplicateFromMainListForEdit(reqObj);
    if (isDuplicateFromMainList === true) {
      this.confirmationService.openDialog(
        this.currentLanguageSet.rankAlreadyExists,
        'error'
      );
    } else {
      this.supervisorService
        .updateQuestionnaireSectionMapping(reqObj)
        .subscribe(
          (response: any) => {
            if (response && response.response) {
              this.confirmationService.openDialog(
                this.currentLanguageSet
                  .sectionQuestionnaireMappingUpdatedSuccessfully,
                'success'
              );
              this.resetForm();
              this.supervisorService.createComponent(
                SectionQuestionnaireMappingComponent,
                null
              );
            } else {
              this.confirmationService.openDialog(
                response.errorMessage,
                'error'
              );
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

  /**
   * Checking duplicate rank before updating
   * @param questionnaireObj
   * @returns
   */
  checkDuplicateFromMainListForEdit(questionnaireObj: any) {
    let isDuplicate = false;
    this.questionnaireSectionMapList.filter((values) => {
      if (
        values.sectionid === questionnaireObj.sectionId &&
        values.sectionQuestionRank === questionnaireObj.rank &&
        values.id !== questionnaireObj.id &&
        values.deleted === false
      ) {
        isDuplicate = true;
      }
    });

    return isDuplicate;
  }
  getRolesForQuestionare(){
    const  providerServiceMapId = this.sessionstorage.getItem('providerServiceMapID');
    this.masterService.getRoleMaster(providerServiceMapId).subscribe((res:any)=>{
      if(res){
        res.filter((role: any) => {
          if(role.roleName.toLowerCase() !== "supervisor" &&role.roleName.toLowerCase() !== "quality auditor" && role.roleName.toLowerCase() !== "quality supervisor" ){
            this.roles.push(role)
          }
        })
      }
    })
   }
}
