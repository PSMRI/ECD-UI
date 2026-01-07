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
  Component,
  ComponentFactoryResolver,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { CallAllocationComponent } from '../../activities/call-allocation/call-allocation/call-allocation.component';
import { CallReallocationComponent } from '../../activities/call-reallocation/call-reallocation/call-reallocation.component';
import { CallConfigurationComponent } from '../../configurations/call-configurations/call-configuration/call-configuration.component';
import { QuestionnaireConfigurationComponent } from '../../configurations/questionnaire-config/questionnaire-configuration/questionnaire-configuration.component';
import { UploadexcelComponent } from '../../activities/uploadexcel/uploadexcel.component';
import { SectionConfigurationComponent } from '../../configurations/section-configurations/section-configuration/section-configuration.component';
import { SmsTemplateComponent } from '../../configurations/sms-template/sms-template/sms-template.component';
import { SectionQuestionnaireMappingComponent } from '../../configurations/section-questionnaire-map/section-questionnaire-mapping/section-questionnaire-mapping.component';
import { AlertNotificationComponent } from '../../activities/alerts/alert-notification/alert-notification.component';

import { LocationMessagesComponent } from '../../activities/supervisor-locationMessages/location-messages/location-messages.component';
import { ForceLogoutComponent } from '../../activities/force-logout/force-logout.component';
import { DialPreferenceComponent } from '../../configurations/dial-preference/dial-preference/dial-preference.component';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { FormBuilder } from '@angular/forms';
import { SupervisorNotificationComponent } from '../../activities/notification-supervisor/supervisor-notification/supervisor-notification.component';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorReportsComponent } from '../../supervisor-reports/supervisor-reports/supervisor-reports.component';
import { MapQuestionaireConfigurationComponent } from '../../configurations/question-Mapping/map-questionaire-configuration/map-questionaire-configuration.component';
// import { SupervisorReportsComponent } from '../'
import { AmritTrackingService } from 'Common-UI/src/tracking';

@Component({
  selector: 'app-innerpage-supervisor',
  templateUrl: './innerpage-supervisor.component.html',
  styleUrls: ['./innerpage-supervisor.component.css'],
})
export class InnerpageSupervisorComponent implements OnInit {
  @ViewChild('dynamicContent', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;
  selectedActivity: any;
  selectedReport: any;
  selectedConfiguration: any;
  private components: { [key: string]: any } = {
    dataUpload: UploadexcelComponent,
    callAllocation: CallAllocationComponent,
    callReallocation: CallReallocationComponent,
    callConfiguration: CallConfigurationComponent,
    sectionConfiguration: SectionConfigurationComponent,
    alerts: AlertNotificationComponent,
    notifications: SupervisorNotificationComponent,
    locationMessages: LocationMessagesComponent,
    QuestionnaireConfiguration: QuestionnaireConfigurationComponent,
    MapSectionQuestionnaire: SectionQuestionnaireMappingComponent,
    smsTemplate: SmsTemplateComponent,
    autoPreviewDialing: DialPreferenceComponent,
    forceLogout:ForceLogoutComponent,
    reports:SupervisorReportsComponent,
    MapQuestionnaireConfiguration:MapQuestionaireConfigurationComponent
  };
  selectedRoute: any;
  currentLanguageSet: any;

  constructor(
    private router: Router,
    private supervisorService: SupervisorService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private setLanguageService: SetLanguageService,
    private trackingService: AmritTrackingService
  ) {}

  innerpageheaderForm = this.fb.group({
    selectedActivity: [''],
    selectedReport: [''],
    selectedConfiguration: ['']
  })

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.supervisorService.setContainer(this.container);
    this.route.queryParams.subscribe((params: any) => {
      if(params !== undefined && params !==null){
      this.selectedRoute = params.data;
      this.supervisorService.createComponent(this.components[this.selectedRoute], null);
      this.patchWorkAreaValue(this.selectedRoute);
      } else{
        this.confirmationService.openDialog(this.currentLanguageSet.unableToRouteToTheSelectedAreaPleaseChooseManually, 'info');
      }
    });
  }

  patchWorkAreaValue(value: any){
    if(value === "dataUpload" || value === "callAllocation" || value === "callReallocation" || value === "alerts" ||
    value === "notifications" || value === "locationMessages"|| value === "forceLogout")
    this.innerpageheaderForm.controls.selectedActivity.patchValue(value);
    else if(value === "callConfiguration" || value === "QuestionnaireConfiguration" || value === "sectionConfiguration" || 
    value === "smsTemplate" || value === "autoPreviewDialing" || value === "MapSectionQuestionnaire" || value === "MapQuestionnaireConfiguration")
    this.innerpageheaderForm.controls.selectedConfiguration.patchValue(value);
    else 
    this.innerpageheaderForm.controls.selectedReport.patchValue(value);

  }

  onSelectionChange(event: any) {
    switch (event.source.ngControl.name) {
      case 'selectedActivity':
        this.innerpageheaderForm.controls['selectedReport'].reset();
        this.innerpageheaderForm.controls['selectedConfiguration'].reset();
        break;
      case 'selectedReport':
        this.innerpageheaderForm.controls['selectedActivity'].reset();
        this.innerpageheaderForm.controls['selectedConfiguration'].reset();
        break;
      case 'selectedConfiguration':
        this.innerpageheaderForm.controls['selectedActivity'].reset();
        this.innerpageheaderForm.controls['selectedReport'].reset();
        break;
    }
  
    this.supervisorService.createComponent(this.components[event.value], null);
  }
  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  navigateToPrev() {
    this.confirmationService.openDialog(this.currentLanguageSet.areYouSureYouWouldLikeToGoBack, 'confirm')
    .afterClosed().subscribe(res => {
      if(res)
      this.router.navigate(['/dashboard']);
    });  
  }

  trackFieldInteraction(fieldName: string) {
    this.trackingService.trackFieldInteraction(fieldName, 'Supervisor Dashboard');
  }
}
