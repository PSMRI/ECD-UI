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
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { EditCallConfigurationComponent } from './edit-call-configuration.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { CallConfigurationComponent } from '../call-configuration/call-configuration.component';

describe('EditCallConfigurationComponent', () => {
  let component: EditCallConfigurationComponent;
  let fixture: ComponentFixture<EditCallConfigurationComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let langService: any;
  let tracking: jasmine.SpyObj<AmritTrackingService>;

  const lang = {
    issueInGeneratingCallTypes: 'issueInGeneratingCallTypes',
    callConfigurationUpdatedSuccessfully: 'callConfigurationUpdatedSuccessfully',
    pleaseFillAllTheValuesToProceedFurther: 'pleaseFillAllTheValuesToProceedFurther',
  };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };
  const END = '2025-12-31T00:00:00.000Z';

  function config(overrides: any = {}) {
    const base = { configTerms: 'days', effectiveStartDate: '2025-01-01T00:00:00.000Z', effectiveEndDate: END, noOfAttempts: 2, nextAttemptPeriod: 3 };
    return {
      ancCalls: 2,
      pncCalls: 1,
      lastEndDate: END,
      data: {
        configId: 77,
        configurations: [
          { ...base, callType: 'Introductory', callConfigId: 1, configId: 77, displayName: 'Intro', baseLine: null, termRange: null },
          { ...base, callType: 'ECD1', callConfigId: 2, configId: 77, displayName: 'ANC 1', baseLine: 'LMP', termRange: '30' },
          { ...base, callType: 'ECD2', callConfigId: 3, configId: 77, displayName: 'ANC 2', baseLine: 'LMP', termRange: '60' },
          { ...base, callType: 'ECD3', callConfigId: 4, configId: 77, displayName: 'PNC 1', baseLine: 'DOB', termRange: '7' },
        ],
      },
      ...overrides,
    };
  }

  function create(data: any = config()) {
    fixture = TestBed.createComponent(EditCallConfigurationComponent);
    component = fixture.componentInstance;
    component.data = data;
    fixture.detectChanges();
  }

  function f() {
    return component.editcallconfigurationform.controls;
  }

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', ['updateCallConfiguration', 'createComponent']);
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    langService = { languageData: lang, getLanguageData: jasmine.createSpy().and.returnValue(of({ en: 1 })) };
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [EditCallConfigurationComponent],
      providers: [
        FormBuilder,
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: ActivatedRoute, useValue: {} },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SetLanguageService, useValue: langService },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: SupervisorService, useValue: supervisor },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(EditCallConfigurationComponent, '')
      .compileComponents();
  });

  describe('init', () => {
    it('should patch the form from the selected configuration', () => {
      create();
      expect(component).toBeTruthy();
      expect(f().noOfEcdCalls.value as any).toBe(4);
      expect(f().noOfAncCalls.value as any).toBe(2);
      expect(f().noOfPncCalls.value as any).toBe(1);
      expect(f().configTerms.value as any).toBe('days');
      expect(f().noOfAttempts.value as any).toBe(2);
      expect(f().nextCallAttempt.value as any).toBe(3);
      expect(component.minDate).toBe('2025-01-01T00:00:00.000Z');
    });

    it('should build intro, ANC (LMP) and PNC (DOB) rows filled from saved config', () => {
      create();
      expect(component.introCallData[0]).toEqual(jasmine.objectContaining({ callType: 'Introductory', displayName: 'Intro', callConfigId: 1 }));
      expect(component.ancCallData.map((r: any) => [r.callType, r.displayName, r.termRange])).toEqual([
        ['ECD1', 'ANC 1', '30'],
        ['ECD2', 'ANC 2', '60'],
      ]);
      expect(component.pncCallData.map((r: any) => [r.callType, r.baseLine, r.termRange])).toEqual([['ECD3', 'DOB', '7']]);
      expect(component.displayCallTypes).toBeTrue();
    });

    it('should leave rows blank when no saved config matches', () => {
      const data: any = config();
      data.data.configurations = [data.data.configurations[0]];
      create(data);
      expect(component.ancCallData[0].displayName).toBe('');
      expect(component.ancCallData[0].baseLine).toBe('LMP');
    });

    it('should allow editing the date range for the latest configuration', () => {
      create();
      expect(component.enableDateRange).toBeTrue();
      expect(component.disabledStartDate).toBeTrue();
      expect(component.startDate).toBe('2025-01-01T00:00:00.000Z');
    });

    it('should lock the date range for older configurations', () => {
      create(config({ lastEndDate: '2026-06-30T00:00:00.000Z' }));
      expect(component.enableDateRange).toBeFalse();
      expect(component.disabledStartDate).toBeTrue();
    });

    it('should skip patching when call counts are missing', () => {
      create(config({ ancCalls: null, lastEndDate: null }));
      expect(component.displayCallTypes).toBeFalse();
      expect(f().noOfAncCalls.value).toBe('');
    });

    it('should do nothing without input data', () => {
      create(null);
      expect(component.displayCallTypes).toBeFalse();
      expect(component.minDate).toBe('');
    });

    it('should load English when no language data is set', () => {
      langService.languageData = null;
      create();
      expect(langService.getLanguageData).toHaveBeenCalledWith('English');
    });
  });

  describe('addCallTypes', () => {
    it('should report an error when counts are null', () => {
      create(null);
      f().noOfAncCalls.setValue(null);
      component.addCallTypes();
      expect(confirmation.openDialog).toHaveBeenCalledWith('issueInGeneratingCallTypes', 'error');
    });
  });

  describe('validators', () => {
    beforeEach(() => create());

    it('checkIfValidAttempts should reject empty and negative values', () => {
      expect(component.checkIfValidAttempts(new FormControl(''))).toEqual({ invalidAttempts: true });
      expect(component.checkIfValidAttempts(new FormControl(null))).toEqual({ invalidAttempts: true });
      expect(component.checkIfValidAttempts(new FormControl(-1))).toEqual({ invalidAttempts: true });
      expect(component.checkIfValidAttempts(new FormControl(0))).toBeNull();
      expect(component.checkIfValidAttempts(new FormControl(3))).toBeNull();
    });

    it('validateDateRange should flag a start date different from the original', () => {
      component.startDate = new Date(Date.UTC(2025, 0, 1, 12)).toISOString();
      f().startDate.setValue(new Date(Date.UTC(2025, 0, 1, 12)) as any);
      component.validateDateRange();
      expect(component.showStartDateValidation).toBeFalse();
      f().startDate.setValue(new Date(Date.UTC(2025, 0, 5, 12)) as any);
      component.validateDateRange();
      expect(component.showStartDateValidation).toBeTrue();
    });
  });

  describe('term range validation', () => {
    beforeEach(() => create());

    it('should accept increasing ANC term ranges', () => {
      component.onTermRangeChangeForAnc(component.ancCallData[1]);
      expect(component.ancCallData.every((r: any) => r.rowErrorMessage === '')).toBeTrue();
      expect(component.disableUpdate).toBeFalse();
      expect(component.editcallconfigurationform.dirty).toBeTrue();
    });

    it('should flag a range not greater than the previous row', () => {
      component.ancCallData[1].termRange = '20';
      component.onTermRangeChangeForAnc(component.ancCallData[1]);
      expect(component.ancCallData[0].rowErrorMessage).toBe('Term range should be less than next term range');
      expect(component.ancCallData[1].rowErrorMessage).toBe('Term range should be greater than previous term range');
      expect(component.disableUpdate).toBeTrue();
    });

    it('should cap days at 1000 and months at 32', () => {
      component.ancCallData[1].termRange = '1000';
      component.onTermRangeChangeForAnc(component.ancCallData[1]);
      expect(component.ancCallData[1].rowErrorMessage).toBe('Term range cannot exceed the 1000 days');
      f().configTerms.setValue('months');
      component.ancCallData[1].termRange = '32';
      component.onTermRangeChangeForAnc(component.ancCallData[1]);
      expect(component.ancCallData[1].rowErrorMessage).toBe('Term range cannot exceed the 32 months');
    });

    it('should apply the same rules to PNC rows', () => {
      component.pncCallData.push({ callType: 'ECD4', termRange: '5', displayName: 'PNC 2', rowErrorMessage: '' });
      component.onTermRangeChangeForPnc(component.pncCallData[1]);
      expect(component.pncCallData[1].rowErrorMessage).toBe('Term range should be greater than previous term range');
      component.pncCallData[1].termRange = '10';
      component.onTermRangeChangeForPnc(component.pncCallData[1]);
      expect(component.pncCallData[1].rowErrorMessage).toBe('');
      f().configTerms.setValue('days');
      component.pncCallData[1].termRange = '1500';
      component.onTermRangeChangeForPnc(component.pncCallData[1]);
      expect(component.pncCallData[1].rowErrorMessage).toBe('Term range cannot exceed the 1000 days');
      f().configTerms.setValue('months');
      component.pncCallData[1].termRange = '40';
      component.onTermRangeChangeForPnc(component.pncCallData[1]);
      expect(component.pncCallData[1].rowErrorMessage).toBe('Term range cannot exceed the 32 months');
    });
  });

  describe('attempts', () => {
    beforeEach(() => create());

    it('checkNoOfAttempts should require a next-attempt period when attempts > 0', () => {
      f().nextCallAttempt.setValue('');
      component.checkNoOfAttempts();
      expect(component.enableNextCallAttempt).toBeTrue();
      expect(component.disableUpdate).toBeTrue();
    });

    it('checkNoOfAttempts should clear the next-attempt period for 0 attempts', () => {
      f().noOfAttempts.setValue('0');
      component.checkNoOfAttempts();
      expect(component.enableNextCallAttempt).toBeFalse();
      expect(component.disableUpdate).toBeFalse();
      expect(f().nextCallAttempt.value).toBeNull();
    });

    it('enableSubmitOnFill should allow 0 as a next-attempt period', () => {
      f().nextCallAttempt.setValue(0 as any);
      component.enableSubmitOnFill();
      expect(component.disableUpdate).toBeFalse();
      f().nextCallAttempt.setValue('');
      component.enableSubmitOnFill();
      expect(component.disableUpdate).toBeTrue();
      f().nextCallAttempt.setValue('5');
      component.enableSubmitOnFill();
      expect(component.disableUpdate).toBeFalse();
    });

    it('enableSubmitOnFill should allow update without attempts', () => {
      f().noOfAttempts.setValue('');
      f().nextCallAttempt.setValue('');
      component.enableSubmitOnFill();
      expect(component.disableUpdate).toBeFalse();
    });
  });

  describe('updateCallConfiguration', () => {
    beforeEach(() => create());

    it('should send every row with dates and attempt settings and go back on success', () => {
      supervisor.updateCallConfiguration.and.returnValue(of([{ id: 1 }]));
      component.updateCallConfiguration();
      const [rows, configId] = supervisor.updateCallConfiguration.calls.mostRecent().args as any[];
      expect(configId).toBe(77);
      expect(rows.length).toBe(4);
      expect(rows[1]).toEqual(jasmine.objectContaining({
        callType: 'ECD1', configTerms: 'days', noOfAttempts: 2, nextAttemptPeriod: 3,
        deleted: false, modifiedBy: 'sup1', psmId: 4,
      }));
      expect(rows[1].effectiveStartDate).toMatch(/^2025-01-0[1]T|^2024-12-31T/);
      expect(confirmation.openDialog).toHaveBeenCalledWith('callConfigurationUpdatedSuccessfully', 'success');
      expect(supervisor.createComponent).toHaveBeenCalledWith(CallConfigurationComponent, null);
    });

    it('should show the error message when the update is rejected', () => {
      supervisor.updateCallConfiguration.and.returnValue(of({ errorMessage: 'overlap' } as any));
      component.updateCallConfiguration();
      expect(confirmation.openDialog).toHaveBeenCalledWith('overlap', 'error');
    });

    it('should block the update while a row is incomplete or invalid', () => {
      component.ancCallData[0].displayName = '';
      component.updateCallConfiguration();
      expect(supervisor.updateCallConfiguration).not.toHaveBeenCalled();
      expect(confirmation.openDialog).toHaveBeenCalledWith('pleaseFillAllTheValuesToProceedFurther', 'info');
    });

    it('checkIfValidSubmit should fail when a row has an error message', () => {
      component.pncCallData[0].rowErrorMessage = 'bad';
      expect(component.checkIfValidSubmit()).toBeFalse();
    });
  });

  it('goBack should reload the call configuration list', () => {
    create();
    component.goBack();
    expect(supervisor.createComponent).toHaveBeenCalledWith(CallConfigurationComponent, null);
  });

  it('trackFieldInteraction should report to tracking', () => {
    create();
    component.trackFieldInteraction('startDate');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('startDate', 'Edit Call Configuration');
  });
});
