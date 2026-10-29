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
import { GradeConfigurationComponent } from '../grade-configuration/grade-configuration.component';
import { CreateGradeConfigComponent } from './create-grade-config.component';

describe('CreateGradeConfigComponent', () => {
  let component: CreateGradeConfigComponent;
  let fixture: ComponentFixture<CreateGradeConfigComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let master: jasmine.SpyObj<MasterService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const lang = { gradeAlreadyExistWithSameRange: 'rangeExists', gradesCreatedSuccessfully: 'created' };
  const session: any = { providerServiceMapID: 4, userName: 'qs1' };
  const MASTER = () => [
    { id: 10, name: 'A' },
    { id: 11, name: 'B' },
    { id: 12, name: 'C' },
    { id: 13, name: 'D' },
  ];
  const EXISTING = [
    { gradeId: 10, minValue: 90, maxValue: 100, deleted: false },
    { gradeId: 13, minValue: 0, maxValue: 10, deleted: true },
  ];

  async function setup(data: any = { gradesData: EXISTING, isEdit: false }) {
    qs = jasmine.createSpyObj('QualitySupervisorService', ['saveGrades', 'createComponent']);
    master = jasmine.createSpyObj('MasterService', ['getGradeMaster']);
    master.getGradeMaster.and.callFake(() => of(MASTER()));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    await TestBed.configureTestingModule({
      declarations: [CreateGradeConfigComponent],
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
      .overrideTemplate(CreateGradeConfigComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(CreateGradeConfigComponent);
    component = fixture.componentInstance;
    component.data = data;
    fixture.detectChanges();
  }

  const form = (): any => component.createGradeConfigurationForm;
  const ids = () => component.gradeList.map((g) => g.id);

  it('offers grades not mapped to active configurations', async () => {
    await setup();
    expect(master.getGradeMaster).toHaveBeenCalledWith(4);
    expect(ids()).toEqual([11, 12, 13]);
    expect(component.enableEdit).toBeFalse();
  });

  it('flags edit mode and shows grade master errors', async () => {
    await setup({ gradesData: [], isEdit: true });
    expect(component.enableEdit).toBeTrue();
    master.getGradeMaster.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getGrades();
    master.getGradeMaster.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
    component.getGrades();
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
  });

  it('max value must be greater than min value', async () => {
    await setup();
    form().patchValue({ minValue: 50, maxValue: '' });
    expect(form().controls.maxValue.hasError('required')).toBeTrue();
    form().patchValue({ minValue: 50, maxValue: 40 });
    expect(form().controls.maxValue.hasError('valueGreater')).toBeTrue();
    form().patchValue({ minValue: 50, maxValue: 60 });
    expect(form().valid).toBeTrue();
  });

  it('setGrade copies the grade name', async () => {
    await setup();
    component.setGrade(12);
    expect(form().value.grade).toBe('C');
  });

  describe('addGrades', () => {
    beforeEach(() => setup());

    it('adds a non-overlapping grade and hides it from the choices', () => {
      component.addGrades({ gradeId: 11, grade: 'B', minValue: 70, maxValue: 89 });
      expect(component.dataSource.data).toEqual([
        { gradeId: 11, grade: 'B', minValue: 70, maxValue: 89, createdBy: 'qs1', psmId: 4 } as any,
      ]);
      expect(ids()).toEqual([12, 13]);
      expect(form().value.grade).toBeNull();
    });

    it('rejects ranges overlapping pending or active grades', () => {
      component.addGrades({ gradeId: 11, grade: 'B', minValue: 70, maxValue: 89 });
      component.addGrades({ gradeId: 12, grade: 'C', minValue: 60, maxValue: 75 });
      component.addGrades({ gradeId: 12, grade: 'C', minValue: 85, maxValue: 95 });
      component.addGrades({ gradeId: 12, grade: 'C', minValue: 50, maxValue: 99 });
      expect(component.dataSource.data.length).toBe(1);
      expect(confirmation.openDialog).toHaveBeenCalledTimes(3);
      expect(confirmation.openDialog).toHaveBeenCalledWith('rangeExists', 'error');
    });

    it('allows ranges of deleted grades', () => {
      component.addGrades({ gradeId: 13, grade: 'D', minValue: 0, maxValue: 10 });
      expect(component.dataSource.data.length).toBe(1);
    });

    it('removing a pending grade makes it selectable again', () => {
      component.addGrades({ gradeId: 11, grade: 'B', minValue: 70, maxValue: 89 });
      component.removeGradeConfiguration(0);
      expect(component.dataSource.data).toEqual([]);
      expect(ids()).toContain(11);
    });
  });

  it('checkMaximumValue is true when max does not exceed min', async () => {
    await setup();
    expect(component.checkMaximumValue({ minValue: 5, maxValue: 5 })).toBeTrue();
    expect(component.checkMaximumValue({ minValue: 5, maxValue: 6 })).toBeFalse();
  });

  it('lessThanValidator compares the control with itself (current behaviour)', async () => {
    await setup();
    expect(component.lessThanValidator({ value: 5 } as any)).toEqual({ lessThan: true });
    expect(component.lessThanValidator({ value: null } as any)).toBeNull();
  });

  describe('saveGrade', () => {
    beforeEach(async () => {
      await setup();
      component.addGrades({ gradeId: 11, grade: 'B', minValue: 70, maxValue: 89 });
    });

    it('saves pending grades and returns to the list', () => {
      qs.saveGrades.and.returnValue(of({ ok: true }));
      component.saveGrade();
      expect(qs.saveGrades).toHaveBeenCalledWith([
        { gradeId: 11, grade: 'B', minValue: 70, maxValue: 89, createdBy: 'qs1', psmId: 4 } as any,
      ]);
      expect(confirmation.openDialog).toHaveBeenCalledWith('created', 'success');
      expect(component.dataSource.data).toEqual([]);
      expect(qs.createComponent).toHaveBeenCalledWith(GradeConfigurationComponent, null);
    });

    it('shows save errors', () => {
      qs.saveGrades.and.returnValue(throwError(() => ({ error: 'dup' })));
      component.saveGrade();
      qs.saveGrades.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.saveGrade();
      expect(confirmation.openDialog).toHaveBeenCalledWith('dup', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });
  });

  it('back resets a new configuration after confirmation', async () => {
    await setup();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    form().patchValue({ grade: 'B' });
    component.back();
    expect(form().value.grade).toBeNull();
    expect(qs.createComponent).toHaveBeenCalledWith(GradeConfigurationComponent, null);
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
    qs.createComponent.calls.reset();
    component.back();
    expect(qs.createComponent).not.toHaveBeenCalled();
  });
});
