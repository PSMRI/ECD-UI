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

import { CreateQaQuestionConfigComponent } from './create-qa-question-config.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { QaQuestionConfigComponent } from '../../qa-question-config/qa-question-config/qa-question-config.component';

describe('CreateQaQuestionConfigComponent', () => {
  let component: CreateQaQuestionConfigComponent;
  let fixture: ComponentFixture<CreateQaQuestionConfigComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let master: jasmine.SpyObj<MasterService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const lang = { rankExist: 'rankExist' };
  const session: any = { providerServiceMapID: 4, userName: 'qs1' };

  async function setup(data: any = { isEdit: false }) {
    qs = jasmine.createSpyObj('QualitySupervisorService', [
      'getAuditSectionMap', 'getQuestionnaireData', 'saveQuestionConfiguration', 'createComponent',
    ]);
    qs.getAuditSectionMap.and.returnValue(
      of([{ sectionId: 10, sectionName: 'Greeting', deleted: false }, { sectionId: 11, sectionName: 'Old', deleted: true }]),
    );
    qs.getQuestionnaireData.and.returnValue(
      of([{ sectionId: 10, questionRank: 1, deleted: false }, { sectionId: 10, questionRank: 2, deleted: true }]),
    );
    master = jasmine.createSpyObj('MasterService', ['getAnswerTypeMaster', 'getRoleMaster']);
    master.getAnswerTypeMaster.and.returnValue(of([{ answerType: 'Text' }, { answerType: 'Radio' }]));
    master.getRoleMaster.and.returnValue(
      of([{ roleName: 'Supervisor' }, { roleName: 'Associate' }, { roleName: 'Quality Auditor' }, { roleName: 'ANM' }]),
    );
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);

    await TestBed.configureTestingModule({
      declarations: [CreateQaQuestionConfigComponent],
      providers: [
        FormBuilder,
        { provide: ConfirmationService, useValue: confirmation },
        { provide: QualitySupervisorService, useValue: qs },
        { provide: MasterService, useValue: master },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CreateQaQuestionConfigComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(CreateQaQuestionConfigComponent);
    component = fixture.componentInstance;
    component.data = data;
    fixture.detectChanges();
  }

  const form = (): any => component.createQualityAuditorQuestionnaireForm;
  const question = (rank: number, sectionId = 10) => ({
    rank,
    questionnaire: 'Greeted caller?',
    answerType: 'Radio',
    sectionName: 'Greeting',
    sectionId,
    isFatalQues: false,
    roles: ['Associate'],
    newOption: [{ option: 'Yes', scores: 1 }, { option: 'No', scores: 0 }],
  });

  it('loads the radio answer type, active sections, questions and roles', async () => {
    await setup();
    expect(component.answerTypeList).toEqual([{ answerType: 'Radio' }]);
    expect(form().value.answerType).toBe('Radio');
    expect(component.sectionList.map((s) => s.sectionId)).toEqual([10]);
    expect(component.qaQuestionnaireConfigList.length).toBe(2);
    expect(component.roles.map((r: any) => r.roleName)).toEqual(['Associate', 'ANM']);
    expect(component.enableEdit).toBeFalse();
  });

  it('flags edit mode and shows load errors', async () => {
    await setup({ isEdit: true });
    expect(component.enableEdit).toBeTrue();
    qs.getAuditSectionMap.and.returnValue(of([]));
    qs.getQuestionnaireData.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getAnswerTypeMaster();
    component.getQuestionnaires();
    qs.getAuditSectionMap.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
    component.getAnswerTypeMaster();
    expect(confirmation.openDialog).toHaveBeenCalledWith(undefined as any, 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
  });

  describe('form helpers', () => {
    beforeEach(() => setup());

    it('validates the question text', () => {
      form().controls.questionnaire.setValue('   ');
      expect(form().controls.questionnaire.hasError('whitespace')).toBeTrue();
      expect(component.validateNonWhitespace(new FormControl('  '))).toEqual({ nonWhitespace: true });
      expect(component.validateNonWhitespace(new FormControl('ok'))).toBeNull();
    });

    it('adds and removes options', () => {
      expect(component.newOption.length).toBe(1);
      component.addOption();
      expect(component.newOption.length).toBe(2);
      expect(component.isOptionFilled).toBeTrue();
      component.removeOption(1);
      component.removeOption(0);
      expect(component.newOption.length).toBe(0);
      expect(component.isOptionFilled).toBeFalse();
    });

    it('stores the fatal flag, section id, answer type and roles', () => {
      component.onClickOfFatalQues({ checked: true });
      expect(form().value.isFatalQues).toBeTrue();
      form().controls.sectionName.setValue('Greeting');
      component.getSectionId();
      expect(form().value.sectionId).toBe(10);
      form().controls.answerType.setValue('');
      component.setAnswerType('anything');
      expect(form().value.answerType).toBe('Radio');
      component.setRoleType(['ANM']);
      component.setRoleType(null);
      expect(form().value.roles).toEqual(['ANM']);
    });
  });

  describe('onClickOfAdd', () => {
    beforeEach(() => setup());

    it('adds the question with its options and scores', () => {
      component.onClickOfAdd(question(3));
      expect(component.populateQuestionTable).toBeTrue();
      expect(component.dataSource.data).toEqual([
        {
          questionRank: 3,
          questionnaire: 'Greeted caller?',
          answerType: 'Radio',
          sectionName: 'Greeting',
          sectionId: 10,
          options: ['Yes', 'No'],
          scores: [1, 0],
          isFatalQues: false,
          roles: ['Associate'],
          createdBy: 'qs1',
          psmId: 4,
        } as any,
      ]);
      expect(component.newOption.length).toBe(1);
      expect(form().value.questionnaire).toBeNull();
    });

    it('rejects ranks used by active or pending questions in the section', () => {
      component.onClickOfAdd(question(1));
      component.onClickOfAdd(question(3));
      component.onClickOfAdd(question(3));
      expect(component.dataSource.data.length).toBe(1);
      expect(confirmation.openDialog).toHaveBeenCalledTimes(2);
      expect(confirmation.openDialog).toHaveBeenCalledWith('rankExist', 'error');
    });

    it('allows deleted ranks and the same rank in another section', () => {
      component.onClickOfAdd(question(2));
      component.onClickOfAdd(question(1, 11));
      expect(component.dataSource.data.length).toBe(2);
      component.removeQuestionnaire(0);
      expect(component.dataSource.data.length).toBe(1);
    });
  });

  describe('addQuestionnaireConfig', () => {
    beforeEach(async () => {
      await setup();
      component.onClickOfAdd(question(3));
    });

    it('saves pending questions and returns to the list', () => {
      qs.saveQuestionConfiguration.and.returnValue(of({ response: 'Saved' }));
      component.addQuestionnaireConfig();
      expect(qs.saveQuestionConfiguration).toHaveBeenCalledWith([jasmine.objectContaining({ questionRank: 3 })] as any);
      expect(confirmation.openDialog).toHaveBeenCalledWith('Saved', 'success');
      expect(component.dataSource.data).toEqual([]);
      expect(qs.createComponent).toHaveBeenCalledWith(QaQuestionConfigComponent, null);
    });

    it('shows save errors', () => {
      qs.saveQuestionConfiguration.and.returnValue(throwError(() => ({ error: 'dup' })));
      component.addQuestionnaireConfig();
      qs.saveQuestionConfiguration.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.addQuestionnaireConfig();
      expect(confirmation.openDialog).toHaveBeenCalledWith('dup', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });
  });

  it('back resets and returns after confirmation', async () => {
    await setup();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
    component.back();
    expect(qs.createComponent).not.toHaveBeenCalled();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    form().controls.questionnaire.setValue('x');
    component.back();
    expect(form().value.questionnaire).toBeNull();
    expect(qs.createComponent).toHaveBeenCalledWith(QaQuestionConfigComponent, null);
  });
});
