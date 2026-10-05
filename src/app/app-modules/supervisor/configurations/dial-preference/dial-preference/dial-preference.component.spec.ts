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

import { DialPreferenceComponent } from './dial-preference.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';

describe('DialPreferenceComponent', () => {
  let component: DialPreferenceComponent;
  let fixture: ComponentFixture<DialPreferenceComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;

  const lang = {
    dialPreferenceAddedSuccessfully: 'dialPreferenceAddedSuccessfully',
    dialPreferenceRemovedSuccessfully: 'dialPreferenceRemovedSuccessfully',
  };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };
  const agents = [
    { roleID: 1, userID: 10, roleName: 'ANM', firstName: 'Asha', lastName: 'Rao', isAutoPreviewDial: true, previewWindowTime: 30 },
    { roleID: 2, userID: 11, roleName: 'MO', firstName: 'Ravi', lastName: null, isAutoPreviewDial: false, previewWindowTime: 10 },
    { roleID: 3, userID: 12, roleName: 'Associate', firstName: 'Sita', lastName: 'Devi', isAutoPreviewDial: null, previewWindowTime: null },
    { roleID: 4, userID: 13, roleName: 'Supervisor', firstName: 'Boss', lastName: 'X', isAutoPreviewDial: true, previewWindowTime: 30 },
  ];

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', ['fetchDialPreference', 'saveDialPreference']);
    supervisor.fetchDialPreference.and.returnValue(of(agents));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);

    await TestBed.configureTestingModule({
      declarations: [DialPreferenceComponent],
      providers: [
        FormBuilder,
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: SupervisorService, useValue: supervisor },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(DialPreferenceComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(DialPreferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('loading agents', () => {
    it('should create and list only Associate, ANM and MO agents', () => {
      expect(component).toBeTruthy();
      expect(supervisor.fetchDialPreference).toHaveBeenCalledWith(4);
      expect(component.preferenceList.length).toBe(3);
      expect(component.preferDupList.length).toBe(3);
      expect(component.sectionsData.data.length).toBe(3);
    });

    it('should map agent fields and auto-preview flag', () => {
      const v = component.preferenceList.controls.map((c) => c.getRawValue());
      expect(v[0]).toEqual({ roleId: 1, userId: 10, roleName: 'ANM', agentName: 'AshaRao', selected: true, previewWindowTime: 30 });
      expect(v[1].agentName).toBe('Ravi');
      expect(v[1].selected).toBeFalse();
      expect(v[2].selected).toBeFalse();
    });

    it('should only allow selecting agents with a 15-60 second preview window', () => {
      expect(component.preferenceList.at(0).get('selected')?.enabled).toBeTrue();
      expect(component.preferenceList.at(1).get('selected')?.disabled).toBeTrue();
      expect(component.preferenceList.at(2).get('selected')?.disabled).toBeTrue();
    });

    it('should show err.error when loading fails', () => {
      supervisor.fetchDialPreference.and.returnValue(throwError(() => ({ error: 'dp failed' })));
      component.getAutoPreviewDialingData();
      expect(confirmation.openDialog).toHaveBeenCalledWith('dp failed', 'error');
    });

    it('should show title + detail when loading fails without err.error', () => {
      supervisor.fetchDialPreference.and.returnValue(throwError(() => ({ title: 'A', detail: 'B' })));
      component.getAutoPreviewDialingData();
      expect(confirmation.openDialog).toHaveBeenCalledWith('AB', 'error');
    });

    it('reloading should replace, not append, the list', () => {
      component.getAutoPreviewDialingData();
      expect(component.preferenceList.length).toBe(3);
    });
  });

  describe('updateAllCheckboxes', () => {
    it('checking should save the preference with the preview time', () => {
      supervisor.saveDialPreference.and.returnValue(of({ data: 'ok' }));
      const element = { roleId: 1, userId: 10, previewWindowTime: 30 };
      component.updateAllCheckboxes({ checked: true }, element);
      expect(supervisor.saveDialPreference).toHaveBeenCalledWith({
        roleId: 1, userId: 10, isDialPreference: true, previewWindowTime: 30, createdBy: 'sup1', psmId: 4,
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('dialPreferenceAddedSuccessfully', 'success');
      expect(component.masterCheckbox).toBeTrue();
    });

    it('unchecking should clear the preview time and save the removal', () => {
      supervisor.saveDialPreference.and.returnValue(of({ data: 'ok' }));
      const element: any = { roleId: 1, userId: 10, previewWindowTime: 30, selected: true };
      component.updateAllCheckboxes({ checked: false }, element);
      expect(component.preferenceList.at(0).value.previewWindowTime).toBeNull();
      expect(element.selected).toBeFalse();
      expect(supervisor.saveDialPreference).toHaveBeenCalledWith(jasmine.objectContaining({
        isDialPreference: false, previewWindowTime: null,
      }));
      expect(confirmation.openDialog).toHaveBeenCalledWith('dialPreferenceRemovedSuccessfully', 'success');
      expect(component.masterCheckbox).toBeFalse();
    });

    it('should show err.error when saving fails', () => {
      supervisor.saveDialPreference.and.returnValue(throwError(() => ({ error: 'save failed' })));
      component.updateAllCheckboxes({ checked: true }, { roleId: 1, userId: 10 });
      expect(confirmation.openDialog).toHaveBeenCalledWith('save failed', 'error');
    });

    it('should show title + detail when removal fails without err.error', () => {
      supervisor.saveDialPreference.and.returnValue(throwError(() => ({ title: 'X', detail: 'Y' })));
      component.updateAllCheckboxes({ checked: false }, { roleId: 1, userId: 10 });
      expect(confirmation.openDialog).toHaveBeenCalledWith('XY', 'error');
    });
  });

  describe('removeCheck (preview time edits)', () => {
    it('should enable selection for a time between 15 and 60', () => {
      const ctrl: any = component.preferenceList.at(1);
      ctrl.patchValue({ previewWindowTime: 15 });
      component.removeCheck(ctrl);
      expect(ctrl.get('selected').enabled).toBeTrue();
      ctrl.patchValue({ previewWindowTime: 60 });
      component.removeCheck(ctrl);
      expect(ctrl.get('selected').enabled).toBeTrue();
    });

    [14, 61, null, ''].forEach((t) => {
      it(`should disable and unselect for an invalid time (${t})`, () => {
        const ctrl: any = component.preferenceList.at(0);
        ctrl.patchValue({ previewWindowTime: t });
        component.removeCheck(ctrl);
        expect(ctrl.get('selected').disabled).toBeTrue();
        expect(component.preferenceList.at(0).getRawValue().selected).toBeNull();
        expect(component.preferDupList.at(0).getRawValue().selected).toBeNull();
      });
    });
  });

  describe('filterSearchTerm', () => {
    it('should filter by role or agent name, case-insensitively', () => {
      component.dialPreferenceForm.controls['searchTerm'].setValue('asha' as any);
      component.filterSearchTerm();
      expect(component.sectionsData.data.length).toBe(1);
      component.dialPreferenceForm.controls['searchTerm'].setValue('mo' as any);
      component.filterSearchTerm();
      expect(component.sectionsData.data.length).toBe(1);
    });

    it('should restore all rows for an empty search', () => {
      component.dialPreferenceForm.controls['searchTerm'].setValue('zzz' as any);
      component.filterSearchTerm();
      expect(component.sectionsData.data.length).toBe(0);
      component.dialPreferenceForm.controls['searchTerm'].setValue('' as any);
      component.filterSearchTerm();
      expect(component.sectionsData.data.length).toBe(3);
      expect(component.preferenceList.controls.length).toBe(3);
    });
  });

  describe('helpers', () => {
    it('getActualIndex should offset by page when a paginator exists', () => {
      component.paginator = { pageSize: 10, pageIndex: 1 } as any;
      expect(component.getActualIndex(2)).toBe(12);
      component.paginator = null;
      expect(component.getActualIndex(2)).toBe(2);
    });

    it('applyFilter should trim and lowercase', () => {
      component.applyFilter(' ANM ');
      expect(component.sectionsData.filter).toBe('anm');
    });

    it('resetForm should clear both lists', () => {
      component.resetForm();
      expect(component.preferenceList.length).toBe(0);
      expect(component.preferDupList.length).toBe(0);
    });

    it('checkPreviewWindowTime should add a selected entry per row with a time', () => {
      component.sectionsData.data = [{ previewWindowTime: 20 }, { previewWindowTime: null }];
      component.checkPreviewWindowTime();
      expect(component.preferenceList.length).toBe(4);
    });

    // Documents current behaviour: rows are FormGroups, so previewWindowTime is
    // undefined on them and only an item without a time is reported as duplicate.
    it('checkDuplicatePreviewWindowTime compares against FormGroup properties', () => {
      expect(component.checkDuplicatePreviewWindowTime({ previewWindowTime: 30 })).toBeFalse();
      expect(component.checkDuplicatePreviewWindowTime({})).toBeTrue();
    });

    // Documents current behaviour: rows are FormGroups, which have no at().
    it('enableCheckBox throws because rows are FormGroups (edge case)', () => {
      expect(() => component.enableCheckBox(0)).toThrowError(TypeError);
    });
  });
});
