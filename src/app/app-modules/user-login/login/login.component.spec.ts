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
import * as CryptoJS from 'crypto-js';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { LoginComponent } from './login.component';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { CtiService } from '../../services/cti/cti.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: any;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let loginService: any;
  let cti: jasmine.SpyObj<CtiService>;
  let session: jasmine.SpyObj<SessionStorageService>;
  let tracking: jasmine.SpyObj<AmritTrackingService>;
  let browserStore: { [k: string]: string };

  const lang = {
    seemsYouAreLoggedIn: 'seemsYouAreLoggedIn',
    userDoesNotHavePrivilege: 'userDoesNotHavePrivilege',
  };
  const ALREADY_LOGGED_IN =
    'You are already logged in,please confirm to logout from other device and login again';

  function loginData(overrides: any = {}) {
    return {
      userID: 7,
      userName: 'agent1',
      key: 'auth-key',
      loginIPAddress: '10.0.0.1',
      isAuthenticated: true,
      Status: 'Active',
      providerServiceMapID: 99,
      previlegeObj: [
        {
          serviceName: 'ECD',
          agentID: 'A-1',
          apimanClientKey: 'apikey',
          providerServiceMapID: 4,
          roles: [
            {
              roleName: 'ANM',
              serviceRoleScreenMappings: [
                {
                  providerServiceMapping: {
                    m_ServiceMaster: { serviceID: 11 },
                    serviceProviderID: 22,
                    ctiCampaignName: 'ECD_CAMPAIGN',
                  },
                },
              ],
            },
          ],
        },
      ],
      ...overrides,
    };
  }

  function fillForm(user = 'agent1', pass = 'Secret@1') {
    component.loginForm.setValue({ userName: user, password: pass });
  }

  beforeEach(async () => {
    browserStore = {};
    spyOn(Storage.prototype, 'getItem').and.callFake((k: string) => browserStore[k] ?? null);
    spyOn(Storage.prototype, 'setItem').and.callFake((k: string, v: string) => (browserStore[k] = String(v)));
    spyOn(Storage.prototype, 'clear').and.callFake(() => (browserStore = {}));

    router = jasmine.createSpyObj('Router', ['navigate']);
    router.url = '/login';
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    loginService = jasmine.createSpyObj('LoginserviceService', [
      'validateLogin',
      'userLogoutPreviousSession',
      'setEnableRole',
    ]);
    cti = jasmine.createSpyObj('CtiService', ['getCTILoginToken']);
    cti.getCTILoginToken.and.returnValue(of({ data: { login_key: 'cti-key' } }));
    session = jasmine.createSpyObj('SessionStorageService', ['setItem']);
    tracking = jasmine.createSpyObj('AmritTrackingService', ['setUserId']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        FormBuilder,
        { provide: Router, useValue: router },
        { provide: SetLanguageService, useValue: { getLanguageData: () => of(lang) } },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: LoginserviceService, useValue: loginService },
        { provide: CtiService, useValue: cti },
        { provide: SessionStorageService, useValue: session },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(LoginComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    component.enableCaptcha = false;
  });

  afterEach(() => {
    document.body.classList.remove('test');
    document.body.classList.remove('dark-theme');
  });

  describe('ngOnInit / ngOnDestroy', () => {
    it('should create, load language and add the login body class on /login', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
      expect(component.currentLanguageSet).toEqual(lang);
      expect(document.body.classList.contains('test')).toBeTrue();
    });

    it('should not add the body class on other routes', () => {
      router.url = '/other';
      fixture.detectChanges();
      expect(document.body.classList.contains('test')).toBeFalse();
    });

    it('should redirect to role selection when already authenticated', () => {
      browserStore['isAuthenticated'] = 'true';
      fixture.detectChanges();
      expect(router.navigate).toHaveBeenCalledWith(['/role-selection']);
      expect(document.body.classList.contains('test')).toBeFalse();
    });

    it('ngOnDestroy should remove the body class', () => {
      fixture.detectChanges();
      component.ngOnDestroy();
      expect(document.body.classList.contains('test')).toBeFalse();
    });
  });

  describe('login button state', () => {
    beforeEach(() => fixture.detectChanges());

    it('should be disabled while the form is empty', () => {
      expect(component.isLoginDisabled).toBeTrue();
    });

    it('should be disabled when only the username is entered', () => {
      component.loginForm.controls.userName.setValue('agent1');
      expect(component.isLoginDisabled).toBeTrue();
    });

    it('should be enabled when the form is valid and captcha is off', () => {
      fillForm();
      expect(component.isLoginDisabled).toBeFalse();
    });

    it('should stay disabled with captcha on until a token is resolved', () => {
      component.enableCaptcha = true;
      fillForm();
      expect(component.isLoginDisabled).toBeTrue();
      component.onCaptchaResolved('cap-token');
      expect(component.captchaToken).toBe('cap-token');
      expect(component.isLoginDisabled).toBeFalse();
    });
  });

  describe('encryption', () => {
    it('encrypt should return salt(64 hex) + iv(32 hex) + base64 ciphertext that decrypts back', () => {
      const out = component.encrypt(component.Key_IV, 'Secret@1');
      const salt = out.substring(0, 64);
      const iv = out.substring(64, 96);
      const cipher = out.substring(96);
      expect(salt).toMatch(/^[0-9a-f]{64}$/);
      expect(iv).toMatch(/^[0-9a-f]{32}$/);

      const key = component.generateKey(salt, component.Key_IV);
      const plain = CryptoJS.AES.decrypt(
        { ciphertext: CryptoJS.enc.Base64.parse(cipher) } as any,
        key,
        { iv: CryptoJS.enc.Hex.parse(iv) }
      ).toString(CryptoJS.enc.Utf8);
      expect(plain).toBe('Secret@1');
    });

    it('encrypt should produce different output for the same input (random salt/iv)', () => {
      expect(component.encrypt('k', 'p')).not.toBe(component.encrypt('k', 'p'));
    });

    it('keySize and iterationCount accessors should read and write', () => {
      expect(component.keySize).toBe(256);
      expect(component.iterationCount).toBe(1989);
      component.keySize = 128;
      component.iterationCount = 10;
      expect(component.keySize).toBe(128);
      expect(component.iterationCount).toBe(10);
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      fixture.detectChanges();
      fillForm();
    });

    it('should send an encrypted password, never the plain one', () => {
      loginService.validateLogin.and.returnValue(of({ statusCode: 200, data: loginData() }));
      component.onSubmit();
      const req = loginService.validateLogin.calls.mostRecent().args[0];
      expect(req.userName).toBe('agent1');
      expect(req.password).not.toBe('Secret@1');
      expect(req.doLogout).toBeFalse();
      expect(req.withCredentials).toBeTrue();
      expect('captchaToken' in req).toBeFalse();
    });

    it('should include the captcha token when captcha is enabled', () => {
      component.enableCaptcha = true;
      component.captchaToken = 'cap';
      loginService.validateLogin.and.returnValue(of({ statusCode: 200, data: loginData() }));
      component.onSubmit();
      expect(loginService.validateLogin.calls.mostRecent().args[0].captchaToken).toBe('cap');
    });

    it('should store session details and go to role selection for an Active ECD user', () => {
      loginService.validateLogin.and.returnValue(of({ statusCode: 200, data: loginData() }));
      component.onSubmit();

      expect(loginService.currentServiceId).toBe(11);
      expect(loginService.agentId).toBe('A-1');
      expect(loginService.serviceProviderId).toBe(22);
      expect(loginService.campaignName).toBe('ECD_CAMPAIGN');
      expect(loginService.userId).toBe(7);
      expect(browserStore['authenticationToken']).toBe('auth-key');
      expect(browserStore['isAuthenticated']).toBe('true');
      expect(session.setItem).toHaveBeenCalledWith('providerServiceMapID', 4);
      expect(session.setItem).toHaveBeenCalledWith('userID', 7);
      expect(tracking.setUserId).toHaveBeenCalledWith(7);
      expect(loginService.setEnableRole).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/role-selection']);
      expect(cti.getCTILoginToken).toHaveBeenCalled();
      expect(loginService.loginKey).toBe('cti-key');
    });

    it('should not set loginKey when CTI returns no data', () => {
      cti.getCTILoginToken.and.returnValue(of({}));
      loginService.validateLogin.and.returnValue(of({ statusCode: 200, data: loginData() }));
      component.onSubmit();
      expect(loginService.loginKey).toBeUndefined();
    });

    it('should show an error when the CTI token call fails', () => {
      cti.getCTILoginToken.and.returnValue(throwError(() => ({ error: 'cti down' })));
      loginService.validateLogin.and.returnValue(of({ statusCode: 200, data: loginData() }));
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('cti down', 'error');
      expect(router.navigate).toHaveBeenCalledWith(['/role-selection']);
    });

    it('should show title + detail when the CTI call fails without err.error', () => {
      cti.getCTILoginToken.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      loginService.validateLogin.and.returnValue(of({ statusCode: 200, data: loginData() }));
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });

    it('should route a New user to set security questions', () => {
      loginService.validateLogin.and.returnValue(of({ statusCode: 200, data: loginData({ Status: 'New' }) }));
      component.onSubmit();
      expect(router.navigate).toHaveBeenCalledWith(['/set-security-questions']);
      expect(browserStore['userID']).toBe('7');
      expect(session.setItem).toHaveBeenCalledWith('providerServiceMapID', 22);
      expect(cti.getCTILoginToken).not.toHaveBeenCalled();
    });

    it('should not navigate for an authenticated user with another status', () => {
      loginService.validateLogin.and.returnValue(of({ statusCode: 200, data: loginData({ Status: 'Locked' }) }));
      component.onSubmit();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should show no-privilege error for a user without ECD service', () => {
      const data = loginData();
      data.previlegeObj[0].serviceName = '104';
      loginService.validateLogin.and.returnValue(of({ statusCode: 200, data }));
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('userDoesNotHavePrivilege', 'error');
      expect(session.setItem).toHaveBeenCalledWith('providerServiceMapID', 99);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    // Documents current behaviour: entries without serviceName are filtered out,
    // but service details are still read from previlegeObj[0], which then throws.
    it('should throw when the first privilege entry is not the ECD one (edge case)', () => {
      const data = loginData();
      data.previlegeObj.unshift({ serviceName: null } as any);
      expect(() => component.getServiceAuthenticationDetails(data, 'enc')).toThrowError(TypeError);
    });

    it('should show the error message for 200 with missing privileges', () => {
      loginService.validateLogin.and.returnValue(
        of({ statusCode: 200, data: { previlegeObj: null }, errorMessage: 'No privileges' })
      );
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('No privileges', 'error');
    });

    it('should clear session and show error for other 5002 responses', () => {
      browserStore['x'] = '1';
      loginService.validateLogin.and.returnValue(of({ statusCode: 5002, errorMessage: 'Session expired' }));
      component.onSubmit();
      expect(browserStore).toEqual({});
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(confirmation.openDialog).toHaveBeenCalledWith('Session expired', 'error');
    });

    it('should show the error message for invalid credentials', () => {
      loginService.validateLogin.and.returnValue(of({ statusCode: 5000, errorMessage: 'Invalid username or password' }));
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Invalid username or password', 'error');
    });

    it('should show err.error when the login API fails', () => {
      loginService.validateLogin.and.returnValue(throwError(() => ({ error: 'server down' })));
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('server down', 'error');
    });

    it('should show title + detail when the login API fails without err.error', () => {
      loginService.validateLogin.and.returnValue(throwError(() => ({ title: 'Net', detail: 'Err' })));
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('NetErr', 'error');
    });

    it('should reset the captcha after a failed login when captcha is enabled', () => {
      component.enableCaptcha = true;
      component.captchaToken = 'cap';
      const captcha = jasmine.createSpyObj('CaptchaComponent', ['reset']);
      component.captchaCmp = captcha;
      loginService.validateLogin.and.returnValue(of({ statusCode: 5000, errorMessage: 'bad' }));
      component.onSubmit();
      expect(captcha.reset).toHaveBeenCalled();
      expect(component.captchaToken).toBe('');
      expect(component.isLoginDisabled).toBeTrue();
    });
  });

  describe('already logged in elsewhere', () => {
    function alreadyLoggedIn(confirm: boolean) {
      loginService.validateLogin.and.returnValue(of({ statusCode: 5002, errorMessage: ALREADY_LOGGED_IN }));
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(confirm) } as any);
    }

    beforeEach(() => {
      fixture.detectChanges();
      fillForm();
    });

    it('should ask for confirmation and do nothing when declined', () => {
      alreadyLoggedIn(false);
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith(ALREADY_LOGGED_IN, 'confirm');
      expect(loginService.userLogoutPreviousSession).not.toHaveBeenCalled();
    });

    it('should log out the previous session and log in again with doLogout', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      loginService.userLogoutPreviousSession.and.returnValue(of({ statusCode: 200 }));
      loginService.validateLogin.and.returnValue(of({ statusCode: 200, data: loginData() }));
      component.userLogOutPreviousSession({ errorMessage: ALREADY_LOGGED_IN });

      expect(confirmation.openDialog).toHaveBeenCalledWith(ALREADY_LOGGED_IN, 'confirm');
      expect(loginService.userLogoutPreviousSession).toHaveBeenCalledWith('agent1');
      const req = loginService.validateLogin.calls.mostRecent().args[0];
      expect(req.doLogout).toBeTrue();
      expect(req.password).not.toBe('Secret@1');
      expect(session.setItem).toHaveBeenCalledWith('loginDataResponse', jasmine.any(String));
      expect(tracking.setUserId).toHaveBeenCalledWith(7);
      expect(router.navigate).toHaveBeenCalledWith(['/role-selection']);
    });

    it('should show seemsYouAreLoggedIn when re-login has no privileges', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      loginService.userLogoutPreviousSession.and.returnValue(of({ statusCode: 200 }));
      loginService.validateLogin.and.returnValue(of({ statusCode: 200, data: { previlegeObj: [] } }));
      component.userLogOutPreviousSession({ errorMessage: ALREADY_LOGGED_IN });
      expect(confirmation.openDialog).toHaveBeenCalledWith('seemsYouAreLoggedIn', 'error');
    });

    it('should show the re-login error message on failure', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      loginService.userLogoutPreviousSession.and.returnValue(of({ statusCode: 200 }));
      loginService.validateLogin.and.returnValue(of({ statusCode: 5000, errorMessage: 'relogin failed' }));
      component.userLogOutPreviousSession({ errorMessage: ALREADY_LOGGED_IN });
      expect(confirmation.openDialog).toHaveBeenCalledWith('relogin failed', 'error');
    });

    it('should show the logout error message when previous-session logout fails', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      loginService.userLogoutPreviousSession.and.returnValue(of({ statusCode: 5000, errorMessage: 'logout failed' }));
      component.userLogOutPreviousSession({ errorMessage: ALREADY_LOGGED_IN });
      expect(confirmation.openDialog).toHaveBeenCalledWith('logout failed', 'error');
      expect(loginService.validateLogin).not.toHaveBeenCalled();
    });
  });

  describe('UI helpers', () => {
    it('openForgotPassword should navigate to forgot password', () => {
      component.openForgotPassword();
      expect(router.navigate).toHaveBeenCalledWith(['/forgot-password']);
    });

    it('toggleDarkTheme should toggle the body class', () => {
      component.toggleDarkTheme();
      expect(document.body.classList.contains('dark-theme')).toBeTrue();
      component.toggleDarkTheme();
      expect(document.body.classList.contains('dark-theme')).toBeFalse();
    });

    it('should block paste, copy, cut and right click', () => {
      ['blockPaste', 'blockCopy', 'blockCut', 'disableRightClick'].forEach((fn) => {
        const ev = jasmine.createSpyObj('Event', ['preventDefault']);
        (component as any)[fn](ev);
        expect(ev.preventDefault).toHaveBeenCalled();
      });
    });

    it('resetCaptcha should do nothing when captcha is disabled', () => {
      const captcha = jasmine.createSpyObj('CaptchaComponent', ['reset']);
      component.captchaCmp = captcha;
      component.enableCaptcha = false;
      component.resetCaptcha();
      expect(captcha.reset).not.toHaveBeenCalled();
    });

    it('resetCaptcha should do nothing when the captcha component is missing', () => {
      component.enableCaptcha = true;
      component.captchaToken = 'keep';
      component.captchaCmp = undefined;
      component.resetCaptcha();
      expect(component.captchaToken).toBe('keep');
    });
  });
});
