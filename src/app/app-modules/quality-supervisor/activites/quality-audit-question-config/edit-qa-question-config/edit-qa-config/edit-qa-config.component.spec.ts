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
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { EditQaConfigComponent } from './edit-qa-config.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { QaQuestionConfigComponent } from '../../qa-question-config/qa-question-config/qa-question-config.component';

describe('EditQaConfigComponent', () => {
  let component: EditQaConfigComponent;
  let fixture: ComponentFixture<EditQaConfigComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let master: jasmine.SpyObj<MasterService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const lang = { rankExist: 'rankExist' };
  const session: any = { providerServiceMapID: 4, userName: 'qs1' };
  const DATA = {
    questionId: 1,
    question: 'Greeted caller?',
    questionRank: 1,
    sectionId: 10,
    sectionName: 'Greeting',
    isFatalQues: true,
    roles: ['Associate'],
    options: ['Yes', 'No'],
    scores: [1, 0],
  };

  async function setup(data: any = DATA) {
    qs = jasmine.createSpyObj('QualitySupervisorService', [
      'getAuditSectionMap', 'getQuestionnaireData', 'updateQuestionConfiguration', 'createComponent',
    ]);
    qs.getAuditSectionMap.and.returnValue(
      of([{ sectionId: 10, sectionName: 'Greeting', deleted: false }, { sectionId: 11, sectionName: 'Closing', deleted: false }, { sectionId: 12, deleted: true }]),
    );
    qs.getQuestionnaireData.and.returnValue(
      of([
        { questionId: 1, sectionId: 10, questionRank: 1, deleted: false },
        { questionId: 2, sectionId: 10, questionRank: 2, deleted: false },
        { questionId: 3, sectionId: 10, questionRank: 3, deleted: true },
      ]),
    );
    master = jasmine.createSpyObj('MasterService', ['getAnswerTypeMaster', 'getRoleMaster']);
    master.getAnswerTypeMaster.and.returnValue(of([{ answerType: 'Radio' }, { answerType: 'Text' }]));
    master.getRoleMaster.and.returnValue(of([{ roleName: 'Associate' }, { roleName: 'Quality Supervisor' }]));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);

    await TestBed.configureTestingModule({
      declarations: [EditQaConfigComponent],
      providers: [
        FormBuilder,
        { provide: ConfirmationService, useValue: confirmation },
        { provide: QualitySupervisorService, useValue: qs },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: MasterService, useValue: master },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(EditQaConfigComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(EditQaConfigComponent);
    component = fixture.componentInstance;
    component.data = data;
    fixture.detectChanges();
  }

  const form = (): any => component.editQualityAuditorQuestionnaireForm;

  it('patches the question with its options and loads masters', async () => {
    await setup();
    expect(form().value).toEqual(
      jasmine.objectContaining({
        question: 'Greeted caller?',
        questionRank: 1,
        sectionName: 'Greeting',
        isFatalQues: true,
        answerType: 'Radio',
        newOption: [{ option: 'Yes', scores: 1 }, { option: 'No', scores: 0 }],
      }),
    );
    expect(component.sectionList.map((s) => s.sectionId)).toEqual([10, 11]);
    expect(component.roles.map((r) => r.roleName)).toEqual(['Associate']);
  });

  it('marks the form dirty when options change', async () => {
    await setup();
    expect(form().dirty).toBeFalse();
    component.addOption();
    expect(form().dirty).toBeTrue();
    expect(component.isOptionFilled).toBeTrue();
    component.removeOption(2);
    component.removeOption(1);
    component.removeOption(0);
    expect(component.isOptionFilled).toBeFalse();
  });

  it('starts with one empty option without data', async () => {
    await setup(null);
    expect(component.newOption.length).toBe(1);
    expect(component.createOptionField().controls['option'].hasError('required')).toBeTrue();
  });

  it('shows section and questionnaire load errors', async () => {
    await setup();
    qs.getAuditSectionMap.and.returnValue(of([]));
    component.getSectionList();
    qs.getAuditSectionMap.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getSectionList();
    qs.getQuestionnaireData.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
    component.getQuestionnaires();
    expect(confirmation.openDialog).toHaveBeenCalledWith(undefined as any, 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
  });

  it('form helpers', async () => {
    await setup();
    form().controls.question.setValue('  ');
    expect(form().controls.question.hasError('whitespace')).toBeTrue();
    expect(component.validateNonWhitespace(new FormControl('  '))).toEqual({ nonWhitespace: true });
    expect(component.validateWhitespace(new FormControl(null))).toBeUndefined();
    component.onClickOfFatalQues({ checked: false });
    expect(form().value.isFatalQues).toBeFalse();
    form().controls.sectionName.setValue('Closing');
    component.getSectionId();
    expect(form().value.sectionId).toBe(11);
    form().controls.answerType.setValue('');
    component.setAnswerType('x');
    expect(form().value.answerType).toBe('Radio');
    component.setRoleType(['ANM']);
    component.setRoleType(undefined);
    expect(form().value.roles).toEqual(['ANM']);
    expect(component.selectedAgents([{ name: 'A' }, { name: 'B' }])).toEqual(['A', 'B']);
  });

  describe('updateQualityAuditQuestionnaire', () => {
    beforeEach(() => setup());

    it('rejects a rank used by another active question in the section', () => {
      component.updateQualityAuditQuestionnaire({ ...form().value, questionRank: 2 });
      expect(confirmation.openDialog).toHaveBeenCalledWith('rankExist', 'error');
      expect(qs.updateQuestionConfiguration).not.toHaveBeenCalled();
    });

    it('updates the question and returns to the list', () => {
      qs.updateQuestionConfiguration.and.returnValue(of({ response: 'Updated' }));
      component.updateQualityAuditQuestionnaire({ ...form().value, questionRank: 3 });
      expect(qs.updateQuestionConfiguration).toHaveBeenCalledWith({
        id: 1,
        questionnaire: 'Greeted caller?',
        questionRank: 3,
        answerType: 'Radio',
        sectionId: 10,
        sectionName: 'Greeting',
        sectionRank: undefined,
        deleted: false,
        isFatalQues: true,
        roles: ['Associate'],
        createdBy: 'qs1',
        modifiedBy: 'qs1',
        psmId: 4,
        options: ['Yes', 'No'],
        scores: [1, 0],
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('Updated', 'success');
      expect(qs.createComponent).toHaveBeenCalledWith(QaQuestionConfigComponent, null);
    });

    it('shows update failures', () => {
      qs.updateQuestionConfiguration.and.returnValue(of({ errorMessage: 'nope' }));
      component.updateQualityAuditQuestionnaire(form().value);
      qs.updateQuestionConfiguration.and.returnValue(throwError(() => ({ error: 'down' })));
      component.updateQualityAuditQuestionnaire(form().value);
      qs.updateQuestionConfiguration.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.updateQualityAuditQuestionnaire(form().value);
      expect(confirmation.openDialog).toHaveBeenCalledWith('nope', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });
  });

  it('back resets and returns after confirmation', async () => {
    await setup();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
    component.back();
    expect(qs.createComponent).not.toHaveBeenCalled();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    component.back();
    expect(form().value.question).toBeNull();
    expect(qs.createComponent).toHaveBeenCalledWith(QaQuestionConfigComponent, null);
  });
});
