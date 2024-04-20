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
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Router } from '@angular/router';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { LoginserviceService } from 'src/app/app-modules/services/loginservice/loginservice.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { CreateQuestionnaireComponent } from '../create-questionnaire/create-questionnaire.component';
import { MatPaginator } from '@angular/material/paginator';
/**
 * DE40034072
 * 25-01-2023
 */
@Component({
  selector: 'app-questionnaire-configuration',
  templateUrl: './questionnaire-configuration.component.html',
  styleUrls: ['./questionnaire-configuration.component.css'],
})
export class QuestionnaireConfigurationComponent implements OnInit, DoCheck, AfterViewInit {
  currentLanguageSet: any;
  displayedColumns: string[] = [
    'sno',
    'questionRank',
    'questionnaireType',
    'questionnaire',
    'edit',
    'delete',
  ];
  dataSource = new MatTableDataSource<questionnaireElement>();
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  questionnaireList: any[] = [];
  searchTerm: any;
  mapSectionQuestionnaireList: any;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  constructor(
    private setLanguageService: SetLanguageService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private supervisorService: SupervisorService,
    private loginService: LoginserviceService
  ) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getQuestionnaires();
    this.getSectionQuestionnairesMapDetails();
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

    /**
   * Fetching Section Questionnaire Mapping Details
   */
    getSectionQuestionnairesMapDetails() {
      
  
      const providerServiceMapID = sessionStorage.getItem('providerServiceMapID');
      this.supervisorService
        .getSectionQuestionnaireMap(providerServiceMapID)
        .subscribe(
          (response: any) => {
            if (response) {            
              this.mapSectionQuestionnaireList = response;
             
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
   * Fetching Questionnaire Details
   */
  getQuestionnaires() {
   
      const psmId = sessionStorage.getItem('providerServiceMapID');

    this.supervisorService.getQuestionnaires(psmId).subscribe(
      (response: any) => {
        if (response) {
       
          this.questionnaireList = response;

          this.questionnaireList.forEach((quesValues: any, index: number) => {
            quesValues.sno = index + 1;
          });
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

  /**
   * Navigating to Create Questionnaire screen
   */
  openCreateQuestionnaire() {
    const reqObj = {
      questionnaireData: this.questionnaireList,
      isEdit: false,
    };
    this.supervisorService.createComponent(
      CreateQuestionnaireComponent,
      reqObj
    );
  }

  /** Navigating to edit questionnaire */

  editQuestionnaire(value: any) {
    const reqObj = {
      selectedQuestionnaireData: value,
      questionnaireData: this.questionnaireList,
      isEdit: true,
    };
    this.supervisorService.createComponent(
      CreateQuestionnaireComponent,
      reqObj
    );
  }

  /**
   * For activating and deactivating questionnaires
   * @param tableValue
   * @param type
   */

  activateDeactivateQuestionnaire(tableValue: any, type: any) {
    let isDuplicateMap = false;
    const isDuplicateFromMainList = this.checkDuplicateFromMainList(tableValue);
    if (isDuplicateFromMainList === true && type === 'activate') {
      this.confirmationService.openDialog(
        this.currentLanguageSet.rankAlreadyExistsUnableToActivate,
        'error'
      );
    } else {
      let status: any = null;
      if (type === 'activate') {
        status = 'Activate';
      } else {
        status = 'Deactivate';
        isDuplicateMap = this.checkSectionQuestionMapExist(tableValue);
      }

      if(isDuplicateMap) {

        this.confirmationService.openDialog(
        this.currentLanguageSet.questionnaireSectionMapAlreadyExistDeactivate,
          'error'
        );
      }
      else {
      this.confirmationService
        .openDialog(
          this.currentLanguageSet.areYouSureWantTo + ' ' + status + '?',
          'confirm'
        )
        .afterClosed()
        .subscribe((response) => {
          if (response) {
            const reqObj: any = {
              questionnaireId: tableValue.questionnaireId,
              questionRank: tableValue.questionRank,
              questionnaireTypeId: tableValue.questionnaireTypeId,
              questionnaireType: tableValue.questionnaireType,
              questionnaire: tableValue.questionnaire,
              answerTypeId: tableValue.answerTypeId,
              answerType: tableValue.answerType,
              questionnaireValues: tableValue.questionnaireValues,
              deleted: type === 'activate' ? 'false' : 'true',
              createdBy: sessionStorage.getItem('userName'),
      modifiedBy: sessionStorage.getItem('userName'),
      psmId: sessionStorage.getItem('providerServiceMapID')
            };

            this.supervisorService.updateQuestionnaire(reqObj).subscribe(
              (response: any) => {
                if (response && response.response) {
                  this.confirmationService.openDialog(
                    status + 'd ' + this.currentLanguageSet.successfully,
                    'success'
                  );
                  this.searchTerm = null;
                  this.dataSource.data = [];
                  this.dataSource.paginator = this.paginator;
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
                });
          
          }
        });
      }
    }
  }

  checkSectionQuestionMapExist(tableValue:any) {
    let isDuplicateValue = false;
    if(this.mapSectionQuestionnaireList !== undefined && this.mapSectionQuestionnaireList !== null && 
      this.mapSectionQuestionnaireList.length > 0 ) {

        this.mapSectionQuestionnaireList.filter((values:any) => {
          if (
            (values.questionid === tableValue.questionnaireId) &&
            values.deleted === false
          ) {
            isDuplicateValue = true;
          }
        });
      
    }

    return isDuplicateValue;
  }

  checkDuplicateFromMainList(mapObj: any) {
    let isDuplicate = false;
    this.questionnaireList.filter((values) => {
      if (
        (values.questionRank === mapObj.questionRank) &&
        values.questionnaireId !== mapObj.questionnaireId &&
        values.deleted === false
      ) {
        isDuplicate = true;
      }
    });

    return isDuplicate;
  }

  /**
   * For In Table Search
   * @param searchTerm
   */

  filterSearchTerm(searchTerm?: string) {
    if (!searchTerm) {
      this.dataSource.data = this.questionnaireList;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
      this.questionnaireList.forEach((item) => {
        for (const key in item) {
          if (
            key === 'questionRank' ||
            key === 'questionnaireType' ||
            key === 'questionnaire'
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
}

export interface questionnaireElement {
  sno: number;
  questionRank: number;
  questionnaireTypeId: number;
  questionnaireType: string;
  questionnaire: string;
  answerTypeId: any;
  answerType: any;
  questionnaireValues: any;
  deleted: any;
}
