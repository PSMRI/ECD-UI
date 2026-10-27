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


import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { environment } from 'src/environments/environment';

import { HeaderComponent } from './header.component';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { CoreService } from '../../services/core/core.service';
import { CtiService } from '../../services/cti/cti.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { QualityAuditorService } from '../../services/quality-auditor/quality-auditor.service';
import { AuthService } from '../../services/auth.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let store: Record<string, any>;
  let login: any;
  let core: jasmine.SpyObj<CoreService>;
  let cti: jasmine.SpyObj<CtiService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let router: jasmine.SpyObj<Router>;
  let auth: jasmine.SpyObj<AuthService>;
  let cookies: jasmine.SpyObj<CookieService>;
  let langService: any;
  let qa: any;
  let roleFlag$: BehaviorSubject<boolean>;
  const lang = {
    youAreNotAllowedToLogOutCloseTheCall: 'onCall',
    areYouSureYouWantToNavigateTo: 'Navigate to',
    anyUnsavedDataWillBeLost: '?',
  };
  const ROLES = JSON.stringify([{ RoleName: 'Supervisor', RoleID: 1 }, { RoleName: 'Associate', RoleID: 2 }]);

  beforeEach(async () => {
    store = { userName: 'agent1', userRoles: ROLES };
    roleFlag$ = new BehaviorSubject<boolean>(false);
    login = {
      agentId: 1001,
      enableRoleFlag$: roleFlag$.asObservable(),
      getLanguages: jasmine.createSpy('getLanguages').and.returnValue(
        of({ data: [{ languageName: 'Hindi' }, { languageName: 'English' }] }),
      ),
      sessionLogout: jasmine.createSpy('sessionLogout').and.returnValue(of({ statusCode: 200 })),
    };
    core = jasmine.createSpyObj('CoreService', ['onRoleChange']);
    cti = jasmine.createSpyObj('CtiService', ['agentCtiLogout']);
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    auth = jasmine.createSpyObj('AuthService', ['getUserDetails']);
    cookies = jasmine.createSpyObj('CookieService', ['set']);
    langService = { languageData: lang, getLanguageData: jasmine.createSpy().and.returnValue(of({ en: 1 })) };
    qa = { callAuditData: { x: 1 } };
    spyOn(sessionStorage, 'getItem').and.returnValue('true');
    spyOn(sessionStorage, 'clear');
    spyOn(localStorage, 'clear');

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        FormBuilder,
        { provide: LoginserviceService, useValue: login },
        { provide: CoreService, useValue: core },
        { provide: Router, useValue: router },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SetLanguageService, useValue: langService },
        { provide: CtiService, useValue: cti },
        { provide: QualityAuditorService, useValue: qa },
        { provide: CookieService, useValue: cookies },
        {
          provide: SessionStorageService,
          useValue: { getItem: (k: string) => (k in store ? store[k] : null), setItem: (k: string, v: any) => (store[k] = v) },
        },
        { provide: AuthService, useValue: auth },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(HeaderComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('reads authentication, user, language and sorted roles', () => {
    fixture.detectChanges();
    expect(component.agentId).toBe(1001);
    expect(component.isAuthenticated).toBeTrue();
    expect(component.userName).toBe('agent1');
    expect(component.currentLanguageSet).toBe(lang);
    expect(component.roles.map((r: any) => r.RoleName)).toEqual(['Associate', 'Supervisor']);
    expect(component.roleSelected).toBeFalse();
  });

  it('loads roles and languages once the role flag is enabled', fakeAsync(() => {
    fixture.detectChanges();
    roleFlag$.next(true);
    tick(1000);
    expect(component.languages.map((l: any) => l.languageName)).toEqual(['English', 'Hindi']);
    expect(component.selectedLanguage).toBe('English');
  }));

  it('loads English when no language is cached', () => {
    langService.languageData = null;
    component.getSelectedLanguage();
    expect(langService.getLanguageData).toHaveBeenCalledWith('English');
    expect(component.languageData).toEqual({ en: 1 });
  });

  it('ngOnChanges re-reads the roles', () => {
    component.ngOnChanges();
    expect(component.roles.length).toBe(2);
  });

  describe('role selection', () => {
    it('selects the stored role when not on a call', () => {
      store['role'] = 'Supervisor';
      store['onCall'] = 'false';
      fixture.detectChanges();
      expect(component.headersForm.value.selectRole).toBe('Supervisor');
      expect(component.roleSelected).toBeTrue();
    });

    it('locks role selection during a call', () => {
      store['onCall'] = 'true';
      component.roleSelection('Supervisor');
      expect(component.roleSelected).toBeFalse();
    });

    it('treats a missing session flag as unauthenticated', () => {
      (sessionStorage.getItem as jasmine.Spy).and.returnValue(null);
      fixture.detectChanges();
      expect(component.isAuthenticated).toBeFalse();
    });
  });

  describe('changeRole', () => {
    beforeEach(() => fixture.detectChanges());

    it('switches role after confirmation', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      component.changeRole('Associate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Navigate to Associate ?', 'confirm');
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(store['role']).toBe('Associate');
      expect(store['roleId']).toBe(2);
      expect(core.onRoleChange).toHaveBeenCalledWith(true);
    });

    it('stays when declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.changeRole('Associate');
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    beforeEach(() => fixture.detectChanges());

    it('is blocked during a call', () => {
      store['onCall'] = 'true';
      component.logout();
      expect(confirmation.openDialog).toHaveBeenCalledWith('onCall', 'info');
      expect(cti.agentCtiLogout).not.toHaveBeenCalled();
    });

    it('logs out of CTI and the session, then opens feedback', () => {
      cti.agentCtiLogout.and.returnValue(of({}));
      component.logout();
      expect(cti.agentCtiLogout).toHaveBeenCalledWith({ agent_id: 1001 });
      expect(router.navigate).toHaveBeenCalledWith(['/feedback'], { queryParams: { sl: 'ECD' } });
      expect(localStorage.clear).toHaveBeenCalled();
      expect(sessionStorage.clear).toHaveBeenCalled();
      expect(qa.callAuditData).toBeUndefined();
    });

    it('still logs out when CTI logout fails', () => {
      cti.agentCtiLogout.and.returnValue(throwError(() => 'down'));
      component.logout();
      expect(login.sessionLogout).toHaveBeenCalled();
    });

    it('stays when the session logout fails', () => {
      login.sessionLogout.and.returnValue(of({ statusCode: 5000 }));
      component.logOutUser();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('refreshLogin', () => {
    it('stores the refreshed login details', () => {
      auth.getUserDetails.and.returnValue(
        of({ statusCode: '200', key: 'k', userID: 9, userName: 'agent1', data: { previlegeObj: [{}], Jwttoken: 'jwt' } }) as any,
      );
      component.refreshLogin();
      expect(cookies.set).toHaveBeenCalledWith('Jwttoken', 'jwt');
      expect(JSON.parse(store['loginDataResponse'])).toEqual({ previlegeObj: [{}] });
      expect(store['key']).toBe('k');
      expect(store['userID']).toBe(9);
      expect(store['username']).toBe('agent1');
    });

    it('warns about another active session', () => {
      auth.getUserDetails.and.returnValue(of({ statusCode: '200', data: {} }) as any);
      component.refreshLogin();
      expect(confirmation.openDialog).toHaveBeenCalledWith(
        'Seems you are logged in from somewhere else, Logout from there & try back in.',
        'error',
      );
    });
  });

  it('showLicense opens the license page', () => {
    const open = spyOn(window, 'open');
    component.showLicense();
    expect(open).toHaveBeenCalledWith(environment.licenseUrl);
  });
});
