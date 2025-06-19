import {
    Component,
    AfterViewInit,
    ElementRef,
    ViewChild,
    HostListener,
    ChangeDetectionStrategy
  } from '@angular/core';
import { VideoConsultationService } from '../video-consultation/videoService';
  
  declare let JitsiMeetExternalAPI: any;
  
  @Component({
    selector: 'app-floating-video',
    templateUrl: './floating-video.component.html',
    styleUrls: ['./floating-video.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class FloatingVideoComponent implements AfterViewInit {
    @ViewChild('jitsiContainer', { static: true }) jitsiContainerRef!: ElementRef;
    @ViewChild('floatingWindow', { static: true }) floatingWindowRef!: ElementRef;

    private isDragging = false;
    private offsetX = 0;
    private offsetY = 0;
    private lastMove = 0;


    constructor(public videoService: VideoConsultationService) {}
  
    ngAfterViewInit(): void {
      const container = this.jitsiContainerRef?.nativeElement;

      if (!this.videoService.apiInitialized || container?.childElementCount === 0 && this.videoService.meetLink) {
        this.initializeJitsi();
      }
    }

    initializeJitsi(): void {
  
        if (!this.jitsiContainerRef?.nativeElement) {
          console.error('Jitsi container not available');
          return;
        }    
    
        this.videoService.apiInitialized = true; // Add this flag to prevent double init
      
        const domain = 'vc.piramalswasthya.org';
        try {
        const options = {
          roomName: this.videoService.meetLink.split('/').pop(),
          parentNode: this.jitsiContainerRef.nativeElement,
          userInfo: {
            displayName: 'Agent'
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableModeratorIndicator: true,
            serviceUrl: 'wss://vc.piramalswasthya.org/xmpp-websocket',
            enableNoAudioDetection: true,
            enableNoisyMicDetection: true

          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            disableDeepLinking: true,
             SHOW_POWERED_BY: false,
             TOOLBAR_BUTTONS: [
              'microphone', 'recording', 'camera', 'fullscreen',
              'hangup',
              'chat', 'settings', 'raisehand',
              'videoquality'
            ],
          }
        };
      
        const api = new JitsiMeetExternalAPI(domain, options);
        api.addListener('readyToClose', () => this.close());
      } catch (error) {
            console.error('Failed to initialize Jitsi:', error);
            this.videoService.apiInitialized = false;
          }
      }
  
    close(): void {
      this.videoService.resetVideoCall();
    }

    startDrag(event: MouseEvent): void {
      event.preventDefault();
      this.isDragging = true;
  
      const rect = this.floatingWindowRef.nativeElement.getBoundingClientRect();
      this.offsetX = event.clientX - rect.left;
      this.offsetY = event.clientY - rect.top;
  
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.endDrag);
    }
  
    onDrag = (event: MouseEvent) => {
      const now = Date.now();
      if (now - this.lastMove < 16) return; // Throttle to ~60fps
      this.lastMove = now;
    
      if (!this.isDragging) return;
    
      const left = event.clientX - this.offsetX;
      const top = event.clientY - this.offsetY;
    
      const windowElement = this.floatingWindowRef.nativeElement;
      windowElement.style.left = `${left}px`;
      windowElement.style.top = `${top}px`;
      windowElement.style.bottom = 'auto';
      windowElement.style.right = 'auto';
    };
    
  
    endDrag = () => {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.endDrag);
    };

    ngOnDestroy(): void {
        // Clean up any remaining event listeners
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.endDrag);
      
      // Reset the video service if needed
      if (this.videoService.showFloatingVideo) {
        this.videoService.resetVideoCall();
      }
     }
  }
  