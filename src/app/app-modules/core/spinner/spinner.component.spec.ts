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

import { SpinnerComponent } from './spinner.component';
import { SpinnerService } from '../../services/spinnerService/spinner.service';

describe('SpinnerComponent', () => {
  let fixture: ComponentFixture<SpinnerComponent>;
  const spinner = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpinnerComponent],
      providers: [{ provide: SpinnerService, useValue: spinner }],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(SpinnerComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(SpinnerComponent);
  });

  it('exposes the spinner service to the template', () => {
    expect(fixture.componentInstance.spinnerService).toBe(spinner as any);
  });
});
