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
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-dial-preference',
  templateUrl: './dial-preference.component.html',
  styleUrls: ['./dial-preference.component.css']
})
export class DialPreferenceComponent implements OnInit, AfterViewInit, DoCheck {
  currentLanguageSet: any;

  @Input()
  public data: any;
  sectionsData =  new MatTableDataSource<any>
  displayedColumns: string[] = ['sNo', 'roleName', 'agentName', 'previewWindowTime', 'selected'];
  isChecked: any;
  masterCheckbox = false;
  dialPreferenceList: any[] = [];
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  previewWindowTimeFilled = false;
  userRoles: any;
  autoPreviewData: any[] = [];
  selectedFlag = false;
  // dialPreferenceForm!: FormGroup;
  
  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  setDataSourceAttributes() {
    this.sectionsData.paginator = this.paginator;
    this.sectionsData.sort = this.sort;

    if (this.paginator && this.sort) {
      this.applyFilter('');
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.sectionsData.filter = filterValue;
  }

  @Input() minValue = 10;
  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private setLanguageService: SetLanguageService,
    readonly sessionstorage:SessionStorageService,
    private supervisorService: SupervisorService
  ) { }

  dialPreferenceForm = this.fb.group({
    searchTerm: [''],
    preferenceList: this.fb.array([]),
    preferDupList: this.fb.array([])
  });

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getAutoPreviewDialingData();
  }

  get preferenceList() {
    return this.dialPreferenceForm.get('preferenceList') as FormArray
  }

  get preferDupList() {
    return this.dialPreferenceForm.get('preferDupList') as FormArray;
  }

  ngAfterViewInit() {
    this.sectionsData.paginator = this.paginator;
    this.sectionsData.sort = this.sort;
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

  getActualIndex(indexValues: number) {
    if (this.paginator !== null && this.paginator !== undefined)
      return indexValues + this.paginator.pageSize * this.paginator.pageIndex;
    else return indexValues + 0;
  }

  getAutoPreviewDialingData() {
    const psmId= this.sessionstorage.getItem('providerServiceMapID');
    this.preferenceList.controls = [];
    this.preferDupList.controls = [];
    this.sectionsData.data = [];
    this.sectionsData.paginator = this.paginator;
    this.sectionsData.sort = this.sort;
    
    this.supervisorService.fetchDialPreference(psmId).subscribe((res:any)=>{
      console.log(res);
        if(res){
          const roles = res;

          roles.filter((values:any) => {
            if (values.roleName.toLowerCase() === "associate" || values.roleName.toLowerCase() === "anm" || values.roleName.toLowerCase() === "mo") {
                // this.preferenceList.controls.push(values);
                let agentValName= null;
                if(values.lastName !== null && values.lastName !== undefined ) {
                agentValName = values.firstName + values.lastName;
                } else {
                  agentValName = values.firstName;
                }
                this.preferenceList.push(
                  this.fb.group({
                    roleId: values.roleID,
                    userId: values.userID,
                    roleName: values.roleName,
                    agentName: agentValName,
                    selected: (values.isAutoPreviewDial !== null && values.isAutoPreviewDial === true) ? true: false,
                    previewWindowTime: values.previewWindowTime,
                  })
                );
                this.preferDupList.push(
                  this.fb.group({
                    roleId: values.roleID,
                    userId: values.userID,
                    roleName: values.roleName,
                    agentName: agentValName,
                    selected: (values.isAutoPreviewDial !== null && values.isAutoPreviewDial === true) ? true: false,
                    previewWindowTime: values.previewWindowTime,
                  })
                );
            }
          });
          console.log("Preference Data", this.preferenceList);
          this.sectionsData.data = this.preferenceList.controls;
          console.log("this.sectionsData.data", this.sectionsData.data);
          this.sectionsData.data.forEach((item: any)=>{
           if(!(
            item.value.previewWindowTime !== null &&
            item.value.previewWindowTime !== undefined &&
            item.value.previewWindowTime !== '' &&
            item.value.previewWindowTime >=15 &&
            item.value.previewWindowTime  <= 60)){
              item.get('selected')?.disable();
           }
           else if(item.value.previewWindowTime >=15 &&
            item.value.previewWindowTime  <= 60){
            item.get('selected')?.enable();
           }
          });
          this.sectionsData.paginator = this.paginator;
          this.sectionsData.sort = this.sort;
        }
      else{
        this.confirmationService.openDialog(res.errorMessage, 'error')
      }
    },
    (err: any) => {
    if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
    else
      this.confirmationService.openDialog(err.title + err.detail, 'error')
    });
  }
  
  checkPreviewWindowTime() {
    this.sectionsData.data.filter((previewData: any) => {
      if(previewData.previewWindowTime !== null) {
        this.preferenceList.push(
          this.fb.group({
            selected: true,
          })
        ); 
      }
    })
  }
  /**
   * Validating duplicate rank from selected questionnaires
   * @param item
   * @returns
   */
    checkDuplicatePreviewWindowTime(item: any) {
      let isDuplicate = false;
      this.preferenceList.controls.filter((values: any) => {
        if (values.previewWindowTime === item.previewWindowTime) {
          isDuplicate = true;
        }
      });
  
      return isDuplicate;
    }

  /**
   * For saving Dial Preference details
   */
  updateAllCheckboxes(checked: any, element: any) {
    this.masterCheckbox = checked;
    if (!checked) {
      let data: any = [];
       data = this.sectionsData.data;
      for (let i = 0; i < data.length; i++) {
        data[i].checked = false;
      }
    }
    if (checked.checked === true) {
      this.masterCheckbox = true;
      const reqObj: any = {
          roleId: element.roleId,
          userId: element.userId,
          isDialPreference: true,
          previewWindowTime: element.previewWindowTime,
          createdBy: this.sessionstorage.getItem('userName'),
          psmId: this.sessionstorage.getItem('providerServiceMapID'),
        };
      this.supervisorService.saveDialPreference(reqObj).subscribe((res:any)=>{
        console.log(res);
        if(res && res !== null){
          this.confirmationService.openDialog(this.currentLanguageSet.dialPreferenceAddedSuccessfully, 'success');
          }
        else{
          this.confirmationService.openDialog(res.errorMessage, 'error')
        }
      },
      (err: any) => {
        if(err && err.error)
        this.confirmationService.openDialog(err.error, 'error');
        else
        this.confirmationService.openDialog(err.title + err.detail, 'error')
        });
    } else {
      this.masterCheckbox = false;
      let newPreview: any;
      this.preferenceList.controls.forEach((sourceValue: any, index) => {
        if (
          sourceValue.controls.roleId.value ===
          element.roleId &&
          sourceValue.controls.userId.value ===
          element.userId
        )
          newPreview = index;
      });
      this.preferenceList.controls[newPreview].patchValue({ previewWindowTime : null});
      element.selected = false;

    const reqObj: any = {
      roleId: element.roleId,
      userId: element.userId,
      isDialPreference: false,
      previewWindowTime: null,
      createdBy: this.sessionstorage.getItem('userName'),
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
      };
    this.supervisorService.saveDialPreference(reqObj).subscribe((res:any)=>{
        if(res && res !== null){
        this.confirmationService.openDialog(this.currentLanguageSet.dialPreferenceRemovedSuccessfully, 'success');
        }
      else{
        this.confirmationService.openDialog(res.errorMessage, 'error')
      }
    },
    (err: any) => {
      if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
      else
      this.confirmationService.openDialog(err.title + err.detail, 'error')
      });
    }
    this.sectionsData.data.forEach((item: any) => {
      item.isChecked = this.masterCheckbox;
    });
  }

/**
 * Unselecting the questionnaire
 * @param item
 */
  removeCheck(item: any) {
    if(item.value.previewWindowTime >=15 &&
      item.value.previewWindowTime  <= 60){
      item.get('selected')?.enable();
     }
   else {
      item.value.previewWindowTime = null;
      item.get('selected').disable();
      let newIndexes: any;
      this.preferenceList.controls.forEach((sourceValue: any, index) => {
        if (
          sourceValue.controls.roleId.value ===
          item.value.roleId &&
          sourceValue.controls.userId.value ===
          item.value.userId
        )
          newIndexes = index;
      });
      this.preferenceList.controls[newIndexes].patchValue({ previewWindowTime: null });
      item.value.selected = false;
      this.preferenceList.controls[newIndexes].patchValue({
        selected: null,
      });

      this.preferDupList.controls.forEach((sourceValue: any, index) => {
        if (
          sourceValue.controls.roleId.value ===
          item.value.roleId &&
          sourceValue.controls.userId.value ===
          item.value.userId
        )
          newIndexes = index;
      });
      this.preferDupList.controls[newIndexes].patchValue({ previewWindowTime: null });
      item.value.selected = false;
      this.preferDupList.controls[newIndexes].patchValue({
        selected: null,
      });
      if (
        item.value.previewWindowTime === null ||
        item.value.previewWindowTime === undefined ||
        item.value.previewWindowTime === ''
      ) {
        let newIndex: any;
        this.preferenceList.controls.forEach((sourceValue: any, index) => {
          if (
            sourceValue.controls.roleId.value ===
            item.value.roleId &&
            sourceValue.controls.userId.value ===
            item.value.userId
          )
            newIndex = index;
        });
  
        item.value.selected = false;
        this.preferenceList.controls[newIndex].patchValue({ selected: null});

        this.preferDupList.controls.forEach((sourceValue: any, index) => {
          if (
            sourceValue.controls.roleId.value ===
            item.value.roleId &&
            sourceValue.controls.userId.value ===
            item.value.userId
          )
            newIndex = index;
        });
  
        item.value.selected = false;
        this.preferDupList.controls[newIndex].patchValue({ selected: null});
      }
    }
  }

  resetForm() {
    this.preferenceList.controls.filter((preferValues: any) => {
      preferValues.controls.previewWindowTime.setValue(null);
      preferValues.controls.selected.setValue(null);
    });
    while (this.preferenceList.length !== 0) {
      this.preferenceList.removeAt(0);
    }
    this.preferDupList.controls.filter((preferValues: any) => {
      preferValues.controls.previewWindowTime.setValue(null);
      preferValues.controls.selected.setValue(null);
    });
    while (this.preferDupList.length !== 0) {
      this.preferDupList.removeAt(0);
    }
  }

/**
 * For In Table Search
 * @param searchTerm
 */
  filterSearchTerm() {
    if (this.dialPreferenceForm.controls['searchTerm'].value === null || this.dialPreferenceForm.controls['searchTerm'].value === '') {
      this.preferenceList.controls  = this.preferDupList.controls;
      this.sectionsData.data = this.preferDupList.controls;
      this.sectionsData.paginator = this.paginator;
      this.sectionsData.sort = this.sort;
    } else {
      this.preferenceList.controls = [];
      this.sectionsData.data = [];
      this.sectionsData.paginator = this.paginator;
      this.sectionsData.sort = this.sort;
      this.preferDupList.controls.forEach((item: any) => {
        for (const key in item.controls) {
          if (key === 'roleName' || key === 'agentName') {
            const value: string = '' + item.controls[key].value;
            if (this.dialPreferenceForm.controls['searchTerm'].value !== null && 
                (value.toLowerCase().indexOf(this.dialPreferenceForm.controls['searchTerm'].value.toLowerCase()) >= 0)) {
              this.sectionsData.data.push(item);
              this.preferenceList.controls.push(item);
              this.sectionsData.paginator = this.paginator;
              this.sectionsData.sort = this.sort;
              break;
            }
          }
        }
      });
    }
  }
  enableCheckBox(index: number){
    this.sectionsData.data.forEach((item: any)=>{
    item.at(index).get('selected').enable();
    });
  }
}
