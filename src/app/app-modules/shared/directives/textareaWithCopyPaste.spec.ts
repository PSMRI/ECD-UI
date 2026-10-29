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


import { TextareaWithCopyPasteDirective } from './textareaWithCopyPaste';

describe('TextareaWithCopyPasteDirective', () => {
  let directive: TextareaWithCopyPasteDirective;

  const keypress = (value: string, key: string, selectionStart = 0) => {
    const target = {
      value,
      selectionStart,
      setSelectionRange: jasmine.createSpy('setSelectionRange'),
    };
    return {
      target,
      charCode: key.charCodeAt(0),
      which: key.charCodeAt(0),
      preventDefault: jasmine.createSpy('preventDefault'),
      stopPropagation: jasmine.createSpy('stopPropagation'),
    };
  };

  beforeEach(() => (directive = new TextareaWithCopyPasteDirective()));

  it('blocks whitespace while the field would be blank', () => {
    const ev = keypress(' ', ' ');
    directive.onKeyPress(ev);
    expect(ev.preventDefault).toHaveBeenCalledTimes(1);
    expect(ev.target.setSelectionRange).not.toHaveBeenCalled();
  });

  it('allows normal typing', () => {
    const ev = keypress('abc', 'd');
    directive.onKeyPress(ev);
    expect(ev.preventDefault).not.toHaveBeenCalled();
    expect(ev.target.value).toBe('abc');
  });

  it('trims leading whitespace and moves the caret', () => {
    const ev = keypress('  ab', 'c', 4);
    directive.onKeyPress(ev);
    expect(ev.target.value).toBe('abc');
    expect(ev.target.setSelectionRange).toHaveBeenCalledWith(2, 2);
    expect(ev.preventDefault).toHaveBeenCalled();
    expect(ev.stopPropagation).toHaveBeenCalled();
  });

  it('pastes the clipboard text without leading whitespace', () => {
    const exec = spyOn(document, 'execCommand');
    const ev: any = {
      clipboardData: { getData: () => '   hello world ' },
      preventDefault: jasmine.createSpy('preventDefault'),
    };
    directive.onPaste(ev);
    expect(ev.preventDefault).toHaveBeenCalled();
    expect(exec).toHaveBeenCalledWith('insertText', false, 'hello world ');
  });
});
