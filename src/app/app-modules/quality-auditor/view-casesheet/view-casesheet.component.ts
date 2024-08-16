import { Component, DoCheck, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { QualityAuditorService } from '../../services/quality-auditor/quality-auditor.service';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { CallAuditComponent } from '../call-audit/call-audit/call-audit.component';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Inject } from '@angular/core';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';

import { SpinnerService } from '../../services/spinnerService/spinner.service';


@Component({
  selector: 'app-view-casesheet',
  templateUrl: './view-casesheet.component.html',
  styleUrls: ['./view-casesheet.component.css']
})
export class ViewCasesheetComponent implements OnInit, DoCheck {
  currentLanguageSet: any;
  beneficiaryCaseSheetData:any;
  questionnaireCaseSheetData:any;
  beneficiaryID:any;

  @ViewChild('content', { static: false }) content!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ViewCasesheetComponent>,
    private setLanguageService: SetLanguageService,
    private qualityAuditorService: QualityAuditorService,
    private confirmationService: ConfirmationService,
    private spinnerService: SpinnerService
  ) { }

  getCaseSheetData(benCallID:any){
    let reqObj: any = {};
    reqObj = {
      benCallId:benCallID
    };
    
      console.log(reqObj);
      this.qualityAuditorService.getCaseSheetDataFromService(reqObj).subscribe(
        (response: any) => {
          this.beneficiaryCaseSheetData=response.beneficiaryDetails;
          this.questionnaireCaseSheetData=response.questionnaireResponse;
          console.log(this.beneficiaryCaseSheetData)
          console.log(this.questionnaireCaseSheetData)
        },
        (err:any) => {
          if(err && err.error)
          this.confirmationService.openDialog(err.error, 'error');
          else
          this.confirmationService.openDialog(err.title + err.detail, 'error')
          });
    
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    console.log(this.data.benCallId);
    this.getCaseSheetData(this.data.benCallId);
    this.beneficiaryID= this.data.beneficiaryId;
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


   generatePDF() {
    this.spinnerService.setLoading(true);
    const data = this.content.nativeElement;
    html2canvas(data, { scale: 1.5 }).then(canvas => {
       const imgWidth = 212;
       const pageHeight = 297;
       const imgHeight = canvas.height * imgWidth / canvas.width;
       let heightLeft = imgHeight;
       const pdf = new jsPDF('p', 'mm', 'a4');
       let position = 0;
       pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
       heightLeft -= pageHeight;
       while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
       }
       const pdfOutput = pdf.output('blob');
       const blobUrl = URL.createObjectURL(pdfOutput);
       this.spinnerService.setLoading(false);
       const newWindow = window.open(blobUrl);
       if (newWindow) {
          newWindow.focus();
       }
    });
  }


}
