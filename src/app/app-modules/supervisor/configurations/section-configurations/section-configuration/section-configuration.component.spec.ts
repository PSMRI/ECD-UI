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

import { SectionConfigurationComponent } from './section-configuration.component';
import { CreateSectionConfigurationComponent } from '../create-section-configuration/create-section-configuration.component';
import { EditSectionConfigurationComponent } from '../edit-section-configuration/edit-section-configuration.component';

describe('SectionConfigurationComponent', () => {
  let component: SectionConfigurationComponent;
  let fixture: ComponentFixture<SectionConfigurationComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let tracking: jasmine.SpyObj<AmritTrackingService>;
  const lang = {
    areYouSureYouWouldLike: 'Are you sure you would like to',
    thisConfiguration: 'this configuration?',
    successfully: 'Successfully',
    dSection: 'd section',
    thisSectionMapAlreadyExistPleaseDeactivate: 'mappingExists',
  };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };
  const SECTIONS = [
    { sectionId: 1, sectionName: 'Pregnancy', sectionDesc: 'ANC questions' },
    { sectionId: 2, sectionName: 'Child Health', sectionDesc: 'Child questions' },
  ];

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', [
      'getSectionConfigurations',
      'getMappedSections',
      'updateSectionConfiguration',
      'createComponent',
    ]);
    supervisor.getSectionConfigurations.and.returnValue(of(SECTIONS.map((s) => ({ ...s }))));
    supervisor.getMappedSections.and.returnValue(
      of([{ sectionId: 1, deleted: false, isChecked: true }]),
    );
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [SectionConfigurationComponent],
      providers: [
        { provide: SupervisorService, useValue: supervisor },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(SectionConfigurationComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(SectionConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads and numbers the sections and the mapped sections', () => {
    expect(supervisor.getSectionConfigurations).toHaveBeenCalledWith(4);
    expect(supervisor.getMappedSections).toHaveBeenCalledWith(4, 0);
    expect(component.sectionsData.data.map((s: any) => s.sno)).toEqual([1, 2]);
    expect(component.mappedSectionsData.length).toBe(1);
    expect(component.currentLanguageSet).toBe(lang);
  });

  it('alerts when there are no sections', () => {
    supervisor.getSectionConfigurations.and.returnValue(of([]));
    component.getSectionConfigurations();
    expect(confirmation.openDialog).toHaveBeenCalledWith(undefined as any, 'error');
  });

  it('opens the create and edit screens', () => {
    component.createSectionConfiguration();
    expect(supervisor.createComponent).toHaveBeenCalledWith(CreateSectionConfigurationComponent, null);
    component.editSessionConfiguration(SECTIONS[0]);
    expect(supervisor.createComponent).toHaveBeenCalledWith(EditSectionConfigurationComponent, SECTIONS[0]);
  });

  describe('checkIfMappingsExist', () => {
    it('is true only when deactivating a mapped section', () => {
      expect(component.checkIfMappingsExist(SECTIONS[0], 'deactivate')).toBeTrue();
      expect(component.checkIfMappingsExist(SECTIONS[1], 'deactivate')).toBeFalse();
      expect(component.checkIfMappingsExist(SECTIONS[0], 'activate')).toBeFalse();
    });
  });

  describe('activateDeactivateConfig', () => {
    it('warns instead of deactivating a mapped section', () => {
      component.activateDeactivateConfig(SECTIONS[0], 'deactivate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('mappingExists', 'warn');
      expect(supervisor.updateSectionConfiguration).not.toHaveBeenCalled();
    });

    it('deactivates after confirmation and reloads', () => {
      supervisor.updateSectionConfiguration.and.returnValue(of({ ok: true }));
      supervisor.getSectionConfigurations.calls.reset();
      component.activateDeactivateConfig(SECTIONS[1], 'deactivate');
      expect(confirmation.openDialog).toHaveBeenCalledWith(
        'Are you sure you would like to deactivate this configuration?',
        'info',
      );
      expect(supervisor.updateSectionConfiguration).toHaveBeenCalledWith({
        sectionId: 2,
        sectionName: 'Child Health',
        sectionDesc: 'Child questions',
        createdBy: 'sup1',
        psmId: 4,
        deleted: true,
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('Successfully deactivated section', 'success');
      expect(supervisor.getSectionConfigurations).toHaveBeenCalled();
    });

    it('activates with deleted false', () => {
      supervisor.updateSectionConfiguration.and.returnValue(of({ ok: true }));
      component.activateDeactivateConfig(SECTIONS[0], 'activate');
      expect(supervisor.updateSectionConfiguration.calls.mostRecent().args[0].deleted).toBeFalse();
    });

    it('does nothing when the confirmation is declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.activateDeactivateConfig(SECTIONS[1], 'deactivate');
      expect(supervisor.updateSectionConfiguration).not.toHaveBeenCalled();
    });
  });

  describe('filterSearchTerm', () => {
    it('filters by section name case-insensitively', () => {
      component.filterSearchTerm('child');
      expect(component.sectionsData.data.map((s: any) => s.sectionId)).toEqual([2]);
    });

    it('restores the full list for an empty search', () => {
      component.filterSearchTerm('child');
      component.filterSearchTerm('');
      expect(component.sectionsData.data.length).toBe(2);
    });
  });

  it('tracks field interactions', () => {
    component.trackFieldInteraction('search');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('search', 'Section Configuration');
  });
});
