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


import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';

/**
 * KA40094929
 */

@Component({
  selector: 'app-create-section-questionnaire-mapping',
  templateUrl: './create-section-questionnaire-mapping.component.html',
  styleUrls: ['./create-section-questionnaire-mapping.component.css'],
})
export class CreateSectionQuestionnaireMappingComponent implements OnInit, DoCheck {
  currentLanguageSet: any;
  @Input()
  public data: any;
  enableEdit = false;
  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private setLanguageService: SetLanguageService,
    private supervisorService: SupervisorService
  ) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
  }

  ngDoCheck() {
    this.getSelectedLanguage();

    if (
      this.data.isEdit !== null &&
      this.data.isEdit !== undefined &&
      this.data.isEdit === true
    ) {
      this.enableEdit = true;
    } else {
      this.enableEdit = false;
    }
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }
}
