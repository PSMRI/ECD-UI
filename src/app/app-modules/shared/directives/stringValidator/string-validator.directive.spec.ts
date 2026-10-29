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

import { StringValidatorDirective } from './string-validator.directive';

describe('StringValidatorDirective', () => {
  let directive: StringValidatorDirective;

  const make = (allowText: string) => {
    directive = new StringValidatorDirective(new ElementRef(null));
    directive.allowText = allowText;
    return directive;
  };

  const input = (value: any, maxLength = -1) => ({ target: { value, maxLength } });

  describe('validate', () => {
    const cases: [string, string, string][] = [
      ['alphabet', 'abc', 'ab1'],
      ['alphaspace', 'ab c', 'ab1'],
      ['appTextarea', 'ab,cd.ef gh', 'ab,,cd'],
      ['alphanumeric', 'ab12', 'ab 12'],
      ['alphanumericspace', 'ab 12', 'ab-12'],
      ['number', '123', '12a'],
      ['numberslash', '12/3', '12-3'],
      ['alphanumerichyphen', 'ab-1/2 c', 'ab_1'],
      ['numerichyphen', '12- 3', '12/3'],
      ['decimal', '12.34', '12.345'],
      ['address', '12, Main St. #4/B', 'a@b'],
      ['questionnaireValidator', 'How are you?', 'a!'],
      ['addressValidator', 'Flat-4, Road #2', 'a@b'],
      ['itemNameSearchValidator', 'Para 500%', 'a-b'],
      ['answerValidator', 'Yes, 2/3 - ok.', 'a?'],
      ['usernameValidator', 'user01', 'user_01'],
    ];

    cases.forEach(([pattern, valid, invalid]) => {
      it(`${pattern} accepts "${valid}" and rejects "${invalid}"`, () => {
        make(` ${pattern} `);
        expect(directive.validate(valid)).toBeTrue();
        expect(directive.validate(invalid)).toBeFalse();
      });
    });

    it('rejects empty input and unknown patterns', () => {
      make('alphabet');
      expect(directive.validate('')).toBeFalse();
      expect(directive.validate(null)).toBeFalse();
      make('unknown');
      expect(directive.validate('abc')).toBeFalse();
    });

    // NOTE: "[]" inside the class ends it early, so this pattern never
    // matches ordinary item names (current behaviour).
    it('itemNameMasterValidator rejects plain names (current behaviour)', () => {
      make('itemNameMasterValidator');
      expect(directive.validate('Paracetamol')).toBeFalse();
    });
  });

  describe('onInput', () => {
    it('reverts characters that do not match the pattern', () => {
      make('alphabet');
      directive.onFocus({ target: { value: 'ab' } });
      const ev = input('ab1');
      directive.onInput(ev);
      expect(ev.target.value).toBe('ab');
      expect(directive.lastValue as any).toBe('ab');
    });

    it('keeps valid typing and remembers it', () => {
      make('alphabet');
      directive.onFocus({ target: { value: 'ab' } });
      const ev = input('abc');
      directive.onInput(ev);
      expect(ev.target.value).toBe('abc');
      expect(directive.lastValue as any).toBe('abc');
    });

    it('accepts deletions', () => {
      make('alphabet');
      directive.onFocus({ target: { value: 'abc' } });
      const ev = input('ab');
      directive.onInput(ev);
      expect(ev.target.value).toBe('ab');
    });

    it('rejects values longer than maxlength', () => {
      make('alphabet');
      directive.onFocus({ target: { value: 'ab' } });
      const ev = input('abc', 2);
      directive.onInput(ev);
      expect(ev.target.value).toBe('ab');
    });

    it('validates pasted text character by character', () => {
      make('alphanumeric');
      directive.onFocus({ target: { value: '' } });
      const good = input('ab12');
      directive.onInput(good);
      expect(good.target.value).toBe('ab12');
      directive.onFocus({ target: { value: '' } });
      const bad = input('ab 12');
      directive.onInput(bad);
      expect(bad.target.value).toBe('');
    });

    it('decimal clears empty input and reverts invalid numbers', () => {
      make('decimal');
      directive.onFocus({ target: { value: '1.2' } });
      const empty = input('');
      directive.onInput(empty);
      expect(empty.target.value).toBe('');
      directive.onFocus({ target: { value: '1.2' } });
      const bad = input('1.234');
      directive.onInput(bad);
      expect(bad.target.value).toBe('1.2');
    });

    it('number clears a leading zero', () => {
      spyOn(console, 'log');
      make('number');
      directive.onFocus({ target: { value: '' } });
      const zero = input('0');
      directive.onInput(zero);
      expect(zero.target.value).toBe('');
      directive.onFocus({ target: { value: '1' } });
      const ok = input('12');
      directive.onInput(ok);
      expect(ok.target.value).toBe('12');
    });
  });

  it('findDelta returns the inserted text', () => {
    make('alphabet');
    expect(directive.findDelta('abXc', 'abc' as any)).toBe('X');
    expect(directive.findDelta('abc', 'abc' as any)).toBe('');
  });

  it('blocks paste, copy and cut', () => {
    make('alphabet');
    (['blockPaste', 'blockCopy', 'blockCut'] as const).forEach((handler) => {
      const ev = { preventDefault: jasmine.createSpy('preventDefault') } as any;
      directive[handler](ev);
      expect(ev.preventDefault).withContext(handler).toHaveBeenCalled();
    });
  });
});
