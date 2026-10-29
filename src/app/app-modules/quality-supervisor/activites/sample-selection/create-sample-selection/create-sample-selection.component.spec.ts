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
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { SampleSelectionConfigurationComponent } from '../sample-selection-configuration/sample-selection-configuration.component';
import { CreateSampleSelectionComponent } from './create-sample-selection.component';

describe('CreateSampleSelectionComponent', () => {
  let component: CreateSampleSelectionComponent;
  let fixture: ComponentFixture<CreateSampleSelectionComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let master: jasmine.SpyObj<MasterService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const lang = { cycleAlreadyExistWithSameDay: 'rangeExists', sampleSizeConfigurationSuccessful: 'created' };
  const session: any = { providerServiceMapID: 4, userName: 'qs1' };
  const MASTER = () => [
    { id: 10, name: 'A' },
    { id: 11, name: 'B' },
    { id: 12, name: 'C' },
    { id: 13, name: 'D' },
  ];
  const EXISTING = [
    { cycleId: 10, fromDay: 90, toDay: 100, deleted: false },
    { cycleId: 13, fromDay: 0, toDay: 10, deleted: true },
  ];

  async function setup(data: any = { cycleData: EXISTING, isEdit: false }) {
    qs = jasmine.createSpyObj('QualitySupervisorService', ['saveSampleList', 'createComponent']);
    master = jasmine.createSpyObj('MasterService', ['getCyclesMaster']);
    master.getCyclesMaster.and.callFake(() => of(MASTER()));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    await TestBed.configureTestingModule({
      declarations: [CreateSampleSelectionComponent],
      providers: [
        FormBuilder,
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: QualitySupervisorService, useValue: qs },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: MasterService, useValue: master },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CreateSampleSelectionComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(CreateSampleSelectionComponent);
    component = fixture.componentInstance;
    component.data = data;
    fixture.detectChanges();
  }

  const form = (): any => component.createSampleConfigurationForm;
  const ids = () => component.cycleList.map((g) => g.id);

  it('offers cycles not mapped to active configurations', async () => {
    await setup();
    expect(master.getCyclesMaster).toHaveBeenCalledWith(4);
    expect(ids()).toEqual([11, 12, 13]);
    expect(component.enableEdit).toBeFalse();
  });

  it('flags edit mode and shows grade master errors', async () => {
    await setup({ cycleData: [], isEdit: true });
    expect(component.enableEdit).toBeTrue();
    master.getCyclesMaster.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getCycles();
    master.getCyclesMaster.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
    component.getCycles();
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
  });

  it('to day must be after from day', async () => {
    await setup();
    form().patchValue({ fromDay: 50, toDay: 40 });
    expect(form().controls.toDay.hasError('valueGreater')).toBeTrue();
    form().patchValue({ fromDay: 50, toDay: 60 });
    expect(form().valid).toBeTrue();
  });

  it('setCycle copies the cycle name', async () => {
    await setup();
    component.setCycle(12);
    expect(form().value.cycleName).toBe('C');
  });

  describe('addSample', () => {
    beforeEach(() => setup());

    it('adds a non-overlapping grade and hides it from the choices', () => {
      component.addSample({ cycleId: 11, cycleName: 'B', fromDay: 70, toDay: 89, ancSampleSize: 2, pncSampleSize: 3, totalSampleSize: 5 });
      expect(component.dataSource.data).toEqual([
        { cycleId: 11, cycleName: 'B', fromDay: 70, toDay: 89, ancSampleSize: 2, pncSampleSize: 3, totalSampleSize: 5, createdBy: 'qs1', psmId: 4 } as any,
      ]);
      expect(ids()).toEqual([12, 13]);
      expect(form().value.cycleName).toBeNull();
    });

    it('rejects ranges overlapping pending or active grades', () => {
      component.addSample({ cycleId: 11, cycleName: 'B', fromDay: 70, toDay: 89, ancSampleSize: 2, pncSampleSize: 3, totalSampleSize: 5 });
      component.addSample({ cycleId: 12, cycleName: 'C', fromDay: 60, toDay: 75, ancSampleSize: 2, pncSampleSize: 3, totalSampleSize: 5 });
      component.addSample({ cycleId: 12, cycleName: 'C', fromDay: 85, toDay: 95, ancSampleSize: 2, pncSampleSize: 3, totalSampleSize: 5 });
      component.addSample({ cycleId: 12, cycleName: 'C', fromDay: 50, toDay: 99, ancSampleSize: 2, pncSampleSize: 3, totalSampleSize: 5 });
      expect(component.dataSource.data.length).toBe(1);
      expect(confirmation.openDialog).toHaveBeenCalledTimes(3);
      expect(confirmation.openDialog).toHaveBeenCalledWith('rangeExists', 'error');
    });

    it('allows ranges of deleted grades', () => {
      component.addSample({ cycleId: 13, cycleName: 'D', fromDay: 0, toDay: 10, ancSampleSize: 2, pncSampleSize: 3, totalSampleSize: 5 });
      expect(component.dataSource.data.length).toBe(1);
    });

    it('removing a pending grade makes it selectable again', () => {
      component.addSample({ cycleId: 11, cycleName: 'B', fromDay: 70, toDay: 89, ancSampleSize: 2, pncSampleSize: 3, totalSampleSize: 5 });
      component.removeGradeConfiguration(0);
      expect(component.dataSource.data).toEqual([]);
      expect(ids()).toContain(11);
    });
  });

  describe('calculateMe', () => {
    beforeEach(() => setup());
    const total = () => form().controls.totalSampleSize;

    it('adds ANC and PNC sample sizes', () => {
      component.calculateMe(4, 6);
      expect(total().value).toBe(10);
      component.calculateMe(0, 6);
      expect(total().value).toBe(6);
    });

    it('clears the total while a size is missing', () => {
      component.calculateMe(4, '');
      expect(total().value).toBe('');
      component.calculateMe(0, null);
      expect(total().value).toBe('');
    });

    it('flags a zero total', () => {
      component.calculateMe(0, 0);
      expect(total().value).toBe(0);
      expect(total().hasError('min')).toBeTrue();
    });
  });

  describe('saveSample', () => {
    beforeEach(async () => {
      await setup();
      component.addSample({ cycleId: 11, cycleName: 'B', fromDay: 70, toDay: 89, ancSampleSize: 2, pncSampleSize: 3, totalSampleSize: 5 });
    });

    it('saves pending grades and returns to the list', () => {
      qs.saveSampleList.and.returnValue(of({ ok: true }));
      component.saveSample();
      expect(qs.saveSampleList).toHaveBeenCalledWith([
        { cycleId: 11, cycleName: 'B', fromDay: 70, toDay: 89, ancSampleSize: 2, pncSampleSize: 3, totalSampleSize: 5, createdBy: 'qs1', psmId: 4 } as any,
      ]);
      expect(confirmation.openDialog).toHaveBeenCalledWith('created', 'success');
      expect(component.dataSource.data).toEqual([]);
      expect(qs.createComponent).toHaveBeenCalledWith(SampleSelectionConfigurationComponent, null);
    });

    it('shows save errors', () => {
      qs.saveSampleList.and.returnValue(throwError(() => ({ error: 'dup' })));
      component.saveSample();
      qs.saveSampleList.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.saveSample();
      expect(confirmation.openDialog).toHaveBeenCalledWith('dup', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });
  });

  it('back resets a new configuration after confirmation', async () => {
    await setup();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    form().patchValue({ cycleName: 'B' });
    component.back();
    expect(form().value.cycleName).toBeNull();
    expect(qs.createComponent).toHaveBeenCalledWith(SampleSelectionConfigurationComponent, null);
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
    qs.createComponent.calls.reset();
    component.back();
    expect(qs.createComponent).not.toHaveBeenCalled();
  });
});
