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
import { FormBuilder, FormGroup } from '@angular/forms';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { SampleSelectionConfigurationComponent } from '../sample-selection-configuration/sample-selection-configuration.component';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { NumberFormatStyle } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/app-modules/services/core/session-storage.service';

@Component({
  selector: 'app-create-sample-selection',
  templateUrl: './create-sample-selection.component.html',
  styleUrls: ['./create-sample-selection.component.css']
})
export class CreateSampleSelectionComponent implements OnInit, DoCheck {
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @Input()
  public data: any;
  currentLanguageSet: any;
  cycleList:any[]=[];
  enableEdit = false;
  dataSource = new MatTableDataSource<sampleMapping>();
  deletedCycles: any = [];
  displayedColumns: string[] = [
    'cycleName',
    'fromDay',
    'toDay',
    'ancSampleSize',
    'pncSampleSize',
    'totalSampleSize',
    'actions'
  ];
  createSampleConfigurationForm = this.fb.group({
    cycleId: [''],
    cycleName: [''],
    fromDay: [''],
    toDay: [''],
    ancSampleSize:[''],
    pncSampleSize:[''],
    totalSampleSize:['']
  },
    {
      validators: [this.valueGreater('fromDay', 'toDay')]
    },
    
  );
  
  constructor(
    private setLanguageService: SetLanguageService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private qualitysupervisorService: QualitySupervisorService,
    readonly sessionstorage:SessionStorageService,
    private masterService:MasterService
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
  getCycles() {  
    const psmId = this.sessionstorage.getItem('providerServiceMapID');
    this.masterService.getCyclesMaster(psmId).subscribe(
      (response: any) => {
        if (response) {
          this.cycleList = response;
          this.checkDuplictaeFromConfiguraionList();
          this.checkDuplicateFromBufferList();
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
  setCycle(cycleValue: any) {
    // this.selectedAuditorId = qualitorAuditorTypeValue;
    this.cycleList.filter((values) => {
      if (values.id === cycleValue) {
        this.createSampleConfigurationForm.controls['cycleName'].setValue(
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
            SampleSelectionConfigurationComponent,
            null
          );
          // this.selectedQuestionnaireList = [];
          this.enableEdit = false;
        }
      });
  }
  checkDuplictaeFromConfiguraionList(){
    if(this.data.cycleData.length>0){
      const alreadyMappedGrades: any[] = [];
      for (let j = 0; j < this.data.cycleData.length; j++) {
        if(this.data.cycleData[j].deleted===false){
          alreadyMappedGrades.push(this.data.cycleData[j].cycleId)
        }
      }
      console.log(alreadyMappedGrades);
      this.removeAlreadyMappedCycles(alreadyMappedGrades);
    }
  }

  checkDuplicateFromBufferList(){
    if (this.dataSource.data.length > 0) {
      const alreadyMappedCycles: any[] = [];
      this.deletedCycles = alreadyMappedCycles;
      const alreadyMappedAgentsIds: any[] = [];
      for (let j = 0; j < this.dataSource.data.length; j++) {
        alreadyMappedCycles.push(this.cycleList.find(i => i.id === this.dataSource.data[j].cycleId))
        alreadyMappedAgentsIds.push(alreadyMappedCycles[j].id)
      }
      console.log(alreadyMappedCycles);
      this.removeAlreadyMappedCycles(alreadyMappedAgentsIds);
    }
  }
  removeAlreadyMappedCycles(element: any[]) {
    for (let i = 0; i < element.length; i++) {
      this.cycleList.forEach((value, index) => {
        if (value.id === element[i]) this.cycleList.splice(index, 1);
      });
    }
  }

  resetForm() {
    this.createSampleConfigurationForm.reset();
  }

  addSample(formData: any) {
    console.log(formData)
    let sampleObj: any = {};
    sampleObj = {
      cycleId: formData.cycleId,
      cycleName: formData.cycleName,
      fromDay: formData.fromDay,
      toDay: formData.toDay,
      ancSampleSize:formData.ancSampleSize,
      pncSampleSize:formData.pncSampleSize,
      totalSampleSize:formData.totalSampleSize,
      createdBy: this.sessionstorage.userName,
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
    };
      const checkfromBufferList = this.checkDuplicateRange(sampleObj);
     const checkFromMainList = this.checkDuplicateRangeFromMainList(sampleObj)
    if (checkfromBufferList === false && checkFromMainList=== false) {
      this.dataSource.data.push(sampleObj);
      this.dataSource.paginator = this.paginator;
      this.getCycles();
      this.createSampleConfigurationForm.reset();
    }
    else {
      this.confirmationService.openDialog(
        this.currentLanguageSet.cycleAlreadyExistWithSameDay,
        'error'
      );
    }
  }

  
  checkDuplicateRange(sampleObj: any) {
    let value= false;
    if(this.dataSource.data.length>0){
      for(let i=0;i<this.dataSource.data.length;i++)
      {
        if(     ((sampleObj.fromDay>=this.dataSource.data[i].fromDay) && (sampleObj.fromDay<=this.dataSource.data[i].toDay))
        || ((sampleObj.toDay>=this.dataSource.data[i].fromDay) &&(sampleObj.toDay<=this.dataSource.data[i].toDay) )
        || ( (sampleObj.fromDay < this.dataSource.data[i].fromDay) && (sampleObj.toDay > this.dataSource.data[i].toDay))){
          value=true
        }
      }

     
    }
    return value  
  }

  
    checkDuplicateRangeFromMainList(sampleObj: any){
      
      let value= false;
      if(this.data.cycleData.length>0){
        for(let i=0;i<this.data.cycleData.length;i++)
        {
         if(this.data.cycleData[i].deleted===false){
          if( ((sampleObj.fromDay>=this.data.cycleData[i].fromDay) && (sampleObj.fromDay<=this.data.cycleData[i].toDay))
          || ((sampleObj.toDay>=this.data.cycleData[i].fromDay) &&(sampleObj.toDay<=this.data.cycleData[i].fromDay))
          || ((sampleObj.fromDay < this.data.cycleData[i].fromDay) && (sampleObj.toDay > this. data.cycleData[i].toDay))){
            value=true
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
    // this.createSampleConfigurationForm.get('totalSampleSize')?.disable();
    this.getSelectedLanguage();
    this.getCycles();
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
  calculateMe(value:any,value1:any){
    console.log(value)
    console.log(value1);
    let Total;
    if(value1===0 || value ===0){
      if(value1===null || value ===null || value1==="" || value===""){
        this.createSampleConfigurationForm.controls['totalSampleSize'].setValue("");
      }
      else{
        Total=value+value1;
        console.log(Total);
        this.createSampleConfigurationForm.controls['totalSampleSize'].setValue(Total);
      }
      
    }
    else if((value!=="" && value1!=="") && (value!==null && value1!==null)){
       Total=value+value1;
      console.log(Total);
      this.createSampleConfigurationForm.controls['totalSampleSize'].setValue(Total);
    }
    else{
      this.createSampleConfigurationForm.controls['totalSampleSize'].setValue("");
    }

    if(Total === 0){
      this.createSampleConfigurationForm.controls['totalSampleSize'].setErrors({min:true})
    }

  }

  removeGradeConfiguration(indexes: any) {

    this.deletedCycles.forEach((value: any, index: any) => {
      if (value.id === this.dataSource.data[indexes].cycleId) this.cycleList.push(this.deletedCycles[index]);
    });
    this.dataSource.data.splice(indexes, 1);
    this.dataSource.paginator = this.paginator;

    this.getCycles();
  }

  saveSample() {
    console.log(this.dataSource.data);
    const reqObj: any = {
      sampleDetails: this.dataSource.data,
    };
    this.qualitysupervisorService.saveSampleList(reqObj.sampleDetails).subscribe(
      (response: any) => {
        if (response) {
          this.confirmationService.openDialog(
            this.currentLanguageSet.sampleSizeConfigurationSuccessful,
            'success'
          );
          this.resetForm();
          this.dataSource.data = [];
          this.dataSource.paginator = this.paginator;
          this.qualitysupervisorService.createComponent(
            SampleSelectionConfigurationComponent,
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
}
export interface sampleMapping {
  cycleId: number;
  cycleName: string;
  fromDay: number;
  toDay: number;
  ancSampleSize:number
  pncSampleSize:number
  totalSampleSize:number
}
