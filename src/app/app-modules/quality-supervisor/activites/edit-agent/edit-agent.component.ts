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
import { FormBuilder, Validators } from '@angular/forms';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { AgentMappingConfigurationComponent } from '../agent-mapping-configuration/agent-mapping-configuration.component';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-edit-agent',
  templateUrl: './edit-agent.component.html',
  styleUrls: ['./edit-agent.component.css']
})
export class EditAgentComponent implements OnInit, DoCheck {
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @Input()
  public data: any;
  enableEdit = false;
  dataSource = new MatTableDataSource<audtiorMapping>();
  qualityAuditorAgentMappingList:any[]=[];
  selectedmappedList:any
  auditorList: any[] = [];
  rolesList: any[] =[];
  agentNameList: any[]= [];
  currentLanguageSet: any;
  agentRoleId: any;
  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private qualitysupervisorService: QualitySupervisorService,
    private setLanguageService: SetLanguageService,
    private masterService: MasterService,
    readonly sessionstorage:SessionStorageService,
  ) { }

  editQualityAuditorForm = this.fb.group({
    id:[''],
    qualityAuditorId: ['', Validators.required],
    roleId: ['', Validators.required],
    agentId: ['', Validators.required],
    qualityAuditorName: [''],
    roleName: [''],
    agentName: [''],
    deleted: [''],
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
    this.editQualityAuditorForm.reset();
   }

   setQualityAuditorTypeNameForEdit(qualitorAuditorTypeValue: any) {
    this.auditorList.filter((values) => {
      if (values.id === qualitorAuditorTypeValue) {
        this.editQualityAuditorForm.controls['qualityAuditorName'].setValue(
          values.name
        );
      }
    });
  }
  setRoleTypeForEdit(qualitorRoleTypeValue: any) {
    this.getAgentNames(qualitorRoleTypeValue);
    // this.createQualityAuditorForm.get('agentId')?.enable()
    this.rolesList.filter((values) => {
      if (values.id === qualitorRoleTypeValue) {
        this.editQualityAuditorForm.controls['roleName'].setValue(
          values.name
        );

      }
      
    });
  }

  setAgentNameForEdit(qualitorAgentTypeValue: any) {
    this.agentNameList.filter((values) => {
      if (values.userId === qualitorAgentTypeValue) {
        this.editQualityAuditorForm.controls['agentName'].setValue(
          values.firstName + " " + values.lastName
        );

      }
      
    });
   
  }
 
  selectedAgents(listOfAgents:any[]){
  const listOfAgentNames:any[]=[]
  for (let i = 0; i < listOfAgents.length; i++) {
      listOfAgentNames.push((listOfAgents[i].name + " " +listOfAgents[i].lastName))
    }
    return listOfAgentNames
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
  // console.log(this.data);
  this.editQualityAuditorForm.get('qualityAuditorId')?.disable();
  this.editQualityAuditorForm.get('roleId')?.disable();
  // this. getQualityAuditors();
   this.getRoles();
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
      this.data.qualityAuditorData !== null &&
      this.data.qualityAuditorData !== undefined
    ) {
      this.qualityAuditorAgentMappingList = this.data.qualityAuditorData;
    }

    if (
      this.data.selectedAuditorMappingData !== null &&
      this.data.selectedAuditorMappingData !== undefined
    ) {
      this.selectedmappedList = this.data.selectedAuditorMappingData;
      console.log(this.selectedmappedList);
      this.getAgentNames(this.selectedmappedList.roleId);
      this.patchValuesForEdit();
      
    }
   
  }
  patchValuesForEdit() {
    this.editQualityAuditorForm.controls['id'].patchValue(
      this.selectedmappedList.id
    );

    this.editQualityAuditorForm.controls['qualityAuditorId'].patchValue(
      this.selectedmappedList.qualityAuditorId
    );    
    this.setQualityAuditorTypeNameForEdit(
      this.selectedmappedList.qualityAuditorId
    );
  
    this.editQualityAuditorForm.controls['roleId'].patchValue(
      this.selectedmappedList.roleId
    );
    this.setRoleTypeForEdit(
      this.selectedmappedList.roleId
    )
    this.editQualityAuditorForm.controls['deleted'].patchValue(
      this.selectedmappedList.deleted
    );
    } 

    getRoles() {
      const psmId = this.sessionstorage.getItem('providerServiceMapID');
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
      const reqObj = {
        roleId: this.agentRoleId,
      }
      this.masterService.getAgentMaster(reqObj).subscribe(
        (response: any) => {
          if (response) {
            this.auditorList = response;
            this.editQualityAuditorForm.controls.qualityAuditorId.patchValue(this.selectedmappedList.qualityAuditorId);
            this.editQualityAuditorForm.controls.agentId.patchValue(this.selectedmappedList.agentId);
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

    setAgenNameOnChange(){
      const agentId = this.editQualityAuditorForm.controls.agentId.value;
      this.agentNameList.filter((item: any) => {
        if(item.userId === agentId){
          this.editQualityAuditorForm.controls.agentName.patchValue(item.firstName + " " + item.lastName);
        }
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
            this.agentNameList = response;
            if(this.agentNameList.length>0){
              this.editQualityAuditorForm.controls['agentId'].patchValue(
                this.selectedmappedList.agentId
              )
              this.setAgentNameForEdit(
                this.selectedmappedList.agentId
              )
            }
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
          if (value.userId === element[i] && value.userId !== this.selectedmappedList.agentId) this.agentNameList.splice(index, 1);
        });
      }
    }
    updateQualityAuditor(editValue: any){
   
      const agentIds:any[]=[];
      const agentNames:any[]=[]
      agentIds.push(editValue.agentId);
      agentNames.push(editValue.agentName)
      const reqObj: any = {
        id: editValue.id,
        qualityAuditorId: this.selectedmappedList.qualityAuditorId,
        roleId: this.selectedmappedList.roleId,
        agentId: editValue.agentId,
        qualityAuditorName: this.selectedmappedList.qualityAuditorName,
        roleName: this.selectedmappedList.roleName,
        agentName: editValue.agentName,
        deleted: false,
        modifiedBy: this.sessionstorage.getItem('userName'),
        createdBy: this.sessionstorage.getItem('userName'),
        psmId: this.sessionstorage.getItem('providerServiceMapID'),
        agentIds:agentIds,
        agentNames:agentNames
      };
      console.log(reqObj);
        // this.confirmationService.openDialog('Auditor Updated Successfully', `success`);
        this.qualitysupervisorService.updateAgentQualityConfiguration(reqObj).subscribe(
          (response: any) => {
            if (response) {
              this.confirmationService.openDialog(
                response.response,
                'success'
              );
              this.editQualityAuditorForm.reset(this.editQualityAuditorForm.value);
              this.qualitysupervisorService.createComponent(
                AgentMappingConfigurationComponent,
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
            });
      }
    }
export interface audtiorMapping {
  id:number;
  qualityAuditorId: number;
  roleId: number;
  agentId: number;
  qualityAuditorName:string;
  roleName:string;
  agentName:string[]; 
}
