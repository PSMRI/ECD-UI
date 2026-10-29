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
import { TitleCasePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { CreateAgentComponent } from './create-agent.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { AgentMappingConfigurationComponent } from '../agent-mapping-configuration/agent-mapping-configuration.component';

describe('CreateAgentComponent', () => {
  let component: CreateAgentComponent;
  let fixture: ComponentFixture<CreateAgentComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let master: jasmine.SpyObj<MasterService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const lang = { auditorMappedSuccessfully: 'mapped' };
  const session: any = { providerServiceMapID: 4, userName: 'qs1' };
  const AUDITORS = [{ userId: 50, firstName: 'Asha', lastName: 'Rao' }];
  const AGENTS = [
    { userId: 100, firstName: 'ravi', lastName: 'kumar' },
    { userId: 101, firstName: 'meena', lastName: 'das' },
    { userId: 102, firstName: 'john', lastName: 'doe' },
  ];

  async function setup(data: any = { isEdit: false, qualityAuditorData: [{ roleId: 2, agentId: 101, deleted: false }, { roleId: 2, agentId: 102, deleted: true }] }) {
    qs = jasmine.createSpyObj('QualitySupervisorService', ['saveQualityAuditorAgent', 'createComponent']);
    master = jasmine.createSpyObj('MasterService', ['getRoleMaster', 'getAgentMaster']);
    master.getRoleMaster.and.returnValue(
      of([
        { roleId: 1, roleName: 'Supervisor' },
        { roleId: 2, roleName: 'Associate' },
        { roleId: 3, roleName: 'ANM' },
        { roleId: 9, roleName: 'Quality Auditor' },
      ]),
    );
    master.getAgentMaster.and.callFake((req: any) => of(req.roleId === 9 ? [...AUDITORS] : AGENTS.map((a) => ({ ...a }))));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);

    await TestBed.configureTestingModule({
      declarations: [CreateAgentComponent],
      providers: [
        FormBuilder,
        TitleCasePipe,
        { provide: ConfirmationService, useValue: confirmation },
        { provide: QualitySupervisorService, useValue: qs },
        { provide: MasterService, useValue: master },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CreateAgentComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(CreateAgentComponent);
    component = fixture.componentInstance;
    component.data = data;
    fixture.detectChanges();
  }

  const form = (): any => component.createQualityAuditorForm;

  it('loads agent roles and the quality auditors', async () => {
    await setup();
    expect(component.rolesList.map((r) => r.roleName)).toEqual(['Associate', 'ANM']);
    expect(component.agentRoleId).toBe(9);
    expect(master.getAgentMaster).toHaveBeenCalledWith({ roleId: 9 });
    expect(component.auditorList).toEqual(AUDITORS);
    expect(form().controls.agentIds.disabled).toBeTrue();
    expect(component.enableEdit).toBeFalse();
  });

  it('flags edit mode and shows role errors', async () => {
    await setup({ isEdit: true, qualityAuditorData: [] });
    expect(component.enableEdit).toBeTrue();
    master.getRoleMaster.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getRoles();
    master.getRoleMaster.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
    component.getRoles();
    master.getAgentMaster.and.returnValue(throwError(() => ({ error: 'agents down' })));
    component.getAgentValues();
    component.getAgentNames(2);
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('agents down', 'error');
  });

  it('setQualityAuditorTypeName stores the auditor and name', async () => {
    await setup();
    component.setQualityAuditorTypeName(50);
    expect(component.selectedAuditorId).toBe(50);
    expect(form().value.qualityAuditorName).toBe('AshaRao');
  });

  it('setRoleType enables agents and hides those already actively mapped', async () => {
    await setup();
    component.setRoleType(2);
    expect(form().controls.agentIds.enabled).toBeTrue();
    expect(form().value.roleName).toBe('Associate');
    expect(component.agentNameList.map((a) => a.userId)).toEqual([100, 102]);
  });

  it('setAgentName title-cases the selected agent names', async () => {
    await setup();
    component.setRoleType(2);
    component.setAgentName([100, 102]);
    expect(component.selectedAgentlist).toEqual(['Ravi Kumar', 'John Doe']);
  });

  describe('addQualityAuditor', () => {
    beforeEach(async () => {
      await setup();
      component.setRoleType(2);
      component.setAgentName([100]);
    });

    const formData = { qualityAuditorId: 50, roleId: 2, agentIds: [100], qualityAuditorName: 'AshaRao', roleName: 'Associate' };

    it('saves the mapping and returns to the list', () => {
      qs.saveQualityAuditorAgent.and.returnValue(of({ response: 'Saved' }));
      component.addQualityAuditor(formData);
      expect(qs.saveQualityAuditorAgent).toHaveBeenCalledWith({
        ...formData,
        agentNames: ['Ravi Kumar'],
        createdBy: 'qs1',
        psmId: 4,
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('Saved', 'success');
      expect(qs.createComponent).toHaveBeenCalledWith(AgentMappingConfigurationComponent, null);
    });

    it('shows save errors', () => {
      qs.saveQualityAuditorAgent.and.returnValue(throwError(() => ({ error: 'dup' })));
      component.addQualityAuditor(formData);
      qs.saveQualityAuditorAgent.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.addQualityAuditor(formData);
      expect(confirmation.openDialog).toHaveBeenCalledWith('dup', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });
  });

  it('openConfirmatoryDialog shows the mapped message', async () => {
    await setup();
    component.openConfirmatoryDialog();
    expect(confirmation.openDialog).toHaveBeenCalledWith('mapped', 'success');
  });

  it('back resets and returns after confirmation', async () => {
    await setup();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
    component.back();
    expect(qs.createComponent).not.toHaveBeenCalled();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    form().patchValue({ roleName: 'x' });
    component.back();
    expect(form().value.roleName).toBeNull();
    expect(qs.createComponent).toHaveBeenCalledWith(AgentMappingConfigurationComponent, null);
  });
});
