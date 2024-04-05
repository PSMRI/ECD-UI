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


import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { QualityAuditorService } from 'src/app/app-modules/services/quality-auditor/quality-auditor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { CallAuditComponent } from '../../call-audit/call-audit/call-audit.component';

@Component({
  selector: 'app-innerpage-quality-auditor',
  templateUrl: './innerpage-quality-auditor.component.html',
  styleUrls: ['./innerpage-quality-auditor.component.css']
})
export class InnerpageQualityAuditorComponent implements OnInit {
  selectedRoute: any;
  currentLanguageSet: any;

  constructor(
    private qualityAuditorService: QualityAuditorService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private router: Router,
    private setLanguageService: SetLanguageService
  ) { }

  
  @ViewChild('dynamicContent', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;
  private components: { [key: string]: any } = { 
    callAudit: CallAuditComponent,
  };

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.qualityAuditorService.setContainer(this.container);
    this.route.queryParams.subscribe((params: any) => {
      if(params !== undefined && params !==null){
      this.selectedRoute = params.data;
      this.qualityAuditorService.loadComponent(this.components[this.selectedRoute], null);
      } else{
        this.confirmationService.openDialog(this.currentLanguageSet.unableToRoute, 'info')
      }
    });
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  } 

  backToDashboard(){
    this.confirmationService.openDialog(this.currentLanguageSet.areYouSureYouWouldLikeToGoBack, 'confirm')
    .afterClosed().subscribe(res => {
      if(res)
      this.router.navigate(['/dashboard']);
    });
    this.qualityAuditorService.callAuditData=undefined;
  }

}
