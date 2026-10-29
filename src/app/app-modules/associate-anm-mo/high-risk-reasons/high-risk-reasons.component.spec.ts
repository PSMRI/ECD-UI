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
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { of, throwError } from 'rxjs';
import { HighRiskReasonsComponent } from './high-risk-reasons.component';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';

describe('HighRiskReasonsComponent', () => {
  let component: HighRiskReasonsComponent;
  let fixture: ComponentFixture<HighRiskReasonsComponent>;
  let anm: jasmine.SpyObj<AssociateAnmMoService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;

  async function create(data: any) {
    await TestBed.configureTestingModule({
      declarations: [HighRiskReasonsComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: AssociateAnmMoService, useValue: anm },
        { provide: SetLanguageService, useValue: { languageData: { x: 1 } } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(HighRiskReasonsComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(HighRiskReasonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    anm = jasmine.createSpyObj('AssociateAnmMoService', ['getHRPDetails', 'getHRNIDetails']);
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
  });

  it('should load HRP reasons for a mother', async () => {
    anm.getHRPDetails.and.returnValue(of({ childId: null, reasonsForHrpDB: 'Anaemia||BP', otherHrpReason: 'Age' }));
    await create({ motherId: 'M-1', childId: null });
    expect(component.dialogTitle).toBe('High Risk Pregnancy Reasons');
    expect(anm.getHRPDetails).toHaveBeenCalledWith({ motherId: 'M-1' });
    expect(component.hrpHrniReasons).toEqual(['Anaemia', 'BP', 'Age']);
  });

  it('should load HRNI, anomaly and defect reasons for a child', async () => {
    anm.getHRNIDetails.and.returnValue(of({
      childId: 'C-1', reasonsForHrniDB: 'Low weight', otherHrni: 'Jaundice',
      congentialAnomaliesDB: 'Cleft lip||Club foot', otherCongentialAnomalies: 'Other', probableCauseOfDefect: 'Genetic',
    }));
    await create({ motherId: 'M-1', childId: 'C-1' });
    expect(component.dialogTitle).toBe('High Risk New Born Infant Reasons');
    expect(anm.getHRNIDetails).toHaveBeenCalledWith({ childId: 'C-1' });
    expect(component.hrpHrniReasons).toEqual(['Low weight', 'Jaundice', 'Cleft lip', 'Club foot', 'Other', 'Genetic']);
  });

  it('should show no reasons when none are recorded', async () => {
    anm.getHRPDetails.and.returnValue(of({ childId: null }));
    await create({ motherId: 'M-1' });
    expect(component.hrpHrniReasons).toEqual([]);
  });

  it('should show err.error / title+detail on failures', async () => {
    anm.getHRPDetails.and.returnValue(throwError(() => ({ error: 'hrp failed' })));
    await create({ motherId: 'M-1' });
    expect(confirmation.openDialog).toHaveBeenCalledWith('hrp failed', 'error');
    anm.getHRNIDetails.and.returnValue(throwError(() => ({ title: 'A', detail: 'B' })));
    component.childId = 'C-1';
    component.getHighRiskReasons();
    expect(confirmation.openDialog).toHaveBeenCalledWith('AB', 'error');
  });

  it('should default to the HRP lookup without dialog data', async () => {
    anm.getHRPDetails.and.returnValue(of({ childId: null }));
    await create(null);
    expect(anm.getHRPDetails).toHaveBeenCalledWith({ motherId: undefined });
  });

  it('filterHrpHrniData should ignore null data', async () => {
    anm.getHRPDetails.and.returnValue(of({ childId: null, reasonsForHrpDB: 'X' }));
    await create({ motherId: 'M-1' });
    component.filterHrpHrniData(null);
    expect(component.hrpHrniReasons).toEqual([]);
  });
});
