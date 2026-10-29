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
import { FormControl } from '@angular/forms';

import { CreateSectionConfigurationComponent } from './create-section-configuration.component';
import { SectionConfigurationComponent } from '../section-configuration/section-configuration.component';

describe('CreateSectionConfigurationComponent', () => {
  let component: CreateSectionConfigurationComponent;
  let fixture: ComponentFixture<CreateSectionConfigurationComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let tracking: jasmine.SpyObj<AmritTrackingService>;
  const lang = {
    doYouReallyWantToCancelUnsavedData: 'cancelUnsaved',
    sectionConfigurationCreatedSuccessfully: 'created',
  };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', ['createSectionConfiguration', 'createComponent']);
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [CreateSectionConfigurationComponent],
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
      .overrideTemplate(CreateSectionConfigurationComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(CreateSectionConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const form = (): any => component.sectionconfigurationform;

  describe('validation', () => {
    it('requires a non-blank section name of 2-300 characters', () => {
      form().setValue({ sectionName: '', sectionDesc: '' });
      expect(form().controls.sectionName.hasError('required')).toBeTrue();
      form().controls.sectionName.setValue('   ');
      expect(form().controls.sectionName.hasError('whitespace')).toBeTrue();
      form().controls.sectionName.setValue('A');
      expect(form().controls.sectionName.hasError('minlength')).toBeTrue();
      form().controls.sectionName.setValue('Pregnancy');
      expect(form().valid).toBeTrue();
    });

    it('description is optional but must be 5+ characters and not blank', () => {
      form().setValue({ sectionName: 'Pregnancy', sectionDesc: 'abc' });
      expect(form().controls.sectionDesc.hasError('minlength')).toBeTrue();
      form().controls.sectionDesc.setValue('      ');
      expect(form().controls.sectionDesc.hasError('nonWhitespace')).toBeTrue();
      form().controls.sectionDesc.setValue('About pregnancy');
      expect(form().valid).toBeTrue();
    });

    it('whitespace validator ignores null', () => {
      expect(component.validateWhitespace(new FormControl(null))).toBeUndefined();
    });
  });

  it('adds and removes sections in the pending table', () => {
    component.addSections({ sectionName: 'A1', sectionDesc: 'first' });
    component.addSections({ sectionName: 'B2', sectionDesc: 'second' });
    expect(component.addSection.data.length).toBe(2);
    expect(form().value.sectionName).toBeNull();
    component.removeSection(0);
    expect(component.addSection.data).toEqual([{ sectionName: 'B2', sectionDesc: 'second' }] as any);
  });

  describe('createSectionConfiguration', () => {
    beforeEach(() => component.addSections({ sectionName: 'A1', sectionDesc: 'first' }));

    it('saves every pending section with audit fields', () => {
      supervisor.createSectionConfiguration.and.returnValue(of({ ok: true }));
      component.createSectionConfiguration();
      expect(supervisor.createSectionConfiguration).toHaveBeenCalledWith([
        { sectionName: 'A1', sectionDesc: 'first', createdBy: 'sup1', psmId: 4 },
      ] as any);
      expect(confirmation.openDialog).toHaveBeenCalledWith('created', 'success');
      expect(supervisor.createComponent).toHaveBeenCalledWith(SectionConfigurationComponent, null);
    });

    it('shows errors from the response or the request', () => {
      supervisor.createSectionConfiguration.and.returnValue(throwError(() => ({ error: 'dup' })));
      component.createSectionConfiguration();
      expect(confirmation.openDialog).toHaveBeenCalledWith('dup', 'error');
      supervisor.createSectionConfiguration.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.createSectionConfiguration();
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });
  });

  describe('goBack', () => {
    it('returns to the list after confirmation', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      component.goBack();
      expect(confirmation.openDialog).toHaveBeenCalledWith('cancelUnsaved', 'confirm');
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
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('sectionName', 'Create Section Configuration');
  });
});
