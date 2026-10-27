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


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { AgentMappingConfigurationComponent } from './agent-mapping-configuration.component';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { LoginserviceService } from 'src/app/app-modules/services/loginservice/loginservice.service';
import { CreateAgentComponent } from '../create-agent/create-agent.component';
import { EditAgentComponent } from '../edit-agent/edit-agent.component';

describe('AgentMappingConfigurationComponent', () => {
  let component: AgentMappingConfigurationComponent;
  let fixture: ComponentFixture<AgentMappingConfigurationComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const lang = { areYouSureWantTo: 'Are you sure want to', successfully: 'successfully' };
  const session: any = { providerServiceMapID: 4, userName: 'qs1' };
  const MAPPED = () => [
    { id: 1, qualityAuditorId: 5, qualityAuditorName: 'Auditor A', roleId: 2, roleName: 'Associate', agentId: 100, agentName: 'Agent X', deleted: false },
    { id: 2, qualityAuditorId: 6, qualityAuditorName: 'Auditor B', roleId: 2, roleName: 'Associate', agentId: 100, agentName: 'Agent X', deleted: true },
    { id: 3, qualityAuditorId: 6, qualityAuditorName: 'Auditor B', roleId: 3, roleName: 'ANM', agentId: 200, agentName: 'Agent Y', deleted: true },
  ];

  beforeEach(async () => {
    qs = jasmine.createSpyObj('QualitySupervisorService', ['getAgentMappedData', 'updateAgentQualityConfiguration', 'createComponent']);
    qs.getAgentMappedData.and.returnValue(of(MAPPED()));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    await TestBed.configureTestingModule({
      declarations: [AgentMappingConfigurationComponent],
      providers: [
        { provide: QualitySupervisorService, useValue: qs },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: LoginserviceService, useValue: {} },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(AgentMappingConfigurationComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(AgentMappingConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads numbered auditor mappings', () => {
    expect(qs.getAgentMappedData).toHaveBeenCalledWith(4);
    expect(component.dataSource.data.map((m: any) => m.sno)).toEqual([1, 2, 3]);
  });

  it('shows load errors', () => {
    qs.getAgentMappedData.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getAuditors();
    qs.getAgentMappedData.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
    component.getAuditors();
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
  });

  it('opens the create and edit screens', () => {
    component.openCreateAgentMapping();
    expect(qs.createComponent).toHaveBeenCalledWith(CreateAgentComponent, {
      qualityAuditorData: component.mappedAgentList,
      isEdit: false,
    });
    const item = component.mappedAgentList[0];
    component.editQualityAuditorMapping(item);
    expect(qs.createComponent).toHaveBeenCalledWith(EditAgentComponent, {
      selectedAuditorMappingData: item,
      qualityAuditorData: component.mappedAgentList,
      isEdit: true,
    });
  });

  describe('activateDeactivateAuditor', () => {
    it('refuses to activate an agent already mapped to another auditor', () => {
      component.activateDeactivateAuditor(component.mappedAgentList[1], 'activate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Agent Already Mapped', 'error');
      expect(qs.updateAgentQualityConfiguration).not.toHaveBeenCalled();
    });

    it('activates an unmapped agent and reloads', () => {
      qs.updateAgentQualityConfiguration.and.returnValue(of({ ok: true }));
      qs.getAgentMappedData.calls.reset();
      component.activateDeactivateAuditor(component.mappedAgentList[2], 'activate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Are you sure want to activate?', 'confirm');
      expect(qs.updateAgentQualityConfiguration).toHaveBeenCalledWith({
        id: 3,
        qualityAuditorId: 6,
        roleId: 3,
        agentId: 200,
        qualityAuditorName: 'Auditor B',
        roleName: 'ANM',
        agentName: 'Agent Y',
        modifiedBy: 'qs1',
        createdBy: 'qs1',
        psmId: 4,
        agentIds: [200],
        agentNames: ['Agent Y'],
        deleted: 'false',
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('Activated successfully', 'success');
      expect(qs.getAgentMappedData).toHaveBeenCalled();
    });

    it('deactivates with deleted true and reports errors', () => {
      qs.updateAgentQualityConfiguration.and.returnValue(of({ ok: true }));
      component.activateDeactivateAuditor(component.mappedAgentList[0], 'deactivate');
      expect(qs.updateAgentQualityConfiguration.calls.mostRecent().args[0].deleted).toBe('true');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Deactivated successfully', 'success');
      qs.updateAgentQualityConfiguration.and.returnValue(throwError(() => ({ error: 'down' })));
      component.activateDeactivateAuditor(component.mappedAgentList[0], 'deactivate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    });

    it('does nothing when declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.activateDeactivateAuditor(component.mappedAgentList[0], 'deactivate');
      expect(qs.updateAgentQualityConfiguration).not.toHaveBeenCalled();
    });
  });

  it('filterSearchTerm matches auditor, role or agent', () => {
    component.filterSearchTerm('anm');
    expect(component.dataSource.data.map((m: any) => m.id)).toEqual([3]);
    component.filterSearchTerm('auditor b');
    expect(component.dataSource.data.map((m: any) => m.id)).toEqual([2, 3]);
    component.filterSearchTerm('');
    expect(component.dataSource.data.length).toBe(3);
  });
});
