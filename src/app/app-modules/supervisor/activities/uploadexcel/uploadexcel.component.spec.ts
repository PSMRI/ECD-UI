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


import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

import { UploadexcelComponent } from './uploadexcel.component';
import { SetLanguageService } from '../../../services/set-language/set-language.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';

describe('UploadexcelComponent', () => {
  let component: UploadexcelComponent;
  let fixture: ComponentFixture<UploadexcelComponent>;
  let supervisor: jasmine.SpyObj<SupervisorService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  let tracking: jasmine.SpyObj<AmritTrackingService>;

  const lang = { invalidOrCurruptFile: 'invalidOrCurruptFile', downloadedTemplateSuccessfully: 'downloadedTemplateSuccessfully' };
  const session: any = { providerServiceMapID: 4, userID: 7, userName: 'sup1' };
  const CORRUPT = 'Invalid Excel File Uploaded file is corrupted or not a valid Excel file';

  function excel(name = 'mothers.xlsx', sizeBytes = 10) {
    return new File([new Uint8Array(sizeBytes)], name);
  }

  function prepareUpload() {
    component.file = excel();
    component.fileList = [component.file];
    component.fileContent = 'data:application/octet-stream;base64,QUJD';
  }

  beforeEach(async () => {
    supervisor = jasmine.createSpyObj('SupervisorService', ['postFormData', 'postTemplateData', 'getDownloadData']);
    confirmation = jasmine.createSpyObj('ConfirmationService', ['openDialog']);
    tracking = jasmine.createSpyObj('AmritTrackingService', ['trackFieldInteraction']);
    spyOn(HTMLAnchorElement.prototype, 'dispatchEvent').and.returnValue(true);

    await TestBed.configureTestingModule({
      declarations: [UploadexcelComponent],
      providers: [
        FormBuilder,
        { provide: SetLanguageService, useValue: { getLanguageData: () => of(lang) } },
        { provide: HttpClient, useValue: {} },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: SupervisorService, useValue: supervisor },
        { provide: AmritTrackingService, useValue: tracking },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(UploadexcelComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(UploadexcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load language data', () => {
    expect(component).toBeTruthy();
    expect(component.currentLanguageSet).toEqual(lang);
    expect(component.uploadDataSection).toBeTrue();
  });

  describe('checkExtension', () => {
    ['a.xls', 'a.xlsx', 'a.XLSM', 'a.xlsb'].forEach((n) =>
      it(`should accept ${n}`, () => expect(component.checkExtension(excel(n))).toBeTrue())
    );

    ['a.csv', 'a.pdf', 'a.b.xlsx', 'noext'].forEach((n) =>
      it(`should reject ${n}`, () => expect(component.checkExtension(excel(n))).toBeFalse())
    );

    it('should return true when no file is given', () => {
      expect(component.checkExtension(null as any)).toBeTrue();
    });
  });

  describe('onFileUpload', () => {
    function upload(files: File[]) {
      component.onFileUpload({ target: { files } });
    }

    it('should flag an empty selection', () => {
      upload([]);
      expect(component.error1).toBeTrue();
    });

    it('should flag an invalid extension', () => {
      upload([excel('data.csv')]);
      expect(component.invalid_file_flag).toBeTrue();
      expect(component.error2).toBeFalse();
    });

    it('should flag a file without a name', () => {
      upload([excel('.xlsx')]);
      expect(component.inValidFileName).toBeTrue();
    });

    it('should flag files larger than 5 MB', () => {
      upload([excel('big.xlsx', 5_000_001)]);
      expect(component.error2).toBeTrue();
      expect(component.error1).toBeFalse();
    });

    it('should read a valid file as a data URL', async () => {
      upload([excel('ok.xlsx', 3)]);
      expect(component.error1 || component.error2 || component.invalid_file_flag || component.inValidFileName).toBeFalse();
      await new Promise((r) => setTimeout(r, 50));
      expect(component.fileContent).toMatch(/^data:/);
    });
  });

  describe('onSubmit (data upload)', () => {
    beforeEach(() => prepareUpload());

    it('should send the file as base64 with the record type', () => {
      supervisor.postFormData.and.returnValue(of({ response: 'Uploaded 10 records' }));
      component.uploadForm.controls.choice.setValue('Mother');
      component.onSubmit();
      expect(supervisor.postFormData).toHaveBeenCalledWith({
        providerServiceMapID: 4, userID: 7, createdBy: 'sup1', fieldFor: 'Mother Data',
        fileName: 'mothers.xlsx', fileExtension: '.xlsx', fileContent: 'QUJD',
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('Uploaded 10 records', 'success');
      expect(component.file).toBeUndefined();
      expect(component.fileList).toBeNull();
    });

    it('should send Child Data for any other choice', () => {
      supervisor.postFormData.and.returnValue(of({ response: 'ok' }));
      component.uploadForm.controls.choice.setValue('Child');
      component.onSubmit();
      expect((supervisor.postFormData.calls.mostRecent().args[0] as any).fieldFor).toBe('Child Data');
    });

    it('should show "No valid" responses as errors', () => {
      supervisor.postFormData.and.returnValue(of({ response: 'No valid records found' }));
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('No valid records found', 'error');
    });

    it('should show a friendly message for corrupt files', () => {
      supervisor.postFormData.and.returnValue(of({ statusCode: 5000, errorMessage: CORRUPT }));
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('invalidOrCurruptFile', 'error');
    });

    it('should show the server message when success is false', () => {
      supervisor.postFormData.and.returnValue(of({ success: false, status: 'Bad columns' }));
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Bad columns', 'error');
    });

    it('should fall back to a default failure message', () => {
      supervisor.postFormData.and.returnValue(of({ success: false }));
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('File upload failed', 'error');
    });

    it('should show errorMessage for other responses', () => {
      supervisor.postFormData.and.returnValue(of({ errorMessage: 'weird' }));
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('weird', 'error');
    });

    it('should do nothing for a null response', () => {
      supervisor.postFormData.and.returnValue(of(null as any));
      component.onSubmit();
      expect(confirmation.openDialog).not.toHaveBeenCalled();
    });

    it('should show err.error when the upload fails', () => {
      supervisor.postFormData.and.returnValue(throwError(() => ({ error: 'up failed' })));
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('up failed', 'error');
    });

    it('should show title + detail when the upload fails without err.error', () => {
      supervisor.postFormData.and.returnValue(throwError(() => ({ title: 'A', detail: 'B' })));
      component.onSubmit();
      expect(confirmation.openDialog).toHaveBeenCalledWith('AB', 'error');
    });

    it('should send empty name/content when no file was read', () => {
      supervisor.postFormData.and.returnValue(of({ response: 'ok' }));
      component.file = undefined;
      component.fileContent = undefined;
      component.onSubmit();
      const req: any = supervisor.postFormData.calls.mostRecent().args[0];
      expect(req.fileName).toBe('');
      expect(req.fileContent).toBe('');
    });
  });

  describe('onUpload (template upload)', () => {
    beforeEach(() => prepareUpload());

    it('should upload the template and reset on success', () => {
      supervisor.postTemplateData.and.returnValue(of({ response: 'Template saved' }));
      component.uploadTemplateForm.controls.choice.setValue('Mother');
      component.onUpload();
      expect(supervisor.postTemplateData).toHaveBeenCalledWith({
        psmId: 4, createdBy: 'sup1', fileType: 'Mother Data', fileName: 'mothers.xlsx', fileContent: 'QUJD',
      });
      expect(confirmation.openDialog).toHaveBeenCalledWith('Template saved', 'success');
      expect(component.fileList).toBeNull();
    });

    it('should show "No valid" responses as errors', () => {
      supervisor.postTemplateData.and.returnValue(of({ response: 'No valid headers' }));
      component.onUpload();
      expect(confirmation.openDialog).toHaveBeenCalledWith('No valid headers', 'error');
    });

    it('should show a friendly message for corrupt templates', () => {
      supervisor.postTemplateData.and.returnValue(of({ statusCode: 5000, errorMessage: CORRUPT }));
      component.onUpload();
      expect(confirmation.openDialog).toHaveBeenCalledWith(
        'Invalid file. The uploaded Excel file is corrupt or not in a valid format.', 'error');
    });

    it('should fall back to default messages', () => {
      supervisor.postTemplateData.and.returnValue(of({ success: false }));
      component.onUpload();
      expect(confirmation.openDialog).toHaveBeenCalledWith('Template upload failed', 'error');
      supervisor.postTemplateData.and.returnValue(of({}));
      component.onUpload();
      expect(confirmation.openDialog).toHaveBeenCalledWith('An error occurred during upload', 'error');
    });

    const errorCases: Array<[string, any, string]> = [
      ['err.error.errorMessage', { error: { errorMessage: 'bad template' } }, 'bad template'],
      ['string err.error', { error: 'plain' }, 'plain'],
      ['object err.error without message', { error: { code: 1 } }, 'An error occurred during file upload'],
      ['status + message', { status: 413, message: 'Too large' }, 'Too large'],
      ['unknown error', {}, 'An unexpected error occurred'],
    ];
    errorCases.forEach(([label, err, msg]) => {
      it(`should handle ${label}`, () => {
        supervisor.postTemplateData.and.returnValue(throwError(() => err));
        component.onUpload();
        expect(confirmation.openDialog).toHaveBeenCalledWith(msg, 'error');
      });
    });
  });

  describe('downloadTemplate', () => {
    it('should decode the base64 file, save it and notify', () => {
      spyOn(URL, 'createObjectURL').and.returnValue('blob:x');
      supervisor.getDownloadData.and.returnValue(of({ fileContent: btoa('excel'), fileName: 't.xlsx' }));
      component.uploadForm.controls.choice.setValue('Child');
      component.downloadTemplate();
      expect(supervisor.getDownloadData).toHaveBeenCalledWith({ fileTypeID: 'Child Data', providerServiceMapID: 4 });
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(confirmation.openDialog).toHaveBeenCalledWith('downloadedTemplateSuccessfully', 'success');
    });

    // Documents current behaviour: the else branch reads res.errorMessage on a
    // null response; RxJS rethrows that TypeError asynchronously.
    it('throws asynchronously for a null response (edge case)', fakeAsync(() => {
      supervisor.getDownloadData.and.returnValue(of(null as any));
      component.downloadTemplate();
      expect(() => flush()).toThrowError(TypeError);
      expect(confirmation.openDialog).not.toHaveBeenCalled();
    }));
  });

  describe('section navigation', () => {
    it('uploadTemplate should switch to the template section and clear state', () => {
      component.file = excel();
      component.error1 = true;
      component.uploadTemplate();
      expect(component.uploadTemplateSection).toBeTrue();
      expect(component.uploadDataSection).toBeFalse();
      expect(component.file).toBeUndefined();
      expect(component.error1).toBeFalse();
    });

    it('onback should return to data upload when confirmed', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(true) } as any);
      component.uploadTemplate();
      component.onback();
      expect(component.uploadTemplateSection).toBeFalse();
      expect(component.uploadDataSection).toBeTrue();
    });

    it('onback should stay when cancelled', () => {
      confirmation.openDialog.and.returnValue({ afterClosed: () => of(false) } as any);
      component.uploadTemplate();
      component.onback();
      expect(component.uploadTemplateSection).toBeTrue();
    });
  });

  it('trackFieldInteraction should report to tracking', () => {
    component.trackFieldInteraction('choice');
    expect(tracking.trackFieldInteraction).toHaveBeenCalledWith('choice', 'Data Upload');
  });
});
