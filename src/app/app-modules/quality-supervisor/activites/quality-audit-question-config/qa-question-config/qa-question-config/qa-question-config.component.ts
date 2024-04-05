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


import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { CreateQaQuestionConfigComponent } from '../../create-qa-question-config/create-qa-question-config/create-qa-question-config.component';
import { EditQaConfigComponent } from '../../edit-qa-question-config/edit-qa-config/edit-qa-config.component';

@Component({
  selector: 'app-qa-question-config',
  templateUrl: './qa-question-config.component.html',
  styleUrls: ['./qa-question-config.component.css']
})
export class QaQuestionConfigComponent implements OnInit, AfterViewInit { 
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  qaQuestionnaireConfigList: any[] = [];
  searchTerm: any;
  currentLanguageSet: any;
  dataSource = new MatTableDataSource<questionnaireConfig>();
  displayedColumns: string[] = [
    'sno',
    'rank',
    'questionnaire',
    'answerType',
    'sectionName',
    'edit',
    'delete',
  ];
  mappedSectionQuestionaire= [];
  sectionList: any[] = [];

  constructor(
    private qualitysupervisorService: QualitySupervisorService,
    private setLanguageService: SetLanguageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.getQuestionnaires();
    this.getSelectedLanguage();
    this.getSections();
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

  filterSearchTerm(searchTerm?: string) {
    if (!searchTerm) {
      this.dataSource.data = this.qaQuestionnaireConfigList;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
      this.qaQuestionnaireConfigList.forEach((item) => {
        for (const key in item) {
          if (
            key === 'question' ||
            key === 'rank' ||
            key === 'sectionName'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.dataSource.data.push(item);
              this.dataSource.paginator = this.paginator;
              break;
            }
          }
        }
      });
    }
  }

  createNewQuestionnaireConfig() {
    const reqObj = {
      qaQuestionnaireData: this.qaQuestionnaireConfigList,
      isEdit: false,
    };
    this.qualitysupervisorService.createComponent(CreateQaQuestionConfigComponent, reqObj);
  }

  getQuestionnaires() {
    this.qaQuestionnaireConfigList = [];
    const psmId= sessionStorage.getItem('providerServiceMapID');
    this.qualitysupervisorService.getQuestionnaireData(psmId).subscribe(
      (response: any) => {
        if (response) {
          this.qaQuestionnaireConfigList = response;
          this.dataSource.data = response;
          this.dataSource.paginator = this.paginator;
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

  getSections() {
    const reqObj: any = {
      psmId: sessionStorage.getItem('providerServiceMapID'),
    };
    this.qualitysupervisorService.getAuditSectionMap(reqObj.psmId).subscribe(
      (response: any) => {
        if (response && response.length > 0) {
          this.sectionList = response;
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
  activateDeactivateQuestionConfig(tableValue: any, type: any) {
    const checkingSectionDeactivate = this.checkIfSectionIsDeleted(tableValue);
    const isDuplicateFromMainList = this.checkDuplicateFromMainList(tableValue);
    if(type === 'activate' && checkingSectionDeactivate === true) {
      this.confirmationService.openDialog(
        this.currentLanguageSet.pleaseActivateTheDeactivatedSection,
        'error'
      );
    }
    else if (isDuplicateFromMainList === true && type === 'activate') {
      this.confirmationService.openDialog(
        this.currentLanguageSet.rankAlreadyExistsUnableToActivate,
        'error'
      );
    } else { 
      this.activateOrDeactivate(tableValue, type);
    }
  }

  activateOrDeactivate(tableValue: any, type: any) {  
    let status: any = null;
    if (type === 'activate') {
      status = 'Activated';
    } else {
      status = 'Deactivated';
    }
    
  const result:any=this.checkedQuestionnaireMapperdList(tableValue);
  if(result===false){
    this.confirmationService
      .openDialog(
        this.currentLanguageSet.areYouSureWantTo + ' ' + type + '?',
        'confirm'
      )
      .afterClosed()
      .subscribe((response) => {
        if (response) {
          const reqObj: any = {
            id: tableValue.questionId,
            options: tableValue.options,
            scores: tableValue.scores,
            sectionId: tableValue.sectionId,
            sectionName: tableValue.sectionName,
            questionId: tableValue.questionId,
            questionnaire: tableValue.question,
            questionRank: tableValue.questionRank,
            answerType: tableValue.answerType,
            createdBy: sessionStorage.getItem('userName'),
            psmId: sessionStorage.getItem('providerServiceMapID'),
            deleted: type === 'activate' ? false : true,
            modifiedBy: sessionStorage.getItem('userName'),
          };

          this.qualitysupervisorService.updateQuestionConfiguration(reqObj).subscribe(
            (response: any) => {
              if (response  && response.response) {
                this.confirmationService.openDialog(
                  status + ' ' + this.currentLanguageSet.successfully,
                  'success'
                );
                this.dataSource.data = [];
                // this.dataSource.paginator = this.paginator;
                // this.dataSource.sort = this.sort;
                this.getQuestionnaires();
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
              }
          );
        }
      });
  }
  
    } 

    checkedQuestionnaireMapperdList(tableValue:any){
    let isSectionMapped=false
    this.mappedSectionQuestionaire.filter((values:any)=>{
      if(values.sectionName===tableValue.sectionName && values.deleted===false){
        this.confirmationService.openDialog(
          this.currentLanguageSet.cannotDeactivateSectionAlreadyMappped,
          'error'
        );
        isSectionMapped  = true;
      }
    });
    return  isSectionMapped;
    }

  checkDuplicateFromMainList(mapObj: any) {
    let isDuplicate = false;
    this.qaQuestionnaireConfigList.filter((values) => {
      if (
        ( 
          values.questionRank === mapObj.questionRank &&
          values.sectionName === mapObj.sectionName) &&
        values.deleted === false
      ) {
        isDuplicate = true;
      }
    });

    return isDuplicate;
  }

  checkIfSectionIsDeleted(value: any) {
    for (let j = 0; j < this.sectionList.length; j++) {
      if (this.sectionList[j].sectionId === value.sectionId &&
          this.sectionList[j].deleted === true) {
        return true;
      }
    }
    return false;
  }

  editQAQuestionnarieConfig(value: any) {
    this.qualitysupervisorService.createComponent(
      EditQaConfigComponent,
      value
    );
  }
}

export interface questionnaireConfig {
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
