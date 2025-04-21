import {
    Component,
    AfterViewInit,
    ElementRef,
    ViewChild
  } from '@angular/core';
import { VideoConsultationService } from '../video-consultation/videoService';
  
  declare var JitsiMeetExternalAPI: any;
  
  @Component({
    selector: 'app-floating-video',
    templateUrl: './floating-video.component.html',
    styleUrls: ['./floating-video.component.css']
  })
  export class FloatingVideoComponent implements AfterViewInit {
    @ViewChild('jitsiContainer', { static: true }) jitsiContainerRef!: ElementRef;
  
    constructor(public videoService: VideoConsultationService) {}
  
    ngAfterViewInit(): void {
      const container = this.jitsiContainerRef?.nativeElement;

      if (!this.videoService.apiInitialized || container?.childElementCount === 0 && this.videoService.meetLink) {
        this.initializeJitsi();
      }
    }

    initializeJitsi(): void {
        console.error('Initializing Jitsi in:', this.jitsiContainerRef?.nativeElement);
    
        if (!this.jitsiContainerRef?.nativeElement) {
          console.error('Jitsi container not available');
          return;
        }    
    
        this.videoService.apiInitialized = true; // Add this flag to prevent double init
      
        const domain = 'meet.jit.si';
        const options = {
          roomName: this.videoService.meetLink.split('/').pop(),
          parentNode: this.jitsiContainerRef.nativeElement,
          // parentNode: document.querySelector('#jitsi-container'),
          userInfo: {
            displayName: 'Agent'
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableModeratorIndicator: true
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            disableDeepLinking: true
          }
        };
      
        const api = new JitsiMeetExternalAPI(domain, options);
        api.addListener('readyToClose', () => this.close());
      }
  
    close(): void {
      this.videoService.reset();
    }
  }
  