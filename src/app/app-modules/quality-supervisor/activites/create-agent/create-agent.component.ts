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
import { AbstractControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { AgentMappingConfigurationComponent } from '../agent-mapping-configuration/agent-mapping-configuration.component';
import { TitleCasePipe } from '@angular/common';
@Component({
  selector: 'app-create-agent',
  templateUrl: './create-agent.component.html',
  styleUrls: ['./create-agent.component.css']
})
export class CreateAgentComponent implements OnInit, DoCheck {
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @Input()
  public data: any;
  enableEdit = false;
  auditorList: any[] = [];
  rolesList: any[] = [];
  agentNameList: any[] = [];
  selectedAgentlist: any[] = [];
  selectedAuditorId: any;
  selectedRoleId: any;
  dataSource = new MatTableDataSource<audtiorMapping>();
  currentLanguageSet: any;
  agentRoleId: any;
  agentId: any;

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private qualitysupervisorService: QualitySupervisorService,
    private masterService: MasterService,
    private setLanguageService: SetLanguageService,
    private titlecasePipe:TitleCasePipe
  ) { }

  // getQualityAuditors() {
  //   this.auditorList = [
  //     {
  //       id: 10,
  //       name: 'Auditor 1',
  //     },
  //     {
  //       id: 2,
  //       name: 'Auditor 2 ',
  //     },
  //     {
  //       id: 3,
  //       name: 'Auditor 3',
  //     },

  //     {
  //       id: 4,
  //       name: 'Auditor 4',
  //     },
  //     {
  //       id: 5,
  //       name: 'Auditor 5',
  //     },
  //     {
  //       id: 6,
  //       name: 'Auditor 6',
  //     },
  //   ];

  //   let psmId = sessionStorage.getItem('providerServiceMapID');

  //   this.masterService.getAuditorMaster(psmId).subscribe(
  //     (response: any) => {
  //       if (response && response.statusCode === 200 && response.data) {
  //         this.auditorList = response.data;
  //       } else {
  //         this.confirmationService.openDialog(response.errorMessage, 'error');
  //       }
  //     },
  //     (err: any) => {
  //       this.confirmationService.openDialog(err, 'error');
  //     }
  //   );
  // }
  getRoles() {
    const psmId = sessionStorage.getItem('providerServiceMapID');
    this.masterService.getRoleMaster(psmId).subscribe(
      (response: any) => {
        if (response) {
          response.filter((values: any) => {
            if (values.roleName === "Associate" || values.roleName === "ANM" || values.roleName === "MO") {
              this.rolesList.push(values);
            }
            else if (values.roleName === "Quality Auditor") {
              this.agentRoleId = values.roleId;
              this.getAgentValues();
              // this.auditorList.push(values);
            }
          });
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
  getAgentValues(){
    this.agentNameList = [];
    const reqObj = {
      roleId: this.agentRoleId,
    }
    this.masterService.getAgentMaster(reqObj).subscribe(
      (response: any) => {
        if (response) {
          this.createQualityAuditorForm.controls['agentIds'].reset();
          this.agentNameList = response;
          this.auditorList = response;
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
  getAgentNames(selectedRole: any) {
    this.agentNameList = [];
    const reqObj = {
      roleId: selectedRole,
    }
    this.masterService.getAgentMaster(reqObj).subscribe(
      (response: any) => {
        if (response) {
          this.createQualityAuditorForm.controls['agentIds'].reset();
          this.agentNameList = response;
          const alreadyMappedAgents = []
          console.log(this.data.qualityAuditorData);
          for (let i = 0; i < this.data.qualityAuditorData.length; i++) {
            if (selectedRole === this.data.qualityAuditorData[i].roleId)
              if (this.data.qualityAuditorData[i].deleted === false) {
                alreadyMappedAgents.push(this.data.qualityAuditorData[i].agentId)
              }

          }
          this.removeAlreadyMappedAgents(alreadyMappedAgents);
          console.log(this.agentNameList);
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

  removeAlreadyMappedAgents(element: any[]) {
    for (let i = 0; i < element.length; i++) {
      this.agentNameList.forEach((value, index) => {
        if (value.userId === element[i]) this.agentNameList.splice(index, 1);
      });
    }
  }
  createQualityAuditorForm = this.fb.group({
    qualityAuditorId: ['', Validators.required],
    roleId: ['', Validators.required],
    agentIds: ['', Validators.required],
    qualityAuditorName: [''],
    roleName: [''],
    agentNames: ['']
  });
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
            AgentMappingConfigurationComponent,
            null
          );
          // this.selectedQuestionnaireList = [];
          this.enableEdit = false;
        }
      });
  }
  resetForm() {
    this.createQualityAuditorForm.reset();
  }

  setQualityAuditorTypeName(qualitorAuditorTypeValue: any) {
    this.selectedAuditorId = qualitorAuditorTypeValue;
    this.auditorList.filter((values) => {
      if (values.userId === qualitorAuditorTypeValue) {
        this.createQualityAuditorForm.controls['qualityAuditorName'].setValue(
          values.firstName +''+ values.lastName
        );
      }
    });
  }

  setRoleType(qualitorRoleTypeValue: any) {
    this.createQualityAuditorForm.get('agentIds')?.enable()
    this.getAgentNames(qualitorRoleTypeValue)
    this.rolesList.filter((values) => {
      if (values.roleId === qualitorRoleTypeValue) {
        this.createQualityAuditorForm.controls['roleName'].setValue(
          values.roleName
        );

      }

    });
  }

  setAgentName(qualitorAgentTypeValue: any) {
    const listOfAgents: any = [];
    this.selectedAgentlist = [];
    for (let j = 0; j < qualitorAgentTypeValue.length; j++) {
      listOfAgents.push(this.agentNameList.find(i => i.userId === qualitorAgentTypeValue[j]))
    }

    this.selectedAgentlist = this.selectedAgents(listOfAgents);
    console.log(this.selectedAgentlist);
    // let control:FormArray
    //   control=<FormArray>this.createQualityAuditorForm.controls['agentNames'];
    //   list.forEach((value) => {
    //       control.push(this.patchValues(value));
    //     })

  }
  //  private patchValues(item:any): AbstractControl {
  //       return this.fb.group({
  //          item
  //       })
  //     }
  selectedAgents(listOfAgents: any[]) {
    const listOfAgentNames: any[] = []
    for (let i = 0; i < listOfAgents.length; i++) {
      listOfAgentNames.push(this.titlecasePipe.transform(listOfAgents[i].firstName + " " +listOfAgents[i].lastName))
    }
    return listOfAgentNames
  }
  addQualityAuditor(formData: any) {
    // console.log(formData);
    let reqObj: any = {};
    reqObj = {
      qualityAuditorId: formData.qualityAuditorId,
      roleId: formData.roleId,
      agentIds: formData.agentIds,
      qualityAuditorName: formData.qualityAuditorName,
      roleName: formData.roleName,
      agentNames: this.selectedAgentlist,
      createdBy: sessionStorage.getItem('userName'),
      psmId: sessionStorage.getItem('providerServiceMapID'),
    };
    console.log(reqObj);
    // this.openConfirmatoryDialog();
    // this.createQualityAuditorForm.reset(this.createQualityAuditorForm.value);
    // this.createQualityAuditorForm.get('agentIds')?.disable();
    this.qualitysupervisorService.saveQualityAuditorAgent(reqObj).subscribe(
      (response: any) => {
        if (response) {
          this.confirmationService.openDialog(
            response.response,
            'success'
          );
          this.resetForm();
          this.dataSource.data = [];
          this.dataSource.paginator = this.paginator;
          this.qualitysupervisorService.createComponent(
            AgentMappingConfigurationComponent,
            null
          );
        } else {
          this.confirmationService.openDialog(response.errorMessage, 'error');
        }
      },
      (err) => {
        if(err && err.error)
        this.confirmationService.openDialog(err.error, 'error');
        else
        this.confirmationService.openDialog(err.title + err.detail, 'error')
        });
  }
  openConfirmatoryDialog() {
    this.confirmationService.openDialog(this.currentLanguageSet.auditorMappedSuccessfully, `success`);
  }
  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }
  ngDoCheck() {
    this.getSelectedLanguage();
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    // this.getQualityAuditors();
    this.getRoles();
    this.createQualityAuditorForm.get('agentIds')?.disable();
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

export interface audtiorMapping {
  qualityAuditorId: number;
  roleId: number;
  agentIds: number[];
  qualityAuditorName: string;
  roleName: string;
  agentNames: string[];
}