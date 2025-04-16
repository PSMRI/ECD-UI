import { Component, Inject, Input, Optional, Output } from '@angular/core';
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
import { map, switchMap } from 'rxjs/operators';

declare var JitsiMeetExternalAPI: any;

interface VideoConsultationDialogData {
  videoCallPrompt: boolean;
  callerPhoneNumber: string;
  agentID: string;
  agentName: string;
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

interface VideocallStatusUpdate {
  meetingLink: string,
  callStatus: string,
  callDuration: string,
  modifiedBy: string
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
  callStartTime: Date | null = null;
  callEndTime: Date | null = null;

  constructor(
    private associateAnmMoService: AssociateAnmMoService,
    private sms_service: SmsTemplateService,
    private loginService: LoginserviceService,
    readonly sessionstorage: SessionStorageService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<VideoConsultationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VideoConsultationDialogData,
  ){} 


  sendOrResendLink(): void {
    this.associateAnmMoService.generateLink().subscribe({
      next: (response: any) => {
        this.linkSent = true;
        this.meetLink = response.meetingLink;
        this.linkStatus = 'Sent Successfully';

        this.send_sms(this.meetLink, "8754969836");
      },
      error: () => {
        this.linkStatus = 'Failed to send';
      }
    });
  }

  startConsultation() {
    this.callStartTime = new Date();

    this.callStatus = 'Ongoing';
    this.isMeetAvailable = true;
    this.snackBar.open('Call has started', 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['snackbar-success']
    });
    
    setTimeout(() => {
      const domain = 'meet.jit.si';
      const options = {
        roomName: this.meetLink.split('/').pop(), // gets the last part of the link
        parentNode: document.querySelector('#jitsi-container'),
        userInfo: {
          displayName: this.sessionstorage.getItem('userName') || 'Agent'
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          disableDeepLinking: true
        }
      };
      const api = new JitsiMeetExternalAPI(domain, options);

      api.addListener('readyToClose', () => { 
        console.log("User disconnected / call ended");
        this.endConsultation(); // Your custom logic
      });
    }, 0);
    this.saveVideoCallRequest(this.meetLink, "Initiated");

  }

  endConsultation(): void {
    this.callStatus = 'Completed';
    this.callEndTime = new Date();

    const callDuration = this.calculateCallDuration();

    const smsRequest: VideocallStatusUpdate = {
      "meetingLink": this.meetLink,
      "callStatus": "COMPLETED",
      "callDuration": callDuration,
      "modifiedBy": this.sessionstorage.getItem('userName')
    };

    this.associateAnmMoService.updateCallStatus(smsRequest).subscribe({
      next: () => {
        this.SMSStatus = 'Call record updated successfully';
      },
      error: () => {
        this.SMSStatus = 'Failed to update call record';
      }
    });

    this.data.videoCallPrompt = false;
    this.dialogRef?.close();

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
      this.dialogRef?.close();
    }
  }

  send_sms(smsAdvice: string, phoneNo: string): void {
    const currentServiceID = this.loginService.currentServiceId;

    this.sms_service.getSMStypes(currentServiceID).pipe(
      map((response: any) => {
        const adviceType = response?.data?.find((type: any) =>
          type.smsType === "Video Consultation"
        );
        return adviceType?.smsTypeID || null;
      }),
      switchMap((smsTypeID: string | null) => {
        if (!smsTypeID) throw new Error("Video Consultation type not found");
        return this.sms_service.getSMStemplates(1714, smsTypeID).pipe(
          map((res: any) => {
            const template = res?.data?.find((tpl: any) => !tpl.deleted);
            return {
              smsTemplateID: template?.smsTemplateID || null,
              smsTemplateTypeID: smsTypeID
            };
          })
        );
      }),
      switchMap(({ smsTemplateID, smsTemplateTypeID }) => {
        if (!smsTemplateID) throw new Error("Valid SMS template not found");

        const reqObj = {
          sms_Advice: smsAdvice,
          phoneNo: phoneNo,
          createdBy: this.sessionstorage.getItem('userName'),
          is1097: false,
          providerServiceMapID: this.sessionstorage.getItem('providerServiceMapID'),
          smsTemplateID,
          smsTemplateTypeID
        };

        return this.sms_service.sendSMS([reqObj]);
      })
    ).subscribe({
      next: (response) => {
        console.log("SMS Sent", response);
        this.snackBar.open('SMS sent successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });
        this.saveVideoCallRequest(this.meetLink, "Initiated");
      },
      error: (err) => {
        console.log("Error sending SMS:", err.message || err);
        this.snackBar.open('SMS not sent', 'Close', {
          duration: 3000, // milliseconds
          verticalPosition: 'top', // or 'bottom'
          panelClass: ['snackbar-error'] // optional: for custom styling
        });
        // alert("SMS not sent");
      }
    });
  }


  saveVideoCallRequest(meetLink: string, status: string) {
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

  calculateCallDuration() {
    if (!this.callStartTime || !this.callEndTime) return '0';

    const diffInMs = this.callEndTime.getTime() - this.callStartTime.getTime();
    const totalSeconds = Math.floor(diffInMs / 1000);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}m ${seconds}s`;
  }
}
