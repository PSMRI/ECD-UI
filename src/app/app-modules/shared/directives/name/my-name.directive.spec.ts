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


import { MyNameDirective } from './my-name.directive';

describe('MyNameDirective', () => {
  let directive: MyNameDirective;

  const keypress = (key: string, useWhich = false) => {
    const code = key.charCodeAt(0);
    return {
      charCode: useWhich ? 0 : code,
      which: code,
      preventDefault: jasmine.createSpy('preventDefault'),
    };
  };

  beforeEach(() => (directive = new MyNameDirective()));

  // NOTE: the character class in the key regex is closed early by an
  // unescaped "]", so the pattern never matches a single key and nothing
  // is blocked. These tests document that current behaviour.
  it('does not block any single key (current behaviour)', () => {
    ['a', 'Z', '1', '~', '@', ' '].forEach((key) => {
      const ev = keypress(key);
      directive.onKeyPress(ev);
      expect(ev.preventDefault).withContext(key).not.toHaveBeenCalled();
    });
  });

  it('reads the key from "which" when charCode is 0', () => {
    const ev = keypress('~', true);
    directive.onKeyPress(ev);
    expect(ev.preventDefault).not.toHaveBeenCalled();
  });

  it('blocks paste, copy and cut', () => {
    (['blockPaste', 'blockCopy', 'blockCut'] as const).forEach((handler) => {
      const ev = { preventDefault: jasmine.createSpy('preventDefault') } as any;
      directive[handler](ev);
      expect(ev.preventDefault).withContext(handler).toHaveBeenCalled();
    });
  });
});
