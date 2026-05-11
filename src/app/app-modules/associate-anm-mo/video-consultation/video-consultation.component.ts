import {
  Component, ElementRef, EventEmitter, Input, Output,
  ViewChild
} from '@angular/core';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';
import { SmsTemplateService } from '../../services/smsTemplate/sms-template.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { map, switchMap } from 'rxjs/operators';
import { VideoConsultationService } from './videoService';

interface VideoCallRequest {
  dateOfCall: string;
  callerPhoneNumber: string;
  agentID: string;
  agentName: string;
  meetingLink: string;
  callStatus: string;
  callDuration: string;
  providerServiceMapID: number;
  closureRemark: string;
  beneficiaryRegID:string;
}

interface VideocallStatusUpdate {
  meetingLink: string;
  callStatus: string;
  callDuration: string;
  modifiedBy: string;
  isLinkUsed: boolean;
}

@Component({
  selector: 'app-video-consultation',
  templateUrl: './video-consultation.component.html',
  styleUrls: ['./video-consultation.component.css']
})
export class VideoConsultationComponent {
  @ViewChild('jitsiContainer', { static: false }) jitsiContainerRef!: ElementRef;

  @Output() consultationClosed = new EventEmitter<void>();


  constructor(
    private associateAnmMoService: AssociateAnmMoService,
    private sms_service: SmsTemplateService,
    private loginService: LoginserviceService,
    readonly sessionstorage: SessionStorageService,
    private snackBar: MatSnackBar,
    public videoService: VideoConsultationService,
  ) { }


  sendOrResendLink(): void {
    this.associateAnmMoService.generateLink().subscribe({
      next: (response: any) => {
        this.videoService.linkSent = true;
        this.videoService.meetLink = response.meetingLink;

        // Extract the slug from the meeting link (value after "m=") so we can
        // fetch a moderator JWT for the agent and get the correct room name.
        const slug = response.meetingLink?.split('m=').pop();
        if (slug) {
          this.associateAnmMoService.getAgentToken(
            slug,
            this.videoService.agentName,
            this.sessionstorage.getItem('userEmailID')
          ).subscribe({
            next: (tokenResp: any) => {
              this.videoService.agentRoomName = tokenResp.roomName ?? '';
              this.videoService.agentJwt = tokenResp.jwt ?? '';
            },
            error: () => {
              // Non-fatal: agent can still join, just without moderator role
              console.warn('Could not fetch agent moderator token');
            }
          });
        }

        this.send_sms(this.videoService.meetLink, this.videoService.callerPhoneNumber);
      },
      error: () => {
        this.videoService.linkStatus = 'Not Sent'
      }
    });
  }

  startConsultation(): void {
    this.videoService.callStartTime = new Date();
    this.videoService.callStatus = 'Ongoing';
    this.videoService.isMeetAvailable = true;

    this.videoService.startFloatingCall(this.videoService.meetLink);
    // this.videoService.startFloatingCall("https://vc.piramalswasthya.org/30x656cr")
    this.videoService.showFloatingVideo = true;

    this.snackBar.open('Call has started', 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['snackbar-success']
    });
  }

 endConsultation(): void {
    // Capture meetLink BEFORE any reset
    const meetingLink = this.videoService.meetLink;
    
    this.videoService.callEndTime = new Date();
    this.videoService.callStatus = 'Completed';
    
    const callDuration = this.calculateCallDuration();

    const updateRequest: VideocallStatusUpdate = {
      meetingLink: meetingLink,   // uses captured value, not the reset one
      callStatus: 'COMPLETED',
      callDuration,
      modifiedBy: this.sessionstorage.getItem('userName'),
      isLinkUsed: true,
    };

    this.associateAnmMoService.updateCallStatus(updateRequest).subscribe({
      next: () => {
        this.videoService.SMSStatus = 'Call record updated successfully';
      },
      error: () => {
        this.videoService.SMSStatus = 'Failed to update call record';
      }
    });

    // Reset AFTER the request is built and dispatched
    this.videoService.setVideoCallData(false, '', '', '', '');
    this.videoService.reset();
    this.consultationClosed.emit();
}

  updateReceiptConfirmation(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.videoService.receiptConfirmation = value;

    if (value === 'Not Received') {
      this.videoService.linkStatus = 'Not Sent';
    }
  }

  handleConsent(agreed: boolean): void {
    if (agreed) {
    this.videoService.videoConsultationAvailable = agreed;
    } else {
      // this.endConsultation();
      this.videoService.reset();
      this.consultationClosed.emit()
    }
  }

  send_sms(link: string, phoneNo: string): void {
    const currentServiceID = this.loginService.currentServiceId;

    // Persist the VideoCallParameters row FIRST, then fetch SMS
    // type/template and send the SMS. The backend SMSServiceImpl's
    // "Video Consultation" branch looks up t_videocallparameter by
    // meeting link to render the template, so the row must exist
    // before /sms/sendSMS is invoked - otherwise the backend throws
    // "Video Call Parameters not found for the provided meeting link".
    // (Previously saveVideoCall was only called in the SMS success
    // handler, which meant the row was never written in time.)
    const videoCallRequest: VideoCallRequest = {
      dateOfCall: new Date().toISOString(),
      callerPhoneNumber: this.videoService.callerPhoneNumber,
      agentID: this.videoService.agentID,
      agentName: this.videoService.agentName,
      meetingLink: link,
      callStatus: 'Initiated',
      callDuration: '0',
      providerServiceMapID: this.sessionstorage.getItem('providerServiceMapID'),
      closureRemark: '',
      beneficiaryRegID: this.videoService.benRegId,
    };

    this.associateAnmMoService.saveVideoCall(videoCallRequest).pipe(
      switchMap(() => this.sms_service.getSMStypes(currentServiceID)),
      map((res: any) => res?.data?.find((t: any) => t.smsType === 'Video Consultation')?.smsTypeID),
      switchMap((smsTypeID: string | null) => {
        if (!smsTypeID) throw new Error('Video Consultation type not found');
        return this.sms_service.getSMStemplates(this.sessionstorage.getItem('providerServiceMapID'), smsTypeID).pipe(
          map((res: any) => ({
            smsTemplateID: res?.data?.find((tpl: any) => !tpl.deleted)?.smsTemplateID,
            smsTemplateTypeID: smsTypeID
          }))
        );
      }),
      switchMap(({ smsTemplateID, smsTemplateTypeID }) => {
        if (!smsTemplateID) throw new Error('Valid SMS template not found');
        const reqObj = {
          sms_Advice: link,
          benPhoneNo: phoneNo,
          createdBy: this.sessionstorage.getItem('userName'),
          is1097: false,
          providerServiceMapID: this.sessionstorage.getItem('providerServiceMapID'),
          smsTemplateID,
          smsTemplateTypeID,
          beneficiaryRegID: this.videoService.benRegId,
        };
        return this.sms_service.sendSMS([reqObj]);
      })
    ).subscribe({
      next: () => {
        this.snackBar.open('SMS sent successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });
        this.videoService.linkStatus = 'Sent Successfully';
        this.videoService.SMSStatus = 'SMS Sent Successfully';
      },
      error: (err) => {
        console.error('Error in video consultation send flow:', err);
        this.videoService.linkStatus = 'Not Sent';
        this.videoService.SMSStatus = 'Failed to send SMS';

        this.snackBar.open('SMS not sent', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  saveVideoCallRequest(link: string, status: string): void {
    const request: VideoCallRequest = {
      dateOfCall: new Date().toISOString(),
      callerPhoneNumber: this.videoService.callerPhoneNumber,
      agentID: this.videoService.agentID,
      agentName: this.videoService.agentName,
      meetingLink: link,
      callStatus: status,
      callDuration: '0',
      providerServiceMapID: this.sessionstorage.getItem('providerServiceMapID'),
      closureRemark: '',
      beneficiaryRegID: this.videoService.benRegId,
    };

    this.associateAnmMoService.saveVideoCall(request).subscribe({
      next: () => this.videoService.SMSStatus = 'SMS Sent Successfully',
      error: () => this.videoService.SMSStatus = 'Failed to send SMS'
    });
  }

  calculateCallDuration(): string {
    if (!this.videoService.callStartTime || !this.videoService.callEndTime) return '0';
    const totalSeconds = Math.floor((this.videoService.callEndTime.getTime() - this.videoService.callStartTime.getTime()) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }

}
