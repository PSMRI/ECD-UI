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
import { RouterModule, Routes } from '@angular/router';
import { ForgotPasswordComponent } from './app-modules/user-login/forgot-password/forgot-password.component';
import { LoginComponent } from './app-modules/user-login/login/login.component';
import { RoleSelectionComponent } from './app-modules/user-login/role-selection/role-selection.component';
import { SetPasswordComponent } from './app-modules/user-login/set-password/set-password.component';
import { AuthGuardService } from './app-modules/services/auth-guard/auth-guard.service';
import { DashboardComponent } from './app-modules/core/dashboard/dashboard.component';
import { InnerpageSupervisorComponent } from './app-modules/supervisor/innerpage-supervisor/innerpage-supervisor/innerpage-supervisor.component';
import { CallAllocationComponent } from './app-modules/supervisor/activities/call-allocation/call-allocation/call-allocation.component';
import { CallConfigurationComponent } from './app-modules/supervisor/configurations/call-configurations/call-configuration/call-configuration.component';
import { CreateCallConfigurationComponent } from './app-modules/supervisor/configurations/call-configurations/create-call-configuration/create-call-configuration.component';
import { EditCallConfigurationComponent } from './app-modules/supervisor/configurations/call-configurations/edit-call-configuration/edit-call-configuration.component';
import { SetSecurityQuestionsComponent } from './app-modules/user-login/set-security-questions/set-security-questions.component';
import { BenRegistrationComponent } from './app-modules/associate-anm-mo/beneficiary-registration/ben-registration/ben-registration.component';
import { BeneficiaryCallHistoryComponent } from './app-modules/associate-anm-mo/beneficiary-call-history/beneficiary-call-history.component';
import { EcdQuestionnaireComponent } from './app-modules/associate-anm-mo/ecd-questionnaire/ecd-questionnaire.component';
import { AgentsInnerpageComponent } from './app-modules/associate-anm-mo/agents-innerpage/agents-innerpage.component';
// import { OutboundWorklistComponent } from './app-modules/core/outbound-worklist/outbound-worklist.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'set-security-questions',
    component: SetSecurityQuestionsComponent,
  },

  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'set-password', component: SetPasswordComponent },
  {
    path: 'role-selection',
    component: RoleSelectionComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'dashboardQuestionare',
    component: EcdQuestionnaireComponent,
    canActivate: [AuthGuardService],
  },

  {
    path: 'call-configuration',
    component: CallConfigurationComponent,
    canActivate: [AuthGuardService],
  },
  // {
  //   path: 'core-outbound-worklist',
  //   component: OutboundWorklistComponent,
  //   canActivate: [AuthGuardService],
  // },
  {
    path: 'create-call-configuration',
    component: CreateCallConfigurationComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'edit-call-configuration',
    component: EditCallConfigurationComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'supervisor',
    canActivate: [AuthGuardService],
    loadChildren: () =>
      import('./app-modules/supervisor/supervisor.module').then(
        (x) => x.SupervisorModule
      ),
  },
  {
    path: 'quality-supervisor',
    canActivate: [AuthGuardService],
    loadChildren: () =>
      import('./app-modules/quality-supervisor/quality-supervisor.module').then(
        (x) => x.QualitySupervisorModule
      ),
  },
  {
    path: 'innerpage-supervisor',
    component: InnerpageSupervisorComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'call-allocation',
    component: CallAllocationComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'app-beneficiary-call-history',
    component: BeneficiaryCallHistoryComponent,
 
  },
  {
    path: 'quality-supervisor',
    canActivate: [AuthGuardService],
    loadChildren: () =>
      import('./app-modules/quality-supervisor/quality-supervisor.module').then(
        (x) => x.QualitySupervisorModule
      ),
  },
  {
    path: 'quality-auditor',
    canActivate: [AuthGuardService],
    loadChildren: () =>
      import('./app-modules/quality-auditor/quality-auditor.module').then(
        (x) => x.QualityAuditorModule
      ),
  },
  {
    path: 'associate-anm-mo',
    canActivate: [AuthGuardService],
    loadChildren: () =>
      import('./app-modules/associate-anm-mo/associate-anm-mo.module').then(
        (x) => x.AssociateAnmMoModule
      ),
  },
  { path: 'beneficiary-registration', component: BenRegistrationComponent },
  {
    path: 'feedback',
    loadChildren: () =>
      import('Common-UI/src/feedback/feedback.module').then(
        m => m.FeedbackModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
