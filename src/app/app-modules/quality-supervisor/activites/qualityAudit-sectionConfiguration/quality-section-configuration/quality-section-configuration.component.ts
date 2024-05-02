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
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { CreatequalitySectionConfigurationComponent } from '../createquality-section-configuration/createquality-section-configuration.component';
import { EditQualitySectionConfigurationComponent } from '../edit-quality-section-configuration/edit-quality-section-configuration.component';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-quality-section-configuration',
  templateUrl: './quality-section-configuration.component.html',
  styleUrls: ['./quality-section-configuration.component.css']
})
export class QualitySectionConfigurationComponent implements OnInit, AfterViewInit, DoCheck {

  currentLanguageSet: any;
  displayedColumns: string[] = [
    'sno',
    'sectionName',
    'sectionDescription',
    'rank',
    'edit',
    'delete'
  ];
  dataSource = new MatTableDataSource();
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  mapSectionQuestionnaireList: any[] = [];
  searchTerm: any;
  qualityAuditSectionList: any = [];
  mappedSectionQuestionaire=[];
  constructor(
    private setLanguageService: SetLanguageService,
    private confirmationService: ConfirmationService,
    private qualitySupervisorService: QualitySupervisorService
  ) {}
  ngOnInit(): void {
    this.getQuestionaireConfiguartionMap()
    this.getSelectedLanguage();
    this.getAuditSectionDetails();
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
  getAuditSectionDetails() {
    const reqObj: any = {
      psmId: sessionStorage.getItem('providerServiceMapID'),
    };
    this.qualitySupervisorService
      .getAuditSectionMap(reqObj.psmId)
      .subscribe(
        (response: any) => {
          if (response) {
            this.qualityAuditSectionList = response;
            this.qualityAuditSectionList.forEach((sectionCount: any, index: number) => {
              sectionCount.sno = index + 1;
            });
            this.dataSource.data = response;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
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
          }
      );
  }
  openCreateAuditSection() {
    const reqObj = {
      qualityAuditSectionData: this.qualityAuditSectionList,
    };
    this.qualitySupervisorService.createComponent(CreatequalitySectionConfigurationComponent,reqObj);
  }

  editAuditSection(item: any) {
    const reqObj = {
      selectedAuditSectionData: item,
      qualityAuditSectionData: this.qualityAuditSectionList,
      isEdit: true,
    };
    this.qualitySupervisorService.createComponent(
      EditQualitySectionConfigurationComponent,
      reqObj
    );
  }

  getQuestionaireConfiguartionMap(){
    const reqObj: any = {
      psmId: sessionStorage.getItem('providerServiceMapID'),
    };
    this.qualitySupervisorService
      .getListOfMapQuestionaireConfiguration(reqObj.psmId)
      .subscribe(
        (response: any) => {
          if (response) {
            this.mappedSectionQuestionaire=response;
            console.log( this.mappedSectionQuestionaire);
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
   /**
   * For activating & deactivating section-questionnaire mapping
   * @param tableValue
   * @param type
   */
   activateDeactivateQuesSecMap(tableValue: any, type: any) {
    console.log(tableValue);
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
        status = 'Activated';
      } else {
        status = 'Deactivated';
      } 
      
    const result:any=this.checkedSectionMapperdList(tableValue,status);
    if(result ===true){
      this.confirmationService.openDialog(
        this.currentLanguageSet.cannotDeactivateSectionQusestionaire,
        'error'
      );
    }
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
              sectionId: tableValue.sectionId,
              sectionName: tableValue.sectionName,
              sectionDesc: tableValue.sectionDesc,
              rank: tableValue.rank,
              createdBy: sessionStorage.getItem('userName'),
              psmId: sessionStorage.getItem('providerServiceMapID'),
              deleted: type === 'activate' ? false : true,
              modifiedBy: sessionStorage.getItem('userName'),
            };
  
            this.qualitySupervisorService.updateSectionConfiguration(reqObj).subscribe(
              (response: any) => {
                if (response  && response.response) {
                  this.confirmationService.openDialog(
                    status + ' ' + this.currentLanguageSet.successfully,
                    'success'
                  );
                  this.dataSource.data = [];
                  this.dataSource.paginator = this.paginator;
                  this.dataSource.sort = this.sort;
                  this.getAuditSectionDetails();
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
    
     checkedSectionMapperdList(tableValue:any,status:any){
      let isSectionMapped=false
      this.mappedSectionQuestionaire.filter((values:any)=>{
        if(values.sectionId===tableValue.sectionId && values.deleted===false && status ==='Deactivated'){
          isSectionMapped  = true;
        }
      });
      return  isSectionMapped;
     }

   /**
   * Checking for duplicate rank before activating
   * @param mapObj
   * @returns
   */
   checkDuplicateFromMainList(mapObj: any) {
    let isDuplicate = false;
    this.qualityAuditSectionList.filter((values:any) => {
      if (
        values.rank === mapObj.rank &&
        values.deleted === false 
      ) {
        isDuplicate = true;
      }
    });
    return isDuplicate;
  }

    /**
   * Validating duplicate rank from selected questionnaires
   * @param item
   * @returns
   */
  
  
    checkDuplicateRank(item: any) {
      let isDuplicate = false;
      this.qualityAuditSectionList.filter((values: any) => {
        if (values.rank === item.rank) {
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
      this.dataSource.data = this.qualityAuditSectionList;
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
            key === 'questionnaire' ||
            key === 'questionnaireType' ||
            key === 'rank'
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
export interface qualityAuditSectionElement {
  sno: number;
  id: number;
  rank: number;
  sectionId: number;
  sectionName: string;
  deleted: any;
}
