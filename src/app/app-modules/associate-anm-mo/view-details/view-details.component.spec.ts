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

import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialog as MatDialog,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { ViewDetailsComponent } from './view-details.component';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { HighRiskReasonsComponent } from '../high-risk-reasons/high-risk-reasons.component';

describe('ViewDetailsComponent', () => {
  let dialog: jasmine.SpyObj<MatDialog>;
  let tracking: jasmine.SpyObj<AmritTrackingService>;

  const mother = {
    mctsidNo: 'M-1', name: 'Asha', husbandName: 'Ravi', whomPhoneNo: '9876543210', ashaName: 'Asha W', anmName: 'ANM 1',
    address: 'Main road', recordUploadDate: '2025-01-05', lmpDate: '2025-01-10', edd: '2025-10-17', nextAnc: '2025-02-10', highRisk: true,
  };
  const child = { mctsidNoChildId: 'C-1', childName: 'Baby', phoneNo: '9000000000', nextPnc: '2025-03-01', isHrni: false };

  async function create(data: any) {
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);
    await TestBed.configureTestingModule({
      declarations: [ViewDetailsComponent],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: {} },
        { provide: MatDialog, useValue: dialog },
        { provide: AmritTrackingService, useValue: tracking },
        { provide: SetLanguageService, useValue: { languageData: { x: 1 } } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(ViewDetailsComponent, '')
      .compileComponents();
    const fixture = TestBed.createComponent(ViewDetailsComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('should map mother details with formatted dates and high-risk flag', async () => {
    const component = await create({ selectedDetails: mother, activeMother: true, activeChild: false });
    const v = component.viewOutboundWorklistForm.value;
    expect(v.motherId).toBe('M-1');
    expect(v.motherName).toBe('Asha');
    expect(v.phoneNo).toBe('9876543210');
    expect(v.Address).toBe('Main road');
    expect(v.lmpDate).toBe('01/10/2025');
    expect(v.edd).toBe('10/17/2025');
    expect(v.recordUploadDate).toBe('01/05/2025');
    expect(v.highRiskStatus).toBe('Yes');
    expect(component.datePipeString).toBe('02/13/2023');
  });

  it('should map child details with HRNI status', async () => {
    const component = await create({ selectedDetails: child, activeMother: false, activeChild: true });
    const v = component.viewOutboundWorklistFormForChild.value;
    expect(v.childId).toBe('C-1');
    expect(v.childName).toBe('Baby');
    expect(v.nextPnc).toBe('03/01/2025');
    expect(v.hrniStatus).toBe('No');
    expect(component.viewOutboundWorklistForm.value.motherId).toBe('');
  });

  it('should leave missing dates empty', async () => {
    const component = await create({ selectedDetails: { mctsidNo: 'M-2' }, activeMother: true });
    expect(component.viewOutboundWorklistForm.value.lmpDate).toBeNull();
    expect(component.viewOutboundWorklistForm.value.highRiskStatus).toBe('No');
  });

  it('openHrpReasonsDialog should open the reasons dialog', async () => {
    const component = await create({ selectedDetails: mother, activeMother: true });
    component.openHrpReasonsDialog();
    expect(dialog.open).toHaveBeenCalledWith(HighRiskReasonsComponent, { data: { motherId: 'M-1', childId: null } });
  });

  it('trackFieldInteraction should report to tracking', async () => {
    const component = await create({ selectedDetails: mother, activeMother: true });
    component.trackFieldInteraction('phoneNo');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('phoneNo', 'View Details');
  });
});
