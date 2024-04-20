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
import { AbstractControl, FormArray, FormBuilder } from '@angular/forms';
import { MatLegacyCheckboxChange as MatCheckboxChange } from '@angular/material/legacy-checkbox';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { SectionQuestionnaireMappingComponent } from '../section-questionnaire-mapping/section-questionnaire-mapping.component';
import { MatPaginator } from '@angular/material/paginator';
/**
 * DE40034072
 * 02-02-2023
 */
@Component({
  selector: 'app-create-section-questionnaire-mapping',
  templateUrl: './create-section-questionnaire-mapping.component.html',
  styleUrls: ['./create-section-questionnaire-mapping.component.css'],
})
export class CreateSectionQuestionnaireMappingComponent implements OnInit, DoCheck, AfterViewInit {
  totalRecords = 0;
  currentLanguageSet: any;
  roles :any = [];
  roleName: any =[];
  @Input()
  public data: any;
  displayedColumns: string[] = [
    'sno',
    'questionnaireType',
    'questionnaire',
    'rank',
    'roleType',
    'selected',
  ];
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;
  mapSectionQuestionnaireMainList: any;

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    if (this.paginator && this.sort) {
      this.applyFilter('');
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  sectionList: any[] = [];
  enableQuestionnaireTable = false;
  selectedQuestionnaires: any[] = [];
  constructor(
    private confirmationService: ConfirmationService,
    private setLanguageService: SetLanguageService,
    private supervisorService: SupervisorService,
    private fb: FormBuilder,
    private masterService: MasterService
  ) {}

  sectionQuestionnaireMapForm = this.fb.group({
    sectionid: [''],
    sectionName: [''],
    searchTerm: [''],
    questionnaireList: this.fb.array([]),
    quesDupList: this.fb.array([]),
    roleType: ['']
  });

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSectionMaster();
    this.getRolesForQuestionare();
    if (
      this.data.mapSectionQuestionnaireData !== undefined &&
      this.data.mapSectionQuestionnaireData !== null
    ) {
      this.mapSectionQuestionnaireMainList =
        this.data.mapSectionQuestionnaireData;
    }
  }

  ngDoCheck() {
    this.getSelectedLanguage();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;

    // this.data.sortingDataAccessor = (data: AbstractControl, sortHeaderId: string) => {
    //   const value: any = data.value[sortHeaderId];
    //   return typeof value === 'string' ? value.toLowerCase() : value;
    // };
    this.dataSource.sort = this.sort;
  }

  

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  get questionnaireList() {
    return this.sectionQuestionnaireMapForm.get(
      'questionnaireList'
    ) as FormArray;
  }

  get quesDupList() {
    return this.sectionQuestionnaireMapForm.get(
      'quesDupList'
    ) as FormArray;
  }
  
  /**
   * Fetching section masters
   */
  getSectionMaster() {


    const psmId = sessionStorage.getItem('providerServiceMapID');

    this.masterService.getSectionMaster(psmId).subscribe(
      (response: any) => {
        if (response) {
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

  /**
   * Fetching list of unmapped questionnaires for mapping with section
   * @param sectionId
   */
  getUnMappedQuestionnaireMaster(sectionId: any) {
    const psmId = sessionStorage.getItem('providerServiceMapID');
    this.questionnaireList.controls = [];
    this.quesDupList.controls = [];
    this.dataSource.data.filter((quesValues: any) => {
      this.questionnaireList.controls.push(quesValues);
    });
    this.dataSource.data.filter((quesValues: any) => {
      this.quesDupList.controls.push(quesValues);
    });
    this.enableQuestionnaireTable = false;
    const sectionIdValue = sectionId;
    this.resetForm();
    this.setSectionName(sectionIdValue);
    this.dataSource.data = [];
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    let questionnaireData: any = [];



    this.supervisorService
      .getUnMappedQuestionnaires(psmId, sectionId)
      .subscribe(
        (response: any) => {
          if (response) {
            questionnaireData = response;

            questionnaireData.filter((values: any) => {
              this.questionnaireList.push(
                this.fb.group({
                  questionnaireId: values.questionnaireId,
                  questionnaireType: values.questionnaireType,
                  questionnaire: values.questionnaire,
                  roleType: null,
                  selected: null,
                  rank: null,
                })
              );
              this.quesDupList.push(
                this.fb.group({
                  questionnaireId: values.questionnaireId,
                  questionnaireType: values.questionnaireType,
                  questionnaire: values.questionnaire,
                  roleType: null,
                  selected: null,
                  rank: null,
                })
              );
            });
            this.enableQuestionnaireTable = true;
            this.dataSource.data = this.questionnaireList.controls;
            this.dataSource.data.forEach((item: any)=>{
              if(!(
                item.value.rank !== null &&
                item.value.rank !== undefined &&
                item.value.rank !== ''
              ) ||  !(
                item.value.roleType !== null &&
                item.value.roleType !== undefined &&
                item.value.roleType !== ''
              )){
                 item.get('selected')?.disable();
              }
              else{
               item.get('selected')?.enable();
              }
             });
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

  getActualIndex(indexValues: number) {
    if (this.paginator !== null && this.paginator !== undefined)
      return indexValues + this.paginator.pageSize * this.paginator.pageIndex;
    else return indexValues + 0;
  }

  /**
   * Adding selected questionnaires in the request array
   * @param event
   * @param item
   */
  addQuestionnaire(event: MatCheckboxChange, item: any) {
    if (event.checked) {
      const isDuplicateRank = this.checkDuplicateRank(item);
      const isDuplicateRankFromMainList = this.checkDuplicateFromMainList(item);
      if (isDuplicateRank === false && isDuplicateRankFromMainList === false) {
        item.selected = true;
        const selectedItem = {
          questionnaireId: item.questionnaireId,
          rank: item.rank,
          roles: item.roleType
        };
        this.selectedQuestionnaires.push(selectedItem);

        let newIndex1: any;
        this.quesDupList.controls.forEach((sourceValue: any, index) => {
          if (
            sourceValue.controls.questionnaireId.value ===
            item.questionnaireId
          )
          newIndex1 = index;
        });
        this.quesDupList.controls[newIndex1].patchValue({ selected:  true });
      } else {
        this.confirmationService.openDialog(
          this.currentLanguageSet.rankAlreadyExists,
          'error'
        );
        item.selected = false;
        item.rank = null;
        let newIndex: any;
        this.questionnaireList.controls.forEach((sourceValue: any, index) => {
          if (
            sourceValue.controls.questionnaireId.value === item.questionnaireId
          )
            newIndex = index;
        });
        this.questionnaireList.controls[newIndex].patchValue({
          selected: null,
        });
        this.questionnaireList.controls[newIndex].patchValue({
          rank: null,
        });


        let newIndex1: any;
        this.quesDupList.controls.forEach((sourceValue: any, index) => {
          if (
            sourceValue.controls.questionnaireId.value === item.questionnaireId
          )
          newIndex1 = index;
        });
        this.quesDupList.controls[newIndex1].patchValue({
          selected: null,
        });
        this.quesDupList.controls[newIndex1].patchValue({
          rank: null,
        });

        
      }
    } else {
      this.selectedQuestionnaires.forEach((value, index) => {
        if (value.questionnaireId === item.questionnaireId)
          this.selectedQuestionnaires.splice(index, 1);
      });
      item.selected = false;

      let newIndex1: any;
      this.quesDupList.controls.forEach((sourceValue: any, index) => {
        if (
          sourceValue.controls.questionnaireId.value ===
          item.questionnaireId
        )
        newIndex1 = index;
      });
      this.quesDupList.controls[newIndex1].patchValue({ selected:  false });
    }
    console.log('selectedQuestionnaires', this.selectedQuestionnaires);

   
  }

  /**
   * Validating duplicate ranks from main table list
   * @param item
   * @returns
   */
  checkDuplicateFromMainList(item: any) {
    let isDuplicate = false;
    this.mapSectionQuestionnaireMainList.filter((values: any) => {
      if (
        values.sectionQuestionRank === item.rank &&
        values.sectionid ===
          this.sectionQuestionnaireMapForm.controls['sectionid'].value &&
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
    this.selectedQuestionnaires.filter((values: any) => {
      if (values.rank === item.rank) {
        isDuplicate = true;
      }
    });

    return isDuplicate;
  }

  /**
   * Unselecting the questionnaire
   * @param item
   */
  removeCheck(item: any) {
    // item.get('selected').enable();
    if((
      item.value.rank !== null &&
      item.value.rank !== undefined &&
      item.value.rank !== ''
    ) && (
      item.value.roleType !== null &&
      item.value.roleType !== undefined &&
      item.value.roleType !== ''
    )){
        item.get('selected').enable();
    }
    if (item.value.rank <= 0 || item.value.rank > 10000) {
      item.value.rank = null;

      let newIndexes: any;
      this.questionnaireList.controls.forEach((sourceValue: any, index) => {
        if (
          sourceValue.controls.questionnaireId.value ===
          item.value.questionnaireId
        )
          newIndexes = index;
      });
      this.questionnaireList.controls[newIndexes].patchValue({ rank: null });
      item.value.selected = false;
      this.questionnaireList.controls[newIndexes].patchValue({
        selected: null,
      });

      let newIndexes1: any;
      this.quesDupList.controls.forEach((sourceValue: any, index) => {
        if (
          sourceValue.controls.questionnaireId.value ===
          item.value.questionnaireId
        )
        newIndexes1 = index;
      });
      this.quesDupList.controls[newIndexes1].patchValue({ rank: null });
      item.value.selected = false;
      this.quesDupList.controls[newIndexes1].patchValue({
        selected: null,
      });
    }
    if (
      item.value.rank === null ||
      item.value.rank === undefined ||
      item.value.rank === ''
    ) {
      let newIndex: any;
      this.questionnaireList.controls.forEach((sourceValue: any, index) => {
        if (
          sourceValue.controls.questionnaireId.value ===
          item.value.questionnaireId
        )
          newIndex = index;
      });

      item.value.selected = false;
      this.questionnaireList.controls[newIndex].patchValue({ selected: null });
      this.selectedQuestionnaires.forEach((value, index) => {
        if (value.questionnaireId === item.value.questionnaireId)
          this.selectedQuestionnaires.splice(index, 1);
      });


      let newIndex1: any;
      this.quesDupList.controls.forEach((sourceValue: any, index) => {
        if (
          sourceValue.controls.questionnaireId.value ===
          item.value.questionnaireId
        )
        newIndex1 = index;
      });

      item.value.selected = false;
      this.quesDupList.controls[newIndex1].patchValue({ selected: null });
      // this.selectedQuestionnaires.forEach((value, index) => {
      //   if (value.questionnaireId === item.value.questionnaireId)
      //     this.selectedQuestionnaires.splice(index, 1);
      // });
    }

    else {
      let newIndex1: any;
      this.quesDupList.controls.forEach((sourceValue: any, index) => {
        if (
          sourceValue.controls.questionnaireId.value ===
          item.value.questionnaireId
        )
        newIndex1 = index;
      });

      // // item.value.selected = false;
      this.quesDupList.controls[newIndex1].patchValue({ rank:  item.value.rank });
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
          this.dataSource.data = [];
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.supervisorService.createComponent(
            SectionQuestionnaireMappingComponent,
            null
          );
        }
      });
  }

  /**
   * Resetting form data
   */
  resetForm() {
    this.questionnaireList.controls.filter((quesValues: any) => {
      quesValues.controls.rank.setValue(null);
      quesValues.controls.selected.setValue(null);
    });
    this.selectedQuestionnaires = [];
    while (this.questionnaireList.length !== 0) {
      this.questionnaireList.removeAt(0);
    }
    this.sectionQuestionnaireMapForm.reset();

    this.quesDupList.controls.filter((quesValues: any) => {
      quesValues.controls.rank.setValue(null);
      quesValues.controls.selected.setValue(null);
    });
    while (this.quesDupList.length !== 0) {
      this.quesDupList.removeAt(0);
    }

  }

  /**
   * For saving section questionnaire map details
   */
  saveSectionQuestionnaireMapping() {
    const reqObj: any = {
      questionIds: this.selectedQuestionnaires,
      sectionId: this.sectionQuestionnaireMapForm.controls['sectionid'].value,
      // sectionName:this.sectionQuestionnaireMapForm.controls['sectionName'].value,
      createdBy: sessionStorage.getItem('userName'),
      psmId: sessionStorage.getItem('providerServiceMapID'),
    };
  
    this.supervisorService.saveQuestionnaireSectionMapping(reqObj).subscribe(
      (response: any) => {
        if (response && response.response) {
          this.confirmationService.openDialog(
            this.currentLanguageSet.sectionQuestionnaireMappedSuccessfully,
            'success'
          );
          this.resetForm();
          this.dataSource.data = [];
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.supervisorService.createComponent(
            SectionQuestionnaireMappingComponent,
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
   * Setting section name
   * @param sectionIdValue
   */
  setSectionName(sectionIdValue: any) {
    this.sectionQuestionnaireMapForm.controls['sectionid'].setValue(
      sectionIdValue
    );
    this.sectionList.filter((values) => {
      if (values.sectionId === sectionIdValue) {
        this.sectionQuestionnaireMapForm.controls['sectionName'].setValue(
          values.sectionName
        );
      }
    });
  }

  /**
   * For In Table Search
   * @param searchTerm
   */
  filterSearchTerm(searchTerm: any) {
    if (!searchTerm) {
      this.questionnaireList.controls  = this.quesDupList.controls;
      this.dataSource.data = this.quesDupList.controls;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } else {
      this.questionnaireList.controls = [];
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.quesDupList.controls.forEach((item: any) => {
        for (const key in item.controls) {
          if (key === 'questionnaireType' || key === 'questionnaire') {
            const value: string = '' + item.controls[key].value;
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.dataSource.data.push(item);
              this.questionnaireList.controls.push(item);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
              break;
            }
          }
        }
      });
    }
  }

  getRolesForQuestionare(){
    const  providerServiceMapId = sessionStorage.getItem('providerServiceMapID');
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
