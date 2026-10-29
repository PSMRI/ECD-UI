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

import { CreateQuestionMappingComponent } from './create-question-mapping.component';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { MapQuestionaireConfigurationComponent } from '../map-questionaire-configuration/map-questionaire-configuration.component';

describe('CreateQuestionMappingComponent', () => {
  let component: CreateQuestionMappingComponent;
  let fixture: ComponentFixture<CreateQuestionMappingComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };
  const QUESTIONS = [
    { questionnaireId: 10, questionnaire: 'Are you pregnant?', questionnaireType: 'Question', answerType: 'Radio', options: ['Yes', 'No'] },
    { questionnaireId: 11, questionnaire: 'Any fever?', questionnaireType: 'Question', answerType: 'Dropdown', options: ['Yes', 'No'] },
    { questionnaireId: 20, questionnaire: 'How many weeks?', questionnaireType: 'Question', answerType: 'Text' },
    { questionnaireId: 21, questionnaire: 'Information', questionnaireType: 'Info', answerType: 'Radio' },
  ];

  async function setup(data: any = { isEdit: false, questionaireMapedData: [] }) {
    supervisor = jasmine.createSpyObj('SupervisorService', ['getQuestionnairesForMapping', 'createParentChildMapping', 'createComponent']);
    supervisor.getQuestionnairesForMapping.and.returnValue(of(QUESTIONS));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);

    await TestBed.configureTestingModule({
      declarations: [CreateQuestionMappingComponent],
      providers: [
        FormBuilder,
        { provide: SetLanguageService, useValue: { languageData: {} } },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SupervisorService, useValue: supervisor },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CreateQuestionMappingComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(CreateQuestionMappingComponent);
    component = fixture.componentInstance;
    component.data = data;
    fixture.detectChanges();
  }

  const pick = (questionnaireId: number, type: string) =>
    component.onChange({ option: { value: { questionnaireId } } }, type);

  it('offers question-type parents with choice answers', async () => {
    await setup();
    expect(supervisor.getQuestionnairesForMapping).toHaveBeenCalledWith(4);
    expect(component.parentQuestionaireList.map((q: any) => q.questionnaireId)).toEqual([10, 11]);
    expect(component.enableEdit).toBeFalse();
  });

  it('keeps only active existing mappings and edit mode', async () => {
    await setup({
      isEdit: true,
      questionaireMapedData: [
        { parentQuestionId: 10, childQuestionId: 20, deleted: false },
        { parentQuestionId: 11, childQuestionId: 20, deleted: true },
      ],
    });
    expect(component.enableEdit).toBeTrue();
    expect(component.mappedId).toEqual([{ parentQuestionId: 10, childQuestionId: 20, deleted: false }]);
  });

  it('shows questionnaire load errors', async () => {
    await setup();
    supervisor.getQuestionnairesForMapping.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getQuestionnaires();
    supervisor.getQuestionnairesForMapping.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
    component.getQuestionnaires();
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
  });

  describe('selection', () => {
    it('choosing a parent loads its answers and possible children', async () => {
      await setup();
      pick(10, 'parent');
      expect(component.selectedParentId).toBe(10);
      expect(component.parentAnswersList).toEqual(['Yes', 'No']);
      expect(component.childQuestionaireList.map((q: any) => q.questionnaireId)).toEqual([11, 20, 21]);
      expect(component.createQuestionaireMappingForm.value.parentQuestion).toBe('Are you pregnant?');
    });

    it('excludes children already mapped to the chosen parent', async () => {
      await setup({ questionaireMapedData: [{ parentQuestionId: 10, childQuestionId: 20, deleted: false }] });
      pick(10, 'parent');
      expect(component.childQuestionaireList.map((q: any) => q.questionnaireId)).toEqual([11, 21]);
    });

    it('choosing a child stores its id and text', async () => {
      await setup();
      pick(10, 'parent');
      pick(20, 'child');
      expect(component.selectedChildId).toBe(20);
      expect(component.createQuestionaireMappingForm.value.childQuestion).toBe('How many weeks?');
    });

    it('typing invalidates the selections', async () => {
      await setup();
      pick(10, 'parent');
      pick(20, 'child');
      component.checkValidParentQuestion();
      component.checkValidChildQuestionQuestion();
      expect(component.selectedParentId).toBeNull();
      expect(component.selectedChildId).toBeNull();
    });
  });

  describe('autocomplete filters', () => {
    beforeEach(() => setup());

    it('filters parent questions by the given text', () => {
      let result: any;
      component.filterQuestionsList('fever');
      component.filteredOptions.subscribe((r: any) => (result = r));
      expect(result.map((q: any) => q.questionnaireId)).toEqual([11]);
    });

    it('filters child questions and returns all for null', () => {
      pick(10, 'parent');
      let result: any;
      component.filterChildQuestionsList('weeks');
      component.filteredChildOptions.subscribe((r: any) => (result = r));
      expect(result.map((q: any) => q.questionnaireId)).toEqual([20]);
      component.filterChildQuestionsList(null);
      component.filteredChildOptions.subscribe((r: any) => (result = r));
      expect(result.length).toBe(3);
    });
  });

  describe('createMapping', () => {
    beforeEach(() => setup());

    it('requires valid parent and child questions', () => {
      component.checkValidParentQuestion();
      component.createMapping();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Please select valid parent and child Question', 'error');
      expect(supervisor.createParentChildMapping).not.toHaveBeenCalled();
    });

    it('creates the mapping and returns to the list', () => {
      supervisor.createParentChildMapping.and.returnValue(of({ response: 'Mapped' }));
      pick(10, 'parent');
      component.createQuestionaireMappingForm.controls.answerType.setValue('Yes');
      pick(20, 'child');
      component.createMapping();
      expect(supervisor.createParentChildMapping).toHaveBeenCalledWith({
        parentQuestionId: 10,
        answer: 'Yes',
        childQuestionId: 20,
        createdBy: 'sup1',
        psmId: 4,
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('Mapped', 'success');
      expect(component.selectedParentId).toBeUndefined();
      expect(supervisor.createComponent).toHaveBeenCalledWith(MapQuestionaireConfigurationComponent, null);
    });

    it('shows create errors', () => {
      pick(10, 'parent');
      pick(20, 'child');
      supervisor.createParentChildMapping.and.returnValue(throwError(() => ({ error: 'dup' })));
      component.createMapping();
      supervisor.createParentChildMapping.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.createMapping();
      expect(confirmation.openDialog).toHaveBeenCalledWith('dup', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });
  });

  describe('back', () => {
    it('resets a new mapping and returns after confirmation', async () => {
      await setup();
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      component.createQuestionaireMappingForm.controls.answerType.setValue('Yes');
      component.back();
      expect(component.createQuestionaireMappingForm.value.answerType).toBeNull();
      expect(supervisor.createComponent).toHaveBeenCalledWith(MapQuestionaireConfigurationComponent, null);
    });

    it('keeps values in edit mode and stays when declined', async () => {
      await setup({ isEdit: true, questionaireMapedData: [] });
      component.createQuestionaireMappingForm.controls.answerType.setValue('Yes');
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.back();
      expect(supervisor.createComponent).not.toHaveBeenCalled();
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      component.back();
      expect(component.createQuestionaireMappingForm.value.answerType).toBe('Yes');
      expect(component.enableEdit).toBeFalse();
    });
  });
});
