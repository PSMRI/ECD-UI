import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { QualityAuditorService } from '../../services/quality-auditor/quality-auditor.service';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { CallAuditComponent } from '../call-audit/call-audit/call-audit.component';

@Component({
  selector: 'app-view-casesheet',
  templateUrl: './view-casesheet.component.html',
  styleUrls: ['./view-casesheet.component.css']
})
export class ViewCasesheetComponent implements OnInit, DoCheck {
  @Input() data:any
  currentLanguageSet: any;
  beneficiaryCaseSheetData:any;
  questionnaireCaseSheetData:any;
  beneficiaryID:any;
  constructor(
    private setLanguageService: SetLanguageService,
    private qualityAuditorService: QualityAuditorService,
    private confirmationService: ConfirmationService,
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
  backToQualityAudit(){
    const data:any = {};
    data.paginator = this.data.paginator;
    data.sort = this.data.sort;
    this.qualityAuditorService.loadComponent(CallAuditComponent, {data:data});
    this.qualityAuditorService.showForm = false;
  }

}
