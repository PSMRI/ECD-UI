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

import { CallSectionQuestionaireMappingComponent } from './call-section-questionaire-mapping.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { CallConfigurationComponent } from '../call-configuration/call-configuration.component';

describe('CallSectionQuestionaireMappingComponent', () => {
  let component: CallSectionQuestionaireMappingComponent;
  let fixture: ComponentFixture<CallSectionQuestionaireMappingComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const lang = { rankAlreadyExists: 'rankExists', callSectionMappedSuccessfully: 'mapped' };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };

  const MASTERS = () => [
    { sectionId: 1, sectionName: 'Pregnancy', deleted: false },
    { sectionId: 2, sectionName: 'Child Health', deleted: false },
    { sectionId: 3, sectionName: 'Retired', deleted: true },
  ];

  async function setup(mapped: any[] = []) {
    supervisor = jasmine.createSpyObj('SupervisorService', [
      'getSectionConfigurations',
      'getMappedSections',
      'createCallSectionMapping',
      'createComponent',
    ]);
    supervisor.getSectionConfigurations.and.returnValue(of(MASTERS()));
    supervisor.getMappedSections.and.returnValue(of(mapped));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);

    await TestBed.configureTestingModule({
      declarations: [CallSectionQuestionaireMappingComponent],
      providers: [
        FormBuilder,
        { provide: SupervisorService, useValue: supervisor },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CallSectionQuestionaireMappingComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(CallSectionQuestionaireMappingComponent);
    component = fixture.componentInstance;
    component.data = { data: { callType: 'ECD1', callConfigId: 9 } };
    fixture.detectChanges();
  }

  describe('without existing mappings', () => {
    beforeEach(() => setup([]));

    it('patches the call and lists active section masters', () => {
      expect(component.callSectionQuestionaireMappingForm.value).toEqual({ callType: 'ECD1', callConfigId: 9 as any });
      expect(supervisor.getSectionConfigurations).toHaveBeenCalledWith(4);
      expect(supervisor.getMappedSections).toHaveBeenCalledWith(4, 9);
      expect(component.sectionsList.data.map((s: any) => s.sectionId)).toEqual([1, 2]);
    });

    it('goBack returns to the call configurations', () => {
      component.goBack();
      expect(supervisor.createComponent).toHaveBeenCalledWith(CallConfigurationComponent, null);
    });

    describe('rank and checkbox handling', () => {
      it('unchecks rows whose rank is cleared', () => {
        const item: any = { sectionRank: 0, isChecked: true };
        component.uncheckCheckBox(item);
        expect(item.sectionRank).toBeNull();
        expect(item.isChecked).toBeFalse();
        expect(component.enableSubmit).toBeFalse();
      });

      it('checks rank uniqueness for ranked, checked rows', () => {
        const rows: any[] = component.sectionsList.data;
        rows[0].isChecked = true;
        rows[0].sectionRank = 1;
        component.uncheckCheckBox(rows[0]);
        expect(component.enableSubmit).toBeTrue();
        rows[1].isChecked = true;
        rows[1].sectionRank = 1;
        component.uncheckCheckBox(rows[1]);
        expect(confirmation.openDialog).toHaveBeenCalledWith('rankExists', 'error');
        expect(component.enableSubmit).toBeFalse();
      });

      it('disableSumbit enables submit only for checked, ranked rows', () => {
        const item: any = { sectionRank: 2, isChecked: true };
        component.disableSumbit(item);
        expect(component.enableSubmit).toBeTrue();
        item.isChecked = false;
        component.disableSumbit(item);
        expect(component.enableSubmit).toBeFalse();
        expect(item.sectionRank).toBeNull();
      });
    });

    describe('onSubmit', () => {
      it('maps checked sections to the call', () => {
        supervisor.createCallSectionMapping.and.returnValue(of({ ok: true }));
        const rows: any[] = component.sectionsList.data;
        rows[1].isChecked = true;
        rows[1].sectionRank = 1;
        component.onSubmit();
        expect(supervisor.createCallSectionMapping).toHaveBeenCalledWith({
          callConfigId: 9,
          outboundCallType: 'ECD1',
          psmId: 4,
          createdBy: 'sup1',
          sections: [
            {
              id: undefined,
              sectionId: 2,
              sectionName: 'Child Health',
              sectionRank: 1,
              isChecked: true,
              callConfigId: 9,
              psmId: 4,
              deleted: false,
              createdBy: 'sup1',
              modifiedBy: null,
            },
          ],
        });
        expect(confirmation.openDialog).toHaveBeenCalledWith('mapped', 'success');
        expect(supervisor.createComponent).toHaveBeenCalledWith(CallConfigurationComponent, null);
      });

      it('does not submit duplicate ranks', () => {
        const rows: any[] = component.sectionsList.data;
        rows.forEach((r) => {
          r.isChecked = true;
          r.sectionRank = 1;
        });
        component.onSubmit();
        expect(supervisor.createCallSectionMapping).not.toHaveBeenCalled();
        expect(component.enableSubmit).toBeFalse();
      });
    });

    it('filterSearchTerm filters by section name', () => {
      component.filterSearchTerm('preg');
      expect(component.sectionsList.data.map((s: any) => s.sectionId)).toEqual([1]);
      component.filterSearchTerm();
      expect(component.sectionsList.data.length).toBe(2);
    });

    it('filterationForMappedSections appends mapped then unmapped masters', () => {
      component.sectionsList.data = [];
      component.filterationForMappedSections([{ sectionId: 2 }]);
      expect(component.sectionsList.data.map((s: any) => s.sectionId)).toEqual([2, 1]);
    });

    it('resets the form on destroy', () => {
      fixture.destroy();
      expect(component.callSectionQuestionaireMappingForm.value.callType).toBeNull();
    });
  });

  describe('with existing mappings', () => {
    beforeEach(() => setup([{ id: 50, sectionId: 2, sectionName: 'Child Health', sectionRank: 1, isChecked: true }]));

    it('lists mapped sections first, then the other masters', () => {
      expect(component.sectionsList.data.map((s: any) => s.sectionId)).toEqual([2, 1]);
    });

    it('sends unchecked existing mappings as deleted', () => {
      supervisor.createCallSectionMapping.and.returnValue(of({ ok: true }));
      const rows: any[] = component.sectionsList.data;
      rows[0].isChecked = false;
      rows[1].isChecked = true;
      rows[1].sectionRank = 1;
      component.onSubmit();
      const sections = supervisor.createCallSectionMapping.calls.mostRecent().args[0].sections;
      expect(sections.map((s: any) => [s.sectionId, s.deleted, s.modifiedBy])).toEqual([
        [2, true, 'sup1'],
        [1, false, null],
      ]);
    });
  });

  it('shows section master errors', async () => {
    await setup([]);
    supervisor.getSectionConfigurations.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getSectionMasters();
    supervisor.getSectionConfigurations.and.returnValue(throwError(() => ({ title: 'A', detail: 'B' })));
    component.getSectionMasters();
    supervisor.getSectionConfigurations.and.returnValue(of([]));
    component.getSectionMasters();
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('AB', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith(undefined as any, 'error');
  });
});
