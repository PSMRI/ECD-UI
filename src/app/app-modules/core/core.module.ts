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



import { CommonModule } from '@angular/common';
import { CommonDialogComponent } from './common-dialog/common-dialog.component';
import { FooterComponent } from './footer/footer.component';
import { MaterialModule } from '../material/material.module';
import { SpinnerComponent } from './spinner/spinner.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CallStatisticsComponent } from './call-statistics/call-statistics.component';
import { HeaderComponent } from './header/header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivityThisWeekComponent } from './activity-this-week/activity-this-week.component';
import { RatingComponent } from './rating/rating.component';
import { ReportsComponent } from './reports/reports.component';
import { CentreOverallQualityRatingChartComponent } from './charts/centre-overall-quality-rating-chart/centre-overall-quality-rating-chart.component';
import { SkillsetWiseQualityRatingChartComponent } from './charts/skillset-wise-quality-rating-chart/skillset-wise-quality-rating-chart.component';
import { CustomerSatisfactionComponent } from './charts/customer-satisfaction/customer-satisfaction.component';
import { TenureWiseQualityRatingsComponent } from './charts/tenure-wise-quality-ratings/tenure-wise-quality-ratings.component';
import { OpenAlertsNotificationLocationmessagesComponent } from './alerts-notifications-locationmessages/open-alerts-notification-locationmessages/open-alerts-notification-locationmessages.component';
import { AgentQualityScoreChartComponent } from './charts/agent-quality-score-chart/agent-quality-score-chart.component';
import { SharedModule } from '../shared/shared.module';
import { NgModule } from '@angular/core';
import { AuthService } from "../services/auth.service";


@NgModule({
  declarations: [
    CommonDialogComponent,
    FooterComponent,
    SpinnerComponent,
    DashboardComponent,
    CallStatisticsComponent,
    HeaderComponent,
    ActivityThisWeekComponent,
    RatingComponent,
    ReportsComponent,
    CentreOverallQualityRatingChartComponent,
    SkillsetWiseQualityRatingChartComponent,
    CustomerSatisfactionComponent,
    TenureWiseQualityRatingsComponent,
    OpenAlertsNotificationLocationmessagesComponent,
    AgentQualityScoreChartComponent
   
  ],
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule, 
    SharedModule],
  exports: [
    CommonDialogComponent,
    FooterComponent,
    SpinnerComponent,
    DashboardComponent,
    CallStatisticsComponent,
    HeaderComponent,
  ],
  providers: [
    AuthService
  ]
  // entryComponents: [CommonDialogComponent],
})
export class CoreModule {}
