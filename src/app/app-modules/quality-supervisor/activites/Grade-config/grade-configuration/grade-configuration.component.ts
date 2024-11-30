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


import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { CreateGradeConfigComponent } from '../create-grade-config/create-grade-config.component';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatSort } from '@angular/material/sort';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { LoginserviceService } from 'src/app/app-modules/services/loginservice/loginservice.service';
import { EditGradeConfigComponent } from '../edit-grade-config/edit-grade-config.component';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/app-modules/services/core/session-storage.service';

@Component({
  selector: 'app-grade-configuration',
  templateUrl: './grade-configuration.component.html',
  styleUrls: ['./grade-configuration.component.css']
})
export class GradeConfigurationComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  currentLanguageSet: any;
  searchTerm: any;
  dataSource = new MatTableDataSource<gradeMapping>();
  displayedColumns: string[] = [
    'sno',
    'grade',
    'minValue',
    'maxValue',
    'edit',
    'delete',
  ];
  mappedGradeList:any[]=[];
  constructor(
    private qualitySupervisorService: QualitySupervisorService,
    private setLanguageService: SetLanguageService,
    private confirmationService: ConfirmationService,
    private loginService: LoginserviceService,
    readonly sessionstorage:SessionStorageService,
  ) { }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }
  filterSearchTerm(searchTerm?: string) {
    if (!searchTerm) {
      this.dataSource.data = this.mappedGradeList;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
      this.mappedGradeList.forEach((item) => {
        for (const key in item) {
          if (
            key === 'grade' ||
            key === 'minValue' ||
            key === 'maxValue'
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
  getGrades() {

    const reqObj: any = {
      providerServiceMapID: this.sessionstorage.getItem('providerServiceMapID'),
    };
    this.qualitySupervisorService.getGradesMappedData(reqObj).subscribe(
      (response: any) => {
        if (response) {
          this.mappedGradeList = response;
          this.mappedGradeList.forEach((sectionCount: any, index: number) => {
            sectionCount.sno = index + 1;
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
        }
    );
  }
  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getGrades();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  openCreateGradeConfiguration() {
    const reqObj = {
       gradesData: this.mappedGradeList,
      isEdit: false,
    };
    this.qualitySupervisorService.createComponent(
      CreateGradeConfigComponent,
      reqObj
    );
  }
  activateDeactivateGrade(tableValue: any, type: any){
    const isDuplicateFromMainList = this.checkDuplicateFromMainList(tableValue);
    const isDuplicateRange =this.checkDuplicateRange(tableValue);
    if ((isDuplicateFromMainList === true  || isDuplicateRange ===true) && type === 'activate') {
      this.confirmationService.openDialog(
        this.currentLanguageSet.gradeAlreadyMappedWithSameRangeName,
        'error'
      );
    } else {
      let status: any = null;
      if (type === 'activate') {
        status = 'Activated';
      } else {
        status = 'Deactivated';
      }

      this.confirmationService
        .openDialog(
          this.currentLanguageSet.areYouSureWantTo + ' ' + status + '?',
          'confirm'
        )
        .afterClosed()
        .subscribe((response) => {
          if (response) {
            const reqObj: any = {
              id: tableValue.id,
              gradeId: tableValue.gradeId,
              grade: tableValue.grade,
              minValue: tableValue.minValue,
              maxValue: tableValue.maxValue,
              createdBy: this.sessionstorage.userName,
              modifiedBy: this.sessionstorage.userName,
              psmId: this.sessionstorage.getItem('providerServiceMapID'),
              deleted: type === 'activate' ? 'false' : 'true'
            };

            this.qualitySupervisorService.updateGradeConfiguration(reqObj).subscribe(
              (response: any) => {
                if (response && response.response) {
                  this.confirmationService.openDialog(
                    status + ' ' + this.currentLanguageSet.successfully,
                    'success'
                  );
                  this.dataSource.data = [];
                  this.dataSource.paginator = this.paginator;
                  this.getGrades();
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
  checkDuplicateFromMainList(mapObj: any) {
    let isDuplicate = false;
    this.mappedGradeList.filter((values) => {
      if 
        ( 
          values.gradeId === mapObj.gradeId &&
           values.deleted === false) {
        isDuplicate = true;
      }
    });

    return isDuplicate;
  }

  checkDuplicateRange(mapObj:any){
    let value= false;
    if(this.mappedGradeList.length>0){
      for(let i=0;i<this.mappedGradeList.length;i++)
      {
        if(mapObj.id !== this.mappedGradeList[i].id && this.mappedGradeList[i].deleted===false){
          if(     ((mapObj.minValue>=this.mappedGradeList[i].minValue) && (mapObj.minValue<=this.mappedGradeList[i].maxValue))
          || ((mapObj.maxValue>=this.mappedGradeList[i].minValue) &&(mapObj.maxValue<=this.mappedGradeList[i].maxValue))
          || ((mapObj.minValue<this.mappedGradeList[i].minValue) && (mapObj.maxValue>this.mappedGradeList[i].maxValue))){
            value=true
          }
        }
       
      }

     
    }
    return value  
  }
  editGradeMapping(value: any) {
    console.log(value);
    const reqObj = {
      selectedGrade: value,
      gradeListData: this.mappedGradeList,
      isEdit: true,
    };
    this.qualitySupervisorService.createComponent(
      EditGradeConfigComponent,
      reqObj
    );
  }

}
export interface gradeMapping {
  gradeId: number;
  grade: string;
  minValue: number;
  maxValue: number;
  deleted: any;
}
