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
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { EcdQuestionnaireComponent } from './ecd-questionnaire.component';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { MasterService } from '../../services/masterService/master.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { HighRiskReasonsComponent } from '../high-risk-reasons/high-risk-reasons.component';
import { VideoConsultationService } from '../video-consultation/videoService';

describe('EcdQuestionnaireComponent', () => {
  let component: EcdQuestionnaireComponent;
  let fixture: ComponentFixture<EcdQuestionnaireComponent>;
  let anm: any;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let stepper: any;
  let tracking: jasmine.SpyObj<AmritTrackingService>;
  const session: any = { role: 'ANM', providerServiceMapID: 4, userName: 'agent1' };
  const lang = { doYouWantToCloseTheCall: 'doYouWantToCloseTheCall', pleaseFillAllTheQuestions: 'pleaseFillAllTheQuestions' };

  function q(over: any) {
    return { questionType: 'Question', answerType: 'Radio', parentQuestionId: null, parentAnswer: null, ...over };
  }

  // Section 2 (rank 2) is listed first to check sorting; Q12 depends on Q11 = 'Yes'.
  function questions() {
    return [
      q({ sectionid: 2, sectionName: 'Delivery', callSectionRank: 2, questionid: 21, question: 'Delivered?', sectionQuestionRank: 1 }),
      q({ sectionid: 1, sectionName: 'ANC', callSectionRank: 1, questionid: 12, question: 'Which month?', sectionQuestionRank: 2,
        parentQuestionId: [11], parentAnswer: [{ parentQuesId: 11, parentAnswerList: ['Yes'] }] }),
      q({ sectionid: 1, sectionName: 'ANC', callSectionRank: 1, questionid: 11, question: 'Is HRP?', sectionQuestionRank: 1 }),
      q({ sectionid: 1, sectionName: 'ANC', callSectionRank: 1, questionid: 13, question: 'Info text', questionType: 'Information', sectionQuestionRank: 3 }),
    ];
  }

  const mother = { obCallId: 55, mctsidNo: 'M-1', name: 'Asha', motherName: '', lmpDate: '2025-01-10', edd: '2025-10-17', outboundCallType: 'ANC1' };
  const child = { obCallId: 56, mctsidNoChildId: 'C-1', dob: '2025-02-01', childName: 'Baby', outboundCallType: 'PNC1' };

  function create(ben: any = mother) {
    anm.selectedBenDetails = ben;
    fixture = TestBed.createComponent(EcdQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    stepper = { selectedIndex: 0, next: jasmine.createSpy('next'), previous: jasmine.createSpy('previous') };
    (component as any).myStepper = stepper;
  }

  function load(ben: any = mother) {
    create(ben);
    anm.loadEcdQuestionnaireData$.next(true);
  }

  beforeEach(async () => {
    anm = jasmine.createSpyObj('AssociateAnmMoService', [
      'fetchBeneficiaryQuestionnaire', 'onClickOfEcdQuestionnaire', 'setOpenComp', 'setBenHistoryComp', 'saveQuestionnaireResponse',
    ]);
    anm.loadEcdQuestionnaireData$ = new BehaviorSubject<any>('');
    anm.openCompFlag$ = new BehaviorSubject<any>('');
    anm.callDetailId = 900;
    anm.fetchBeneficiaryQuestionnaire.and.callFake(() => of(questions()));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [EcdQuestionnaireComponent],
      providers: [
        FormBuilder,
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: AssociateAnmMoService, useValue: anm },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: MatDialog, useValue: dialog },
        { provide: MasterService, useValue: {} },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: VideoConsultationService, useValue: { callStatus: 'Ongoing', meetLink: 'x' } },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(EcdQuestionnaireComponent, '')
      .compileComponents();
  });

  describe('init', () => {
    it('should create without loading questions until requested', () => {
      create();
      expect(component).toBeTruthy();
      expect(component.role).toBe('ANM');
      expect(anm.fetchBeneficiaryQuestionnaire).not.toHaveBeenCalled();
    });

    it('should fill the mother form, falling back to name and formatting dates', () => {
      load(mother);
      const v = component.beneficiaryMotherDataForm.value;
      expect(v.motherName).toBe('Asha');
      expect(v.motherId).toBe('M-1');
      expect(v.lmpDate).toBe('2025-01-10');
      expect(v.edd).toBe('2025-10-17');
      expect(component.enableChildForm).toBeFalse();
      expect(component.motherId).toBe('M-1');
    });

    it('should fill the child form when the beneficiary is a child', () => {
      load(child);
      expect(component.enableChildForm).toBeTrue();
      expect(component.childId).toBe('C-1');
      expect(component.beneficiaryChildDataForm.value.childId).toBe('C-1');
      expect(component.beneficiaryChildDataForm.value.dob).toBe('2025-02-01');
    });

    it('should fetch questions for the call type and role and reset the trigger', () => {
      load();
      expect(anm.fetchBeneficiaryQuestionnaire).toHaveBeenCalledWith(4, 'ANC1', 'ANM');
      expect(anm.onClickOfEcdQuestionnaire).toHaveBeenCalledWith(false);
      expect(component.totalSteps).toBe(2);
      expect(component.stepValidity).toEqual([false, false]);
    });

    it('should keep an empty list when no questions are configured', () => {
      anm.fetchBeneficiaryQuestionnaire.and.returnValue(of([]));
      load();
      expect(component.filteredQuesData).toEqual([]);
    });

    it('should reset stepper state when a "Call Closed" event arrives', () => {
      load();
      component.step = 1;
      stepper.selectedIndex = 1;
      anm.openCompFlag$.next('Call Closed');
      expect(component.filteredQuesData).toEqual([]);
      expect(component.step).toBe(0);
      expect(stepper.selectedIndex).toBe(0);
    });
  });

  describe('grouping and visibility', () => {
    beforeEach(() => load());

    it('should group by section rank and sort questions by rank', () => {
      const d = component.filteredQuesData;
      expect(d.map((s: any) => s.sectionName)).toEqual(['ANC', 'Delivery']);
      expect(d[0].questionnaires.map((x: any) => x.questionid)).toEqual([11, 12, 13]);
      expect(d[0].questionnaires.every((x: any) => x.answer === null)).toBeTrue();
    });

    it('should enable parent questions and hide dependent ones initially', () => {
      const [q11, q12] = component.filteredQuesData[0].questionnaires;
      expect(q11.enabledQues).toEqual(['Parent Ques']);
      expect(q12.enabledQues).toEqual([]);
    });

    it('answering the parent with a matching value should reveal the child question', () => {
      const [q11, q12] = component.filteredQuesData[0].questionnaires;
      q11.answer = 'Yes';
      component.processFilteredQuestionnaires(q11);
      expect(q12.enabledQues).toEqual([11]);
    });

    it('changing the parent answer should hide the child and clear its answer', () => {
      const [q11, q12] = component.filteredQuesData[0].questionnaires;
      q11.answer = 'Yes';
      component.processFilteredQuestionnaires(q11);
      q12.answer = 'June';
      q11.answer = 'No';
      component.processFilteredQuestionnaires(q11);
      expect(q12.enabledQues).toEqual([]);
      expect(q12.answer).toBeNull();
    });

    it('clearing the parent answer should hide the child', () => {
      const [q11, q12] = component.filteredQuesData[0].questionnaires;
      q11.answer = 'Yes';
      component.processFilteredQuestionnaires(q11);
      q11.answer = null;
      component.processFilteredQuestionnaires(q11);
      expect(q12.enabledQues).toEqual([]);
    });

    it('multiple-choice parents should reveal children when any option matches', () => {
      const [q11, q12] = component.filteredQuesData[0].questionnaires;
      q11.answerType = 'Multiple';
      q11.answer = ['No', 'Yes'];
      component.processFilteredQuestionnaires(q11);
      expect(q12.enabledQues).toEqual([11]);
      q11.answer = ['No'];
      component.processFilteredQuestionnaires(q11);
      expect(q12.enabledQues).toEqual([]);
      q11.answer = ['Yes'];
      component.processFilteredQuestionnaires(q11);
      q11.answer = null;
      component.processFilteredQuestionnaires(q11);
      expect(q12.enabledQues).toEqual([]);
    });

    it('isQuestionEnabled should mark questions without parents as visible', () => {
      expect(component.isQuestionEnabled({ parentQuestionId: [], parentAnswer: [] })).toEqual(['Parent Ques']);
      expect(component.isQuestionEnabled({ parentQuestionId: [1], parentAnswer: [{}] })).toEqual([]);
    });
  });

  describe('introductory calls', () => {
    function intro(questionsList: any[], ben: any) {
      anm.fetchBeneficiaryQuestionnaire.and.returnValue(of(questionsList));
      load({ ...ben, outboundCallType: 'Introductory' });
    }

    it('should drop HRNI questions for mothers', () => {
      intro([
        q({ sectionid: 1, callSectionRank: 1, questionid: 1, question: 'Is HRNI?', sectionQuestionRank: 1 }),
        q({ sectionid: 1, callSectionRank: 1, questionid: 2, question: 'Name ok?', sectionQuestionRank: 2 }),
      ], mother);
      expect(component.filteredQuesData[0].questionnaires.map((x: any) => x.questionid)).toEqual([2]);
    });

    it('should drop HRP questions for children', () => {
      intro([
        q({ sectionid: 1, callSectionRank: 1, questionid: 1, question: 'High risk pregnancy?', sectionQuestionRank: 1 }),
        q({ sectionid: 1, callSectionRank: 1, questionid: 2, question: 'Name ok?', sectionQuestionRank: 2 }),
      ], child);
      expect(component.filteredQuesData[0].questionnaires.map((x: any) => x.questionid)).toEqual([2]);
    });
  });

  describe('validation and stepping', () => {
    beforeEach(() => load());

    it('a step is invalid while a visible question is unanswered', () => {
      expect(component.isStepValid(0)).toBeFalse();
      component.filteredQuesData[0].questionnaires[0].answer = 'No';
      expect(component.isStepValid(0)).toBeTrue();
    });

    it('hidden and information items do not block a step', () => {
      component.filteredQuesData[0].questionnaires[0].answer = 'No';
      expect(component.filteredQuesData[0].questionnaires[1].enabledQues.length).toBe(0);
      expect(component.isStepValid(0)).toBeTrue();
    });

    it('goForward should block an invalid step and flag validation', () => {
      component.goForward(0);
      expect(component.validateAnswer).toBeTrue();
      expect(stepper.next).not.toHaveBeenCalled();
    });

    it('goForward should advance a valid step', () => {
      component.filteredQuesData[0].questionnaires[0].answer = 'No';
      component.goForward(0);
      expect(component.step).toBe(1);
      expect(stepper.next).toHaveBeenCalled();
      expect(component.validateAnswer).toBeFalse();
    });

    it('goForward should not move past the last step', () => {
      component.step = 1;
      component.filteredQuesData[1].questionnaires[0].answer = 'Yes';
      component.goForward(1);
      expect(component.step).toBe(1);
    });

    it('goBack should move back but not below zero', () => {
      component.goBack();
      expect(stepper.previous).not.toHaveBeenCalled();
      component.step = 1;
      component.goBack();
      expect(component.step).toBe(0);
      expect(stepper.previous).toHaveBeenCalled();
    });

    it('onStepSelected should prevent jumping steps by header click', () => {
      stepper.selectedIndex = 0;
      component.onStepSelected({ selectedIndex: 1 });
      expect(stepper.selectedIndex).toBe(0);
    });

    it('stepSelectionChange should track the current step', () => {
      component.stepSelectionChange({ selectedIndex: 1 } as any);
      expect(component.step).toBe(1);
    });
  });

  describe('step paging', () => {
    beforeEach(() => {
      create();
      component.totalSteps = 7;
    });

    it('paginatorNext/Back should move the visible window of 3 steps', () => {
      component.paginatorNext();
      expect(component.minStepAllowed).toBe(3);
      expect(component.maxStepAllowed).toBe(5);
      expect(component.step).toBe(3);
      component.paginatorNext();
      expect(component.minStepAllowed).toBe(4);
      expect(component.maxStepAllowed).toBe(6);
      component.paginatorBack();
      expect(component.minStepAllowed).toBe(3);
    });

    it('pageChangeLogic should turn the page when the step leaves the window', () => {
      component.changeMinMaxSteps(true);
      component.step = 3;
      component.pageChangeLogic(true);
      expect(component.page).toBe(1);
      component.step = 2;
      component.pageChangeLogic(false);
      expect(component.page).toBe(0);
    });
  });

  describe('saveQuestionnaire', () => {
    beforeEach(() => load());

    function answerAll() {
      const [q11, q12] = component.filteredQuesData[0].questionnaires;
      q11.answer = 'Yes';
      component.processFilteredQuestionnaires(q11);
      q12.answer = ['May', 'June'];
      component.filteredQuesData[1].questionnaires[0].answer = 'No';
    }

    it('should refuse to save an incomplete form', () => {
      component.saveQuestionnaire();
      expect(confirmation.openDialog).toHaveBeenCalledWith('pleaseFillAllTheQuestions', 'error');
      expect(anm.saveQuestionnaireResponse).not.toHaveBeenCalled();
    });

    it('should save answers (joining multi-answers), flag HRP and open call closure', () => {
      anm.saveQuestionnaireResponse.and.returnValue(of({ response: 'Saved' }));
      answerAll();
      component.saveQuestionnaire();
      const req = anm.saveQuestionnaireResponse.calls.mostRecent().args[0];
      expect(req).toEqual(jasmine.objectContaining({ obCallId: 55, motherId: 'M-1', ecdCallType: 'ANC1', benCallId: 900, psmId: 4, createdBy: 'agent1' }));
      expect(req.questionnaireResponse).toEqual([
        { sectionId: 1, questionId: 11, question: 'Is HRP?', answer: 'Yes' },
        { sectionId: 1, questionId: 12, question: 'Which month?', answer: 'May || June' },
        { sectionId: 2, questionId: 21, question: 'Delivered?', answer: 'No' },
      ]);
      expect(anm.isHighRiskPregnancy).toBeTrue();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Saved', 'success');
      expect(anm.fromComponent).toBe('ECD Questionnaire');
      expect(anm.setOpenComp).toHaveBeenCalledWith('Call Closure');
    });

    it('should show err.error when saving fails', () => {
      anm.saveQuestionnaireResponse.and.returnValue(throwError(() => ({ error: 'save failed' })));
      answerAll();
      component.saveQuestionnaire();
      expect(confirmation.openDialog).toHaveBeenCalledWith('save failed', 'error');
    });
  });

  describe('navigation and dialogs', () => {
    beforeEach(() => load());

    it('goToClosure should open call closure when confirmed', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      component.goToClosure();
      expect(anm.setOpenComp).toHaveBeenCalledWith('Call Closure');
    });

    it('goToClosure should stay when cancelled', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.goToClosure();
      expect(anm.setOpenComp).not.toHaveBeenCalled();
    });

    it('openBenHistory should open the call history', () => {
      component.openBenHistory();
      expect(anm.setOpenComp).toHaveBeenCalledWith('Beneficiary Call History');
      expect(anm.setBenHistoryComp).toHaveBeenCalledWith(true);
    });

    it('getHRPReasons should open the high-risk dialog for the beneficiary', () => {
      component.getHRPReasons();
      expect(dialog.open).toHaveBeenCalledWith(HighRiskReasonsComponent, { data: { motherId: 'M-1', childId: undefined } });
    });

    it('trackFieldInteraction should report to tracking', () => {
      component.trackFieldInteraction('answer');
      expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('answer', 'ECD Questionnaire');
    });
  });
});
