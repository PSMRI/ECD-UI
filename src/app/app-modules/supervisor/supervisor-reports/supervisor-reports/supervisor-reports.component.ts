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
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import * as FileSaver from 'file-saver';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import * as moment from 'moment';
import { saveAs } from 'file-saver';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-supervisor-reports',
  templateUrl: './supervisor-reports.component.html',
  styleUrls: ['./supervisor-reports.component.css']
})
export class SupervisorReportsComponent implements OnInit, DoCheck, AfterViewInit {

  currentLanguageSet: any;
  languageData: any;
  today: any;
  rolesList: any[] = [];
  agentNameList: any[] = [];
  displayedColumns: string[] = [
    'sno',
    'reportName',
    'action'
  ];
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  dataSource = new MatTableDataSource<sectionElement>();
  reportsData: any = [];
  searchTerm: any;

  constructor(
    private setLanguageService: SetLanguageService,
    private fb: FormBuilder,
    private masterService: MasterService,
    private confirmationService: ConfirmationService,
    readonly sessionstorage:SessionStorageService,
    private supervisorService: SupervisorService
  ) { }
  reportForm = this.fb.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    roleId:'',
    agentId:null,
    roleName:null

  },
  {
    validators: this.checkDateRange('startDate', 'endDate')
  }
  );

  checkDateRange(controlName: any, matchName: any) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchName]
      if (matchingControl.value === '' || matchingControl.value === null || matchingControl.value === undefined) {
        return null;
      }
      else if (control.value && matchingControl.value) {
        const diffInTime = matchingControl.value.getTime() - control.value.getTime();
        const diffInDays = diffInTime / (1000 * 3600 * 24);
        if (diffInDays >= 31) {
          control.setErrors({ valueGreater: true })
        } else {
         control.setErrors(null);
        }
      }
    }
  }
  ngOnInit(): void {
    this.reportsData = [
      {'reportName' : 'Cumulative District Wise Report',value:'cumulative_report'},
      {'reportName' :'Call Detail Reports',value:'call_detail_report'},
      {'reportName' :'Call Summary Report', value: 'call_summary_report'},
      {'reportName' :'Benificiary Wise Report', value:'benificiary_wise_report'},
      {'reportName' :'Call Unique Details Report', value:'call_unique_report'},
      {'reportName' :'Birth Defect Report', value:'birth_defect_report'},
      {'reportName' :'ASHA Home Visit Gap Report', value:'aasha_home_report'},
      {'reportName' :'Calcium IFA Tab Non Adherence Report', value:'calcium_IFA_report'},
      {'reportName' :'Absence in VHSND Report', value:'absence_VHSND_report'},
      {'reportName' :'Vaccine Drop Out Identified Report', value:'vaccine_dropout_report'},
      {'reportName' :'Vaccine Left Out Identified Report', value:'vaccine_leftout_report'},
      {'reportName' :'Developmental Delay Report', value:'dev_delay_report'},
      {'reportName' :'Abortion Report', value:'abortion_report'},
      {'reportName' :'Delivery Status Report', value:'delivery_status_report'},
      {'reportName' :'HRPW Cases Identified Report', value:'HRPW_cases_report'},
      {'reportName' :'Infants High Risk Report', value:'infants_high_risk_report'},
      {'reportName' :'Maternal Death Report', value:'maternal_death_report'},
      {'reportName' :'Still Birth Report', value:'still_birth_report'},
      {'reportName' :'Baby Death Report', value:'baby_death_report'},
      {'reportName' :'Not Connected Phone List Different Format Report', value:'not_connected_report'},
      {'reportName' :'JSY Related Complaint Report', value:'JSY_report'},
      {'reportName' :'Miscarriage Report', value:'misscarriage_report'},

    ];
    this.reportsData.forEach((sectionCount: any, index: number) => {
      sectionCount.sno = index + 1;
    });
    this.dataSource.data = this.reportsData;
    this.getSelectedLanguage(); 
    this.today = new Date();
    this.today.setDate(this.today.getDate()-1);
    this.getRoles();
    this.reportForm.get('agentId')?.disable();

  }
  ngDoCheck(){
    this.getSelectedLanguage();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }
  getRoles() {
    const psmId = this.sessionstorage.getItem('providerServiceMapID');
    this.masterService.getRoleMaster(psmId).subscribe(
      (response: any) => {
        if (response) {
          response.filter((values: any) => {
            if (values.roleName === "Associate" || values.roleName === "ANM" || values.roleName === "MO") {
              this.rolesList.push(values);
            }
          });
        } else {
          this.confirmationService.openDialog(response.errorMessage, 'error');
        }
      },
        (err: any) => {
          if(err && err.error)
          this.confirmationService.openDialog(err.error, 'error');
          else
          this.confirmationService.openDialog(err.title + err.detail, 'error')
          });
  }
  setRoleType(qualitorRoleTypeValue: any) {
    this.reportForm.get('agentId')?.enable();
    this.getAgentValues(qualitorRoleTypeValue)
    this.rolesList.filter((values) => {
      if (values.roleId === qualitorRoleTypeValue) {
        this.reportForm.controls['roleId'].setValue(
          values.roleId
        );
        this.reportForm.controls['roleName'].setValue(
          values.roleName
        );

      }

    });
    console.log(this.reportForm.controls['roleName'].value);
  }
  getAgentValues(qualitorRoleTypeValue:any){
    this.agentNameList = [];
    let filteredAgentList=[];
    const reqObj = {
      roleId: qualitorRoleTypeValue,
    }
    this.masterService.getAgentMaster(reqObj).subscribe(
      (response: any) => {
        if (response) {
          this.reportForm.controls['agentId'].reset();
          filteredAgentList = response;
          for(let i=0;i<filteredAgentList.length;i++){
           if(filteredAgentList[i].agentId !== null ||filteredAgentList[i].agentId !== undefined){
            this.agentNameList.push(filteredAgentList[i]);
           }
          }
          // this.auditorList = response;
        } else {
          this.confirmationService.openDialog(response.errorMessage, 'error');
        }
      },
      (err: any) => {
        if(err && err.error)
        this.confirmationService.openDialog(err.error, 'error');
        else
        this.confirmationService.openDialog(err.title + err.detail, 'error')
        });
  }
  downloadReport(report:any,formData:any){
      console.log(report)
    const reqObj = {
      // startDate:moment(formData.startDate).format('YYYY-MM-DDThh:mm:ssZ'),
      // endDate:moment(formData.endDate).format('YYYY-MM-DDThh:mm:ssZ'),
      startDate: moment(formData.startDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      endDate: moment(formData.endDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      role:formData.roleName,
      agentId:(formData.agentId !== undefined) ? formData.agentId : null,
      fileName:report.value,
      psmId:this.sessionstorage.getItem('providerServiceMapID'),
    };
    console.log(reqObj);
    if(report.value==="cumulative_report"){
      this.supervisorService.downloadCumulativeReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value==="call_detail_report"){
      this.supervisorService.downloadCallDetailReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "call_summary_report"){
      this.supervisorService.downloadCallSummaryReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "benificiary_wise_report"){
      this.supervisorService.downloadBenificiaryWiseReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "call_unique_report"){
      this.supervisorService.downloadCallUniqueReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "birth_defect_report"){
      this.supervisorService.downloadBirthDefectReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "aasha_home_report"){
      this.supervisorService.downloadAshaHomeReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "calcium_IFA_report"){
      this.supervisorService.downloadCalciumIfaReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "absence_VHSND_report"){
      this.supervisorService.downloadAbsenceVhsndReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "vaccine_dropout_report"){
      this.supervisorService.downloadVaccineDropoutReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "vaccine_leftout_report"){
      this.supervisorService.downloadVaccineLeftoutReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "dev_delay_report"){
      this.supervisorService.downloadDevDelayReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "abortion_report"){
      this.supervisorService.downloadAbortionReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "delivery_status_report"){
      this.supervisorService.downloadDeliveryStatusReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "HRPW_cases_report"){
      this.supervisorService.downloadHrpwCasesReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "infants_high_risk_report"){
      this.supervisorService.downloadInfantHighRiskReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "maternal_death_report"){
      this.supervisorService.downloadMaternalDeathReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "still_birth_report"){
      this.supervisorService.downloadStillBirthReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "baby_death_report"){
      this.supervisorService.downloadBabyDeathReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "not_connected_report"){
      this.supervisorService.downloadNotConnectedReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "JSY_report"){
      this.supervisorService.downloadJsyReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
    else if(report.value === "misscarriage_report"){
      this.supervisorService.downloadMiscarriageReport(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null )
        {
          const reader = new FileReader();
          let stringData =null;
          reader.onload = (event: any)=>{
            stringData = event.target.result;
            console.log(stringData);
            let i=0;
            i=stringData.indexOf("5002");
            if(stringData !==null && stringData.toLowerCase() === "no data found"){
              this.confirmationService.openDialog(this.currentLanguageSet.noRecordsFound, 'info')
            }
            else if(stringData !==null && i<0){
              const respone = new Blob([res.body], { type: 'application/vnd.ms-excel'});
              saveAs(respone,  report.value+".xlsx");
              this.confirmationService.openDialog(this.currentLanguageSet.downloadedReportSuccessfully, 'success');
            }
            if(stringData !== null && i>0 ){
              this.confirmationService.openDialog("Redis Error", 'error')
            }
          }
          reader.readAsText(res.body);     
        }
    }, (error) => {
      if(error)
      {
        this.confirmationService.openDialog("Error While Downloading Excel Report", 'error')
      }
    })
    }
  }
  filterSearchTerm(searchTerm?: string) {
    if (!searchTerm) {
      this.dataSource.data = this.reportsData;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
      this.reportsData.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'reportName'
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
export interface sectionElement {
  reportName: string;
  action: any;
}

