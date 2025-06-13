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


import { DatePipe } from '@angular/common';
import { Component, DoCheck, OnInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AssociateAnmMoService } from 'src/app/app-modules/services/associate-anm-mo/associate-anm-mo.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { LoginserviceService } from 'src/app/app-modules/services/loginservice/loginservice.service';
import * as moment from 'moment';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { MatLegacyDialog as MatDialog, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { VideoConsultationService } from '../../video-consultation/videoService';

@Component({
  selector: 'app-ben-registration',
  templateUrl: './ben-registration.component.html',
  styleUrls: ['./ben-registration.component.css'],
}) export class BenRegistrationComponent implements OnInit, DoCheck {

  // viewDetails:any=this.data.selectedDetails;
  enableMotherRecord = false;
  // viewDetails: any[]=[];
  selectedRole: any;
  // isEditMode: boolean = true;
  maxDate = new Date();
  minDate = new Date();


  currentLanguageSet: any;

  phoneNumber = [
    {
      id: 1,
      name: "Self",
    },
    {
      id: 2,
      name: "Others",
    }
  ];
  phonenumofwhom: any;
  stateMasterList: any;
  districtMasterList: any;
  blockMasterList: any;
  villageMasterList: any;
  // genderMasterList:any;
  genderMasterList: any;
  ageLimit = 120;
  valueEntered: any;
  // = [
  //   {
  //   "genderID" : 1,
  //   "genderName" : "Male"
  //   },
  //   {
  //     "genderID" : 2,
  //     "genderName" : "Female"
  //     }
  // ];
  enableUpdateButton = false;
  minimumDate: any;
  callerPhoneNumber: any;
  agentID: any;
  agentName: any;
  hideVideoCall = false;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private confirmationService: ConfirmationService,
    public associateAnmMoService: AssociateAnmMoService,
    private setLanguageService: SetLanguageService,
    private masterService: MasterService,
    private loginService: LoginserviceService,
    readonly sessionstorage: SessionStorageService,
    public dialog: MatDialog,
    public videoService: VideoConsultationService,
    // private cdr: ChangeDetectorRef,

  ) {
  }

  ngOnInit(): void {
    this.videoService.videoCallPrompt = true;

    this.associateAnmMoService.isBenRegistartionData$.subscribe((responseComp) => {
      if (responseComp !== null && responseComp === true) {
        if (this.associateAnmMoService.selectedBenDetails.beneficiaryRegId !== null &&
          this.associateAnmMoService.selectedBenDetails.beneficiaryRegId !== undefined) {
          this.enableUpdateButton = true;
        } else {
          this.enableUpdateButton = false;
        }
      }

    });
    console.log(this.associateAnmMoService.selectedBenDetails);
    this.getSelectedLanguage();

    // this.stateMaster();
    this.genderMaster();
    this.minDate.setMonth(this.maxDate.getMonth() - 10);
    
    this.associateAnmMoService.openCompFlag$.subscribe((responseComp) => {
      if (responseComp !== null && responseComp === "Call Closed") {
        this.benRegistrationForm.reset();
      }

    });

    this.associateAnmMoService.loadDetailsInRegFlag$.subscribe(res => {
      if (res === true) {
        this.benRegistrationForm.reset();

        if (this.associateAnmMoService.isMother) {
          this.enableMotherRecord = true;
        }
        else {
          this.enableMotherRecord = false;
        }
        this.patchValueForviewDetails();

      }
    })

    this.selectedRole = this.sessionstorage.getItem('role');

    this.minimumDate = new Date();
    this.minimumDate.setDate(this.maxDate.getDate() - 1000);
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  ngDoCheck() {
    this.getSelectedLanguage();
    this.selectedRole = this.sessionstorage.getItem('role');
  }
  genderMaster() {
    this.masterService.getGenderMaster().subscribe(
      (response: any) => {
        if (response) {
          this.genderMasterList = response


        } else {
          this.confirmationService.openDialog(response.errorMessage, 'error');
        }
      },
      (err: any) => {
        if (err && err.error)
          this.confirmationService.openDialog(err.error, 'error');
        else
          this.confirmationService.openDialog(err.title + err.detail, 'error')
      }
    );
  }

  // stateMaster() {
  //     this.masterService.getStateMaster(1).subscribe(
  //       (response: any) => {
  //         if (response && response.data !== null) {
  //           this.stateMasterList = response.data
  //           this.districtMasterList = [];
  //           this.blockMasterList = [];
  //           this.villageMasterList = [];

  //         } else {
  //           this.confirmationService.openDialog(response.errorMessage, 'error');
  //         }
  //       },
  //       (err: any) => {
  //         if(err && err.error)
  //         this.confirmationService.openDialog(err.error, 'error');
  //         else
  //         this.confirmationService.openDialog(err.title + err.detail, 'error')
  //         }
  //     );

  // }

  benRegistrationForm = new FormGroup({
    motherId: new FormControl(''),
    mctsidNoChildId: new FormControl(''),
    childName: new FormControl(''),
    motherName: new FormControl(''),
    husbandName: new FormControl(''),
    genderID: new FormControl(),
    genderName: new FormControl(''),
    healthBlock: new FormControl(''),
    phcName: new FormControl(''),
    subFacility: new FormControl(''),
    stateID: new FormControl(),
    districtID: new FormControl(),
    blockID: new FormControl(),
    districtBranchID: new FormControl(),
    address: new FormControl(''),
    phoneNo: new FormControl(''),
    phoneNoOf: new FormControl(''),
    dob: new FormControl(),
    alternatePhoneNo: new FormControl(''),
    ashaName: new FormControl(''),
    ashaPhoneNo: new FormControl(''),
    anmName: new FormControl(''),
    anmPhoneNo: new FormControl(''),
    lmpDate: new FormControl(),
    edd: new FormControl(),
    displayOBCallType: new FormControl(''),
    age: new FormControl('')
  });

  // onClickOfPhoneNoType(event: any) {
  //   this.phonenumofwhom = event.value;
  //   console.log(this.phonenumofwhom);
  // }

  patchValueForviewDetails() {
    // let viewDetails: any =
    //   [
    //     {
    //     "motherid": 123456789012,
    //     "mothername": "Riya",
    //     "husbandname": "George",
    //     "gender": "Female",
    //     "distname": "Medchal",
    //     "healthblock": "Medchal Block",
    //     "phcname": "Medchal PHC",
    //     "subfacility": "Medchal Sub facility",
    //     "gpvillage": "Medchal Village",
    //     "address": "Hyderabad",
    //     "phonenum": 7788991122,
    //     "phonenumofwhom": "Self",
    //     "alternatephonenum": 8899773311,
    //     "ashaname": "Suma",
    //     "ashaphonenum": 8899553366,
    //     "anmname": "Divya",
    //     "anmphonenum": 7744223312,
    //     "lmpdate": "2023-02-15T00:00:00.000Z",
    //     "edddate": "2023-09-25T00:00:00.000Z",
    //     "ecdcalltype": "Outbound"
    //     }
    //   ];

    let viewDetails: any = null;
    viewDetails = this.associateAnmMoService.selectedBenDetails;

    if (viewDetails !== null) {
      this.benRegistrationForm.patchValue(viewDetails);

      if (viewDetails.gender !== undefined && viewDetails.gender !== null) {

        this.genderMasterList.filter((values: any) => {
          if (viewDetails.gender !== undefined && viewDetails.gender !== null && (values.genderName.toLowerCase() === viewDetails.gender.toLowerCase())) {
            this.benRegistrationForm.controls.genderID.setValue(values.genderID);
            this.benRegistrationForm.controls.genderName.setValue(values.genderName);

          }
        });
      }

      if (this.enableMotherRecord && viewDetails.mctsidNo !== undefined && viewDetails.mctsidNo !== null) {
        this.benRegistrationForm.controls.motherId.setValue(viewDetails.mctsidNo);
        this.benRegistrationForm.controls.motherName.setValue(viewDetails.name);
        this.benRegistrationForm.controls.phoneNo.setValue(viewDetails.whomPhoneNo);
        this.benRegistrationForm.controls.phoneNoOf.setValue(viewDetails.phoneNoOfWhom);
        let lDate = new Date(viewDetails.lmpDate);
        lDate = new Date(lDate.getTime() + lDate.getTimezoneOffset() * 60000)

        this.benRegistrationForm.controls.lmpDate.setValue(lDate);

        // let eDate = new Date(viewDetails.edd);
        // eDate = new Date(eDate.getTime() + eDate.getTimezoneOffset() * 60000)
        // this.benRegistrationForm.controls.edd.setValue(eDate);

        // Calculate EDD based on LMP Date
        const eddDate = new Date(lDate);
        eddDate.setDate(eddDate.getDate() + 7); // Add 7 days
        eddDate.setMonth(eddDate.getMonth() + 9); // Add 9 months
        console.log("EDD FORM VALUE FIRST", this.benRegistrationForm);
        this.benRegistrationForm.controls.edd.setValue(eddDate);
        console.log("EDD PATCHING VALUE", eddDate);
      }
      else {
        let dobDate = new Date(viewDetails.dob);
        dobDate = new Date(dobDate.getTime() + dobDate.getTimezoneOffset() * 60000)

        this.benRegistrationForm.controls.dob.setValue(dobDate);
        if (this.benRegistrationForm.controls.dob.value) {
          this.benRegistrationForm.controls.dob.setErrors(null)
        }
      }

      if (viewDetails.fatherName !== undefined && viewDetails.fatherName !== null) {
        this.benRegistrationForm.controls.husbandName.setValue(viewDetails.fatherName);
      }


      this.benRegistrationForm.controls.stateID.setValue(viewDetails.stateName);
      this.benRegistrationForm.controls.districtID.setValue(viewDetails.districtName);
      this.benRegistrationForm.controls.blockID.setValue(viewDetails.blockName);
      this.benRegistrationForm.controls.districtBranchID.setValue(viewDetails.villageName);

      // this.patchDemographicMasters(viewDetails);

      /**
       * todo remove this code
       */
      // this.benRegistrationForm.controls.genderID.setValue(2);
      // this.benRegistrationForm.controls.genderName.setValue("Female");
      // this.benRegistrationForm.controls.stateID.setValue(2);
      // this.benRegistrationForm.controls.districtID.setValue(4);
      // this.benRegistrationForm.controls.blockID.setValue(28);
      // this.benRegistrationForm.controls.districtBranchID.setValue(745);
      // console.log("details", this.benRegistrationForm.valid);
    }
  }

  // patchDemographicMasters(viewDetails:any) {

  //   this.stateMasterList.filter((values:any) => {
  //     if (viewDetails.stateName !== undefined &&  viewDetails.stateName !== null && (values.stateName.toLowerCase() === viewDetails.stateName.toLowerCase())) {
  //       this.benRegistrationForm.controls.stateID.setValue(values.stateID);
  //     }
  //   });

  //   if(this.benRegistrationForm.controls.stateID.value !== undefined && this.benRegistrationForm.controls.stateID.value !== null && this.benRegistrationForm.controls.stateID.value !== ""){
  //   this.getDistrictMaster(this.benRegistrationForm.controls.stateID.value,viewDetails); 
  // }
  // }

  //     getDistrictMaster(stateID:any,viewDetails:any) {

  //       this.masterService.getDistrictMaster(stateID).subscribe(
  //         (response: any) => {
  //           if (response && response.data !== null) {
  //             this.districtMasterList = response.data;
  //             this.blockMasterList = [];
  //             this.villageMasterList = [];

  //             this.districtMasterList.filter((values:any) => {
  //               if (viewDetails.districtName !== undefined && viewDetails.districtName !== null && (values.districtName.toLowerCase() === viewDetails.districtName.toLowerCase())) {
  //                 this.benRegistrationForm.controls.districtID.setValue(values.districtID);
  //               }
  //             });

  //  if(this.benRegistrationForm.controls.districtID.value !== undefined && this.benRegistrationForm.controls.districtID.value !== null && this.benRegistrationForm.controls.districtID.value !== ""){
  //             this.getBlockMaster(this.benRegistrationForm.controls.districtID.value,viewDetails);
  //  }

  //           } else {
  //             this.confirmationService.openDialog(response.errorMessage, 'error');
  //           }
  //         },
  //         (err: any) => {
  //           if(err && err.error)
  //           this.confirmationService.openDialog(err.error, 'error');
  //           else
  //           this.confirmationService.openDialog(err.title + err.detail, 'error')
  //           }
  //       );



  //     }


  // getBlockMaster(dictrictID:any,viewDetails:any) {
  //   this.masterService.getBlockMaster(dictrictID).subscribe(
  //     (response: any) => {
  //       if (response && response.data !== null) {
  //         this.blockMasterList = response.data;
  //         this.villageMasterList = [];

  //         this.blockMasterList.filter((values:any) => {
  //           if (viewDetails.blockName !== undefined  && viewDetails.blockName !== null && (values.blockName.toLowerCase() === viewDetails.blockName.toLowerCase())) {
  //             this.benRegistrationForm.controls.blockID.setValue(values.blockID);
  //           }
  //         });

  //         if(this.benRegistrationForm.controls.blockID.value !== undefined && this.benRegistrationForm.controls.blockID.value !== null && this.benRegistrationForm.controls.blockID.value !== ""){
  //         this.getVillageMaster(this.benRegistrationForm.controls.blockID.value,viewDetails);
  //         }

  //       } else {
  //         this.confirmationService.openDialog(response.errorMessage, 'error');
  //       }
  //     },
  //     (err: any) => {
  //       if(err && err.error)
  //       this.confirmationService.openDialog(err.error, 'error');
  //       else
  //       this.confirmationService.openDialog(err.title + err.detail, 'error')
  //       }
  //   );
  // }

  // getVillageMaster(blockID:any,viewDetails:any) {
  //   this.masterService.getVillageMaster(blockID).subscribe(
  //     (response: any) => {
  //       if (response && response.data !== null) {
  //         this.villageMasterList = response.data;

  //         this.villageMasterList.filter((values:any) => {
  //           if (viewDetails.villageName !== undefined && viewDetails.villageName !== null && (values.villageName.toLowerCase() === viewDetails.villageName.toLowerCase())) {
  //             this.benRegistrationForm.controls.districtBranchID.setValue(values.districtBranchID);
  //           }
  //         });



  //       } else {
  //         this.confirmationService.openDialog(response.errorMessage, 'error');
  //       }
  //     },
  //     (err: any) => {
  //       if(err && err.error)
  //       this.confirmationService.openDialog(err.error, 'error');
  //       else
  //       this.confirmationService.openDialog(err.title + err.detail, 'error')
  //       }
  //   );
  // }

  setGenderName(genderValue: any) {
    this.benRegistrationForm.controls.genderName.setValue(genderValue);
  }

  onSubmit() {
    let lmpDateValue = null;
    let eddDateValue = null;
    let dobDateValue = null;
    if (this.enableMotherRecord) {
      
      lmpDateValue = this.formatDateValue(this.benRegistrationForm.controls.lmpDate.value);
      eddDateValue = this.formatDateValue(this.benRegistrationForm.controls.edd.value);
    }
    else {
      dobDateValue =  this.formatDateValue(this.benRegistrationForm.controls.dob.value);

    }
    const demographicReq = {
      //  "stateID" :this.benRegistrationForm.controls.stateID.value,
      //  "districtID": this.benRegistrationForm.controls.districtID.value,
      //  "blockID" : this.benRegistrationForm.controls.blockID.value,
      //  "districtBranchID" : this.benRegistrationForm.controls.districtBranchID.value,
      "addressLine1": (this.benRegistrationForm.controls.address.value !== undefined && this.benRegistrationForm.controls.address.value !== null && this.benRegistrationForm.controls.address.value !== "") ? this.benRegistrationForm.controls.address.value : undefined,
      "createdBy": this.sessionstorage.getItem('userName')
    };

    const phoneDetails = [];
    if (this.benRegistrationForm.controls.phoneNo.value !== undefined && this.benRegistrationForm.controls.phoneNo.value !== null) {

      const phnReq = {
        "phoneNo": this.benRegistrationForm.controls.phoneNo.value,
        "createdBy": this.sessionstorage.getItem('userName')
      }
      phoneDetails.push(phnReq);
    }

    if (this.benRegistrationForm.controls.alternatePhoneNo.value !== undefined && this.benRegistrationForm.controls.alternatePhoneNo.value !== null && this.benRegistrationForm.controls.alternatePhoneNo.value !== "") {

      const altPhnReq = {
        "phoneNo": this.benRegistrationForm.controls.alternatePhoneNo.value,
        "createdBy": this.sessionstorage.getItem('userName')
      }
      phoneDetails.push(altPhnReq);
    }




    const reqObj = {
      "motherId": this.benRegistrationForm.controls.motherId.value,
      "childId": (this.benRegistrationForm.controls.mctsidNoChildId.value !== undefined && this.benRegistrationForm.controls.mctsidNoChildId.value !== null && this.benRegistrationForm.controls.mctsidNoChildId.value !== "") ? this.benRegistrationForm.controls.mctsidNoChildId.value : undefined,
      "name": (this.benRegistrationForm.controls.childName.value !== undefined && this.benRegistrationForm.controls.childName.value !== null && this.benRegistrationForm.controls.childName.value !== "") ? this.benRegistrationForm.controls.childName.value : this.benRegistrationForm.controls.motherName.value,
      "motherName": (this.benRegistrationForm.controls.mctsidNoChildId.value !== undefined && this.benRegistrationForm.controls.mctsidNoChildId.value !== null && this.benRegistrationForm.controls.mctsidNoChildId.value !== "") ? this.benRegistrationForm.controls.motherName.value : undefined,
      "spouseName": (this.benRegistrationForm.controls.husbandName.value !== undefined && this.benRegistrationForm.controls.husbandName.value !== null && this.benRegistrationForm.controls.husbandName.value !== "") ? this.benRegistrationForm.controls.husbandName.value : undefined,
      "genderID": this.benRegistrationForm.controls.genderID.value,
      "genderName": this.benRegistrationForm.controls.genderName.value,
      "phoneNo": this.benRegistrationForm.controls.phoneNo.value,
      "phoneNoOfWhom": this.benRegistrationForm.controls.phoneNoOf.value,
      "alternatePhoneNo": (this.benRegistrationForm.controls.alternatePhoneNo.value !== undefined && this.benRegistrationForm.controls.alternatePhoneNo.value !== null && this.benRegistrationForm.controls.alternatePhoneNo.value !== "") ? this.benRegistrationForm.controls.alternatePhoneNo.value : undefined,
      "dateOfBirth": dobDateValue,
      "age": this.benRegistrationForm.controls.age.value,
      "lmp": lmpDateValue,
      "edd": eddDateValue,
      "i_bendemographics": demographicReq,
      "benPhoneMaps": phoneDetails,
      "vanID": this.loginService.currentServiceId,
      "emergencyRegistration": false,
      "ashaName": this.benRegistrationForm.controls.ashaName.value,
      "ashaPh": this.benRegistrationForm.controls.ashaPhoneNo.value,
      "anmName": this.benRegistrationForm.controls.anmName.value,
      "anmPh": this.benRegistrationForm.controls.anmPhoneNo.value,
      "phcName": this.benRegistrationForm.controls.phcName.value,
      "blockName": this.benRegistrationForm.controls.healthBlock.value,
      "providerServiceMapID": this.sessionstorage.getItem('providerServiceMapID'),
      "createdBy": this.sessionstorage.getItem('userName')
    };



    this.associateAnmMoService.registerBeneficiary(reqObj).subscribe(
      (response: any) => {

        if (response !== null && response.response && response.response.BenRegId !== undefined && response.response.BenRegId !== null) {
          const benRegId = response.response.BenRegId;
          const benId = response.response.BeneficiaryId;
          this.videoService.benRegId = response.response.BenRegId
          this.sessionstorage.setItem('beneficiaryRegId', benRegId);
          this.associateAnmMoService.selectedBenDetails.childName = this.benRegistrationForm.controls.childName.value,
            this.associateAnmMoService.selectedBenDetails.motherName = this.benRegistrationForm.controls.motherName.value,
            this.associateAnmMoService.selectedBenDetails.spouseName = this.benRegistrationForm.controls.husbandName.value,
            this.associateAnmMoService.selectedBenDetails.genderName = this.benRegistrationForm.controls.genderName.value,
            this.associateAnmMoService.selectedBenDetails.phoneNo = this.benRegistrationForm.controls.phoneNo.value,
            this.associateAnmMoService.selectedBenDetails.phoneNoOfWhom = this.benRegistrationForm.controls.phoneNoOf.value,
            this.associateAnmMoService.selectedBenDetails.alternatePhoneNo = this.benRegistrationForm.controls.alternatePhoneNo.value,
            this.associateAnmMoService.selectedBenDetails.ashaName = this.benRegistrationForm.controls.ashaName.value,
            this.associateAnmMoService.selectedBenDetails.ashaPh = this.benRegistrationForm.controls.ashaPhoneNo.value,
            this.associateAnmMoService.selectedBenDetails.anmName = this.benRegistrationForm.controls.anmName.value,
            this.associateAnmMoService.selectedBenDetails.anmPh = this.benRegistrationForm.controls.anmPhoneNo.value,
            this.associateAnmMoService.selectedBenDetails.phcName = this.benRegistrationForm.controls.phcName.value,
            this.associateAnmMoService.selectedBenDetails.blockName = this.benRegistrationForm.controls.healthBlock.value,
            this.associateAnmMoService.selectedBenDetails.address = this.benRegistrationForm.controls.address.value,
            this.associateAnmMoService.selectedBenDetails.dob = this.formatDateValue(this.benRegistrationForm.controls.dob.value),
            this.associateAnmMoService.selectedBenDetails.lmpDate = this.formatDateValue(this.benRegistrationForm.controls.lmpDate.value),
            this.associateAnmMoService.selectedBenDetails.edd = this.formatDateValue(this.benRegistrationForm.controls.edd.value),
            this.associateAnmMoService.selectedBenDetails.age = this.benRegistrationForm.controls.age.value,

            this.confirmationService.openDialog(this.currentLanguageSet.beneficiaryRegisteredSuccessfully + " " + benRegId, `success`);
          this.associateAnmMoService.setOpenComp("ECD Questionnaire");
          this.associateAnmMoService.onClickOfEcdQuestionnaire(true);
          // this.performAction();

        }
        else {
          this.confirmationService.openDialog(this.currentLanguageSet.issueInBeneficiaryReg, 'error');
        }
      },
      (err: any) => {
        if (err && err.error)
          this.confirmationService.openDialog(err.error, 'error');
        else
          this.confirmationService.openDialog(err.title + err.detail, 'error')
      });





    // this.associateAnmMoService.loadComponent(
    //   EcdQuestionnaireComponent,
    //   null
    // );
  }

  goToClosure() {
    this.confirmationService
      .openDialog(
        this.currentLanguageSet.doYouWantToCloseTheCall,
        'confirm'
      )
      .afterClosed()
      .subscribe((response) => {
        if (response) {
          this.associateAnmMoService.fromComponent = "Beneficiary Registration";
          this.associateAnmMoService.setOpenComp("Call Closure");
        }

      });


  }

  onUpdate() {
    let lmpDateValue = null;
    let eddDateValue = null;
    let dobDateValue = null;
    if (this.enableMotherRecord) {
      lmpDateValue = this.formatDateValue(this.benRegistrationForm.controls.lmpDate.value);
      eddDateValue = this.formatDateValue(this.benRegistrationForm.controls.edd.value);
    }
    else {
      dobDateValue =  this.formatDateValue(this.benRegistrationForm.controls.dob.value);
    }

    let benRegId = null;
    if (this.associateAnmMoService.selectedBenDetails !== null) {
      benRegId = this.associateAnmMoService.selectedBenDetails.beneficiaryRegId;
      this.videoService.benRegId = benRegId

    }

    const demographicReq = {
      "beneficiaryRegID": benRegId,
      // "stateID" :this.benRegistrationForm.controls.stateID.value,
      // "districtID": this.benRegistrationForm.controls.districtID.value,
      // "blockID" : this.benRegistrationForm.controls.blockID.value,
      // "districtBranchID" : this.benRegistrationForm.controls.districtBranchID.value,
      "addressLine1": (this.benRegistrationForm.controls.address.value !== undefined && this.benRegistrationForm.controls.address.value !== null && this.benRegistrationForm.controls.address.value !== "") ? this.benRegistrationForm.controls.address.value : undefined,
      "createdBy": this.sessionstorage.getItem('userName'),
      "modifiedBy": this.sessionstorage.getItem('userName')
    };

    const phoneDetails = [];
    if (this.benRegistrationForm.controls.phoneNo.value !== undefined && this.benRegistrationForm.controls.phoneNo.value !== null) {

      const phnReq = {
        "parentBenRegID": benRegId,
        "beneficiaryRegID": benRegId,
        "phoneNo": this.benRegistrationForm.controls.phoneNo.value,
        "modifiedBy": this.sessionstorage.getItem('userName'),
        "createdBy": this.sessionstorage.getItem('userName')
      }
      phoneDetails.push(phnReq);
    }

    if (this.benRegistrationForm.controls.alternatePhoneNo.value !== undefined && this.benRegistrationForm.controls.alternatePhoneNo.value !== null && this.benRegistrationForm.controls.alternatePhoneNo.value !== "") {

      const altPhnReq = {
        "parentBenRegID": benRegId,
        "beneficiaryRegID": benRegId,
        "phoneNo": this.benRegistrationForm.controls.alternatePhoneNo.value,
        "modifiedBy": this.sessionstorage.getItem('userName'),
        "createdBy": this.sessionstorage.getItem('userName')
      }
      phoneDetails.push(altPhnReq);
    }




    const reqObj = {
      "beneficiaryRegID": benRegId,
      "motherId": this.benRegistrationForm.controls.motherId.value,
      "childId": (this.benRegistrationForm.controls.mctsidNoChildId.value !== undefined && this.benRegistrationForm.controls.mctsidNoChildId.value !== null && this.benRegistrationForm.controls.mctsidNoChildId.value !== "") ? this.benRegistrationForm.controls.mctsidNoChildId.value : undefined,
      "name": (this.benRegistrationForm.controls.childName.value !== undefined && this.benRegistrationForm.controls.childName.value !== null && this.benRegistrationForm.controls.childName.value !== "") ? this.benRegistrationForm.controls.childName.value : this.benRegistrationForm.controls.motherName.value,
      "motherName": (this.benRegistrationForm.controls.mctsidNoChildId.value !== undefined && this.benRegistrationForm.controls.mctsidNoChildId.value !== null && this.benRegistrationForm.controls.mctsidNoChildId.value !== "") ? this.benRegistrationForm.controls.motherName.value : undefined,
      "spouseName": (this.benRegistrationForm.controls.husbandName.value !== undefined && this.benRegistrationForm.controls.husbandName.value !== null && this.benRegistrationForm.controls.husbandName.value !== "") ? this.benRegistrationForm.controls.husbandName.value : undefined,
      "genderID": this.benRegistrationForm.controls.genderID.value,
      "genderName": this.benRegistrationForm.controls.genderName.value,
      "phoneNo": this.benRegistrationForm.controls.phoneNo.value,
      "phoneNoOfWhom": this.benRegistrationForm.controls.phoneNoOf.value,
      "alternatePhoneNo": (this.benRegistrationForm.controls.alternatePhoneNo.value !== undefined && this.benRegistrationForm.controls.alternatePhoneNo.value !== null && this.benRegistrationForm.controls.alternatePhoneNo.value !== "") ? this.benRegistrationForm.controls.alternatePhoneNo.value : undefined,
      "dateOfBirth": dobDateValue,
      "age": this.benRegistrationForm.controls.age.value,
      "lmp": lmpDateValue,
      "edd": eddDateValue,
      "i_bendemographics": demographicReq,
      "benPhoneMaps": phoneDetails,
      "emergencyRegistration": false,
      "changeInSelfDetails": true,
      "changeInOtherDetails": true,
      "changeInAddress": true,
      "changeInContacts": true,
      "changeInFamilyDetails": true,
      "is1097": false,
      "vanID": this.loginService.currentServiceId,
      "ashaName": this.benRegistrationForm.controls.ashaName.value,
      "ashaPh": this.benRegistrationForm.controls.ashaPhoneNo.value,
      "anmName": this.benRegistrationForm.controls.anmName.value,
      "anmPh": this.benRegistrationForm.controls.anmPhoneNo.value,
      "phcName": this.benRegistrationForm.controls.phcName.value,
      "blockName": this.benRegistrationForm.controls.healthBlock.value,
      "providerServiceMapID": this.sessionstorage.getItem('providerServiceMapID'),
      "createdBy": this.sessionstorage.getItem('userName'),
      "modifiedBy": this.sessionstorage.getItem('userName')
    };

    console.log(reqObj);

    this.associateAnmMoService.updateBeneficiary(reqObj).subscribe(
      (response: any) => {

        if (response !== null && response.response !== null) {

          this.associateAnmMoService.selectedBenDetails.childName = this.benRegistrationForm.controls.childName.value,
            this.associateAnmMoService.selectedBenDetails.motherName = this.benRegistrationForm.controls.motherName.value,
            this.associateAnmMoService.selectedBenDetails.spouseName = this.benRegistrationForm.controls.husbandName.value,
            this.associateAnmMoService.selectedBenDetails.genderName = this.benRegistrationForm.controls.genderName.value,
            this.associateAnmMoService.selectedBenDetails.phoneNo = this.benRegistrationForm.controls.phoneNo.value,
            this.associateAnmMoService.selectedBenDetails.phoneNoOfWhom = this.benRegistrationForm.controls.phoneNoOf.value,
            this.associateAnmMoService.selectedBenDetails.alternatePhoneNo = this.benRegistrationForm.controls.alternatePhoneNo.value,
            this.associateAnmMoService.selectedBenDetails.ashaName = this.benRegistrationForm.controls.ashaName.value,
            this.associateAnmMoService.selectedBenDetails.ashaPh = this.benRegistrationForm.controls.ashaPhoneNo.value,
            this.associateAnmMoService.selectedBenDetails.anmName = this.benRegistrationForm.controls.anmName.value,
            this.associateAnmMoService.selectedBenDetails.anmPh = this.benRegistrationForm.controls.anmPhoneNo.value,
            this.associateAnmMoService.selectedBenDetails.phcName = this.benRegistrationForm.controls.phcName.value,
            this.associateAnmMoService.selectedBenDetails.blockName = this.benRegistrationForm.controls.healthBlock.value,
            this.associateAnmMoService.selectedBenDetails.address = this.benRegistrationForm.controls.address.value,
            this.associateAnmMoService.selectedBenDetails.age = this.benRegistrationForm.controls.age.value,
            this.associateAnmMoService.selectedBenDetails.lmpDate = this.formatDateValue(this.benRegistrationForm.controls.lmpDate.value),
            this.associateAnmMoService.selectedBenDetails.dob =  this.formatDateValue(this.benRegistrationForm.controls.dob.value),
            this.associateAnmMoService.selectedBenDetails.edd = this.formatDateValue(this.benRegistrationForm.controls.edd.value),            this.confirmationService.openDialog(response.response, `success`);
          this.associateAnmMoService.setOpenComp("ECD Questionnaire");
          this.associateAnmMoService.onClickOfEcdQuestionnaire(true);

          // this.performAction();

        }
        else {
          this.confirmationService.openDialog(response.errorMessage, 'error');
        }
      },
      (err: any) => {
        if (err && err.error)
          this.confirmationService.openDialog(err.error, 'error');
        else
          this.confirmationService.openDialog(err.title + err.detail, 'error')
      });


  }

  openEcdQuestionnaire() {
    this.confirmationService
      .openDialog(
        this.currentLanguageSet.areYouSureWantToProceedEcdQuestionnaire,
        'confirm'
      )
      .afterClosed()
      .subscribe((response) => {
        if (response) {

          // this.performAction();
                   
          this.associateAnmMoService.setOpenComp("ECD Questionnaire");
          this.associateAnmMoService.onClickOfEcdQuestionnaire(true);
        }

      });

  }


  calculateEdd() {

    if (this.benRegistrationForm.controls.lmpDate.value !== null) {
      const eddDate = new Date(this.benRegistrationForm.controls.lmpDate.value);
      eddDate.setDate(this.benRegistrationForm.controls.lmpDate.value.getDate() + 7);
      eddDate.setMonth(this.benRegistrationForm.controls.lmpDate.value.getMonth() + 9);
      this.benRegistrationForm.patchValue({ edd: eddDate })
    } else {
      console.log("EDD VALUE", this.benRegistrationForm.controls.edd.value);
      this.benRegistrationForm.patchValue({ edd: null })
    }
  }


  ageEntered() {
    this.valueEntered = this.benRegistrationForm.controls.age.value;
    if (this.valueEntered) {
      if (this.valueEntered < 12 || this.valueEntered > 50) {
        this.confirmationService.openDialog(this.currentLanguageSet.pleaseValidateAge, 'warn');
        this.benRegistrationForm.patchValue({ age: null });
      }
      else if (this.valueEntered > this.ageLimit) {
        this.confirmationService.openDialog(this.currentLanguageSet.pleaseValidateAge, 'warn');
        this.benRegistrationForm.patchValue({ age: null });
      }
    }

  }

  performAction() {
    if (!this.benRegistrationForm.controls.phoneNo.value) {
        this.confirmationService.openDialog(
          this.currentLanguageSet?.phoneNumberRequired || 'Phone number is required for video call',
          'error'
        );
        return;
      }
    this.videoService.videoCallPrompt = true;
    // this.cdr.detectChanges();
    this.videoService.setVideoCallData(
      true, // or your dynamic video call status
      this.benRegistrationForm.controls.phoneNo.value,
      this.videoService.meetLink,
      this.loginService.agentId,
      sessionStorage.getItem('userName'))
  }

  formatDateValue(value: any) {

    const dateObj = new Date(value);
    const finalDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}T00:00:00+05:30`;
    return finalDate;

 }

}