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


import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { AgentMappingConfigurationComponent } from '../../activites/agent-mapping-configuration/agent-mapping-configuration.component';
import { QualitySectionConfigurationComponent } from '../../activites/qualityAudit-sectionConfiguration/quality-section-configuration/quality-section-configuration.component';
import { ReportsQualitySupervisorComponent } from '../../activites/reports-quality-supervisor/reports-quality-supervisor.component';
import { GradeConfigurationComponent } from '../../activites/Grade-config/grade-configuration/grade-configuration.component';
import { SampleSelectionConfigurationComponent } from '../../activites/sample-selection/sample-selection-configuration/sample-selection-configuration.component';
import { QaQuestionConfigComponent } from '../../activites/quality-audit-question-config/qa-question-config/qa-question-config/qa-question-config.component';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';

@Component({
  selector: 'app-innerpage-supervisor',
  templateUrl: './innerpage-supervisor.component.html',
  styleUrls: ['./innerpage-supervisor.component.css']
})

export class InnerpageSupervisorComponent implements OnInit {
  @ViewChild('dynamicContent', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;
  selectedActivity: any;

  private components: { [key: string]: any } = { 
    agentQualityAuditorMapping: AgentMappingConfigurationComponent,
    qualityAuditSectionConfiguration: QualitySectionConfigurationComponent ,
    qualityAuditQuestionnaireConfiguration: QaQuestionConfigComponent,
    gradeConfiguration: GradeConfigurationComponent,
    sampleSelection: SampleSelectionConfigurationComponent,
    reports: ReportsQualitySupervisorComponent,
  };
  selectedRoute: any;
  currentLanguageSet: any;

  constructor(
    private router: Router,
    private qualitySupervisorService: QualitySupervisorService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private setLanguageService: SetLanguageService
  ) { }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.qualitySupervisorService.setContainer(this.container);
    this.route.queryParams.subscribe((params: any) => {
      if(params !== undefined && params !==null){
      this.selectedRoute = params.data;
      this.qualitySupervisorService.createComponent(this.components[this.selectedRoute], null);
      this.patchWorkAreaValue(this.selectedRoute);
      } else{
        this.confirmationService.openDialog(this.currentLanguageSet.unableToRouteToTheSelectedAreaPleaseChooseManually, 'info');
      }
    });
  }
  innerpageQSHeaderForm  = this.fb.group({
    selectedActivity: [''],
  })

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  onSelectionChange(event: any) { 
    this.qualitySupervisorService.createComponent(this.components[event.value], null);
  }

  patchWorkAreaValue(value: any){
    if(value === "agentQualityAuditorMapping" || value === "gradeConfiguration" || 
       value === "qualityAuditSectionConfiguration" || value === "reports" ||  
       value === "qualityAuditQuestionnaireConfiguration" || value === "sampleSelection")
    this.innerpageQSHeaderForm.controls.selectedActivity.patchValue(value);
  }

  navigateToPrev() {
    this.confirmationService.openDialog(this.currentLanguageSet.areYouSureYouWouldLikeToGoBack, 'confirm')
    .afterClosed().subscribe(res => {
      if(res)
      this.router.navigate(['/dashboard']);
    });  
  }
}
