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


import { Component, DoCheck, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Router } from '@angular/router';
import { config } from 'rxjs';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { CallSectionQuestionaireMappingComponent } from '../call-section-questionaire-mapping/call-section-questionaire-mapping.component';
import { CreateCallConfigurationComponent } from '../create-call-configuration/create-call-configuration.component';
import { EditCallConfigurationComponent } from '../edit-call-configuration/edit-call-configuration.component';
import { MatPaginator } from '@angular/material/paginator';

/**
 * KA40094929
 */

@Component({
  selector: 'app-call-configuration',
  templateUrl: './call-configuration.component.html',
  styleUrls: ['./call-configuration.component.css']
})
export class CallConfigurationComponent implements OnInit, DoCheck {
  
  callConfigData = new MatTableDataSource<callConfigurationElement>();
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  displayedColumns: string[] = ['callType','displayName', 'effectiveStartDate', 'effectiveEndDate', 'action'];
  configRecordsLength: any;
  callConfigList: any= [];
  currentLanguageSet: any;
  languageData: any;
  callConfig: any = [];
  selectedConfig: any;
  ancCalls: any;
  pncCalls: any;

  // add getter method for pagination length
  get paginationLength(): number {
    return this.callConfigData.data.length;
  }

  constructor(
    private router: Router,
    private supervisorService: SupervisorService,
    private setLanguageService: SetLanguageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getCallConfigurations();
  }


  onConfigSelected(config: any) {
    this.selectedConfig = config.configurations;
}

  ngDoCheck(){
    this.getSelectedLanguage();
  }


  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null)
      this.currentLanguageSet = this.setLanguageService.languageData;
    else {
      this.changeLanguage('English');
    }
  }

  changeLanguage(language: string) {
    this.setLanguageService.getLanguageData(language).subscribe(data => {
      this.languageData = data;
    });
  }

  createCallConfiguration(){
    const lastConfig = this.callConfigData?.data[this.callConfigData?.data?.length - 1];
    const lastEndDate = (lastConfig?.effectiveEndDate) ? lastConfig?.effectiveEndDate : null;
    this.supervisorService.createComponent(CreateCallConfigurationComponent, {data: lastEndDate});
  }

  isDeleteEnabled(effectiveEndDate: any): boolean {
    const currentDate = new Date();
    return effectiveEndDate >= currentDate;
  }


  getCallConfigurations(){
    this.callConfigList = [];
    const reqObj = sessionStorage.getItem("providerServiceMapID");
    this.supervisorService.getCallConfigurations(reqObj).subscribe((res: any) => {
      if(res && res.length > 0){
        this.filterConfigData(res);
      }
    },
    (err) => {
      if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
      else
      this.confirmationService.openDialog(err.title + err.detail, 'error')
    });
  }

  filterConfigData(data: any){
    this.callConfigList = data.reduce((acc: { configId: number; effectiveStartDate: any; effectiveEndDate: any; configurations: any[] }[], curr: { configId: number; effectiveStartDate: string | number | Date; effectiveEndDate: string | number | Date; }) => {
      const existingConfig = acc.find(config => config.configId === curr.configId);
  
      if (existingConfig) {
        existingConfig.configurations.push(curr);
      } else {
        if(curr.configId){
        acc.push({
          configId: curr.configId,
          effectiveStartDate: new Date(curr.effectiveStartDate),
          effectiveEndDate: new Date(curr.effectiveEndDate),
          configurations: [{...curr}]
        });
      }
      }
  
      return acc;
      }, []).sort((a: { effectiveStartDate: any; }, b: { effectiveStartDate: any; }) => a.effectiveStartDate - b.effectiveStartDate)
      .map((section: any) => ({
        ...section,
        configurations: section.configurations.sort((a: { callType: any; }, b: { callType: any; }) => a.callType - b.callType)
      }));
  
      console.log("final data", this.callConfigList);
      this.callConfigData.data = this.callConfigList;
  }

  captureCallsData(configId: any){
    const ancData = [];
    const pncData = [];
    this.callConfigData.data.filter((item: any) => {
      if(item.configId === configId){
      item.configurations.forEach((element: any) => {
          if(element.baseLine === "LMP"){
          ancData.push(element);
          } else if (element.baseLine === "DOB") {
            pncData.push(element);
          }
        });
      }
    });
    this.ancCalls = ancData.length;
    this.pncCalls = pncData.length;
  }

  goToEditCallConfig(data: any){
  this.captureCallsData(data.configId);
  const lastConfig = this.callConfigData.data[this.callConfigData.data.length - 1];
  const lastEndDate = lastConfig.effectiveEndDate;
  this.supervisorService.createComponent(EditCallConfigurationComponent, {data: data, ancCalls: this.ancCalls, pncCalls: this.pncCalls, lastEndDate: lastEndDate});
  }

  mapSectionarieQuestionaire(callTypeData: any){
    this.supervisorService.createComponent(CallSectionQuestionaireMappingComponent, {data: callTypeData});
  }

  deleteConfiguration(element: any){
    this.confirmationService.openDialog(this.currentLanguageSet.areYouSureYouWantToDelete, 'warn')
    .afterClosed().subscribe(res => {
      if(res){
        const dataArray = [...element.configurations].map(element => ({
          ...element,
          deleted: true,
          createdBy: sessionStorage.getItem('userName'),
          modifiedBy: sessionStorage.getItem('userName'),
          psmId: sessionStorage.getItem('providerServiceMapID'),
        }));
        const reqObj = dataArray;
        console.log("reqObj", reqObj)
        this.supervisorService.updateCallConfiguration(reqObj, element.configId).subscribe((res: any) => {
          if(res){
            this.confirmationService.openDialog(this.currentLanguageSet.callConfigurationDeleted, 'success');
            this.getCallConfigurations();
          } else{
            this.confirmationService.openDialog(res.errorMessage, 'error');
        }
        });
      }
    });

  }

}

export interface callConfigurationElement {
  callType: number;
  effectiveStartDate: string;
  effectiveEndDate: string;
  configurations: [];
  action: any;
}