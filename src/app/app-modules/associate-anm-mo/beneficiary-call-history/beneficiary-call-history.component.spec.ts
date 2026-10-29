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
import { BehaviorSubject, of, throwError } from 'rxjs';

import { BeneficiaryCallHistoryComponent } from './beneficiary-call-history.component';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { AssociateService } from '../../services/associate/associate.service';

describe('BeneficiaryCallHistoryComponent', () => {
  let component: BeneficiaryCallHistoryComponent;
  let fixture: ComponentFixture<BeneficiaryCallHistoryComponent>;
  let anm: any;
  let confirmation: jasmine.SpyObj<ConfirmationService>;

  const history = [
    { obCallId: 1, displayEcdCallType: 'ANC 2', lastModDate: '2025-03-01', callTime: 30 },
    { obCallId: 2, displayEcdCallType: 'Introductory', lastModDate: '2025-01-15', callTime: 10 },
  ];

  beforeEach(async () => {
    anm = jasmine.createSpyObj('AssociateAnmMoService', ['getBeneficiaryCallHistory', 'resetBenHistoryComp', 'setOpenComp', 'getCallHistoryDetails']);
    anm.isBenCallHistoryData$ = new BehaviorSubject<any>('');
    anm.isMother = true;
    anm.selectedBenDetails = { mctsidNo: 'M-1', mctsidNoChildId: 'C-1' };
    anm.getBeneficiaryCallHistory.and.callFake(() => of(history.map((h) => ({ ...h }))));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);

    await TestBed.configureTestingModule({
      declarations: [BeneficiaryCallHistoryComponent],
      providers: [
        FormBuilder,
        { provide: SetLanguageService, useValue: { languageData: { x: 1 } } },
        { provide: AssociateAnmMoService, useValue: anm },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: AssociateService, useValue: {} },
        { provide: Router, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(BeneficiaryCallHistoryComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(BeneficiaryCallHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create without loading until history is requested', () => {
    expect(component).toBeTruthy();
    expect(component.currentLanguageSet).toEqual({ x: 1 });
    expect(anm.getBeneficiaryCallHistory).not.toHaveBeenCalled();
  });

  it('should load mother history by MCTS id', () => {
    anm.isBenCallHistoryData$.next(true);
    expect(anm.getBeneficiaryCallHistory).toHaveBeenCalledWith({ motherId: 'M-1' });
    expect(component.benHistoryData.length).toBe(2);
  });

  it('should load child history by child id', () => {
    anm.isMother = false;
    component.getBenCallHistory();
    expect(anm.getBeneficiaryCallHistory).toHaveBeenCalledWith({ childId: 'C-1' });
  });

  it('should show err.error / title+detail when loading fails', () => {
    anm.getBeneficiaryCallHistory.and.returnValue(throwError(() => ({ error: 'h failed' })));
    component.getBenCallHistory();
    expect(confirmation.openDialog).toHaveBeenCalledWith('h failed', 'error');
    anm.getBeneficiaryCallHistory.and.returnValue(throwError(() => ({ title: 'A', detail: 'B' })));
    component.getBenCallHistory();
    expect(confirmation.openDialog).toHaveBeenCalledWith('AB', 'error');
  });

  it('sortBy should sort ascending then toggle to descending', () => {
    component.getBenCallHistory();
    component.sortBy('callTime');
    expect(component.benData.map((r: any) => r.callTime)).toEqual([10, 30]);
    component.sortBy('callTime');
    expect(component.benData.map((r: any) => r.callTime)).toEqual([30, 10]);
    component.sortBy('displayEcdCallType');
    expect(component.sortOrder).toBe(1);
  });

  it('filterSearchTerm should match call type or date', () => {
    component.getBenCallHistory();
    component.filterSearchTerm('intro');
    expect(component.benHistoryData.map((r) => r.obCallId)).toEqual([2]);
    component.filterSearchTerm('2025-03');
    expect(component.benHistoryData.map((r) => r.obCallId)).toEqual([1]);
    component.filterSearchTerm('');
    expect(component.benHistoryData.length).toBe(2);
  });

  it('getCallHistoryDetails should load call details and handle errors', () => {
    anm.getCallHistoryDetails.and.returnValue(of({ remarks: 'ok' }));
    component.getCallHistoryDetails(1);
    expect(anm.getCallHistoryDetails).toHaveBeenCalledWith(1);
    expect(component.beneficiaryCallDetails).toEqual({ remarks: 'ok' });
    anm.getCallHistoryDetails.and.returnValue(throwError(() => ({ error: 'd failed' })));
    component.getCallHistoryDetails(1);
    expect(confirmation.openDialog).toHaveBeenCalledWith('d failed', 'error');
  });

  it('patchValueForviewDetails should copy call details into the form', () => {
    component.patchValueForviewDetails({ callId: 'c1', motherName: 'Asha', childName: 'Baby', ecdCallType: 'PNC1', complaint: 'none' });
    const v = component.benCallHistoryForm.value;
    expect(v.callId).toBe('c1');
    expect(v.motherName).toBe('Asha');
    expect(v.childName).toBe('Baby');
    expect(v.complaint).toBe('none');
  });

  it('backToQuestinare should reopen the questionnaire', () => {
    component.backToQuestinare();
    expect(anm.setOpenComp).toHaveBeenCalledWith('ECD Questionnaire');
  });

  it('ngOnDestroy should reset the history flag', () => {
    component.ngOnDestroy();
    expect(anm.resetBenHistoryComp).toHaveBeenCalled();
  });
});
