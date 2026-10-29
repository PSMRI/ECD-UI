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
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { GradeConfigurationComponent } from './grade-configuration.component';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { LoginserviceService } from 'src/app/app-modules/services/loginservice/loginservice.service';
import { CreateGradeConfigComponent } from '../create-grade-config/create-grade-config.component';
import { EditGradeConfigComponent } from '../edit-grade-config/edit-grade-config.component';

describe('GradeConfigurationComponent', () => {
  let component: GradeConfigurationComponent;
  let fixture: ComponentFixture<GradeConfigurationComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const lang = {
    gradeAlreadyMappedWithSameRangeName: 'gradeExists',
    areYouSureWantTo: 'Are you sure want to',
    successfully: 'successfully',
  };
  const session: any = { providerServiceMapID: 4, userName: 'qs1' };
  const GRADES = () => [
    { id: 1, gradeId: 10, grade: 'A', minValue: 90, maxValue: 100, deleted: false },
    { id: 2, gradeId: 11, grade: 'B', minValue: 75, maxValue: 89, deleted: false },
    { id: 3, gradeId: 10, grade: 'A', minValue: 95, maxValue: 100, deleted: true },
    { id: 4, gradeId: 12, grade: 'C', minValue: 85, maxValue: 92, deleted: true },
    { id: 5, gradeId: 13, grade: 'D', minValue: 0, maxValue: 50, deleted: true },
  ];

  beforeEach(async () => {
    qs = jasmine.createSpyObj('QualitySupervisorService', ['getGradesMappedData', 'updateGradeConfiguration', 'createComponent']);
    qs.getGradesMappedData.and.returnValue(of(GRADES()));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    await TestBed.configureTestingModule({
      declarations: [GradeConfigurationComponent],
      providers: [
        { provide: QualitySupervisorService, useValue: qs },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: LoginserviceService, useValue: {} },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(GradeConfigurationComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(GradeConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const grade = (id: number) => component.mappedGradeList.find((g) => g.id === id);

  it('loads numbered grades', () => {
    expect(qs.getGradesMappedData).toHaveBeenCalledWith({ providerServiceMapID: 4 });
    expect(component.dataSource.data.map((g: any) => g.sno)).toEqual([1, 2, 3, 4, 5]);
  });

  it('shows load errors', () => {
    qs.getGradesMappedData.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getGrades();
    qs.getGradesMappedData.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
    component.getGrades();
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
  });

  it('opens the create and edit screens', () => {
    component.openCreateGradeConfiguration();
    expect(qs.createComponent).toHaveBeenCalledWith(CreateGradeConfigComponent, {
      gradesData: component.mappedGradeList,
      isEdit: false,
    });
    component.editGradeMapping(grade(1));
    expect(qs.createComponent).toHaveBeenCalledWith(EditGradeConfigComponent, {
      selectedGrade: grade(1),
      gradeListData: component.mappedGradeList,
      isEdit: true,
    });
  });

  describe('range checks', () => {
    it('checkDuplicateFromMainList finds an active grade with the same id', () => {
      expect(component.checkDuplicateFromMainList(grade(3))).toBeTrue();
      expect(component.checkDuplicateFromMainList(grade(5))).toBeFalse();
    });

    it('checkDuplicateRange detects overlapping or enclosing ranges', () => {
      expect(component.checkDuplicateRange(grade(4))).toBeTrue();
      expect(component.checkDuplicateRange({ id: 9, minValue: 70, maxValue: 101 })).toBeTrue();
      expect(component.checkDuplicateRange(grade(5))).toBeFalse();
    });
  });

  describe('activateDeactivateGrade', () => {
    it('refuses to activate a duplicate grade or overlapping range', () => {
      component.activateDeactivateGrade(grade(3), 'activate');
      component.activateDeactivateGrade(grade(4), 'activate');
      expect(confirmation.openDialog).toHaveBeenCalledTimes(2);
      expect(confirmation.openDialog).toHaveBeenCalledWith('gradeExists', 'error');
      expect(qs.updateGradeConfiguration).not.toHaveBeenCalled();
    });

    it('activates a non-overlapping grade and reloads', () => {
      qs.updateGradeConfiguration.and.returnValue(of({ response: 'ok' }));
      qs.getGradesMappedData.calls.reset();
      component.activateDeactivateGrade(grade(5), 'activate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Are you sure want to Activated?', 'confirm');
      expect(qs.updateGradeConfiguration).toHaveBeenCalledWith({
        id: 5,
        gradeId: 13,
        grade: 'D',
        minValue: 0,
        maxValue: 50,
        createdBy: 'qs1',
        modifiedBy: 'qs1',
        psmId: 4,
        deleted: 'false',
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('Activated successfully', 'success');
      expect(qs.getGradesMappedData).toHaveBeenCalled();
    });

    it('deactivates with deleted true and reports failures', () => {
      qs.updateGradeConfiguration.and.returnValue(of({ errorMessage: 'nope' }));
      component.activateDeactivateGrade(grade(1), 'deactivate');
      expect(qs.updateGradeConfiguration.calls.mostRecent().args[0].deleted).toBe('true');
      expect(confirmation.openDialog).toHaveBeenCalledWith('nope', 'error');
      qs.updateGradeConfiguration.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.activateDeactivateGrade(grade(1), 'deactivate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });

    it('does nothing when declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.activateDeactivateGrade(grade(1), 'deactivate');
      expect(qs.updateGradeConfiguration).not.toHaveBeenCalled();
    });
  });

  it('filterSearchTerm matches grade or values', () => {
    component.filterSearchTerm('b');
    expect(component.dataSource.data.map((g: any) => g.id)).toEqual([2]);
    component.filterSearchTerm('100');
    expect(component.dataSource.data.map((g: any) => g.id)).toEqual([1, 3]);
    component.filterSearchTerm('');
    expect(component.dataSource.data.length).toBe(5);
  });
});
