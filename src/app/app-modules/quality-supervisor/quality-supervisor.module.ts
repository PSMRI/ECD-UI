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
import { QualitySupervisorRoutingModule } from './quality-supervisor-routing.module';
import { CreateAgentComponent } from './activites/create-agent/create-agent.component';
import { MaterialModule } from '../material/material.module';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { AgentMappingConfigurationComponent } from './activites/agent-mapping-configuration/agent-mapping-configuration.component';
import { InnerpageSupervisorComponent } from './innerpage-quality-supervisor/innerpage-supervisor/innerpage-supervisor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { QualitySectionConfigurationComponent } from './activites/qualityAudit-sectionConfiguration/quality-section-configuration/quality-section-configuration.component';
import { CreatequalitySectionConfigurationComponent } from './activites/qualityAudit-sectionConfiguration/createquality-section-configuration/createquality-section-configuration.component';
import { EditQualitySectionConfigurationComponent } from './activites/qualityAudit-sectionConfiguration/edit-quality-section-configuration/edit-quality-section-configuration.component';
import { EditAgentComponent } from './activites/edit-agent/edit-agent.component';
import { ReportsQualitySupervisorComponent } from './activites/reports-quality-supervisor/reports-quality-supervisor.component';
import { GradeConfigurationComponent } from './activites/Grade-config/grade-configuration/grade-configuration.component';
import { CreateGradeConfigComponent } from './activites/Grade-config/create-grade-config/create-grade-config.component';
import { EditGradeConfigComponent } from './activites/Grade-config/edit-grade-config/edit-grade-config.component';
import { SampleSelectionConfigurationComponent } from './activites/sample-selection/sample-selection-configuration/sample-selection-configuration.component';
import { CreateSampleSelectionComponent } from './activites/sample-selection/create-sample-selection/create-sample-selection.component';
import { EditSampleSelectionComponent } from './activites/sample-selection/edit-sample-selection/edit-sample-selection.component';
import {MatLegacyRadioModule as MatRadioModule} from '@angular/material/legacy-radio';
import { EditQaConfigComponent } from './activites/quality-audit-question-config/edit-qa-question-config/edit-qa-config/edit-qa-config.component';
import { QaQuestionConfigComponent } from './activites/quality-audit-question-config/qa-question-config/qa-question-config/qa-question-config.component';
import { CreateQaQuestionConfigComponent } from './activites/quality-audit-question-config/create-qa-question-config/create-qa-question-config/create-qa-question-config.component';
import { TitleCasePipe } from '@angular/common';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    CreateAgentComponent,
    AgentMappingConfigurationComponent,
    InnerpageSupervisorComponent,
    QualitySectionConfigurationComponent,
    CreatequalitySectionConfigurationComponent,
    EditQualitySectionConfigurationComponent,
    EditAgentComponent,
    ReportsQualitySupervisorComponent,
    GradeConfigurationComponent,
    CreateGradeConfigComponent,
    EditGradeConfigComponent,
    SampleSelectionConfigurationComponent,
    CreateSampleSelectionComponent,
    EditSampleSelectionComponent,
    CreateQaQuestionConfigComponent,
    EditQaConfigComponent,
    QaQuestionConfigComponent
  ],
  imports: [
    CommonModule,
    QualitySupervisorRoutingModule,
    MaterialModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatRadioModule,
    SharedModule
  ],
  providers:[TitleCasePipe]
})
export class QualitySupervisorModule {}
