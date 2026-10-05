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
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { InnerpageQualityAuditorComponent } from './innerpage-quality-auditor.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { QualityAuditorService } from 'src/app/app-modules/services/quality-auditor/quality-auditor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { CallAuditComponent } from '../../call-audit/call-audit/call-audit.component';

describe('InnerpageQualityAuditorComponent', () => {
  let component: InnerpageQualityAuditorComponent;
  let fixture: ComponentFixture<InnerpageQualityAuditorComponent>;
  let qaService: any;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let router: jasmine.SpyObj<Router>;
  let queryParams: BehaviorSubject<any>;

  const lang = {
    unableToRoute: 'unableToRoute',
    areYouSureYouWouldLikeToGoBack: 'areYouSureYouWouldLikeToGoBack',
  };

  beforeEach(async () => {
    qaService = jasmine.createSpyObj('QualityAuditorService', ['setContainer', 'loadComponent']);
    qaService.callAuditData = { some: 'state' };
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    queryParams = new BehaviorSubject<any>({ data: 'callAudit' });

    await TestBed.configureTestingModule({
      declarations: [InnerpageQualityAuditorComponent],
      providers: [
        { provide: QualityAuditorService, useValue: qaService },
        { provide: ActivatedRoute, useValue: { queryParams } },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: Router, useValue: router },
        { provide: SetLanguageService, useValue: { languageData: lang } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(InnerpageQualityAuditorComponent, '<ng-template #dynamicContent></ng-template>')
      .compileComponents();

    fixture = TestBed.createComponent(InnerpageQualityAuditorComponent);
    component = fixture.componentInstance;
  });

  it('should create, register the container and load the routed component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.currentLanguageSet).toBe(lang);
    expect(qaService.setContainer).toHaveBeenCalledWith(component.container);
    expect(component.selectedRoute).toBe('callAudit');
    expect(qaService.loadComponent).toHaveBeenCalledWith(CallAuditComponent, null);
  });

  it('should pass undefined for an unknown route key', () => {
    queryParams.next({ data: 'unknown' });
    fixture.detectChanges();
    expect(qaService.loadComponent).toHaveBeenCalledWith(undefined, null);
  });

  it('should show unableToRoute when query params are null', () => {
    queryParams.next(null);
    fixture.detectChanges();
    expect(qaService.loadComponent).not.toHaveBeenCalled();
    expect(confirmation.openDialog).toHaveBeenCalledWith('unableToRoute', 'info');
  });

  it('should reload when query params change', () => {
    fixture.detectChanges();
    queryParams.next({ data: 'callAudit' });
    expect(qaService.loadComponent).toHaveBeenCalledTimes(2);
  });

  it('backToDashboard should navigate when the user confirms', () => {
    fixture.detectChanges();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    component.backToDashboard();
    expect(confirmation.openDialog).toHaveBeenCalledWith('areYouSureYouWouldLikeToGoBack', 'confirm');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(qaService.callAuditData).toBeUndefined();
  });

  it('backToDashboard should stay when the user cancels but still clear audit data', () => {
    fixture.detectChanges();
    confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
    component.backToDashboard();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(qaService.callAuditData).toBeUndefined();
  });
});
