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


import { ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SmsTemplateValidatorDirective } from './sms-template-validator.directive';

describe('SmsTemplateValidatorDirective', () => {
  let textarea: HTMLTextAreaElement;
  let directive: SmsTemplateValidatorDirective;

  const make = (opts: { maxLength?: number; readOnly?: boolean; control?: FormControl } = {}) => {
    textarea = document.createElement('textarea');
    if (opts.maxLength) textarea.maxLength = opts.maxLength;
    if (opts.readOnly) textarea.readOnly = true;
    const ngControl = opts.control ? ({ control: opts.control } as any) : null;
    directive = new SmsTemplateValidatorDirective(ngControl, new ElementRef(textarea));
    return directive;
  };
  const check = (value: any) => directive.validate(new FormControl(value));

  describe('validate', () => {
    beforeEach(() => make());

    it('accepts a normal template with tokens', () => {
      expect(check('Dear $$Name$$, your visit is due tomorrow.')).toBeNull();
    });

    it('rejects leading whitespace', () => {
      expect(check(' Hello world')).toEqual({ whitespace: true });
    });

    it('rejects non-ASCII and HTML-like characters', () => {
      expect(check('Hello wörld again')).toEqual({ disallowedChars: true });
      expect(check('Hello <b>world</b>')).toEqual({ disallowedChars: true });
    });

    it('enforces the maximum length', () => {
      make({ maxLength: 10 });
      expect(check('Hello world again')).toEqual({
        maxlength: { requiredLength: 10, actualLength: 17 },
      });
    });

    it('defaults the maximum length to 500', () => {
      expect(check('a'.repeat(501))).toEqual({
        maxlength: { requiredLength: 500, actualLength: 501 },
      });
    });

    it('rejects malformed or stray dollar tokens', () => {
      expect(check('Dear $$ Name, hello there')).toEqual({ invalidTokens: true });
      expect(check('Pay $5 now please friend')).toEqual({ invalidTokens: true });
    });

    it('needs enough real content besides tokens', () => {
      expect(check('Hi $$Name$$')).toEqual({ tooWeakContent: { need: 6, actual: 2 } });
      expect(check(null)).toEqual({ tooWeakContent: { need: 6, actual: 0 } });
    });

    it('rejects punctuation runs, repeated characters and unsupported symbols', () => {
      expect(check('Hello world!!!!')).toEqual({ excessivePunctuation: true });
      expect(check('Helloooo world')).toEqual({ repeatedChars: true });
      expect(check('Hello world @home')).toEqual({ unsupportedPunctuation: true });
    });

    it('skips validation for read-only fields', () => {
      make({ readOnly: true });
      expect(check(' $ <bad>')).toBeNull();
    });
  });

  describe('control registration', () => {
    it('adds the validator on init and removes it on destroy', () => {
      const control = new FormControl(' bad');
      make({ control });
      directive.ngOnInit();
      expect(control.errors).toEqual({ whitespace: true });
      directive.ngOnDestroy();
      expect(control.errors).toBeNull();
    });

    it('works without a form control', () => {
      make();
      expect(() => {
        directive.ngOnInit();
        directive.ngOnDestroy();
      }).not.toThrow();
    });
  });

  describe('onBeforeInput', () => {
    const before = (data: string | null, inputType = 'insertText') => {
      const ev: any = {
        data,
        inputType,
        target: textarea,
        preventDefault: jasmine.createSpy('preventDefault'),
      };
      directive.onBeforeInput(ev);
      return ev;
    };

    beforeEach(() => {
      make();
      textarea.value = 'Hello';
      textarea.setSelectionRange(5, 5);
    });

    it('lets clean input through', () => {
      const ev = before('world');
      expect(ev.preventDefault).not.toHaveBeenCalled();
      expect(textarea.value).toBe('Hello');
    });

    it('replaces input with its sanitised form', () => {
      const ev = before('😀 there');
      expect(ev.preventDefault).toHaveBeenCalled();
      expect(textarea.value).toBe('Hello there');
    });

    it('ignores deletions, history and read-only fields', () => {
      expect(before('😀', 'deleteContentBackward').preventDefault).not.toHaveBeenCalled();
      expect(before('😀', 'historyUndo').preventDefault).not.toHaveBeenCalled();
      textarea.readOnly = true;
      expect(before('😀').preventDefault).not.toHaveBeenCalled();
    });

    it('truncates input that would exceed the maximum length', () => {
      make({ maxLength: 8 });
      textarea.value = 'Hello';
      textarea.setSelectionRange(5, 5);
      before('world');
      expect(textarea.value).toBe('Hellowor');
    });
  });

  describe('onPaste', () => {
    const paste = (text: string) => {
      const ev: any = {
        target: textarea,
        clipboardData: { getData: () => text },
        preventDefault: jasmine.createSpy('preventDefault'),
      };
      directive.onPaste(ev);
      return ev;
    };

    it('inserts sanitised clipboard text', () => {
      make();
      const inputSpy = jasmine.createSpy('input');
      textarea.addEventListener('input', inputSpy);
      const ev = paste('  Hi “there”!!!!! Okkkkk');
      expect(ev.preventDefault).toHaveBeenCalled();
      // curly quotes are stripped as non-ASCII before they could be normalised
      expect(textarea.value).toBe('Hi there!! Okkk');
      expect(inputSpy).toHaveBeenCalled();
    });

    it('only inserts what fits', () => {
      make({ maxLength: 4 });
      textarea.value = 'ab';
      textarea.setSelectionRange(2, 2);
      paste('cdef');
      expect(textarea.value).toBe('abcd');
    });

    it('does nothing for read-only fields', () => {
      make({ readOnly: true });
      const ev = paste('text');
      expect(ev.preventDefault).not.toHaveBeenCalled();
      expect(textarea.value).toBe('');
    });
  });
});
