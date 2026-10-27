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

import { QaQuestionConfigComponent } from './qa-question-config.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { CreateQaQuestionConfigComponent } from '../../create-qa-question-config/create-qa-question-config/create-qa-question-config.component';
import { EditQaConfigComponent } from '../../edit-qa-question-config/edit-qa-config/edit-qa-config.component';

describe('QaQuestionConfigComponent', () => {
  let component: QaQuestionConfigComponent;
  let fixture: ComponentFixture<QaQuestionConfigComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const lang = {
    pleaseActivateTheDeactivatedSection: 'sectionInactive',
    rankAlreadyExistsUnableToActivate: 'rankExists',
    cannotDeactivateSectionAlreadyMappped: 'sectionMapped',
    areYouSureWantTo: 'Are you sure want to',
    successfully: 'successfully',
  };
  const session: any = { providerServiceMapID: 4, userName: 'qs1' };
  const QUESTIONS = () => [
    { questionId: 1, question: 'Greeted caller?', questionRank: 1, sectionId: 10, sectionName: 'Greeting', answerType: 'Radio', options: ['Yes'], scores: [1], roles: ['Associate'], deleted: false },
    { questionId: 2, question: 'Closed call?', questionRank: 1, sectionId: 11, sectionName: 'Closing', deleted: true },
    { questionId: 3, question: 'Old greeting', questionRank: 1, sectionId: 10, sectionName: 'Greeting', deleted: true },
    { questionId: 4, question: 'Retired', questionRank: 5, sectionId: 12, sectionName: 'Old', deleted: true },
  ];

  beforeEach(async () => {
    qs = jasmine.createSpyObj('QualitySupervisorService', [
      'getQuestionnaireData', 'getAuditSectionMap', 'updateQuestionConfiguration', 'createComponent',
    ]);
    qs.getQuestionnaireData.and.returnValue(of(QUESTIONS()));
    qs.getAuditSectionMap.and.returnValue(
      of([{ sectionId: 10, deleted: false }, { sectionId: 11, deleted: false }, { sectionId: 12, deleted: true }]),
    );
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    await TestBed.configureTestingModule({
      declarations: [QaQuestionConfigComponent],
      providers: [
        { provide: QualitySupervisorService, useValue: qs },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(QaQuestionConfigComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(QaQuestionConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const q = (id: number) => component.qaQuestionnaireConfigList.find((x) => x.questionId === id);

  it('loads questions and sections', () => {
    expect(qs.getQuestionnaireData).toHaveBeenCalledWith(4);
    expect(qs.getAuditSectionMap).toHaveBeenCalledWith(4);
    expect(component.dataSource.data.length).toBe(4);
    expect(component.sectionList.length).toBe(3);
  });

  it('shows load errors and empty section lists', () => {
    qs.getQuestionnaireData.and.returnValue(throwError(() => ({ error: 'down' })));
    qs.getAuditSectionMap.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
    component.ngOnInit();
    qs.getAuditSectionMap.and.returnValue(of([]));
    component.getSections();
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith(undefined as any, 'error');
  });

  it('opens the create and edit screens', () => {
    component.createNewQuestionnaireConfig();
    expect(qs.createComponent).toHaveBeenCalledWith(CreateQaQuestionConfigComponent, {
      qaQuestionnaireData: component.qaQuestionnaireConfigList,
      isEdit: false,
    });
    component.editQAQuestionnarieConfig(q(1));
    expect(qs.createComponent).toHaveBeenCalledWith(EditQaConfigComponent, q(1));
  });

  describe('activateDeactivateQuestionConfig', () => {
    it('refuses to activate a question in a deactivated section', () => {
      component.activateDeactivateQuestionConfig(q(4), 'activate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('sectionInactive', 'error');
    });

    it('refuses to activate when the rank is taken in the section', () => {
      component.activateDeactivateQuestionConfig(q(3), 'activate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('rankExists', 'error');
      expect(qs.updateQuestionConfiguration).not.toHaveBeenCalled();
    });

    it('deactivates after confirmation and reloads', () => {
      qs.updateQuestionConfiguration.and.returnValue(of({ response: 'ok' }));
      qs.getQuestionnaireData.calls.reset();
      component.activateDeactivateQuestionConfig(q(1), 'deactivate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Are you sure want to deactivate?', 'confirm');
      expect(qs.updateQuestionConfiguration).toHaveBeenCalledWith({
        id: 1,
        options: ['Yes'],
        scores: [1],
        sectionId: 10,
        sectionName: 'Greeting',
        questionId: 1,
        questionnaire: 'Greeted caller?',
        questionRank: 1,
        answerType: 'Radio',
        roles: ['Associate'],
        createdBy: 'qs1',
        psmId: 4,
        deleted: true,
        modifiedBy: 'qs1',
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('Deactivated successfully', 'success');
      expect(qs.getQuestionnaireData).toHaveBeenCalled();
    });

    it('activates a free rank in an active section', () => {
      qs.updateQuestionConfiguration.and.returnValue(of({ response: 'ok' }));
      component.activateDeactivateQuestionConfig(q(2), 'activate');
      expect(qs.updateQuestionConfiguration.calls.mostRecent().args[0].deleted).toBeFalse();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Activated successfully', 'success');
    });

    it('stops when the section is still mapped', () => {
      (component as any).mappedSectionQuestionaire = [{ sectionName: 'Greeting', deleted: false }];
      component.activateOrDeactivate(q(1), 'deactivate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('sectionMapped', 'error');
      expect(qs.updateQuestionConfiguration).not.toHaveBeenCalled();
    });

    it('shows update failures', () => {
      qs.updateQuestionConfiguration.and.returnValue(of({ errorMessage: 'nope' }));
      component.activateOrDeactivate(q(1), 'deactivate');
      qs.updateQuestionConfiguration.and.returnValue(throwError(() => ({ error: 'down' })));
      component.activateOrDeactivate(q(1), 'deactivate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('nope', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    });

    it('does nothing when declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.activateOrDeactivate(q(1), 'deactivate');
      expect(qs.updateQuestionConfiguration).not.toHaveBeenCalled();
    });
  });

  it('filterSearchTerm matches question, rank or section', () => {
    component.filterSearchTerm('closed');
    expect(component.dataSource.data.map((x: any) => x.questionId)).toEqual([2]);
    component.filterSearchTerm('greeting');
    expect(component.dataSource.data.map((x: any) => x.questionId)).toEqual([1, 3]);
    component.filterSearchTerm('');
    expect(component.dataSource.data.length).toBe(4);
  });
});
