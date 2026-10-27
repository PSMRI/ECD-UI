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
import { EditGradeConfigComponent } from './edit-grade-config.component';

describe('EditGradeConfigComponent', () => {
  let component: EditGradeConfigComponent;
  let fixture: ComponentFixture<EditGradeConfigComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let master: jasmine.SpyObj<MasterService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const lang = { gradeAlreadyExistWithSameRange: 'rangeExists', gradeUpdatedSuccessfully: 'updated' };
  const session: any = { providerServiceMapID: 4, userName: 'qs1' };
  const SELECTED = { id: 2, gradeId: 11, grade: 'B', minValue: 75, maxValue: 89, deleted: false };
  const LIST = [
    { id: 1, gradeId: 10, grade: 'A', minValue: 90, maxValue: 100, deleted: false },
    SELECTED,
    { id: 3, gradeId: 12, grade: 'C', minValue: 50, maxValue: 74, deleted: true },
  ];

  async function setup(data: any = { isEdit: true, gradeListData: LIST, selectedGrade: SELECTED }) {
    qs = jasmine.createSpyObj('QualitySupervisorService', ['updateGradeConfiguration', 'createComponent']);
    master = jasmine.createSpyObj('MasterService', ['getGradeMaster']);
    master.getGradeMaster.and.returnValue(of([{ id: 10, name: 'A' }, { id: 11, name: 'B' }]));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    await TestBed.configureTestingModule({
      declarations: [EditGradeConfigComponent],
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
      .overrideTemplate(EditGradeConfigComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(EditGradeConfigComponent);
    component = fixture.componentInstance;
    component.data = data;
    fixture.detectChanges();
  }

  const form = (): any => component.editGradeConfigurationForm;

  it('patches the selected grade with the grade id locked', async () => {
    await setup();
    expect(form().getRawValue()).toEqual({ id: 2, gradeId: 11, grade: 'B', minValue: 75, maxValue: 89, deleted: false });
    expect(form().controls.gradeId.disabled).toBeTrue();
    expect(component.enableEdit).toBeTrue();
  });

  it('starts empty without a selection and shows master errors', async () => {
    await setup({});
    expect(form().getRawValue().id).toBe('');
    master.getGradeMaster.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getGrades();
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
  });

  it('max value must be greater than min value', async () => {
    await setup();
    form().patchValue({ minValue: 80, maxValue: 70 });
    expect(form().controls.maxValue.hasError('valueGreater')).toBeTrue();
  });

  describe('updateGrade', () => {
    beforeEach(() => setup());

    it('rejects a range overlapping another active grade', () => {
      component.updateGrade({ ...form().getRawValue(), maxValue: 95 });
      expect(confirmation.openDialog).toHaveBeenCalledWith('rangeExists', 'error');
      expect(qs.updateGradeConfiguration).not.toHaveBeenCalled();
    });

    it('updates an unchanged or free range and returns to the list', () => {
      qs.updateGradeConfiguration.and.returnValue(of({ ok: true }));
      component.updateGrade(form().getRawValue());
      component.updateGrade({ ...form().getRawValue(), minValue: 60 });
      expect(qs.updateGradeConfiguration).toHaveBeenCalledTimes(2);
      expect(qs.updateGradeConfiguration.calls.mostRecent().args[0]).toEqual({
        id: 2,
        gradeId: 11,
        grade: 'B',
        minValue: 60,
        maxValue: 89,
        deleted: false,
        createdBy: 'qs1',
        modifiedBy: 'qs1',
        psmId: 4,
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('updated', 'success');
      expect(qs.createComponent).toHaveBeenCalledWith(GradeConfigurationComponent, null);
    });

    it('shows update errors', () => {
      qs.updateGradeConfiguration.and.returnValue(throwError(() => ({ error: 'dup' })));
      component.updateGrade(form().getRawValue());
      qs.updateGradeConfiguration.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.updateGrade(form().getRawValue());
      expect(confirmation.openDialog).toHaveBeenCalledWith('dup', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });
  });

  it('back keeps edit values and returns after confirmation', async () => {
    await setup();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    component.back();
    expect(form().getRawValue().grade).toBe('B');
    expect(component.enableEdit).toBeFalse();
    expect(qs.createComponent).toHaveBeenCalledWith(GradeConfigurationComponent, null);
    component.back();
    expect(form().getRawValue().grade).toBeNull();
  });
});
