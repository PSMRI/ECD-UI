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
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { CreateQuestionnaireComponent } from './create-questionnaire.component';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { QuestionnaireConfigurationComponent } from '../questionnaire-configuration/questionnaire-configuration.component';

describe('CreateQuestionnaireComponent', () => {
  let component: CreateQuestionnaireComponent;
  let fixture: ComponentFixture<CreateQuestionnaireComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let master: jasmine.SpyObj<MasterService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let tracking: jasmine.SpyObj<AmritTrackingService>;

  const lang = {
    rankOrQuestionnaireAlreadyExists: 'rankOrQuestionnaireAlreadyExists',
    questionnaireCreatedSuccessfully: 'questionnaireCreatedSuccessfully',
    questionnaireUpdatedSuccessfully: 'questionnaireUpdatedSuccessfully',
    doYouReallyWantToCancelUnsavedData: 'doYouReallyWantToCancelUnsavedData',
  };
  const questionTypes = [
    { questionTypeId: 1, questionType: 'Question' },
    { questionTypeId: 2, questionType: 'Information' },
  ];
  const answerTypes = [
    { answerTypeId: 10, answerType: 'Radio' },
    { answerTypeId: 11, answerType: 'Text' },
    { answerTypeId: 12, answerType: 'Dropdown' },
    { answerTypeId: 13, answerType: 'Multiple' },
  ];
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };

  function selectedQuestion() {
    return {
      questionnaireId: 50,
      questionRank: 3,
      questionnaireTypeId: 1,
      questionnaireType: 'Question',
      questionnaire: 'Is the baby feeding well?',
      answerType: 'Radio',
      questionnaireValues: [
        { id: 1, options: 'Yes', deleted: false },
        { id: 2, options: 'No', deleted: false },
      ],
    };
  }

  function create(data: any) {
    fixture = TestBed.createComponent(CreateQuestionnaireComponent);
    component = fixture.componentInstance;
    component.data = data;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', ['saveQuestionnaire', 'updateQuestionnaire', 'createComponent']);
    master = jasmine.createSpyObj('MasterService', ['getQuestionnaireTypeMaster', 'getAnswerTypeMaster']);
    master.getQuestionnaireTypeMaster.and.returnValue(of(questionTypes));
    master.getAnswerTypeMaster.and.returnValue(of(answerTypes));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [CreateQuestionnaireComponent],
      providers: [
        FormBuilder,
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: SupervisorService, useValue: supervisor },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: MasterService, useValue: master },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CreateQuestionnaireComponent, '')
      .compileComponents();
  });

  describe('init (create mode)', () => {
    beforeEach(() => create({ isEdit: false, questionnaireData: [{ questionRank: 1, deleted: false }] }));

    it('should create and load both masters', () => {
      expect(component).toBeTruthy();
      expect(component.enableEdit).toBeFalse();
      expect(component.questionnaireTypeList).toEqual(questionTypes);
      expect(component.answerTypeList).toEqual(answerTypes);
      expect(component.questionnaireList.length).toBe(1);
    });
  });

  describe('master failures', () => {
    it('should show err.error when questionnaire types fail to load', () => {
      master.getQuestionnaireTypeMaster.and.returnValue(throwError(() => ({ error: 'qt failed' })));
      create({});
      expect(confirmation.openDialog).toHaveBeenCalledWith('qt failed', 'error');
      expect(master.getAnswerTypeMaster).not.toHaveBeenCalled();
    });

    it('should show title + detail when answer types fail without err.error', () => {
      master.getAnswerTypeMaster.and.returnValue(throwError(() => ({ title: 'A', detail: 'B' })));
      create({});
      expect(confirmation.openDialog).toHaveBeenCalledWith('AB', 'error');
    });

    it('should show err.error when answer types fail', () => {
      master.getAnswerTypeMaster.and.returnValue(throwError(() => ({ error: 'at failed' })));
      create({});
      expect(confirmation.openDialog).toHaveBeenCalledWith('at failed', 'error');
    });

    it('should show title + detail when questionnaire types fail without err.error', () => {
      master.getQuestionnaireTypeMaster.and.returnValue(throwError(() => ({ title: 'C', detail: 'D' })));
      create({});
      expect(confirmation.openDialog).toHaveBeenCalledWith('CD', 'error');
    });
  });

  describe('init (edit mode)', () => {
    it('should enable edit and patch the selected question with its options', () => {
      create({ isEdit: true, questionnaireData: [], selectedQuestionnaireData: selectedQuestion() });
      expect(component.enableEdit).toBeTrue();
      const f = component.editQuestionnaireForm.controls;
      expect(f['questionnaireId'].value as any).toBe(50);
      expect(f['questionRank'].value as any).toBe(3);
      expect(f['questionnaireType'].value as any).toBe('Question');
      expect(f['answerTypeId'].value as any).toBe(10);
      expect(f['answerType'].value as any).toBe('Radio');
      expect(component.enableOption).toBeTrue();
      expect(component.optionList).toEqual(['Yes', 'No']);
      expect(f['options'].value as any).toBe('Yes,No');
    });

    it('should not load options for a text question', () => {
      const q: any = { ...selectedQuestion(), answerType: 'Text' };
      create({ isEdit: true, selectedQuestionnaireData: q });
      expect(component.enableOption).toBeFalse();
      expect(component.optionList).toEqual([]);
    });

    it('should not set an answer type for information items', () => {
      const q: any = { ...selectedQuestion(), questionnaireTypeId: 2, questionnaireType: 'Information' };
      create({ isEdit: true, selectedQuestionnaireData: q });
      expect(component.editQuestionnaireForm.controls['answerTypeId'].value).toBeNull();
    });
  });

  describe('validators', () => {
    beforeEach(() => create({}));

    it('validateWhitespace should reject blank text and accept real text', () => {
      expect(component.validateWhitespace(new FormControl('   '))).toEqual({ whitespace: true });
      expect(component.validateWhitespace(new FormControl(' hi '))).toBeNull();
      expect(component.validateWhitespace(new FormControl(null))).toBeUndefined();
    });

    it('validateNonWhitespace should flag whitespace-only values', () => {
      expect(component.validateNonWhitespace(new FormControl('  '))).toEqual({ nonWhitespace: true });
      expect(component.validateNonWhitespace(new FormControl(''))).toBeNull();
      expect(component.validateNonWhitespace(new FormControl('a'))).toBeNull();
      expect(component.validateNonWhitespace(new FormControl(null))).toBeNull();
    });

    it('questionnaire control should be invalid for whitespace', () => {
      (component.createQuestionnaireForm.controls['questionnaire'] as any).setValue('   ');
      expect(component.createQuestionnaireForm.controls['questionnaire'].hasError('whitespace')).toBeTrue();
    });
  });

  describe('type and answer selection (create)', () => {
    beforeEach(() => create({}));

    it('choosing Question should require an answer type', () => {
      component.setQuestionnaireTypeName(1);
      const c = component.createQuestionnaireForm.controls;
      expect(c['questionnaireType'].value as any).toBe('Question');
      expect(c['answerTypeId'].hasError('required')).toBeTrue();
    });

    it('choosing a non-question type should clear answers and options', () => {
      component.optionList = ['x'];
      component.enableOption = true;
      component.setQuestionnaireTypeName(2);
      const c = component.createQuestionnaireForm.controls;
      expect(c['answerTypeId'].valid).toBeTrue();
      expect(c['options'].value).toBeNull();
      expect(component.optionList).toEqual([]);
      expect(component.enableOption).toBeFalse();
    });

    ['Radio', 'Dropdown', 'Multiple'].forEach((type) => {
      it(`answer type ${type} should enable options`, () => {
        const id = answerTypes.find((a) => a.answerType === type)!.answerTypeId;
        component.setAnswerType(id);
        expect(component.enableOption).toBeTrue();
      });
    });

    it('answer type Text should disable options and clear them', () => {
      component.optionList = ['x'];
      component.setAnswerType(11);
      expect(component.enableOption).toBeFalse();
      expect(component.optionList).toEqual([]);
    });

    it('unknown answer type should disable options', () => {
      component.setAnswerType(999);
      expect(component.enableOption).toBeFalse();
    });
  });

  describe('type and answer selection (edit)', () => {
    beforeEach(() => create({}));

    it('setQuestionnaireTypeNameForEdit should require an answer type for questions', () => {
      component.setQuestionnaireTypeNameForEdit(1);
      expect(component.editQuestionnaireForm.controls['answerTypeId'].hasError('required')).toBeTrue();
    });

    it('setQuestionnaireTypeNameForEdit should clear options for other types', () => {
      component.optionList = ['x'];
      component.setQuestionnaireTypeNameForEdit(2);
      expect(component.optionList).toEqual([]);
      expect(component.enableOption).toBeFalse();
    });

    it('setAnswerTypeForEdit should toggle options by answer type', () => {
      component.setAnswerTypeForEdit(12);
      expect(component.enableOption).toBeTrue();
      component.setAnswerTypeForEdit(11);
      expect(component.enableOption).toBeFalse();
    });
  });

  describe('option chips', () => {
    beforeEach(() => create({}));

    it('add should trim, store the option object and clear the input', () => {
      const input = document.createElement('input');
      input.value = ' Yes ';
      component.editQuestionnaireForm.controls['questionnaireId'].setValue('50');
      component.add({ input, value: ' Yes ' } as any);
      expect(component.optionList).toEqual(['Yes']);
      expect(component.finalOptionList[0]).toEqual({
        id: null, options: 'Yes', questionId: '50', psmId: 4, deleted: false, createdBy: 'sup1',
      });
      expect(input.value).toBe('');
      expect(component.editQuestionnaireForm.dirty).toBeTrue();
    });

    it('add should ignore blank and duplicate values', () => {
      component.add({ input: null, value: '   ' } as any);
      component.add({ input: null, value: 'No' } as any);
      component.add({ input: null, value: ' No' } as any);
      expect(component.optionList).toEqual(['No']);
      expect(component.finalOptionList.length).toBe(1);
    });

    it('remove should delete the option from both lists', () => {
      component.add({ input: null, value: 'A' } as any);
      component.add({ input: null, value: 'B' } as any);
      component.remove('A');
      expect(component.optionList).toEqual(['B']);
      expect(component.finalOptionList.map((o) => o.options)).toEqual(['B']);
    });

    it('remove should ignore unknown options', () => {
      component.add({ input: null, value: 'A' } as any);
      component.remove('Z');
      expect(component.optionList).toEqual(['A']);
    });
  });

  describe('buffer table', () => {
    const base = {
      questionRank: 2, questionnaireTypeId: 1, questionnaireType: 'Question', questionnaire: 'Q?',
      answerTypeId: 10, answerType: 'Radio',
    };

    beforeEach(() => create({ questionnaireData: [{ questionRank: 1, deleted: false }, { questionRank: 9, deleted: true }] }));

    it('addQuestionnaires should push a question with options and reset the form', () => {
      component.enableOption = true;
      component.add({ input: null, value: 'Yes' } as any);
      component.addQuestionnaires(base);
      const row: any = component.dataSource.data[0];
      expect(row.answerTypeId).toBe(10);
      expect(row.options).toEqual(['Yes']);
      expect(row.questionnaireValues.length).toBe(1);
      expect(row.createdBy).toBe('sup1');
      expect(row.psmId).toBe(4);
      expect(component.optionList).toEqual([]);
      expect(component.enableOption).toBeFalse();
    });

    it('addQuestionnaires should null answer fields for non-question types', () => {
      component.addQuestionnaires({ ...base, questionnaireType: 'Information' });
      const row: any = component.dataSource.data[0];
      expect(row.answerTypeId).toBeNull();
      expect(row.answerType).toBeNull();
      expect(row.options).toBeNull();
    });

    it('should reject a rank already in the buffer', () => {
      component.addQuestionnaires(base);
      component.addQuestionnaires({ ...base, questionnaire: 'Other' });
      expect(component.dataSource.data.length).toBe(1);
      expect(confirmation.openDialog).toHaveBeenCalledWith('rankOrQuestionnaireAlreadyExists', 'info');
    });

    it('should reject a rank already used by an active saved question', () => {
      component.addQuestionnaires({ ...base, questionRank: 1 });
      expect(component.dataSource.data.length).toBe(0);
      expect(confirmation.openDialog).toHaveBeenCalledWith('rankOrQuestionnaireAlreadyExists', 'info');
    });

    it('should allow a rank used only by a deleted question', () => {
      component.addQuestionnaires({ ...base, questionRank: 9 });
      expect(component.dataSource.data.length).toBe(1);
    });

    it('removeQuestionnaire should remove the row at the index', () => {
      component.addQuestionnaires(base);
      component.addQuestionnaires({ ...base, questionRank: 3 });
      component.removeQuestionnaire(0);
      expect(component.dataSource.data.map((r) => r.questionRank)).toEqual([3]);
    });
  });

  describe('saveQuestionnaires', () => {
    beforeEach(() => {
      create({});
      component.addQuestionnaires({ questionRank: 1, questionnaireTypeId: 2, questionnaireType: 'Information', questionnaire: 'Info' });
    });

    it('should save the buffer, clear it and go back to the list', () => {
      supervisor.saveQuestionnaire.and.returnValue(of({ response: 'ok' }));
      component.saveQuestionnaires();
      expect(supervisor.saveQuestionnaire.calls.mostRecent().args[0].length).toBe(1);
      expect(confirmation.openDialog).toHaveBeenCalledWith('questionnaireCreatedSuccessfully', 'success');
      expect(component.dataSource.data).toEqual([]);
      expect(supervisor.createComponent).toHaveBeenCalledWith(QuestionnaireConfigurationComponent, null);
    });

    it('should show the error message when save is rejected', () => {
      supervisor.saveQuestionnaire.and.returnValue(of({ errorMessage: 'dup' }));
      component.saveQuestionnaires();
      expect(confirmation.openDialog).toHaveBeenCalledWith('dup', 'error');
      expect(component.dataSource.data.length).toBe(1);
    });

    it('should show err.error when save fails', () => {
      supervisor.saveQuestionnaire.and.returnValue(throwError(() => ({ error: 'save failed' })));
      component.saveQuestionnaires();
      expect(confirmation.openDialog).toHaveBeenCalledWith('save failed', 'error');
    });

    it('should show title + detail when save fails without err.error', () => {
      supervisor.saveQuestionnaire.and.returnValue(throwError(() => ({ title: 'X', detail: 'Y' })));
      component.saveQuestionnaires();
      expect(confirmation.openDialog).toHaveBeenCalledWith('XY', 'error');
    });
  });

  describe('updateQuestionnaires', () => {
    let editValue: any;

    beforeEach(() => {
      create({
        isEdit: true,
        questionnaireData: [
          { questionnaireId: 50, questionRank: 3, deleted: false },
          { questionnaireId: 60, questionRank: 4, deleted: false },
        ],
        selectedQuestionnaireData: selectedQuestion(),
      });
      editValue = component.editQuestionnaireForm.value;
    });

    it('should keep existing options, add new ones and mark removed ones deleted', () => {
      supervisor.updateQuestionnaire.and.returnValue(of({ response: 'ok' }));
      component.remove('No');
      component.add({ input: null, value: 'Maybe' } as any);
      component.updateQuestionnaires(editValue);

      const req = supervisor.updateQuestionnaire.calls.mostRecent().args[0];
      const opts = req.questionnaireValues;
      expect(opts.find((o: any) => o.options === 'Yes').id).toBe(1);
      expect(opts.find((o: any) => o.options === 'Maybe')).toEqual(jasmine.objectContaining({ id: null, questionId: 50 }));
      expect(opts.find((o: any) => o.options === 'No')).toEqual(jasmine.objectContaining({ deleted: true, modifiedBy: 'sup1' }));
      expect(req.questionnaireId).toBe(50);
      expect(req.modifiedBy).toBe('sup1');
      expect(confirmation.openDialog).toHaveBeenCalledWith('questionnaireUpdatedSuccessfully', 'success');
      expect(supervisor.createComponent).toHaveBeenCalledWith(QuestionnaireConfigurationComponent, null);
    });

    it('should mark every option deleted when all are removed', () => {
      supervisor.updateQuestionnaire.and.returnValue(of({ response: 'ok' }));
      component.remove('Yes');
      component.remove('No');
      component.updateQuestionnaires(editValue);
      const opts = supervisor.updateQuestionnaire.calls.mostRecent().args[0].questionnaireValues;
      expect(opts.length).toBe(2);
      expect(opts.every((o: any) => o.deleted)).toBeTrue();
    });

    it('should send newly added options when the question had none', () => {
      supervisor.updateQuestionnaire.and.returnValue(of({ response: 'ok' }));
      component.selectedQuestionnaireList.questionnaireValues = [];
      component.optionList = [];
      component.finalOptionList = [];
      component.add({ input: null, value: 'New' } as any);
      component.updateQuestionnaires(editValue);
      expect(supervisor.updateQuestionnaire.calls.mostRecent().args[0].questionnaireValues.map((o: any) => o.options)).toEqual(['New']);
    });

    it('should reject a rank used by another active question', () => {
      component.updateQuestionnaires({ ...editValue, questionRank: 4 });
      expect(supervisor.updateQuestionnaire).not.toHaveBeenCalled();
      expect(confirmation.openDialog).toHaveBeenCalledWith('rankOrQuestionnaireAlreadyExists', 'info');
    });

    it('should allow keeping its own rank', () => {
      supervisor.updateQuestionnaire.and.returnValue(of({ response: 'ok' }));
      component.updateQuestionnaires(editValue);
      expect(supervisor.updateQuestionnaire).toHaveBeenCalled();
    });

    it('should show the error message when update is rejected', () => {
      supervisor.updateQuestionnaire.and.returnValue(of({ errorMessage: 'no' }));
      component.updateQuestionnaires(editValue);
      expect(confirmation.openDialog).toHaveBeenCalledWith('no', 'error');
    });

    it('should show err.error when update fails', () => {
      supervisor.updateQuestionnaire.and.returnValue(throwError(() => ({ error: 'upd failed' })));
      component.updateQuestionnaires(editValue);
      expect(confirmation.openDialog).toHaveBeenCalledWith('upd failed', 'error');
    });

    it('should show title + detail when update fails without err.error', () => {
      supervisor.updateQuestionnaire.and.returnValue(throwError(() => ({ title: 'P', detail: 'Q' })));
      component.updateQuestionnaires(editValue);
      expect(confirmation.openDialog).toHaveBeenCalledWith('PQ', 'error');
    });
  });

  describe('back', () => {
    it('should reset and return to the list when confirmed (create mode)', () => {
      create({});
      component.addQuestionnaires({ questionRank: 1, questionnaireType: 'Information' });
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      component.back();
      expect(confirmation.openDialog).toHaveBeenCalledWith('doYouReallyWantToCancelUnsavedData', 'confirm');
      expect(component.dataSource.data).toEqual([]);
      expect(supervisor.createComponent).toHaveBeenCalledWith(QuestionnaireConfigurationComponent, null);
    });

    it('should reset the edit form when confirmed in edit mode', () => {
      create({ isEdit: true, selectedQuestionnaireData: selectedQuestion() });
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      component.back();
      expect(component.editQuestionnaireForm.controls['questionnaireId'].value).toBeNull();
      expect(component.enableEdit).toBeFalse();
      expect(component.selectedQuestionnaireList).toEqual([]);
    });

    it('should stay when cancelled', () => {
      create({});
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.back();
      expect(supervisor.createComponent).not.toHaveBeenCalled();
    });
  });

  it('trackFieldInteraction should report to tracking', () => {
    create({});
    component.trackFieldInteraction('rank');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('rank', 'Create Questionnaire');
  });
});
