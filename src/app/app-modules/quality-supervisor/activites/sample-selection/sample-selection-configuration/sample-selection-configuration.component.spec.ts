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

import { SampleSelectionConfigurationComponent } from './sample-selection-configuration.component';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { LoginserviceService } from 'src/app/app-modules/services/loginservice/loginservice.service';
import { CreateSampleSelectionComponent } from '../create-sample-selection/create-sample-selection.component';
import { EditSampleSelectionComponent } from '../edit-sample-selection/edit-sample-selection.component';

describe('SampleSelectionConfigurationComponent', () => {
  let component: SampleSelectionConfigurationComponent;
  let fixture: ComponentFixture<SampleSelectionConfigurationComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const lang = {
    cycleAlreadyMappedWithSameNameRange: 'gradeExists',
    areYouSureWantTo: 'Are you sure want to',
    successfully: 'successfully',
  };
  const session: any = { providerServiceMapID: 4, userName: 'qs1' };
  const GRADES = () => [
    { id: 1, cycleId: 10, cycleName: 'A', fromDay: 90, toDay: 100, deleted: false },
    { id: 2, cycleId: 11, cycleName: 'B', fromDay: 75, toDay: 89, deleted: false },
    { id: 3, cycleId: 10, cycleName: 'A', fromDay: 95, toDay: 100, deleted: true },
    { id: 4, cycleId: 12, cycleName: 'C', fromDay: 85, toDay: 92, deleted: true },
    { id: 5, cycleId: 13, cycleName: 'D', fromDay: 0, toDay: 50, deleted: true },
  ];

  beforeEach(async () => {
    qs = jasmine.createSpyObj('QualitySupervisorService', ['getCycleMappedData', 'updateCycleConfiguration', 'createComponent']);
    qs.getCycleMappedData.and.returnValue(of(GRADES()));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    await TestBed.configureTestingModule({
      declarations: [SampleSelectionConfigurationComponent],
      providers: [
        { provide: QualitySupervisorService, useValue: qs },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: LoginserviceService, useValue: {} },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(SampleSelectionConfigurationComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(SampleSelectionConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const grade = (id: number) => component.mappedSampleList.find((g) => g.id === id);

  it('loads numbered cycles', () => {
    expect(qs.getCycleMappedData).toHaveBeenCalledWith({ providerServiceMapID: 4 });
    expect(component.dataSource.data.map((g: any) => g.sno)).toEqual([1, 2, 3, 4, 5]);
  });

  it('shows load errors', () => {
    qs.getCycleMappedData.and.returnValue(throwError(() => ({ error: 'down' })));
    component.getSampleList();
    qs.getCycleMappedData.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
    component.getSampleList();
    expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
    expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
  });

  it('opens the create and edit screens', () => {
    component.openCreateSampleConfiguration();
    expect(qs.createComponent).toHaveBeenCalledWith(CreateSampleSelectionComponent, {
      cycleData: component.mappedSampleList,
      isEdit: false,
    });
    component.editSampleSelection(grade(1));
    expect(qs.createComponent).toHaveBeenCalledWith(EditSampleSelectionComponent, {
      selectedCycle: grade(1),
      cycleListData: component.mappedSampleList,
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
      expect(component.checkDuplicateRange({ id: 9, fromDay: 70, toDay: 101 })).toBeTrue();
      expect(component.checkDuplicateRange(grade(5))).toBeFalse();
    });
  });

  describe('activateDeactivateGrade', () => {
    it('refuses to activate a duplicate grade or overlapping range', () => {
      component.activateDeactivateGrade(grade(3), 'activate');
      component.activateDeactivateGrade(grade(4), 'activate');
      expect(confirmation.openDialog).toHaveBeenCalledTimes(2);
      expect(confirmation.openDialog).toHaveBeenCalledWith('gradeExists', 'error');
      expect(qs.updateCycleConfiguration).not.toHaveBeenCalled();
    });

    it('activates a non-overlapping grade and reloads', () => {
      qs.updateCycleConfiguration.and.returnValue(of({ response: 'ok' }));
      qs.getCycleMappedData.calls.reset();
      component.activateDeactivateGrade(grade(5), 'activate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('Are you sure want to Activated?', 'confirm');
      expect(qs.updateCycleConfiguration).toHaveBeenCalledWith({
        id: 5,
        cycleId: 13,
        cycleName: 'D',
        fromDay: 0,
        toDay: 50,
        ancSampleSize: undefined,
        pncSampleSize: undefined,
        totalSampleSize: undefined,
        createdBy: 'qs1',
        modifiedBy: 'qs1',
        psmId: 4,
        deleted: 'false',
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('Activated successfully', 'success');
      expect(qs.getCycleMappedData).toHaveBeenCalled();
    });

    it('deactivates with deleted true and reports failures', () => {
      qs.updateCycleConfiguration.and.returnValue(of({ errorMessage: 'nope' }));
      component.activateDeactivateGrade(grade(1), 'deactivate');
      expect(qs.updateCycleConfiguration.calls.mostRecent().args[0].deleted).toBe('true');
      expect(confirmation.openDialog).toHaveBeenCalledWith('nope', 'error');
      qs.updateCycleConfiguration.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.activateDeactivateGrade(grade(1), 'deactivate');
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });

    it('does nothing when declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.activateDeactivateGrade(grade(1), 'deactivate');
      expect(qs.updateCycleConfiguration).not.toHaveBeenCalled();
    });
  });

  it('filterSearchTerm matches cycle or day values', () => {
    component.filterSearchTerm('b');
    expect(component.dataSource.data.map((g: any) => g.id)).toEqual([2]);
    component.filterSearchTerm('100');
    expect(component.dataSource.data.map((g: any) => g.id)).toEqual([1, 3]);
    component.filterSearchTerm('');
    expect(component.dataSource.data.length).toBe(5);
  });
});
