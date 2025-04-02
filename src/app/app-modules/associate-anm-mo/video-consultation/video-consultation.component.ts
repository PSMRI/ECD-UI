import { Component, Inject} from '@angular/core';
import { VideoConsultationService } from './video-consultation.service';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';


@Component({
  selector: 'app-video-consultation',
  templateUrl: './video-consultation.component.html',
  styleUrls: ['./video-consultation.component.css']
})

export class VideoConsultationComponent {
  // consent: boolean | null = null;
  linkSent: boolean = false;
  linkStatus: string = '';
  receiptConfirmation: string = '';
  callStatus: string = 'Not Initiated';
  linkResend: string = 'Sent'
  videoConsultationAvailable: boolean = false;
  meetLink: string = '';


  constructor(private videoService: VideoConsultationService,
    public dialogRef: MatDialogRef<VideoConsultationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { videoCallPrompt: boolean }
    
  ) {}

  // setConsent(value: boolean) {
  //   data.consent = value;
  // }

  sendLink() {
    this.videoService.sendLink().subscribe((response: any) => {
      console.log(response);
      this.linkSent = true;
      this.linkStatus = 'Sent Successfully';
      this.meetLink = response.meetingLink;
    });
  }

  resendLink() {
    this.videoService.resendLink().subscribe((response: any) => {
      this.linkStatus = 'Sent Successfully';
      this.meetLink = response.meetingLink;
    });
  }

  startConsultation() {
    this.callStatus = 'Ongoing';
    window.open(this.meetLink, '_blank');
    setTimeout(() => { this.callStatus = 'Completed'; }, 5000); // Simulate a video call ending
  }

  endConsultation() {
    this.callStatus = 'Completed';
    this.linkStatus = '';
    this.linkSent = false;
    this.receiptConfirmation = '';
  
    }

  updateReceiptConfirmation(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.receiptConfirmation = target.value;
    if(target.value === 'Not Received') this.linkStatus = 'Not Sent';
  }

  handleConsent(agreed: boolean) {
    if (agreed === true) {
      this.videoConsultationAvailable = true;
      console.log(agreed);
      
    } else
    this.dialogRef.close();
  }
  
}
