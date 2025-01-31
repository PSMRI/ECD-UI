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


import { AfterViewInit, ChangeDetectorRef, Component, DoCheck, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { id } from 'date-fns/locale';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { CallConfigurationComponent } from '../call-configuration/call-configuration.component';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

/**
 * KA40094929
 */

@Component({
  selector: 'app-call-section-questionaire-mapping',
  templateUrl: './call-section-questionaire-mapping.component.html',
  styleUrls: ['./call-section-questionaire-mapping.component.css']
})
export class CallSectionQuestionaireMappingComponent implements OnInit, AfterViewInit, DoCheck, OnDestroy {

  @Input()
  public data: any;
  callTypeData: any = null;
  currentLanguageSet: any;
  displayedColumns: string[] = ['sNo', 'sectionName', 'rank', 'checked'];
  sectionRank: any;
  isChecked = false;
  searchTerm: any;

  sectionsList = new MatTableDataSource();
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  mappedSections: any = [];
  sectionMasters: any;
  enableSubmit = false;
  sectionMappedData: any = [];

  constructor(
    private fb: FormBuilder,
    private supervisorService: SupervisorService,
    private setLanguageService: SetLanguageService,
    private confirmationService: ConfirmationService,
    private changeDetectorRefs: ChangeDetectorRef,
    readonly sessionstorage:SessionStorageService,

  ) { }

  callSectionQuestionaireMappingForm = this.fb.group({
    callType: [''],
    callConfigId: ['']
  });

  ngAfterViewInit() {
    this.sectionsList.paginator = this.paginator;
    this.sectionsList.sort = this.sort;
  }

   ngOnInit() {
    this.getSelectedLanguage();
    if(this.data !== undefined && this.data !== null){
      this.callTypeData = this.data;
      this.callSectionQuestionaireMappingForm.patchValue({
        callType: this.callTypeData.data.callType,
        callConfigId: this.callTypeData.data.callConfigId
      });  
    }
    this.getSectionMasters();
    // this.getAddedSections();
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

  goBack(){
    this.supervisorService.createComponent(CallConfigurationComponent, null);
  }

  uncheckCheckBox(element: any){
    if(element.sectionRank <= 0){
    element.sectionRank = null;
    }
    if(element.sectionRank === null && element.isChecked === true){
    element.isChecked = !element.isChecked;
    this.enableSubmit = true;
    }
    if(element.sectionRank !== null && element.isChecked === true){
      this.checkUniqueRank();
    }
    else
    this.enableSubmit = false;
  }

  disableSumbit(item: any){
      if(item.sectionRank !== null && item.isChecked === true)
      this.enableSubmit = true;
      else{
      this.enableSubmit = false;
      item.sectionRank = null;
      }
  }

  
   getSectionMasters(){
     this.sectionMasters = [];
    const psmId = this.sessionstorage.getItem('providerServiceMapID');
    this.supervisorService.getSectionConfigurations(psmId).subscribe((res: any) => {
      if(res && res.length > 0){
          res.filter((item: any) => {
            if(item.deleted === false){
            this.sectionMasters.push(item);
            }
          });
          this.getAddedSections();
      } else {
        this.confirmationService.openDialog(res.errorMessage, 'error');
      }
    },
    (err: any) => {
      if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
      else
      this.confirmationService.openDialog(err.title + err.detail, 'error')
    });
  }

   getAddedSections(){
     let addedSectionsData = [];
     this.sectionMappedData = [];
    const psmId = this.sessionstorage.getItem('providerServiceMapID');
    const callConfigId = this.callSectionQuestionaireMappingForm.controls.callConfigId.value; 
    this.supervisorService.getMappedSections(psmId, callConfigId).subscribe((res: any) => {
      if(res){
        if(res && res.length > 0 ){
        addedSectionsData = res;
        const sectionIds = addedSectionsData.map((x : any) => x.sectionId);
        this.sectionMappedData.push(...addedSectionsData);
        this.sectionMasters.filter((item: any) => {
          if(!sectionIds.includes(item.sectionId)){
          this.sectionMappedData.push(item);
          }
        });
        this.refresh()
        }
        else{
          this.refreshForMaster();
        }
      }
    });
  }

  refreshForMaster(){
    this.changeDetectorRefs.detectChanges();
    this.sectionsList.data = this.sectionMasters;
    this.sectionMappedData = this.sectionMasters;
  }

  // Trigger change detection for data source to identify it 
  refresh(){
    this.changeDetectorRefs.detectChanges();
    this.sectionsList.data = this.sectionMappedData;
    console.log(this.sectionsList.data); 
  }

   filterationForMappedSections(adedSectionsData: any[]){
    const sectionIds = adedSectionsData.map((x : any) => x.sectionId);
    this.sectionsList.data.push(...adedSectionsData);
    this.sectionMasters.filter((item: any) => {
      if(!sectionIds.includes(item.sectionId))
      this.sectionsList.data.push(item);
    });
  }

  // checkUniqueRank() {
  //   this.mappedSections = [];
  //   this.sectionsList.data.filter((item: any) => {
  //       if(item.id && item.isChecked == false){
  //       this.mappedSections.push(item);
  //     } else if (item.isChecked == true && item.sectionRank !==undefined && item.sectionRank !== null){
  //         this.mappedSections.push(item);
  //     }
  //   });

  //   this.mappedSections.forEach((mappedSection: any) => {
  //     const sectionToUpdate = this.sectionMappedData.find((section: any) => section.sectionId === mappedSection.sectionId);
  //     if (sectionToUpdate) {
  //       sectionToUpdate.isChecked = mappedSection.isChecked;
  //       sectionToUpdate.sectionRank = mappedSection.sectionRank;
  //     }
  //   });

  //   const rankValues = this.mappedSections.map((item: any) => item.sectionRank);
  //   const uniqueRankValues = new Set(rankValues);
  //   if (rankValues.length !== uniqueRankValues.size) {
  //     this.confirmationService.openDialog("Rank already exists", 'error');
  //     this.enableSubmit = false;
  //   }
  //   else {
  //     this.enableSubmit = true;
  //   }
  // }

  checkUniqueRank() {
    const allSections = this.sectionMappedData.slice();
    this.sectionsList.data.forEach((item: any) => {
      const sectionToUpdate = allSections.find((section: any) => section.sectionId === item.sectionId);
      if (sectionToUpdate) {
        sectionToUpdate.isChecked = item.isChecked;
        sectionToUpdate.sectionRank = item.sectionRank;
      }
    });
    this.mappedSections = [];
    this.sectionMappedData.filter((item: any) => {
        if(item.id && item.isChecked === false){
        this.mappedSections.push(item);
      } else if (item.isChecked === true && item.sectionRank !==undefined && item.sectionRank !== null){
          this.mappedSections.push(item);
      }
    });

    const rankValues = allSections.filter((item: any) => item.isChecked && item.sectionRank !== undefined && item.sectionRank !== null).map((item: any) => item.sectionRank);
    const uniqueRankValues = new Set(rankValues);
    if (rankValues.length !== uniqueRankValues.size) {
      this.confirmationService.openDialog(this.currentLanguageSet.rankAlreadyExists, 'error');
      this.enableSubmit = false;
    } else {
      this.enableSubmit = true;
    }
  }


  filterSearchTerm(searchTerm?: string) {
    if (!searchTerm) {
      this.sectionsList.data = this.sectionMappedData;
      this.sectionsList.paginator = this.paginator;
    } else {
      this.sectionsList.data = [];
      this.sectionsList.paginator = this.paginator;
      this.sectionMappedData.forEach((item: any) => {
        for (const key in item) {
          if (key === 'sectionName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.sectionsList.data.push(item);
              this.sectionsList.paginator = this.paginator;
              break;
            }
          }
        }
      });
    }
  }

  onSubmit() {
    this.checkUniqueRank();
    if(this.enableSubmit === true){
    const sections = this.mappedSections.map((value: any) => ({
      id: value.id,
      sectionId: value.sectionId,
      sectionName: value.sectionName,
      sectionRank: value.sectionRank,
      isChecked: value.isChecked,
      callConfigId: this.callSectionQuestionaireMappingForm.controls.callConfigId.value,
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
      deleted: (value.isChecked === true) ? false : true,
      createdBy: this.sessionstorage.getItem('userName'),
      modifiedBy: (value.id !== undefined && value.id !== null) ? this.sessionstorage.getItem('userName') : null,
    }));
    const reqObj = { 
      callConfigId: this.callSectionQuestionaireMappingForm.controls.callConfigId.value,
      outboundCallType: this.callSectionQuestionaireMappingForm.controls.callType.value,
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
      createdBy: this.sessionstorage.getItem('userName'),
      sections: sections
    }
    console.log('reqObj for section mapping', reqObj)
    this.supervisorService.createCallSectionMapping(reqObj).subscribe((res: any) => {
      if(res){
      this.confirmationService.openDialog(this.currentLanguageSet.callSectionMappedSuccessfully, 'success');
      this.supervisorService.createComponent(CallConfigurationComponent, null);
      }
      else{
        this.confirmationService.openDialog(res.errorMessage, 'error');
      }
    });
    (err: any) => {
      this.confirmationService.openDialog(err.error, 'error');
    }
  } else {
    this.enableSubmit = false;
  }
  }

  ngOnDestroy(){
    this.callSectionQuestionaireMappingForm.reset();
  }

}
