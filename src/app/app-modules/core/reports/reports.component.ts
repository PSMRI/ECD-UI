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
import { Router } from '@angular/router';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

/**
 * DE40034072
 * 18-01-2022
 */
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit, DoCheck {
  currentLanguageSet: any;
  selectedRole: any;
  reportName: any[] = [
    {
      screen: 'ECD Reports',
      value: 'reports',
    },
    // {
    //   screen: 'Call Detail Report',
    //   value: 'callDetailReport',
    // },
    // {
    //   screen: 'Call Summary Report',
    //   value: 'callSummaryReport',
    // },
    // {
    //   screen: 'Benficiary Wise Report',
    //   value: 'BenificiaryReport',
    // }
    // 'High Risk Report',
    // 'Still Birth Report',
    // 'District Wise Call Report',
    // 'Stakeholder Report',
    // 'Infant Death Report',
    // 'Mother Death Report',
  ];

  constructor(
    private setLanguageService: SetLanguageService,
    readonly sessionstorage:SessionStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.selectedRole = this.sessionstorage.getItem('role');
  }

  ngDoCheck() {
    this.getSelectedLanguage();
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  /**
   *
   * @param reportName
   * Redirecting to report download screen
   */
  openReport(reportName: any) {
    /**
     * todo Add code to navigate to respective report component
     */
    this.router.navigate(['/supervisor/innerpage-supervisor'], {
      queryParams: { data: reportName },
    });
  }

  /**
   * Redirecting to activity area to view more reports
   */
  openActivityArea() {
    /**
     * todo add router to navigate activity area
     */

    this.router.navigate(['/supervisor-inner-page']);
  }
}
