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
import { of, throwError } from 'rxjs';

import { ForgotPasswordComponent } from './forgot-password.component';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let router: any;
  let loginService: any;
  let confirmation: jasmine.SpyObj<ConfirmationService>;

  const questions = [
    { questionId: 1, question: 'Pet name?' },
    { questionId: 2, question: 'Birth city?' },
  ];

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    router.url = '/forgot-password';
    loginService = jasmine.createSpyObj('LoginserviceService', ['validateUserName', 'validateAnswers']);
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);

    await TestBed.configureTestingModule({
      declarations: [ForgotPasswordComponent],
      providers: [
        FormBuilder,
        { provide: Router, useValue: router },
        { provide: LoginserviceService, useValue: loginService },
        { provide: ConfirmationService, useValue: confirmation },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(ForgotPasswordComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => document.body.classList.remove('test'));

  describe('init', () => {
    it('should create the form and add the body class on /forgot-password', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
      expect(component.forgotpasswordform.contains('userName')).toBeTrue();
      expect(document.body.classList.contains('test')).toBeTrue();
    });

    it('should not add the body class on other routes', () => {
      router.url = '/x';
      fixture.detectChanges();
      expect(document.body.classList.contains('test')).toBeFalse();
    });

    it('ngOnDestroy should remove the body class', () => {
      fixture.detectChanges();
      component.ngOnDestroy();
      expect(document.body.classList.contains('test')).toBeFalse();
    });
  });

  describe('username validation', () => {
    beforeEach(() => fixture.detectChanges());

    it('should require a username of at least 2 characters', () => {
      const c = component.forgotpasswordform.controls['userName'];
      expect(c.valid).toBeFalse();
      c.setValue('a');
      expect(c.hasError('minlength')).toBeTrue();
      c.setValue('ab');
      expect(c.valid).toBeTrue();
    });

    it('should load questions and add one answer control per question', () => {
      component.forgotpasswordform.controls['userName'].setValue('agent1');
      loginService.validateUserName.and.returnValue(
        of({ statusCode: 200, data: { SecurityQuesAns: questions } })
      );
      component.validateUsernameAndGetQuestions();
      expect(loginService.validateUserName).toHaveBeenCalledWith({ userName: 'agent1' });
      expect(component.securityQues).toEqual(questions);
      expect(component.forgotpasswordform.contains('answer0')).toBeTrue();
      expect(component.forgotpasswordform.contains('answer1')).toBeTrue();
      expect(component.showQuestions).toBeTrue();
      expect(component.forgotpasswordform.valid).toBeFalse();
    });

    it('should tell the user when no questions are set', () => {
      loginService.validateUserName.and.returnValue(of({ statusCode: 200, data: { SecurityQuesAns: [] } }));
      component.validateUsernameAndGetQuestions();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Questions are not set for the user', 'info');
      expect(component.showQuestions).toBeFalse();
    });

    it('should show the error message for an unknown user', () => {
      loginService.validateUserName.and.returnValue(of({ statusCode: 5000, errorMessage: 'User not found' }));
      component.validateUsernameAndGetQuestions();
      expect(confirmation.openDialog).toHaveBeenCalledWith('User not found', 'error');
    });

    it('should do nothing for a null response', () => {
      loginService.validateUserName.and.returnValue(of(null));
      component.validateUsernameAndGetQuestions();
      expect(confirmation.openDialog).not.toHaveBeenCalled();
    });

    it('should show err.error when the API fails', () => {
      loginService.validateUserName.and.returnValue(throwError(() => ({ error: 'down' })));
      component.validateUsernameAndGetQuestions();
      expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    });
  });

  describe('answer validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.forgotpasswordform.controls['userName'].setValue('agent1');
      loginService.validateUserName.and.returnValue(of({ statusCode: 200, data: { SecurityQuesAns: questions } }));
      component.validateUsernameAndGetQuestions();
      component.forgotpasswordform.get('answer0')?.setValue('Tommy');
    });

    it('should send all answers (blank for unanswered) and go to set-password on success', () => {
      loginService.validateAnswers.and.returnValue(of({ statusCode: 200, data: { transactionId: 'tx-1' } }));
      component.validateSecurityAnswers();
      expect(loginService.validateAnswers).toHaveBeenCalledWith({
        SecurityQuesAns: [
          { questionId: 1, answer: 'Tommy' },
          { questionId: 2, answer: '' },
        ],
        userName: 'agent1',
      });
      expect(loginService.transactionId).toBe('tx-1');
      expect(router.navigate).toHaveBeenCalledWith(['/set-password']);
    });

    it('should show the error message when data is missing', () => {
      loginService.validateAnswers.and.returnValue(of({ statusCode: 200, data: null, errorMessage: 'No tx' }));
      component.validateSecurityAnswers();
      expect(confirmation.openDialog).toHaveBeenCalledWith('No tx', 'error');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should show the error message for wrong answers', () => {
      loginService.validateAnswers.and.returnValue(of({ statusCode: 5000, errorMessage: 'Wrong answers' }));
      component.validateSecurityAnswers();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Wrong answers', 'error');
    });
  });

  describe('helpers', () => {
    it('splitQuestionAndQuestionID should split and show the first question', () => {
      component.securityQues = questions;
      component.splitQuestionAndQuestionID();
      expect(component.questions).toEqual(['Pet name?', 'Birth city?']);
      expect(component.questionId).toEqual([1, 2]);
      expect(component.bufferQuestion).toBe('Pet name?');
      expect(component.bufferQuestionId).toBe(1);
    });

    it('backToLogin and routeToSetPassword should navigate', () => {
      component.backToLogin();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      component.routeToSetPassword();
      expect(router.navigate).toHaveBeenCalledWith(['/set-password']);
    });
  });
});
