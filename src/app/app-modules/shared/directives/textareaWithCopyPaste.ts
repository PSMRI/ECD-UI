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


import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appTextareaWithCopyPaste]'
})
export class TextareaWithCopyPasteDirective {

  constructor() { }

  @HostListener("keypress", ["$event"]) onKeyPress(ev: any) {
    const key = String.fromCharCode(!ev.charCode ? ev.which : ev.charCode);
    const value = ev.target.value + key;
  
    // Check if the value contains only whitespace
    if (/^\s*$/.test(value)) {
      ev.preventDefault();
      return;
    }
  
    // Regular expression to disallow certain characters
    const regex = new RegExp(/^[~!@#$%^&*()_+\-=[]{};"`':'\\|<>\/?]*$/);
    if (regex.test(key)) {
      ev.preventDefault();
    }

    // Check if the value starts with whitespace
    if (/^\s/.test(value)) {
      // Get the current cursor position
      const selectionStart = ev.target.selectionStart;
      
      // Remove the leading whitespace and update the value
      const trimmedValue = value.trimStart();
      ev.target.value = trimmedValue;

      // Adjust the cursor position based on the number of removed characters
      const removedCharacters = value.length - trimmedValue.length;
      ev.target.setSelectionRange(selectionStart - removedCharacters, selectionStart - removedCharacters);
      
      // Prevent the default behavior and stop further processing
      ev.preventDefault();
      ev.stopPropagation();
    }
  }
    
    @HostListener("paste", ["$event"]) onPaste(event: ClipboardEvent) {
      const clipboardData = event.clipboardData || (window as any).clipboardData;
      const pastedText = clipboardData.getData('text');
  
      // Remove leading spaces from the pasted text
      const modifiedText = pastedText.trimStart();
  
      // Replace the current selection with the modified text
      document.execCommand('insertText', false, modifiedText);
  
      // Prevent the default paste behavior
      event.preventDefault();
    }
    
//   @HostListener("paste", ["$event"]) blockPaste(event: KeyboardEvent) {
//     event.preventDefault();
//   }

//   @HostListener("copy", ["$event"]) blockCopy(event: KeyboardEvent) {
//     event.preventDefault();
//   }

//   @HostListener("cut", ["$event"]) blockCut(event: KeyboardEvent) {
//     event.preventDefault();
//   }
  
}
