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


import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { AgentsInnerpageComponent } from './agents-innerpage.component';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { CtiService } from '../../services/cti/cti.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { VideoConsultationService } from '../video-consultation/videoService';

describe('AgentsInnerpageComponent', () => {
  let component: AgentsInnerpageComponent;
  let fixture: ComponentFixture<AgentsInnerpageComponent>;
  let anm: any;
  let cti: any;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let router: jasmine.SpyObj<Router>;
  let queryParams: BehaviorSubject<any>;
  let session: { [k: string]: any };
  let tracking: jasmine.SpyObj<AmritTrackingService>;

  const lang = {
    unableToRoute: 'unableToRoute',
    callClosedSuccessfully: 'callClosedSuccessfully',
    youAreNotAllowedToGoBackToDashboard: 'youAreNotAllowedToGoBackToDashboard',
    areYouSureYouWouldLikeToGoBack: 'areYouSureYouWouldLikeToGoBack',
  };

  function create() {
    fixture = TestBed.createComponent(AgentsInnerpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    session = { roleId: 3, userID: 7, providerServiceMapID: 4, userName: 'agent1', role: 'ANM', benPhoneNo: null, callId: 'call-1' };
    anm = jasmine.createSpyObj('AssociateAnmMoService', [
      'resetOpenComp', 'clearStopTimer', 'clearCallClosure', 'setOpenComp', 'getCallTypes', 'saveBenCallDetails',
      'setLoadDetailsInReg', 'commonCallClosure', 'callClosure', 'setStopTimer', 'setCallClosure', 'resetLoadDetailsInReg',
      'resetCloseCallOnWrapup', 'setAgentState', 'setCallInitiated',
    ]);
    anm.openCompFlag$ = new BehaviorSubject<any>('');
    anm.resetAgentStatusFlag$ = new BehaviorSubject<any>(null);
    anm.callClosureFlag$ = new BehaviorSubject<any>('');
    anm.stopTimerFlag$ = new BehaviorSubject<any>(null);
    anm.callDetailId = null;
    anm.isMother = true;
    anm.selectedBenDetails = { obCallId: 55, beneficiaryRegId: null, ecdCallType: 'ANC1', outboundCallType: 'ANC1', whomPhoneNo: '9876543210', phoneNo: '9000000000', mctsidNo: 'M-1' };
    anm.getCallTypes.and.returnValue(of({ statusCode: 200, data: [{ callGroupType: 'Answered', callTypeID: 1 }, { callGroupType: 'Wrapup Exceeds', callTypeID: 9 }] }));
    cti = jasmine.createSpyObj('CtiService', ['getAgentState', 'getAgentIpAddress', 'getRoleBasedWrapuptime']);
    cti.wrapupTime = 120;
    cti.ctiUrl = 'http://cti/';
    cti.eventCtiUrl = 'events?agent=';
    cti.getAgentState.and.returnValue(of({ data: { stateObj: { stateName: 'FREE' } } }));
    cti.getAgentIpAddress.and.returnValue(of({ statusCode: 200, data: { agent_ip: '10.0.0.5' } }));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    queryParams = new BehaviorSubject<any>({ data: 'outBoundWorklist' });
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);
    spyOn(Storage.prototype, 'removeItem');

    await TestBed.configureTestingModule({
      declarations: [AgentsInnerpageComponent],
      providers: [
        FormBuilder,
        { provide: AssociateAnmMoService, useValue: anm },
        { provide: ActivatedRoute, useValue: { queryParams } },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: Router, useValue: router },
        { provide: CtiService, useValue: cti },
        { provide: LoginserviceService, useValue: { agentId: 'A-1' } },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] ?? null, setItem: (k: string, v: any) => (session[k] = v) } },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: AmritTrackingService, useValue: tracking },
        { provide: VideoConsultationService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(AgentsInnerpageComponent, '')
      .compileComponents();
  });

  afterEach(() => fixture?.destroy());

  describe('init', () => {
    beforeEach(() => create());

    it('should reset service state and open the worklist', () => {
      expect(component).toBeTruthy();
      expect(anm.resetOpenComp).toHaveBeenCalled();
      expect(anm.clearStopTimer).toHaveBeenCalled();
      expect(anm.clearCallClosure).toHaveBeenCalled();
      expect(anm.setOpenComp).toHaveBeenCalledWith('Outbound Worklist');
      expect(component.selectedRoute).toBe('outBoundWorklist');
      expect(component.roleId).toBe(3);
      expect(component.timeRemaining).toBe(120);
    });

    it('should store the agent IP and the Wrapup Exceeds call type', () => {
      expect(session['agentIp']).toBe('10.0.0.5');
      expect(component.callTypeId).toBe(9);
    });

    it('should switch the visible component on known events only', () => {
      anm.openCompFlag$.next('Beneficiary Registration');
      expect(component.isEnableComp).toBe('Beneficiary Registration');
      anm.openCompFlag$.next('Unknown');
      expect(component.isEnableComp).toBe('Beneficiary Registration');
    });

    it('"Call Closed" should reset the call timer and show the worklist', () => {
      component.callDuration = '00:01:00';
      component.seconds = 10;
      anm.openCompFlag$.next('Call Closed');
      expect(component.isEnableComp).toBe('Outbound Worklist');
      expect(component.callDuration).toBe('00:00:00');
      expect(component.seconds).toBe(0);
    });

    it('should apply agent status resets and stop-timer events', () => {
      anm.resetAgentStatusFlag$.next('NOT READY');
      expect(component.agentStatus).toBe('NOT READY');
      component.ticks = 5;
      anm.stopTimerFlag$.next(true);
      expect(component.ticks).toBe(0);
    });

    it('call closure events should reset counters', () => {
      component.wrapupCount = 2;
      anm.callClosureFlag$.next(1);
      expect(component.wrapupCount).toBe(0);
    });
  });

  describe('init failures', () => {
    it('should show unableToRoute for null query params', () => {
      queryParams.next(null);
      create();
      expect(confirmation.openDialog).toHaveBeenCalledWith('unableToRoute', 'info');
    });

    it('should show the IP lookup error message', () => {
      cti.getAgentIpAddress.and.returnValue(of({ statusCode: 5000, errorMessage: 'no ip' }));
      create();
      expect(confirmation.openDialog).toHaveBeenCalledWith('no ip', 'info');
    });

    it('should show err.error / title+detail when the IP lookup fails', () => {
      cti.getAgentIpAddress.and.returnValue(throwError(() => ({ error: 'ip failed' })));
      create();
      expect(confirmation.openDialog).toHaveBeenCalledWith('ip failed', 'error');
      fixture.destroy();
      cti.getAgentIpAddress.and.returnValue(throwError(() => ({ title: 'A', detail: 'B' })));
      create();
      expect(confirmation.openDialog).toHaveBeenCalledWith('AB', 'error');
    });

    it('should show an error when call types fail', () => {
      anm.getCallTypes.and.returnValue(throwError(() => 'ct failed'));
      create();
      expect(confirmation.openDialog).toHaveBeenCalledWith('ct failed', 'error');
    });
  });

  describe('agent state polling', () => {
    it('should poll every 15 seconds and publish the state', fakeAsync(() => {
      create();
      tick(0);
      expect(cti.getAgentState).toHaveBeenCalledWith({ agent_id: 'A-1' });
      expect(anm.setAgentState).toHaveBeenCalledWith('FREE');
      tick(15000);
      expect(cti.getAgentState).toHaveBeenCalledTimes(2);
      fixture.destroy();
      discardPeriodicTasks();
    }));

    it('should open registration when a manually initiated call goes INCALL', fakeAsync(() => {
      create();
      tick(0);
      anm.isCallInitiated = true;
      cti.getAgentState.and.returnValue(of({ data: { stateObj: { stateName: 'INCALL' } } }));
      component.getAgentState();
      expect(anm.setOpenComp).toHaveBeenCalledWith('Beneficiary Registration');
      expect(anm.setCallInitiated).toHaveBeenCalledWith(false);
      fixture.destroy();
      discardPeriodicTasks();
    }));
  });

  describe('CTI events', () => {
    beforeEach(() => create());

    it('Accept (fresh call) should save call details and open registration', () => {
      anm.saveBenCallDetails.and.returnValue(of({ response: { benCallId: 900 } }));
      component.handleEvent(['Accept', '9876543210', 'call-2', 'x', '0']);
      const req = anm.saveBenCallDetails.calls.mostRecent().args[0];
      expect(req).toEqual(jasmine.objectContaining({
        obCallId: 55, callReceivedUserId: 7, callId: 'call-2', agentId: 'A-1', receivedRoleName: 'ANM',
        phoneNo: '9876543210', isMother: true, subCategory: 'ANC1',
      }));
      expect(anm.callDetailId).toBe(900);
      expect(session['onCall']).toBe('true');
      expect(session['callId']).toBe('call-2');
      expect(component.benPhoneNo).toBe('9876543210');
      expect(anm.setLoadDetailsInReg).toHaveBeenCalledWith(true);
      expect(anm.setOpenComp).toHaveBeenCalledWith('Beneficiary Registration');
    });

    it('Accept should use the child phone number for child records', () => {
      anm.isMother = false;
      anm.saveBenCallDetails.and.returnValue(of({}));
      component.handleEvent(['Accept', 'x', 'call-2', 'x', '0']);
      expect(anm.saveBenCallDetails.calls.mostRecent().args[0].phoneNo).toBe('9000000000');
      expect(anm.setLoadDetailsInReg).not.toHaveBeenCalled();
    });

    it('Accept should be ignored when a call is already in progress', () => {
      anm.callDetailId = 900;
      component.handleEvent(['Accept', 'x', 'call-2', 'x', '0']);
      expect(anm.saveBenCallDetails).not.toHaveBeenCalled();
    });

    it('Accept of a transferred call should store details and refresh', () => {
      component.listener({ data: 'Accept|9111111111|call-3|x|1' });
      expect(session['onCall']).toBe('true');
      expect(session['benPhoneNo']).toBe('9111111111');
      expect(component.callId).toBe('call-3');
      expect(anm.setOpenComp).toHaveBeenCalledWith('Call Closed');
    });

    it('listener should also read CustomEvent detail data', () => {
      spyOn(component, 'handleEvent');
      component.listener({ detail: { data: 'Foo|bar' } });
      expect(component.handleEvent).toHaveBeenCalledWith(['Foo', 'bar']);
    });

    it('CustDisconnect for the current call should start wrap-up once', () => {
      cti.getRoleBasedWrapuptime.and.returnValue(of({ data: {} }));
      spyOn(component, 'roleBasedCallWrapupTime');
      component.handleEvent(['CustDisconnect', 'call-1']);
      expect(component.wrapupCount).toBe(1);
      expect(cti.getRoleBasedWrapuptime).toHaveBeenCalledWith(3);
      expect(component.roleBasedCallWrapupTime).toHaveBeenCalledWith(120);
      component.ticks = 5;
      component.handleEvent(['CustDisconnect', 'call-1']);
      expect(component.wrapupCount).toBe(1);
    });

    it('CustDisconnect for another call should be ignored', () => {
      component.handleEvent(['CustDisconnect', 'other']);
      expect(cti.getRoleBasedWrapuptime).not.toHaveBeenCalled();
    });

    it('startCallWraupup should prefer the role wrap-up time and fall back on error', () => {
      spyOn(component, 'roleBasedCallWrapupTime');
      cti.getRoleBasedWrapuptime.and.returnValue(of({ data: { isWrapUpTime: true, WrapUpTime: 45 } }));
      component.startCallWraupup();
      expect(component.roleBasedCallWrapupTime).toHaveBeenCalledWith(45);
      cti.getRoleBasedWrapuptime.and.returnValue(throwError(() => ({})));
      component.startCallWraupup();
      expect(component.roleBasedCallWrapupTime).toHaveBeenCalledWith(120);
    });
  });

  describe('timers', () => {
    it('viewBenRegScreen should run a hh:mm:ss call timer', fakeAsync(() => {
      create();
      component.viewBenRegScreen();
      tick(0);
      expect(component.callDuration).toBe('00:00:01');
      tick(59000);
      expect(component.callDuration).toBe('00:01:00');
      tick(10000);
      expect(component.callDuration).toBe('00:01:10');
      fixture.destroy();
      discardPeriodicTasks();
    }));

    it('viewBenRegScreen should not restart a running timer', () => {
      create();
      component.seconds = 3;
      anm.setOpenComp.calls.reset();
      component.viewBenRegScreen();
      expect(anm.setOpenComp).not.toHaveBeenCalled();
    });

    it('wrap-up countdown should close the call when it reaches zero', fakeAsync(() => {
      create();
      spyOn(component, 'closeCall');
      component.callId = 'c';
      component.custDisconnectCallId = 'c';
      component.roleBasedCallWrapupTime(3);
      tick(2000);
      expect(component.ticks).toBe(3);
      tick(3000);
      expect(component.ticks).toBe(0);
      expect(component.closeCall).toHaveBeenCalled();
      fixture.destroy();
      discardPeriodicTasks();
    }));

    it('wrap-up countdown should not start for a different call', () => {
      create();
      component.callId = 'a';
      component.custDisconnectCallId = 'b';
      component.roleBasedCallWrapupTime(3);
      expect(component.wrapupTimerSubscription.closed).toBeTrue();
    });
  });

  describe('closeCall (auto close after wrap-up)', () => {
    beforeEach(() => {
      create();
      anm.callDetailId = 900;
    });

    it('should close as a disconnected call and return to the worklist', () => {
      anm.commonCallClosure.and.returnValue(of({ statusCode: 200, data: {} }));
      anm.callClosure.and.returnValue(of({ response: 'ok' }));
      component.closeCall();
      expect(anm.commonCallClosure.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ benCallID: 900, callTypeID: 9, endCall: true }));
      expect(anm.callClosure.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
        benCallId: 900, motherId: 'M-1', isCallDisconnected: true, isFurtherCallRequired: true, isHrp: false,
      }));
      expect(confirmation.openDialog).toHaveBeenCalledWith('callClosedSuccessfully', 'success');
      expect(anm.selectedBenDetails).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/associate-anm-mo/agents-innerpage'], { queryParams: { data: 'outBoundWorklist' } });
      expect(anm.setOpenComp).toHaveBeenCalledWith('Call Closed');
    });

    it('should show err.error when the ECD closure fails', () => {
      anm.commonCallClosure.and.returnValue(of({ statusCode: 200, data: {} }));
      anm.callClosure.and.returnValue(throwError(() => ({ error: 'close failed' })));
      component.closeCall();
      expect(confirmation.openDialog).toHaveBeenCalledWith('close failed', 'error');
    });

    it('should skip the ECD closure when the common closure fails', () => {
      anm.commonCallClosure.and.returnValue(of({ statusCode: 5000 }));
      component.closeCall();
      expect(anm.callClosure).not.toHaveBeenCalled();
    });
  });

  describe('navigation', () => {
    beforeEach(() => create());

    it('should block going back during a call', () => {
      session['onCall'] = 'true';
      component.backToDashboard();
      expect(confirmation.openDialog).toHaveBeenCalledWith('youAreNotAllowedToGoBackToDashboard', 'info');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should go to the dashboard when confirmed', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      component.backToDashboard();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should stay when cancelled', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.backToDashboard();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('ngOnDestroy should stop auto dialing and timers', () => {
      component.ngOnDestroy();
      expect(anm.autoDialing).toBeFalse();
      expect(anm.isStartAutoPreviewDial).toBeFalse();
      expect(component.timerSubscription.closed).toBeTrue();
    });

    it('trackFieldInteraction should report to tracking', () => {
      component.trackFieldInteraction('status');
      expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('status', 'Agent Dashboard');
    });
  });
});
