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

import { QualitySectionConfigurationComponent } from './quality-section-configuration.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { CreatequalitySectionConfigurationComponent } from '../createquality-section-configuration/createquality-section-configuration.component';
import { EditQualitySectionConfigurationComponent } from '../edit-quality-section-configuration/edit-quality-section-configuration.component';

describe('QualitySectionConfigurationComponent', () => {
  let component: QualitySectionConfigurationComponent;
  let fixture: ComponentFixture<QualitySectionConfigurationComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const lang = {
    rankAlreadyExistsUnableToActivate: 'rankExists',
    cannotDeactivateSectionQusestionaire: 'sectionMapped',
    areYouSureWantTo: 'Are you sure want to',
    successfully: 'successfully',
  };
  const session: any = { providerServiceMapID: 4, userName: 'qs1' };
  const SECTIONS = () => [
    { sectionId: 1, sectionName: 'Greeting', sectionDesc: 'Opening', rank: 1, deleted: false },
    { sectionId: 2, sectionName: 'Closing', sectionDesc: 'Ending', rank: 2, deleted: false },
    { sectionId: 3, sectionName: 'Old', sectionDesc: 'Retired', rank: 1, deleted: true },
    { sectionId: 4, sectionName: 'Spare', sectionDesc: 'Unused', rank: 9, deleted: true },
  ];

  beforeEach(async () => {
    qs = jasmine.createSpyObj('QualitySupervisorService', [
      'getAuditSectionMap', 'getListOfMapQuestionaireConfiguration', 'updateSectionConfiguration', 'createComponent',
    ]);
    qs.getAuditSectionMap.and.returnValue(of(SECTIONS()));
    qs.getListOfMapQuestionaireConfiguration.and.returnValue(of([{ sectionId: 1, deleted: false }]));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);

    await TestBed.configureTestingModule({
      declarations: [QualitySectionConfigurationComponent],
      providers: [
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: QualitySupervisorService, useValue: qs },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(QualitySectionConfigurationComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(QualitySectionConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads numbered sections and question mappings', () => {
    expect(qs.getAuditSectionMap).toHaveBeenCalledWith(4);
    expect(qs.getListOfMapQuestionaireConfiguration).toHaveBeenCalledWith(4);
    expect(component.dataSource.data.map((s: any) => s.sno)).toEqual([1, 2, 3, 4]);
    expect(component.mappedSectionQuestionaire.length).toBe(1);
  });

  it('shows load errors', () => {
    qs.getAuditSectionMap.and.returnValue(throwError(() => ({ error: 'down' })));
    qs.getListOfMapQuestionaireConfiguration.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
    component.ngOnInit();
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
  });

  it('opens the create and edit screens', () => {
    component.openCreateAuditSection();
    expect(qs.createComponent).toHaveBeenCalledWith(CreatequalitySectionConfigurationComponent, {
      qualityAuditSectionData: component.qualityAuditSectionList,
    });
    const item = component.qualityAuditSectionList[0];
    component.editAuditSection(item);
    expect(qs.createComponent).toHaveBeenCalledWith(EditQualitySectionConfigurationComponent, {
      selectedAuditSectionData: item,
      qualityAuditSectionData: component.qualityAuditSectionList,
      isEdit: true,
    });
  });

  describe('activateDeactivateQuesSecMap', () => {
    it('refuses to activate when the rank is used by an active section', () => {
      component.activateDeactivateQuesSecMap(component.qualityAuditSectionList[2], 'activate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('rankExists', 'error');
      expect(qs.updateSectionConfiguration).not.toHaveBeenCalled();
    });

    it('refuses to deactivate a section with mapped questions', () => {
      component.activateDeactivateQuesSecMap(component.qualityAuditSectionList[0], 'deactivate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('sectionMapped', 'error');
      expect(qs.updateSectionConfiguration).not.toHaveBeenCalled();
    });

    it('deactivates an unmapped section and reloads', () => {
      qs.updateSectionConfiguration.and.returnValue(of({ response: 'ok' }));
      qs.getAuditSectionMap.calls.reset();
      component.activateDeactivateQuesSecMap(component.qualityAuditSectionList[1], 'deactivate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Are you sure want to deactivate?', 'confirm');
      expect(qs.updateSectionConfiguration).toHaveBeenCalledWith({
        sectionId: 2,
        sectionName: 'Closing',
        sectionDesc: 'Ending',
        rank: 2,
        createdBy: 'qs1',
        psmId: 4,
        deleted: true,
        modifiedBy: 'qs1',
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('Deactivated successfully', 'success');
      expect(qs.getAuditSectionMap).toHaveBeenCalled();
    });

    it('activates a section with a free rank', () => {
      qs.updateSectionConfiguration.and.returnValue(of({ response: 'ok' }));
      component.activateDeactivateQuesSecMap(component.qualityAuditSectionList[3], 'activate');
      expect(qs.updateSectionConfiguration.calls.mostRecent().args[0].deleted).toBeFalse();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Activated successfully', 'success');
    });

    it('shows update failures', () => {
      qs.updateSectionConfiguration.and.returnValue(of({ errorMessage: 'nope' }));
      component.activateOrDeactivate(component.qualityAuditSectionList[1], 'deactivate');
      qs.updateSectionConfiguration.and.returnValue(throwError(() => ({ error: 'down' })));
      component.activateOrDeactivate(component.qualityAuditSectionList[1], 'deactivate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('nope', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    });

    it('does nothing when declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.activateOrDeactivate(component.qualityAuditSectionList[1], 'deactivate');
      expect(qs.updateSectionConfiguration).not.toHaveBeenCalled();
    });
  });

  it('checkDuplicateRank matches any section with the rank', () => {
    expect(component.checkDuplicateRank({ rank: 9 })).toBeTrue();
    expect(component.checkDuplicateRank({ rank: 5 })).toBeFalse();
  });

  describe('filterSearchTerm', () => {
    it('matches name or rank', () => {
      component.filterSearchTerm('clos');
      expect(component.dataSource.data.map((s: any) => s.sectionId)).toEqual([2]);
      component.filterSearchTerm('9');
      expect(component.dataSource.data.map((s: any) => s.sectionId)).toEqual([4]);
    });

    it('restores the list for an empty search', () => {
      component.filterSearchTerm('clos');
      component.filterSearchTerm('');
      expect(component.dataSource.data.length).toBe(4);
    });
  });
});
