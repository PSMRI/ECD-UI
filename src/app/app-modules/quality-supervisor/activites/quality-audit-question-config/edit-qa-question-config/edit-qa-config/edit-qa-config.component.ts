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


import { Component, DoCheck, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { QaQuestionConfigComponent } from '../../qa-question-config/qa-question-config/qa-question-config.component';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-edit-qa-config',
  templateUrl: './edit-qa-config.component.html',
  styleUrls: ['./edit-qa-config.component.css']
})
export class EditQaConfigComponent implements OnInit, DoCheck {
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @Input()
  public data: any;
  enableEdit = false;
  dataSource = new MatTableDataSource<audtiorMapping>();
  qualityAuditorAgentMappingList:any[]=[];
  selectedQuestionnaireData:any
  sectionList: any[] = [];
  answerTypeList: any[] = [];
  qaQuestionnaireConfigList: any =[];
  currentLanguageSet: any;
  @Input() minValue = 1;
  @Input() maxValue = 50;
  numericValue: number | undefined; 
  isOptionFilled = false;
  isFatalQues = false;
  
  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private qualitysupervisorService: QualitySupervisorService,
    private setLanguageService: SetLanguageService,
    readonly sessionstorage:SessionStorageService,
    private masterService: MasterService,
  ) { }

  editQualityAuditorQuestionnaireForm = this.fb.group({
    sectionId:[''],
    question: ['', [Validators.required,this.validateWhitespace]],
    isFatalQues: false,
    sectionName: ['', Validators.required],
    questionRank: ['', Validators.required],
    answerType: ['', Validators.required],
    questionId: [''],
    newOption: this.fb.array([this.createOptionField()])
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
    this.getSelectedLanguage();
    this.getAnswerMaster();
    this.getSectionList();
    this.getQuestionnaires();
    if (this.data){
      this.editQualityAuditorQuestionnaireForm.patchValue(this.data);
      const options = this.data.options;
      const scores = this.data.scores;
      this.newOption.clear();
      options.forEach((option: any, index: any) => {
        this.newOption.push(this.fb.group({
          option: [option, Validators.required],
          scores: [scores[index], Validators.required],
        }));
      });
    }

    this.editQualityAuditorQuestionnaireForm.get('newOption')?.valueChanges.subscribe(() => {
      this.editQualityAuditorQuestionnaireForm.markAsDirty(); 
      });
  }

  onClickOfFatalQues(event: any) {
    const isChecked = event.checked;
    // this.createQualityAuditorQuestionnaireForm.get('isFatalQues')?.setValue(event.checked);
    this.editQualityAuditorQuestionnaireForm.patchValue({ isFatalQues: isChecked});
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

  selectedAgents(listOfAgents:any[]){
    const listOfAgentNames:any[]=[]
    for (let i = 0; i < listOfAgents.length; i++) {
        listOfAgentNames.push(listOfAgents[i].name)
      }
      return listOfAgentNames
  }

  addOption() {
    console.log("option added", this.isOptionFilled);
    this.newOption.push(this.fb.group({
      option: ['', Validators.required],
      scores: ['', Validators.required],
    }));
    this.isOptionFilled = true;
  }

  removeOption(index: number) {
    this.newOption.removeAt(index);
    if (this.newOption.length === 0) {
      this.isOptionFilled = false;
    }
  }

  createOptionField(): FormGroup {
    return this.fb.group({
      option: ['', [Validators.required,this.validateWhitespace]],
      scores: ['', Validators.required],
    });
  }

  get newOption(): FormArray {
    return this.editQualityAuditorQuestionnaireForm.get('newOption') as FormArray;
  }

    /**
 * Fetching masters
 */
  getAnswerMaster() {
    this.masterService.getAnswerTypeMaster().subscribe(
      (response: any) => {
        if (response) {
          const answerTypeArr = response;
          answerTypeArr.filter((values: any) => {
            if (values.answerType.toLowerCase() === "radio") {
              this.answerTypeList.push(values);
              this.editQualityAuditorQuestionnaireForm.controls['answerType'].setValue(values.answerType);
            }
          });
        }
      });
    }

    getSectionList(){
      const reqObj: any = {
        psmId: this.sessionstorage.getItem('providerServiceMapID'),
      };

    this.qualitysupervisorService.getAuditSectionMap(reqObj.psmId).subscribe(
      (response: any) => {
        if (response && response.length > 0) {
          response.filter((item:any) => {
            if(item.deleted === false) {
              this.sectionList.push(item);
            }
          })
          // this.sectionList = response;
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

    getQuestionnaires() {
      this.qaQuestionnaireConfigList = [];
      const psmId= this.sessionstorage.getItem('providerServiceMapID');
      this.qualitysupervisorService.getQuestionnaireData(psmId).subscribe(
        (response: any) => {
          if (response) {
            this.qaQuestionnaireConfigList = response;
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

    getSectionId(){
      const sectionName = this.editQualityAuditorQuestionnaireForm.controls.sectionName.value;
      this.sectionList.filter((item: any) => {
        if(item.sectionName === sectionName)
        this.editQualityAuditorQuestionnaireForm.controls.sectionId.patchValue(item.sectionId);
      });
    }

    checkDuplicateRank(questionObj: any) {
      for (let j = 0; j < this.qaQuestionnaireConfigList.length; j++) {
        if (this.qaQuestionnaireConfigList[j].sectionId === questionObj.sectionId && 
            this.qaQuestionnaireConfigList[j].questionRank === questionObj.questionRank
          && this.qaQuestionnaireConfigList[j].deleted === false && 
          this.qaQuestionnaireConfigList[j].questionId !== questionObj.questionId) {
          return true
        }
      }
        return false
    }

  updateQualityAuditQuestionnaire(editValueData: any) {
    const optionValue:any=[];
    const scores: any = [];
    editValueData.newOption.filter((values: any) => {
      optionValue.push(values.option);
      scores.push(values.scores);
    });
    const reqObj: any = {
      id: editValueData.questionId,
      questionnaire: editValueData.question,
      questionRank: editValueData.questionRank,
      answerType: editValueData.answerType,
      sectionId: editValueData.sectionId,
      sectionName: editValueData.sectionName,
      sectionRank: editValueData.sectionRank,
      deleted: false,
      isFatalQues: editValueData.isFatalQues,
      createdBy: this.sessionstorage.getItem('userName'),
      modifiedBy: this.sessionstorage.getItem('userName'),
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
      options: optionValue,
      scores: scores
    };
    console.log(reqObj);
    if(!this.checkDuplicateRank(editValueData)){
    this.qualitysupervisorService.updateQuestionConfiguration(reqObj).subscribe(
      (response: any) => {
        if (response && response.response) {
          this.confirmationService.openDialog(
            response.response,
            'success'
          );
          this.editQualityAuditorQuestionnaireForm.reset(this.editQualityAuditorQuestionnaireForm.value);
          this.qualitysupervisorService.createComponent(
            QaQuestionConfigComponent,
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
    } else {
      this.confirmationService.openDialog(
        this.currentLanguageSet.rankExist,
        'error'
      );
    }
  }

/**
 * Setting answer type and also enabling options according to answer type
 * @param answerTypeValue
 */
setAnswerType(answerTypeValue: any) {
  const selectedOption = this.answerTypeList.find((value) => value.answerType.toLowerCase() === 'radio');

  if (selectedOption) {
    this.editQualityAuditorQuestionnaireForm.controls['answerType'].setValue(selectedOption.answerType);
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
          if (this.enableEdit === false) this.resetForm();
          // else this.resetFormEdit();
          this.dataSource.data = [];
          this.dataSource.paginator = this.paginator;
          this.qualitysupervisorService.createComponent(
            QaQuestionConfigComponent,
            null
          );
          // this.selectedQuestionnaireList = [];
          this.enableEdit = false;
        }
      });
  }

  resetForm() {
    this.editQualityAuditorQuestionnaireForm.reset();
   }

}

export interface audtiorMapping {
  questionRank: number;
  questionnaireId: number;
  questionnaire: string;
  answerTypeId: number;
  answerType: string;
  options: any;
  score: any;
  sectionId: number;
  sectionName: string;
  sectionRank: number;
}
