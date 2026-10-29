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
import { DomSanitizer } from '@angular/platform-browser';
import { CzentrixIframeComponent } from './czentrix-iframe.component';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';
import { CtiService } from '../../services/cti/cti.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';

describe('CzentrixIframeComponent', () => {
  let component: CzentrixIframeComponent;
  let fixture: ComponentFixture<CzentrixIframeComponent>;
  let sanitizer: DomSanitizer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CzentrixIframeComponent],
      providers: [
        { provide: AssociateAnmMoService, useValue: {} },
        { provide: CtiService, useValue: { ctiUrl: 'http://cti/', eventCtiUrl: 'events?agent=' } },
        { provide: LoginserviceService, useValue: { agentId: 'A-1' } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CzentrixIframeComponent, '')
      .compileComponents();

    sanitizer = TestBed.inject(DomSanitizer);
    spyOn(sanitizer, 'bypassSecurityTrustResourceUrl').and.callThrough();
    fixture = TestBed.createComponent(CzentrixIframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should build the trusted CTI event url for the agent', () => {
    expect(component).toBeTruthy();
    expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('http://cti/events?agent=A-1');
    expect(component.ctiHandlerURL).toBeTruthy();
  });

  it('toggleBar should flip and minimizeBar should collapse the bar', () => {
    expect(component.barMinimized).toBeTrue();
    component.toggleBar();
    expect(component.barMinimized).toBeFalse();
    component.minimizeBar();
    expect(component.barMinimized).toBeTrue();
    component.toggleBar();
    component.toggleBar();
    expect(component.barMinimized).toBeTrue();
  });
});
