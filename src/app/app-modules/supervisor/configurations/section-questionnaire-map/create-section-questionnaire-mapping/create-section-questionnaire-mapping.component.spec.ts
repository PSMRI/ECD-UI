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
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { CreateSectionQuestionnaireMappingComponent } from './create-section-questionnaire-mapping.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { SectionQuestionnaireMappingComponent } from '../section-questionnaire-mapping/section-questionnaire-mapping.component';

describe('CreateSectionQuestionnaireMappingComponent', () => {
  let component: CreateSectionQuestionnaireMappingComponent;
  let fixture: ComponentFixture<CreateSectionQuestionnaireMappingComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let master: jasmine.SpyObj<MasterService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let tracking: jasmine.SpyObj<AmritTrackingService>;

  const lang = {
    rankAlreadyExists: 'rankAlreadyExists',
    doYouReallyWantToCancelUnsavedData: 'doYouReallyWantToCancelUnsavedData',
    sectionQuestionnaireMappedSuccessfully: 'sectionQuestionnaireMappedSuccessfully',
  };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };
  const sections = [{ sectionId: 1, sectionName: 'Intro' }, { sectionId: 2, sectionName: 'ANC' }];
  const unmapped = [
    { questionnaireId: 101, questionnaireType: 'Question', questionnaire: 'Is mother healthy?' },
    { questionnaireId: 102, questionnaireType: 'Information', questionnaire: 'Diet advice' },
    { questionnaireId: 103, questionnaireType: 'Question', questionnaire: 'Vaccination done?' },
  ];
  const mainList = [
    { sectionid: 1, sectionQuestionRank: 5, deleted: false },
    { sectionid: 1, sectionQuestionRank: 6, deleted: true },
    { sectionid: 2, sectionQuestionRank: 7, deleted: false },
  ];

  function create(data: any = { mapSectionQuestionnaireData: mainList }) {
    fixture = TestBed.createComponent(CreateSectionQuestionnaireMappingComponent);
    component = fixture.componentInstance;
    component.data = data;
    fixture.detectChanges();
  }

  function loadSection(id = 1) {
    component.getUnMappedQuestionnaireMaster(id);
  }

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', [
      'getUnMappedQuestionnaires', 'saveQuestionnaireSectionMapping', 'createComponent',
    ]);
    supervisor.getUnMappedQuestionnaires.and.returnValue(of(unmapped));
    master = jasmine.createSpyObj('MasterService', ['getSectionMaster', 'getRoleMaster']);
    master.getSectionMaster.and.returnValue(of(sections));
    master.getRoleMaster.and.returnValue(of([
      { roleName: 'ANM' }, { roleName: 'MO' }, { roleName: 'Supervisor' },
      { roleName: 'Quality Auditor' }, { roleName: 'Quality Supervisor' }, { roleName: 'Associate' },
    ]));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [CreateSectionQuestionnaireMappingComponent],
      providers: [
        FormBuilder,
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: SupervisorService, useValue: supervisor },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: MasterService, useValue: master },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CreateSectionQuestionnaireMappingComponent, '')
      .compileComponents();
  });

  describe('init', () => {
    it('should create and load sections, roles and the existing mapping list', () => {
      create();
      expect(component).toBeTruthy();
      expect(master.getSectionMaster).toHaveBeenCalledWith(4);
      expect(component.sectionList).toEqual(sections);
      expect(component.mapSectionQuestionnaireMainList).toEqual(mainList);
    });

    it('should exclude supervisor and quality roles', () => {
      create();
      expect(component.roles.map((r: any) => r.roleName)).toEqual(['ANM', 'MO', 'Associate']);
    });

    it('should leave the main list undefined when not provided', () => {
      create({});
      expect(component.mapSectionQuestionnaireMainList).toBeUndefined();
    });

    it('should show err.error when sections fail to load', () => {
      master.getSectionMaster.and.returnValue(throwError(() => ({ error: 'sec failed' })));
      create();
      expect(confirmation.openDialog).toHaveBeenCalledWith('sec failed', 'error');
    });

    it('should show title + detail when sections fail without err.error', () => {
      master.getSectionMaster.and.returnValue(throwError(() => ({ title: 'A', detail: 'B' })));
      create();
      expect(confirmation.openDialog).toHaveBeenCalledWith('AB', 'error');
    });
  });

  describe('loading unmapped questionnaires', () => {
    beforeEach(() => create());

    it('should build both form arrays, set the section and show the table', () => {
      loadSection(2);
      expect(supervisor.getUnMappedQuestionnaires).toHaveBeenCalledWith(4, 2);
      expect(component.questionnaireList.length).toBe(3);
      expect(component.quesDupList.length).toBe(3);
      expect(component.enableQuestionnaireTable).toBeTrue();
      expect(component.dataSource.data.length).toBe(3);
      expect(component.sectionQuestionnaireMapForm.controls['sectionid'].value as any).toBe(2);
      expect(component.sectionQuestionnaireMapForm.controls['sectionName'].value as any).toBe('ANC');
    });

    it('should disable selection until rank and role are entered', () => {
      loadSection();
      expect(component.questionnaireList.at(0).get('selected')?.disabled).toBeTrue();
    });

    it('switching section should replace the previous list and clear selections', () => {
      loadSection(1);
      component.selectedQuestionnaires = [{ questionnaireId: 101 }];
      supervisor.getUnMappedQuestionnaires.and.returnValue(of([unmapped[0]]));
      loadSection(2);
      expect(component.questionnaireList.length).toBe(1);
      expect(component.selectedQuestionnaires).toEqual([]);
    });

    it('should show err.error when loading fails', () => {
      supervisor.getUnMappedQuestionnaires.and.returnValue(throwError(() => ({ error: 'um failed' })));
      loadSection();
      expect(confirmation.openDialog).toHaveBeenCalledWith('um failed', 'error');
      expect(component.enableQuestionnaireTable).toBeFalse();
    });

    it('should show title + detail when loading fails without err.error', () => {
      supervisor.getUnMappedQuestionnaires.and.returnValue(throwError(() => ({ title: 'X', detail: 'Y' })));
      loadSection();
      expect(confirmation.openDialog).toHaveBeenCalledWith('XY', 'error');
    });
  });

  describe('selecting questionnaires', () => {
    beforeEach(() => {
      create();
      loadSection(1);
    });

    it('should add an item with a unique rank and mark it selected', () => {
      const item: any = { questionnaireId: 101, rank: 1, roleType: ['ANM'] };
      component.addQuestionnaire({ checked: true } as any, item);
      expect(component.selectedQuestionnaires).toEqual([{ questionnaireId: 101, rank: 1, roles: ['ANM'] }]);
      expect(item.selected).toBeTrue();
      expect(component.quesDupList.at(0).value.selected).toBeTrue();
    });

    it('should reject a rank already selected in this session', () => {
      component.addQuestionnaire({ checked: true } as any, { questionnaireId: 101, rank: 1 });
      const dup: any = { questionnaireId: 102, rank: 1 };
      component.addQuestionnaire({ checked: true } as any, dup);
      expect(confirmation.openDialog).toHaveBeenCalledWith('rankAlreadyExists', 'error');
      expect(component.selectedQuestionnaires.length).toBe(1);
      expect(dup.selected).toBeFalse();
      expect(dup.rank).toBeNull();
      expect(component.questionnaireList.at(1).value.rank).toBeNull();
    });

    it('should reject a rank already used by an active mapping in the same section', () => {
      component.addQuestionnaire({ checked: true } as any, { questionnaireId: 101, rank: 5 });
      expect(confirmation.openDialog).toHaveBeenCalledWith('rankAlreadyExists', 'error');
      expect(component.selectedQuestionnaires).toEqual([]);
    });

    it('should allow a rank used by a deleted mapping or another section', () => {
      component.addQuestionnaire({ checked: true } as any, { questionnaireId: 101, rank: 6 });
      component.addQuestionnaire({ checked: true } as any, { questionnaireId: 102, rank: 7 });
      expect(component.selectedQuestionnaires.length).toBe(2);
    });

    it('unchecking should remove the item and mark it unselected', () => {
      const item: any = { questionnaireId: 101, rank: 1 };
      component.addQuestionnaire({ checked: true } as any, item);
      component.addQuestionnaire({ checked: false } as any, item);
      expect(component.selectedQuestionnaires).toEqual([]);
      expect(item.selected).toBeFalse();
      expect(component.quesDupList.at(0).value.selected).toBeFalse();
    });
  });

  describe('removeCheck (rank/role edits)', () => {
    beforeEach(() => {
      create();
      loadSection(1);
    });

    it('should enable selection once a rank is entered and sync it to the copy list', () => {
      const ctrl: any = component.questionnaireList.at(0);
      ctrl.patchValue({ rank: 3 });
      component.removeCheck(ctrl);
      expect(ctrl.get('selected').enabled).toBeTrue();
      expect(component.quesDupList.at(0).value.rank).toBe(3);
    });

    it('should clear and disable out-of-range ranks', () => {
      [0, -1, 10001].forEach((rank) => {
        const ctrl: any = component.questionnaireList.at(0);
        ctrl.get('selected').enable();
        ctrl.patchValue({ rank });
        component.removeCheck(ctrl);
        expect(ctrl.get('selected').disabled).toBeTrue();
        expect(component.questionnaireList.at(0).value.rank).toBeNull();
        expect(component.quesDupList.at(0).value.rank).toBeNull();
      });
    });

    it('clearing the rank should drop the item from the selection', () => {
      const ctrl: any = component.questionnaireList.at(0);
      component.addQuestionnaire({ checked: true } as any, { questionnaireId: 101, rank: 2 });
      ctrl.patchValue({ rank: '' });
      component.removeCheck(ctrl);
      expect(component.selectedQuestionnaires).toEqual([]);
      expect(component.quesDupList.at(0).value.selected).toBeNull();
    });
  });

  describe('getActualIndex', () => {
    beforeEach(() => create());

    it('should offset by page when a paginator exists', () => {
      component.paginator = { pageSize: 5, pageIndex: 2 } as any;
      expect(component.getActualIndex(1)).toBe(11);
    });

    it('should return the index unchanged without a paginator', () => {
      component.paginator = null;
      expect(component.getActualIndex(3)).toBe(3);
    });
  });

  describe('filterSearchTerm', () => {
    beforeEach(() => {
      create();
      loadSection(1);
    });

    it('should filter by questionnaire text or type, case-insensitively', () => {
      component.filterSearchTerm('VACCIN');
      expect(component.dataSource.data.length).toBe(1);
      component.filterSearchTerm('information');
      expect(component.dataSource.data.length).toBe(1);
      component.filterSearchTerm('question');
      expect(component.dataSource.data.length).toBe(2);
    });

    it('should restore the full list for an empty search', () => {
      component.filterSearchTerm('zzz');
      expect(component.dataSource.data.length).toBe(0);
      component.filterSearchTerm('');
      expect(component.dataSource.data.length).toBe(3);
      expect(component.questionnaireList.controls.length).toBe(3);
    });
  });

  describe('save', () => {
    beforeEach(() => {
      create();
      loadSection(1);
      component.addQuestionnaire({ checked: true } as any, { questionnaireId: 101, rank: 1, roleType: ['ANM'] });
    });

    it('should save selected questionnaires and return to the list', () => {
      supervisor.saveQuestionnaireSectionMapping.and.returnValue(of({ response: 'ok' }));
      component.saveSectionQuestionnaireMapping();
      expect(supervisor.saveQuestionnaireSectionMapping).toHaveBeenCalledWith({
        questionIds: [{ questionnaireId: 101, rank: 1, roles: ['ANM'] }],
        sectionId: 1,
        createdBy: 'sup1',
        psmId: 4,
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('sectionQuestionnaireMappedSuccessfully', 'success');
      expect(component.questionnaireList.length).toBe(0);
      expect(component.selectedQuestionnaires).toEqual([]);
      expect(supervisor.createComponent).toHaveBeenCalledWith(SectionQuestionnaireMappingComponent, null);
    });

    it('should show the error message when the save is rejected', () => {
      supervisor.saveQuestionnaireSectionMapping.and.returnValue(of({ errorMessage: 'dup' }));
      component.saveSectionQuestionnaireMapping();
      expect(confirmation.openDialog).toHaveBeenCalledWith('dup', 'error');
      expect(component.selectedQuestionnaires.length).toBe(1);
    });

    it('should show err.error when save fails', () => {
      supervisor.saveQuestionnaireSectionMapping.and.returnValue(throwError(() => ({ error: 'save failed' })));
      component.saveSectionQuestionnaireMapping();
      expect(confirmation.openDialog).toHaveBeenCalledWith('save failed', 'error');
    });

    it('should show title + detail when save fails without err.error', () => {
      supervisor.saveQuestionnaireSectionMapping.and.returnValue(throwError(() => ({ title: 'P', detail: 'Q' })));
      component.saveSectionQuestionnaireMapping();
      expect(confirmation.openDialog).toHaveBeenCalledWith('PQ', 'error');
    });
  });

  describe('back', () => {
    beforeEach(() => {
      create();
      loadSection(1);
    });

    it('should reset and return to the list when confirmed', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      component.back();
      expect(component.questionnaireList.length).toBe(0);
      expect(component.dataSource.data).toEqual([]);
      expect(supervisor.createComponent).toHaveBeenCalledWith(SectionQuestionnaireMappingComponent, null);
    });

    it('should stay when cancelled', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.back();
      expect(component.questionnaireList.length).toBe(3);
      expect(supervisor.createComponent).not.toHaveBeenCalled();
    });
  });

  it('applyFilter should trim and lowercase the filter', () => {
    create();
    component.applyFilter('  ABC ');
    expect(component.dataSource.filter).toBe('abc');
  });

  // Documents current behaviour: the page name is copy-pasted as 'Abha Information'.
  it('trackFieldInteraction reports under the "Abha Information" page name', () => {
    create();
    component.trackFieldInteraction('rank');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('rank', 'Abha Information');
  });
});
