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


import { Component, DoCheck, OnInit } from '@angular/core';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { Router } from '@angular/router';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

/**
 * DE40034072
 * 18-01-2023
 */
@Component({
  selector: 'app-activity-this-week',
  templateUrl: './activity-this-week.component.html',
  styleUrls: ['./activity-this-week.component.css'],
})
export class ActivityThisWeekComponent implements OnInit, DoCheck {
  currentLanguageSet: any;
  selectedRole: any;
  outboundWorkArea: any;
  activities: any;
  activitiesForSupervisor = [
    {
      screen: 'ECD Data Upload',
      value: 'dataUpload',
    },
    {
      screen: 'Call Allocation',
      value: 'callAllocation',
    },
    {
      screen: 'Call Reallocation',
      value: 'callReallocation',
    },
    {
      screen: 'Alerts',
      value: 'alerts',
    },
    {
      screen: 'Notifications',
      value: 'notifications',
    },
    {
      screen: 'Location Messages',
      value: 'locationMessages',
    },
    {
      screen: 'Force Logout',
      value: 'forceLogout',
    },
    {
      screen: 'Call Configuration',
      value: 'callConfiguration',
    },
    {
      screen: 'Predictive Dialer',
      value: 'autoPreviewDialing',
    },
    {
      screen: 'SMS Template',
      value: 'smsTemplate',
    },
    {
      screen: 'Section Configuration',
      value: 'sectionConfiguration',
    },
    {
      screen: 'Questionnaire Configuration',
      value: 'QuestionnaireConfiguration',
    },
    {
      screen: 'Map Section Questionnaire',
      value: 'MapSectionQuestionnaire',
    },
    {
      screen: 'Map Questionnaire',
      value: 'MapQuestionnaireConfiguration',
    },
  ];

  activitiesForQualitySupervisor = [
    {
      screen: 'Agent Quality Auditor Mapping',
      value: 'agentQualityAuditorMapping',
    },
    {
      screen: 'Quality Audit Section Configuration',
      value: 'qualityAuditSectionConfiguration',
    },
    {
      screen: 'Quality Audit Questionnaire Configuration',
      value: 'qualityAuditQuestionnaireConfiguration',
    },
    {
      screen: 'Grade Configuration',
      value: 'gradeConfiguration',
    },
    {
      screen: 'Sample Selection',
      value: 'sampleSelection',
    },
    {
      screen: 'Reports',
      value: 'reports',
    },
  ];

  activitiesForQualityAuditor = [
    {
      screen: 'Call Audit',
      value: 'callAudit',
    },
  ];
  activitiesForQualityAssociate = [
    {
      screen: 'Outbound Worklist',
      value: 'outBoundWorklist',
    },
  ];

  constructor(
    private setLanguageService: SetLanguageService,
    readonly sessionstorage:SessionStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.selectedRole = this.sessionstorage.getItem('role');
    console.log(this.selectedRole);
    this.setActivities();
  }

  ngDoCheck() {
    this.getSelectedLanguage();
    this.selectedRole = this.sessionstorage.getItem('role');
    this.setActivities();
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  /**
   * Navigating to supervisor inner page component

   
   */

  openScreen(activity: any) {
    if (this.selectedRole === 'Supervisor') {
      this.router.navigate(['/supervisor/innerpage-supervisor'], {
        queryParams: { data: activity },
      });
    } else if (this.selectedRole === 'Quality Supervisor') {
      this.router.navigate(
        ['/quality-supervisor/innerpage-quality-supervisor'],
        {
          queryParams: { data: activity},
          
        }
      );
    } else if (this.selectedRole === 'Quality Auditor') {
      this.router.navigate(['/quality-auditor/innerpage-quality-auditor'], {
        queryParams: { data: activity },
      });
    }
    else if (this.selectedRole === 'Associate') {
      this.router.navigate(
        ['/associate-anm-mo/agents-innerpage'],
        {
          queryParams: { data: activity}
        }
        
      );
    }
    else if (this.selectedRole === 'MO') {
      this.router.navigate(
        ['/associate-anm-mo/agents-innerpage'],
        {
          queryParams: { data: activity}
        }
        
      );
    }
    else if (this.selectedRole === 'ANM') {
      this.router.navigate(
        ['/associate-anm-mo/agents-innerpage'],
        {
          queryParams: { data: activity}
        }
        
      );
    }

    // else if(this.selectedRole == 'Associate'){
    //   this.router.navigate(
    //     ['core-outbound-worklist'],
    //   )
    // }
  }

  setActivities() {
    this.activities = [];
    if (
      this.selectedRole !== undefined &&
      this.selectedRole !== null &&
      this.selectedRole === 'Supervisor'
    ) {
      this.activities = this.activitiesForSupervisor;
    } else if (
      this.selectedRole !== undefined &&
      this.selectedRole !== null &&
      this.selectedRole === 'Quality Supervisor'
    ) {
      this.activities = this.activitiesForQualitySupervisor;
    } else if (
      this.selectedRole !== undefined &&
      this.selectedRole !== null &&
      this.selectedRole === 'Quality Auditor'
    ) {
      this.activities = this.activitiesForQualityAuditor;
    }
  }
}
