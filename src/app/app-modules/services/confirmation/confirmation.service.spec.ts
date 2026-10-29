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

import { TestBed } from '@angular/core/testing';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ConfirmationService } from './confirmation.service';
import { CommonDialogComponent } from '../../core/common-dialog/common-dialog.component';

describe('ConfirmationService', () => {
  let service: ConfirmationService;
  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: dialog }],
    });
    service = TestBed.inject(ConfirmationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('openDialog should open CommonDialogComponent with message, action and fixed config', () => {
    const ref: any = { afterClosed: () => {} };
    dialog.open.and.returnValue(ref);

    const result = service.openDialog('Saved successfully', 'success');

    expect(dialog.open).toHaveBeenCalledWith(CommonDialogComponent, {
      width: '420px',
      disableClose: true,
      data: { message: 'Saved successfully', action: 'success' },
    });
    expect(result).toBe(ref);
  });

  it('openDialog should pass empty message/action through unchanged (edge case)', () => {
    service.openDialog('', '');
    expect(dialog.open.calls.mostRecent().args[1]?.data).toEqual({ message: '', action: '' });
  });
});
