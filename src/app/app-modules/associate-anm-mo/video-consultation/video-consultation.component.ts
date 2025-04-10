import { Component, Inject } from '@angular/core';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';
import { SmsTemplateService } from '../../services/smsTemplate/sms-template.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';

interface VideoConsultationDialogData {
  videoCallPrompt: boolean;
  callerPhoneNumber: string;
  agentID: string;
  agentName: string;
}

interface LinkResponse {
  meetingLink: string;
}

interface VideoCallRequest {
  dateOfCall: string; // ISO 8601 string recommended
  callerPhoneNumber: string;
  agentID: string;
  agentName: string;
  meetingLink: string;
  callStatus: string;
  callDuration: string;
  providerServiceMapID: number;
  closureRemark: string;
}

@Component({
  selector: 'app-video-consultation',
  templateUrl: './video-consultation.component.html',
  styleUrls: ['./video-consultation.component.css']
})

export class VideoConsultationComponent {
  // consent: boolean | null = null;
  linkSent = false;
  linkStatus = ''; 
  receiptConfirmation = ''; 
  callStatus: 'Not Initiated' | 'Ongoing' | 'Completed' = 'Not Initiated';
  linkResend = 'Sent'; 
  videoConsultationAvailable = false;
  meetLink = ''; 
  isMeetAvailable = false;
  SMSStatus = '';


  constructor(
    private associateAnmMoService: AssociateAnmMoService,
    private sms_service: SmsTemplateService,
    private loginService: LoginserviceService,
    readonly sessionstorage:SessionStorageService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<VideoConsultationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VideoConsultationDialogData,   

  ) { }


  sendOrResendLink(): void {
    this.associateAnmMoService.generateLink().subscribe({
      next: (response: any) => {
        this.linkSent = true;
        this.linkStatus = 'Sent Successfully';
        this.meetLink = response.meetingLink;

        this.send_sms(this.meetLink, this.data.callerPhoneNumber);
      },
      error: () => {
        this.linkStatus = 'Failed to send';
      }
    });
  }
  
  startConsultation() {
    this.callStatus = 'Ongoing';
    this.isMeetAvailable = true;  
    alert('Call has started')
  }
  
  endConsultation(): void {
    this.callStatus = 'Completed';
    this.data.videoCallPrompt = false;
    this.dialogRef.close();

    this.resetLinkState();
  }

  private resetLinkState(): void {
    this.linkSent = false;
    this.linkStatus = '';
    this.receiptConfirmation = '';
    this.isMeetAvailable = false;
    this.meetLink = '';
  }

  updateReceiptConfirmation(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.receiptConfirmation = target.value;

    if (target.value === 'Not Received') {
      this.linkStatus = 'Not Sent';
    }
  }
  

  handleConsent(agreed: boolean) {
    if (agreed === true) {
      this.videoConsultationAvailable = true;
    } else {
      this.dialogRef.close();
    }
  }

  send_sms(smsAdvice: any, phoneNo: any) {
    let sms_template_id = "";
    let smsTypeID = "";
    const currentServiceID = this.loginService.currentServiceId;
    this.sms_service.getSMStypes(currentServiceID).subscribe(
      (response: any) => {
        if (response !== undefined) {
          if (response.data.length > 0) {
            for (let i = 0; i < response.data.length; i++) {
              if (
                response.data[i].smsType.toLowerCase() ===
                "Advice SMS".toLowerCase()
              ) {
                smsTypeID = response.data[i].smsTypeID;
                break;
              }
            }
          }
        }

        if (smsTypeID !== "") {
          this.sms_service
            .getSMStemplates(
              currentServiceID,
              smsTypeID
            )
            .subscribe(
              (res: any) => {
                if (res !== undefined) {
                  if (res.data.length > 0) {
                    for (let j = 0; j < res.data.length; j++) {
                      if (res.data[j].deleted === false) {
                        sms_template_id = res.data[j].smsTemplateID;
                        break;
                      }
                    }
                  }

                  if (smsTypeID !== "") {
                    const reqObj = {
                      sms_Advice: smsAdvice,
                      phoneNo: phoneNo,
                      // beneficiaryRegID: generated_ben_id,
                      createdBy: this.sessionstorage.getItem('userName'),
                      is1097: false,
                      providerServiceMapID: this.sessionstorage.getItem('providerServiceMapID'),
                      smsTemplateID: sms_template_id,
                      smsTemplateTypeID: smsTypeID
                    };

                    const arr = [];
                    arr.push(reqObj);

                    this.sms_service.sendSMS(arr).subscribe(
                      (ressponse: any) => {
                        console.log(ressponse, "SMS Sent");
                        alert("Sms sent successfully");

                        this.saveVideoCallRequest(this.meetLink, "Initiated");
                      },
                      err => {
                        console.log(err, "SMS not sent Error");
                        alert("SMS not sent");
                      }
                    );
                  }
                }
              },
              err => {
                console.log(err, "Error in fetching sms templates");
              }
            );
        }
      },
      err => {
        console.log(err, "error while fetching sms types");
      }
    );

  }

  private saveVideoCallRequest(meetLink: string, status: string): void {
    const request: VideoCallRequest = {
      dateOfCall: new Date().toISOString(),
      callerPhoneNumber: this.data.callerPhoneNumber,
      agentID: this.data.agentID,
      agentName: this.data.agentName,
      meetingLink: meetLink,
      callStatus: status,
      callDuration: '0',
      providerServiceMapID: this.sessionstorage.getItem('providerServiceMapID'),
      closureRemark: ''
    };

    this.associateAnmMoService.sendLink(request).subscribe({
      next: () => this.SMSStatus = 'SMS Sent Successfully',
      error: () => this.SMSStatus = 'Failed to send SMS'
    });
  }
}
