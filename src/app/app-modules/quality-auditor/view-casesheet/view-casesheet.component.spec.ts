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
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { of, throwError } from 'rxjs';

import { ViewCasesheetComponent } from './view-casesheet.component';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { QualityAuditorService } from '../../services/quality-auditor/quality-auditor.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { SpinnerService } from '../../services/spinnerService/spinner.service';

describe('ViewCasesheetComponent', () => {
  let component: ViewCasesheetComponent;
  let fixture: ComponentFixture<ViewCasesheetComponent>;
  let qaService: jasmine.SpyObj<QualityAuditorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let spinner: jasmine.SpyObj<SpinnerService>;
  let languageService: any;

  const caseSheet = {
    beneficiaryDetails: { name: 'Asha', age: 24 },
    questionnaireResponse: [{ question: 'Q1', answer: 'Yes' }],
  };

  beforeEach(async () => {
    qaService = jasmine.createSpyObj('QualityAuditorService', ['getCaseSheetDataFromService']);
    qaService.getCaseSheetDataFromService.and.returnValue(of(caseSheet));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    spinner = jasmine.createSpyObj('SpinnerService', ['setLoading']);
    languageService = { languageData: { title: 'Case sheet' } };

    await TestBed.configureTestingModule({
      declarations: [ViewCasesheetComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { benCallId: 500, beneficiaryId: 600 } },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: SetLanguageService, useValue: languageService },
        { provide: QualityAuditorService, useValue: qaService },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SpinnerService, useValue: spinner },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(ViewCasesheetComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ViewCasesheetComponent);
    component = fixture.componentInstance;
  });

  it('should create and load the case sheet for the dialog benCallId', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(qaService.getCaseSheetDataFromService).toHaveBeenCalledWith({ benCallId: 500 });
    expect(component.beneficiaryCaseSheetData).toEqual(caseSheet.beneficiaryDetails);
    expect(component.questionnaireCaseSheetData).toEqual(caseSheet.questionnaireResponse);
    expect(component.beneficiaryID).toBe(600);
    expect(component.currentLanguageSet).toEqual({ title: 'Case sheet' });
  });

  it('should leave case sheet data undefined when the response has no details', () => {
    qaService.getCaseSheetDataFromService.and.returnValue(of({}));
    fixture.detectChanges();
    expect(component.beneficiaryCaseSheetData).toBeUndefined();
    expect(component.questionnaireCaseSheetData).toBeUndefined();
  });

  it('should show err.error when loading fails', () => {
    qaService.getCaseSheetDataFromService.and.returnValue(throwError(() => ({ error: 'cs failed' })));
    fixture.detectChanges();
    expect(confirmation.openDialog).toHaveBeenCalledWith('cs failed', 'error');
  });

  it('should show title + detail when loading fails without err.error', () => {
    qaService.getCaseSheetDataFromService.and.returnValue(throwError(() => ({ title: 'Oops ', detail: 'x' })));
    fixture.detectChanges();
    expect(confirmation.openDialog).toHaveBeenCalledWith('Oops x', 'error');
  });

  it('ngDoCheck should pick up language changes', () => {
    fixture.detectChanges();
    languageService.languageData = { title: 'Hindi' };
    component.ngDoCheck();
    expect(component.currentLanguageSet).toEqual({ title: 'Hindi' });
  });

  it('should keep the old language when languageData becomes null', () => {
    fixture.detectChanges();
    languageService.languageData = null;
    component.ngDoCheck();
    expect(component.currentLanguageSet).toEqual({ title: 'Case sheet' });
  });

  it('generatePDF should render the content to a PDF and open it in a new window', async () => {
    const div = document.createElement('div');
    div.innerHTML = '<p>Case sheet</p>';
    div.style.width = '200px';
    document.body.appendChild(div);
    component.content = new ElementRef(div);

    const win = jasmine.createSpyObj('Window', ['focus']);
    spyOn(window, 'open').and.returnValue(win);
    spyOn(URL, 'createObjectURL').and.returnValue('blob:pdf');
    const done = new Promise<void>((resolve) =>
      spinner.setLoading.and.callFake((v: boolean) => {
        if (!v) resolve();
      })
    );

    component.generatePDF();
    expect(spinner.setLoading).toHaveBeenCalledWith(true);
    await done;

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith('blob:pdf');
    expect(win.focus).toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it('generatePDF should not fail when the popup is blocked', async () => {
    const div = document.createElement('div');
    div.style.width = '100px';
    div.style.height = '50px';
    document.body.appendChild(div);
    component.content = new ElementRef(div);

    spyOn(window, 'open').and.returnValue(null);
    spyOn(URL, 'createObjectURL').and.returnValue('blob:pdf');
    const done = new Promise<void>((resolve) =>
      spinner.setLoading.and.callFake((v: boolean) => {
        if (!v) resolve();
      })
    );

    component.generatePDF();
    await done;
    expect(window.open).toHaveBeenCalled();
    document.body.removeChild(div);
  });
});
