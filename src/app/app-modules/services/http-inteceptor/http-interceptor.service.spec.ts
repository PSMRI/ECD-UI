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

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHandler,
  HttpHeaders,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { HttpInterceptorService } from './http-interceptor.service';
import { SpinnerService } from '../spinnerService/spinner.service';
import { ConfirmationService } from '../confirmation/confirmation.service';
import { SetLanguageService } from '../set-language/set-language.service';

describe('HttpInterceptorService', () => {
  let service: HttpInterceptorService;
  let spinner: jasmine.SpyObj<SpinnerService>;
  let router: jasmine.SpyObj<Router>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let http: jasmine.SpyObj<HttpClient>;
  let sessionstorage: jasmine.SpyObj<SessionStorageService>;
  let storage: { [k: string]: string | null };

  const TIMER_MS = 27 * 60 * 1000;

  function handlerReturning(obs: any) {
    const next = jasmine.createSpyObj<HttpHandler>('HttpHandler', ['handle']);
    next.handle.and.returnValue(obs);
    return next;
  }

  beforeEach(() => {
    spinner = jasmine.createSpyObj('SpinnerService', ['setLoading']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    http = jasmine.createSpyObj('HttpClient', ['post']);
    sessionstorage = jasmine.createSpyObj('SessionStorageService', ['clear']);

    storage = {};
    spyOn(Storage.prototype, 'getItem').and.callFake((k: string) => storage[k] ?? null);
    spyOn(Storage.prototype, 'clear');

    TestBed.configureTestingModule({
      providers: [
        HttpInterceptorService,
        { provide: SpinnerService, useValue: spinner },
        { provide: Router, useValue: router },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: HttpClient, useValue: http },
        { provide: SessionStorageService, useValue: sessionstorage },
        { provide: SetLanguageService, useValue: {} },
      ],
    });
    service = TestBed.inject(HttpInterceptorService);
  });

  afterEach(() => {
    clearTimeout(service.timerRef);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('request headers', () => {
    it('should set Authorization from sessionStorage token', () => {
      storage['authenticationToken'] = 'tok-123';
      const next = handlerReturning(of());
      service.intercept(new HttpRequest('GET', '/api/x'), next).subscribe();
      const sent = next.handle.calls.mostRecent().args[0];
      expect(sent.headers.get('Authorization')).toBe('tok-123');
    });

    it('should set an empty Authorization header when no token exists', () => {
      const next = handlerReturning(of());
      service.intercept(new HttpRequest('GET', '/api/x'), next).subscribe();
      const sent = next.handle.calls.mostRecent().args[0];
      expect(sent.headers.get('Authorization')).toBe('');
    });

    it('should strip Authorization and force JSON content type for platform-feedback urls', () => {
      storage['authenticationToken'] = 'tok-123';
      const req = new HttpRequest('POST', '/common-api/Platform-Feedback/save', {}, {
        headers: new HttpHeaders({ Authorization: 'old' }),
      });
      const next = handlerReturning(of());
      service.intercept(req, next).subscribe();
      const sent = next.handle.calls.mostRecent().args[0];
      expect(sent.headers.has('Authorization')).toBeFalse();
      expect(sent.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('successful responses', () => {
    it('should toggle the spinner and start the session timer', () => {
      const next = handlerReturning(of(new HttpResponse({ body: { statusCode: 200 } })));
      let result: any;
      service.intercept(new HttpRequest('GET', '/api/x'), next).subscribe((r) => (result = r));
      expect(spinner.setLoading).toHaveBeenCalledWith(true);
      expect(spinner.setLoading).toHaveBeenCalledWith(false);
      expect(result.body).toEqual({ statusCode: 200 });
      expect(service.timerRef).toBeDefined();
    });

    it('should not turn the spinner on for cti/getAgentState polling', () => {
      const next = handlerReturning(of(new HttpResponse({ body: { statusCode: 200 } })));
      service.intercept(new HttpRequest('GET', '/cti/getAgentState'), next).subscribe();
      expect(spinner.setLoading).not.toHaveBeenCalledWith(true);
      expect(spinner.setLoading).toHaveBeenCalledWith(false);
    });

    it('should log out on statusCode 5002 for non-authentication urls', fakeAsync(() => {
      const body = { statusCode: 5002, errorMessage: 'Session expired' };
      const next = handlerReturning(of(new HttpResponse({ body })));
      service.intercept(new HttpRequest('GET', '/api/x'), next).subscribe();
      tick(0);
      expect(Storage.prototype.clear).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(confirmation.openDialog).toHaveBeenCalledWith('Session expired', 'error');
    }));

    it('should NOT log out on statusCode 5002 for user/userAuthenticate', fakeAsync(() => {
      const body = { statusCode: 5002, errorMessage: 'bad login' };
      const next = handlerReturning(of(new HttpResponse({ body })));
      service.intercept(new HttpRequest('POST', '/user/userAuthenticate', {}), next).subscribe();
      tick(0);
      expect(router.navigate).not.toHaveBeenCalled();
      expect(confirmation.openDialog).not.toHaveBeenCalled();
      clearTimeout(service.timerRef);
    }));

    it('should pass through non-response events without side effects', () => {
      const next = handlerReturning(of({ type: 0 } as any));
      service.intercept(new HttpRequest('GET', '/api/x'), next).subscribe();
      expect(spinner.setLoading).toHaveBeenCalledWith(true);
      expect(spinner.setLoading).not.toHaveBeenCalledWith(false);
    });

    // Documents current behaviour: a null response body makes onSuccess
    // throw, which is then handled as a generic error and logs the user out.
    it('should treat a null response body as an error and redirect to login (edge case)', () => {
      const next = handlerReturning(of(new HttpResponse({ body: null })));
      let errored = false;
      service.intercept(new HttpRequest('GET', '/api/x'), next).subscribe({
        error: () => (errored = true),
      });
      expect(errored).toBeTrue();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('error responses', () => {
    function fail(status: number, url = '/api/x', message?: string) {
      const err = new HttpErrorResponse({ status, url, error: { msg: 'e' + status } });
      if (message !== undefined) {
        Object.defineProperty(err, 'message', { value: message });
      }
      const next = handlerReturning(throwError(() => err));
      let caught: any;
      service.intercept(new HttpRequest('GET', url), next).subscribe({
        error: (e) => (caught = e),
      });
      return caught;
    }

    it('401 should clear session, show session-expired and redirect', () => {
      const caught = fail(401);
      expect(sessionstorage.clear).toHaveBeenCalled();
      expect(confirmation.openDialog).toHaveBeenCalledWith(
        'Session expired, Please login again to continue',
        'error'
      );
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(spinner.setLoading).toHaveBeenCalledWith(false);
      expect(caught).toEqual({ msg: 'e401' });
    });

    it('403 should show access denied', () => {
      fail(403);
      expect(confirmation.openDialog).toHaveBeenCalledWith('Access denied', 'error');
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('500 should show internal server error', () => {
      fail(500);
      expect(confirmation.openDialog).toHaveBeenCalledWith('Internal server error', 'error');
    });

    it('other statuses should show the error message', () => {
      fail(0, '/api/x', 'Http failure response');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Http failure response', 'error');
      expect(Storage.prototype.clear).toHaveBeenCalled();
    });

    it('other statuses with no message should fall back to a generic message', () => {
      fail(418, '/api/x', '');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Something went wrong', 'error');
    });

    it('404 on a silent api should rethrow without dialog or redirect', () => {
      const caught = fail(404, '/api/getCSatScoreByPSMIdAndFrequency/1');
      expect(confirmation.openDialog).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
      expect(caught.status).toBe(404);
    });

    it('404 on a normal api should show a dialog and redirect', () => {
      fail(404, '/api/other');
      expect(confirmation.openDialog).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('session timeout timer', () => {
    function dialogClosingWith(result: any) {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(result) } as any);
    }

    beforeEach(() => {
      service.currentLanguageSet = { sessionExpired: 'Session expired' };
    });

    it('should not prompt when the user is not authenticated', fakeAsync(() => {
      service.startTimer();
      tick(TIMER_MS);
      expect(confirmation.openDialog).not.toHaveBeenCalled();
    }));

    it('should extend the session when the user chooses continue', fakeAsync(() => {
      storage['authenticationToken'] = 't';
      storage['isAuthenticated'] = 'true';
      http.post.and.returnValue(of({}));
      dialogClosingWith({ action: 'continue' });

      service.startTimer();
      tick(TIMER_MS);

      expect(confirmation.openDialog).toHaveBeenCalledWith(
        'Your session is about to Expire. Do you need more time ? ',
        'sessionTimeOut'
      );
      expect(http.post).toHaveBeenCalledWith(environment.extendSessionUrl, {});
      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should swallow errors when extending the session fails', fakeAsync(() => {
      storage['authenticationToken'] = 't';
      storage['isAuthenticated'] = 'true';
      http.post.and.returnValue(throwError(() => new Error('down')));
      dialogClosingWith({ action: 'continue' });

      service.startTimer();
      expect(() => tick(TIMER_MS)).not.toThrow();
      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should log out immediately on timeout', fakeAsync(() => {
      storage['authenticationToken'] = 't';
      storage['isAuthenticated'] = 'true';
      dialogClosingWith({ action: 'timeout' });

      service.startTimer();
      tick(TIMER_MS);

      expect(Storage.prototype.clear).toHaveBeenCalled();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Session expired', 'error');
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('should log out after the remaining time on cancel', fakeAsync(() => {
      storage['authenticationToken'] = 't';
      storage['isAuthenticated'] = 'true';
      dialogClosingWith({ action: 'cancel', remainingTime: 30 });

      service.startTimer();
      tick(TIMER_MS);
      expect(router.navigate).not.toHaveBeenCalled();

      tick(30 * 1000);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('a new successful response should reset the pending timer', fakeAsync(() => {
      storage['authenticationToken'] = 't';
      storage['isAuthenticated'] = 'true';
      dialogClosingWith({ action: 'other' });
      const ok = () => handlerReturning(of(new HttpResponse({ body: { statusCode: 200 } })));

      service.intercept(new HttpRequest('GET', '/a'), ok()).subscribe();
      tick(TIMER_MS - 1000);
      service.intercept(new HttpRequest('GET', '/b'), ok()).subscribe();
      tick(1000);
      expect(confirmation.openDialog).not.toHaveBeenCalled();

      tick(TIMER_MS);
      expect(confirmation.openDialog).toHaveBeenCalledTimes(1);
    }));
  });
});
