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
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { CreateCallConfigurationComponent } from './create-call-configuration.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { CallConfigurationComponent } from '../call-configuration/call-configuration.component';

describe('CreateCallConfigurationComponent', () => {
  let component: CreateCallConfigurationComponent;
  let fixture: ComponentFixture<CreateCallConfigurationComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const lang = {
    issueInGeneratingCallTypes: 'issueInGeneratingCallTypes',
    callConfigurationCreatedSuccessfully: 'created',
    pleaseFillAllTheValuesToProceedFurther: 'fillAll',
  };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };

  function create(data: any = { data: '2025-12-31' }) {
    fixture = TestBed.createComponent(CreateCallConfigurationComponent);
    component = fixture.componentInstance;
    component.data = data;
    fixture.detectChanges();
  }
  const f = (): any => component.createcallconfigurationform.controls;

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', ['createCallConfiguration', 'createComponent']);
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);

    await TestBed.configureTestingModule({
      declarations: [CreateCallConfigurationComponent],
      providers: [
        FormBuilder,
        { provide: Router, useValue: {} },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: SupervisorService, useValue: supervisor },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CreateCallConfigurationComponent, '')
      .compileComponents();
    spyOn(console, 'log');
  });

  it('uses the previous end date as the minimum start date', () => {
    create();
    expect(component.minDate).toEqual(new Date('2025-12-31'));
    expect(component.currentLanguageSet).toBe(lang);
  });

  it('has no minimum date for the first configuration', () => {
    create(null);
    expect(component.minDate).toBeUndefined();
  });

  describe('call counts', () => {
    beforeEach(() => create());

    it('totals introductory, ANC and PNC calls', () => {
      f().noOfAncCalls.setValue('4');
      f().noOfPncCalls.setValue('2');
      component.checkTotalCallsCount();
      expect(f().noOfEcdCalls.value).toBe('7');
      f().noOfAncCalls.setValue('');
      f().noOfPncCalls.setValue('');
      f().noOfIntroductoryCalls.setValue('');
      component.checkTotalCallsCount();
      expect(f().noOfEcdCalls.value).toBe('0');
    });

    it('enables ANC/PNC inputs only for at least 3 ECD calls', () => {
      f().noOfEcdCalls.setValue('2');
      component.checkTotalEcdCalls();
      expect(component.disableAncPncCalls).toBeTrue();
      f().noOfEcdCalls.setValue('3');
      component.checkTotalEcdCalls();
      expect(component.disableAncPncCalls).toBeFalse();
    });
  });

  describe('addCallTypes', () => {
    beforeEach(() => create());

    it('builds introductory, ANC and PNC rows', () => {
      f().noOfAncCalls.setValue(2);
      f().noOfPncCalls.setValue(1);
      component.addCallTypes();
      expect(component.introCallData.map((c: any) => c.callType)).toEqual(['Introductory']);
      expect(component.ancCallData.map((c: any) => [c.callType, c.displayName, c.baseLine])).toEqual([
        ['ECD1', 'ANC1', 'LMP'],
        ['ECD2', 'ANC2', 'LMP'],
      ]);
      expect(component.pncCallData.map((c: any) => [c.callType, c.displayName, c.baseLine])).toEqual([
        ['ECD3', 'PNC1', 'DOB'],
      ]);
      expect(component.displayCallTypes).toBeTrue();
      expect(component.disableFields).toBeTrue();
    });

    it('reports an error when counts are missing', () => {
      f().noOfAncCalls.setValue(null);
      component.addCallTypes();
      expect(confirmation.openDialog).toHaveBeenCalledWith('issueInGeneratingCallTypes', 'error');
      expect(component.displayCallTypes).toBeFalse();
    });
  });

  describe('term range validation', () => {
    beforeEach(() => {
      create();
      f().configTerms.setValue('days');
      f().noOfAncCalls.setValue(3);
      f().noOfPncCalls.setValue(2);
      component.addCallTypes();
    });

    const setRanges = (rows: any[], ranges: any[]) => rows.forEach((r, i) => (r.termRange = ranges[i]));

    it('accepts increasing ranges', () => {
      setRanges(component.ancCallData, ['30', '60', '90']);
      component.onTermRangeChangeForAnc(component.ancCallData[0]);
      expect(component.ancCallData.every((r: any) => r.rowErrorMessage === '')).toBeTrue();
      expect(component.disableSubmit).toBeFalse();
    });

    it('flags ranges that do not increase', () => {
      setRanges(component.ancCallData, ['30', '20', '90']);
      component.onTermRangeChangeForAnc(component.ancCallData[1]);
      expect(component.ancCallData[0].rowErrorMessage).toBe('Term range should be less than next term range');
      expect(component.ancCallData[1].rowErrorMessage).toBe('Term range should be greater than previous term range');
    });

    it('limits days to below 1000 and months to below 32', () => {
      setRanges(component.pncCallData, ['10', '1000']);
      component.onTermRangeChangeForPnc(component.pncCallData[1]);
      expect(component.pncCallData[1].rowErrorMessage).toBe('Term range cannot exceed the 1000 days');
      expect(component.disableSubmit).toBeTrue();
      f().configTerms.setValue('months');
      setRanges(component.pncCallData, ['10', '40']);
      component.onTermRangeChangeForPnc(component.pncCallData[1]);
      expect(component.pncCallData[1].rowErrorMessage).toBe('Term range cannot exceed the 32 months');
    });

    it('applies the same ordering rules to PNC rows', () => {
      setRanges(component.pncCallData, ['20', '10']);
      component.onTermRangeChangeForPnc(component.pncCallData[0]);
      expect(component.pncCallData[0].rowErrorMessage).toBe('Term range should be less than next term range');
      expect(component.pncCallData[1].rowErrorMessage).toBe('Term range should be greater than previous term range');
    });

    it('applies the limits to ANC rows too', () => {
      f().configTerms.setValue('months');
      setRanges(component.ancCallData, ['1', '2', '35']);
      component.onTermRangeChangeForAnc(component.ancCallData[2]);
      expect(component.ancCallData[2].rowErrorMessage).toBe('Term range cannot exceed the 32 months');
    });
  });

  describe('createCallConfiguration', () => {
    beforeEach(() => {
      create();
      f().noOfAncCalls.setValue(1);
      f().noOfPncCalls.setValue(1);
      component.addCallTypes();
      f().startDate.setValue(new Date(2026, 0, 1));
      f().endDate.setValue(new Date(2026, 11, 31));
      f().configTerms.setValue('days');
      f().noOfAttempts.setValue(2);
      f().nextCallAttempt.setValue(3);
    });

    it('asks to fill all values while rows are incomplete', () => {
      component.createCallConfiguration();
      expect(confirmation.openDialog).toHaveBeenCalledWith('fillAll', 'info');
      expect(supervisor.createCallConfiguration).not.toHaveBeenCalled();
    });

    it('creates the configuration for every call', () => {
      component.ancCallData[0].termRange = '30';
      component.pncCallData[0].termRange = '7';
      supervisor.createCallConfiguration.and.returnValue(of([{ configId: 1 }]));
      component.createCallConfiguration();
      const req: any[] = supervisor.createCallConfiguration.calls.mostRecent().args[0];
      expect(req.map((r) => r.callType)).toEqual(['Introductory', 'ECD1', 'ECD2']);
      expect(req[1]).toEqual(
        jasmine.objectContaining({
          configTerms: 'days',
          noOfAttempts: 2,
          nextAttemptPeriod: 3,
          createdBy: 'sup1',
          psmId: 4,
        }),
      );
      expect(req[1].effectiveStartDate).toMatch(/^2026-01-01T/);
      expect(confirmation.openDialog).toHaveBeenCalledWith('created', 'success');
      expect(supervisor.createComponent).toHaveBeenCalledWith(CallConfigurationComponent, null);
    });

    it('defaults attempts to 0 and shows API errors', () => {
      component.ancCallData[0].termRange = '30';
      component.pncCallData[0].termRange = '7';
      f().noOfAttempts.setValue('');
      supervisor.createCallConfiguration.and.returnValue(of({ errorMessage: 'overlap' }));
      component.createCallConfiguration();
      expect(supervisor.createCallConfiguration.calls.mostRecent().args[0][0].noOfAttempts).toBe(0);
      expect(confirmation.openDialog).toHaveBeenCalledWith('overlap', 'error');
    });
  });

  describe('attempts', () => {
    beforeEach(() => create());

    it('enables the next attempt period for retries', () => {
      f().noOfAttempts.setValue('2');
      component.checkNoOfAttempts();
      expect(component.enableNextCallAttempt).toBeTrue();
      expect(component.disableAddTerms).toBeTrue();
    });

    it('clears the next attempt period without retries', () => {
      f().nextCallAttempt.setValue('3');
      f().noOfAttempts.setValue('0');
      component.checkNoOfAttempts();
      expect(component.enableNextCallAttempt).toBeFalse();
      expect(f().nextCallAttempt.value).toBeNull();
    });

    it('enableSubmitOnFill requires a next attempt value (0 allowed)', () => {
      f().nextCallAttempt.setValue('');
      component.enableSubmitOnFill();
      expect(component.disableAddTerms).toBeTrue();
      f().nextCallAttempt.setValue(0);
      component.enableSubmitOnFill();
      expect(component.disableAddTerms).toBeFalse();
      f().nextCallAttempt.setValue('');
      component.enableSubmitOnFill();
      f().nextCallAttempt.setValue('4');
      component.enableSubmitOnFill();
      expect(component.disableAddTerms).toBeFalse();
    });
  });

  it('goBack returns to the list after confirmation', () => {
    create();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    component.goBack();
    expect(supervisor.createComponent).toHaveBeenCalledWith(CallConfigurationComponent, null);
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
    supervisor.createComponent.calls.reset();
    component.goBack();
    expect(supervisor.createComponent).not.toHaveBeenCalled();
  });

  it('resets the form on destroy', () => {
    create();
    f().configTerms.setValue('days');
    fixture.destroy();
    expect(f().configTerms.value).toBeNull();
  });
});
