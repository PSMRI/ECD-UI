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

import { EditSectionQuestionnaireMappingComponent } from './edit-section-questionnaire-mapping.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { SectionQuestionnaireMappingComponent } from '../section-questionnaire-mapping/section-questionnaire-mapping.component';

describe('EditSectionQuestionnaireMappingComponent', () => {
  let component: EditSectionQuestionnaireMappingComponent;
  let fixture: ComponentFixture<EditSectionQuestionnaireMappingComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let master: jasmine.SpyObj<MasterService>;
  let tracking: jasmine.SpyObj<AmritTrackingService>;
  const lang = {
    doYouReallyWantToCancelUnsavedData: 'cancelUnsaved',
    rankAlreadyExists: 'rankExists',
    sectionQuestionnaireMappingUpdatedSuccessfully: 'updated',
  };
  const session: any = { providerServiceMapID: 4, userName: 'sup1' };
  const SELECTED = {
    id: 1, sectionid: 5, sectionName: 'Pregnancy', questionType: 'Yes/No', questionid: 10,
    question: 'Any pain?', sectionQuestionRank: 1, roles: ['ANM'], deleted: false,
  };
  const LIST = [
    SELECTED,
    { id: 2, sectionid: 5, sectionQuestionRank: 2, deleted: false },
    { id: 3, sectionid: 5, sectionQuestionRank: 3, deleted: true },
    { id: 4, sectionid: 6, sectionQuestionRank: 4, deleted: false },
  ];

  async function setup(data: any = { selectedQuestionnaireSectionData: SELECTED, questionnaireSectionData: LIST }) {
    supervisor = jasmine.createSpyObj('SupervisorService', ['updateQuestionnaireSectionMapping', 'createComponent']);
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    master = jasmine.createSpyObj('MasterService', ['getRoleMaster']);
    master.getRoleMaster.and.returnValue(
      of([{ roleName: 'Supervisor' }, { roleName: 'ANM' }, { roleName: 'Quality Auditor' }, { roleName: 'Associate' }, { roleName: 'Quality Supervisor' }]),
    );
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [EditSectionQuestionnaireMappingComponent],
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
      .overrideTemplate(EditSectionQuestionnaireMappingComponent, '')
      .compileComponents();
    spyOn(console, 'log');
    fixture = TestBed.createComponent(EditSectionQuestionnaireMappingComponent);
    component = fixture.componentInstance;
    component.data = data;
    fixture.detectChanges();
  }

  const form = (): any => component.editQuestionnaireSectionMappingForm;

  it('patches the selected mapping and loads non-supervisory roles', async () => {
    await setup();
    expect(form().getRawValue()).toEqual({
      id: 1, sectionid: 5, sectionName: 'Pregnancy', questionType: 'Yes/No', questionid: 10,
      question: 'Any pain?', sectionQuestionRank: 1, deleted: false, roleType: ['ANM'],
    });
    expect(master.getRoleMaster).toHaveBeenCalledWith(4);
    expect(component.roles.map((r: any) => r.roleName)).toEqual(['ANM', 'Associate']);
  });

  it('leaves the form empty without a selection', async () => {
    await setup({});
    expect(form().getRawValue().id).toBe('');
    expect(component.questionnaireSectionMapList).toEqual([]);
  });

  describe('updateQuestionnairesSectionMap', () => {
    beforeEach(() => setup());

    it('rejects a rank used by another active question in the section', () => {
      component.updateQuestionnairesSectionMap({ ...form().getRawValue(), sectionQuestionRank: 2 });
      expect(confirmation.openDialog).toHaveBeenCalledWith('rankExists', 'error');
      expect(supervisor.updateQuestionnaireSectionMapping).not.toHaveBeenCalled();
    });

    it('allows ranks of deleted questions or other sections', () => {
      supervisor.updateQuestionnaireSectionMapping.and.returnValue(of({ response: 'ok' }));
      component.updateQuestionnairesSectionMap({ ...form().getRawValue(), sectionQuestionRank: 3 });
      component.updateQuestionnairesSectionMap({ ...form().getRawValue(), sectionQuestionRank: 4 });
      expect(supervisor.updateQuestionnaireSectionMapping).toHaveBeenCalledTimes(2);
    });

    it('updates the mapping and returns to the list', () => {
      supervisor.updateQuestionnaireSectionMapping.and.returnValue(of({ response: 'ok' }));
      component.updateQuestionnairesSectionMap(form().getRawValue());
      expect(supervisor.updateQuestionnaireSectionMapping).toHaveBeenCalledWith({
        id: 1, questionId: 10, sectionId: 5, rank: 1, roles: ['ANM'],
        createdBy: 'sup1', modifiedBy: 'sup1', deleted: false, psmId: 4,
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('updated', 'success');
      expect(component.selectedQuestionnaireSectionList).toBeNull();
      expect(supervisor.createComponent).toHaveBeenCalledWith(SectionQuestionnaireMappingComponent, null);
    });

    it('shows update failures', () => {
      supervisor.updateQuestionnaireSectionMapping.and.returnValue(of({ errorMessage: 'nope' }));
      component.updateQuestionnairesSectionMap(form().getRawValue());
      supervisor.updateQuestionnaireSectionMapping.and.returnValue(throwError(() => ({ error: 'down' })));
      component.updateQuestionnairesSectionMap(form().getRawValue());
      supervisor.updateQuestionnaireSectionMapping.and.returnValue(throwError(() => ({ title: 'T', detail: 'D' })));
      component.updateQuestionnairesSectionMap(form().getRawValue());
      expect(confirmation.openDialog).toHaveBeenCalledWith('nope', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('down', 'error');
      expect(confirmation.openDialog).toHaveBeenCalledWith('TD', 'error');
    });
  });

  describe('back', () => {
    beforeEach(() => setup());

    it('resets and returns to the list after confirmation', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      component.back();
      expect(confirmation.openDialog).toHaveBeenCalledWith('cancelUnsaved', 'confirm');
      expect(component.questionnaireSectionMapList).toEqual([]);
      expect(supervisor.createComponent).toHaveBeenCalledWith(SectionQuestionnaireMappingComponent, null);
    });

    it('stays when declined', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.back();
      expect(supervisor.createComponent).not.toHaveBeenCalled();
    });
  });

  it('tracks field interactions', async () => {
    await setup();
    component.trackFieldInteraction('rank');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('rank', 'Edit Section Questionnaire Mapping');
  });
});
