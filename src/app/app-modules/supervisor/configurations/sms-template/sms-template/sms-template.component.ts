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


import { AfterViewInit, Component, DoCheck, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { SmsTemplateService } from 'src/app/app-modules/services/smsTemplate/sms-template.service';
import { LoginserviceService } from 'src/app/app-modules/services/loginservice/loginservice.service';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-sms-template',
  templateUrl: './sms-template.component.html',
  styleUrls: ['./sms-template.component.css']
})

export class SmsTemplateComponent implements OnInit, DoCheck, AfterViewInit {
  providerServiceMapID: any;
  serviceID: any;
  existingTemplates: any[] = [];
  dataSource = new MatTableDataSource<any>(this.existingTemplates);

  showTableFlag = true;
  viewTemplate = false;
  viewSMSparameterTable:any = [];

  showParameters = false;
  isReadonly = false;

  SMS_Types: any = [];
  smsType_ID_array:any = [];
  templateList: any[] = [];

  Parameters:any = [];
  Parameters_count: number | undefined;

  smsParameters:any = [];
  selectedParameterType: any;
  selectedParameterValues:any = [];
  searchTerm: any;

  smsParameterMaps:any[] = [];
  smsParamsData = new MatTableDataSource<any>(this.smsParameterMaps);

  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  currentLanguageSet: any;

  displayedColumns: string[] = ['sNo', 'templateName', 'templateType', 'template', 'view', 'delete'];
  displayedColumns1: string[] = ['sNo', 'smsParameterName', 'smsParameterType', 'smsParameterValue', 'action'];
  displayedColumns2: string[] = ['sNo', 'smsParameterName', 'smsParameterType', 'smsParameterValue'];
  smsDataParam: any = [];

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(
    private confirmationService: ConfirmationService,
    private setLanguageService: SetLanguageService,
    private smsTemplateService: SmsTemplateService,
    private loginService: LoginserviceService,
    private fb: FormBuilder,
    private supervisorService: SupervisorService,
  ) {}

  ngOnInit() {
    this.getSelectedLanguage();
    this.providerServiceMapID = sessionStorage.getItem('providerServiceMapID');
    this.serviceID = this.loginService.currentServiceId;
    this.getSMStemplates();
    this.getSMSparameters();
  }

  createSMSTemplateForm = this.fb.group({
    templateName: ['',[Validators.required,this.validateWhitespace]],
    smsType: [''],
    smsTemplate: ['', [Validators.required,this.validateWhitespace]],
    value: [''],
    parameter: [''],
  })

  createParamsForm = this.fb.group({
    value: [''],
    parameter: [''],
    parameterValueType: [''],
    parameterValue: ['']
  })

  viewSMSTemplateForm = this.fb.group({
    templateName: [''],
    smsType: [''],
    smsTemplate: [''],
  })


  validateWhitespace(control: FormControl) {
    if(control.value !==null && control.value !==undefined){
      const isWhitespace = control.value.trim().length === 0;
      const isValid = !isWhitespace;
      return isValid ? null : { whitespace: true };
    }
    
  }

  validateNonWhitespace(control: FormControl) {
    const value = control.value;
    if (value === null || value === undefined || value === "" || value.trim().length > 0) {
      return null; // Field is valid if null or contains only whitespace
    }
  
    return { nonWhitespace: true }; // Field is invalid if it contains non-whitespace characters
  }


    ngDoCheck() {
    this.getSelectedLanguage();
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  getSMStemplates() {
    const providerServiceMapID = sessionStorage.getItem('providerServiceMapID');
    this.smsTemplateService.getSMSTemplates(providerServiceMapID).subscribe(
      (response: any) => {
        if (response !== undefined && response.data !== undefined && response.data.length >= 0) {
          this.existingTemplates = response.data;
          this.templateList = this.existingTemplates;
          this.dataSource.data = response.data;
          this.dataSource.paginator = this.paginator;

          // code to extract(IDs) all those non deleted SMS-Types
          // this.smsType_ID_array = [];
          // for (let i = 0; i < this.dataSource.data.length; i++) {
          //   if (this.dataSource[i].data.deleted === false) {
          //     this.smsType_ID_array.push(
          //       this.dataSource[i].data.smsType.smsTypeID
          //     );
          //   }
          // }
        }
      },
      (err) => {
        console.log("Error while fetching SMS templates", err);
      }
    );
  }

  showForm() {
    this.showTableFlag = false;
    this.viewTemplate = false;
    this.Parameters_count = undefined;
    this.isReadonly = false;
    this.showParameters = false;
    this.smsParameterMaps = [];
    this.createParamsForm.reset();
    this.createSMSTemplateForm.reset();
    this.createSMSTemplateForm.reset();
    this.getSMStypes();
  }

  getSMStypes() {
    const serviceID= this.loginService.currentServiceId;
    this.smsTemplateService.getSMStypes(serviceID).subscribe(
      (response: any) => {
        this.SMS_Types = response.data;

        // if (this.smsType_ID_array.length > 0) {
        //   this.SMS_Types = this.SMS_Types.filter((object: any) => {
        //     return this.smsType_ID_array.includes(object.smsTypeID);
        //   });
        // }

        if (this.SMS_Types.length === 0) {
          this.confirmationService.openDialog(
            this.currentLanguageSet.allSMSTypesAreActive,
            "info"
          );
        }
      },
      (err) => {
        console.log(err, "error while fetching sms types");
        this.confirmationService.openDialog(err.errorMessage, "error");
      }
    );
  }

  showTable() {
    // this.showTableFlag = true;
    // this.viewTemplate = false;
    this.cancel();
    this.getSMStemplates();
  }

  onBack() {
    this.showTableFlag = true;
    this.viewTemplate = false;
    this.onClickOfBack();
    this.getSMStemplates();
  }

  ActivateDeactivate(object: { deleted: any; modifiedBy: any; }, flag: any) {
    object.deleted = flag;
    object.modifiedBy = sessionStorage.getItem('userName'),
    this.smsTemplateService.updateSMStemplate(object).subscribe(
      (response) => {
        if (response) {
          if (flag) {
            this.confirmationService.openDialog(
              this.currentLanguageSet.deactivatedSuccessfully,
              "success"
            );
            this.searchTerm = null;
            this.dataSource.data = [];
            this.dataSource.paginator = this.paginator;
            this.getSMStemplates();
          } else {
            this.confirmationService.openDialog(this.currentLanguageSet.activatedSuccessfully, "success");
            this.getSMStemplates();
          }
        }
      },
      (err) => {}
    );
  }

  extractParameters(string: any) {
    this.Parameters = [];
    this.smsDataParam = [];
    const parameters = [];

    let string_contents = [];

    const regex = /[!?.,\n]/g;
    string_contents = string.replace(regex, " ").split(" ");

    for (let i = 0; i < string_contents.length; i++) {
      if (
        string_contents[i].startsWith("$$") &&
        string_contents[i].endsWith("$$")
      ) {
        const item = string_contents[i].substr(2).slice(0, -2);
        console.log(item);
        parameters.push(item);
      }
    }

    this.Parameters = parameters.filter(function (elem, index, self) {
      return index === self.indexOf(elem);
    });

    this.Parameters.push("SMS_PHONE_NO");
    this.smsDataParam = this.smsDataParam.concat(this.Parameters);
    this.Parameters_count = this.Parameters.length;

    if (this.Parameters.length > 0) {
      this.showParameters = true;
      this.isReadonly = true;
    } else {
      this.confirmationService.openDialog(
        this.currentLanguageSet.noParameterIdentified,
        "info"
      );
    }
  }

  getSMSparameters() {
    this.smsParameters = [];
    this.selectedParameterValues = [];
    this.smsTemplateService.getSMSparameters(this.serviceID).subscribe(
      (response: any) => {
        this.smsParameters = response.data;
      },
      (err) => {
        console.log(err, "error while fetching sms parameters");
        this.confirmationService.openDialog(err.errorMessage, "error");
      }
    );
  }

  setValuesInDropdown(parameter_object: any) {
    this.selectedParameterType = parameter_object.smsParameterType;
    this.selectedParameterValues = parameter_object.smsParameters;
  }

  cancel() {
    this.confirmationService
    .openDialog(
      this.currentLanguageSet.doYouReallyWantToCancel,
      'confirm'
    )
    .afterClosed()
    .subscribe((res) => {
      if (res) {
    this.showTableFlag = true;
    this.viewTemplate = false;
    this.Parameters_count = undefined;
    this.isReadonly = false;
    this.showParameters = false;
    this.smsParameterMaps = [];
    this.createParamsForm.reset();
    this.createSMSTemplateForm.reset();
    this.supervisorService.createComponent(
      SmsTemplateComponent,
      null
    );
    }
  });
  }

  onClickOfBack() {
    this.Parameters_count = undefined;
    this.isReadonly = false;
    this.showParameters = false;
    this.smsParameterMaps = [];
  }

  add(form_values: any) {
    if (form_values !== undefined && form_values !== null) {
    const reqObj:any = {
      'createdBy': sessionStorage.getItem('userName'),
      'modifiedBy': sessionStorage.getItem('userName'),
      'smsParameterName': form_values.parameter,
      'smsParameterType': form_values.parameterValue.smsParameterType,
      'smsParameterID': form_values.parameterValue.smsParameterID,
      'smsParameterValue': form_values.parameterValue.smsParameterName
    }
     if (reqObj.smsParameterName !== undefined && reqObj.smsParameterName !== null &&
      reqObj.smsParameterType !== undefined && reqObj.smsParameterType !== null &&
      reqObj.smsParameterID !== undefined && reqObj.smsParameterID !== null ) {
      this.smsParameterMaps.push(reqObj);
      this.smsParamsData.data = this.smsParameterMaps;
    //  this.getSMSparameters();
    }
     // removing of the parameters pushed into buffer from the Parameters array and resetting of next two dropdowns
  this.createParamsForm.reset();
  this.smsDataParam = [];
  // this.Parameters.filter((res: any) => {
  //   this.smsDataParam = [];
  //   if(this.smsParameterMaps.length > 0) {
  //     this.smsParameterMaps.forEach((item: any) =>{
  //       if(item.smsParameterName !== res ) {
  //         this.smsDataParam.push(res);
  //       }
  //     }) 
  //   }
  // })
  for (const res of this.Parameters) {
    if (this.smsParameterMaps.length > 0) {
      let found = false;
      for (const item of this.smsParameterMaps) {
        if (item.smsParameterName === res) {
          found = true;
          break;
        }
      }
      if (!found) {
        this.smsDataParam.push(res);
      }
    } else {
      this.smsDataParam.push(res);
    }
  }
  
  console.log(this.smsDataParam, "SMS DATA PARAM");
    }
  }

  remove(obj: any, index: number) {
    const smsParameterMaps = this.smsParamsData.data;
    this.smsParameterMaps.splice(index, 1);
    this.smsParamsData = new MatTableDataSource<any>(this.smsParameterMaps);
    this.smsParamsData.paginator = this.paginator;
    this.smsParamsData.sort = this.sort;
    this.selectedParameterValues = [];
    this.smsDataParam = this.Parameters.filter((res:any) => {
    return !this.smsParamsData.data.some((item:any) => item.smsParameterName === res);
    });
    }

  saveSMStemplate(form_values: any) {
    const requestObject = {
      createdBy: sessionStorage.getItem('userName'),
      providerServiceMapID: this.providerServiceMapID,
      smsParameterMaps: this.smsParameterMaps,
      smsTemplate: (form_values.smsTemplate !== undefined && form_values.smsTemplate !== null) ? form_values.smsTemplate.trim() : null ,
      smsTemplateName: (form_values.templateName !== undefined && form_values.templateName !== null) ? form_values.templateName.trim() : null,
      smsTypeID: form_values.smsType,
    };

    console.log("Save Request", requestObject);

    this.smsTemplateService.saveSMStemplate(requestObject).subscribe(
      (res) => {
        this.showTableFlag = true;
        this.viewTemplate = false;
        this.Parameters_count = undefined;
        this.isReadonly = false;
        this.showParameters = false;
        this.smsParameterMaps = [];
        this.smsParamsData.data = [];
        this.createParamsForm.reset();
        this.createSMSTemplateForm.reset();
        this.createSMSTemplateForm.reset();
        this.confirmationService.openDialog(
          this.currentLanguageSet.templateSavedSuccessfully,
          "success"
        );
        // this.showTable();
        this.getSMStemplates();
      },
      (err) => {
        this.confirmationService.openDialog(err.errorMessage, "error");
      }
    );
  }

  view(object: { providerServiceMapID: any; smsTemplateID: any; }) {
    console.log("templateID", object);

    this.smsTemplateService
      .getFullSMSTemplate(object.providerServiceMapID, object.smsTemplateID)
      .subscribe(
        (response: any) => {
          if(response && response.data) {
          console.log(response, "getfullSMStemplate success");
          this.viewSMSparameterTable = response.data.smsParameterMaps;
          // const smsResponse = response as SMSTemplateResponse;
          // this.viewSMSparameterTable = smsResponse.smsParameterMaps;
          this.viewTemplate = true;
          this.showTableFlag = false;

          this.viewSMSTemplateForm.patchValue({
            templateName: response.data.smsTemplateName,
            smsType: response.data.smsType.smsType,
            smsTemplate: response.data.smsTemplate,
          });
        }
        },
        (err) => {
          console.log(err, "getfullSMStemplate error");
        }
      );
  }

  /**
   * For In Table Search
   * @param searchTerm
   */
  filterSearchTerm(searchTerm?: string) {
    if (!searchTerm) {
      this.dataSource.data = this.templateList;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
      this.templateList.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'smsTemplateName' ||
            key === 'smsTemplate'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.dataSource.data.push(item);
              this.dataSource.paginator = this.paginator;
              break;
            }
          }
        }
      });
    }
  }
}
