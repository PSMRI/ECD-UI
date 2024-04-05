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


import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupervisorRoutingModule } from './supervisor-routing.module';
import { InnerpageSupervisorComponent } from './innerpage-supervisor/innerpage-supervisor/innerpage-supervisor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { CallAllocationComponent } from './activities/call-allocation/call-allocation/call-allocation.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { CallConfigurationComponent } from './configurations/call-configurations/call-configuration/call-configuration.component';
import { CreateCallConfigurationComponent } from './configurations/call-configurations/create-call-configuration/create-call-configuration.component';
import { EditCallConfigurationComponent } from './configurations/call-configurations/edit-call-configuration/edit-call-configuration.component';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { QuestionnaireConfigurationComponent } from './configurations/questionnaire-config/questionnaire-configuration/questionnaire-configuration.component';
import { CreateQuestionnaireComponent } from './configurations/questionnaire-config/create-questionnaire/create-questionnaire.component';
import { UploadexcelComponent } from './activities/uploadexcel/uploadexcel.component';
import { AlertNotificationComponent } from './activities/alerts/alert-notification/alert-notification.component';
import { CallReallocationComponent } from './activities/call-reallocation/call-reallocation/call-reallocation.component';

import { SmsTemplateComponent } from './configurations/sms-template/sms-template/sms-template.component';

import { LocationMessagesComponent } from './activities/supervisor-locationMessages/location-messages/location-messages.component';
import { CreateSectionConfigurationComponent } from './configurations/section-configurations/create-section-configuration/create-section-configuration.component';
import { EditSectionConfigurationComponent } from './configurations/section-configurations/edit-section-configuration/edit-section-configuration.component';
import { CallSectionQuestionaireMappingComponent } from './configurations/call-configurations/call-section-questionaire-mapping/call-section-questionaire-mapping.component';
import { SectionQuestionnaireMappingComponent } from './configurations/section-questionnaire-map/section-questionnaire-mapping/section-questionnaire-mapping.component';
import { CreateSectionQuestionnaireMappingComponent } from './configurations/section-questionnaire-map/create-section-questionnaire-mapping/create-section-questionnaire-mapping.component';
import { EditSectionQuestionnaireMappingComponent } from './configurations/section-questionnaire-map/edit-section-questionnaire-mapping/edit-section-questionnaire-mapping.component';
import { SectionConfigurationComponent } from './configurations/section-configurations/section-configuration/section-configuration.component';
import { DialPreferenceComponent } from './configurations/dial-preference/dial-preference/dial-preference.component';
import { ForceLogoutComponent } from './activities/force-logout/force-logout.component';
import { CreateAlertComponent } from './activities/alerts/alert-notification/create-alert/create-alert.component';
import { EditAlertComponent } from './activities/alerts/alert-notification/edit-alert/edit-alert.component';

import { CreateLocationMessageComponent } from './activities/supervisor-locationMessages/create-location-message/create-location-message.component';
import { EditLocationMessageComponent } from './activities/supervisor-locationMessages/edit-location-message/edit-location-message.component';
import { SupervisorNotificationComponent } from './activities/notification-supervisor/supervisor-notification/supervisor-notification.component';
import { CreateNotificationComponent } from './activities/notification-supervisor/create-notification/create-notification.component';
import { EditNotificationComponent } from './activities/notification-supervisor/edit-notification/edit-notification.component';
import { SharedModule } from '../shared/shared.module';
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import { SupervisorReportsComponent } from './supervisor-reports/supervisor-reports/supervisor-reports.component';
// import { QuestionMappingComponent } from './configurations/question-mapping/question-mapping.component';
import { MapQuestionaireConfigurationComponent } from './configurations/question-Mapping/map-questionaire-configuration/map-questionaire-configuration.component';
import { CreateQuestionMappingComponent } from './configurations/question-Mapping/create-question-mapping/create-question-mapping.component';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { EditQuestionMappingComponent } from './configurations/question-Mapping/edit-question-mapping/edit-question-mapping.component';
@NgModule({
  declarations: [
    InnerpageSupervisorComponent,
    CallAllocationComponent,
    CallConfigurationComponent,
    CreateCallConfigurationComponent,
    EditCallConfigurationComponent,
    QuestionnaireConfigurationComponent,
    CreateQuestionnaireComponent,
    SectionConfigurationComponent,
    UploadexcelComponent,
    AlertNotificationComponent,
    CallReallocationComponent,
    CreateSectionConfigurationComponent,
    EditSectionConfigurationComponent,
    SmsTemplateComponent,
    SectionQuestionnaireMappingComponent,
    CreateSectionQuestionnaireMappingComponent,
    SupervisorNotificationComponent,
    LocationMessagesComponent,
    EditSectionQuestionnaireMappingComponent,
    CallSectionQuestionaireMappingComponent,
    ForceLogoutComponent,
    DialPreferenceComponent,
    CreateAlertComponent,
    EditAlertComponent,
    CreateNotificationComponent,
    EditNotificationComponent,
    CreateLocationMessageComponent,
    EditLocationMessageComponent,
    SupervisorReportsComponent,
    // QuestionMappingComponent,
    MapQuestionaireConfigurationComponent,
    CreateQuestionMappingComponent,
    EditQuestionMappingComponent
  ],
  imports: [
    CommonModule,
    SupervisorRoutingModule,
    FormsModule,
    MaterialModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatCardModule,
    SharedModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
  ],
  exports: [
    InnerpageSupervisorComponent,
    CallAllocationComponent,
    CallConfigurationComponent,
    CreateCallConfigurationComponent,
    EditCallConfigurationComponent,
    QuestionnaireConfigurationComponent,
    CreateQuestionnaireComponent,
    SectionQuestionnaireMappingComponent,
    EditSectionQuestionnaireMappingComponent,
    CreateSectionQuestionnaireMappingComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SupervisorModule {}
