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
import { QualityAuditorRoutingModule } from './quality-auditor-routing.module';
import { CallAuditComponent } from './call-audit/call-audit/call-audit.component';
import { InnerpageQualityAuditorComponent } from './innerpage-quality-auditor/innerpage-quality-auditor/innerpage-quality-auditor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MaterialModule } from '../material/material.module';
import { MatInputModule } from '@angular/material/input';
import { CallRatingComponent } from './call-rating/call-rating.component';
import { ViewCasesheetComponent } from './view-casesheet/view-casesheet.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    CallAuditComponent,
    InnerpageQualityAuditorComponent,
    CallRatingComponent,
    ViewCasesheetComponent
  ],
  imports: [
    CommonModule,
    QualityAuditorRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIconModule,
    MatCheckboxModule,
    MaterialModule,
    SharedModule
  ]
})
export class QualityAuditorModule { }
