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

import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { CaptchaService } from './captcha.service';

describe('CaptchaService', () => {
  let service: CaptchaService;
  let appended: HTMLScriptElement[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaptchaService);
    appended = [];
    spyOn(document.head, 'appendChild').and.callFake(<T extends Node>(node: T): T => {
      appended.push(node as any);
      return node;
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loadScript should append an async/defer script with the captcha url', () => {
    service.loadScript();
    expect(appended.length).toBe(1);
    const script = appended[0];
    expect(script.tagName).toBe('SCRIPT');
    expect(script.getAttribute('src')).toBe(environment.captchaChallengeURL);
    expect(script.async).toBeTrue();
    expect(script.defer).toBeTrue();
  });

  it('loadScript should resolve on load and not append again on later calls', async () => {
    const p = service.loadScript();
    (appended[0].onload as any)();
    await expectAsync(p).toBeResolved();

    await expectAsync(service.loadScript()).toBeResolved();
    expect(appended.length).toBe(1);
  });

  it('loadScript should reject on error and allow a retry', async () => {
    const p = service.loadScript();
    (appended[0].onerror as any)('network');
    await expectAsync(p).toBeRejectedWithError(/Failed to load CAPTCHA script/);

    service.loadScript();
    expect(appended.length).toBe(2);
  });
});
