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

import {
  Directive,
  HostListener,
  Optional,
  Self,
  ElementRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  NgControl,
  Validator,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

// Printable ASCII + CR/LF/TAB
const ALLOWLIST = /^[\t \r\n\x20-\x7E]*$/;
// Conservative block-list to avoid HTML-like previews/template shenanigans
const DISALLOWED_VISUALS = /[`<>]/;
// Strip non-printable ASCII except CR/LF/TAB
const CONTROL_CHARS = /[^\t \r\n\x20-\x7E]/g;
// $$TokenName$$ pattern
const TOKEN = /\$\$[A-Za-z][A-Za-z0-9_]*\$\$/g;

// Anti-spam helpers
const ALNUM = /[A-Za-z0-9]/g;
const SAFE_PUNCTUATION = /[.,!?;:'"()\-/_]/; // allowed punctuation besides word chars/space/$

// thresholds (tweak to taste)
const MIN_ALNUM = 6;         // require at least N alphanumeric chars total
const MAX_REPEAT = 3;        // collapse/deny >3 same char
const MAX_PUNCT_RUN = 3;     // deny runs of 4+ punctuation chars

function normalizeQuotes(s: string) {
  return s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
}

function sanitizeText(input: string): string {
  if (!input) return '';
  let s = input.normalize('NFKC');

  s = s.replace(/^\s+/, '');

  s = s.replace(CONTROL_CHARS, '');

  s = normalizeQuotes(s);

  if (!ALLOWLIST.test(s)) {
    s = Array.from(s).filter(ch => ALLOWLIST.test(ch)).join('');
  }

  s = s.replace(DISALLOWED_VISUALS, '');


  const repeatRegex = new RegExp(`(.)\\1{${MAX_REPEAT},}`, 'g');
  s = s.replace(repeatRegex, (_m, c: string) => c.repeat(MAX_REPEAT));

  const punctCollapse = new RegExp(`[^\\w\\s$]{${MAX_PUNCT_RUN},}`, 'g');
  s = s.replace(punctCollapse, m => m.slice(0, MAX_PUNCT_RUN - 1));

  s = Array.from(s).filter(ch => {
    return /[\w\s$]/.test(ch) || SAFE_PUNCTUATION.test(ch);
  }).join('');

  return s;
}

@Directive({
  selector: '[appSmsTemplateValidator]',
})
export class SmsTemplateValidatorDirective implements Validator, OnInit, OnDestroy {
  private el: HTMLTextAreaElement | HTMLInputElement;
  private maxLength: number;

  private readonly boundValidator: ValidatorFn = (c: AbstractControl) => this.validate(c);

  constructor(
    @Optional() @Self() private ngControl: NgControl,
    host: ElementRef<HTMLElement>
  ) {
    this.el = host.nativeElement as HTMLTextAreaElement | HTMLInputElement;

    const htmlMax = (this.el as any).maxLength;
    this.maxLength = typeof htmlMax === 'number' && htmlMax > 0 ? htmlMax : 500;
  }

  ngOnInit(): void {
    if (this.ngControl?.control) {
      this.ngControl.control.addValidators(this.boundValidator);
      this.ngControl.control.updateValueAndValidity({ emitEvent: false });
    }
  }

  ngOnDestroy(): void {
    if (this.ngControl?.control) {
      this.ngControl.control.removeValidators(this.boundValidator);
      this.ngControl.control.updateValueAndValidity({ emitEvent: false });
    }
  }

  private get isReadOnly(): boolean {
    return (this.el as any).readOnly === true;
  }

  @HostListener('beforeinput', ['$event'])
  onBeforeInput(e: InputEvent) {
    if (this.isReadOnly) return;

    if (e.inputType?.startsWith('delete') || e.inputType?.startsWith('history')) return;

    const target = e.target as HTMLTextAreaElement | HTMLInputElement;
    if (!target) return;

    const selectionStart = target.selectionStart ?? 0;
    const selectionEnd = target.selectionEnd ?? selectionStart;

    const raw = (e as any).data ?? '';
    const incoming = sanitizeText(raw);

    const nextVal =
      target.value.slice(0, selectionStart) + incoming + target.value.slice(selectionEnd);
    const allowed =
      nextVal.length > this.maxLength
        ? incoming.slice(0, this.maxLength - (target.value.length - (selectionEnd - selectionStart)))
        : incoming;

    if (allowed !== raw) {
      e.preventDefault();
      target.setRangeText(allowed, selectionStart, selectionEnd, 'end');
      target.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(e: ClipboardEvent) {
    if (this.isReadOnly) return;

    e.preventDefault();
    const target = e.target as HTMLTextAreaElement | HTMLInputElement;
    if (!target) return;

    const dt = e.clipboardData ?? (window as any).clipboardData;
    const paste = sanitizeText(dt ? dt.getData('text/plain') : '');
    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? start;

    const room = this.maxLength - (target.value.length - (end - start));
    const toInsert = room > 0 ? paste.slice(0, room) : '';

    target.setRangeText(toInsert, start, end, 'end');
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const v = (control.value ?? '').toString();
    if (this.isReadOnly) return null;

    if (/^\s/.test(v)) return { whitespace: true };

    if (!ALLOWLIST.test(v)) return { disallowedChars: true };
    if (DISALLOWED_VISUALS.test(v)) return { disallowedChars: true };

    if (v.length > this.maxLength) {
      return { maxlength: { requiredLength: this.maxLength, actualLength: v.length } };
    }

    const hasDoubleDollar = v.includes('$$');
    const matches = v.match(TOKEN) ?? [];
    const malformedDoubleDollar = hasDoubleDollar && matches.length === 0;
    const straySingleDollar = /(^|[^$])\$($|[^$])/.test(v);
    if (malformedDoubleDollar || straySingleDollar) return { invalidTokens: true };


    const core = v.replace(TOKEN, '');

    const alnumCount = (core.match(ALNUM) ?? []).length;
    if (alnumCount < MIN_ALNUM) {
      return { tooWeakContent: { need: MIN_ALNUM, actual: alnumCount } };
    }

    if (/[^\w\s$]{4,}/.test(core)) {
      return { excessivePunctuation: true };
    }

    if (/(.)\1{3,}/.test(core)) {
      return { repeatedChars: true };
    }

    const hasBadPunct = Array.from(core).some((ch:any) => {
      return !/[\w\s$]/.test(ch) && !SAFE_PUNCTUATION.test(ch);
    });
    if (hasBadPunct) {
      return { unsupportedPunctuation: true };
    }

    return null;
  }
}