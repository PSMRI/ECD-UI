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
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { CreateSectionQuestionnaireMappingComponent } from '../create-section-questionnaire-mapping/create-section-questionnaire-mapping.component';
import { EditSectionQuestionnaireMappingComponent } from '../edit-section-questionnaire-mapping/edit-section-questionnaire-mapping.component';
import { MatPaginator } from '@angular/material/paginator';
/**
 * DE40034072
 * 02-02-2023
 */
@Component({
  selector: 'app-section-questionnaire-mapping',
  templateUrl: './section-questionnaire-mapping.component.html',
  styleUrls: ['./section-questionnaire-mapping.component.css'],
})
export class SectionQuestionnaireMappingComponent implements OnInit, DoCheck, AfterViewInit {
  currentLanguageSet: any;
  displayedColumns: string[] = [
    'sno',
    'sectionName',
    'questionType',
    'question',
    'sectionQuestionRank',
    'role',
    'edit',
    'delete',
  ];
  dataSource = new MatTableDataSource();
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  mapSectionQuestionnaireList: any[] = [];
  searchTerm: any;
  constructor(
    private setLanguageService: SetLanguageService,
    private confirmationService: ConfirmationService,
    private supervisorService: SupervisorService
  ) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSectionQuestionnairesMapDetails();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
    let quesData: any = null;

    const providerServiceMapID = sessionStorage.getItem('providerServiceMapID');
    this.supervisorService
      .getSectionQuestionnaireMap(providerServiceMapID)
      .subscribe(
        (response: any) => {
          if (response) {
            quesData = response;
            quesData.forEach((quesValues: any, index: number) => {
              quesValues.sno = index + 1;
            });
            this.mapSectionQuestionnaireList = quesData;
            this.dataSource.data = response;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
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
   * Navigating to Create Section Questionnaire  Mapping Screen
   */
  openCreateSectionQuestionnaireMap() {
    const reqObj = {
      mapSectionQuestionnaireData: this.mapSectionQuestionnaireList,
    };
    this.supervisorService.createComponent(
      CreateSectionQuestionnaireMappingComponent,
      reqObj
    );
  }

  /** Navigating to edit questionnaire section mapping */
  editQuestionnaireSectionMapping(item: any) {
    const reqObj = {
      selectedQuestionnaireSectionData: item,
      questionnaireSectionData: this.mapSectionQuestionnaireList,
    };
    this.supervisorService.createComponent(
      EditSectionQuestionnaireMappingComponent,
      reqObj
    );
  }

  /**
   * For activating & deactivating section-questionnaire mapping
   * @param tableValue
   * @param type
   */
  activateDeactivateQuesSecMap(tableValue: any, type: any) {
    const isDuplicateFromMainList = this.checkDuplicateFromMainList(tableValue);
    if (isDuplicateFromMainList === true && type === 'activate') {
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
      status = 'Activate';
    } else {
      status = 'Deactivate';
    }

    this.confirmationService
      .openDialog(
        this.currentLanguageSet.areYouSureWantTo + ' ' + status + '?',
        'confirm'
      )
      .afterClosed()
      .subscribe((response) => {
        console.log(response);
        if (response) {
          tableValue.deleted = type === 'activate' ? false : true;
          tableValue.modifiedBy= sessionStorage.getItem('userName')
          const reqObj: any = {
            id: tableValue.id,
            questionId: tableValue.questionid,
            sectionId: tableValue.sectionid,
            // sectionName: tableValue.sectionName,
            rank: tableValue.sectionQuestionRank,
            role: tableValue.role,
            createdBy: sessionStorage.getItem('userName'),
            modifiedBy: sessionStorage.getItem('userName'),
            deleted: type === 'activate' ? false : true,
            psmId: sessionStorage.getItem('providerServiceMapID')
           
          };

          

          this.supervisorService.updateQuestionnaireSectionMapping(reqObj).subscribe(
            (response: any) => {
              if (response && response.response) {
                this.confirmationService.openDialog(
                  status + 'd ' + this.currentLanguageSet.successfully,
                  'success'
                );
                this.searchTerm = null;
                this.dataSource.data = [];
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.getSectionQuestionnairesMapDetails();
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

  /**
   * Checking for duplicate rank before activating
   * @param mapObj
   * @returns
   */
  checkDuplicateFromMainList(mapObj: any) {
    let isDuplicate = false;
    const secQuesList = this.mapSectionQuestionnaireList.filter((values) => {
      if (
        values.sectionid === mapObj.sectionid &&
        values.sectionQuestionRank === mapObj.sectionQuestionRank &&
        values.id !== mapObj.id &&
        values.deleted === false
      ) {
        isDuplicate = true;
      }
    });
    console.log('secQuesList', secQuesList);

    return isDuplicate;
  }

  /**
   * For In Table Search
   * @param searchTerm
   */
  filterSearchTerm(searchTerm?: string) {
    if (!searchTerm) {
      this.dataSource.data = this.mapSectionQuestionnaireList;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } else {
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.mapSectionQuestionnaireList.forEach((item) => {
        for (const key in item) {
          if (
            key === 'sectionName' ||
            key === 'question' ||
            key === 'questionType' ||
            key === 'sectionQuestionRank'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.dataSource.data.push(item);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
              break;
            }
          }
        }
      });
    }
  }
}

export interface mapSectionQuestionnaireElement {
  sno: number;
  id: number;
  questionid: number;
  sectionQuestionRank: number;
  role: string;
  questionType: string;
  question: string;
  sectionid: number;
  sectionName: string;
  deleted: any;
}
