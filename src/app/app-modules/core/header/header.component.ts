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


import { AfterViewInit, Component, DoCheck, OnChanges, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { CoreService } from '../../services/core/core.service';
import { CtiService } from '../../services/cti/cti.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { QualityAuditorService } from '../../services/quality-auditor/quality-auditor.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, DoCheck, AfterViewInit, OnChanges {
  isAuthenticated = false;
  userName: string | null | undefined;
  languages: any = [];
  roles: any;
  // roles = [
  //   {
  //     'value': 'associate',
  //     'role':'Associate'
  //   },
  //   {
  //     'value': 'anm',
  //     'role':'ANM'
  //   },    
  //   {
  //     'value': 'mo',
  //     'role':'MO'
  //   },    
  //   {
  //     'value': 'supervisor',
  //     'role':'Supervisor'
  //   },    
  //   {
  //     'value': 'qualityAuditor',
  //     'role':'Quality Auditor'
  //   },
  //   {
  //     'value': 'qualitySupervisor',
  //     'role':'Quality Supervisor'
  //   }
  // ];
  selectedLanguage: any = "English";
  role: any;
  roleSelected=false;
  languageData: any;
  currentLanguageSet: any;
  agentId: any;


  constructor(
    private loginService: LoginserviceService,
    private coreService: CoreService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private setLanguageService: SetLanguageService,
    private fb: FormBuilder,
    private ctiService: CtiService,
    private qualityAuditorService: QualityAuditorService,


  ) { }

  headersForm = this.fb.group({
    selectRole: [''],
    selectLanguage: ['English']
  })

  ngOnInit() {
    this.getSelectedLanguage();
    console.log("languages List", this.languages)
    this.agentId = this.loginService.agentId;
   

    this.loginService.enableRoleFlag$.subscribe((response) => {
      if (response) {
        const userRolesString = sessionStorage.getItem('userRoles');
        if (userRolesString !== null) {
          this.roles = JSON.parse(userRolesString);
          this.getLanguageList();
        }
      }  
  });
    }

  ngDoCheck(){
    this.isAuthenticated = sessionStorage.getItem("isAuthenticated") === "true" ? true : false;
    this.userName = (sessionStorage.getItem("userName") !== null && sessionStorage.getItem("userName") !== undefined) ? sessionStorage.getItem("userName"): null;
    const role = sessionStorage.getItem("role");
    if(role !== null && role !== undefined && role !== ""){
    this.headersForm.controls.selectRole.patchValue(role);
    this.roleSelection(role);
    } else {
      this.headersForm.controls.selectRole.patchValue(null);
      this.roleSelection(null);
    }
    this.getSelectedLanguage();

  

  }

  ngAfterViewInit(){
    const userRolesString = sessionStorage.getItem('userRoles');
    if (userRolesString !== null) {
      this.roles = JSON.parse(userRolesString);
    }
    this.getSelectedLanguage();
    // this.getLanguageList();
  }

  ngOnChanges(){
    const userRolesString = sessionStorage.getItem('userRoles');
    if (userRolesString !== null) {
      this.roles = JSON.parse(userRolesString);
    }
   
  }


  logout(){
    const isOnCall = sessionStorage.getItem("onCall");
    if(isOnCall === "true") {
      this.confirmationService.openDialog(this.currentLanguageSet.youAreNotAllowedToLogOutCloseTheCall, 'info')
}
    else {
    const reqObj = {'agent_id': this.loginService.agentId };
    this.ctiService.agentCtiLogout(reqObj).subscribe((res: any) => {
     
        this.logOutUser();
      
    },(err) => {
      this.logOutUser();
      }
    );
  }
   
  }

  logOutUser() {
    this.loginService.sessionLogout().subscribe((res: any) => {
      if(res.statusCode === 200){
        this.router.navigate(['/login']);
          localStorage.clear();
          sessionStorage.clear();
          this.qualityAuditorService.callAuditData=undefined;
      }
    });
  }

  showLicense(){
    window.open(environment.licenseUrl);
  }

  roleSelection(role: any){
    if(role !== undefined && role !== null && role !== "" ){
      this.roleSelected = true; 
    } else {
      this.roleSelected = false;
    }

    if( sessionStorage.getItem("onCall") !== undefined && sessionStorage.getItem("onCall")  !== null && sessionStorage.getItem("onCall") === "false" && this.roleSelected === true) {
      this.roleSelected = true; 
    }
    else if(sessionStorage.getItem("onCall") !== undefined && sessionStorage.getItem("onCall")  !== null && sessionStorage.getItem("onCall") === "true") {
      this.roleSelected = false;
    }
  }

  changeRole(role: any){
    this.confirmationService.openDialog(this.currentLanguageSet.areYouSureYouWantToNavigateTo + " " + role + " " + this.currentLanguageSet.anyUnsavedDataWillBeLost, 'confirm')
    .afterClosed().subscribe(res => {
      if(res){
        const route = role + "/dashboard"
        this.router.navigate(['/dashboard']);
        sessionStorage.setItem('role', role);
        this.roles.filter((item: any) => {
          if(item.RoleName === role){
          sessionStorage.setItem('roleId', item.RoleID);
          }
        });
        this.coreService.onRoleChange(true)
        console.log('role routing to', route);
      }
    })
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null)
      this.currentLanguageSet = this.setLanguageService.languageData;
    else {
      this.changeLanguage('English');
    }
  }
  getLanguageList(){
    this.loginService.getLanguages().subscribe((res: any) => {
      if(res)
      this.languages = res.data;
      this.selectedLanguage = "English"
    });
  }

  changeLanguage(language: any) {
    this.setLanguageService.getLanguageData(language).subscribe(data => {
      this.languageData = data;
    });
  }


}
