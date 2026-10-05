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
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { BenRegistrationComponent } from './ben-registration.component';
import { AssociateAnmMoService } from 'src/app/app-modules/services/associate-anm-mo/associate-anm-mo.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { LoginserviceService } from 'src/app/app-modules/services/loginservice/loginservice.service';
import { VideoConsultationService } from '../../video-consultation/videoService';

describe('BenRegistrationComponent', () => {
  let component: BenRegistrationComponent;
  let fixture: ComponentFixture<BenRegistrationComponent>;
  let anm: any;
  let master: jasmine.SpyObj<MasterService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let video: any;
  let sessionSvc: any;
  let tracking: jasmine.SpyObj<AmritTrackingService>;
  const session: any = { role: 'ANM', userName: 'agent1', providerServiceMapID: 4 };

  const lang = {
    beneficiaryRegisteredSuccessfully: 'Registered',
    issueInBeneficiaryReg: 'issueInBeneficiaryReg',
    doYouWantToCloseTheCall: 'doYouWantToCloseTheCall',
    areYouSureWantToProceedEcdQuestionnaire: 'areYouSureWantToProceedEcdQuestionnaire',
    pleaseValidateAge: 'pleaseValidateAge',
  };
  const genders = [{ genderID: 1, genderName: 'Female' }, { genderID: 2, genderName: 'Male' }];

  function motherBen() {
    return {
      beneficiaryRegId: null, mctsidNo: 'M-1', name: 'Asha', whomPhoneNo: '9876543210', phoneNoOfWhom: 'Self',
      lmpDate: '2025-01-10T00:00:00Z', gender: 'female', fatherName: 'Ravi', stateName: 'KA', districtName: 'BLR',
      blockName: 'B1', villageName: 'V1', ashaName: 'Asha W',
    };
  }

  function childBen() {
    return { beneficiaryRegId: 300, mctsidNoChildId: 'C-1', motherId: 'M-1', childName: 'Baby', motherName: 'Asha', dob: '2025-02-01T00:00:00Z', gender: 'MALE', phoneNo: '9123456780' };
  }

  function create(ben: any = motherBen(), isMother = true) {
    anm.selectedBenDetails = ben;
    anm.isMother = isMother;
    fixture = TestBed.createComponent(BenRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    anm.loadDetailsInRegFlag$.next(true);
  }

  function c() {
    return component.benRegistrationForm.controls;
  }

  beforeEach(async () => {
    anm = jasmine.createSpyObj('AssociateAnmMoService', ['registerBeneficiary', 'updateBeneficiary', 'setOpenComp', 'onClickOfEcdQuestionnaire']);
    anm.isBenRegistartionData$ = new BehaviorSubject<any>('');
    anm.openCompFlag$ = new BehaviorSubject<any>('');
    anm.loadDetailsInRegFlag$ = new BehaviorSubject<any>('');
    master = jasmine.createSpyObj('MasterService', ['getGenderMaster']);
    master.getGenderMaster.and.returnValue(of(genders));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    video = { videoCallPrompt: false, meetLink: 'http://meet', setVideoCallData: jasmine.createSpy('setVideoCallData') };
    sessionSvc = { getItem: (k: string) => session[k], setItem: jasmine.createSpy('setItem') };
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [BenRegistrationComponent],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: ConfirmationService, useValue: confirmation },
        { provide: AssociateAnmMoService, useValue: anm },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: MasterService, useValue: master },
        { provide: LoginserviceService, useValue: { currentServiceId: 9, agentId: 'A-1' } },
        { provide: SessionStorageService, useValue: sessionSvc },
        { provide: MatDialog, useValue: {} },
        { provide: VideoConsultationService, useValue: video },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(BenRegistrationComponent, '')
      .compileComponents();
  });

  describe('init', () => {
    it('should create, load genders and enable the video prompt', () => {
      create();
      expect(component).toBeTruthy();
      expect(component.genderMasterList).toEqual(genders);
      expect(video.videoCallPrompt).toBeTrue();
      expect(component.selectedRole).toBe('ANM');
    });

    it('should show err.error when genders fail to load', () => {
      master.getGenderMaster.and.returnValue(throwError(() => ({ error: 'g failed' })));
      create(null);
      expect(confirmation.openDialog).toHaveBeenCalledWith('g failed', 'error');
    });

    it('should show title + detail when genders fail without err.error', () => {
      master.getGenderMaster.and.returnValue(throwError(() => ({ title: 'A', detail: 'B' })));
      create(null);
      expect(confirmation.openDialog).toHaveBeenCalledWith('AB', 'error');
    });

    it('should enable update for an already registered beneficiary', () => {
      create(childBen(), false);
      anm.isBenRegistartionData$.next(true);
      expect(component.enableUpdateButton).toBeTrue();
    });

    it('should not enable update for a new beneficiary', () => {
      create();
      anm.isBenRegistartionData$.next(true);
      expect(component.enableUpdateButton).toBeFalse();
    });

    it('should reset the form when a "Call Closed" event arrives', () => {
      create();
      anm.openCompFlag$.next('Call Closed');
      expect(c().motherId.value).toBeNull();
    });
  });

  describe('patching details', () => {
    it('should fill mother details, gender (case-insensitive) and EDD from LMP', () => {
      create();
      expect(component.enableMotherRecord).toBeTrue();
      expect(c().motherId.value).toBe('M-1');
      expect(c().motherName.value).toBe('Asha');
      expect(c().phoneNo.value).toBe('9876543210');
      expect(c().genderID.value).toBe(1);
      expect(c().husbandName.value).toBe('Ravi');
      expect(c().stateID.value).toBe('KA');
      expect(c().districtBranchID.value).toBe('V1');
      const lmp: Date = c().lmpDate.value;
      const edd: Date = c().edd.value;
      expect(edd.getTime()).toBe(new Date(lmp.getFullYear(), lmp.getMonth() + 9, lmp.getDate() + 7).getTime());
    });

    it('should fill child details with a timezone-adjusted DOB', () => {
      create(childBen(), false);
      expect(component.enableMotherRecord).toBeFalse();
      expect(c().genderName.value).toBe('Male');
      const dob: Date = c().dob.value;
      expect(dob.getFullYear()).toBe(2025);
      expect(dob.getMonth()).toBe(1);
      expect(dob.getDate()).toBe(1);
    });

    it('should do nothing when no beneficiary is selected', () => {
      create(null);
      expect(c().motherId.value).toBeNull();
    });
  });

  describe('form helpers', () => {
    beforeEach(() => create());

    it('calculateEdd should add 9 months and 7 days to LMP', () => {
      c().lmpDate.setValue(new Date(2025, 0, 1));
      component.calculateEdd();
      expect((c().edd.value as Date).toDateString()).toBe(new Date(2025, 9, 8).toDateString());
    });

    it('calculateEdd should clear EDD when LMP is empty', () => {
      c().lmpDate.setValue(null);
      component.calculateEdd();
      expect(c().edd.value).toBeNull();
    });

    [11, 51].forEach((age) =>
      it(`ageEntered should reject age ${age}`, () => {
        c().age.setValue(age as any);
        component.ageEntered();
        expect(confirmation.openDialog).toHaveBeenCalledWith('pleaseValidateAge', 'warn');
        expect(c().age.value).toBeNull();
      })
    );

    [12, 30, 50].forEach((age) =>
      it(`ageEntered should accept age ${age}`, () => {
        c().age.setValue(age as any);
        component.ageEntered();
        expect(confirmation.openDialog).not.toHaveBeenCalled();
      })
    );

    it('ageEntered should ignore an empty age', () => {
      c().age.setValue('');
      component.ageEntered();
      expect(confirmation.openDialog).not.toHaveBeenCalled();
    });

    it('formatDateValue should format as local date at IST midnight', () => {
      expect(component.formatDateValue(new Date(2025, 2, 5, 18, 30))).toBe('2025-03-05T00:00:00+05:30');
    });

    // Documents current behaviour: a null date becomes 1970-01-01.
    it('formatDateValue turns null into the epoch date (edge case)', () => {
      expect(component.formatDateValue(null)).toMatch(/^1970-01-01T00:00:00\+05:30$|^1969-12-31T00:00:00\+05:30$/);
    });

    it('setGenderName should store the gender name', () => {
      component.setGenderName('Other');
      expect(c().genderName.value).toBe('Other');
    });
  });

  describe('onSubmit (register)', () => {
    beforeEach(() => {
      create();
      c().alternatePhoneNo.setValue('9000000000');
      c().address.setValue('Main road');
    });

    it('should register a mother with LMP/EDD and both phone numbers', () => {
      anm.registerBeneficiary.and.returnValue(of({ response: { BenRegId: 1234, BeneficiaryId: 88 } }));
      component.onSubmit();
      const req = anm.registerBeneficiary.calls.mostRecent().args[0];
      expect(req).toEqual(jasmine.objectContaining({
        motherId: 'M-1', childId: undefined, name: 'Asha', motherName: undefined, spouseName: 'Ravi',
        genderID: 1, phoneNo: '9876543210', alternatePhoneNo: '9000000000', dateOfBirth: null,
        vanID: 9, emergencyRegistration: false, providerServiceMapID: 4, createdBy: 'agent1',
      }));
      expect(req.lmp).toMatch(/\+05:30$/);
      expect(req.edd).toMatch(/\+05:30$/);
      expect(req.i_bendemographics).toEqual({ addressLine1: 'Main road', createdBy: 'agent1' });
      expect(req.benPhoneMaps.map((p: any) => p.phoneNo)).toEqual(['9876543210', '9000000000']);
      expect(video.benRegId).toBe(1234);
      expect(sessionSvc.setItem).toHaveBeenCalledWith('beneficiaryRegId', 1234);
      expect(anm.selectedBenDetails.motherName).toBe('Asha');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Registered 1234', 'success');
      expect(anm.setOpenComp).toHaveBeenCalledWith('ECD Questionnaire');
      expect(anm.onClickOfEcdQuestionnaire).toHaveBeenCalledWith(true);
    });

    it('should omit blank optional fields', () => {
      anm.registerBeneficiary.and.returnValue(of({ response: { BenRegId: 1 } }));
      c().alternatePhoneNo.setValue('');
      c().address.setValue('');
      c().husbandName.setValue('');
      component.onSubmit();
      const req = anm.registerBeneficiary.calls.mostRecent().args[0];
      expect(req.alternatePhoneNo).toBeUndefined();
      expect(req.spouseName).toBeUndefined();
      expect(req.i_bendemographics.addressLine1).toBeUndefined();
      expect(req.benPhoneMaps.length).toBe(1);
    });

    it('should show an error when no registration id is returned', () => {
      anm.registerBeneficiary.and.returnValue(of({ response: {} }));
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('issueInBeneficiaryReg', 'error');
      expect(anm.setOpenComp).not.toHaveBeenCalled();
    });

    it('should show err.error when registration fails', () => {
      anm.registerBeneficiary.and.returnValue(throwError(() => ({ error: 'reg failed' })));
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('reg failed', 'error');
    });

    it('should show title + detail when registration fails without err.error', () => {
      anm.registerBeneficiary.and.returnValue(throwError(() => ({ title: 'X', detail: 'Y' })));
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('XY', 'error');
    });
  });

  describe('onUpdate', () => {
    beforeEach(() => create(childBen(), false));

    it('should update a child with DOB and the registration id', () => {
      anm.updateBeneficiary.and.returnValue(of({ response: 'Updated' }));
      component.onUpdate();
      const req = anm.updateBeneficiary.calls.mostRecent().args[0];
      expect(req).toEqual(jasmine.objectContaining({
        beneficiaryRegID: 300, childId: 'C-1', name: 'Baby', motherName: 'Asha', lmp: null, edd: null,
        changeInSelfDetails: true, is1097: false, modifiedBy: 'agent1',
      }));
      expect(req.dateOfBirth).toBe('2025-02-01T00:00:00+05:30');
      expect(req.benPhoneMaps[0]).toEqual(jasmine.objectContaining({ parentBenRegID: 300, beneficiaryRegID: 300, phoneNo: '9123456780' }));
      expect(video.benRegId).toBe(300);
      expect(confirmation.openDialog).toHaveBeenCalledWith('Updated', 'success');
      expect(anm.setOpenComp).toHaveBeenCalledWith('ECD Questionnaire');
    });

    it('should show the error message when the update is rejected', () => {
      anm.updateBeneficiary.and.returnValue(of({ response: null, errorMessage: 'not found' }));
      component.onUpdate();
      expect(confirmation.openDialog).toHaveBeenCalledWith('not found', 'error');
    });

    it('should show err.error when the update fails', () => {
      anm.updateBeneficiary.and.returnValue(throwError(() => ({ error: 'upd failed' })));
      component.onUpdate();
      expect(confirmation.openDialog).toHaveBeenCalledWith('upd failed', 'error');
    });

    it('should show title + detail when the update fails without err.error', () => {
      anm.updateBeneficiary.and.returnValue(throwError(() => ({ title: 'P', detail: 'Q' })));
      component.onUpdate();
      expect(confirmation.openDialog).toHaveBeenCalledWith('PQ', 'error');
    });
  });

  describe('navigation', () => {
    beforeEach(() => create());

    it('goToClosure should open call closure when confirmed', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      component.goToClosure();
      expect(anm.fromComponent).toBe('Beneficiary Registration');
      expect(anm.setOpenComp).toHaveBeenCalledWith('Call Closure');
    });

    it('openEcdQuestionnaire should open the questionnaire when confirmed', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      component.openEcdQuestionnaire();
      expect(anm.setOpenComp).toHaveBeenCalledWith('ECD Questionnaire');
      expect(anm.onClickOfEcdQuestionnaire).toHaveBeenCalledWith(true);
    });

    it('dialogs should do nothing when cancelled', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.goToClosure();
      component.openEcdQuestionnaire();
      expect(anm.setOpenComp).not.toHaveBeenCalled();
    });
  });

  describe('performAction (video call)', () => {
    beforeEach(() => create());

    it('should require a phone number', () => {
      c().phoneNo.setValue('');
      component.performAction();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Phone number is required for video call', 'error');
      expect(video.setVideoCallData).not.toHaveBeenCalled();
    });

    it('should start the video call with the beneficiary phone', () => {
      component.performAction();
      expect(video.setVideoCallData).toHaveBeenCalledWith(true, '9876543210', 'http://meet', 'A-1', sessionStorage.getItem('userName'));
    });
  });

  it('trackFieldInteraction should report to tracking', () => {
    create();
    component.trackFieldInteraction('age');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('age', 'Beneficiary Registration');
  });
});
