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
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { SetSecurityQuestionsComponent } from './set-security-questions.component';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';

describe('SetSecurityQuestionsComponent', () => {
  let component: SetSecurityQuestionsComponent;
  let fixture: ComponentFixture<SetSecurityQuestionsComponent>;
  let router: jasmine.SpyObj<Router>;
  let loginService: any;
  let confirmation: jasmine.SpyObj<ConfirmationService>;

  const questions = [
    { QuestionID: 1, Question: 'Pet?' },
    { QuestionID: 2, Question: 'City?' },
    { QuestionID: 3, Question: 'School?' },
    { QuestionID: 4, Question: 'Food?' },
  ];

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    loginService = jasmine.createSpyObj('LoginserviceService', ['getData', 'saveSecurityQuesAns']);
    loginService.getData.and.returnValue(of({ statusCode: 200, data: questions }));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    spyOn(Storage.prototype, 'getItem').and.callFake((k: string) => (k === 'userID' ? '7' : null));

    await TestBed.configureTestingModule({
      declarations: [SetSecurityQuestionsComponent],
      providers: [
        FormBuilder,
        { provide: Router, useValue: router },
        { provide: LoginserviceService, useValue: loginService },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: () => 'agent1' } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(SetSecurityQuestionsComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SetSecurityQuestionsComponent);
    component = fixture.componentInstance;
  });

  it('should create and load security questions', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.questions).toEqual(questions);
    expect(component.filteredQuestions).toEqual(questions);
    expect(component.uname).toBe('agent1');
  });

  it('should keep an empty question list for a failed response', () => {
    loginService.getData.and.returnValue(of({ statusCode: 5000, data: null }));
    fixture.detectChanges();
    expect(component.questions).toEqual([]);
  });

  describe('question filtering', () => {
    beforeEach(() => fixture.detectChanges());

    it('should remove already-chosen questions from later dropdowns', () => {
      component.questionSelected1(1);
      expect(component.filteredQuestions.map((q) => q.QuestionID)).toEqual([2, 3, 4]);
      component.questionSelected2(2);
      expect(component.filteredQuestions2.map((q) => q.QuestionID)).toEqual([3, 4]);
      component.questionSelected3(3);
      expect(component.filteredQuestions3.map((q) => q.QuestionID)).toEqual([4]);
    });

    it('re-selecting question 1 should reset dropdowns 2 and 3', () => {
      component.questionSelected1(1);
      component.questionSelected2(2);
      component.questionSelected1(4);
      expect(component.filteredQuestions2.map((q) => q.QuestionID)).toEqual([1, 2, 3]);
      expect(component.filteredQuestions3.map((q) => q.QuestionID)).toEqual([1, 2, 3]);
    });
  });

  describe('form validation', () => {
    beforeEach(() => fixture.detectChanges());

    it('question form should be invalid until all questions and answers are filled', () => {
      expect(component.questionForm.valid).toBeFalse();
      component.questionForm.setValue({
        question1: '1', answer1: 'a', question2: '2', answer2: 'b', question3: '3', answer3: 'c',
      });
      expect(component.questionForm.valid).toBeTrue();
    });

    it('password form should enforce the password pattern', () => {
      component.setpasswordform.controls.newPassword.setValue('weak');
      expect(component.setpasswordform.controls.newPassword.valid).toBeFalse();
      component.setpasswordform.controls.newPassword.setValue('Passw0rd!');
      expect(component.setpasswordform.controls.newPassword.valid).toBeTrue();
    });
  });

  describe('setSecurityQuestions', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.questionForm.setValue({
        question1: '1', answer1: '  Tommy ', question2: '2', answer2: 'Pune', question3: '3', answer3: 'DPS',
      });
    });

    it('should build trimmed answers for the session user and navigate on success', () => {
      loginService.saveSecurityQuesAns.and.returnValue(of({ statusCode: 200, data: { transactionId: 'tx-9' } }));
      component.setSecurityQuestions();

      const payload = loginService.saveSecurityQuesAns.calls.mostRecent().args[0];
      expect(payload.length).toBe(3);
      expect(payload[0]).toEqual({
        userID: '7', questionID: '1', answers: 'Tommy', mobileNumber: '1234567890', createdBy: 'agent1',
      });
      expect(loginService.transactionId).toBe('tx-9');
      expect(router.navigate).toHaveBeenCalledWith(['/set-password']);
    });

    it('should send empty strings for null answers', () => {
      component.questionForm.controls.answer2.setValue(null);
      loginService.saveSecurityQuesAns.and.returnValue(of({ statusCode: 200, data: null }));
      component.setSecurityQuestions();
      expect(loginService.saveSecurityQuesAns.calls.mostRecent().args[0][1].answers).toBe('');
    });

    it('should not navigate when success has no data', () => {
      loginService.saveSecurityQuesAns.and.returnValue(of({ statusCode: 200, data: null }));
      component.setSecurityQuestions();
      expect(router.navigate).not.toHaveBeenCalled();
      expect(confirmation.openDialog).not.toHaveBeenCalled();
    });

    it('should show the error message on failure', () => {
      loginService.saveSecurityQuesAns.and.returnValue(of({ statusCode: 5000, errorMessage: 'Save failed' }));
      component.setSecurityQuestions();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Save failed', 'error');
    });
  });
});
