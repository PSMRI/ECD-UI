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
        
        
        this.saveVideoCallRequest(response.meetingLink, 'Initiated');
        this.send_sms(this.videoService.meetLink, this.videoService.callerPhoneNumber);
      },
      error: () => {
        this.videoService.linkStatus = 'Failed to send'
      }
    });
  }

  startConsultation(): void {
    this.videoService.callStartTime = new Date();
    this.videoService.callStatus = 'Ongoing';
    this.videoService.isMeetAvailable = true;

    this.videoService.startFloatingCall(this.videoService.meetLink);
    this.videoService.showFloatingVideo = true;

    this.snackBar.open('Call has started', 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['snackbar-success']
    });

    this.saveVideoCallRequest(this.videoService.meetLink, 'Initiated');
  }

  endConsultation(): void {
    this.videoService.callEndTime = new Date();
    this.videoService.callStatus = 'Completed';
    this.videoService.setVideoCallData(
      false, '', '', '', '')
    const callDuration = this.calculateCallDuration();

    const updateRequest: VideocallStatusUpdate = {
      meetingLink: this.videoService.meetLink,
      callStatus: 'COMPLETED',
      callDuration,
      modifiedBy: this.sessionstorage.getItem('userName')
    };

    this.associateAnmMoService.updateCallStatus(updateRequest).subscribe({
      next: () => {
        this.videoService.SMSStatus = 'Call record updated successfully';
      },
      error: () => {
        this.videoService.SMSStatus = 'Failed to update call record';
      }
    });

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
    this.videoService.videoConsultationAvailable = agreed;
  }

  send_sms(link: string, phoneNo: string): void {
    const currentServiceID = this.loginService.currentServiceId;

    this.sms_service.getSMStypes(currentServiceID).pipe(
      map((res: any) => res?.data?.find((t: any) => t.smsType === 'Video Consultation')?.smsTypeID),
      switchMap((smsTypeID: string | null) => {
        if (!smsTypeID) throw new Error('Video Consultation type not found');
        return this.sms_service.getSMStemplates(currentServiceID, smsTypeID).pipe(
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
          phoneNo,
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
        // this.saveVideoCallRequest(link, 'Initiated');
        this.videoService.linkStatus = 'Sent Successfully';
      },
      error: (err) => {
        console.error('Error sending SMS:', err);
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
