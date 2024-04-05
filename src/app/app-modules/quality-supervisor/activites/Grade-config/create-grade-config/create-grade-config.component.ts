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
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { GradeConfigurationComponent } from '../grade-configuration/grade-configuration.component';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
@Component({
  selector: 'app-create-grade-config',
  templateUrl: './create-grade-config.component.html',
  styleUrls: ['./create-grade-config.component.css']
})
export class CreateGradeConfigComponent implements OnInit, DoCheck {
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @Input()
  public data: any;
  currentLanguageSet: any;
  gradeList: any[] = [];
  enableEdit = false;
  dataSource = new MatTableDataSource<gradeMapping>();
  displayedColumns: string[] = [
    'grade',
    'minValue',
    'maxValue',
    'actions',
  ];
  deletedGrades: any = [];
  ValueLessOrEqual = true
  constructor(
    private setLanguageService: SetLanguageService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private qualitysupervisorService: QualitySupervisorService,
    private masterService:MasterService
  ) { }

  createGradeConfigurationForm = this.fb.group({
    gradeId: [''],
    grade: [''],
    minValue: [''],
    maxValue: ['', [Validators.required]],
  },
    {
      validators: this.valueGreater('minValue', 'maxValue')
    }
  );

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
          this.gradeList = response
          this.checkDuplictaeFromConfiguraionList();
          this.checkDuplicateFromBufferList();
          console.log(this.gradeList);
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
  checkDuplictaeFromConfiguraionList(){
    if(this.data.gradesData.length>0){
      const alreadyMappedGrades: any[] = [];
      for (let j = 0; j < this.data.gradesData.length; j++) {
        if(this.data.gradesData[j].deleted===false){
          alreadyMappedGrades.push(this.data.gradesData[j].gradeId)
        }
      }
      console.log(alreadyMappedGrades);
      this.removeAlreadyMappedAgents(alreadyMappedGrades);
    }
  }
  checkDuplicateFromBufferList(){
    if (this.dataSource.data.length > 0) {
      const alreadyMappedGrades: any[] = [];
      this.deletedGrades = alreadyMappedGrades;
      const alreadyMappedAgentsIds: any[] = [];
      for (let j = 0; j < this.dataSource.data.length; j++) {
        alreadyMappedGrades.push(this.gradeList.find(i => i.id === this.dataSource.data[j].gradeId))
        alreadyMappedAgentsIds.push(alreadyMappedGrades[j].id)
      }
      console.log(alreadyMappedGrades);
      this.removeAlreadyMappedAgents(alreadyMappedAgentsIds);
    }
  }
  removeAlreadyMappedAgents(element: any[]) {
    for (let i = 0; i < element.length; i++) {
      this.gradeList.forEach((value, index) => {
        if (value.id === element[i]) this.gradeList.splice(index, 1);
      });
    }
  }
  setGrade(gradeTypeValue: any) {
    // this.selectedAuditorId = qualitorAuditorTypeValue;
    this.gradeList.filter((values) => {
      if (values.id === gradeTypeValue) {
        this.createGradeConfigurationForm.controls['grade'].setValue(
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
    this.createGradeConfigurationForm.reset();
  }
  addGrades(formData: any) {
    console.log(formData)
    let gradeObj: any = {};
    gradeObj = {
      gradeId: formData.gradeId,
      grade: formData.grade,
      minValue: formData.minValue,
      maxValue: formData.maxValue,
      createdBy: sessionStorage.getItem('userName'),
      psmId: sessionStorage.getItem('providerServiceMapID')
    };
    const checkfromBufferList = this.checkDuplicateRange(gradeObj);
    const checkFromMainList = this.checkDuplicateRangeFromMainList(gradeObj)
    if (checkfromBufferList ===false && checkFromMainList === false) {
      this.dataSource.data.push(gradeObj);
      this.dataSource.paginator = this.paginator;
      this.getGrades();
      this.createGradeConfigurationForm.reset();
    }
    else {
      this.confirmationService.openDialog(
        this.currentLanguageSet.gradeAlreadyExistWithSameRange,
        'error'
      );
    }
  }
  checkMaximumValue(gradeObj: any) {
    if (gradeObj.maxValue <= gradeObj.minValue) {
      return true;
    }
    else {
      return false;
    }
  }

  saveGrade() {
    console.log(this.dataSource.data);
    const reqObj: any = {
      gradeDetail: this.dataSource.data
    };
    console.log(reqObj.gradeDetail);
    this.qualitysupervisorService.saveGrades(reqObj.gradeDetail).subscribe(
      (response: any) => {    
        if (response) {
          this.confirmationService.openDialog(
            this.currentLanguageSet.gradesCreatedSuccessfully,
            'success'
          );
          this.resetForm();
          this.dataSource.data = [];
          this.dataSource.paginator = this.paginator;
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
  removeGradeConfiguration(indexes: any) {

    this.deletedGrades.forEach((value: any, index: any) => {
      if (value.id === this.dataSource.data[indexes].gradeId) this.gradeList.push(this.deletedGrades[index]);
    });
    this.dataSource.data.splice(indexes, 1);
    this.dataSource.paginator = this.paginator;

    this.getGrades();
  }
  ngDoCheck() {
    this.getSelectedLanguage();
  }

  lessThanValidator(control: FormControl) {
    const minValue = control.value
    const maxValue = control.value;

    console.log(minValue);
    console.log(maxValue);


    if (minValue && maxValue) {
      return minValue >= maxValue ? { lessThan: true } : null;
    }

    return null;
  }



  checkDuplicateRange(gradeObj: any) {
    let value= false;
    if(this.dataSource.data.length>0){
      for(let i=0;i<this.dataSource.data.length;i++)
      {
        if(     ((gradeObj.minValue>=this.dataSource.data[i].minValue) && (gradeObj.minValue<=this.dataSource.data[i].maxValue))
        || ((gradeObj.maxValue>=this.dataSource.data[i].minValue) &&(gradeObj.maxValue<=this.dataSource.data[i].maxValue))
        || ((gradeObj.minValue<this.dataSource.data[i].minValue) && (gradeObj.maxValue>this.dataSource.data[i].maxValue))){
          value=true
        }
      }

     
    }
    return value  
  }
  
      checkDuplicateRangeFromMainList(gradeObj: any){
      
      let value= false;
      if(this.data.gradesData.length>0){
        for(let i=0;i<this.data.gradesData.length;i++)
        {
         if(this.data.gradesData[i].deleted===false){
          if(     ((gradeObj.minValue>=this.data.gradesData[i].minValue) && (gradeObj.minValue<=this.data.gradesData[i].maxValue))
          || ((gradeObj.maxValue>=this.data.gradesData[i].minValue) &&(gradeObj.maxValue<=this.data.gradesData[i].maxValue) )
           ||((gradeObj.minValue<this.data.gradesData[i].minValue) && ( gradeObj.maxValue>this.data.gradesData[i].maxValue)) ){
            value=true
          }
         }
        }

       
      }
      return value  
    }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getGrades();
    if (
      this.data.isEdit !== null &&
      this.data.isEdit !== undefined &&
      this.data.isEdit === true
    ) {
      this.enableEdit = true;
    } else {
      this.enableEdit = false;
    }
  }

}


export interface gradeMapping {
  gradeId: number;
  grade: string;
  minValue: number;
  maxValue: number;
}
