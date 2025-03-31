import { Component, Inject} from '@angular/core';
import { VideoConsultationService } from './video-consultation.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


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
  videoConsultationAvailable: boolean = true;


  constructor(private videoService: VideoConsultationService,
    public dialogRef: MatDialogRef<VideoConsultationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { consent: boolean }
    
  ) {}

  // setConsent(value: boolean) {
  //   data.consent = value;
  // }

  sendLink() {
    this.videoService.sendLink().subscribe(() => {
      this.linkSent = true;
      this.linkStatus = 'Sent Successfully';
    });
  }

  resendLink() {
    this.videoService.resendLink().subscribe(() => {
      this.linkStatus = 'Sent Successfully';
    });
  }

  startConsultation() {
    this.callStatus = 'Ongoing';
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
  
}
