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

import { SectionQuestionnaireMappingComponent } from './section-questionnaire-mapping.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { CreateSectionQuestionnaireMappingComponent } from '../create-section-questionnaire-mapping/create-section-questionnaire-mapping.component';
import { EditSectionQuestionnaireMappingComponent } from '../edit-section-questionnaire-mapping/edit-section-questionnaire-mapping.component';

describe('SectionQuestionnaireMappingComponent', () => {
  let component: SectionQuestionnaireMappingComponent;
  let fixture: ComponentFixture<SectionQuestionnaireMappingComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const lang = {
    rankAlreadyExistsUnableToActivate: 'rankExists',
    areYouSureWantTo: 'Are you sure want to',
    successfully: 'successfully',
  };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };
  const MAPS = () => [
    { id: 1, questionid: 10, sectionid: 5, sectionName: 'Pregnancy', question: 'Any pain?', questionType: 'Yes/No', sectionQuestionRank: 1, role: 'Associate', deleted: false },
    { id: 2, questionid: 11, sectionid: 5, sectionName: 'Pregnancy', question: 'Notes', questionType: 'Text', sectionQuestionRank: 2, role: 'ANM', deleted: false },
    { id: 3, questionid: 12, sectionid: 5, sectionName: 'Pregnancy', question: 'Old', questionType: 'Text', sectionQuestionRank: 1, role: 'ANM', deleted: true },
  ];

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', [
      'getSectionQuestionnaireMap',
      'updateQuestionnaireSectionMapping',
      'createComponent',
    ]);
    supervisor.getSectionQuestionnaireMap.and.returnValue(of(MAPS()));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);

    await TestBed.configureTestingModule({
      declarations: [SectionQuestionnaireMappingComponent],
      providers: [
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: SupervisorService, useValue: supervisor },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(SectionQuestionnaireMappingComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(SectionQuestionnaireMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads and numbers the mappings', () => {
    expect(supervisor.getSectionQuestionnaireMap).toHaveBeenCalledWith(4);
    expect(component.dataSource.data.map((m: any) => m.sno)).toEqual([1, 2, 3]);
    expect(component.currentLanguageSet).toBe(lang);
  });

  it('shows load errors', () => {
    supervisor.getSectionQuestionnaireMap.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getSectionQuestionnairesMapDetails();
    supervisor.getSectionQuestionnaireMap.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
    component.getSectionQuestionnairesMapDetails();
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
  });

  it('opens the create and edit screens', () => {
    component.openCreateSectionQuestionnaireMap();
    expect(supervisor.createComponent).toHaveBeenCalledWith(CreateSectionQuestionnaireMappingComponent, {
      mapSectionQuestionnaireData: component.mapSectionQuestionnaireList,
    });
    const item = component.mapSectionQuestionnaireList[0];
    component.editQuestionnaireSectionMapping(item);
    expect(supervisor.createComponent).toHaveBeenCalledWith(EditSectionQuestionnaireMappingComponent, {
      selectedQuestionnaireSectionData: item,
      questionnaireSectionData: component.mapSectionQuestionnaireList,
    });
  });

  describe('activateDeactivateQuesSecMap', () => {
    it('refuses to activate when the rank is taken in the section', () => {
      component.activateDeactivateQuesSecMap(component.mapSectionQuestionnaireList[2], 'activate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('rankExists', 'error');
      expect(supervisor.updateQuestionnaireSectionMapping).not.toHaveBeenCalled();
    });

    it('deactivates after confirmation and reloads', () => {
      supervisor.updateQuestionnaireSectionMapping.and.returnValue(of({ response: 'ok' }));
      supervisor.getSectionQuestionnaireMap.calls.reset();
      const item = component.mapSectionQuestionnaireList[0];
      component.activateDeactivateQuesSecMap(item, 'deactivate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Are you sure want to Deactivate?', 'confirm');
      expect(supervisor.updateQuestionnaireSectionMapping).toHaveBeenCalledWith({
        id: 1,
        questionId: 10,
        sectionId: 5,
        rank: 1,
        role: 'Associate',
        createdBy: 'sup1',
        modifiedBy: 'sup1',
        deleted: true,
        psmId: 4,
      });
      expect(item.deleted).toBeTrue();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Deactivated successfully', 'success');
      expect(supervisor.getSectionQuestionnaireMap).toHaveBeenCalled();
    });

    it('activates a mapping with a free rank', () => {
      supervisor.updateQuestionnaireSectionMapping.and.returnValue(of({ response: 'ok' }));
      component.activateDeactivateQuesSecMap({ ...component.mapSectionQuestionnaireList[2], sectionQuestionRank: 9 }, 'activate');
      expect(supervisor.updateQuestionnaireSectionMapping.calls.mostRecent().args[0].deleted).toBeFalse();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Activated successfully', 'success');
    });

    it('shows update failures', () => {
      supervisor.updateQuestionnaireSectionMapping.and.returnValue(of({ errorMessage: 'nope' }));
      component.activateOrDeactivate(component.mapSectionQuestionnaireList[0], 'deactivate');
      supervisor.updateQuestionnaireSectionMapping.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.activateOrDeactivate(component.mapSectionQuestionnaireList[0], 'deactivate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('nope', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });

    it('does nothing when declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.activateOrDeactivate(component.mapSectionQuestionnaireList[0], 'deactivate');
      expect(supervisor.updateQuestionnaireSectionMapping).not.toHaveBeenCalled();
    });
  });

  describe('filterSearchTerm', () => {
    it('matches section, question, type or rank', () => {
      component.filterSearchTerm('notes');
      expect(component.dataSource.data.map((m: any) => m.id)).toEqual([2]);
      component.filterSearchTerm('yes/no');
      expect(component.dataSource.data.map((m: any) => m.id)).toEqual([1]);
      component.filterSearchTerm('pregnancy');
      expect(component.dataSource.data.length).toBe(3);
    });

    it('restores the list for an empty search', () => {
      component.filterSearchTerm('notes');
      component.filterSearchTerm();
      expect(component.dataSource.data.length).toBe(3);
    });
  });
});
