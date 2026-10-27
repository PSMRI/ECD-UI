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
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { EditAgentComponent } from './edit-agent.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { AgentMappingConfigurationComponent } from '../agent-mapping-configuration/agent-mapping-configuration.component';

describe('EditAgentComponent', () => {
  let component: EditAgentComponent;
  let fixture: ComponentFixture<EditAgentComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let master: jasmine.SpyObj<MasterService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const session: any = { providerServiceMapID: 4, userName: 'qs1' };
  const SELECTED = {
    id: 7, qualityAuditorId: 50, qualityAuditorName: 'Asha Rao', roleId: 2, roleName: 'Associate',
    agentId: 100, agentName: 'Ravi Kumar', deleted: false,
  };
  const MAPPED = [SELECTED, { roleId: 2, agentId: 101, deleted: false }, { roleId: 2, agentId: 102, deleted: true }];
  const AGENTS = [
    { userId: 100, firstName: 'Ravi', lastName: 'Kumar' },
    { userId: 101, firstName: 'Meena', lastName: 'Das' },
    { userId: 102, firstName: 'John', lastName: 'Doe' },
  ];

  async function setup(data: any = { isEdit: true, qualityAuditorData: MAPPED, selectedAuditorMappingData: SELECTED }) {
    qs = jasmine.createSpyObj('QualitySupervisorService', ['updateAgentQualityConfiguration', 'createComponent']);
    master = jasmine.createSpyObj('MasterService', ['getRoleMaster', 'getAgentMaster']);
    master.getRoleMaster.and.returnValue(
      of([{ roleId: 2, roleName: 'Associate' }, { roleId: 9, roleName: 'Quality Auditor' }, { roleId: 1, roleName: 'Supervisor' }]),
    );
    master.getAgentMaster.and.callFake((req: any) =>
      of(req.roleId === 9 ? [{ id: 50, name: 'Asha Rao' }] : AGENTS.map((a) => ({ ...a }))),
    );
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);

    await TestBed.configureTestingModule({
      declarations: [EditAgentComponent],
      providers: [
        FormBuilder,
        { provide: ConfirmationService, useValue: confirmation },
        { provide: QualitySupervisorService, useValue: qs },
        { provide: MasterService, useValue: master },
        { provide: SetLanguageService, useValue: { languageData: {} } },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(EditAgentComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(EditAgentComponent);
    component = fixture.componentInstance;
    component.data = data;
    // With HTTP the auditor list arrives after ngOnInit stores the selection;
    // the synchronous mocks need the selection in place up front.
    component.selectedmappedList = data.selectedAuditorMappingData;
    fixture.detectChanges();
  }

  const form = (): any => component.editQualityAuditorForm;

  it('patches the selected mapping with auditor and role locked', async () => {
    await setup();
    expect(component.enableEdit).toBeTrue();
    expect(form().getRawValue()).toEqual(
      jasmine.objectContaining({ id: 7, qualityAuditorId: 50, roleId: 2, agentId: 100, agentName: 'Ravi Kumar', deleted: false }),
    );
    expect(form().controls.qualityAuditorId.disabled).toBeTrue();
    expect(form().controls.roleId.disabled).toBeTrue();
    expect(component.rolesList.map((r) => r.roleName)).toEqual(['Associate']);
    expect(component.auditorList).toEqual([{ id: 50, name: 'Asha Rao' }]);
    expect(form().getRawValue().qualityAuditorName).toBe('Asha Rao');
  });

  it('keeps the current agent selectable but hides other active mappings', async () => {
    await setup();
    expect(component.agentNameList.map((a) => a.userId)).toEqual([100, 102]);
  });

  it('setAgenNameOnChange updates the agent name', async () => {
    await setup();
    form().controls.agentId.setValue(102);
    component.setAgenNameOnChange();
    expect(form().getRawValue().agentName).toBe('John Doe');
  });

  it('selectedAgents joins name and last name', async () => {
    await setup();
    expect(component.selectedAgents([{ name: 'A', lastName: 'B' }])).toEqual(['A B']);
  });

  it('shows master data errors', async () => {
    await setup();
    master.getRoleMaster.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getRoles();
    master.getAgentMaster.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
    component.getAgentValues();
    component.getAgentNames(2);
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
  });

  describe('updateQualityAuditor', () => {
    beforeEach(() => setup());

    it('updates the mapping and returns to the list', () => {
      qs.updateAgentQualityConfiguration.and.returnValue(of({ response: 'Updated' }));
      component.updateQualityAuditor({ id: 7, agentId: 102, agentName: 'John Doe' });
      expect(qs.updateAgentQualityConfiguration).toHaveBeenCalledWith({
        id: 7,
        qualityAuditorId: 50,
        roleId: 2,
        agentId: 102,
        qualityAuditorName: 'Asha Rao',
        roleName: 'Associate',
        agentName: 'John Doe',
        deleted: false,
        modifiedBy: 'qs1',
        createdBy: 'qs1',
        psmId: 4,
        agentIds: [102],
        agentNames: ['John Doe'],
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('Updated', 'success');
      expect(qs.createComponent).toHaveBeenCalledWith(AgentMappingConfigurationComponent, null);
    });

    it('shows update errors', () => {
      qs.updateAgentQualityConfiguration.and.returnValue(throwError(() => ({ error: 'dup' })));
      component.updateQualityAuditor({ id: 7 });
      qs.updateAgentQualityConfiguration.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.updateQualityAuditor({ id: 7 });
      expect(confirmation.openDialog).toHaveBeenCalledWith('dup', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });
  });

  it('back returns to the list after confirmation', async () => {
    await setup();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
    component.back();
    expect(qs.createComponent).not.toHaveBeenCalled();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    component.back();
    expect(qs.createComponent).toHaveBeenCalledWith(AgentMappingConfigurationComponent, null);
    expect(component.enableEdit).toBeFalse();
  });
});
