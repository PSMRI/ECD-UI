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

import { EditQuestionMappingComponent } from './edit-question-mapping.component';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { MapQuestionaireConfigurationComponent } from '../map-questionaire-configuration/map-questionaire-configuration.component';

describe('EditQuestionMappingComponent', () => {
  let component: EditQuestionMappingComponent;
  let fixture: ComponentFixture<EditQuestionMappingComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let tracking: jasmine.SpyObj<AmritTrackingService>;
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };
  const QUESTIONS = [
    { questionnaireId: 10, questionnaire: 'Are you pregnant?', questionnaireType: 'Question', answerType: 'Radio', options: ['Yes', 'No'] },
    { questionnaireId: 11, questionnaire: 'Any fever?', questionnaireType: 'Question', answerType: 'Multiple', options: ['High', 'Low'] },
    { questionnaireId: 20, questionnaire: 'How many weeks?', questionnaireType: 'Question', answerType: 'Text' },
    { questionnaireId: 21, questionnaire: 'How many days?', questionnaireType: 'Question', answerType: 'Text' },
  ];
  const SELECTED = { id: 5, parentQuestionId: 10, parentQuestion: 'Are you pregnant?', answer: 'Yes', childQuestionId: 20, childQuestion: 'How many weeks?', deleted: false };

  async function setup(mapped: any[] = [SELECTED]) {
    supervisor = jasmine.createSpyObj('SupervisorService', ['getQuestionnaires', 'updateParentChildMapping', 'createComponent']);
    supervisor.getQuestionnaires.and.returnValue(of(QUESTIONS));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [EditQuestionMappingComponent],
      providers: [
        FormBuilder,
        { provide: SetLanguageService, useValue: { languageData: {} } },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SupervisorService, useValue: supervisor },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(EditQuestionMappingComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(EditQuestionMappingComponent);
    component = fixture.componentInstance;
    component.data = { isEdit: true, selectedMappedQuestion: SELECTED, mappedQuestionListData: mapped };
    fixture.detectChanges();
  }

  const form = () => component.editQuestionaireMappingForm;
  const pick = (questionnaireId: number, type: string) =>
    component.onChange({ option: { value: { questionnaireId } } }, type);

  it('patches the selected mapping with the parent locked', async () => {
    await setup();
    expect(component.enableEdit).toBeTrue();
    expect(form().getRawValue()).toEqual({
      id: 5 as any,
      parentQuestion: 'Are you pregnant?',
      answerType: 'Yes',
      childQuestion: 'How many weeks?',
    });
    expect(form().controls.parentQuestion.disabled).toBeTrue();
    expect(component.selectedParentId).toBe(10);
    expect(component.selectedChildId).toBe(20);
  });

  it('loads parent answers and children for the parent', async () => {
    await setup();
    expect(supervisor.getQuestionnaires).toHaveBeenCalledWith(4);
    expect(component.parentQuestionaireList.map((q: any) => q.questionnaireId)).toEqual([10, 11]);
    expect(component.parentAnswersList).toEqual(['Yes', 'No']);
    expect(component.childQuestionaireList.map((q: any) => q.questionnaireId)).toEqual([11, 20, 21]);
  });

  it('excludes children mapped to the same parent by other mappings', async () => {
    await setup([SELECTED, { parentQuestionId: 10, childQuestionId: 21, deleted: false }]);
    expect(component.mappedId.length).toBe(1);
    expect(component.childQuestionaireList.map((q: any) => q.questionnaireId)).toEqual([11, 20]);
  });

  it('shows questionnaire load errors', async () => {
    await setup();
    supervisor.getQuestionnaires.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getQuestionnaires();
    supervisor.getQuestionnaires.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
    component.getQuestionnaires();
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
  });

  it('changing the parent resets the answer and child', async () => {
    await setup();
    pick(11, 'parent');
    expect(component.selectedParentId).toBe(11);
    expect(component.parentAnswersList).toEqual(['High', 'Low']);
    expect(form().getRawValue().answerType).toBeNull();
    expect(form().getRawValue().childQuestion).toBeNull();
    pick(21, 'child');
    expect(component.selectedChildId).toBe(21);
    expect(form().getRawValue().childQuestion).toBe('How many days?');
  });

  it('autocomplete filters parents and children', async () => {
    await setup();
    let parents: any;
    let children: any;
    component.filterQuestionsList('fever');
    component.filteredOptions.subscribe((r: any) => (parents = r));
    component.filterChildQuestionsList('days');
    component.filteredChildOptions.subscribe((r: any) => (children = r));
    expect(parents.map((q: any) => q.questionnaireId)).toEqual([11]);
    expect(children.map((q: any) => q.questionnaireId)).toEqual([21]);
    component.filterChildQuestionsList(null);
    component.filteredChildOptions.subscribe((r: any) => (children = r));
    expect(children.length).toBe(3);
  });

  describe('editMapping', () => {
    beforeEach(() => setup());

    it('requires valid parent and child', () => {
      component.checkValidChildQuestionQuestion();
      component.editMapping();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Please select valid parent and child Question', 'error');
      component.checkValidParentQuestion();
      expect(component.selectedParentId).toBeNull();
      expect(supervisor.updateParentChildMapping).not.toHaveBeenCalled();
    });

    it('updates the mapping and returns to the list', () => {
      supervisor.updateParentChildMapping.and.returnValue(of({ response: 'Updated' }));
      component.editMapping();
      expect(supervisor.updateParentChildMapping).toHaveBeenCalledWith({
        id: 5,
        parentQuestionId: 10,
        answer: 'Yes',
        childQuestionId: 20,
        createdBy: 'sup1',
        psmId: 4,
        modifiedBy: 'sup1',
        deleted: false,
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('Updated', 'success');
      expect(component.selectedChildId).toBeUndefined();
      expect(supervisor.createComponent).toHaveBeenCalledWith(MapQuestionaireConfigurationComponent, null);
    });

    it('shows update errors', () => {
      supervisor.updateParentChildMapping.and.returnValue(throwError(() => ({ error: 'dup' })));
      component.editMapping();
      supervisor.updateParentChildMapping.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.editMapping();
      expect(confirmation.openDialog).toHaveBeenCalledWith('dup', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });
  });

  it('back keeps edit values and returns after confirmation', async () => {
    await setup();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    component.back();
    expect(form().getRawValue().answerType).toBe('Yes');
    expect(component.enableEdit).toBeFalse();
    expect(supervisor.createComponent).toHaveBeenCalledWith(MapQuestionaireConfigurationComponent, null);
    component.back();
    expect(form().getRawValue().answerType).toBeNull();
  });

  it('tracks field interactions', async () => {
    await setup();
    component.trackFieldInteraction('answer');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('answer', 'Edit Question Mapping');
  });
});
