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


import { FormControl } from '@angular/forms';

import { MyEmailDirective } from './my-email.directive';

describe('MyEmailDirective', () => {
  let directive: MyEmailDirective;

  beforeEach(() => (directive = new MyEmailDirective()));

  it('requires a value', () => {
    expect(directive.validate(new FormControl(''))).toEqual({ required: true });
  });

  it('accepts valid emails', () => {
    ['a@b.com', 'first.last+tag@sub.example.org'].forEach((v) =>
      expect(directive.validate(new FormControl(v))).withContext(v).toBeNull(),
    );
  });

  it('flags invalid emails', () => {
    ['plain', 'a@', '@b.com', 'a b@c.com', 'a@-b.com'].forEach((v) =>
      expect(directive.validate(new FormControl(v)))
        .withContext(v)
        .toEqual({ email: true }),
    );
  });

  it('blocks paste, copy and cut', () => {
    (['blockPaste', 'blockCopy', 'blockCut'] as const).forEach((handler) => {
      const ev = { preventDefault: jasmine.createSpy('preventDefault') } as any;
      directive[handler](ev);
      expect(ev.preventDefault).withContext(handler).toHaveBeenCalled();
    });
  });
});
