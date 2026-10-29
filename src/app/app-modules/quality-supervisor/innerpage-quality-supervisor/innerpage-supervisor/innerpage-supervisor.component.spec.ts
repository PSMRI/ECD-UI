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
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { InnerpageSupervisorComponent } from './innerpage-supervisor.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { AgentMappingConfigurationComponent } from '../../activites/agent-mapping-configuration/agent-mapping-configuration.component';
import { GradeConfigurationComponent } from '../../activites/Grade-config/grade-configuration/grade-configuration.component';
import { ReportsQualitySupervisorComponent } from '../../activites/reports-quality-supervisor/reports-quality-supervisor.component';

describe('InnerpageSupervisorComponent (quality supervisor)', () => {
  let component: InnerpageSupervisorComponent;
  let fixture: ComponentFixture<InnerpageSupervisorComponent>;
  let qs: jasmine.SpyObj<QualitySupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let router: jasmine.SpyObj<Router>;
  let params$: BehaviorSubject<any>;
  const lang = {
    areYouSureYouWouldLikeToGoBack: 'areYouSureYouWouldLikeToGoBack',
    unableToRouteToTheSelectedAreaPleaseChooseManually: 'unableToRoute',
  };

  async function setup(params: any) {
    qs = jasmine.createSpyObj('QualitySupervisorService', ['setContainer', 'createComponent']);
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    params$ = new BehaviorSubject<any>(params);

    await TestBed.configureTestingModule({
      declarations: [InnerpageSupervisorComponent],
      providers: [
        FormBuilder,
        { provide: Router, useValue: router },
        { provide: QualitySupervisorService, useValue: qs },
        { provide: ActivatedRoute, useValue: { queryParams: params$ } },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SetLanguageService, useValue: { languageData: lang } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(InnerpageSupervisorComponent, '<ng-template #dynamicContent></ng-template>')
      .compileComponents();
    fixture = TestBed.createComponent(InnerpageSupervisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('opens the routed activity and selects it in the header', async () => {
    await setup({ data: 'agentQualityAuditorMapping' });
    expect(qs.setContainer).toHaveBeenCalledWith(component.container);
    expect(qs.createComponent).toHaveBeenCalledWith(AgentMappingConfigurationComponent, null);
    expect(component.innerpageQSHeaderForm.value.selectedActivity).toBe('agentQualityAuditorMapping');
  });

  it('does not select unknown activities in the header', async () => {
    await setup({ data: 'unknown' });
    expect(qs.createComponent).toHaveBeenCalledWith(undefined, null);
    expect(component.innerpageQSHeaderForm.value.selectedActivity).toBe('');
  });

  it('asks to choose manually when there are no route params', async () => {
    await setup(null);
    expect(confirmation.openDialog).toHaveBeenCalledWith('unableToRoute', 'info');
    expect(qs.createComponent).not.toHaveBeenCalled();
  });

  it('switches the activity on selection change', async () => {
    await setup({ data: 'reports' });
    component.onSelectionChange({ value: 'gradeConfiguration' });
    expect(qs.createComponent).toHaveBeenCalledWith(GradeConfigurationComponent, null);
    expect(qs.createComponent).toHaveBeenCalledWith(ReportsQualitySupervisorComponent, null);
  });

  it('goes back to the dashboard only after confirmation', async () => {
    await setup({ data: 'reports' });
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
    component.navigateToPrev();
    expect(router.navigate).not.toHaveBeenCalled();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    component.navigateToPrev();
    expect(confirmation.openDialog).toHaveBeenCalledWith('areYouSureYouWouldLikeToGoBack', 'confirm');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
