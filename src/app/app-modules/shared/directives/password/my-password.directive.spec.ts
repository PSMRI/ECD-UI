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


import { MyPasswordDirective } from './my-password.directive';

describe('MyPasswordDirective', () => {
  let directive: MyPasswordDirective;

  const keyup = (value: string) => {
    const hint = { innerHTML: '' };
    return {
      hint,
      ev: {
        target: {
          value,
          style: { border: '' },
          nextSibling: { nextElementSibling: hint },
        },
      },
    };
  };

  beforeEach(() => (directive = new MyPasswordDirective()));

  // NOTE: "[]-]{7,11}" ends the character class early, so the pattern only
  // matches a letter followed by "-" and 7-11 "]" characters. Ordinary
  // passwords are therefore always reported as invalid (current behaviour).
  it('reports ordinary passwords as invalid (current behaviour)', () => {
    ['Abcdefgh', 'Abc12345$', 'abcdefghijk'].forEach((pwd) => {
      const { hint, ev } = keyup(pwd);
      directive.onKeyUp(ev);
      expect(hint.innerHTML).withContext(pwd).toContain('8-12 characters');
      expect(ev.target.style.border).toBe('2px solid red');
    });
  });

  it('reports the only matching shape as strong', () => {
    const { hint, ev } = keyup('ab-]]]]]]]');
    directive.onKeyUp(ev);
    expect(hint.innerHTML).toBe('Strong Password');
    expect(ev.target.style.border).toBe('2px solid green');
  });

  it('blocks whitespace keys only', () => {
    const space = { charCode: 32, which: 32, preventDefault: jasmine.createSpy() };
    const tab = { charCode: 0, which: 9, preventDefault: jasmine.createSpy() };
    const letter = { charCode: 97, which: 97, preventDefault: jasmine.createSpy() };
    directive.onKeyPress(space);
    directive.onKeyPress(tab);
    directive.onKeyPress(letter);
    expect(space.preventDefault).toHaveBeenCalled();
    expect(tab.preventDefault).toHaveBeenCalled();
    expect(letter.preventDefault).not.toHaveBeenCalled();
  });

  it('blocks paste, copy and cut', () => {
    (['blockPaste', 'blockCopy', 'blockCut'] as const).forEach((handler) => {
      const ev = { preventDefault: jasmine.createSpy('preventDefault') } as any;
      directive[handler](ev);
      expect(ev.preventDefault).withContext(handler).toHaveBeenCalled();
    });
  });
});
