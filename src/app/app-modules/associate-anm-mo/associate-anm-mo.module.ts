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
import { CommonModule, DatePipe } from '@angular/common';
import { AssociateAnmMoRoutingModule } from './associate-anm-mo-routing.module';
import { AgentsInnerpageComponent } from './agents-innerpage/agents-innerpage.component';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
// import { MatInputModule, MatInputModule } from '@angular/material/input';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MaterialModule } from '../material/material.module';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { CallClosureComponent } from './call-closure/call-closure.component';
import { ViewDetailsComponent } from './view-details/view-details.component';
import { OutboundWorklistComponent } from './outbound-worklist/outbound-worklist.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CzentrixIframeComponent } from './czentrix-iframe/czentrix-iframe.component';
import { EcdQuestionnaireComponent } from './ecd-questionnaire/ecd-questionnaire.component';
import { BenRegistrationComponent } from './beneficiary-registration/ben-registration/ben-registration.component';
import { BeneficiaryCallHistoryComponent } from './beneficiary-call-history/beneficiary-call-history.component';
import { HighRiskReasonsComponent } from './high-risk-reasons/high-risk-reasons.component';
import { SharedModule } from '../shared/shared.module';
import { VideoConsultationComponent } from './video-consultation/video-consultation.component';


@NgModule({
  declarations: [
    AgentsInnerpageComponent,
    CallClosureComponent,
    ViewDetailsComponent,
    OutboundWorklistComponent,
    CzentrixIframeComponent,
    EcdQuestionnaireComponent,
    BenRegistrationComponent,
    BeneficiaryCallHistoryComponent,
    HighRiskReasonsComponent,
    VideoConsultationComponent

  ],
  imports: [
    CommonModule,
    AssociateAnmMoRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIconModule,
    MatCheckboxModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [DatePipe],
})
export class AssociateAnmMoModule { }
