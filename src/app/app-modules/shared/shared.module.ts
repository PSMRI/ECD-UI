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


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyEmailDirective } from './directives/email/my-email.directive';
import { InputFieldDirective } from './directives/inputField/input-field.directive';
import { MobileNumberDirective } from './directives/mobileNumber/mobile-number.directive';
import { MyPasswordDirective } from './directives/password/my-password.directive';
import { SearchIdValidatorDirective } from './directives/searchId/search-id-validator.directive';
import { TextareaDirective } from './directives/textarea/textarea.directive';
import { UserNameDirective } from './directives/username/user-name.directive';
import { MyNameDirective } from './directives/name/my-name.directive';
import { SmsTemplateValidatorDirective } from './directives/smsTemplate/sms-template-validator.directive';
import { StringValidatorDirective } from './directives/stringValidator/string-validator.directive';
import { TextareaWithCopyPasteDirective } from './directives/textareaWithCopyPaste';
import { NoEmptySpaceWithAllChracsDirective } from './directives/noEmptySpaceWithAllChracs';
import { UtcdatePipe } from './utcdate.pipe';



@NgModule({
  declarations: [ 
    MyEmailDirective,
    InputFieldDirective,
    MobileNumberDirective,
    MyNameDirective,
    MyPasswordDirective,
    SearchIdValidatorDirective,
    SmsTemplateValidatorDirective,
    TextareaDirective,
    NoEmptySpaceWithAllChracsDirective,
    UserNameDirective,
    StringValidatorDirective,
    TextareaWithCopyPasteDirective,
    UtcdatePipe

  ],
  imports: [
    CommonModule
  ],
  exports: [
    MyEmailDirective,
    InputFieldDirective,
    MobileNumberDirective,
    MyNameDirective,
    MyPasswordDirective,
    SearchIdValidatorDirective,
    SmsTemplateValidatorDirective,
    TextareaDirective,
    TextareaWithCopyPasteDirective,
    NoEmptySpaceWithAllChracsDirective,
    UserNameDirective,
    StringValidatorDirective,
    UtcdatePipe
  ]
})
export class SharedModule { }
