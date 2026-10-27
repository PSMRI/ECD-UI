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
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { InnerpageSupervisorComponent } from './innerpage-supervisor.component';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { UploadexcelComponent } from '../../activities/uploadexcel/uploadexcel.component';
import { SmsTemplateComponent } from '../../configurations/sms-template/sms-template/sms-template.component';
import { SupervisorReportsComponent } from '../../supervisor-reports/supervisor-reports/supervisor-reports.component';
import { ForceLogoutComponent } from '../../activities/force-logout/force-logout.component';

describe('InnerpageSupervisorComponent (supervisor)', () => {
  let component: InnerpageSupervisorComponent;
  let fixture: ComponentFixture<InnerpageSupervisorComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let router: jasmine.SpyObj<Router>;
  let tracking: jasmine.SpyObj<AmritTrackingService>;
  const lang = {
    areYouSureYouWouldLikeToGoBack: 'areYouSureYouWouldLikeToGoBack',
    unableToRouteToTheSelectedAreaPleaseChooseManually: 'unableToRoute',
  };

  async function setup(params: any) {
    supervisor = jasmine.createSpyObj('SupervisorService', ['setContainer', 'createComponent']);
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);

    await TestBed.configureTestingModule({
      declarations: [InnerpageSupervisorComponent],
      providers: [
        FormBuilder,
        { provide: Router, useValue: router },
        { provide: SupervisorService, useValue: supervisor },
        { provide: ActivatedRoute, useValue: { queryParams: new BehaviorSubject<any>(params) } },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SetLanguageService, useValue: { languageData: lang } },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(InnerpageSupervisorComponent, '<ng-template #dynamicContent></ng-template>')
      .compileComponents();
    fixture = TestBed.createComponent(InnerpageSupervisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const header = () => component.innerpageheaderForm.value;

  it('opens a routed activity in the activity dropdown', async () => {
    await setup({ data: 'dataUpload' });
    expect(supervisor.setContainer).toHaveBeenCalledWith(component.container);
    expect(supervisor.createComponent).toHaveBeenCalledWith(UploadexcelComponent, null);
    expect(header()).toEqual({ selectedActivity: 'dataUpload', selectedReport: '', selectedConfiguration: '' });
  });

  it('opens a routed configuration in the configuration dropdown', async () => {
    await setup({ data: 'smsTemplate' });
    expect(supervisor.createComponent).toHaveBeenCalledWith(SmsTemplateComponent, null);
    expect(header().selectedConfiguration).toBe('smsTemplate');
  });

  it('treats anything else as a report', async () => {
    await setup({ data: 'reports' });
    expect(supervisor.createComponent).toHaveBeenCalledWith(SupervisorReportsComponent, null);
    expect(header().selectedReport).toBe('reports');
  });

  it('asks to choose manually without route params', async () => {
    await setup(null);
    expect(confirmation.openDialog).toHaveBeenCalledWith('unableToRoute', 'info');
  });

  describe('onSelectionChange', () => {
    beforeEach(async () => {
      await setup({ data: 'dataUpload' });
      component.innerpageheaderForm.setValue({
        selectedActivity: 'a',
        selectedReport: 'r',
        selectedConfiguration: 'c',
      });
    });

    const select = (name: string, value: string) =>
      component.onSelectionChange({ source: { ngControl: { name } }, value });

    it('clears the other dropdowns when an activity is chosen', () => {
      select('selectedActivity', 'forceLogout');
      expect(header()).toEqual({ selectedActivity: 'a', selectedReport: null, selectedConfiguration: null });
      expect(supervisor.createComponent).toHaveBeenCalledWith(ForceLogoutComponent, null);
    });

    it('clears the other dropdowns when a report is chosen', () => {
      select('selectedReport', 'reports');
      expect(header()).toEqual({ selectedActivity: null, selectedReport: 'r', selectedConfiguration: null });
    });

    it('clears the other dropdowns when a configuration is chosen', () => {
      select('selectedConfiguration', 'smsTemplate');
      expect(header()).toEqual({ selectedActivity: null, selectedReport: null, selectedConfiguration: 'c' });
    });
  });

  it('goes back to the dashboard only after confirmation', async () => {
    await setup({ data: 'dataUpload' });
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
    component.navigateToPrev();
    expect(router.navigate).not.toHaveBeenCalled();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    component.navigateToPrev();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('tracks field interactions', async () => {
    await setup({ data: 'dataUpload' });
    component.trackFieldInteraction('selectedActivity');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('selectedActivity', 'Supervisor Dashboard');
  });
});
