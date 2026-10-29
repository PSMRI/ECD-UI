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
import * as CryptoJS from 'crypto-js';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { SetPasswordComponent } from './set-password.component';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';

describe('SetPasswordComponent', () => {
  let component: SetPasswordComponent;
  let fixture: ComponentFixture<SetPasswordComponent>;
  let router: jasmine.SpyObj<Router>;
  let loginService: any;
  let confirmation: jasmine.SpyObj<ConfirmationService>;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    loginService = jasmine.createSpyObj('LoginserviceService', ['updatePassword', 'sessionLogout']);
    loginService.transactionId = 'tx-1';
    loginService.sessionLogout.and.returnValue(of({ statusCode: 200 }));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    spyOn(Storage.prototype, 'clear');

    await TestBed.configureTestingModule({
      declarations: [SetPasswordComponent],
      providers: [
        FormBuilder,
        { provide: Router, useValue: router },
        { provide: LoginserviceService, useValue: loginService },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: () => 'agent1' } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(SetPasswordComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and read the username from session', () => {
    expect(component).toBeTruthy();
    expect(component.uname).toBe('agent1');
  });

  describe('password pattern', () => {
    const valid = ['Passw0rd!', 'Abcdefg1@', 'A1!aaaaaaaaa'];
    const invalid = ['', 'Sh0rt!A', 'password1!', 'PASSWORD!!', 'Password1', 'Passw0rd!toolong', 'Pass word1!'];

    valid.forEach((p) =>
      it(`should accept "${p}"`, () => {
        component.setpasswordform.controls.newPassword.setValue(p);
        expect(component.setpasswordform.controls.newPassword.valid).toBeTrue();
      })
    );

    invalid.forEach((p) =>
      it(`should reject "${p}"`, () => {
        component.setpasswordform.controls.newPassword.setValue(p);
        expect(component.setpasswordform.controls.newPassword.valid).toBeFalse();
      })
    );
  });

  describe('updatePassword', () => {
    beforeEach(() => {
      component.setpasswordform.setValue({ newPassword: 'Passw0rd!', confirmPassword: 'Passw0rd!' });
    });

    it('should show mismatch and not call the API when passwords differ', () => {
      component.setpasswordform.controls.confirmPassword.setValue('Other0rd!');
      component.updatePassword();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Passwords mismatch', 'error');
      expect(loginService.updatePassword).not.toHaveBeenCalled();
    });

    it('should send an encrypted password with the transaction id', () => {
      loginService.updatePassword.and.returnValue(of({ statusCode: 200 }));
      component.updatePassword();
      const req = loginService.updatePassword.calls.mostRecent().args[0];
      expect(req.userName).toBe('agent1');
      expect(req.transactionId).toBe('tx-1');
      expect(req.password).not.toBe('Passw0rd!');

      const salt = req.password.substring(0, 64);
      const iv = req.password.substring(64, 96);
      const plain = CryptoJS.AES.decrypt(
        { ciphertext: CryptoJS.enc.Base64.parse(req.password.substring(96)) } as any,
        component.generateKey(salt, component.Key_IV),
        { iv: CryptoJS.enc.Hex.parse(iv) }
      ).toString(CryptoJS.enc.Utf8);
      expect(plain).toBe('Passw0rd!');
    });

    it('should show success, log out and redirect to login', () => {
      loginService.updatePassword.and.returnValue(of({ statusCode: 200 }));
      component.updatePassword();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Password changed successfully', 'success');
      expect(loginService.sessionLogout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(Storage.prototype.clear).toHaveBeenCalledTimes(2);
      expect(loginService.transactionId).toBeNull();
    });

    it('should show the error message on failure and clear the transaction id', () => {
      loginService.updatePassword.and.returnValue(of({ statusCode: 5000, errorMessage: 'Password reused' }));
      component.updatePassword();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Password reused', 'error');
      expect(loginService.sessionLogout).not.toHaveBeenCalled();
      expect(loginService.transactionId).toBeNull();
    });

    it('should only clear the transaction id for a null response', () => {
      loginService.updatePassword.and.returnValue(of(null));
      component.updatePassword();
      expect(confirmation.openDialog).not.toHaveBeenCalled();
      expect(loginService.transactionId).toBeNull();
    });
  });

  it('userLogout should not redirect when logout fails', () => {
    loginService.sessionLogout.and.returnValue(of({ statusCode: 5000 }));
    component.userLogout();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('keySize and iterationCount accessors should read and write', () => {
    component.keySize = 128;
    component.iterationCount = 5;
    expect(component.keySize).toBe(128);
    expect(component.iterationCount).toBe(5);
  });
});
