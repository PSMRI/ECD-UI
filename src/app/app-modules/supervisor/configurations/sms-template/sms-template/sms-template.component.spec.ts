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
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { SmsTemplateComponent } from './sms-template.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { SmsTemplateService } from 'src/app/app-modules/services/smsTemplate/sms-template.service';
import { LoginserviceService } from 'src/app/app-modules/services/loginservice/loginservice.service';

describe('SmsTemplateComponent', () => {
  let component: SmsTemplateComponent;
  let fixture: ComponentFixture<SmsTemplateComponent>;
  let smsService: jasmine.SpyObj<SmsTemplateService>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let tracking: jasmine.SpyObj<AmritTrackingService>;

  const lang = {
    allSMSTypesAreActive: 'allSMSTypesAreActive',
    deactivatedSuccessfully: 'deactivatedSuccessfully',
    activatedSuccessfully: 'activatedSuccessfully',
    noParameterIdentified: 'noParameterIdentified',
    doYouReallyWantToCancel: 'doYouReallyWantToCancel',
    templateSavedSuccessfully: 'templateSavedSuccessfully',
  };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };
  const templates = [
    { smsTemplateID: 1, smsTemplateName: 'Welcome', smsTemplate: 'Hello $$name$$', providerServiceMapID: 4 },
    { smsTemplateID: 2, smsTemplateName: 'Reminder', smsTemplate: 'Visit on $$date$$', providerServiceMapID: 4 },
  ];
  const dateParam = { smsParameterID: 7, smsParameterName: 'DueDate', smsParameterType: 'Beneficiary' };

  beforeEach(async () => {
    smsService = jasmine.createSpyObj('SmsTemplateService', [
      'getSMSTemplates', 'getSMStypes', 'updateSMStemplate', 'getSMSparameters', 'saveSMStemplate', 'getFullSMSTemplate',
    ]);
    smsService.getSMSTemplates.and.returnValue(of({ data: templates }));
    smsService.getSMSparameters.and.returnValue(of({ data: [{ smsParameterType: 'Beneficiary', smsParameters: [dateParam] }] }));
    smsService.getSMStypes.and.returnValue(of({ data: [{ smsTypeID: 1 }] }));
    supervisor = jasmine.createSpyObj('SupervisorService', ['createComponent']);
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [SmsTemplateComponent],
      providers: [
        FormBuilder,
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: SmsTemplateService, useValue: smsService },
        { provide: LoginserviceService, useValue: { currentServiceId: 9 } },
        { provide: SupervisorService, useValue: supervisor },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(SmsTemplateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SmsTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('init', () => {
    it('should create and load templates and parameters', () => {
      expect(component).toBeTruthy();
      expect(component.providerServiceMapID).toBe(4);
      expect(component.serviceID).toBe(9);
      expect(smsService.getSMSTemplates).toHaveBeenCalledWith(4);
      expect(component.dataSource.data).toEqual(templates);
      expect(smsService.getSMSparameters).toHaveBeenCalledWith(9);
      expect(component.smsParameters.length).toBe(1);
    });

    it('should keep templates unchanged when the response has no data', () => {
      component.existingTemplates = [];
      smsService.getSMSTemplates.and.returnValue(of({}));
      component.getSMStemplates();
      expect(component.existingTemplates).toEqual([]);
    });

    it('should ignore template load failures silently', () => {
      smsService.getSMSTemplates.and.returnValue(throwError(() => ({ errorMessage: 'x' })));
      component.getSMStemplates();
      expect(confirmation.openDialog).not.toHaveBeenCalled();
    });

    it('should show the error when parameters fail to load', () => {
      smsService.getSMSparameters.and.returnValue(throwError(() => ({ errorMessage: 'param failed' })));
      component.getSMSparameters();
      expect(confirmation.openDialog).toHaveBeenCalledWith('param failed', 'error');
    });
  });

  describe('validators', () => {
    it('templateName and smsTemplate should be required and non-blank', () => {
      const f: any = component.createSMSTemplateForm;
      expect(f.valid).toBeFalse();
      f.patchValue({ templateName: '   ', smsTemplate: 'Hi' });
      expect(f.controls['templateName'].hasError('whitespace')).toBeTrue();
      f.patchValue({ templateName: 'T1' });
      expect(f.valid).toBeTrue();
    });

    it('validateNonWhitespace should flag whitespace-only values', () => {
      expect(component.validateNonWhitespace(new FormControl('  '))).toEqual({ nonWhitespace: true });
      expect(component.validateNonWhitespace(new FormControl('x'))).toBeNull();
      expect(component.validateNonWhitespace(new FormControl(null))).toBeNull();
    });

    it('validateWhitespace should return undefined for null values', () => {
      expect(component.validateWhitespace(new FormControl(null))).toBeUndefined();
    });
  });

  describe('create form navigation', () => {
    it('showForm should reset state and load SMS types', () => {
      component.isReadonly = true;
      component.showParameters = true;
      component.smsParameterMaps = [{}];
      component.showForm();
      expect(component.showTableFlag).toBeFalse();
      expect(component.isReadonly).toBeFalse();
      expect(component.showParameters).toBeFalse();
      expect(component.smsParameterMaps).toEqual([]);
      expect(smsService.getSMStypes).toHaveBeenCalledWith(9);
      expect(component.SMS_Types).toEqual([{ smsTypeID: 1 }]);
    });

    it('should tell the user when all SMS types are already used', () => {
      smsService.getSMStypes.and.returnValue(of({ data: [] }));
      component.getSMStypes();
      expect(confirmation.openDialog).toHaveBeenCalledWith('allSMSTypesAreActive', 'info');
    });

    it('should show the error when SMS types fail to load', () => {
      smsService.getSMStypes.and.returnValue(throwError(() => ({ errorMessage: 'types failed' })));
      component.getSMStypes();
      expect(confirmation.openDialog).toHaveBeenCalledWith('types failed', 'error');
    });

    it('cancel should reset and reload the component when confirmed', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      component.showTableFlag = false;
      component.cancel();
      expect(confirmation.openDialog).toHaveBeenCalledWith('doYouReallyWantToCancel', 'confirm');
      expect(component.showTableFlag).toBeTrue();
      expect(supervisor.createComponent).toHaveBeenCalledWith(SmsTemplateComponent, null);
    });

    it('cancel should keep the form when declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.showTableFlag = false;
      component.cancel();
      expect(component.showTableFlag).toBeFalse();
      expect(supervisor.createComponent).not.toHaveBeenCalled();
    });

    it('showTable should ask to cancel and reload templates', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      smsService.getSMSTemplates.calls.reset();
      component.showTable();
      expect(confirmation.openDialog).toHaveBeenCalled();
      expect(smsService.getSMSTemplates).toHaveBeenCalled();
    });

    it('onBack should return to the table and clear parameter state', () => {
      component.viewTemplate = true;
      component.showParameters = true;
      component.onBack();
      expect(component.showTableFlag).toBeTrue();
      expect(component.viewTemplate).toBeFalse();
      expect(component.showParameters).toBeFalse();
    });
  });

  describe('extractParameters', () => {
    it('should extract unique $$params$$ and always add SMS_PHONE_NO', () => {
      component.extractParameters('Hi $$name$$, visit on $$date$$. Bye $$name$$!');
      expect(component.Parameters).toEqual(['name', 'date', 'SMS_PHONE_NO']);
      expect(component.smsDataParam).toEqual(['name', 'date', 'SMS_PHONE_NO']);
      expect(component.Parameters_count).toBe(3);
      expect(component.showParameters).toBeTrue();
      expect(component.isReadonly).toBeTrue();
    });

    it('should handle params followed by punctuation and new lines', () => {
      component.extractParameters('Due:\n$$due$$?');
      expect(component.Parameters).toEqual(['due', 'SMS_PHONE_NO']);
    });

    it('should ignore unterminated markers', () => {
      component.extractParameters('Hi $$name and $date$');
      expect(component.Parameters).toEqual(['SMS_PHONE_NO']);
    });

    // Documents current behaviour: SMS_PHONE_NO is always appended, so the
    // "no parameter identified" message can never be shown.
    it('never shows noParameterIdentified, even for plain text', () => {
      component.extractParameters('Plain text');
      expect(component.Parameters_count).toBe(1);
      expect(confirmation.openDialog).not.toHaveBeenCalledWith('noParameterIdentified', 'info');
    });
  });

  describe('parameter mapping', () => {
    beforeEach(() => component.extractParameters('Hi $$name$$ on $$date$$'));

    it('setValuesInDropdown should set the type and values', () => {
      component.setValuesInDropdown({ smsParameterType: 'Beneficiary', smsParameters: [dateParam] });
      expect(component.selectedParameterType).toBe('Beneficiary');
      expect(component.selectedParameterValues).toEqual([dateParam]);
    });

    it('add should map a parameter and remove it from the pending list', () => {
      component.add({ parameter: 'date', parameterValue: dateParam });
      expect(component.smsParameterMaps).toEqual([{
        createdBy: 'sup1', modifiedBy: 'sup1', smsParameterName: 'date',
        smsParameterType: 'Beneficiary', smsParameterID: 7, smsParameterValue: 'DueDate',
      }]);
      expect(component.smsParamsData.data.length).toBe(1);
      expect(component.smsDataParam).toEqual(['name', 'SMS_PHONE_NO']);
    });

    it('add should ignore incomplete mappings but still rebuild pending params', () => {
      component.add({ parameter: null, parameterValue: dateParam });
      expect(component.smsParameterMaps).toEqual([]);
      expect(component.smsDataParam).toEqual(['name', 'date', 'SMS_PHONE_NO']);
    });

    it('add should do nothing for null form values', () => {
      component.add(null);
      expect(component.smsParameterMaps).toEqual([]);
    });

    it('remove should unmap a parameter and make it pending again', () => {
      component.add({ parameter: 'date', parameterValue: dateParam });
      component.add({ parameter: 'name', parameterValue: { ...dateParam, smsParameterID: 8 } });
      component.remove(null, 0);
      expect(component.smsParameterMaps.map((m) => m.smsParameterName)).toEqual(['name']);
      expect(component.smsDataParam).toEqual(['date', 'SMS_PHONE_NO']);
      expect(component.selectedParameterValues).toEqual([]);
    });
  });

  describe('saveSMStemplate', () => {
    const form = { smsTemplate: '  Hi $$name$$  ', templateName: ' Welcome ', smsType: 3 };

    it('should send trimmed values with mapped params and reset on success', () => {
      component.smsParameterMaps = [{ smsParameterName: 'name' }];
      smsService.saveSMStemplate.and.returnValue(of({}));
      component.saveSMStemplate(form);
      expect(smsService.saveSMStemplate).toHaveBeenCalledWith({
        createdBy: 'sup1', providerServiceMapID: 4, smsParameterMaps: [{ smsParameterName: 'name' }],
        smsTemplate: 'Hi $$name$$', smsTemplateName: 'Welcome', smsTypeID: 3,
      });
      expect(component.showTableFlag).toBeTrue();
      expect(component.smsParameterMaps).toEqual([]);
      expect(confirmation.openDialog).toHaveBeenCalledWith('templateSavedSuccessfully', 'success');
    });

    it('should send null for missing name/template', () => {
      smsService.saveSMStemplate.and.returnValue(of({}));
      component.saveSMStemplate({ smsType: 1 });
      const req = smsService.saveSMStemplate.calls.mostRecent().args[0];
      expect(req.smsTemplate).toBeNull();
      expect(req.smsTemplateName).toBeNull();
    });

    it('should show the error when save fails', () => {
      smsService.saveSMStemplate.and.returnValue(throwError(() => ({ errorMessage: 'save failed' })));
      component.saveSMStemplate(form);
      expect(confirmation.openDialog).toHaveBeenCalledWith('save failed', 'error');
    });
  });

  describe('activate / deactivate', () => {
    it('deactivating should mark deleted, notify and reload', () => {
      const obj: any = { smsTemplateID: 1 };
      smsService.updateSMStemplate.and.returnValue(of({ data: 'ok' }));
      smsService.getSMSTemplates.calls.reset();
      component.ActivateDeactivate(obj, true);
      expect(obj.deleted).toBeTrue();
      expect(obj.modifiedBy).toBe('sup1');
      expect(confirmation.openDialog).toHaveBeenCalledWith('deactivatedSuccessfully', 'success');
      expect(component.searchTerm).toBeNull();
      expect(smsService.getSMSTemplates).toHaveBeenCalled();
    });

    it('activating should notify and reload', () => {
      smsService.updateSMStemplate.and.returnValue(of({ data: 'ok' }));
      component.ActivateDeactivate({} as any, false);
      expect(confirmation.openDialog).toHaveBeenCalledWith('activatedSuccessfully', 'success');
    });

    it('should do nothing for an empty response or failure', () => {
      smsService.updateSMStemplate.and.returnValue(of(null as any));
      component.ActivateDeactivate({} as any, true);
      smsService.updateSMStemplate.and.returnValue(throwError(() => ({})));
      component.ActivateDeactivate({} as any, true);
      expect(confirmation.openDialog).not.toHaveBeenCalled();
    });
  });

  describe('view', () => {
    it('should load the full template into the view form', () => {
      smsService.getFullSMSTemplate.and.returnValue(of({
        data: { smsTemplateName: 'Welcome', smsType: { smsType: 'Alert' }, smsTemplate: 'Hi', smsParameterMaps: [{ a: 1 }] },
      }));
      component.view({ providerServiceMapID: 4, smsTemplateID: 1 });
      expect(smsService.getFullSMSTemplate).toHaveBeenCalledWith(4, 1);
      expect(component.viewTemplate).toBeTrue();
      expect(component.showTableFlag).toBeFalse();
      expect(component.viewSMSTemplateForm.value).toEqual({ templateName: 'Welcome', smsType: 'Alert', smsTemplate: 'Hi' });
      expect(component.viewSMSparameterTable).toEqual([{ a: 1 }]);
    });

    it('should stay on the table when the template is missing or fails', () => {
      smsService.getFullSMSTemplate.and.returnValue(of({}));
      component.view({ providerServiceMapID: 4, smsTemplateID: 1 });
      smsService.getFullSMSTemplate.and.returnValue(throwError(() => ({})));
      component.view({ providerServiceMapID: 4, smsTemplateID: 1 });
      expect(component.viewTemplate).toBeFalse();
    });
  });

  describe('filterSearchTerm', () => {
    it('should filter by name or text, case-insensitively', () => {
      component.filterSearchTerm('WELC');
      expect(component.dataSource.data.map((t) => t.smsTemplateID)).toEqual([1]);
      component.filterSearchTerm('visit');
      expect(component.dataSource.data.map((t) => t.smsTemplateID)).toEqual([2]);
    });

    it('should restore all templates for an empty search and none for no match', () => {
      component.filterSearchTerm('zzz');
      expect(component.dataSource.data).toEqual([]);
      component.filterSearchTerm('');
      expect(component.dataSource.data.length).toBe(2);
    });
  });

  it('trackFieldInteraction should report to tracking', () => {
    component.trackFieldInteraction('templateName');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('templateName', 'SMS Template');
  });
});
