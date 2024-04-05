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


import { AfterViewInit, ChangeDetectorRef, Component, DoCheck, OnInit, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import {MatLegacyDialog as MatDialog, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import { ViewDetailsComponent } from '../view-details/view-details.component';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CallClosureComponent } from '../call-closure/call-closure.component';
import { EcdQuestionnaireComponent } from '../ecd-questionnaire/ecd-questionnaire.component';
import { BenRegistrationComponent } from '../beneficiary-registration/ben-registration/ben-registration.component';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';
import { BeneficiaryCallHistoryComponent } from '../beneficiary-call-history/beneficiary-call-history.component';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { CtiService } from '../../services/cti/cti.service';
import { map, Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-outbound-worklist',
  templateUrl: './outbound-worklist.component.html',
  styleUrls: ['./outbound-worklist.component.css']
})
export class OutboundWorklistComponent implements OnInit, DoCheck, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  dataSource = new MatTableDataSource<any>();
  outBoundListForMother:any[]=[];
  outBoundListForChild:any[]=[];
  currentLanguageSet: any;
  activeMother=true;
  activeChild=false;
  searchTerm: any;
  mappedOutBoundWorkList:any[]=[];
  displayedColumns: string[] = [];
  isChecked = false;
  isAutoPreviewDial = false;
  previewWindowTime: any;
  agentStatus:any;
  autoPreviewTimeSub: Subscription = new Subscription;
  autoCallStarted:any=false
  constructor(
    private setLanguageService: SetLanguageService,
    public dialog: MatDialog,
    public cd: ChangeDetectorRef,
    private confirmationService:ConfirmationService,
    private router: Router,
    private associateAnmMoService: AssociateAnmMoService,
    private loginService: LoginserviceService,
    private ctiService: CtiService
  ) { }

  ngDoCheck() {
    this.getSelectedLanguage();
  }
  ngOnInit(): void {
    this.isAutoPreviewDial = false;
    this.associateAnmMoService.isStartAutoPreviewDial = false;
    this.getSelectedLanguage();
    this.isChecked = false;
    this.getAutoPreviewDialing();
    this.associateAnmMoService.agentCurrentStatusData$.subscribe((response)=>{
      if( response !== undefined){
        this.agentStatus = response;
          if((this.agentStatus === "FREE" || this.agentStatus === "READY")  ) {
          if(this.isAutoPreviewDial && this.associateAnmMoService.isStartAutoPreviewDial  && this.dataSource.data.length > 0 && !this.associateAnmMoService.autoDialing  && sessionStorage.getItem("onCall") === "false" && this.previewWindowTime !== null && this.previewWindowTime !== undefined) {
          this.isChecked = true;
          const previewTime = this.previewWindowTime * 1000;
          
        this.autoPreviewTimeSub = timer(previewTime).pipe( 
          map(() => { 
          this.StartAutoPreviewDialing(true);
            }) 
          ).subscribe();
         
        }
      }
      }
         })
    // this.associateAnmMoService.resetAgentState();
    
  }


  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  selectedRecord(activeValue:any){
    this.reset();
   if(activeValue==='mother'){
    this.activeMother=true
    this.activeChild=false
    this.dataSource.paginator = this.paginator;
    this.getAutoPreviewDialing();
   }
   else{
    this.activeChild=true
    this.activeMother=false
    this.dataSource.paginator = this.paginator
    this.getAutoPreviewDialing();
   }
  }

  selectedRecordAfterFirstDial(activeValue:any){
   
   if(activeValue==='mother'){
    this.activeMother=true
    this.activeChild=false
    this.dataSource.paginator = this.paginator;
    this.getOutBoundWorklistCalls();
   }
   else{
    this.activeChild=true
    this.activeMother=false
    this.dataSource.paginator = this.paginator
    this.getOutBoundWorklistCalls();
   }
  }

  getOutBoundWorklistCalls() {
    
    const reqObj: any = {
      userId: sessionStorage.getItem('userId'),
    };
    if(this.activeMother === true){
      this.dataSource.sort=null
      this.associateAnmMoService.getMotherRecord(reqObj).subscribe(
      (response: any) => {
        if (response) {
          this.outBoundListForMother=response
          this.mappedOutBoundWorkList = response;
          this.dataSource.data = [];
          this.dataSource.data = response;
          this.dataSource.data.forEach((sectionCount: any, index: number) => {
            sectionCount.sno = index + 1;
          });
          this.displayedColumns= [
            'sno',
            'phoneNo',
            'wPhoneNumber',
            'mctsidNo',
            'lapseTime',
            'callAttemptNo',
            // 'callStatus',
            'recordUploadDate',
            'ecdCallType',
            'view',
            'action'
          ];
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort=this.sort;
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
    else{
      this.dataSource.sort=null;
      this.associateAnmMoService.getChildRecord(reqObj).subscribe(
      (response: any) => {
        if (response) {
          this.outBoundListForChild=response
          this.mappedOutBoundWorkList = this.outBoundListForChild;
          this.dataSource.data = [];
          this.dataSource.data = this.outBoundListForChild;
          this.dataSource.data.forEach((sectionCount: any, index: number) => {
            sectionCount.sno = index + 1;
          });
          this.displayedColumns= [
            'sno',
            'phoneNo',
            'wPhoneNumber',
            'childId',
            'lapseTime',
            'callAttemptNo',
            // 'callStatus',
            'recordUploadDate',
            'ecdCallType',
            'view',
            'action'
          ];
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort=this.sort;     
        } 
        else {
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

   
    
  }
  filterSearchTerm(searchTerm?: string) {
    if (!searchTerm) {
      this.dataSource.data = this.mappedOutBoundWorkList;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
      this.mappedOutBoundWorkList.forEach((item) => {
        for (const key in item) {
          if (
            key === 'phoneNoOfWhom' ||
            key === 'whomPhoneNo' ||
            key === 'mctsidNo'||
            key === 'displayOBCallType'||
            key ==='recordUploadDate'||
            key === 'mctsidNoChildId' ||
            key === 'phoneNo'||
            key === 'phoneNoOf'
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
  
  openDialog(element:any): void {
    // var modifiedReqObj={
    //   Aasha:element.Aasha,
    //   Address:element.Address,
    //   anmName:element.anmName,
    //   callAttemptNo:element.callAttemptNo,
    //   callStatus:eleme
    // }
    // console.log(element);
      this.dialog.open(ViewDetailsComponent,{
        autoFocus: false,
        disableClose: false ,
        data: { selectedDetails: element , activeChild:this.activeChild, activeMother:this.activeMother}
      });
    
  }

  getAutoPreviewDialing() {
  
     const userId = sessionStorage.getItem('userId');
     const psmId = sessionStorage.getItem('providerServiceMapID');
     const roleId = sessionStorage.getItem('roleId');
    
    this.associateAnmMoService.getAutoPreviewDialing(userId, roleId, psmId).subscribe(
      (response:any) => {
        
        if(response && response !== undefined && response !== null){
        this.isAutoPreviewDial = response.isAutoPreviewDial;
        if(this.isAutoPreviewDial)
        {
          this.previewWindowTime = response.previewWindowTime;
          this.associateAnmMoService.isStartAutoPreviewDial = true
          this.associateAnmMoService.openCompFlag$.subscribe((responseComp) => {
            if (responseComp !== null && (responseComp === "Outbound Worklist" || responseComp === "Call Closed")) {
             this.searchTerm = null;
             if(this.activeMother === true) {
              this.selectedRecordAfterFirstDial("mother");
             }
             else {
              this.selectedRecordAfterFirstDial("child");
             }
            }
            
        });
          // this.getOutBoundWorklistCalls();
        }
        else{
          this.previewWindowTime = null;
          this.associateAnmMoService.isStartAutoPreviewDial = false
          this.associateAnmMoService.openCompFlag$.subscribe((responseComp) => {
            if (responseComp !== null && (responseComp === "Outbound Worklist" || responseComp === "Call Closed")) {
             this.searchTerm = null;
             if(this.activeMother === true) {
              this.selectedRecordAfterFirstDial("mother");
             }
             else {
              this.selectedRecordAfterFirstDial("child");
             }
            }
            
        });
          // this.getOutBoundWorklistCalls();
        }
      }
      },
      (err: any) => {
        if(err && err.error)
        this.confirmationService.openDialog(err.error, 'error');
        else
        this.confirmationService.openDialog(err.title + err.detail, 'error')
        });
  }

  callBeneficary(element:any, isMother:boolean){
   
    

    this.associateAnmMoService.selectedBenDetails = element;
    console.log(this.associateAnmMoService.selectedBenDetails);
    this.associateAnmMoService.isMother = isMother;

    let phNo:any = null;
    if(this.associateAnmMoService.isMother !== undefined && this.associateAnmMoService.isMother !== null && this.associateAnmMoService.isMother === true) {
      phNo = this.associateAnmMoService.selectedBenDetails.whomPhoneNo;
    }
    else if(this.associateAnmMoService.isMother !== undefined && this.associateAnmMoService.isMother !== null && this.associateAnmMoService.isMother === false) {
     
      phNo = this.associateAnmMoService.selectedBenDetails.phoneNo;
    }

     /**
     * todo remove this code
     */
    // this.associateAnmMoService.setLoadDetailsInReg(true);
    // this.associateAnmMoService.setOpenComp("Beneficiary Registration");
    
    
    

      if (this.loginService.agentId === undefined) {
        this.confirmationService.openDialog(this.currentLanguageSet.agentIdNotAvailable, 'error')
      } else {
        if (sessionStorage.getItem('agentIp') === undefined) {
          const reqObjs={
            "agent_id" : this.loginService.agentId
          }
          this.ctiService
          .getAgentIpAddress(reqObjs)
          .subscribe(
            (response: any) => {
            
                sessionStorage.setItem('agentIp', response.data.agent_ip);
                
               this.ctiService
                  .callBeneficiaryManual(this.loginService.agentId, phNo)
                  .subscribe(
                    (response:any) => {
                      // this.dataService.onCall.next({
                      //   isonCall: true,
                      // });
                     
  
                  
                      if (response.data.status === "SUCCESS") {
  
                        sessionStorage.setItem("onCall", "true");
                        this.associateAnmMoService.setBenRegistartionComp(true);
                      }
                      else {
                        this.confirmationService.openDialog(response.errorMessage, 'error');
                      }
                    },
                    (err: any) => {
                      if(err && err.error)
                      this.confirmationService.openDialog(err.error, 'error');
                      else
                      this.confirmationService.openDialog(err.title + err.detail, 'error')
                      });
              
              },
              (error) => {
                console.log(error);
              }
            );
        } 
        else {
          this.ctiService
          .callBeneficiaryManual(this.loginService.agentId, phNo)
          .subscribe(
            (response:any) => {
              // this.dataService.onCall.next({
              //   isonCall: true,
              // });
             

          
              if (response.data.status === "SUCCESS") {

                sessionStorage.setItem("onCall", "true");
                this.associateAnmMoService.setBenRegistartionComp(true);
              }
            },
            (err: any) => {
              if(err && err.error)
              this.confirmationService.openDialog(err.error, 'error');
              else
              this.confirmationService.openDialog(err.title + err.detail, 'error')
              });
      
        }
      }
     
//       this.associateAnmMoService.setOpenComp("Beneficiary Registration");
// this.associateAnmMoService.loadComponent(BenRegistrationComponent,null);

  }

  StartAutoPreviewDialing(isChecked:any) {
    this.associateAnmMoService.autoDialing = true;
    if (this.autoPreviewTimeSub) {
      this.autoPreviewTimeSub.unsubscribe();
    }
    if(isChecked === true) {
      /**
       * todo reset this value after user logOut
       */
      this.associateAnmMoService.isStartAutoPreviewDial = true;
      this.getAgentState(this.activeMother);
    }
    else {
      this.associateAnmMoService.isStartAutoPreviewDial = false;
    }
   
  } 

  getAgentState(isMother:any) {
    const reqObj = {"agent_id" : this.loginService.agentId};
    this.ctiService.getAgentState(reqObj).subscribe((response:any) => {
        if (response && response.data && response.data.stateObj.stateName) { 
            if (
              response.data.stateObj.stateName.toUpperCase() === "FREE" ||
              response.data.stateObj.stateName.toUpperCase() === "READY"
            ) {
              this.startAutoDialCall(isMother);
            } else {
              this.reset();   
        }
      }
        else {
          this.reset();
        }

    }, (err: any) => {
      if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
      else
      this.confirmationService.openDialog(err.title + err.detail, 'error')

      this.reset();
      });
}

startAutoDialCall(isMother:any) {

  if (isMother === true) {
   
    if(this.mappedOutBoundWorkList.length > 0) {
      this.callBeneficary(this.mappedOutBoundWorkList[0],true);
 
    }

  } else {
  
    if(this.mappedOutBoundWorkList.length > 0) {
      this.callBeneficary(this.mappedOutBoundWorkList[0],false);
    
    }
   
   
  }
}


reset() {
this.isChecked = false;
this.associateAnmMoService.autoDialing =false;
}


  EnableAutoPreviewDialing(){
  //   if(this.isChecked===true){
  //     let value=0;
  //      if(this.dataSource.data.length>0){
  //       let refreshIntervalId = setInterval(()=>{  
  //         // console.log("still calling")
  //         // console.log(this.isChecked);
  //         let  dataSourceLength = this.dataSource.data.length;  
  //         if(value<dataSourceLength)  {
  //           console.log(this.dataSource.data[value]);// will call api and send record to backend for calling
  //           this.dataSource.data.splice(value , 1);
  //           // console.log( this.dataSource.data);
  //           if(dataSourceLength===0){
  //             this.isChecked==false
  //             clearInterval(refreshIntervalId);
  //           }
  //         } 
  //         else{
  //           this.isChecked=false;
  //           clearInterval(refreshIntervalId);
  //         }                 
         
  //       }, 6000); 
  //      }
           
  //   }
  //   else{
  //    this.isChecked=false
  //     console.log('Auto Dialing stop')
  //   }  
  // }
if(this.isChecked===true){
  const value = 0;
          if(this.dataSource.data.length>0){
          const currentcALLisGoingOn=this.callApi( this.dataSource.data[value])//will call to calling Api and get Result whether call still going on
           if(currentcALLisGoingOn===false){
             setTimeout(()=>{   
              if(this.activeMother){
                this.outBoundListForMother.splice(value , 1);
                this.dataSource.data=this.outBoundListForMother
              } 
              else{
                this.outBoundListForChild.splice(value , 1);
                this.dataSource.data=this.outBoundListForChild
              }                       // <<<---using ()=> syntax
           
            //  this.dataSource.data=this.outBoundListForMother;
              this.EnableAutoPreviewDialing();
          }, 10000);
           
           }
          
          }
          else{
            this.isChecked=false;
          }
}

}

callApi(value:any){
  console.log(value);
   return false
}

ngAfterViewInit() {
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;
}
openCallClosure(){
  this.associateAnmMoService.setOpenComp("Call Closure");
  // this.associateAnmMoService.loadComponent(
  //   CallClosureComponent,
  //   null
  // );
  }

  openEcdQuestionnaire(){
    // this.associateAnmMoService.loadComponent(
    //   EcdQuestionnaireComponent,
    //   null
    // );
    this.associateAnmMoService.setOpenComp("ECD Questionnaire");
    this.associateAnmMoService.onClickOfEcdQuestionnaire(true);
    }
  openBenCallHistory(){
    this.associateAnmMoService.setOpenComp("Beneficiary Call History");
    // this.associateAnmMoService.loadComponent(BeneficiaryCallHistoryComponent,null)
  }


  
}
