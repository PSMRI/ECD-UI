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
import { EditSampleSelectionComponent } from './edit-sample-selection.component';

describe('EditSampleSelectionComponent', () => {
  let component: EditSampleSelectionComponent;
  let fixture: ComponentFixture<EditSampleSelectionComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let master: jasmine.SpyObj<MasterService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const lang = { alreadyExistWithSameDay: 'rangeExists', cycleUpdatedSuccessfully: 'updated' };
  const session: any = { providerServiceMapID: 4, userName: 'qs1' };
  const SELECTED = { id: 2, cycleId: 11, cycleName: 'B', fromDay: 75, toDay: 89, ancSampleSize: 2, pncSampleSize: 3, totalSampleSize: 5, deleted: false };
  const LIST = [
    { id: 1, cycleId: 10, cycleName: 'A', fromDay: 90, toDay: 100, deleted: false },
    SELECTED,
    { id: 3, cycleId: 12, cycleName: 'C', fromDay: 50, toDay: 74, deleted: true },
  ];

  async function setup(data: any = { isEdit: true, cycleListData: LIST, selectedCycle: SELECTED }) {
    qs = jasmine.createSpyObj('QualitySupervisorService', ['updateCycleConfiguration', 'createComponent']);
    master = jasmine.createSpyObj('MasterService', ['getCyclesMaster']);
    master.getCyclesMaster.and.returnValue(of([{ id: 10, name: 'A' }, { id: 11, name: 'B' }]));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    await TestBed.configureTestingModule({
      declarations: [EditSampleSelectionComponent],
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
      .overrideTemplate(EditSampleSelectionComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(EditSampleSelectionComponent);
    component = fixture.componentInstance;
    component.data = data;
    fixture.detectChanges();
  }

  const form = (): any => component.editSampleConfigurationForm;

  it('patches the selected cycle with the cycle id locked', async () => {
    await setup();
    expect(form().getRawValue()).toEqual({ id: 2, cycleId: 11, cycleName: 'B', fromDay: 75, toDay: 89, ancSampleSize: 2, pncSampleSize: 3, totalSampleSize: 5, deleted: false });
    expect(form().controls.cycleId.disabled).toBeTrue();
    expect(component.enableEdit).toBeTrue();
  });

  it('starts empty without a selection and shows master errors', async () => {
    await setup({});
    expect(form().getRawValue().id).toBe('');
    master.getCyclesMaster.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getCycles();
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
  });

  it('to day must be after from day', async () => {
    await setup();
    form().patchValue({ fromDay: 80, toDay: 70 });
    expect(form().controls.toDay.hasError('valueGreater')).toBeTrue();
  });

  describe('updateCycle', () => {
    beforeEach(() => setup());

    it('rejects a range overlapping another active grade', () => {
      component.updateCycle({ ...form().getRawValue(), toDay: 95 });
      expect(confirmation.openDialog).toHaveBeenCalledWith('rangeExists', 'error');
      expect(qs.updateCycleConfiguration).not.toHaveBeenCalled();
    });

    it('updates an unchanged or free range and returns to the list', () => {
      qs.updateCycleConfiguration.and.returnValue(of({ ok: true }));
      component.updateCycle(form().getRawValue());
      component.updateCycle({ ...form().getRawValue(), fromDay: 60 });
      expect(qs.updateCycleConfiguration).toHaveBeenCalledTimes(2);
      expect(qs.updateCycleConfiguration.calls.mostRecent().args[0]).toEqual({
        id: 2,
        cycleId: 11,
        cycleName: 'B',
        fromDay: 60,
        toDay: 89,
        ancSampleSize: 2,
        pncSampleSize: 3,
        totalSampleSize: 5,
        deleted: false,
        createdBy: 'qs1',
        modifiedBy: 'qs1',
        psmId: 4,
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('updated', 'success');
      expect(qs.createComponent).toHaveBeenCalledWith(SampleSelectionConfigurationComponent, null);
    });

    it('shows update errors', () => {
      qs.updateCycleConfiguration.and.returnValue(throwError(() => ({ error: 'dup' })));
      component.updateCycle(form().getRawValue());
      qs.updateCycleConfiguration.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.updateCycle(form().getRawValue());
      expect(confirmation.openDialog).toHaveBeenCalledWith('dup', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });
  });

  it('calculateMe totals the sample sizes', async () => {
    await setup();
    component.calculateMe(4, 6);
    expect(form().controls.totalSampleSize.value).toBe(10);
    component.calculateMe('', 6);
    expect(form().controls.totalSampleSize.value).toBe('');
    component.calculateMe(0, 0);
    expect(form().controls.totalSampleSize.hasError('min')).toBeTrue();
  });

  it('back keeps edit values and returns after confirmation', async () => {
    await setup();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    component.back();
    expect(form().getRawValue().cycleName).toBe('B');
    expect(component.enableEdit).toBeFalse();
    expect(qs.createComponent).toHaveBeenCalledWith(SampleSelectionConfigurationComponent, null);
    component.back();
    expect(form().getRawValue().cycleName).toBeNull();
  });
});
