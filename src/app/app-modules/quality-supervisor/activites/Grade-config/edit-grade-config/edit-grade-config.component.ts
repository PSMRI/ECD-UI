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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { GradeConfigurationComponent } from '../grade-configuration/grade-configuration.component';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-edit-grade-config',
  templateUrl: './edit-grade-config.component.html',
  styleUrls: ['./edit-grade-config.component.css']
})
export class EditGradeConfigComponent implements OnInit, DoCheck {
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @Input()
  public data: any;
  dataSource = new MatTableDataSource<gradeMapping>();
  currentLanguageSet: any;
  gradeList: any[] = [];
  editGradeConfigurationForm = this.fb.group({
    id:[''],
    gradeId: [''],
    grade: [''],
    minValue: [''],
    maxValue: ['', [Validators.required]],
    deleted: ['']
    
  },
  {
    validators: this.valueGreater('minValue', 'maxValue')
  },
  )
  
  enableEdit = false;
  gradeListMappedData: any[]=[];
  selectedmappedList: any;

  constructor(
    private setLanguageService: SetLanguageService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private qualitysupervisorService: QualitySupervisorService,
    private masterService: MasterService
  ) { }

  valueGreater(controlName: any, matchName: any) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchName]
      if (matchingControl.value === '' || matchingControl.value === null || matchingControl.value === undefined) {
        return null;
      }
      else if (control.value >= matchingControl.value) {
        matchingControl.setErrors({ valueGreater: true })
      }
    }
  }
  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }
  getGrades() { 
    const psmId = sessionStorage.getItem('providerServiceMapID');
    this.masterService.getGradeMaster(psmId).subscribe(
      (response: any) => {
        if (response) {
          this.gradeList = response;
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

  setGradeForEdit(gradeTypeValue: any) {
    // this.selectedAuditorId = qualitorAuditorTypeValue;
    this.gradeList.filter((values) => {
      if (values.id === gradeTypeValue) {
        this.editGradeConfigurationForm.controls['grade'].setValue(
          values.name
        );
      }
    });
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
            GradeConfigurationComponent,
            null
          );
          // this.selectedQuestionnaireList = [];
          this.enableEdit = false;
        }
      });
  }
  resetForm() {
    this.editGradeConfigurationForm.reset();
  }
  updateGrade(editValue: any){
    const reqObj: any = {
      id: editValue.id,
      gradeId: this.selectedmappedList.gradeId,
      grade: this.selectedmappedList.grade,
      minValue: editValue.minValue,
      maxValue: editValue.maxValue,
      deleted: false,
      createdBy: sessionStorage.getItem('userName'),
      modifiedBy: sessionStorage.getItem('userName'),
      psmId: sessionStorage.getItem('providerServiceMapID'),
    };
    const checkFromMainList = this.checkDuplicateRangeFromMainList(reqObj)
    console.log(reqObj);
    if(checkFromMainList===false){
      this.qualitysupervisorService.updateGradeConfiguration(reqObj).subscribe(
        (response: any) => {
          if (response) {
            this.confirmationService.openDialog(
              this.currentLanguageSet.gradeUpdatedSuccessfully,
              'success'
            );
            this.editGradeConfigurationForm.reset(this.editGradeConfigurationForm.value);
            this.qualitysupervisorService.createComponent(
              GradeConfigurationComponent,
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
          }
      );
    }
    else {
      this.confirmationService.openDialog(
        this.currentLanguageSet.gradeAlreadyExistWithSameRange,
        'error'
      );
    }
      
    }
  
  checkDuplicateRangeFromMainList(gradeObj: any){
      
    let value= false;
    if(this.gradeListMappedData.length>0){
            if (gradeObj.minValue === this.selectedmappedList.minValue && gradeObj.maxValue === this.selectedmappedList.maxValue) {
              value = false;
            }
            else{
              for(let i=0;i<this.gradeListMappedData.length;i++)
              {
               if(this.gradeListMappedData[i].deleted===false && gradeObj.id !== this.gradeListMappedData[i].id){
                if(     ((gradeObj.minValue>=this.gradeListMappedData[i].minValue) && (gradeObj.minValue<=this.gradeListMappedData[i].maxValue))
                || ((gradeObj.maxValue>=this.gradeListMappedData[i].minValue) &&(gradeObj.maxValue<=this.gradeListMappedData[i].maxValue))
                || (gradeObj.minValue<this.gradeListMappedData[i].minValue) && (gradeObj.maxValue>this.gradeListMappedData[i].maxValue)){
                  value=true
                }
               }
              }
            }
     

     
    }
    return value  
  }

  ngDoCheck() {
    this.getSelectedLanguage();
  }

  ngOnInit(): void {
    this.editGradeConfigurationForm.get('gradeId')?.disable();
    this.getGrades();
    this.getSelectedLanguage();
    if (
      this.data.isEdit !== null &&
      this.data.isEdit !== undefined &&
      this.data.isEdit === true
    ) {
      this.enableEdit = true;
    } else {
      this.enableEdit = false;
    }

    if (
      this.data.gradeListData !== null &&
      this.data.gradeListData !== undefined
    ) {
      this.gradeListMappedData = this.data.gradeListData;
    }

    if (
      this.data.selectedGrade !== null &&
      this.data.selectedGrade !== undefined
    ) {
      this.selectedmappedList = this.data.selectedGrade;
      this.patchValuesForEdit();
    }
  }
  patchValuesForEdit() {
    this.editGradeConfigurationForm.controls['id'].patchValue(
      this.selectedmappedList.id
    );

    this.editGradeConfigurationForm.controls['gradeId'].patchValue(
      this.selectedmappedList.gradeId
    );    
    this.setGradeForEdit(
      this.selectedmappedList.gradeId
    );

    this.editGradeConfigurationForm.controls['minValue'].patchValue(
      this.selectedmappedList.minValue
    );

    this.editGradeConfigurationForm.controls['maxValue'].patchValue(
      this.selectedmappedList.maxValue
    )  
    
    this.editGradeConfigurationForm.controls['deleted'].patchValue(
      this.selectedmappedList.deleted
    );
    } 


}
export interface gradeMapping {
  id:number;
  gradeId: number;
  grade: string;
  minValue: number;
  maxValue: number;
}
