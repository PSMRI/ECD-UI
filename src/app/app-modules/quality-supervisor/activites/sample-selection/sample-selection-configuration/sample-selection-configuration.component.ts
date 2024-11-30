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
import { CreateSampleSelectionComponent } from '../create-sample-selection/create-sample-selection.component';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatSort } from '@angular/material/sort';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { LoginserviceService } from 'src/app/app-modules/services/loginservice/loginservice.service';
import { EditSampleSelectionComponent } from '../edit-sample-selection/edit-sample-selection.component';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/app-modules/services/core/session-storage.service';

@Component({
  selector: 'app-sample-selection-configuration',
  templateUrl: './sample-selection-configuration.component.html',
  styleUrls: ['./sample-selection-configuration.component.css']
})
export class SampleSelectionConfigurationComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  currentLanguageSet: any;
  dataSource = new MatTableDataSource<sampleMapping>();
  mappedSampleList:any[]=[];
  searchTerm: any;
  displayedColumns: string[] = [
    'sno',
    'cycleName',
    'fromDay',
    'toDay',
    'ancSampleSize',
    'pncSampleSize',
    'totalSampleSize',
    'edit',
    'delete',
  ];
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
      this.dataSource.data = this.mappedSampleList;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
      this.mappedSampleList.forEach((item) => {
        for (const key in item) {
          if (
            key === 'cycleName' ||
            key === 'fromDay' ||
            key === 'toDay' ||
            key === 'ancSampleSize' ||
            key ==='pncSampleSize'||
            key ==='totalSampleSize' ||
            key==='sno'
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
  getSampleList() {  
    const reqObj: any = {
      providerServiceMapID: this.sessionstorage.getItem('providerServiceMapID'),
    };
    this.qualitySupervisorService.getCycleMappedData(reqObj).subscribe(
      (response: any) => {
        if (response) {
          this.mappedSampleList = response;
          this.mappedSampleList.forEach((sectionCount: any, index: number) => {
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
        });
  }
  openCreateSampleConfiguration() {
    const reqObj = {
      cycleData: this.mappedSampleList,
      isEdit: false,
    };
    this.qualitySupervisorService.createComponent(
      CreateSampleSelectionComponent,
      reqObj
    );
  }
  activateDeactivateGrade(tableValue: any, type: any){
    const isDuplicateFromMainList = this.checkDuplicateFromMainList(tableValue);
    const isDuplicateRange =this.checkDuplicateRange(tableValue);
    if ((isDuplicateFromMainList === true || isDuplicateRange ===true) && type === 'activate') {
      this.confirmationService.openDialog(
        this.currentLanguageSet.cycleAlreadyMappedWithSameNameRange,
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
              cycleId: tableValue.cycleId,
              cycleName: tableValue.cycleName,
              fromDay: tableValue.fromDay,
              toDay: tableValue.toDay,
              ancSampleSize: tableValue.ancSampleSize,
              pncSampleSize: tableValue.pncSampleSize,
              totalSampleSize: tableValue.totalSampleSize,
              createdBy: this.sessionstorage.userName,
              modifiedBy: this.sessionstorage.userName,
              psmId: this.sessionstorage.getItem('providerServiceMapID'),
              deleted: type === 'activate' ? 'false' : 'true',
            };

            this.qualitySupervisorService.updateCycleConfiguration(reqObj).subscribe(
              (response: any) => {
                if (response && response.response) {
                  this.confirmationService.openDialog(
                    status + ' ' + this.currentLanguageSet.successfully,
                    'success'
                  );
                  this.dataSource.data = [];
                  this.dataSource.paginator = this.paginator;
                  this.getSampleList();
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
    this.mappedSampleList.filter((values) => {
      if 
        ( 
          values.cycleId === mapObj.cycleId &&
           values.deleted === false) {
        isDuplicate = true;
      }
    });

    return isDuplicate;
  }
  checkDuplicateRange(mapObj:any){
    let value= false;
    if(this.mappedSampleList.length>0){
      for(let i=0;i<this.mappedSampleList.length;i++)
      {
        if(mapObj.id !== this.mappedSampleList[i].id && this.mappedSampleList[i].deleted===false){
          if(     ((mapObj.fromDay>=this.mappedSampleList[i].fromDay) && (mapObj.fromDay<=this.mappedSampleList[i].toDay))
          || ((mapObj.toDay>=this.mappedSampleList[i].fromDay) &&(mapObj.toDay<=this.mappedSampleList[i].toDay))
          || ((mapObj.fromDay<this.mappedSampleList[i].fromDay) && (mapObj.toDay>this.mappedSampleList[i].toDay))){
            value=true
          }
        }
       
      }

     
    }
    return value  
  }

  editSampleSelection(value: any) {
    const reqObj = {
      selectedCycle: value,
      cycleListData: this.mappedSampleList,
      isEdit: true,
    };
    this.qualitySupervisorService.createComponent(
      EditSampleSelectionComponent,
      reqObj
    );
  }
  ngOnInit(): void {
    this.getSampleList();
    this.getSelectedLanguage();
    
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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