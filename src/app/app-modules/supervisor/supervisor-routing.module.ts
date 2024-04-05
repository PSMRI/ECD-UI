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
import { CreatequalitySectionConfigurationComponent } from '../quality-supervisor/activites/qualityAudit-sectionConfiguration/createquality-section-configuration/createquality-section-configuration.component';
import { CallAllocationComponent } from './activities/call-allocation/call-allocation/call-allocation.component';
import { InnerpageSupervisorComponent } from './innerpage-supervisor/innerpage-supervisor/innerpage-supervisor.component';



const routes: Routes = [
  { path: '', redirectTo: 'innerpage-supervisor', pathMatch: 'full' },
  { path: 'innerpage-supervisor', component: InnerpageSupervisorComponent },
  {path : 'CreatequalitySectionConfigurationComponent',component:CreatequalitySectionConfigurationComponent}
];
 
  

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SupervisorRoutingModule {}
