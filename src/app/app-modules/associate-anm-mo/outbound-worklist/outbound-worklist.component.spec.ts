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
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { OutboundWorklistComponent } from './outbound-worklist.component';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { CtiService } from '../../services/cti/cti.service';
import { ViewDetailsComponent } from '../view-details/view-details.component';
import { HighRiskReasonsComponent } from '../high-risk-reasons/high-risk-reasons.component';

describe('OutboundWorklistComponent', () => {
  let component: OutboundWorklistComponent;
  let fixture: ComponentFixture<OutboundWorklistComponent>;
  let anm: any;
  let cti: jasmine.SpyObj<CtiService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let login: any;
  let session: { [k: string]: any };
  let tracking: jasmine.SpyObj<AmritTrackingService>;

  const lang = { agentIdNotAvailable: 'agentIdNotAvailable' };
  const mothers = [
    { mctsidNo: 'M-1', whomPhoneNo: '9876543210', phoneNoOfWhom: 'Self', displayOBCallType: 'ANC1', recordUploadDate: '2025-01-01' },
    { mctsidNo: 'M-2', whomPhoneNo: '9123456780', phoneNoOfWhom: 'Husband', displayOBCallType: 'ANC2', recordUploadDate: '2025-02-01' },
  ];
  const children = [{ mctsidNoChildId: 'C-1', phoneNo: '9000000000', phoneNoOf: 'Mother', displayOBCallType: 'PNC1' }];

  function create() {
    fixture = TestBed.createComponent(OutboundWorklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    session = { userID: 7, providerServiceMapID: 4, roleId: 3, role: 'ANM', onCall: 'false', agentIp: '10.0.0.5' };
    anm = jasmine.createSpyObj('AssociateAnmMoService', [
      'getAutoPreviewDialing', 'getMotherRecord', 'getChildRecord', 'setBenRegistartionComp', 'setCallInitiated',
      'setOpenComp', 'onClickOfEcdQuestionnaire',
    ]);
    anm.agentCurrentStatusData$ = new BehaviorSubject<any>(undefined);
    anm.openCompFlag$ = new BehaviorSubject<any>('Outbound Worklist');
    anm.getAutoPreviewDialing.and.returnValue(of({ isAutoPreviewDial: false }));
    anm.getMotherRecord.and.callFake(() => of(mothers.map((m) => ({ ...m }))));
    anm.getChildRecord.and.callFake(() => of(children.map((c) => ({ ...c }))));
    cti = jasmine.createSpyObj('CtiService', ['getAgentIpAddress', 'callBeneficiaryManual', 'getAgentState']);
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    login = { agentId: 'A-1' };
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [OutboundWorklistComponent],
      providers: [
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: MatDialog, useValue: dialog },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: AssociateAnmMoService, useValue: anm },
        { provide: LoginserviceService, useValue: login },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k], setItem: (k: string, v: any) => (session[k] = v) } },
        { provide: CtiService, useValue: cti },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(OutboundWorklistComponent, '')
      .compileComponents();
  });

  describe('loading the worklist', () => {
    it('should load mother records with serial numbers and ANM columns', () => {
      create();
      expect(anm.getAutoPreviewDialing).toHaveBeenCalledWith(7, 3, 4);
      expect(anm.isStartAutoPreviewDial).toBeFalse();
      expect(component.previewWindowTime).toBeNull();
      expect(anm.getMotherRecord).toHaveBeenCalledWith({ userId: 7 });
      expect(component.dataSource.data.map((r) => r.sno)).toEqual([1, 2]);
      expect(component.displayedColumns).toContain('hrpStatus');
      expect(component.displayedColumns).toContain('mctsidNo');
    });

    it('should hide the HRP column for non-ANM roles', () => {
      session['role'] = 'MO';
      create();
      expect(component.displayedColumns).not.toContain('hrpStatus');
    });

    it('should switch to child records', () => {
      create();
      component.selectedRecord('child');
      expect(component.activeChild).toBeTrue();
      expect(anm.getChildRecord).toHaveBeenCalled();
      expect(component.dataSource.data.length).toBe(1);
      expect(component.displayedColumns).toContain('hrniStatus');
      expect(component.displayedColumns).toContain('childId');
    });

    it('should switch back to mother records', () => {
      create();
      component.selectedRecord('child');
      component.selectedRecord('mother');
      expect(component.activeMother).toBeTrue();
      expect(component.isChecked).toBeFalse();
    });

    it('should enable auto preview dialing when configured', () => {
      anm.getAutoPreviewDialing.and.returnValue(of({ isAutoPreviewDial: true, previewWindowTime: 20 }));
      create();
      expect(component.isAutoPreviewDial).toBeTrue();
      expect(component.previewWindowTime).toBe(20);
      expect(anm.isStartAutoPreviewDial).toBeTrue();
      expect(anm.getMotherRecord).toHaveBeenCalled();
    });

    it('should reload the list when the worklist reopens after a call', () => {
      create();
      anm.getMotherRecord.calls.reset();
      anm.openCompFlag$.next('Call Closed');
      expect(anm.getMotherRecord).toHaveBeenCalled();
    });

    it('should show err.error / title+detail when preview settings fail', () => {
      anm.getAutoPreviewDialing.and.returnValue(throwError(() => ({ error: 'pv failed' })));
      create();
      expect(confirmation.openDialog).toHaveBeenCalledWith('pv failed', 'error');
      anm.getAutoPreviewDialing.and.returnValue(throwError(() => ({ title: 'A', detail: 'B' })));
      component.getAutoPreviewDialing();
      expect(confirmation.openDialog).toHaveBeenCalledWith('AB', 'error');
    });

    it('should show errors when mother or child records fail', () => {
      create();
      anm.getMotherRecord.and.returnValue(throwError(() => ({ error: 'm failed' })));
      component.getOutBoundWorklistCalls();
      expect(confirmation.openDialog).toHaveBeenCalledWith('m failed', 'error');
      component.activeMother = false;
      anm.getChildRecord.and.returnValue(throwError(() => ({ title: 'C', detail: 'D' })));
      component.getOutBoundWorklistCalls();
      expect(confirmation.openDialog).toHaveBeenCalledWith('CD', 'error');
    });
  });

  describe('filterSearchTerm', () => {
    beforeEach(() => create());

    it('should match MCTS id, phone and call type case-insensitively', () => {
      component.filterSearchTerm('m-2');
      expect(component.dataSource.data.map((r) => r.mctsidNo)).toEqual(['M-2']);
      component.filterSearchTerm('98765');
      expect(component.dataSource.data.map((r) => r.mctsidNo)).toEqual(['M-1']);
      component.filterSearchTerm('anc');
      expect(component.dataSource.data.length).toBe(2);
    });

    it('should restore the list for an empty search', () => {
      component.filterSearchTerm('zzz');
      expect(component.dataSource.data.length).toBe(0);
      component.filterSearchTerm('');
      expect(component.dataSource.data.length).toBe(2);
    });
  });

  describe('callBeneficary', () => {
    beforeEach(() => create());

    it('should dial the mother number and mark the call as started', () => {
      cti.callBeneficiaryManual.and.returnValue(of({ data: { status: 'SUCCESS' } }));
      component.callBeneficary(mothers[0], true);
      expect(anm.selectedBenDetails).toBe(mothers[0]);
      expect(anm.isMother).toBeTrue();
      expect(cti.callBeneficiaryManual).toHaveBeenCalledWith('A-1', '9876543210');
      expect(session['onCall']).toBe('true');
      expect(anm.setBenRegistartionComp).toHaveBeenCalledWith(true);
      expect(component.callInitiated).toBeTrue();
    });

    it('should dial the child phone number for child records', () => {
      cti.callBeneficiaryManual.and.returnValue(of({ data: { status: 'SUCCESS' } }));
      component.callBeneficary(children[0], false);
      expect(cti.callBeneficiaryManual).toHaveBeenCalledWith('A-1', '9000000000');
    });

    it('should not mark the call started when dialing is not successful', () => {
      cti.callBeneficiaryManual.and.returnValue(of({ data: { status: 'FAIL' } }));
      component.callBeneficary(mothers[0], true);
      expect(component.callInitiated).toBeFalse();
    });

    it('should show errors when dialing fails', () => {
      cti.callBeneficiaryManual.and.returnValue(throwError(() => ({ error: 'dial failed' })));
      component.callBeneficary(mothers[0], true);
      expect(confirmation.openDialog).toHaveBeenCalledWith('dial failed', 'error');
      cti.callBeneficiaryManual.and.returnValue(throwError(() => ({ title: 'X', detail: 'Y' })));
      component.callBeneficary(mothers[0], true);
      expect(confirmation.openDialog).toHaveBeenCalledWith('XY', 'error');
    });

    it('should refuse to dial without an agent id', () => {
      login.agentId = undefined;
      component.callBeneficary(mothers[0], true);
      expect(confirmation.openDialog).toHaveBeenCalledWith('agentIdNotAvailable', 'error');
      expect(cti.callBeneficiaryManual).not.toHaveBeenCalled();
    });

    it('should fetch the agent IP first when it is not stored', () => {
      session['agentIp'] = undefined;
      cti.getAgentIpAddress.and.returnValue(of({ data: { agent_ip: '10.0.0.9' } }));
      cti.callBeneficiaryManual.and.returnValue(of({ data: { status: 'SUCCESS' } }));
      component.callBeneficary(mothers[0], true);
      expect(session['agentIp']).toBe('10.0.0.9');
      expect(anm.setCallInitiated).toHaveBeenCalledWith(true);
    });

    it('should show the dial error message after fetching the IP', () => {
      session['agentIp'] = undefined;
      cti.getAgentIpAddress.and.returnValue(of({ data: { agent_ip: '10.0.0.9' } }));
      cti.callBeneficiaryManual.and.returnValue(of({ data: { status: 'FAIL' }, errorMessage: 'busy' }));
      component.callBeneficary(mothers[0], true);
      expect(confirmation.openDialog).toHaveBeenCalledWith('busy', 'error');
    });

    // Documents current behaviour: only the IP-lookup path flags the call as
    // initiated for the agent-state watcher; the normal path does not.
    it('does not call setCallInitiated when the agent IP is already known', () => {
      cti.callBeneficiaryManual.and.returnValue(of({ data: { status: 'SUCCESS' } }));
      component.callBeneficary(mothers[0], true);
      expect(anm.setCallInitiated).not.toHaveBeenCalled();
    });
  });

  describe('auto preview dialing', () => {
    it('should start dialing the first record after the preview window when the agent is free', fakeAsync(() => {
      anm.getAutoPreviewDialing.and.returnValue(of({ isAutoPreviewDial: true, previewWindowTime: 5 }));
      cti.getAgentState.and.returnValue(of({ data: { stateObj: { stateName: 'free' } } }));
      cti.callBeneficiaryManual.and.returnValue(of({ data: { status: 'SUCCESS' } }));
      create();
      anm.autoDialing = false;
      anm.agentCurrentStatusData$.next('READY');
      expect(component.isChecked).toBeTrue();
      tick(4999);
      expect(cti.callBeneficiaryManual).not.toHaveBeenCalled();
      tick(1);
      expect(anm.autoDialing).toBeTrue();
      expect(cti.callBeneficiaryManual).toHaveBeenCalledWith('A-1', '9876543210');
      discardPeriodicTasks();
    }));

    it('should not auto dial while the agent is on a call', () => {
      anm.getAutoPreviewDialing.and.returnValue(of({ isAutoPreviewDial: true, previewWindowTime: 5 }));
      create();
      session['onCall'] = 'true';
      anm.agentCurrentStatusData$.next('FREE');
      expect(component.isChecked).toBeFalse();
    });

    it('StartAutoPreviewDialing(false) should stop auto dialing', () => {
      create();
      component.StartAutoPreviewDialing(false);
      expect(anm.isStartAutoPreviewDial).toBeFalse();
      expect(anm.autoDialing).toBeTrue();
    });

    it('getAgentState should reset when the agent is busy, missing or errors', () => {
      create();
      component.isChecked = true;
      cti.getAgentState.and.returnValue(of({ data: { stateObj: { stateName: 'INCALL' } } }));
      component.getAgentState(true);
      expect(component.isChecked).toBeFalse();
      expect(anm.autoDialing).toBeFalse();
      component.isChecked = true;
      cti.getAgentState.and.returnValue(of({}));
      component.getAgentState(true);
      expect(component.isChecked).toBeFalse();
      cti.getAgentState.and.returnValue(throwError(() => ({ error: 'state failed' })));
      component.getAgentState(true);
      expect(confirmation.openDialog).toHaveBeenCalledWith('state failed', 'error');
    });

    it('startAutoDialCall should do nothing for an empty list', () => {
      create();
      component.mappedOutBoundWorkList = [];
      component.startAutoDialCall(true);
      component.startAutoDialCall(false);
      expect(cti.callBeneficiaryManual).not.toHaveBeenCalled();
    });

    it('EnableAutoPreviewDialing should drop the first record every 10 seconds', fakeAsync(() => {
      create();
      component.isChecked = true;
      component.EnableAutoPreviewDialing();
      tick(10000);
      expect(component.dataSource.data.length).toBe(1);
      tick(10000);
      expect(component.dataSource.data.length).toBe(0);
      tick(10000);
      expect(component.isChecked).toBeFalse();
    }));

    it('EnableAutoPreviewDialing should do nothing when unchecked', () => {
      create();
      component.isChecked = false;
      component.EnableAutoPreviewDialing();
      expect(component.dataSource.data.length).toBe(2);
    });
  });

  describe('dialogs and navigation', () => {
    beforeEach(() => create());

    it('openDialog should open view details with the active tab', () => {
      component.openDialog(mothers[0]);
      expect(dialog.open).toHaveBeenCalledWith(ViewDetailsComponent, {
        autoFocus: false, disableClose: false,
        data: { selectedDetails: mothers[0], activeChild: false, activeMother: true },
      });
    });

    it('openHrpReasonsDialog should pass mother and child ids', () => {
      component.openHrpReasonsDialog({ mctsidNo: 'M-1' });
      expect(dialog.open).toHaveBeenCalledWith(HighRiskReasonsComponent, { data: { motherId: 'M-1', childId: null } });
    });

    it('navigation helpers should open the right screens', () => {
      component.openCallClosure();
      expect(anm.setOpenComp).toHaveBeenCalledWith('Call Closure');
      component.openEcdQuestionnaire();
      expect(anm.setOpenComp).toHaveBeenCalledWith('ECD Questionnaire');
      expect(anm.onClickOfEcdQuestionnaire).toHaveBeenCalledWith(true);
      component.openBenCallHistory();
      expect(anm.setOpenComp).toHaveBeenCalledWith('Beneficiary Call History');
    });

    it('trackFieldInteraction should report to tracking', () => {
      component.trackFieldInteraction('search');
      expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('search', 'Outbound Worklist');
    });
  });
});
