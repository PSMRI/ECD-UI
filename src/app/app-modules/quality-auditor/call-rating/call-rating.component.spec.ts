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
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { CallRatingComponent } from './call-rating.component';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { QualityAuditorService } from '../../services/quality-auditor/quality-auditor.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { CallAuditComponent } from '../call-audit/call-audit/call-audit.component';
import { ViewCasesheetComponent } from '../view-casesheet/view-casesheet.component';

describe('CallRatingComponent', () => {
  let component: CallRatingComponent;
  let fixture: ComponentFixture<CallRatingComponent>;
  let qaService: jasmine.SpyObj<QualityAuditorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let session: jasmine.SpyObj<SessionStorageService>;

  const lang = {
    issueInGettingBenCallRatings: 'issueInGettingBenCallRatings',
    noQuestionsMappedForRatingCall: 'noQuestionsMappedForRatingCall',
    successfullyCallRated: 'successfullyCallRated',
    issueInSavingBenCallRatings: 'issueInSavingBenCallRatings',
    pleaseFillAllQuestionsToProceedFurther: 'pleaseFillAllQuestionsToProceedFurther',
    successfullyCallRatingUpdated: 'successfullyCallRatingUpdated',
    issueInUpdatingBenCallRatings: 'issueInUpdatingBenCallRatings',
  };

  const sessionValues: { [k: string]: any } = {
    providerServiceMapID: 4,
    userID: 77,
    userName: 'auditor1',
  };

  const grades = [
    { grade: 'C', minValue: 0, maxValue: 4 },
    { grade: 'B', minValue: 5, maxValue: 7 },
    { grade: 'A', minValue: 8, maxValue: 10 },
  ];

  const yesNo = [
    { option: 'Yes', score: 5 },
    { option: 'No', score: 0 },
  ];

  function questions(): any[] {
    return [
      { sectionId: 2, sectionName: 'Closing', sectionRank: 2, questionId: 21, question: 'Q21', questionRank: 1, options: yesNo, isFatalQues: false },
      { sectionId: 1, sectionName: 'Opening', sectionRank: 1, questionId: 12, question: 'Q12', questionRank: 2, options: yesNo, isFatalQues: true },
      { sectionId: 1, sectionName: 'Opening', sectionRank: 1, questionId: 11, question: 'Q11', questionRank: 1, options: yesNo, isFatalQues: false, roles: ['ANM'] },
      { sectionId: 1, sectionName: 'Opening', sectionRank: 1, questionId: 13, question: 'Q13', questionRank: 3, options: yesNo, isFatalQues: false, roles: ['MO'] },
    ];
  }

  function inputData(type = 'callAudit') {
    return {
      type,
      data: {
        benCallID: 500,
        beneficiaryid: 600,
        roleName: 'ANM',
        agentid: 10,
        callId: 'call-1',
        outboundCallType: 'Introductory',
        paginator: { pageIndex: 1 },
        sort: { active: 'name' },
      },
    };
  }

  function setUp(data: any = inputData()) {
    fixture = TestBed.createComponent(CallRatingComponent);
    component = fixture.componentInstance;
    component.data = data;
  }

  beforeEach(async () => {
    qaService = jasmine.createSpyObj('QualityAuditorService', [
      'getQualityAuditGrades',
      'getQuesSecForCallRatings',
      'getBenCallRatings',
      'getCallRecording',
      'saveCallRatings',
      'updateCallRatings',
      'loadComponent',
    ]);
    qaService.getQualityAuditGrades.and.returnValue(of(grades));
    qaService.getQuesSecForCallRatings.and.returnValue(of(questions()));
    qaService.getCallRecording.and.returnValue(
      of({ statusCode: 200, data: { response: 'http://audio/file.wav' } })
    );
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    session = jasmine.createSpyObj('SessionStorageService', ['getItem']);
    session.getItem.and.callFake((k: string) => sessionValues[k]);

    await TestBed.configureTestingModule({
      declarations: [CallRatingComponent],
      providers: [
        FormBuilder,
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: QualityAuditorService, useValue: qaService },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: session },
        { provide: MatDialog, useValue: dialog },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CallRatingComponent, '')
      .compileComponents();

    setUp();
  });

  describe('ngOnInit (callAudit mode)', () => {
    beforeEach(() => fixture.detectChanges());

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load language, grades and routed data', () => {
      expect(component.currentLanguageSet).toBe(lang);
      expect(qaService.getQualityAuditGrades).toHaveBeenCalledWith(4);
      expect(component.grades).toEqual(grades);
      expect(component.benCallId).toBe(500);
      expect(component.beneficiaryId).toBe(600);
      expect(component.auditType).toBe('callAudit');
      expect(component.auiteeRole).toBe('ANM');
    });

    it('should fetch the call recording with agent and call id', () => {
      expect(qaService.getCallRecording).toHaveBeenCalledWith({ agentID: 10, callID: 'call-1' });
      expect(component.audioResponse).toBe('http://audio/file.wav');
    });

    it('should group role-filtered questions by section rank and sort by question rank', () => {
      expect(qaService.getBenCallRatings).not.toHaveBeenCalled();
      const fq = component.filteredRatingQuestions;
      expect(fq.map((s: any) => s.sectionName)).toEqual(['Opening', 'Closing']);
      // Q13 is MO-only and must be excluded for an ANM auditee
      expect(fq[0].questions.map((q: any) => q.questionId)).toEqual([11, 12]);
      expect(fq[1].questions.map((q: any) => q.questionId)).toEqual([21]);
    });
  });

  describe('ngOnInit service responses', () => {
    it('should keep default audio when recording response has no data', () => {
      qaService.getCallRecording.and.returnValue(of({ statusCode: 200, data: {} }));
      fixture.detectChanges();
      expect(component.audioResponse).toBe(' ');
    });

    it('should show an error dialog when fetching the recording fails', () => {
      qaService.getCallRecording.and.returnValue(throwError(() => ({ error: 'rec failed' })));
      fixture.detectChanges();
      expect(confirmation.openDialog).toHaveBeenCalledWith('rec failed', 'error');
    });

    it('should leave grades undefined when none are returned', () => {
      qaService.getQualityAuditGrades.and.returnValue(of([]));
      fixture.detectChanges();
      expect(component.grades).toBeUndefined();
    });

    it('should show an error dialog when fetching grades fails', () => {
      qaService.getQualityAuditGrades.and.returnValue(throwError(() => ({ error: 'grades failed' })));
      fixture.detectChanges();
      expect(confirmation.openDialog).toHaveBeenCalledWith('grades failed', 'error');
    });

    it('should show info dialog when no questions are mapped', () => {
      qaService.getQuesSecForCallRatings.and.returnValue(of([]));
      fixture.detectChanges();
      expect(component.ratingQuestions).toEqual([]);
      expect(confirmation.openDialog).toHaveBeenCalledWith('noQuestionsMappedForRatingCall', 'info');
    });

    it('should show err.error when fetching questions fails', () => {
      qaService.getQuesSecForCallRatings.and.returnValue(throwError(() => ({ error: 'q failed' })));
      fixture.detectChanges();
      expect(confirmation.openDialog).toHaveBeenCalledWith('q failed', 'error');
    });

    it('should show title + detail when fetching questions fails without err.error', () => {
      qaService.getQuesSecForCallRatings.and.returnValue(
        throwError(() => ({ title: 'Bad ', detail: 'request' }))
      );
      fixture.detectChanges();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Bad request', 'error');
    });

    it('should not set language when languageData is missing', () => {
      (TestBed.inject(SetLanguageService) as any).languageData = null;
      fixture.detectChanges();
      expect(component.currentLanguageSet).toBeUndefined();
      (TestBed.inject(SetLanguageService) as any).languageData = lang;
    });

    // Documents current behaviour: without @Input data, routedData stays
    // undefined and getCallRecording throws.
    it('getCallRecording should throw when no input data was provided (edge case)', () => {
      setUp(undefined);
      expect(component.routedData).toBeUndefined();
      expect(() => component.getCallRecording()).toThrowError(TypeError);
    });
  });

  describe('edit mode (getBenCallRatings)', () => {
    function ratedResponse() {
      return {
        qualityQuestionResponse: [
          { id: 1, sectionId: 1, sectionName: 'Opening', sectionRank: 1, questionId: 11, questionRank: 1, answer: 'Yes', roles: ['ANM'] },
          { id: 2, sectionId: 1, sectionName: 'Opening', sectionRank: 1, questionId: 12, questionRank: 2, answer: 'Yes' },
          { id: 3, sectionId: 2, sectionName: 'Closing', sectionRank: 2, questionId: 21, questionRank: 1, answer: 'No' },
        ],
        qualityRating: { id: 900, callRemarks: 'ok', finalScore: 10, finalGrade: 'A' },
      };
    }

    beforeEach(() => setUp(inputData('edit')));

    it('should load rated questions, map options and recalculate scores', () => {
      qaService.getBenCallRatings.and.returnValue(of(ratedResponse()));
      fixture.detectChanges();

      expect(qaService.getBenCallRatings).toHaveBeenCalledWith(500);
      expect(component.ratingId).toBe(900);
      expect(component.callRemarks).toBe('ok');
      expect(component.ratedQuestions[1].options).toEqual(yesNo);
      expect(component.ratedQuestions[1].isFatalQues).toBeTrue();
      expect(component.filteredRatingQuestions.length).toBe(2);
      expect(component.finalScore).toBe(10);
      expect(component.finalGrade).toBe('A');
      expect(component.finalScorePercentage).toBeCloseTo((10 / 15) * 100, 5);
    });

    it('should show an error when no ratings exist', () => {
      qaService.getBenCallRatings.and.returnValue(of({ qualityQuestionResponse: [] }));
      fixture.detectChanges();
      expect(component.ratedQuestions).toEqual([]);
      expect(confirmation.openDialog).toHaveBeenCalledWith('issueInGettingBenCallRatings', 'error');
    });

    it('should show err.error when fetching ratings fails', () => {
      qaService.getBenCallRatings.and.returnValue(throwError(() => ({ error: 'r failed' })));
      fixture.detectChanges();
      expect(confirmation.openDialog).toHaveBeenCalledWith('r failed', 'error');
    });

    it('should show title + detail when fetching ratings fails without err.error', () => {
      qaService.getBenCallRatings.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      fixture.detectChanges();
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });
  });

  describe('scoring', () => {
    beforeEach(() => fixture.detectChanges());

    function answer(sectionIdx: number, qIdx: number, value: string) {
      const section = component.filteredRatingQuestions[sectionIdx];
      const q = section.questions[qIdx];
      q.answer = value;
      component.calculateScore(q, section);
    }

    it('should total section and final scores, percentage and grade', () => {
      answer(0, 0, 'Yes');
      answer(0, 1, 'Yes');
      answer(1, 0, 'No');
      expect(component.filteredRatingQuestions[0].totalScore).toBe(10);
      expect(component.filteredRatingQuestions[1].totalScore).toBe(0);
      expect(component.finalScore).toBe(10);
      expect(component.finalScorePercentage).toBeCloseTo(66.667, 2);
      expect(component.finalGrade).toBe('A');
    });

    it('should assign a middle grade within range boundaries', () => {
      answer(0, 0, 'Yes');
      expect(component.finalScore).toBe(5);
      expect(component.finalGrade).toBe('B');
    });

    it('should make it a zero call when a fatal question is answered "No"', () => {
      answer(0, 0, 'Yes');
      answer(1, 0, 'Yes');
      answer(0, 1, 'No'); // Q12 is fatal
      expect(component.checkIfZeroCall()).toBeTrue();
      expect(component.finalScore).toBe(0);
      expect(component.finalScorePercentage).toBe(0);
      expect(component.finalGrade).toBe('C');
    });

    it('fatal check should be case-insensitive', () => {
      answer(0, 1, 'No');
      component.filteredRatingQuestions[0].questions[1].answer = 'NO';
      expect(component.checkIfZeroCall()).toBeTrue();
    });

    it('calculateFinalScorePercentage should be 0 when a fatal question is "no"', () => {
      component.finalScore = 10;
      component.filteredRatingQuestions[0].questions[1].answer = 'no';
      component.calculateFinalScorePercentage();
      expect(component.finalScorePercentage).toBe(0);
    });

    it('getFinalGrade should set null when score is outside all ranges', () => {
      component.finalScore = 99;
      component.getFinalGrade();
      expect(component.finalGrade).toBeNull();
    });

    it('calculateScore should throw when the answer matches no option (edge case)', () => {
      const section = component.filteredRatingQuestions[0];
      const q = section.questions[0];
      q.answer = 'Maybe';
      expect(() => component.calculateScore(q, section)).toThrowError(TypeError);
    });

    it('getFinalGrade should throw when grades were never loaded (edge case)', () => {
      component.grades = undefined;
      expect(() => component.getFinalGrade()).toThrowError(TypeError);
    });
  });

  describe('validation', () => {
    beforeEach(() => fixture.detectChanges());

    it('checkIfValidSubmit should be false while any question is unanswered', () => {
      component.filteredRatingQuestions[0].questions[0].answer = 'Yes';
      expect(component.checkIfValidSubmit()).toBeFalse();
    });

    it('checkIfValidSubmit should be true when all questions are answered', () => {
      component.filteredRatingQuestions.forEach((s: any) =>
        s.questions.forEach((q: any) => (q.answer = 'Yes'))
      );
      expect(component.checkIfValidSubmit()).toBeTrue();
    });

    it('checkIfValidSubmit should be true for an empty question list', () => {
      component.filteredRatingQuestions = [];
      expect(component.checkIfValidSubmit()).toBeTrue();
    });

    it('enableUpdate should enable the update button', () => {
      component.enableUpdate();
      expect(component.enableUpdateButton).toBeTrue();
    });
  });

  describe('saveRatings', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.filteredRatingQuestions.forEach((s: any) =>
        s.questions.forEach((q: any) => {
          q.answer = 'Yes';
          component.calculateScore(q, s);
        })
      );
    });

    it('should show info and not call the API when the form is incomplete', () => {
      component.filteredRatingQuestions[0].questions[0].answer = '';
      component.saveRatings();
      expect(qaService.saveCallRatings).not.toHaveBeenCalled();
      expect(confirmation.openDialog).toHaveBeenCalledWith('pleaseFillAllQuestionsToProceedFurther', 'info');
    });

    it('should build one request row per answered question', () => {
      qaService.saveCallRatings.and.returnValue(of({ response: 'ok' }));
      component.callRemarks = 'good call';
      component.saveRatings();

      const req = qaService.saveCallRatings.calls.mostRecent().args[0];
      expect(req.length).toBe(3);
      expect(req[0]).toEqual({
        sectionId: 1,
        questionId: 11,
        answer: 'Yes',
        score: 5,
        isZeroCall: false,
        finalScore: 15,
        finalGrade: null,
        callRemarks: 'good call',
        ecdCallType: 'Introductory',
        agentId: 10,
        benCallId: 500,
        qualityAuditorId: 77,
        createdBy: 'auditor1',
        psmId: 4,
      });
    });

    it('should send null remarks when none were entered', () => {
      qaService.saveCallRatings.and.returnValue(of({ response: 'ok' }));
      component.saveRatings();
      expect(qaService.saveCallRatings.calls.mostRecent().args[0][0].callRemarks).toBeNull();
    });

    it('should show success and navigate back to the call audit list', () => {
      qaService.saveCallRatings.and.returnValue(of({ response: 'ok' }));
      component.saveRatings();
      expect(confirmation.openDialog).toHaveBeenCalledWith('successfullyCallRated', 'success');
      expect(qaService.loadComponent).toHaveBeenCalledWith(CallAuditComponent, {
        data: { paginator: { pageIndex: 1 }, sort: { active: 'name' } },
      });
      expect(qaService.showForm).toBeFalse();
    });

    it('should show the API error message on a non-200 status', () => {
      qaService.saveCallRatings.and.returnValue(of({ statusCode: 5000, errorMessage: 'Duplicate' }));
      component.saveRatings();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Duplicate', 'error');
      expect(qaService.loadComponent).not.toHaveBeenCalled();
    });

    it('should show a generic error on 200 without a response', () => {
      qaService.saveCallRatings.and.returnValue(of({ statusCode: 200 }));
      component.saveRatings();
      expect(confirmation.openDialog).toHaveBeenCalledWith('issueInSavingBenCallRatings', 'error');
    });

    it('should show err.error when the API fails', () => {
      qaService.saveCallRatings.and.returnValue(throwError(() => ({ error: 'save failed' })));
      component.saveRatings();
      expect(confirmation.openDialog).toHaveBeenCalledWith('save failed', 'error');
    });

    it('should show title + detail when the API fails without err.error', () => {
      qaService.saveCallRatings.and.returnValue(throwError(() => ({ title: 'E:', detail: 'x' })));
      component.saveRatings();
      expect(confirmation.openDialog).toHaveBeenCalledWith('E:x', 'error');
    });
  });

  describe('updateRatings', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.ratingId = 900;
      component.filteredRatingQuestions.forEach((s: any) =>
        s.questions.forEach((q: any, i: number) => {
          q.id = 100 + i;
          q.answer = 'Yes';
          component.calculateScore(q, s);
        })
      );
    });

    it('should send question responses and the rating header', () => {
      qaService.updateCallRatings.and.returnValue(of({ response: 'ok' }));
      component.callRemarks = 'edited';
      component.updateRatings();

      const req = qaService.updateCallRatings.calls.mostRecent().args[0];
      expect(req.qualityQuestionResponse.length).toBe(3);
      expect(req.qualityQuestionResponse[0]).toEqual(jasmine.objectContaining({
        id: 100, sectionId: 1, questionId: 11, answer: 'Yes', score: 5,
        deleted: false, modifiedBy: 'auditor1', psmId: 4,
      }));
      expect(req.qualityRating).toEqual(jasmine.objectContaining({
        id: 900, finalScore: 15, isZeroCall: false, callRemarks: 'edited',
        agentId: 10, benCallId: 500, qualityAuditorId: 77, deleted: false,
      }));
    });

    it('should skip unanswered questions', () => {
      qaService.updateCallRatings.and.returnValue(of({ response: 'ok' }));
      component.filteredRatingQuestions[0].questions[0].answer = '';
      component.updateRatings();
      expect(qaService.updateCallRatings.calls.mostRecent().args[0].qualityQuestionResponse.length).toBe(2);
    });

    it('should show success and navigate back', () => {
      qaService.updateCallRatings.and.returnValue(of({ response: 'ok' }));
      component.updateRatings();
      expect(confirmation.openDialog).toHaveBeenCalledWith('successfullyCallRatingUpdated', 'success');
      expect(qaService.loadComponent).toHaveBeenCalled();
    });

    it('should show the API error message on a non-200 status', () => {
      qaService.updateCallRatings.and.returnValue(of({ statusCode: 5000, errorMessage: 'Bad' }));
      component.updateRatings();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Bad', 'error');
    });

    it('should show a generic error on 200 without a response', () => {
      qaService.updateCallRatings.and.returnValue(of({ statusCode: 200 }));
      component.updateRatings();
      expect(confirmation.openDialog).toHaveBeenCalledWith('issueInUpdatingBenCallRatings', 'error');
    });

    it('should show err.error when the API fails', () => {
      qaService.updateCallRatings.and.returnValue(throwError(() => ({ error: 'upd failed' })));
      component.updateRatings();
      expect(confirmation.openDialog).toHaveBeenCalledWith('upd failed', 'error');
    });

    it('should show title + detail when the API fails without err.error', () => {
      qaService.updateCallRatings.and.returnValue(throwError(() => ({ title: 'A', detail: 'B' })));
      component.updateRatings();
      expect(confirmation.openDialog).toHaveBeenCalledWith('AB', 'error');
    });
  });

  describe('navigation and dialogs', () => {
    beforeEach(() => fixture.detectChanges());

    it('backToQualityAudit should reload the call audit list with paging state', () => {
      component.backToQualityAudit();
      expect(qaService.loadComponent).toHaveBeenCalledWith(CallAuditComponent, {
        data: { paginator: { pageIndex: 1 }, sort: { active: 'name' } },
      });
      expect(qaService.showForm).toBeFalse();
    });

    it('viewCasheet should open the case sheet dialog for the beneficiary', () => {
      component.viewCasheet();
      expect(dialog.open).toHaveBeenCalledWith(ViewCasesheetComponent, {
        width: '900px',
        disableClose: true,
        data: { benCallId: 500, beneficiaryId: 600 },
      });
    });
  });

  describe('filterQuestions', () => {
    it('should build one section per unique section name with blank answers', () => {
      fixture.detectChanges();
      component.sections = [];
      component.filterQuestions();
      expect(component.sections.map((s: any) => s.sectionName)).toEqual(['Closing', 'Opening']);
      expect(component.sections[1].questions.length).toBe(3);
      expect(component.sections[1].questions[0]).toEqual({ questionId: 12, question: 'Q12', answer: '', score: null });
    });
  });
});
