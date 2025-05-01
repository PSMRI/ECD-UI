/*
* AMRIT – Accessible Medical Records via Integrated Technology
* Integrated EHR (Electronic Health Records) Solution
*
* Copyright (C) "Piramal Swasthya Management and Research Institute"
*
* This file is part of AMRIT.
*
* Licensed under GNU General Public License v3.0
* See: https://www.gnu.org/licenses/gpl-3.0.html
*/

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatPaginator } from '@angular/material/paginator';

import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { CreateAgentComponent } from '../create-agent/create-agent.component';
import { EditAgentComponent } from '../edit-agent/edit-agent.component';

@Component({
  selector: 'app-agent-mapping-configuration',
  templateUrl: './agent-mapping-configuration.component.html',
  styleUrls: ['./agent-mapping-configuration.component.css']
})
export class AgentMappingConfigurationComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  mappedAgentList: AuditorMapped[] = [];
  searchTerm = '';
  currentLanguageSet: any;

  dataSource = new MatTableDataSource<AuditorMapped>();

  displayedColumns: string[] = [
    'sno', 'qualityAuditorName', 'roleName', 'agentName', 'edit', 'delete'
  ];

  constructor(
    private qualitySupervisorService: QualitySupervisorService,
    private setLanguageService: SetLanguageService,
    private confirmationService: ConfirmationService,
    private sessionStorage: SessionStorageService
  ) {}

  ngOnInit(): void {
    this.getAuditors();
    this.getSelectedLanguage();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openCreateAgentMapping() {
    this.qualitySupervisorService.createComponent(CreateAgentComponent, {
      qualityAuditorData: this.mappedAgentList,
      isEdit: false
    });
  }

  private getSelectedLanguage() {
    this.currentLanguageSet = this.setLanguageService.languageData || {};
  }

  filterSearchTerm(searchTerm: string) {
    const filtered = this.mappedAgentList.filter(item =>
      ['qualityAuditorName', 'roleName', 'agentName'].some(
        key => item[key]?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    this.dataSource.data = searchTerm ? filtered : this.mappedAgentList;
  }

  private getAuditors() {
    const psmId = this.sessionStorage.getItem('providerServiceMapID');

    this.qualitySupervisorService.getAgentMappedData(psmId).subscribe({
      next: (response) => {
        if (response) {
          this.mappedAgentList = response.map((item: any, index: number) => ({
            ...item,
            sno: index + 1
          }));
          this.dataSource.data = this.mappedAgentList;
        } else {
          this.confirmationService.openDialog('Failed to load data', 'error');
        }
      },
      error: (err) => {
        const message = err.error || `${err.title || ''} ${err.detail || ''}`;
        this.confirmationService.openDialog(message, 'error');
      }
    });
  }

  activateDeactivateAuditor(tableValue: AuditorMapped, action: 'activate' | 'deactivate') {
    if (action === 'activate' && this.isDuplicateMapping(tableValue)) {
      this.confirmationService.openDialog('Agent Already Mapped', 'error');
      return;
    }

    const status = action === 'activate' ? 'Activated' : 'Deactivated';

    this.confirmationService.openDialog(
      `${this.currentLanguageSet.areYouSureWantTo} ${action}?`, 'confirm'
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      const reqObj = {
        ...tableValue,
        deleted: action !== 'activate',
        modifiedBy: this.sessionStorage.getItem('userName'),
        psmId: this.sessionStorage.getItem('providerServiceMapID'),
        agentIds: [tableValue.agentId],
        agentNames: [tableValue.agentName]
      };

      this.qualitySupervisorService.updateAgentQualityConfiguration(reqObj).subscribe({
        next: (resp) => {
          if (resp) {
            this.confirmationService.openDialog(`${status} successfully`, 'success');
            this.getAuditors();
          } else {
            this.confirmationService.openDialog(resp.errorMessage, 'error');
          }
        },
        error: (err) => {
          this.confirmationService.openDialog(err.error, 'error');
        }
      });
    });
  }

  private isDuplicateMapping(mapObj: AuditorMapped): boolean {
    return this.mappedAgentList.some(values =>
      values.roleId === mapObj.roleId &&
      values.agentId === mapObj.agentId &&
      !values.deleted
    );
  }

  editQualityAuditorMapping(value: AuditorMapped) {
    this.qualitySupervisorService.createComponent(EditAgentComponent, {
      selectedAuditorMappingData: value,
      qualityAuditorData: this.mappedAgentList,
      isEdit: true
    });
  }
}

export interface AuditorMapped {
  id?: number;
  qualityAuditorId: number;
  roleId: number;
  agentId: number;
  qualityAuditorName: string;
  roleName: string;
  agentName: string;
  deleted?: boolean;
  sno?: number;
}
