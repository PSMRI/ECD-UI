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


import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SampleSelectionConfigurationComponent } from '../sample-selection-configuration/sample-selection-configuration.component';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/app-modules/services/core/session-storage.service';

@Component({
  selector: 'app-edit-sample-selection',
  templateUrl: './edit-sample-selection.component.html',
  styleUrls: ['./edit-sample-selection.component.css']
})
export class EditSampleSelectionComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @Input()
  public data: any;
  dataSource = new MatTableDataSource<sampleMapping>();
  cycleListMappedData:any[]=[];
  selectedmappedList:any;
  currentLanguageSet: any;
  enableEdit = false;
  cycleList:any[]=[];
  editSampleConfigurationForm = this.fb.group({
    id:[''],
    cycleId: [''],
    cycleName: [''],
    fromDay: [''],
    toDay: [''],
    ancSampleSize:[''],
    pncSampleSize:[''],
    totalSampleSize:[''],
    deleted: [''],
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
  ngOnInit(): void {
    this.editSampleConfigurationForm.get('cycleId')?.disable();
    this.getCycles();
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
      this.data.cycleListData !== null &&
      this.data.cycleListData !== undefined
    ) {
      this.cycleListMappedData = this.data.cycleListData;
    }

    if (
      this.data.selectedCycle !== null &&
      this.data.selectedCycle !== undefined
    ) {
      this.selectedmappedList = this.data.selectedCycle;
      this.patchValuesForEdit();
    }
  }
  patchValuesForEdit() {
    this.editSampleConfigurationForm.controls['id'].patchValue(
      this.selectedmappedList.id
    );

    this.editSampleConfigurationForm.controls['cycleId'].patchValue(
      this.selectedmappedList.cycleId
    );    
    this.setCycleForEdit(
      this.selectedmappedList.cycleId
    );

    this.editSampleConfigurationForm.controls['fromDay'].patchValue(
      this.selectedmappedList.fromDay
    );

    this.editSampleConfigurationForm.controls['toDay'].patchValue(
      this.selectedmappedList.toDay
    )  
    
    this.editSampleConfigurationForm.controls['ancSampleSize'].patchValue(
      this.selectedmappedList.ancSampleSize
    )

    this.editSampleConfigurationForm.controls['pncSampleSize'].patchValue(
      this.selectedmappedList.pncSampleSize
    )
    this.editSampleConfigurationForm.controls['totalSampleSize'].patchValue(
      this.selectedmappedList.totalSampleSize
    )
    this.editSampleConfigurationForm.controls['deleted'].patchValue(
      this.selectedmappedList.deleted
    );
    } 

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }
  calculateMe(value:any,value1:any){
    console.log(value)
    console.log(value1);
    let Total;
    if(value1===0 || value ===0){
      if(value1===null || value ===null || value1==="" || value===""){
        this.editSampleConfigurationForm.controls['totalSampleSize'].setValue("");
      }
      else{
        Total=value+value1;
        console.log(Total);
        this.editSampleConfigurationForm.controls['totalSampleSize'].setValue(Total);
      }
      
    }
    else if((value!=="" && value1!=="") && (value!==null && value1!==null)){
       Total=value+value1;
      console.log(Total);
      this.editSampleConfigurationForm.controls['totalSampleSize'].setValue(Total);
    }
    else{
      this.editSampleConfigurationForm.controls['totalSampleSize'].setValue("");
    }

    if(Total === 0){
      this.editSampleConfigurationForm.controls['totalSampleSize'].setErrors({min:true})
    }

  }
  getCycles() {  
    const psmId = this.sessionstorage.getItem('providerServiceMapID');
    this.masterService.getCyclesMaster(psmId).subscribe(
      (response: any) => {
        if (response) {
          this.cycleList = response;
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
  setCycleForEdit(cycleValue: any) {
    // this.selectedAuditorId = qualitorAuditorTypeValue;
    this.cycleList.filter((values) => {
      if (values.id === cycleValue) {
        this.editSampleConfigurationForm.controls['cycleName'].setValue(
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
  resetForm() {
    this.editSampleConfigurationForm.reset();
  }

  updateCycle(editValue: any){
    const reqObj: any = {
      id: editValue.id,
      cycleId: this.selectedmappedList.cycleId,
      cycleName: this.selectedmappedList.cycleName,
      fromDay: editValue.fromDay,
      toDay: editValue.toDay,
      ancSampleSize: editValue.ancSampleSize,
      pncSampleSize: editValue.pncSampleSize,
      totalSampleSize: editValue.totalSampleSize,
      deleted: false,
      createdBy: this.sessionstorage.userName,
      modifiedBy: this.sessionstorage.userName,
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
    };
    const checkFromMainList = this.checkDuplicateRangeFromMainList(reqObj)
    console.log(reqObj);
    if(checkFromMainList===false){
      // this.confirmationService.openDialog('Cycle Updated Successfully', `success`);
      this.qualitysupervisorService.updateCycleConfiguration(reqObj).subscribe(
        (response: any) => {
          if (response) {
            this.confirmationService.openDialog(
              this.currentLanguageSet.cycleUpdatedSuccessfully,
              'success'
            );
            this.editSampleConfigurationForm.reset(this.editSampleConfigurationForm.value);
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
    else {
      this.confirmationService.openDialog(
        this.currentLanguageSet.alreadyExistWithSameDay,
        'error'
      );
    }
      
    }

    //  checkDuplicateRangeFromMainList(cycleObj: any) {
    //   let value = false;
    //   if (this.cycleListMappedData.length > 0) {
    //     if (
    //       ((cycleObj.fromDay < this.selectedmappedList.fromDay) && (cycleObj.toDay < this.selectedmappedList.fromDay)) ||
    //     ((cycleObj.fromDay > this.selectedmappedList.toDay) && (cycleObj.toDay > this.selectedmappedList.toDay))
    //     ) {
    //       value = false;
    //     }
    //     else {
    //       for (let j = 0; j < this.cycleListMappedData.length; j++) {
    //         if (this.cycleListMappedData[j].deleted == false) {
    //           if (((this.cycleListMappedData[j].fromDay < cycleObj.fromDay ) && (this.cycleListMappedData[j].toDay < cycleObj.fromDay)) ||
    //          ((this.cycleListMappedData[j].fromDay >cycleObj.toDay )&& (this.cycleListMappedData[j].toDay > cycleObj.toDay)) ) {
    //             value = true
    //           }
    //         }
  
    //       }
    //     }
  
    //     if (value == true) {
    //       return true
    //     }
    //     else {
    //       return false
    //     }
    //   }
    //   else{
    //     return false;
    //   }
    // }



    
  checkDuplicateRangeFromMainList(cycleObj: any){
      
    let value= false;
    if(this.cycleListMappedData.length>0){
            if (cycleObj.fromDay === this.selectedmappedList.fromDay && cycleObj.toDay === this.selectedmappedList.toDay) {
              value = false;
            }
            else{
              for(let i=0;i<this.cycleListMappedData.length;i++)
              {
               if(this.cycleListMappedData[i].deleted===false && cycleObj.id !== this.cycleListMappedData[i].id){
                if(     ((cycleObj.fromDay>=this.cycleListMappedData[i].fromDay) && (cycleObj.fromDay<=this.cycleListMappedData[i].toDay))
                || ((cycleObj.toDay>=this.cycleListMappedData[i].fromDay) &&(cycleObj.toDay<=this.cycleListMappedData[i].toDay))
                ||((cycleObj.fromDay < this.cycleListMappedData[i].fromDay) && (cycleObj.toDay > this.cycleListMappedData[i].toDay))){
                  value=true
                }
               }
              }
            }
     

     
    }
    return value  
  }

}
export interface sampleMapping {
  id:number
  cycleId: number;
  cycleName: string;
  fromDay: number;
  toDay: number;
  ancSampleSize:number
  pncSampleSize:number
  totalSampleSize:number
}