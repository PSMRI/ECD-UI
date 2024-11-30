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
import { FormBuilder, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import * as FileSaver from 'file-saver';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/app-modules/services/core/session-storage.service';

@Component({
  selector: 'app-reports-quality-supervisor',
  templateUrl: './reports-quality-supervisor.component.html',
  styleUrls: ['./reports-quality-supervisor.component.css']
})
export class ReportsQualitySupervisorComponent implements OnInit, AfterViewInit {
  currentLanguageSet: any;
  displayedColumns: string[] = [
    'sno',
    'reportName',
    'action'
  ];
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  dataSource = new MatTableDataSource<sectionElement>();
  reportsData: any = [];
  today:any;
  constructor(private setLanguageService: SetLanguageService,private fb: FormBuilder,
    readonly sessionstorage:SessionStorageService, private qualitySupervisorService: QualitySupervisorService) { }

  reportsForm = this.fb.group({
    startDate: ['',Validators.required],
    endDate: ['',Validators.required],
    searchTerm: [''],
  });

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.reportsData = [
      {'reportName' : 'AGENT-WISE TOTAL PRIMARY DEFECTS'},
      {'reportName' :'AGENT-WISE TOTAL SECONDARY DEFECTS'},
      {'reportName' :'HIGHLIGHTING OF THE AGENTS BELOW 95% QUALITY SCORE FOR Training need identification'}
    ];
    this.dataSource.data = this.reportsData;
    this.today = new Date(); 
  }
  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  searchReport(){
    const reqObj = {
      startDate: this.reportsForm.controls.startDate.value,
      endDate: this.reportsForm.controls.endDate.value,
      providerServiceMapId: this.sessionstorage.getItem('providerServiceMapID'),
    }
    this.qualitySupervisorService.qualityReportDownload(reqObj).subscribe((res:any)=>{
      if(res !== undefined && res !== null && res.statusCode === 200){
        if(res.length !== 0){
          this.dataSource = res.data;
        }
      }
    })
  }

  downloadReport(report: any) {
    // Code to download the excel report
    // For example, using the FileSaver.js library:
    const file = new Blob([report.excelData], { type: 'application/vnd.ms-excel' });
    FileSaver.saveAs(file, report.reportName + '.xls');
  }
  
  
     /**
   * For In Table Search
   * @param searchTerm
   */
     filterSearchTerm(searchTerm?: string) {
      if (!searchTerm) {
        this.dataSource.data = this.reportsData;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      } else {
        this.dataSource.data = [];
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.reportsData.forEach((item:any) => {
          for (const key in item) {
            if (
              key === 'reportName' 
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
export interface sectionElement {
  reportName: string;
  action: any;
}
