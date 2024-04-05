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


import { Component, DoCheck, OnInit } from '@angular/core';
import { SetLanguageService } from '../../services/set-language/set-language.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})

/**
 * DE40034072 - 12-01-2022
 */
export class FooterComponent implements OnInit, DoCheck {
  currentLanguageSet: any;
  year: any;
  today: any;
  status: any;
  constructor(private setLanguageService: SetLanguageService) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.today = new Date();
    this.year = this.today.getFullYear();
    console.log('inside footer', this.year);
    setInterval(() => {
      this.status = navigator.onLine;
    }, 1000);
  }

  ngDoCheck() {
    this.getSelectedLanguage();
  }

  /**
   * Getting the selected language set
   */

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
    else this.changeLanguage('English');
  }

  changeLanguage(language: string) {
    this.setLanguageService.getLanguageData(language).subscribe((data) => {
      this.currentLanguageSet = data;
    });
  }
}
