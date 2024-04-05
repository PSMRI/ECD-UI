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


import { AfterViewInit, Component, DoCheck, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatLegacyChipInputEvent as MatChipInputEvent } from '@angular/material/legacy-chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTable as MatTable, MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { QuestionnaireConfigurationComponent } from '../questionnaire-configuration/questionnaire-configuration.component';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
/**
 * DE40034072
 * 25-01-2023
 */
@Component({
  selector: 'app-create-questionnaire',
  templateUrl: './create-questionnaire.component.html',
  styleUrls: ['./create-questionnaire.component.css'],
})
export class CreateQuestionnaireComponent implements OnInit, DoCheck, AfterViewInit {
  questionnaireTypeList: any[] = [];

  answerTypeList: any[] = [];
  questionnaireTypeTitle: any;
  enableOption = false;
  optionList: any[] = [];
  finalOptionList: any[] = [];
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  // questionnaireList: any[] = [];
  displayedColumns: string[] = [
    'questionRank',
    'questionnaireType',
    'questionnaire',
    'answerType',
    'options',
    'actions',
  ];
  dataSource = new MatTableDataSource<questionElement>();
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  currentLanguageSet: any;
  @Input()
  public data: any;
  enableEdit = false;
  questionnaireList: any[] = [];
  selectedQuestionnaireList: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private confirmationService: ConfirmationService,
    private setLanguageService: SetLanguageService,
    private supervisorService: SupervisorService,
    private masterService: MasterService
  ) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getQuestionnaireTypeMaster();
    

    if (
      this.data.isEdit !== null &&
      this.data.isEdit !== undefined &&
      this.data.isEdit === true
    ) {
      this.enableEdit = true;
    } else {
      this.enableEdit = false;
    }

  
  }

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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  createQuestionnaireForm = this.fb.group({
    questionRank: [''],
    questionnaireTypeId: [''],
    questionnaireType: [''],
    questionnaire: ['',[this.validateWhitespace]],
    answerTypeId: [''],
    answerType: [''],
    options: [''],
  });

  editQuestionnaireForm = this.fb.group({
    questionnaireId: [''],
    questionRank: [''],
    questionnaireTypeId: [''],
    questionnaireType: [''],
    questionnaire: ['',[this.validateWhitespace]],
    answerTypeId: [''],
    answerType: [''],
    options: [''],
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

  /**
   * Fetching QuestionnaireType Master
   */
  getQuestionnaireTypeMaster() {

    this.masterService.getQuestionnaireTypeMaster().subscribe(
      (response: any) => {
        if (response) {
          this.questionnaireTypeList = response;
          this.getAnswerTypeMaster();
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
   * Fetching answer type master
   */
  getAnswerTypeMaster() {
 
    this.masterService.getAnswerTypeMaster().subscribe(
      (response: any) => {
        if (response) {
          this.answerTypeList = response;
          this.setEditValues();
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


  setEditValues() {
    if (
      this.data.questionnaireData !== null &&
      this.data.questionnaireData !== undefined
    ) {
      this.questionnaireList = this.data.questionnaireData;
    }

    if (
      this.data.selectedQuestionnaireData !== null &&
      this.data.selectedQuestionnaireData !== undefined
    ) {
      this.selectedQuestionnaireList = this.data.selectedQuestionnaireData;
      this.patchValuesForEdit();
    }
  }

  /**
   * Patching questionnaire values for update
   */
  patchValuesForEdit() {
    this.editQuestionnaireForm.controls['questionnaireId'].patchValue(
      this.selectedQuestionnaireList.questionnaireId
    );

    this.editQuestionnaireForm.controls['questionRank'].patchValue(
      this.selectedQuestionnaireList.questionRank
    );

    this.editQuestionnaireForm.controls['questionnaireTypeId'].patchValue(
      this.selectedQuestionnaireList.questionnaireTypeId
    );
    this.setQuestionnaireTypeNameForEdit(
      this.selectedQuestionnaireList.questionnaireTypeId
    );

    this.editQuestionnaireForm.controls['questionnaire'].patchValue(
      this.selectedQuestionnaireList.questionnaire
    );

    if (
      this.selectedQuestionnaireList.questionnaireType.toLowerCase() ===
      'question'
    ) {
     

      this.answerTypeList.filter((answerVal) => {
        if (answerVal.answerType ===  this.selectedQuestionnaireList.answerType) {
          this.editQuestionnaireForm.controls['answerTypeId'].patchValue(answerVal.answerTypeId);
        }
      });

      this.setAnswerTypeForEdit(this.editQuestionnaireForm.controls['answerTypeId'].value);

      if (
        this.selectedQuestionnaireList.answerType.toLowerCase() === 'radio' ||
        this.selectedQuestionnaireList.answerType.toLowerCase() ===
          'dropdown' ||
        this.selectedQuestionnaireList.answerType.toLowerCase() === 'multiple'
      ) {

        this.selectedQuestionnaireList.questionnaireValues.filter((optionValues:any) => {
          this.optionList.push(optionValues.options);
        });

        this.editQuestionnaireForm.controls['options'].patchValue(
          this.optionList.toString()
        );
        // this.optionList = this.selectedQuestionnaireList.options;
      }
    }
  }

  /**
   * Setting questionnaireType name and enabling answer types according to questionnaireType
   * @param questionnaireTypeValue
   *
   */
  setQuestionnaireTypeName(questionnaireTypeValue: any) {
    this.questionnaireTypeList.filter((values) => {
      if (values.questionTypeId === questionnaireTypeValue) {
        this.createQuestionnaireForm.controls['questionnaireType'].setValue(
          values.questionType
          
        );
      }
      
    });

    this.questionnaireTypeTitle =
      this.createQuestionnaireForm.controls['questionnaireType'].value;

    if (this.questionnaireTypeTitle.toLowerCase() === 'question') {
      this.createQuestionnaireForm.controls['answerTypeId'].setValidators(
        Validators.required
      );
      this.createQuestionnaireForm.controls['answerTypeId'].setValue(null);
      this.createQuestionnaireForm.controls['answerType'].setValue(null);
    } else {
      this.createQuestionnaireForm.controls['answerTypeId'].clearValidators();
      this.createQuestionnaireForm.controls['answerTypeId'].setValue(null);
      this.createQuestionnaireForm.controls['answerType'].setValue(null);

      this.createQuestionnaireForm.controls['options'].clearValidators();
      this.createQuestionnaireForm.controls['options'].setValue(null);
      this.optionList = [];
      this.finalOptionList = [];
      this.enableOption = false;
    }
  }

  setQuestionnaireTypeNameForEdit(questionnaireTypeValue: any) {
    this.questionnaireTypeList.filter((values) => {
      if (values.questionTypeId === questionnaireTypeValue) {
        this.editQuestionnaireForm.controls['questionnaireType'].setValue(
          values.questionType
        );
      }
    });

    this.questionnaireTypeTitle =
      this.editQuestionnaireForm.controls['questionnaireType'].value;

    if (this.questionnaireTypeTitle.toLowerCase() === 'question') {
      this.editQuestionnaireForm.controls['answerTypeId'].setValidators(
        Validators.required
      );
      this.editQuestionnaireForm.controls['answerTypeId'].setValue(null);
      this.editQuestionnaireForm.controls['answerType'].setValue(null);
    } else {
      this.editQuestionnaireForm.controls['answerTypeId'].clearValidators();
      this.editQuestionnaireForm.controls['answerTypeId'].setValue(null);
      this.editQuestionnaireForm.controls['answerType'].setValue(null);

      this.editQuestionnaireForm.controls['options'].clearValidators();
      this.editQuestionnaireForm.controls['options'].setValue(null);
      this.optionList = [];
      this.finalOptionList = [];
      this.enableOption = false;
    }
  }

  /**
   * Setting answer type and also enabling options according to answer type
   * @param answerTypeValue
   */
  setAnswerType(answerTypeValue: any) {
    this.answerTypeList.filter((values) => {
      if (values.answerTypeId === answerTypeValue) {
        this.createQuestionnaireForm.controls['answerType'].setValue(
          values.answerType
        );
      }
    });
    this.createQuestionnaireForm.controls['options'].setValue(null);
    this.optionList = [];
    this.finalOptionList = [];

    if (
      this.createQuestionnaireForm.controls['answerType'].value !== null &&
      this.createQuestionnaireForm.controls['answerType'].value !== undefined &&
      (this.createQuestionnaireForm.controls[
        'answerType'
      ].value.toLowerCase() === 'radio' ||
        this.createQuestionnaireForm.controls[
          'answerType'
        ].value.toLowerCase() === 'dropdown' ||
        this.createQuestionnaireForm.controls[
          'answerType'
        ].value.toLowerCase() === 'multiple')
    ) {
      this.enableOption = true;
    } else {
      this.enableOption = false;
    }
  }

  setAnswerTypeForEdit(answerTypeValue: any) {
    this.answerTypeList.filter((values) => {
      if (values.answerTypeId === answerTypeValue) {
        this.editQuestionnaireForm.controls['answerType'].setValue(values.answerType);
      }
    });

    this.editQuestionnaireForm.controls['options'].setValue(null);
    this.optionList = [];
    this.finalOptionList = [];

    if (
      this.editQuestionnaireForm.controls['answerType'].value !== null &&
      this.editQuestionnaireForm.controls['answerType'].value !== undefined &&
      (this.editQuestionnaireForm.controls['answerType'].value.toLowerCase() ===
        'radio' ||
        this.editQuestionnaireForm.controls[
          'answerType'
        ].value.toLowerCase() === 'dropdown' ||
        this.editQuestionnaireForm.controls[
          'answerType'
        ].value.toLowerCase() === 'multiple')
    ) {
      this.enableOption = true;
    } else {
      this.enableOption = false;
    }
  }

  /**
   * Adding Options
   * @param event
   */
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      if(!this.optionList.includes(value.trim())) {
      this.optionList.push(value.trim());
      const optionObj = {
        "id": null,
        "options": value.trim(),
        "questionId": this.editQuestionnaireForm.controls['questionnaireId'].value,
        "psmId": sessionStorage.getItem('providerServiceMapID'),
        "deleted": false,
        "createdBy": sessionStorage.getItem("userName"),
      };
      this.finalOptionList.push(optionObj);
      this.editQuestionnaireForm.markAsDirty();
    }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  /**
   * Removing Options
   * @param optionValues
   */
  remove(optionValues: any): void {
    const index = this.optionList.indexOf(optionValues);

    if (index >= 0) {
      this.optionList.splice(index, 1);
      this.finalOptionList.splice(index, 1);
      this.editQuestionnaireForm.markAsDirty();
    }
  }

  /**
   * Adding questionnaires to buffer table
   */
  addQuestionnaires(formData: any) {
    console.log(formData)
    let questionnaireObj: any = {};
    questionnaireObj = {
      questionRank: formData.questionRank,
      questionnaireTypeId: formData.questionnaireTypeId,
      questionnaireType: formData.questionnaireType,
      questionnaire: formData.questionnaire,
      answerTypeId:
        formData.questionnaireType.toLowerCase() === 'question'
          ? formData.answerTypeId
          : null,
      answerType:
        formData.questionnaireType.toLowerCase() === 'question'
          ? formData.answerType
          : null,
      questionnaireValues: this.enableOption === true ? this.finalOptionList : null,
      options: this.enableOption === true ? this.optionList : null,
      createdBy: sessionStorage.getItem('userName'),
      psmId: sessionStorage.getItem('providerServiceMapID')
    };

    const isDuplicate = this.checkDuplicateValues(questionnaireObj);
    const isDuplicateFromMainList =
      this.checkDuplicateFromMainList(questionnaireObj);
    if (isDuplicate === true || isDuplicateFromMainList === true) {
      this.confirmationService.openDialog(
        this.currentLanguageSet.rankOrQuestionnaireAlreadyExists,
        'info'
      );
    } else {
      this.dataSource.data.push(questionnaireObj);
      this.dataSource.paginator = this.paginator;

      this.resetForm();
    }
  }

  /**
   * For checking duplicate questionnaires
   */
  checkDuplicateValues(questionnaireObj: any) {
    let isDuplicate = false;
    this.dataSource.data.filter((values) => {
      if (
        values.questionRank === questionnaireObj.questionRank) {
        isDuplicate = true;
      }
    });

    return isDuplicate;
  }

  checkDuplicateFromMainList(questionnaireObj: any) {
    let isDuplicate = false;
    this.questionnaireList.filter((values) => {
      if (
        (values.questionRank === questionnaireObj.questionRank) &&
        values.deleted === false
      ) {
        isDuplicate = true;
      }
    });

    return isDuplicate;
  }

  checkDuplicateFromMainListForEdit(questionnaireObj: any) {
    let isDuplicate = false;
    this.questionnaireList.filter((values) => {
      if (
        (values.questionRank === questionnaireObj.questionRank) &&
        values.questionnaireId !== questionnaireObj.questionnaireId &&
        values.deleted === false
      ) {
        isDuplicate = true;
      }
    });

    return isDuplicate;
  }

  /**
   * Resetting forms
   */
  resetForm() {
    this.optionList = [];
    this.finalOptionList = [];
    this.enableOption = false;
    this.questionnaireTypeTitle = null;
    this.createQuestionnaireForm.reset();
  }

  resetFormEdit() {
    this.optionList = [];
    this.finalOptionList = [];
    this.enableOption = false;
    this.questionnaireTypeTitle = null;
    this.editQuestionnaireForm.reset();
  }

  /**
   * For saving questionnaires
   */
  saveQuestionnaires() {
    console.log(this.dataSource.data);
    // let reqObj: any = {
    //   questionnaireDetail: this.dataSource.data,
    //   createdBy: sessionStorage.getItem('userName'),
    //   psmId: sessionStorage.getItem('providerServiceMapID'),
    // };
    this.supervisorService.saveQuestionnaire(this.dataSource.data).subscribe(
      (response: any) => {
        if (response && response.response) {
          this.confirmationService.openDialog(
            this.currentLanguageSet.questionnaireCreatedSuccessfully,
            'success'
          );
          this.resetForm();
          this.dataSource.data = [];
          this.dataSource.paginator = this.paginator;
          this.supervisorService.createComponent(
            QuestionnaireConfigurationComponent,
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
        });
  
  }

  /**
   * For removing questionnaires from buffer array
   * @param index
   */
  removeQuestionnaire(index: any) {
    this.dataSource.data.splice(index, 1);
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Navigating back to Questionnaire config screen
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
          if (this.enableEdit === false) this.resetForm();
          else this.resetFormEdit();
          this.dataSource.data = [];
          this.dataSource.paginator = this.paginator;
          this.supervisorService.createComponent(
            QuestionnaireConfigurationComponent,
            null
          );
          this.selectedQuestionnaireList = [];
          this.enableEdit = false;
        }
      });
  }

  /**
   *For Updating questionnaires
   * @param editValue
   */
  updateQuestionnaires(editValue: any) {
    let optionReq :any = [];
    if(this.selectedQuestionnaireList.questionnaireValues !== undefined && this.selectedQuestionnaireList.questionnaireValues !== null && this.selectedQuestionnaireList.questionnaireValues.length > 0) {
      this.optionList.filter((optionVal:any) => {
        let isOption = false;
        this.selectedQuestionnaireList.questionnaireValues.filter((questionOptionValue:any) => {
        if(questionOptionValue.options === optionVal) {
            optionReq.push(questionOptionValue);
            isOption = true;
        }
        });

        if(!isOption) {
          const req = {
            "id": null,
        "options": optionVal,
        "questionId": editValue.questionnaireId,
        "psmId": sessionStorage.getItem('providerServiceMapID'),
        "deleted": false,
        "createdBy": sessionStorage.getItem("userName"),
        //  "modifiedBy": sessionStorage.getItem("userName"),
       
          };
          optionReq.push(req);
        }
      });

      this.selectedQuestionnaireList.questionnaireValues.filter((newQuestionOptionValue:any) => {
        if(this.optionList.length > 0 && !(this.optionList.includes(newQuestionOptionValue.options))) {
     
            newQuestionOptionValue.deleted = true;
            newQuestionOptionValue.modifiedBy = sessionStorage.getItem("userName");
            optionReq.push(newQuestionOptionValue);
        }
    
      });

      if(this.optionList.length === 0) {
        this.selectedQuestionnaireList.questionnaireValues.filter((newQuestionOptionValue:any) => {
         
              newQuestionOptionValue.deleted = true;
              newQuestionOptionValue.modifiedBy = sessionStorage.getItem("userName");
              optionReq.push(newQuestionOptionValue);
           
        });
      } 
    }  

    else {
      optionReq = this.finalOptionList;
    }


    const reqObj: any = {
      questionnaireId: editValue.questionnaireId,
      questionRank: editValue.questionRank,
      questionnaireTypeId: editValue.questionnaireTypeId,
      questionnaireType: editValue.questionnaireType,
      questionnaire: editValue.questionnaire,
      answerTypeId: editValue.answerTypeId,
      answerType: editValue.answerType,
      questionnaireValues: optionReq,
      deleted: false,
      createdBy: sessionStorage.getItem('userName'),
      modifiedBy: sessionStorage.getItem('userName'),
      psmId: sessionStorage.getItem('providerServiceMapID'),
    };

    const isDuplicateFromMainList =
      this.checkDuplicateFromMainListForEdit(reqObj);
    if (isDuplicateFromMainList === true) {
      this.confirmationService.openDialog(
        this.currentLanguageSet.rankOrQuestionnaireAlreadyExists,
        'info'
      );
    } else {
      this.supervisorService.updateQuestionnaire(reqObj).subscribe(
        (response: any) => {
          if (response && response.response) {
            this.confirmationService.openDialog(
              this.currentLanguageSet.questionnaireUpdatedSuccessfully,
              'success'
            );
            this.resetFormEdit();
            this.supervisorService.createComponent(
              QuestionnaireConfigurationComponent,
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
          });
    
    }
  }
}

export interface questionElement {
  questionRank: number;
  questionnaireTypeId: number;
  questionnaireType: string;
  questionnaire: string;
  answerTypeId: number;
  answerType: string;
  options: any;
}
