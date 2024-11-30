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


import { AfterViewInit, Component, DoCheck, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { CreateSectionConfigurationComponent } from '../create-section-configuration/create-section-configuration.component';
import { EditSectionConfigurationComponent } from '../edit-section-configuration/edit-section-configuration.component';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/app-modules/services/core/session-storage.service';

/**
 * KA40094929
 */

@Component({
  selector: 'app-section-configuration',
  templateUrl: './section-configuration.component.html',
  styleUrls: ['./section-configuration.component.css']
})

export class SectionConfigurationComponent implements OnInit, DoCheck, AfterViewInit {
  currentLanguageSet: any;
  languageData: any;
  displayedColumns: string[] = ['sNo', 'ecdSectionName', 'ecdSectionDescription', 'edit', 'action'];
  searchTerm: any;
  sectionList: any = [];

  sectionsData = new MatTableDataSource<sectionElement>();
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  mappedSectionsData: any = [];


  ngAfterViewInit() {
    this.sectionsData.paginator = this.paginator;
    this.sectionsData.sort = this.sort;
  }

  constructor(
    private supervisorService: SupervisorService,
    private setLanguageService: SetLanguageService,
    private confirmationService: ConfirmationService,
    readonly sessionstorage:SessionStorageService,
    
  ) { }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSectionConfigurations();
    this.getMappedSections();
  }

  ngDoCheck(){
    this.getSelectedLanguage();
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null)
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  getSectionConfigurations(){
    const reqObj = this.sessionstorage.getItem('providerServiceMapID');
    this.supervisorService.getSectionConfigurations(reqObj).subscribe((res: any) => {
      if(res && res.length > 0){
          this.sectionList = res;
          this.sectionsData.data = res;
          
          this.sectionList.forEach((sectionValues: any, index: number) => {
            sectionValues.sno = index + 1; 
          });
          this.sectionsData.paginator = this.paginator;
          this.sectionsData.sort = this.sort;
      } else {
        this.confirmationService.openDialog(res.errorMessage, 'error');
      }
    });
    (err: any) => {
      if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
      else
      this.confirmationService.openDialog(err.title + err.detail, 'error')
    }
  }
  createSectionConfiguration(){
    this.supervisorService.createComponent(CreateSectionConfigurationComponent, null);
  }

  editSessionConfiguration(data: any){
    this.supervisorService.createComponent(EditSectionConfigurationComponent, data);
  }

  checkIfMappingsExist(element: any, status: any) {
    if (status === 'deactivate') {
      const filteredItems = this.mappedSectionsData.filter((item: any) => {
        return item.sectionId === element.sectionId && item.deleted === false && item.isChecked === true;
      });
      return filteredItems.length !== 0;
    } else {
      return false;
    }
  }
  
  activateDeactivateConfig(element: any, status: any){
    if(!this.checkIfMappingsExist(element, status)){
    this.confirmationService.openDialog(this.currentLanguageSet.areYouSureYouWouldLike + " " + status + " " + this.currentLanguageSet.thisConfiguration, 'info')
    .afterClosed().subscribe(res => {
      if(res){
        const reqObj = {
          sectionId: element.sectionId,
          sectionName: element.sectionName,
          sectionDesc: element.sectionDesc,
          createdBy: this.sessionstorage.userName,
          psmId: this.sessionstorage.getItem('providerServiceMapID'),
          deleted: status === 'activate' ? false : true
        }
        this.supervisorService.updateSectionConfiguration(reqObj).subscribe((res: any) => {
          if(res){
          this.confirmationService.openDialog(this.currentLanguageSet.successfully + " " + status + this.currentLanguageSet.dSection, 'success');
          this.getSectionConfigurations();
          }
          else{
            this.confirmationService.openDialog(res.errorMessage, 'error')
          }
        });
        (err: any) => {
          if(err && err.error)
          this.confirmationService.openDialog(err.error, 'error');
          else
          this.confirmationService.openDialog(err.title + err.detail, 'error')
          };
      } 
    });
  } else {
      this.confirmationService.openDialog(this.currentLanguageSet.thisSectionMapAlreadyExistPleaseDeactivate, 'warn')
    }  
  }

  getMappedSections(){
    this.mappedSectionsData = [];
   const psmId = this.sessionstorage.getItem('providerServiceMapID');
   const callConfigId = 0; 
   this.supervisorService.getMappedSections(psmId, callConfigId).subscribe((res: any) => {
       if(res && res.length > 0 ){
       this.mappedSectionsData = res;
       }
      });
 }

  filterSearchTerm(searchTerm?: string) {
    if (!searchTerm) {
      this.sectionsData.data = this.sectionList;
      this.sectionsData.paginator = this.paginator;
    } else {
      this.sectionsData.data = [];
      this.sectionsData.paginator = this.paginator;
      this.sectionList.forEach((item: any) => {
        for (const key in item) {
          if (key === 'sectionName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.sectionsData.data.push(item);
              this.sectionsData.paginator = this.paginator;
              this.sectionsData.sort = this.sort
              break;
            }
          }
        }
      });
    }
  }

}

export interface sectionElement {
  sNo: number;
  ecdSectionName: string;
  ecdSectionDescription: string;
  edit: any;
  action: any;
}
