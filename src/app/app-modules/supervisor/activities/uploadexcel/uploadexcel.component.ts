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


import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, NgForm } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { SetLanguageService } from '../../../services/set-language/set-language.service';
import { saveAs } from 'file-saver';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import * as FileSaver from 'file-saver';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

@Component({
  selector: 'app-uploadexcel',
  templateUrl: './uploadexcel.component.html',
  styleUrls: ['./uploadexcel.component.css']
})
export class UploadexcelComponent implements OnInit {
  languageData: any;
  currentLanguageSet: any;
  choice = ["Mother", "Child"];
  option: any;
  maxFileSize = 5.0;
  file: any;
  fileList: any;
  fileTypeID: any;
  error1 = false;
  error2 = false;
  invalid_file_flag = false;
  inValidFileName = false;
  uploadDataSection = true;
  uploadTemplateSection = false;
  fileContent: any;
  valid_file_extensions =  ['xls', 'xlsx', 'xlsm', 'xlsb'];
  selectedFile: any = null;

  providerServiceMapID: any;
  userID: any;
  createdBy: any;
  data: any;
  fileName: any;
  fileRes: any;
  status: any;
  value: any;
  modDate: any;
  refresh = true;
  showSuccess=false;
  showFailure=false
  isChoiceSelected=false

  constructor(
    private setLanguageService: SetLanguageService, 
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    readonly sessionstorage: SessionStorageService,
    private supervisorService: SupervisorService,
    private trackingService: AmritTrackingService
  ) { }

  ngOnInit(): void {
    // this.autoRefresh(true);
     this.assignSelectedLanguage();

  }

  assignSelectedLanguage(){
    this.setLanguageService
      .getLanguageData(environment.language)
      .subscribe((data) => {
        this.languageData = data;
        this.currentLanguageSet = data;
      });
  }

  uploadForm = this.fb.group({
    choice: [''],
    uploadfile: [''],
  });
  uploadTemplateForm = this.fb.group({
    choice: [''],
    uploadTemplatefile: [''],
  });
  
  onSubmit() {
    console.log(this.uploadForm);
    if(this.uploadForm !== undefined && this.uploadForm !== null){
    this.fileTypeID =this.uploadForm.value.choice === "Mother" ? "Mother Data" : "Child Data";
    const file: File = this.fileList[0];
    const requestData = {
      providerServiceMapID: this.sessionstorage.getItem('providerServiceMapID'),
      userID: this.sessionstorage.getItem('userID'),
      createdBy: this.sessionstorage.getItem('userName'),
      fieldFor: this.fileTypeID,
      fileName: this.file !== undefined ? this.file.name : "",
      fileExtension:
        this.file !== undefined ? "." + this.file.name.split(".")[1] : "",
      fileContent:
        this.fileContent !== undefined ? this.fileContent.split(",")[1] : "",
  };
    this.supervisorService.postFormData(requestData).subscribe(
      (res:any) => {
        if(res !== undefined && res !== null){
          if(res.success === false || res.statusCode === 5000) {
            const errorMessage = res.errorMessage || res.status || "File upload failed";
            if (errorMessage.includes("Invalid Excel File Uploaded file is corrupted or not a valid Excel file")) {
              this.confirmationService.openDialog(this.currentLanguageSet.invalidOrCurruptFile, 'error');
            }
            else {
              this.confirmationService.openDialog(errorMessage, 'error');
            }
          }
          
          else if(res.response && res.response !== undefined) {
            if(res.response.includes("No valid")) {
              this.confirmationService.openDialog(res.response,"error");
            }
            else {
              this.confirmationService.openDialog(res.response,"success");
            }
            // this.data = res;
            this.uploadForm.reset();
            this.file=undefined;
            this.fileList=null;
            this.fileContent=undefined;
          }
          else{
            this.confirmationService.openDialog(res.errorMessage , 'error');
          }
        }
      },
      (err: any) => {
        // Handle HTTP errors
        if (err && err.error) {
          this.confirmationService.openDialog(err.error, 'error');
        }
        else {
          this.confirmationService.openDialog(err.title + err.detail, 'error')

        }
      }
    );
  }
}
  onFileUpload(event : any) {
    console.log(event);
    this.file = undefined;

    this.fileList = event.target.files;
    this.file = event.target.files[0];
    console.log(this.file);


    if (this.fileList.length === 0) {
    this.error1 = true;
    this.error2 = false;
    this.invalid_file_flag = false;
    this.inValidFileName = false;
    }
    else {
    if (this.file) {

        const fileNameExtension = this.file.name.split(".");
        const fileName = fileNameExtension[0];
        if(fileName !== undefined && fileName !== null && fileName !== "")
        {
        const isvalid = this.checkExtension(this.file);
        console.log(isvalid, 'VALID OR NOT');
        if (isvalid) {
    
            if ((this.fileList[0].size / 1000 / 1000) > this.maxFileSize) {
            console.log("File Size" + this.fileList[0].size / 1000 / 1000);
            this.error2 = true;
            this.error1 = false;
            this.invalid_file_flag = false;
            this.inValidFileName = false;
            }
            else {
            this.error1 = false;
            this.error2 = false;
            this.invalid_file_flag = false;
            this.inValidFileName = false;
            const myReader: FileReader = new FileReader();
            myReader.onloadend = this.onLoadFileCallback.bind(this.file)
            myReader.readAsDataURL(this.file);
            this.invalid_file_flag = false;
            }
          }
          else {
              this.invalid_file_flag = true;
              this.inValidFileName = false;
              this.error2 = false;
              this.error1 = false;
          }

          }
          else {
          //this.alertService.alert(this.currentLanguageSet.invalidFileName, 'error');
          this.inValidFileName = true;
          this.invalid_file_flag = false;
          this.error2 = false;
          this.error1 = false;
          }
          } else {
          
          this.invalid_file_flag = false;
          }
    }
  }
  checkExtension(file:File) {
    let count = 0;
    console.log("FILE DETAILS", file);
    if (file) {
      const array_after_split = file.name.split(".");
      if(array_after_split.length === 2) {
      const file_extension = array_after_split[array_after_split.length - 1];
      for (let i = 0; i < this.valid_file_extensions.length; i++) {
        if (
          file_extension.toUpperCase() ===
          this.valid_file_extensions[i].toUpperCase()
        ) {
          count = count + 1;
        }
      }
      if (count > 0) {
        return true;
      } else {
        return false;
      }
    } else
    {
      return false;
    }
    } else {
      return true;
    }
  }

  onback(){
    this.confirmationService
    .openDialog(
      "Do you really want to cancel? Any unsaved data would be lost",
      'confirm'
    )
    .afterClosed()
    .subscribe((res) => {
      if (res) {
        this.uploadTemplateSection = false;
        this.uploadDataSection = true;
        this.file=undefined;
        this.error1=false;
        this.error2=false;
        this.inValidFileName=false;
        this.invalid_file_flag=false;
        this.fileList=null;
        this.fileContent=undefined
        this.uploadTemplateForm.reset();
      }
    });
   
  }

  onLoadFileCallback = (event:any) => {
    this.fileContent = event.currentTarget.result;
  };

  downloadTemplate(){
    const reqObj = {
      fileTypeID : this.uploadForm.value.choice === "Mother" ? "Mother Data" : "Child Data",
      providerServiceMapID:this.sessionstorage.getItem('providerServiceMapID'),
    };
    this.supervisorService.getDownloadData(reqObj).subscribe((res:any)=>{
        if(res !== undefined && res !== null)
        {
          const sliceSize=512;
          const byteCharacters = atob(res.fileContent); //data.file there
          const byteArrays = [];
          for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
        
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
         const blob = new Blob(byteArrays, {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
         FileSaver.saveAs(blob,res.fileName);

          // const myfile= atob(res.fileContent);
          //  const blob = new Blob([myfile], { type: 'application/octet-stream' });
          //  FileSaver.saveAs(blob, "ChildData" +".xlsx");
          this.confirmationService.openDialog(this.currentLanguageSet.downloadedTemplateSuccessfully, 'success');
        }
      
      else{
        this.confirmationService.openDialog(res.errorMessage, 'error')
      }
      
    })
  }
  uploadTemplate(){
    this.uploadTemplateSection = true;
    this.uploadDataSection = false;
    this.file=undefined;
    this.error1=false;
    this.error2=false;
    this.inValidFileName=false;
    this.invalid_file_flag=false;
    this.fileList=null;
    this.fileContent=undefined
    this.uploadForm.reset();
  }
  onUpload(){
    // console.log(this.uploadForm);
    if(this.uploadTemplateForm !== undefined && this.uploadTemplateForm !== null){
    this.fileTypeID =this.uploadTemplateForm.value.choice === "Mother" ? "Mother Data" : "Child Data";
    const file: File = this.fileList[0];
    const requestData = {
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
      // userID: this.sessionstorage.getItem('userID'),
      createdBy: this.sessionstorage.getItem('userName'),
      fileType: this.fileTypeID,
      fileName: this.file !== undefined ? this.file.name : "",
      // fileExtension: this.file !== undefined ? "." + this.file.name.split(".")[1] : "",
      fileContent:this.fileContent !== undefined ? this.fileContent.split(",")[1] : "",
  };
    this.supervisorService.postTemplateData(requestData).subscribe(
      (res:any) => {
        if(res !== undefined && res !== null){
          // Check if the response indicates failure first
          if(res.success === false || res.statusCode === 5000) {
            // Error case with proper message extraction
            const errorMessage = res.errorMessage || res.status || "Template upload failed";
            if (errorMessage.includes("Invalid Excel File Uploaded file is corrupted or not a valid Excel file")) {
              this.confirmationService.openDialog("Invalid file. The uploaded Excel file is corrupt or not in a valid format.", 'error');
            }
            else {
              this.confirmationService.openDialog(errorMessage, 'error');
            }
          }
          // Check if the response indicates success
          else if(res.response) {
            if(res.response.includes("No valid")) {
              this.confirmationService.openDialog(res.response,"error");
            }
            else {
              this.confirmationService.openDialog(res.response,"success");
            }
            // this.data = res;
            this.uploadTemplateForm.reset();
            this.file=undefined;
            this.fileList=null;
            this.fileContent=undefined;
          }
          else{
            this.confirmationService.openDialog(res.errorMessage || "An error occurred during upload", 'error');
          }
        }
      },
      (err: any) => {
        // Handle HTTP errors
        if(err && err.error){
          if(err.error.errorMessage) {
            this.confirmationService.openDialog(err.error.errorMessage, 'error');
          }
          else if(typeof err.error === 'string') {
            this.confirmationService.openDialog(err.error, 'error');
          }
          else {
            this.confirmationService.openDialog("An error occurred during file upload", 'error');
          }
        }
        else if(err.status && err.message) {
          this.confirmationService.openDialog(err.message, 'error');
        }
        else {
          this.confirmationService.openDialog("An unexpected error occurred", 'error');
        }
      }
    );
  }
  }
  
  trackFieldInteraction(fieldName: string) {
    this.trackingService.trackFieldInteraction(fieldName, 'Data Upload');
  }
}
