import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";


@Injectable({ providedIn: 'root' })

export class VideoConsultationService {

private videoStateChange = new BehaviorSubject<{[key: string]: any}>({});
videoStateChange$ = this.videoStateChange.asObservable();

  videoCallPrompt = false;
  videoConsultationAvailable = false;
  linkSent = false;
  linkStatus = '';
  receiptConfirmation = '';
  callStatus: 'Not Initiated' | 'Ongoing' | 'Completed' = 'Not Initiated';
  isMeetAvailable = false;
  meetLink = "";
  SMSStatus = '';
  apiInitialized = false;
  showFloatingVideo = false;
  isVideoCallActive = false; 
  callerPhoneNumber= '';
  agentID= '';
  agentName= '';
  callStartTime: Date | null = null;
  callEndTime: Date | null = null;
  benRegId = ''

  // Add methods if needed to update status or reset
  reset() {
    this.videoCallPrompt = false;
    this.videoConsultationAvailable = false;
    this.linkSent = false;
    this.linkStatus = '';
    this.receiptConfirmation = '';
    this.callStatus = 'Not Initiated';
    this.isMeetAvailable = false;
    this.meetLink = '';
    this.SMSStatus = '';
    this.isVideoCallActive = false; 
    // Notify subscribers of the reset

  this.videoStateChange.next({
    action: 'reset',
    isVideoCallActive: false
  });
}




resetVideoCall() {
    this.showFloatingVideo = false;
    this.apiInitialized = false;
  }

  reinitializeJitsi() {
    this.apiInitialized = false;
    this.isMeetAvailable = true;
  }

  startFloatingCall(link: string) {
    this.meetLink = link;
    this.showFloatingVideo = true;
    this.apiInitialized = false;
  }

  setVideoCallData(isVideoCallActive: boolean, phoneNumber: any, meetLink: any, agentID: any, name: any) {
    this.isVideoCallActive = isVideoCallActive;
    this.callerPhoneNumber = phoneNumber;
    this.meetLink = meetLink;
    this.agentID = agentID;
    this.agentName = name;

    this.videoStateChange.next({
      action: 'setVideoCallData',
      isVideoCallActive
    });
  }

  // Getters
  getIsVideoCallActive() {
    return this.isVideoCallActive;
  }
  getMeetLink() {
    return this.meetLink;
  }
  getAgentId() {
    return this.agentID;
  }
  getAgentName() {
    return this.agentName;
  }
  getCallerPhoneNumber() {
    return this.callerPhoneNumber;
  }

}

