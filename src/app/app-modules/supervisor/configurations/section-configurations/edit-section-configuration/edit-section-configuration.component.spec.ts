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
import { AmritTrackingService } from 'Common-UI/src/tracking';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';

import { EditSectionConfigurationComponent } from './edit-section-configuration.component';
import { SectionConfigurationComponent } from '../section-configuration/section-configuration.component';

describe('EditSectionConfigurationComponent', () => {
  let component: EditSectionConfigurationComponent;
  let fixture: ComponentFixture<EditSectionConfigurationComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let tracking: jasmine.SpyObj<AmritTrackingService>;
  const lang = {
    doYouReallyWantToCancelUnsavedData: 'cancelUnsaved',
    updatedSectionConfigurationSuccessfully: 'updated',
  };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', ['updateSectionConfiguration', 'createComponent']);
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [EditSectionConfigurationComponent],
      providers: [
        FormBuilder,
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: SupervisorService, useValue: supervisor },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(EditSectionConfigurationComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(EditSectionConfigurationComponent);
    component = fixture.componentInstance;
    component.data = { sectionId: 7, sectionName: 'Pregnancy', sectionDesc: 'ANC questions' };
    fixture.detectChanges();
  });

  const form = (): any => component.editsectionconfigurationform;

  it('patches the selected section', () => {
    expect(form().value).toEqual({
      sectionId: 7 as any,
      sectionName: 'Pregnancy',
      sectionDescription: 'ANC questions',
    });
    expect(form().valid).toBeTrue();
    expect(component.currentLanguageSet).toBe(lang);
  });

  it('validates name and description', () => {
    form().controls.sectionName.setValue('  ');
    expect(form().controls.sectionName.hasError('whitespace')).toBeTrue();
    form().controls.sectionDescription.setValue('     ');
    expect(form().controls.sectionDescription.hasError('nonWhitespace')).toBeTrue();
  });

  it('updates the section and returns to the list', () => {
    supervisor.updateSectionConfiguration.and.returnValue(of({ ok: true }));
    form().controls.sectionName.setValue('Pregnancy care');
    component.updateSectionConfiguration();
    expect(supervisor.updateSectionConfiguration).toHaveBeenCalledWith({
      sectionId: 7,
      sectionName: 'Pregnancy care',
      sectionDesc: 'ANC questions',
      createdBy: 'sup1',
      psmId: 4,
      modifiedBy: 'sup1',
      deleted: false,
    });
    expect(confirmation.openDialog).toHaveBeenCalledWith('updated', 'success');
    expect(supervisor.createComponent).toHaveBeenCalledWith(SectionConfigurationComponent, null);
  });

  describe('goBack', () => {
    it('returns to the list after confirmation', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      component.goBack();
      expect(form().value.sectionName).toBeNull();
      expect(supervisor.createComponent).toHaveBeenCalledWith(SectionConfigurationComponent, null);
    });

    it('stays when declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.goBack();
      expect(supervisor.createComponent).not.toHaveBeenCalled();
    });
  });

  it('tracks field interactions', () => {
    component.trackFieldInteraction('sectionName');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('sectionName', 'Edit Section Configuration');
  });
});
