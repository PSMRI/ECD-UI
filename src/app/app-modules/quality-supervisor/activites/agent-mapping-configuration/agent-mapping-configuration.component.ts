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
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { CreateAgentComponent } from '../create-agent/create-agent.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { LoginserviceService } from 'src/app/app-modules/services/loginservice/loginservice.service';
import { EditAgentComponent } from '../edit-agent/edit-agent.component';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/app-modules/services/core/session-storage.service';

@Component({
  selector: 'app-agent-mapping-configuration',
  templateUrl: './agent-mapping-configuration.component.html',
  styleUrls: ['./agent-mapping-configuration.component.css']
})
export class AgentMappingConfigurationComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  mappedAgentList: any[] = [];
  searchTerm: any;
  currentLanguageSet: any;
  dataSource = new MatTableDataSource<audtiorMapped>();
  displayedColumns: string[] = [
    'sno',
    'qualityAuditorName',
    'roleName',
    'agentName',
    'edit',
    'delete',
  ];

  constructor(
    private qualitysupervisorService: QualitySupervisorService,
    private setLanguageService: SetLanguageService,
    private confirmationService: ConfirmationService,
    private loginService: LoginserviceService,
    readonly sessionstorage:SessionStorageService,
    private qualitySupervisorService: QualitySupervisorService
  ) { }

  ngOnInit(): void {
    this.getAuditors();
    this.getSelectedLanguage();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  openCreateAgentMapping() {
    const reqObj = {
      qualityAuditorData: this.mappedAgentList,
      isEdit: false,
    };
    this.qualitysupervisorService.createComponent(
      CreateAgentComponent,
      reqObj
    );
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }
  filterSearchTerm(searchTerm?: string) {
    if (!searchTerm) {
      this.dataSource.data = this.mappedAgentList;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
      this.mappedAgentList.forEach((item) => {
        for (const key in item) {
          if (
            key === 'qualityAuditorName' ||
            key === 'roleName' ||
            key === 'agentName'
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

  getAuditors() {
    const reqObj: any = {
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
    };
    this.qualitySupervisorService.getAgentMappedData(reqObj.psmId).subscribe(
      (response: any) => {
        if (response) {
          this.mappedAgentList = response;
          this.mappedAgentList.forEach((sectionCount: any, index: number) => {
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
  activateDeactivateAuditor(tableValue: any, type: any) {
    const isDuplicateFromMainList = this.checkDuplicateFromMainList(tableValue);
    if (isDuplicateFromMainList === true && type === 'activate') {
      this.confirmationService.openDialog(
        'Agent Already Mapped',
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
          this.currentLanguageSet.areYouSureWantTo + ' ' + type + '?',
          'confirm'
        )
        .afterClosed()
        .subscribe((response) => {
          if (response) {
            const agentIds:any[]=[];
            const agentNames:any[]=[]
            agentIds.push(tableValue.agentId);
            agentNames.push(tableValue.agentName);
            const reqObj: any = {
              id: tableValue.id,
              qualityAuditorId: tableValue.qualityAuditorId,
              roleId: tableValue.roleId,
              agentId: tableValue.agentId,
              qualityAuditorName: tableValue.qualityAuditorName,
              roleName: tableValue.roleName,
              agentName: tableValue.agentName,
              modifiedBy: this.sessionstorage.userName,
              createdBy: this.sessionstorage.userName,
              psmId: this.sessionstorage.getItem('providerServiceMapID'),
              agentIds:agentIds,
              agentNames:agentNames,
              deleted: type === 'activate' ? 'false' : 'true'
            };
            console.log(reqObj);
            this.qualitySupervisorService.updateAgentQualityConfiguration(reqObj).subscribe(
              (response: any) => {
                if (response) {
                  this.confirmationService.openDialog(
                    status + ' ' + this.currentLanguageSet.successfully,
                    'success'
                  );
                  this.dataSource.data = [];
                  this.dataSource.paginator = this.paginator;
                  this.getAuditors();
                } else {
                  this.confirmationService.openDialog(
                    response.errorMessage,
                    'error'
                  );
                }
              },
              (err: any) => {
                this.confirmationService.openDialog(err.error, 'error');
              }
            );
          }
        });
    }
  }
  checkDuplicateFromMainList(mapObj: any) {
    let isDuplicate = false;
    this.mappedAgentList.filter((values) => {
      if (
        ( 
          values.roleId === mapObj.roleId &&
          values.agentId === mapObj.agentId) &&
        values.deleted === false
      ) {
        isDuplicate = true;
      }
    });

    return isDuplicate;
  }
  editQualityAuditorMapping(value: any) {
    const reqObj = {
      selectedAuditorMappingData: value,
      qualityAuditorData: this.mappedAgentList,
      isEdit: true,
    };
    this.qualitySupervisorService.createComponent(
      EditAgentComponent,
      reqObj
    );
  }
}
export interface audtiorMapped {
  qualityAuditorId: number;
  roleId: number;
  agentId: number[];
  qualityAuditorName: string;
  roleName: string;
  agentName: string[];
  deleted: any;

}