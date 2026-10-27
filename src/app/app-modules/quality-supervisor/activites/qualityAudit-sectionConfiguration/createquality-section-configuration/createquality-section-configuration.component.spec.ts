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
import { FormBuilder, FormControl } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { QualitySectionConfigurationComponent } from '../quality-section-configuration/quality-section-configuration.component';
import { CreatequalitySectionConfigurationComponent } from './createquality-section-configuration.component';

describe('CreatequalitySectionConfigurationComponent', () => {
  let component: CreatequalitySectionConfigurationComponent;
  let fixture: ComponentFixture<CreatequalitySectionConfigurationComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const lang = { rankExist: 'rankExist', sectionCreatedSuccessfully: 'created' };
  const session: any = { providerServiceMapID: 4, userName: 'qs1' };

  async function setup(existing: any[] = [{ rank: 1, deleted: false }, { rank: 2, deleted: true }]) {
    qs = jasmine.createSpyObj('QualitySupervisorService', ['createSectionConfiguration', 'createComponent']);
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    await TestBed.configureTestingModule({
      declarations: [CreatequalitySectionConfigurationComponent],
      providers: [
        FormBuilder,
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: QualitySupervisorService, useValue: qs },
        { provide: ConfirmationService, useValue: confirmation },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CreatequalitySectionConfigurationComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(CreatequalitySectionConfigurationComponent);
    component = fixture.componentInstance;
    component.data = { qualityAuditSectionData: existing };
    fixture.detectChanges();
  }

  const form = (): any => component.createQualityAuditSectionForm;
  const section = (rank: number) => ({ sectionName: 'S' + rank, sectionDescription: 'About ' + rank, rank });

  it('validates the section fields', async () => {
    await setup();
    expect(form().valid).toBeFalse();
    form().setValue({ sectionName: ' ', sectionDescription: '    ', rank: 3 });
    expect(form().controls.sectionName.hasError('whitespace')).toBeTrue();
    expect(form().controls.sectionDescription.hasError('nonWhitespace')).toBeTrue();
    form().setValue(section(3));
    expect(form().valid).toBeTrue();
    expect(component.validateWhitespace(new FormControl(null))).toBeUndefined();
  });

  describe('addSections', () => {
    beforeEach(() => setup());

    it('adds a section with a new rank', () => {
      component.addSections(section(3));
      expect(component.dataSource.data).toEqual([
        { sectionName: 'S3', sectionDesc: 'About 3', rank: 3, createdBy: 'qs1', psmId: 4 } as any,
      ]);
    });

    it('rejects ranks used in the pending list or by active sections', () => {
      component.addSections(section(3));
      component.addSections(section(3));
      component.addSections(section(1));
      expect(component.dataSource.data.length).toBe(1);
      expect(confirmation.openDialog).toHaveBeenCalledTimes(2);
      expect(confirmation.openDialog).toHaveBeenCalledWith('rankExist', 'error');
    });

    it('allows ranks of deleted sections', () => {
      component.addSections(section(2));
      expect(component.dataSource.data.length).toBe(1);
    });

    it('removeSection drops a pending section', () => {
      component.addSections(section(3));
      component.addSections(section(4));
      component.removeSection(0);
      expect(component.dataSource.data.map((s: any) => s.rank)).toEqual([4]);
    });
  });

  it('accepts any rank when there are no existing sections', async () => {
    await setup([]);
    expect(component.checkDuplicateRangeFromMainList({ rank: 1 })).toBeFalse();
  });

  describe('createSectionConfiguration', () => {
    beforeEach(async () => {
      await setup();
      component.addSections(section(3));
    });

    it('saves the pending sections and returns to the list', () => {
      qs.createSectionConfiguration.and.returnValue(of({ ok: true }));
      component.createSectionConfiguration();
      expect(qs.createSectionConfiguration).toHaveBeenCalledWith([
        { sectionName: 'S3', sectionDesc: 'About 3', rank: 3, createdBy: 'qs1', psmId: 4 } as any,
      ]);
      expect(confirmation.openDialog).toHaveBeenCalledWith('created', 'success');
      expect(component.dataSource.data).toEqual([]);
      expect(qs.createComponent).toHaveBeenCalledWith(QualitySectionConfigurationComponent, null);
    });

    it('shows errors', () => {
      qs.createSectionConfiguration.and.returnValue(throwError(() => ({ error: 'dup' })));
      component.createSectionConfiguration();
      qs.createSectionConfiguration.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.createSectionConfiguration();
      expect(confirmation.openDialog).toHaveBeenCalledWith('dup', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });
  });

  it('back clears pending sections after confirmation', async () => {
    await setup();
    component.addSections(section(3));
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
    component.back();
    expect(component.dataSource.data.length).toBe(1);
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    component.back();
    expect(component.dataSource.data).toEqual([]);
    expect(qs.createComponent).toHaveBeenCalledWith(QualitySectionConfigurationComponent, null);
  });
});
