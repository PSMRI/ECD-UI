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
import { FormArray, FormBuilder,FormControl,FormGroup,Validators } from '@angular/forms';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { QaQuestionConfigComponent } from '../../qa-question-config/qa-question-config/qa-question-config.component';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-create-qa-question-config',
  templateUrl: './create-qa-question-config.component.html',
  styleUrls: ['./create-qa-question-config.component.css']
})
export class CreateQaQuestionConfigComponent implements OnInit, DoCheck {

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @Input()
  public data: any; 
  enableEdit = false;
  sectionList: any[] = [];
  answerTypeList: any[] = [];
  selectedAuditorId: any;
  selectedRoleId: any;
  currentLanguageSet: any;
  dataSource = new MatTableDataSource<questionnaireMapping>();
  displayedColumns: string[] = ['sNo' ,'questionnaire', 'questionRank', 'answerType', 'roles', 'options', 'scores', 'sectionName', 'action'];
  @Input() minValue = 1;
  @Input() maxValue = 50;
  numericValue: number | undefined; 
  populateQuestionTable = false;
  isOptionFilled = false;
  qaQuestionnaireConfigList: any = [];
  isFatalQues = false;
  roles: any = [];

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private qualitysupervisorService: QualitySupervisorService,
    private masterService: MasterService,
    private setLanguageService: SetLanguageService,
    readonly sessionstorage:SessionStorageService,
  ) { }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getAnswerTypeMaster();
    if (
      this.data.isEdit !== null &&
      this.data.isEdit !== undefined &&
      this.data.isEdit === true
    ) {
      this.enableEdit = true;
    } else {
      this.enableEdit = false;
    }
    this.getQuestionnaires();
    this.getRolesForQuestionare();
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
      option: ['', [Validators.required, this.validateWhitespace]],
      scores: ['', Validators.required],
    });
  }

  createQualityAuditorQuestionnaireForm = this.fb.group({
    questionnaire: ['', [Validators.required, this.validateWhitespace]],
    isFatalQues: false,
    sectionId: [''],
    sectionName: ['', Validators.required],
    rank: ['', Validators.required],
    answerType: [''],
    newOption: this.fb.array([this.createOptionField()]),
    roles:['']
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

 

  get newOption(): FormArray {
    return this.createQualityAuditorQuestionnaireForm.get('newOption') as FormArray;
  }

  onClickOfFatalQues(event: any) {
    const isChecked = event.checked;
    // this.createQualityAuditorQuestionnaireForm.get('isFatalQues')?.setValue(event.checked);
    this.createQualityAuditorQuestionnaireForm.patchValue({ isFatalQues: isChecked});
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
    this.createQualityAuditorQuestionnaireForm.reset();
  }

  removeQuestionnaire(index: any) {
    this.dataSource.data.splice(index, 1);
    this.dataSource.paginator = this.paginator;
  }

/**
 * Fetching masters
 */
  getAnswerTypeMaster() {
    this.masterService.getAnswerTypeMaster().subscribe(
      (response: any) => {
        if (response) {
          const answerTypeArr = response;
          answerTypeArr.filter((values: any) => {
            if (values.answerType.toLowerCase() === "radio") {
              this.answerTypeList.push(values);
              this.createQualityAuditorQuestionnaireForm.controls['answerType'].setValue(values.answerType);
            }
          });
        }
      });
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

  /**
 * Setting answer type and also enabling options according to answer type
 * @param answerTypeValue
 */
  setAnswerType(answerTypeValue: any) {
    const selectedOption = this.answerTypeList.find((value) => value.answerType.toLowerCase() === 'radio');
  
    if (selectedOption) {
      this.createQualityAuditorQuestionnaireForm.controls['answerType'].setValue(selectedOption.answerType);
    }
  }

  getSectionId(){
    const sectionName = this.createQualityAuditorQuestionnaireForm.controls.sectionName.value;
    this.sectionList.filter((item: any) => {
      if(item.sectionName === sectionName)
      this.createQualityAuditorQuestionnaireForm.controls.sectionId.patchValue(item.sectionId);
    });
  }

  onClickOfAdd(addData: any) {
    this.populateQuestionTable = true;
    const options:any =[];
    const scores:any =[];
    addData.newOption.filter((values: any) => {
      options.push(values.option);
      scores.push(values.scores);
    })
    console.log(addData);
    const sectionObj: any = {
      questionRank: addData.rank,
      questionnaire: addData.questionnaire,
      answerType: addData.answerType,
      sectionName: addData.sectionName,
      sectionId: addData.sectionId,
      options: options,
      scores: scores,
      isFatalQues: addData.isFatalQues,
      roles: addData.roles,
      createdBy: this.sessionstorage.getItem('userName'),
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
    };
    const checkTableList = this.checkDuplicateRank(sectionObj);
    if(checkTableList === false){
    this.dataSource.data.push(sectionObj);
    this.dataSource.paginator = this.paginator;
    this.createQualityAuditorQuestionnaireForm.reset();
    this.newOption.clear(); // remove all added options and scores
    this.newOption.push(this.fb.group({ // add a new empty option and score
      option: ['', Validators.required],
      scores: ['', Validators.required],
    }));
    } else {
      this.confirmationService.openDialog(
        this.currentLanguageSet.rankExist,
        'error'
      );
    }
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

  checkDuplicateRank(questionObj: any) {
    for (let j = 0; j < this.qaQuestionnaireConfigList.length; j++) {
      if (this.qaQuestionnaireConfigList[j].sectionId === questionObj.sectionId && 
          this.qaQuestionnaireConfigList[j].questionRank === questionObj.questionRank && 
          this.qaQuestionnaireConfigList[j].deleted === false) {
        return true;
      }
    }
  
    if (this.dataSource.data.length > 0) {
      for (let i = 0; i < this.dataSource.data.length; i++) {
        if (this.dataSource.data[i].sectionId === questionObj.sectionId && 
            this.dataSource.data[i].questionRank === questionObj.questionRank) {
          return true;
        }
      }
    }
  
    return false;
  }
  

  addQuestionnaireConfig() {
    this.qualitysupervisorService.saveQuestionConfiguration(this.dataSource.data).subscribe(
      (response: any) => {
        if (response) {
          this.confirmationService.openDialog(
            response.response,
            'success'
          );
          this.dataSource.data = [];
          this.dataSource.paginator = this.paginator;
          this.qualitysupervisorService.createComponent(
            QaQuestionConfigComponent,
            null
          );
        } else {
          this.confirmationService.openDialog(response.errorMessage, 'error');
        }
      },
      (err) => {
        if(err && err.error)
        this.confirmationService.openDialog(err.error, 'error');
        else
        this.confirmationService.openDialog(err.title + err.detail, 'error')
        });
  }

  getRolesForQuestionare(){
    const  providerServiceMapId = this.sessionstorage.getItem('providerServiceMapID');
    this.masterService.getRoleMaster(providerServiceMapId).subscribe((res:any)=>{
      if(res){
        res.filter((role: any) => {
          if(!["supervisor", "quality auditor","quality supervisor"].includes(role.roleName.toLowerCase()) ){
            this.roles.push(role)
          }
        })
      }
    })
  }

  setRoleType(role: any) {
    if (![null, undefined].includes(role)) {
      this.createQualityAuditorQuestionnaireForm.controls['roles'].setValue(role);
    }

  }

}

export interface questionnaireMapping {
  rank: any;
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
  roles:string[];
}
