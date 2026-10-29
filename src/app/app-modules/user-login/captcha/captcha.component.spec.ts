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
import { environment } from 'src/environments/environment';
import { CaptchaComponent } from './captcha.component';
import { CaptchaService } from '../../services/captcha-service/captcha.service';

describe('CaptchaComponent', () => {
  let component: CaptchaComponent;
  let fixture: ComponentFixture<CaptchaComponent>;
  let captchaService: jasmine.SpyObj<CaptchaService>;
  let turnstile: any;

  beforeEach(async () => {
    captchaService = jasmine.createSpyObj('CaptchaService', ['loadScript']);
    captchaService.loadScript.and.returnValue(Promise.resolve());
    turnstile = jasmine.createSpyObj('turnstile', ['render', 'reset', 'remove']);
    turnstile.render.and.returnValue('widget-1');
    (window as any).turnstile = turnstile;

    await TestBed.configureTestingModule({
      declarations: [CaptchaComponent],
      providers: [{ provide: CaptchaService, useValue: captchaService }],
    })
      .overrideTemplate(CaptchaComponent, '<div #captchaContainer></div>')
      .compileComponents();

    fixture = TestBed.createComponent(CaptchaComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    delete (window as any).turnstile;
  });

  it('should load the script and render the widget with the site key', async () => {
    fixture.detectChanges();
    await component.ngAfterViewInit();
    expect(captchaService.loadScript).toHaveBeenCalled();
    expect(turnstile.render).toHaveBeenCalledTimes(1);
    const [el, opts] = turnstile.render.calls.mostRecent().args;
    expect(el).toBe(component.captchaRef.nativeElement);
    expect(opts.sitekey).toBe(environment.siteKey);
    expect(opts.theme).toBe('light');
  });

  it('should emit the token when the widget resolves', async () => {
    let token: string | undefined;
    component.tokenResolved.subscribe((t) => (token = t));
    fixture.detectChanges();
    await component.ngAfterViewInit();
    turnstile.render.calls.mostRecent().args[1].callback('tok-123');
    expect(token).toBe('tok-123');
  });

  it('should not render twice', async () => {
    fixture.detectChanges();
    await component.ngAfterViewInit();
    await component.ngAfterViewInit();
    expect(turnstile.render).toHaveBeenCalledTimes(1);
  });

  it('should not render when the container element is missing', async () => {
    (component as any).captchaRef = undefined;
    await component.ngAfterViewInit();
    expect(turnstile.render).not.toHaveBeenCalled();
  });

  it('should swallow script load failures', async () => {
    captchaService.loadScript.and.returnValue(Promise.reject(new Error('blocked')));
    await expectAsync(component.ngAfterViewInit()).toBeResolved();
    expect(turnstile.render).not.toHaveBeenCalled();
  });

  it('reset should reset the rendered widget', async () => {
    fixture.detectChanges();
    await component.ngAfterViewInit();
    component.reset();
    expect(turnstile.reset).toHaveBeenCalledWith('widget-1');
  });

  it('reset should do nothing before the widget is rendered', () => {
    component.reset();
    expect(turnstile.reset).not.toHaveBeenCalled();
  });

  it('ngOnDestroy should remove the rendered widget', async () => {
    fixture.detectChanges();
    await component.ngAfterViewInit();
    component.ngOnDestroy();
    expect(turnstile.remove).toHaveBeenCalledWith('widget-1');
  });

  it('ngOnDestroy should not fail when turnstile is unavailable', async () => {
    fixture.detectChanges();
    await component.ngAfterViewInit();
    delete (window as any).turnstile;
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
