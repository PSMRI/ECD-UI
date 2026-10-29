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


import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { CallClosureComponent } from './call-closure.component';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { CtiService } from '../../services/cti/cti.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { SmsTemplateService } from '../../services/smsTemplate/sms-template.service';
import { MasterService } from '../../services/masterService/master.service';
import { SpinnerService } from '../../services/spinnerService/spinner.service';
import { VideoConsultationService } from '../video-consultation/videoService';

describe('CallClosureComponent', () => {
  let component: CallClosureComponent;
  let fixture: ComponentFixture<CallClosureComponent>;
  let anm: any;
  let master: jasmine.SpyObj<MasterService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let cti: jasmine.SpyObj<CtiService>;
  let sms: jasmine.SpyObj<SmsTemplateService>;
  let router: jasmine.SpyObj<Router>;
  let spinner: jasmine.SpyObj<SpinnerService>;
  let session: { [k: string]: any };
  let sessionSvc: any;
  let tracking: jasmine.SpyObj<AmritTrackingService>;

  const lang = {
    callClosedSuccessfully: 'callClosedSuccessfully',
    smsSent: 'smsSent',
    smsNotSent: 'smsNotSent',
    pleaseSelectFutureDateTime: 'pleaseSelectFutureDateTime',
    noLanguagesFound: 'noLanguagesFound',
  };
  const callTypes = [
    { callTypeID: 1, callGroupType: 'Answered' },
    { callTypeID: 2, callGroupType: 'Not Answered' },
  ];

  function create(role = 'ANM') {
    session['role'] = role;
    fixture = TestBed.createComponent(CallClosureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function form() {
    return component.callClosureForm.controls;
  }

  beforeEach(async () => {
    session = {
      role: 'ANM', benPhoneNo: '9876543210', userID: 7, providerServiceMapID: 4, callId: 'c-1',
      userName: 'agent1', agentIp: '10.0.0.1', beneficiaryRegId: 'reg-session',
    };
    sessionSvc = {
      getItem: (k: string) => session[k] ?? null,
      setItem: jasmine.createSpy('setItem').and.callFake((k: string, v: any) => (session[k] = v)),
    };
    anm = jasmine.createSpyObj('AssociateAnmMoService', [
      'getCallTypes', 'commonCallClosure', 'callClosure', 'setStopTimer', 'setCallClosure', 'setOpenComp',
      'resetLoadDetailsInReg', 'resetCloseCallOnWrapup', 'setResetAgentStatus',
    ]);
    anm.openCompFlag$ = new BehaviorSubject<any>('');
    anm.callWrapupFlag$ = new BehaviorSubject<any>('');
    anm.isMother = true;
    anm.isHighRiskPregnancy = false;
    anm.isHighRiskInfant = false;
    anm.callDetailId = 900;
    anm.fromComponent = 'outbound';
    anm.selectedBenDetails = { obCallId: 55, mctsidNo: 'M-1', motherId: 'm-2', mctsidNoChildId: null, outboundCallType: 'Introductory', beneficiaryRegId: null };
    anm.getCallTypes.and.returnValue(of({ statusCode: 200, data: callTypes }));
    master = jasmine.createSpyObj('MasterService', ['getNoFurtherCallsReason', 'getReasonsOfNotCallAnswered', 'getTypeOfComplaints', 'getLanguageMaster']);
    master.getNoFurtherCallsReason.and.returnValue(of([{ id: 1, name: 'Migrated' }]));
    master.getReasonsOfNotCallAnswered.and.returnValue(of([{ id: 2, name: 'Switched off' }]));
    master.getTypeOfComplaints.and.returnValue(of([{ id: 3, name: 'JSY' }]));
    master.getLanguageMaster.and.returnValue(of([{ languageName: 'Hindi' }]));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    cti = jasmine.createSpyObj('CtiService', ['getAgentState']);
    cti.getAgentState.and.returnValue(of({ data: { stateObj: { stateName: 'READY' } } }));
    sms = jasmine.createSpyObj('SmsTemplateService', ['getSMStypes', 'getSMStemplates', 'sendSMS']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    spinner = jasmine.createSpyObj('SpinnerService', ['setLoading']);
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [CallClosureComponent],
      providers: [
        FormBuilder,
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: AssociateAnmMoService, useValue: anm },
        { provide: CtiService, useValue: cti },
        { provide: LoginserviceService, useValue: { agentId: 'A-1', currentServiceId: 9 } },
        { provide: SmsTemplateService, useValue: sms },
        { provide: Router, useValue: router },
        { provide: MasterService, useValue: master },
        { provide: SessionStorageService, useValue: sessionSvc },
        { provide: SpinnerService, useValue: spinner },
        { provide: VideoConsultationService, useValue: {} },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CallClosureComponent, '')
      .compileComponents();
  });

  afterEach(() => fixture?.destroy());

  describe('init', () => {
    it('should create and load masters, call types and agent state', () => {
      create();
      expect(component).toBeTruthy();
      expect(component.phoneNo).toBe('9876543210');
      expect(component.noCallRequired.length).toBe(1);
      expect(component.notAnsweredReason.length).toBe(1);
      expect(component.complaints.length).toBe(1);
      expect(component.callTypes).toEqual(callTypes);
      // the 15s polling timer starts asynchronously; trigger one poll directly
      component.getAgentState();
      expect(cti.getAgentState).toHaveBeenCalledWith({ agent_id: 'A-1' });
      expect(component.agentStatus).toBe('READY');
      expect(anm.setResetAgentStatus).toHaveBeenCalledWith('READY');
    });

    it('should load languages for ANM and Associate but not MO', () => {
      create('ANM');
      expect(component.languages).toEqual([{ languageName: 'Hindi' }]);
      fixture.destroy();
      master.getLanguageMaster.calls.reset();
      create('MO');
      expect(master.getLanguageMaster).not.toHaveBeenCalled();
      expect(component.showMoStatusFields).toBeTrue();
    });

    it('should show noLanguagesFound for an empty language list', () => {
      master.getLanguageMaster.and.returnValue(of([]));
      create('Associate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('noLanguagesFound', 'error');
    });

    const masterErrors: Array<[keyof MasterService]> = [['getNoFurtherCallsReason'], ['getReasonsOfNotCallAnswered'], ['getTypeOfComplaints']];
    masterErrors.forEach(([m]) => {
      it(`should show err.error when ${m} fails`, () => {
        (master[m] as jasmine.Spy).and.returnValue(throwError(() => ({ error: m + ' failed' })));
        create();
        expect(confirmation.openDialog).toHaveBeenCalledWith(m + ' failed', 'error');
      });

      it(`should show title + detail when ${m} fails without err.error`, () => {
        (master[m] as jasmine.Spy).and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
        create();
        expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
      });
    });

    it('should show an error when call types fail', () => {
      anm.getCallTypes.and.returnValue(throwError(() => 'ct failed'));
      create();
      expect(confirmation.openDialog).toHaveBeenCalledWith('ct failed', 'error');
    });

    it('ngDoCheck should toggle HRP/HRNI status fields by beneficiary type', () => {
      create();
      expect(component.showHrpStatus).toBeTrue();
      anm.isMother = false;
      component.ngDoCheck();
      expect(component.showHrpStatus).toBeFalse();
      expect(component.showHrniStatus).toBeTrue();
    });

    it('should reset the form when a "Call Closed" event arrives', () => {
      create();
      form()['callRemarks'].setValue('x');
      component.showDetails = true;
      anm.openCompFlag$.next('Call Closed');
      expect(form()['callRemarks'].value).toBeNull();
      expect(component.showDetails).toBeFalse();
      expect(component.barMinimized).toBeTrue();
    });
  });

  describe('sticky agent', () => {
    it('should show for ANM on low-risk cases', () => {
      create('ANM');
      expect(component.showStickyAgent).toBeTrue();
    });

    it('should show for MO on high-risk cases only', () => {
      anm.isHighRiskPregnancy = true;
      create('MO');
      expect(component.showStickyAgent).toBeTrue();
      anm.isHighRiskPregnancy = false;
      component.isStickyAgentValid();
      expect(component.showStickyAgent).toBeFalse();
    });

    it('should not show for Associates', () => {
      create('Associate');
      expect(component.showStickyAgent).toBeFalse();
    });
  });

  describe('form flow', () => {
    beforeEach(() => create('Associate'));

    it('call not answered should pick the Not Answered call type and reset dependent fields', () => {
      form()['isCallVerified'].setValue('Yes');
      component.selectNoCallAnswered('No');
      expect(component.showCallAnswerNoDropdown).toBeTrue();
      expect(component.callTypeId).toBe(2);
      expect(component.disableIVRFeedback).toBeTrue();
      expect(form()['isCallVerified'].value).toBeNull();
      expect(form()['nextAttemptDate'].enabled).toBeTrue();
    });

    it('call answered should pick the Answered call type and show verified fields', () => {
      component.selectNoCallAnswered('Yes');
      expect(component.callTypeId).toBe(1);
      expect(component.showVerifiedFields).toBeTrue();
      expect(component.disableIVRFeedback).toBeFalse();
      expect(form()['reasonForCallNotAnsweredId'].value).toBe(0);
    });

    it('no further call should require a reason and disable next attempt', () => {
      component.selectedReasonOfNoFutherCall('No');
      expect(component.showDetails).toBeTrue();
      expect(form()['reasonForNoFurtherCallsId'].hasError('required')).toBeTrue();
      expect(form()['nextAttemptDate'].disabled).toBeTrue();
      expect(component.enablePreferredLanguage).toBeFalse();
    });

    it('further call for Associates should require a preferred language', () => {
      form()['isCallDisconnected'].setValue('Yes');
      component.selectedReasonOfNoFutherCall('Yes');
      expect(component.enablePreferredLanguage).toBeTrue();
      expect(form()['preferredLanguage'].hasError('required')).toBeTrue();
      expect(form()['reasonForNoFurtherCallsId'].value).toBe(0);
      expect(form()['nextAttemptDate'].enabled).toBeTrue();
    });

    it('onCallverified should enable disconnect fields for Yes and wrong-number for No', () => {
      component.onCallverified('Yes');
      expect(component.enableCallDisconnectAndFurtherCall).toBeTrue();
      expect(component.enableWrongNumber).toBeFalse();
      component.onCallverified('No');
      expect(component.enableCallDisconnectAndFurtherCall).toBeFalse();
      expect(component.enableWrongNumber).toBeTrue();
    });

    it('checkIsNextAttempt should disable next attempt when not disconnected', () => {
      form()['nextAttemptDate'].setValue('2030-01-01');
      component.checkIsNextAttempt('No');
      expect(form()['nextAttemptDate'].disabled).toBeTrue();
      form()['isFurtherCallRequired'].setValue('Yes');
      component.checkIsNextAttempt('Yes');
      expect(form()['nextAttemptDate'].enabled).toBeTrue();
    });

    it('onWrongNumberChange should toggle the phone number field', () => {
      component.onWrongNumberChange('Yes');
      expect(component.enablePhoneNumber).toBeTrue();
      component.onWrongNumberChange('No');
      expect(component.enablePhoneNumber).toBeFalse();
    });

    it('altPhoneNo should accept 10-digit numbers with optional prefix', () => {
      const c = form()['altPhoneNo'];
      c.setValue('12345');
      expect(c.valid).toBeFalse();
      c.setValue('9876543210');
      expect(c.valid).toBeTrue();
      c.setValue('+91-9876543210');
      expect(c.valid).toBeTrue();
    });

    it('name setters should copy the master name into the form', () => {
      component.setNoCallRequired(1);
      component.setNoAnswerName(2);
      component.setComplaintName(3);
      expect(form()['reasonForNoFurtherCalls'].value).toBe('Migrated');
      expect(form()['reasonForCallNotAnswered'].value).toBe('Switched off');
      expect(form()['typeOfComplaint'].value).toBe('JSY');
    });

    it('HRP/HRNI "No" should clear risk and require further calls', () => {
      anm.isHighRiskPregnancy = true;
      component.onHrpStatusChange('No');
      expect(anm.isHighRiskPregnancy).toBeFalse();
      expect(form()['isFurtherCallRequired'].value).toBe('Yes');
      anm.isHighRiskInfant = true;
      component.onHrniStatusChange('No');
      expect(anm.isHighRiskInfant).toBeFalse();
      component.onHrpStatusChange('Yes');
      expect(anm.isHighRiskPregnancy).toBeFalse();
    });
  });

  describe('checkCallVerifiedStatus', () => {
    beforeEach(() => create());

    it('should map Yes/No/blank to true/false/null', () => {
      component.checkCallVerifiedStatus({ isCallVerified: 'Yes', isWrongNumber: 'No' });
      expect(component.isCallVerifiedStatus).toBeTrue();
      expect(component.isWrongNumberStatus).toBeFalse();
      component.checkCallVerifiedStatus({ isCallVerified: '', isWrongNumber: null });
      expect(component.isCallVerifiedStatus).toBeNull();
      expect(component.isWrongNumberStatus).toBeNull();
    });
  });

  describe('CheckFutureTime', () => {
    beforeEach(() => create());

    it('should reject a past time today', () => {
      form()['nextAttemptDate'].setValue(new Date(Date.now() - 60_000));
      component.CheckFutureTime();
      expect(component.isCorrectDateAndTime).toBeFalse();
      expect(confirmation.openDialog).toHaveBeenCalledWith('pleaseSelectFutureDateTime', 'error');
    });

    it('should accept a future date', () => {
      form()['nextAttemptDate'].setValue(new Date(Date.now() + 3 * 86_400_000));
      component.CheckFutureTime();
      expect(component.isCorrectDateAndTime).toBeTrue();
    });
  });

  describe('submitCallClosure', () => {
    const formData = {
      isFurtherCallRequired: 'Yes', reasonForNoFurtherCallsId: 0, reasonForNoFurtherCalls: '',
      isCallAnswered: 'Yes', isCallVerified: 'Yes', isCallDisconnected: 'No', isWrongNumber: '',
      phoneNumber: null, typeOfComplaint: '', complaintRemarks: '', nextAttemptDate: '', callRemarks: 'Good call',
      sendAdvice: null, altPhoneNo: null, isStickyAgentRequired: false, complaintId: '', preferredLanguage: 'Hindi',
      iVRFeedbackRequired: true, hrpStatus: 'Yes', hrniStatus: null,
    };

    beforeEach(() => create('MO'));

    it('should close the common call then the ECD call, reset and navigate', () => {
      anm.commonCallClosure.and.returnValue(of({ statusCode: 200, data: {} }));
      anm.callClosure.and.returnValue(of({ response: 'ok' }));
      component.submitCallClosure(formData);

      const common = anm.commonCallClosure.calls.mostRecent().args[0];
      expect(common).toEqual(jasmine.objectContaining({ benCallID: 900, callID: 'c-1', remarks: 'Good call', endCall: true, agentID: 'A-1', isFeedback: true }));
      const req = anm.callClosure.calls.mostRecent().args[0];
      expect(req).toEqual(jasmine.objectContaining({
        benCallId: 900, obCallId: 55, motherId: 'M-1', childId: null, userId: 7, role: 'MO',
        beneficiaryRegId: 'reg-session', isFurtherCallRequired: true, isCallAnswered: true, isCallVerified: true,
        isCallDisconnected: false, isWrongNumber: null, typeOfComplaint: null, callRemarks: 'Good call',
        isHrp: true, isHrni: false, complaintId: null, preferredLanguage: 'Hindi',
      }));
      expect(anm.setStopTimer).toHaveBeenCalledWith(true);
      expect(session['onCall']).toBe('false');
      expect(anm.setCallClosure).toHaveBeenCalled();
      expect(anm.callDetailId).toBeNull();
      expect(anm.selectedBenDetails).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/associate-anm-mo/agents-innerpage']);
      expect(anm.setOpenComp).toHaveBeenCalledWith('Call Closed');
      expect(confirmation.openDialog).toHaveBeenCalledWith('callClosedSuccessfully', 'success');
      expect(spinner.setLoading).toHaveBeenCalledWith(false);
    });

    it('should derive HRP from the service flag for non-MO roles', () => {
      fixture.destroy();
      create('ANM');
      anm.isHighRiskPregnancy = true;
      anm.commonCallClosure.and.returnValue(of({ statusCode: 200, data: {} }));
      anm.callClosure.and.returnValue(of({ response: 'ok' }));
      component.submitCallClosure({ ...formData, hrpStatus: 'No' });
      expect(anm.callClosure.calls.mostRecent().args[0].isHrp).toBeTrue();
    });

    // Documents current behaviour: the else branch reads response.errorMessage
    // on a null response, which RxJS rethrows asynchronously.
    it('throws asynchronously when the ECD call closure returns nothing (edge case)', fakeAsync(() => {
      anm.commonCallClosure.and.returnValue(of({ statusCode: 200, data: {} }));
      anm.callClosure.and.returnValue(of(null));
      component.submitCallClosure(formData);
      expect(() => flush()).toThrowError(TypeError);
      expect(confirmation.openDialog).not.toHaveBeenCalledWith('callClosedSuccessfully', 'success');
      component.ngOnDestroy();
    }));

    it('should show err.error when the ECD call closure fails', () => {
      anm.commonCallClosure.and.returnValue(of({ statusCode: 200, data: {} }));
      anm.callClosure.and.returnValue(throwError(() => ({ error: 'close failed' })));
      component.submitCallClosure(formData);
      expect(confirmation.openDialog).toHaveBeenCalledWith('close failed', 'error');
      expect(spinner.setLoading).toHaveBeenCalledWith(false);
    });

    // Documents current behaviour: a non-200 common closure is ignored and the
    // spinner is left on, because the error handler is never wired up.
    it('leaves the spinner on when the common closure is not successful', () => {
      anm.commonCallClosure.and.returnValue(of({ statusCode: 5000 }));
      component.submitCallClosure(formData);
      expect(anm.callClosure).not.toHaveBeenCalled();
      expect(spinner.setLoading).toHaveBeenCalledWith(true);
      expect(spinner.setLoading).not.toHaveBeenCalledWith(false);
    });

    it('should auto-submit when a wrap-up event arrives', () => {
      anm.commonCallClosure.and.returnValue(of({ statusCode: 5000 }));
      anm.callWrapupFlag$.next(1);
      expect(anm.commonCallClosure).toHaveBeenCalled();
    });
  });

  describe('SMS advice', () => {
    beforeEach(() => {
      create();
      spyOn(window, 'alert');
      sms.getSMStypes.and.returnValue(of({ data: [{ smsType: 'Other', smsTypeID: 1 }, { smsType: 'advice sms', smsTypeID: 5 }] }));
      sms.getSMStemplates.and.returnValue(of({ data: [{ deleted: true, smsTemplateID: 8 }, { deleted: false, smsTemplateID: 9 }] }));
    });

    it('should send the advice SMS using the first active Advice template', () => {
      sms.sendSMS.and.returnValue(of({}));
      component.sendSms('Eat well', '9123456780');
      expect(sms.getSMStemplates).toHaveBeenCalledWith(9, 5);
      expect(sms.sendSMS).toHaveBeenCalledWith([{
        sms_Advice: 'Eat well', phoneNo: '9123456780', createdBy: 'agent1', is1097: false,
        providerServiceMapID: 4, smsTemplateID: 9, smsTemplateTypeID: 5,
      }]);
      expect(window.alert).toHaveBeenCalledWith('smsSent');
    });

    it('should fall back to the beneficiary phone number', () => {
      sms.sendSMS.and.returnValue(of({}));
      component.sendSms('Eat well', '');
      expect((sms.sendSMS.calls.mostRecent().args[0] as any)[0].phoneNo).toBe('9876543210');
    });

    it('should alert when sending fails', () => {
      sms.sendSMS.and.returnValue(throwError(() => ({})));
      component.sendSms('x', null);
      expect(window.alert).toHaveBeenCalledWith('smsNotSent');
    });

    it('should not send when there is no Advice SMS type', () => {
      sms.getSMStypes.and.returnValue(of({ data: [{ smsType: 'Other', smsTypeID: 1 }] }));
      component.sendSms('x', null);
      expect(sms.getSMStemplates).not.toHaveBeenCalled();
      expect(sms.sendSMS).not.toHaveBeenCalled();
    });
  });

  describe('helpers', () => {
    beforeEach(() => create());

    it('keyPress should block non-digits', () => {
      const letter = jasmine.createSpyObj('KeyboardEvent', ['preventDefault'], { charCode: 65 });
      const digit = jasmine.createSpyObj('KeyboardEvent', ['preventDefault'], { charCode: 53 });
      component.keyPress(letter);
      component.keyPress(digit);
      expect(letter.preventDefault).toHaveBeenCalled();
      expect(digit.preventDefault).not.toHaveBeenCalled();
    });

    it('toggleBar should flip the minimized state', () => {
      component.toggleBar();
      expect(component.barMinimized).toBeFalse();
      component.toggleBar();
      expect(component.barMinimized).toBeTrue();
    });

    it('back should reopen the originating component', () => {
      component.back();
      expect(anm.setOpenComp).toHaveBeenCalledWith('outbound');
    });

    it('getAgentState should ignore responses without a state', () => {
      cti.getAgentState.and.returnValue(of({ data: { stateObj: {} } }));
      component.agentStatus = 'FREE';
      component.getAgentState();
      expect(component.agentStatus).toBe('FREE');
    });

    it('ngOnDestroy should stop the polling timer', () => {
      component.ngOnDestroy();
      expect(component.timerSubscription.closed).toBeTrue();
    });

    it('trackFieldInteraction should report to tracking', () => {
      component.trackFieldInteraction('callRemarks');
      expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('callRemarks', 'Call Closure');
    });
  });
});
