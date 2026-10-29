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
import { FormBuilder, FormControl } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { QualitySectionConfigurationComponent } from '../quality-section-configuration/quality-section-configuration.component';
import { EditQualitySectionConfigurationComponent } from './edit-quality-section-configuration.component';

describe('EditQualitySectionConfigurationComponent', () => {
  let component: EditQualitySectionConfigurationComponent;
  let fixture: ComponentFixture<EditQualitySectionConfigurationComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const lang = { rankExist: 'rankExist' };
  const session: any = { providerServiceMapID: 4, userName: 'qs1' };
  const SELECTED = { sectionId: 1, sectionName: 'Greeting', rank: 1, sectionDesc: 'Opening', deleted: false };
  const LIST = [SELECTED, { sectionId: 2, rank: 2, deleted: false }, { sectionId: 3, rank: 3, deleted: true }];

  async function setup(data: any = { selectedAuditSectionData: SELECTED, qualityAuditSectionData: LIST }) {
    qs = jasmine.createSpyObj('QualitySupervisorService', ['updateSectionConfiguration', 'createComponent']);
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    await TestBed.configureTestingModule({
      declarations: [EditQualitySectionConfigurationComponent],
      providers: [
        FormBuilder,
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: QualitySupervisorService, useValue: qs },
        { provide: ConfirmationService, useValue: confirmation },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(EditQualitySectionConfigurationComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(EditQualitySectionConfigurationComponent);
    component = fixture.componentInstance;
    component.data = data;
    fixture.detectChanges();
  }

  const form = (): any => component.editqualityAuditSectionForm;

  it('patches the selected section', async () => {
    await setup();
    expect(form().value).toEqual({ sectionId: 1, sectionName: 'Greeting', rank: 1, sectionDesc: 'Opening' });
    form().controls.sectionName.setValue('  ');
    expect(form().controls.sectionName.hasError('whitespace')).toBeTrue();
    form().controls.sectionDesc.setValue('  ');
    expect(form().controls.sectionDesc.hasError('nonWhitespace')).toBeTrue();
    expect(component.validateWhitespace(new FormControl(undefined))).toBeUndefined();
  });

  it('leaves the form empty without a selection', async () => {
    await setup({});
    expect(form().value.sectionName).toBe('');
  });

  describe('updateSectionConfiguration', () => {
    beforeEach(() => setup());

    it('rejects a rank used by another active section', () => {
      component.updateSectionConfiguration({ ...form().value, rank: 2 });
      expect(confirmation.openDialog).toHaveBeenCalledWith('rankExist', 'error');
      expect(qs.updateSectionConfiguration).not.toHaveBeenCalled();
    });

    it('updates with an unchanged or free rank and returns to the list', () => {
      qs.updateSectionConfiguration.and.returnValue(of({ response: 'Updated' }));
      component.updateSectionConfiguration({ ...form().value, sectionName: 'Welcome' });
      expect(qs.updateSectionConfiguration).toHaveBeenCalledWith({
        sectionId: 1,
        sectionName: 'Welcome',
        rank: 1,
        sectionDesc: 'Opening',
        createdBy: 'qs1',
        psmId: 4,
        deleted: false,
        modifiedBy: 'qs1',
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('Updated', 'success');
      expect(qs.createComponent).toHaveBeenCalledWith(QualitySectionConfigurationComponent, null);
      component.updateSectionConfiguration({ ...form().value, rank: 3 });
      expect(qs.updateSectionConfiguration).toHaveBeenCalledTimes(2);
    });

    it('shows update failures', () => {
      qs.updateSectionConfiguration.and.returnValue(of({ errorMessage: 'nope' }));
      component.updateSectionConfiguration(form().value);
      qs.updateSectionConfiguration.and.returnValue(throwError(() => ({ error: 'down' })));
      component.updateSectionConfiguration(form().value);
      qs.updateSectionConfiguration.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.updateSectionConfiguration(form().value);
      expect(confirmation.openDialog).toHaveBeenCalledWith('nope', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });
  });

  it('accepts any rank when there are no sections', async () => {
    await setup({ selectedAuditSectionData: SELECTED });
    expect(component.checkDuplicateRangeFromMainList({ rank: 2 })).toBeFalse();
  });

  it('back resets and returns after confirmation', async () => {
    await setup();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
    component.back();
    expect(qs.createComponent).not.toHaveBeenCalled();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    component.back();
    expect(form().value.sectionName).toBeNull();
    expect(qs.createComponent).toHaveBeenCalledWith(QualitySectionConfigurationComponent, null);
  });
});
