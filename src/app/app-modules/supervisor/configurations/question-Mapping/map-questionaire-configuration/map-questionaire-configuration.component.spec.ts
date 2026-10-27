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
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { MapQuestionaireConfigurationComponent } from './map-questionaire-configuration.component';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { CreateQuestionMappingComponent } from '../create-question-mapping/create-question-mapping.component';
import { EditQuestionMappingComponent } from '../edit-question-mapping/edit-question-mapping.component';

describe('MapQuestionaireConfigurationComponent', () => {
  let component: MapQuestionaireConfigurationComponent;
  let fixture: ComponentFixture<MapQuestionaireConfigurationComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let tracking: jasmine.SpyObj<AmritTrackingService>;
  const lang = {
    areYouSureYouWouldLike: 'Are you sure you would like to',
    thisConfiguration: 'this configuration?',
    successfully: 'Successfully',
    adQuestion: 'd question',
  };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };
  const MAPPINGS = () => [
    { id: 1, parentQuestionId: 10, childQuestionId: 20, parentQuestion: 'Pregnant?', answer: 'Yes', childQuestion: 'Weeks?', deleted: false },
    { id: 2, parentQuestionId: 10, childQuestionId: 20, parentQuestion: 'Pregnant?', answer: 'No', childQuestion: 'Weeks?', deleted: true },
    { id: 3, parentQuestionId: 11, childQuestionId: 21, parentQuestion: 'Fever?', answer: 'Yes', childQuestion: 'Days?', deleted: true },
  ];

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', ['getMappedQuestions', 'updateParentChildMapping', 'createComponent']);
    supervisor.getMappedQuestions.and.returnValue(of(MAPPINGS()));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [MapQuestionaireConfigurationComponent],
      providers: [
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: SupervisorService, useValue: supervisor },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(MapQuestionaireConfigurationComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(MapQuestionaireConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads and numbers mapped questions', () => {
    expect(supervisor.getMappedQuestions).toHaveBeenCalledWith({ providerServiceMapID: 4 });
    expect(component.dataSource.data.map((m: any) => m.sno)).toEqual([1, 2, 3]);
  });

  it('shows load errors', () => {
    supervisor.getMappedQuestions.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getMappedQuestionaireList();
    supervisor.getMappedQuestions.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
    component.getMappedQuestionaireList();
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
  });

  it('opens the create and edit screens', () => {
    component.openCreateQuestionnaireMapping();
    expect(supervisor.createComponent).toHaveBeenCalledWith(CreateQuestionMappingComponent, {
      questionaireMapedData: component.mappedQuestionaireList,
      isEdit: false,
    });
    const item = component.mappedQuestionaireList[0];
    component.editQuestionMapping(item);
    expect(supervisor.createComponent).toHaveBeenCalledWith(EditQuestionMappingComponent, {
      selectedMappedQuestion: item,
      mappedQuestionListData: component.mappedQuestionaireList,
      isEdit: true,
    });
  });

  describe('filterSearchTerm', () => {
    it('matches parent, child or answer', () => {
      component.filterSearchTerm('fever');
      expect(component.dataSource.data.map((m: any) => m.id)).toEqual([3]);
      component.filterSearchTerm('no');
      expect(component.dataSource.data.map((m: any) => m.id)).toEqual([2]);
      component.filterSearchTerm('');
      expect(component.dataSource.data.length).toBe(3);
    });
  });

  describe('activateDeactivateQuestionnaire', () => {
    it('refuses to activate a duplicate of an active mapping', () => {
      component.activateDeactivateQuestionnaire(component.mappedQuestionaireList[1], 'activate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Parent Child Mapping Already exist', 'error');
      expect(supervisor.updateParentChildMapping).not.toHaveBeenCalled();
    });

    it('activates a mapping without an active duplicate', () => {
      supervisor.updateParentChildMapping.and.returnValue(of({ ok: true }));
      supervisor.getMappedQuestions.calls.reset();
      component.activateDeactivateQuestionnaire(component.mappedQuestionaireList[2], 'activate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Are you sure you would like to activate this configuration?', 'info');
      expect(supervisor.updateParentChildMapping).toHaveBeenCalledWith({
        id: 3,
        parentQuestionId: 11,
        answer: 'Yes',
        childQuestionId: 21,
        createdBy: 'sup1',
        psmId: 4,
        deleted: false,
        modifiedBy: 'sup1',
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('Successfully activated question', 'success');
      expect(supervisor.getMappedQuestions).toHaveBeenCalled();
    });

    it('deactivates with deleted true', () => {
      supervisor.updateParentChildMapping.and.returnValue(of({ ok: true }));
      component.activateDeactivateQuestionnaire(component.mappedQuestionaireList[0], 'deactivate');
      expect(supervisor.updateParentChildMapping.calls.mostRecent().args[0].deleted).toBeTrue();
    });

    it('does nothing when declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.activateDeactivateQuestionnaire(component.mappedQuestionaireList[0], 'deactivate');
      expect(supervisor.updateParentChildMapping).not.toHaveBeenCalled();
    });
  });

  it('tracks field interactions', () => {
    component.trackFieldInteraction('search');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('search', 'Map Questionnaire Configuration');
  });
});
