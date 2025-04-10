import { Component, Inject } from '@angular/core';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';


import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';

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

        const smsRequest: VideoCallRequest = {
          dateOfCall: new Date().toISOString(),
          callerPhoneNumber: this.data.callerPhoneNumber,
          agentID: this.data.agentID,
          agentName: this.data.agentName,           
          meetingLink: this.meetLink,
          callStatus: 'Initiated',
          callDuration: '0',              // Initially 0
          providerServiceMapID: this.sessionstorage.getItem('providerServiceMapID'),     
          closureRemark: ''
        };

        this.associateAnmMoService.sendLink(smsRequest).subscribe({
          next: () => {
            this.SMSStatus = 'SMS Sent Successfully';
          },
          error: () => {
            this.SMSStatus = 'Failed to send SMS';
          }
        });
  
      },
      error: () => {
        this.linkStatus = 'Failed to send';
      }
    });
  }
  
  startConsultation() {
    this.callStatus = 'Ongoing';
    this.isMeetAvailable = true;
    // Show snack bar message
  this.snackBar.open('Call has started', 'Close', {
    duration: 3000, // ms
    verticalPosition: 'top',
    panelClass: ['call-started-snackbar'] // Optional custom class
  });
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
}
