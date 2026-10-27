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
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { QuestionnaireConfigurationComponent } from './questionnaire-configuration.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { LoginserviceService } from 'src/app/app-modules/services/loginservice/loginservice.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { CreateQuestionnaireComponent } from '../create-questionnaire/create-questionnaire.component';

describe('QuestionnaireConfigurationComponent', () => {
  let component: QuestionnaireConfigurationComponent;
  let fixture: ComponentFixture<QuestionnaireConfigurationComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let tracking: jasmine.SpyObj<AmritTrackingService>;
  const lang = {
    rankAlreadyExistsUnableToActivate: 'rankExists',
    questionnaireSectionMapAlreadyExistDeactivate: 'mapExists',
    areYouSureWantTo: 'Are you sure want to',
    successfully: 'successfully',
  };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };
  const QUESTIONS = () => [
    { questionnaireId: 1, questionRank: 1, questionnaireType: 'Yes/No', questionnaire: 'Any pain?', deleted: false },
    { questionnaireId: 2, questionRank: 2, questionnaireType: 'Text', questionnaire: 'Notes', deleted: false },
    { questionnaireId: 3, questionRank: 1, questionnaireType: 'Yes/No', questionnaire: 'Old pain', deleted: true },
  ];

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', [
      'getSectionQuestionnaireMap',
      'getQuestionnaires',
      'updateQuestionnaire',
      'createComponent',
    ]);
    supervisor.getQuestionnaires.and.returnValue(of(QUESTIONS()));
    supervisor.getSectionQuestionnaireMap.and.returnValue(of([{ questionid: 2, deleted: false }]));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [QuestionnaireConfigurationComponent],
      providers: [
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: Router, useValue: {} },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SupervisorService, useValue: supervisor },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: LoginserviceService, useValue: {} },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(QuestionnaireConfigurationComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(QuestionnaireConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads numbered questionnaires and section mappings', () => {
    expect(supervisor.getQuestionnaires).toHaveBeenCalledWith(4);
    expect(supervisor.getSectionQuestionnaireMap).toHaveBeenCalledWith(4);
    expect(component.dataSource.data.map((q: any) => q.sno)).toEqual([1, 2, 3]);
    expect(component.mapSectionQuestionnaireList.length).toBe(1);
  });

  it('shows load errors', () => {
    supervisor.getQuestionnaires.and.returnValue(throwError(() => ({ error: 'q down' })));
    supervisor.getSectionQuestionnaireMap.and.returnValue(throwError(() => ({ title: 'm', detail: ' down' })));
    component.ngOnInit();
    expect(confirmation.openDialog).toHaveBeenCalledWith('q down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('m down', 'error');
  });

  it('opens the create and edit screens with the full list', () => {
    component.openCreateQuestionnaire();
    expect(supervisor.createComponent).toHaveBeenCalledWith(CreateQuestionnaireComponent, {
      questionnaireData: component.questionnaireList,
      isEdit: false,
    });
    const q = component.questionnaireList[0];
    component.editQuestionnaire(q);
    expect(supervisor.createComponent).toHaveBeenCalledWith(CreateQuestionnaireComponent, {
      selectedQuestionnaireData: q,
      questionnaireData: component.questionnaireList,
      isEdit: true,
    });
  });

  describe('activateDeactivateQuestionnaire', () => {
    it('refuses to activate a question whose rank is taken', () => {
      component.activateDeactivateQuestionnaire(component.questionnaireList[2], 'activate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('rankExists', 'error');
      expect(supervisor.updateQuestionnaire).not.toHaveBeenCalled();
    });

    it('refuses to deactivate a question mapped to a section', () => {
      component.activateDeactivateQuestionnaire(component.questionnaireList[1], 'deactivate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('mapExists', 'error');
      expect(supervisor.updateQuestionnaire).not.toHaveBeenCalled();
    });

    it('deactivates after confirmation and reloads', () => {
      supervisor.updateQuestionnaire.and.returnValue(of({ response: 'ok' }));
      supervisor.getQuestionnaires.calls.reset();
      component.searchTerm = 'pain';
      component.activateDeactivateQuestionnaire(component.questionnaireList[0], 'deactivate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Are you sure want to Deactivate?', 'confirm');
      expect(supervisor.updateQuestionnaire).toHaveBeenCalledWith(
        jasmine.objectContaining({ questionnaireId: 1, deleted: 'true', createdBy: 'sup1', modifiedBy: 'sup1', psmId: 4 }),
      );
      expect(confirmation.openDialog).toHaveBeenCalledWith('Deactivated successfully', 'success');
      expect(component.searchTerm).toBeNull();
      expect(supervisor.getQuestionnaires).toHaveBeenCalled();
    });

    it('activates a question with a free rank', () => {
      supervisor.updateQuestionnaire.and.returnValue(of({ response: 'ok' }));
      component.activateDeactivateQuestionnaire({ ...component.questionnaireList[1], questionRank: 9 }, 'activate');
      expect(supervisor.updateQuestionnaire.calls.mostRecent().args[0].deleted).toBe('false');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Activated successfully', 'success');
    });

    it('shows update failures', () => {
      supervisor.updateQuestionnaire.and.returnValue(of({ errorMessage: 'nope' }));
      component.activateDeactivateQuestionnaire(component.questionnaireList[0], 'deactivate');
      supervisor.updateQuestionnaire.and.returnValue(throwError(() => ({ error: 'down' })));
      component.activateDeactivateQuestionnaire(component.questionnaireList[0], 'deactivate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('nope', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    });

    it('does nothing when the confirmation is declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.activateDeactivateQuestionnaire(component.questionnaireList[0], 'deactivate');
      expect(supervisor.updateQuestionnaire).not.toHaveBeenCalled();
    });
  });

  it('checkSectionQuestionMapExist is false without mappings', () => {
    component.mapSectionQuestionnaireList = null;
    expect(component.checkSectionQuestionMapExist({ questionnaireId: 2 })).toBeFalse();
  });

  describe('filterSearchTerm', () => {
    it('matches rank, type or question text', () => {
      component.filterSearchTerm('text');
      expect(component.dataSource.data.map((q: any) => q.questionnaireId)).toEqual([2]);
      component.filterSearchTerm('pain');
      expect(component.dataSource.data.map((q: any) => q.questionnaireId)).toEqual([1, 3]);
      component.filterSearchTerm('2');
      expect(component.dataSource.data.map((q: any) => q.questionnaireId)).toEqual([2]);
    });

    it('restores the full list for an empty search', () => {
      component.filterSearchTerm('text');
      component.filterSearchTerm('');
      expect(component.dataSource.data.length).toBe(3);
    });
  });

  it('tracks field interactions', () => {
    component.trackFieldInteraction('search');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('search', 'Questionnaire Configuration');
  });
});
