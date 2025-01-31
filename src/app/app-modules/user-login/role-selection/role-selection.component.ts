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


/*
 * AN40085822 - Created on 12-01-23
 */
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-role-selection',
  templateUrl: './role-selection.component.html',
  styleUrls: ['./role-selection.component.css'],
})
export class RoleSelectionComponent implements OnInit {
  title: any;
  isSelected = false;
  userRoles: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    readonly sessionstorage:SessionStorageService,
    private loginService: LoginserviceService
  ) {}

  ngOnInit(): void {
    // this.userRoles = this.loginService.userPrivileges
    this.sessionstorage.setItem('role', "");
    const userRolesString = this.sessionstorage.getItem('userRoles');
    if (userRolesString !== null) {
      this.userRoles = JSON.parse(userRolesString);
    }
    // this.userRoles = this.sessionstorage.getItem('userRoles');
    console.log('userPrivileges', this.userRoles);
  }

  // ngOnDestroy() {
  //   this.destroyed$.next(true);
  // }

  roleSelectionForm = this.fb.group({});

  /**
   * Calling the user roles on select
   */
  selectedIndex = -1;
  selectRole(i: number, role: any, roleId: any) {
    this.selectedIndex = i;
    if (this.selectedIndex === i) {
      this.isSelected = !this.isSelected;
    }
    this.sessionstorage.setItem('role', role);
    this.sessionstorage.setItem('roleId', roleId);
    this.router.navigate(['/dashboard']);
  }
}
