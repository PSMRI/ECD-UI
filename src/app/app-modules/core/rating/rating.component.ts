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
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { CoreService } from '../../services/core/core.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { SessionStorageService } from 'src/app/app-modules/services/core/session-storage.service';
/**
 * DE40034072
 * 02-03-2023
 */
@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css'],
})
export class RatingComponent implements OnInit, DoCheck {
  currentLanguageSet: any;
  selectedRole: any;
  agentRatingData: any;
  displayedColumns: string[] = [
    'date',
    'scoreInPercentage',
    'grade',
  ];
  constructor(private setLanguageService: SetLanguageService,  private loginService: LoginserviceService,
  private confirmationService: ConfirmationService, readonly sessionstorage:SessionStorageService, private coreService: CoreService) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.selectedRole = this.sessionstorage.getItem('role');
    this.getAgentRatingScore();
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
   * For fetching agent's latest audit score and grade
   */
  getAgentRatingScore() {
     const userId = this.sessionstorage.userID;
    // let userId = 2002;
    const psmId = this.sessionstorage.getItem('providerServiceMapID');
    

    this.coreService
      .getAgentAuditScore(userId,psmId)
      .subscribe(
        (response: any) => {
          if (response) {
            this.agentRatingData = response;
          
          } else {
            this.confirmationService.openDialog(response.errorMessage, 'error');
          }
        },
        (err: any) => {
          if(err && err.error)
          this.confirmationService.openDialog(err.error, 'error');
          else
          this.confirmationService.openDialog(err.title + err.detail, 'error')
          });
  }
}
