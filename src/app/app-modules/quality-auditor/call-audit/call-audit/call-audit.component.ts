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


import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { QualityAuditorService } from 'src/app/app-modules/services/quality-auditor/quality-auditor.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { CallRatingComponent } from '../../call-rating/call-rating.component';
import { ViewCasesheetComponent } from '../../view-casesheet/view-casesheet.component';
import { MatDialog } from '@angular/material/dialog';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { Subject, takeUntil } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-call-audit',
  templateUrl: './call-audit.component.html',
  styleUrls: ['./call-audit.component.css']
})
export class CallAuditComponent implements OnInit, OnDestroy {
  // Subject to unsubscribe from all observables when component is destroyed
  private destroy$ = new Subject<void>();

  // ViewChild references
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Form groups
  callAuditForm: FormGroup;
  cycleWiseForm: FormGroup;
  dateWiseForm: FormGroup;

  // Data properties
  callAuditData = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'sno', 'phoneNo', 'callId', 'callTypeID', 'createdDate',
    'assignedUserID', 'agentData', 'view', 'rate'
  ];

  // Selection properties
  currentLanguageSet: any;
  data: any;
  years: any = [];
  months: any = [];
  cycles: any = [];
  roles: any = [];
  agents: any = [];
  languages: any = [];

  // State properties
  iscycleWiseChangeForm = true;
  showQualityAuditWorklist = false;
  showAgentId = false;
  currentDate = new Date();
  currentYear = this.currentDate.getFullYear();
  currentMonth = this.currentDate.getMonth() + 1;
  invalidTimeFlag = false;

  // Paginator state
  lastPageIndex: any;
  lastLength: any;
  lastPageSize: any;

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private qualityAuditorService: QualityAuditorService,
    private setLanguageService: SetLanguageService,
    private sessionstorage: SessionStorageService,
    private confirmationService: ConfirmationService,
    private dialog: MatDialog,
    private changeDetectorRefs: ChangeDetectorRef
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.initializeComponent();
    this.setupYears();
    this.loadMasterData();
    this.handlePersistedData();
  }

  /**
   * Initialize form groups
   */
  private initForms(): void {
    this.callAuditForm = this.fb.group({
      selectedRadioButton: ['1']
    });

    this.cycleWiseForm = this.fb.group({
      language: ['', Validators.required],
      role: ['', Validators.required],
      roleId: ['', Validators.required],
      year: ['', Validators.required],
      month: ['', Validators.required],
      cycle: ['', Validators.required],
      agentId: [''],
      isValid: ['true']
    });

    this.dateWiseForm = this.fb.group({
      language: ['', Validators.required],
      role: ['', Validators.required],
      roleId: ['', Validators.required],
      start: ['', Validators.required],
      end: ['', Validators.required],
      agentId: [''],
      isValid: ['true'],
      phoneNo: ['']
    });
  }

  /**
   * Basic component initialization
   */
  private initializeComponent(): void {
    this.getSelectedLanguage();

    if (this.data) {
      setTimeout(() => this.callAuditData.paginator = this.data.data.paginator);
      setTimeout(() => this.callAuditData.sort = this.data.sort);
      this.lastLength = this.data.data.paginator.length;
      this.lastPageIndex = this.data.data.paginator.pageIndex;
      this.lastPageSize = this.data.data.paginator.pageSize;
    } else {
      setTimeout(() => {
        if (this.paginator) this.callAuditData.paginator = this.paginator;
        if (this.sort) this.callAuditData.sort = this.sort;
      });
    }

    // Set default radio button
    this.callAuditForm.controls['selectedRadioButton'].setValue('1');
    this.iscycleWiseChangeForm = false;
  }

  /**
   * Set up available years (last 5 years up to current year)
   */
  private setupYears(): void {
    for (let i = this.currentYear - 5; i <= this.currentYear; i++) {
      this.years.push(i);
    }
  }

  /**
   * Load all master data needed for the component
   */
  private loadMasterData(): void {
    this.getRoleMasters();
    this.getCyclesMaster();
    this.getLanguageMaster();
  }

  /**
   * Handle any data that should be persisted from previous operations
   */
  private handlePersistedData(): void {
    if (this.qualityAuditorService.showForm === false) {
      if (this.qualityAuditorService.callAuditData !== undefined &&
          this.qualityAuditorService.callAuditData !== null) {

        if (this.qualityAuditorService.isCycleWiseForm === true) {
          this.callAuditForm.controls['selectedRadioButton'].setValue('1');
          this.iscycleWiseChangeForm = false;
          this.cycleWiseForm.patchValue(this.qualityAuditorService.callAuditData);
          this.getMonths();
          this.getAgentByRole();
          this.getQualityAuditorWorklist();
        } else {
          this.callAuditForm.controls['selectedRadioButton'].setValue('2');
          this.iscycleWiseChangeForm = true;
          this.dateWiseForm.patchValue(this.qualityAuditorService.callAuditData);
          this.getAgentByRole();
          this.getDateWiseAuditorWorklist();
        }
      }
    }
  }

  /**
   * Get the selected language for internationalization
   */
  getSelectedLanguage(): void {
    this.setLanguageService.currentLanguage
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.currentLanguageSet = language;
      });
  }

  /**
   * Get role masters from service
   */
  getRoleMasters(): void {
    const psmId = this.sessionstorage.getItem('providerServiceMapID');
    this.masterService.getRoleMaster(psmId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res && res.length > 0) {
            this.roles = res.filter((role: any) =>
              ['anm', 'mo', 'associate'].includes(role.roleName.toLowerCase())
            );
          } else {
            this.confirmationService.openDialog(
              this.currentLanguageSet?.noRolesFound || 'No roles found',
              'error'
            );
          }
        },
        error: (err: any) => {
          this.confirmationService.openDialog(err.error, 'error');
        }
      });
  }

  /**
   * Get language master data
   */
  getLanguageMaster(): void {
    const psmId = this.sessionstorage.getItem('providerServiceMapID');
    this.masterService.getLanguageMaster(psmId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res && res.length > 0) {
            this.languages = res;
          } else {
            this.confirmationService.openDialog(
              this.currentLanguageSet?.noLanguagesFound || 'No languages found',
              'error'
            );
          }
        },
        error: (err: any) => {
          this.confirmationService.openDialog(err.error, 'error');
        }
      });
  }

  /**
   * Get cycle master data
   */
  getCyclesMaster(): void {
    const psmId = this.sessionstorage.getItem('providerServiceMapID');
    this.masterService.getCyclesMaster(psmId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res && res.length > 0) {
            this.cycles = res;
          } else {
            this.confirmationService.openDialog(
              this.currentLanguageSet?.noCyclesFound || 'No cycles found',
              'error'
            );
          }
        },
        error: (err: any) => {
          this.confirmationService.openDialog(err.error, 'error');
        }
      });
  }

  /**
   * Get months based on selected year
   */
  getMonths(): void {
    const year = this.cycleWiseForm.controls.year.value;
    this.months = [];

    if (year === this.currentYear) {
      for (let i = 1; i <= this.currentMonth; i++) {
        this.months.push(i);
      }
    } else {
      for (let i = 1; i <= 12; i++) {
        this.months.push(i);
      }
    }
  }

  /**
   * Set the role ID based on selected role name
   */
  getRoleId(): void {
    if (this.callAuditForm.controls['selectedRadioButton'].value === '1') {
      this.cycleWiseForm.controls['agentId'].reset();

      const role = this.cycleWiseForm.controls.role.value;
      const selectedRole = this.roles.find((item: any) => item.roleName === role);
      if (selectedRole) {
        this.cycleWiseForm.controls.roleId.setValue(selectedRole.roleId);
      }
    } else {
      this.dateWiseForm.controls.agentId.reset();

      const role = this.dateWiseForm.controls.role.value;
      const selectedRole = this.roles.find((item: any) => item.roleName === role);
      if (selectedRole) {
        this.dateWiseForm.controls.roleId.setValue(selectedRole.roleId);
      }
    }
  }

  /**
   * Get agents based on selected role
   */
  getAgentByRole(): void {
    if (this.callAuditForm.controls['selectedRadioButton'].value === '1') {
      const roleId = this.cycleWiseForm.controls.roleId.value;
      const role = this.cycleWiseForm.controls.role.value;

      if (!roleId) return;

      this.masterService.getAgentMasterByRoleId(roleId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            if (res && res.length > 0) {
              this.agents = res;
            } else {
              this.confirmationService.openDialog(
                `${this.currentLanguageSet?.noAgentsFoundFor || 'No agents found for'} ${role} ${this.currentLanguageSet?.role || 'role'}`,
                'error'
              );
            }
          },
          error: (err: any) => {
            this.confirmationService.openDialog(err.error, 'error');
          }
        });
    } else {
      const roleId = this.dateWiseForm.controls.roleId.value;
      const role = this.dateWiseForm.controls.role.value;

      if (!roleId) return;

      this.masterService.getAgentMasterByRoleId(roleId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            if (res && res.length > 0) {
              this.agents = res;
            } else {
              this.confirmationService.openDialog(
                `${this.currentLanguageSet?.noAgentsFoundFor || 'No agents found for'} ${role} ${this.currentLanguageSet?.role || 'role'}`,
                'error'
              );
            }
          },
          error: (err: any) => {
            this.confirmationService.openDialog(err.error, 'error');
          }
        });
    }
  }

  /**
   * Handle radio button change for switching between cycle-wise and date-wise forms
   */
  onRadioButtonChange(): void {
    if (this.callAuditForm.controls['selectedRadioButton'].value === '1') {
      this.iscycleWiseChangeForm = false;
    } else {
      this.iscycleWiseChangeForm = true;
    }

    this.callAuditForm.reset();
    this.callAuditForm.controls['selectedRadioButton'].setValue(
      this.iscycleWiseChangeForm ? '2' : '1'
    );

    this.cycleWiseForm.reset();
    this.dateWiseForm.reset();
    this.callAuditData.data = [];
    this.callAuditData.paginator = this.paginator;
  }

  /**
   * Get quality auditor worklist using cycle-wise criteria
   */
  getQualityAuditorWorklist(): void {
    if (!this.cycleWiseForm.valid) {
      Object.keys(this.cycleWiseForm.controls).forEach(field => {
        const control = this.cycleWiseForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
      return;
    }

    const reqObj = {
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
      languageId: this.cycleWiseForm.controls.language.value,
      agentId: this.cycleWiseForm.controls.agentId.value,
      roleId: this.cycleWiseForm.controls.roleId.value,
      isValid: this.cycleWiseForm.controls.isValid.value === "true",
      year: this.cycleWiseForm.controls.year.value,
      month: this.cycleWiseForm.controls.month.value,
      cycleId: this.cycleWiseForm.controls.cycle.value,
      fromDate: null,
      toDate: null
    };

    this.qualityAuditorService.isCycleWiseForm = !this.iscycleWiseChangeForm;
    this.qualityAuditorService.callAuditData = this.cycleWiseForm.value;

    this.qualityAuditorService.getQualityAuditorWorklist(reqObj)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res && res.length > 0) {
            this.callAuditData.data = res;
            this.refreshPagination();
          } else if (res.length <= 0) {
            this.confirmationService.openDialog(
              this.currentLanguageSet?.noDataFoundForCallRating || 'No data found for call rating',
              'error'
            );
            this.callAuditData.data = [];
          } else {
            this.confirmationService.openDialog(res.errorMessage, 'error');
            this.callAuditData.data = [];
          }
        },
        error: (err: any) => {
          this.confirmationService.openDialog(err.error, 'error');
        }
      });
  }

  /**
   * Get quality auditor worklist using date-wise criteria
   */
  getDateWiseAuditorWorklist(): void {
    if (!this.dateWiseForm.valid) {
      Object.keys(this.dateWiseForm.controls).forEach(field => {
        const control = this.dateWiseForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
      return;
    }

    // Validate date range
    if (this.dateWiseForm.controls.start.value > this.dateWiseForm.controls.end.value) {
      this.confirmationService.openDialog(
        this.currentLanguageSet?.startDateCannotBeGreaterThanEndDate || 'Start date cannot be greater than end date',
        'error'
      );
      return;
    }

    const fromDate = moment(this.dateWiseForm.controls.start.value).format('YYYY-MM-DDThh:mm:ssZ');
    const toDate = moment(this.dateWiseForm.controls.end.value).format('YYYY-MM-DDThh:mm:ssZ');

    const reqObj = {
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
      languageId: this.dateWiseForm.controls.language.value,
      agentId: this.dateWiseForm.controls.agentId.value,
      roleId: this.dateWiseForm.controls.roleId.value,
      isValid: this.dateWiseForm.controls.isValid.value === "true",
      validFrom: fromDate,
      validTill: toDate,
      cycleId: null,
      beneficiaryPhoneNumber: this.dateWiseForm.controls.phoneNo.value
    };

    this.qualityAuditorService.isCycleWiseForm = this.iscycleWiseChangeForm;
    this.qualityAuditorService.callAuditData = this.dateWiseForm.value;

    this.qualityAuditorService.getQualityAuditorDateWorklist(reqObj)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res && res.length > 0) {
            this.callAuditData.data = res;
            this.refreshPagination();
          } else if (res.length <= 0) {
            this.confirmationService.openDialog(
              this.currentLanguageSet?.noDataFoundForCallRating || 'No data found for call rating',
              'error'
            );
            this.callAuditData.data = [];
          } else {
            this.confirmationService.openDialog(res.errorMessage, 'error');
            this.callAuditData.data = [];
          }
        },
        error: (err: any) => {
          this.confirmationService.openDialog(err.error, 'error');
        }
      });
  }

  /**
   * Refresh pagination settings
   */
  private refreshPagination(): void {
    this.changeDetectorRefs.detectChanges();

    if (this.lastLength && this.lastPageIndex && this.lastPageSize) {
      this.paginator.length = this.lastLength;
      this.paginator.pageSize = this.lastPageSize;
      this.paginator.pageIndex = this.lastPageIndex;
    }

    this.callAuditData.paginator = this.paginator;
    this.callAuditData.sort = this.sort;
  }

  /**
   * Route to agent rating view
   */
  routeToAgentRating(data: any, auditType: string): void {
    // Implementation of routing to agent rating view
    const dialogRef = this.dialog.open(CallRatingComponent, {
      width: '90%',
      height: '90%',
      data: { callData: data, auditType }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result === 'success') {
          if (this.callAuditForm.controls['selectedRadioButton'].value === '1') {
            this.getQualityAuditorWorklist();
          } else {
            this.getDateWiseAuditorWorklist();
          }
        }
      });
  }

  /**
   * View case sheet
   */
  viewCasesheet(element: any): void {
    this.dialog.open(ViewCasesheetComponent, {
      width: '90%',
      height: '90%',
      data: element
    });
  }

  /**
   * Clean up subscriptions on destroy
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
