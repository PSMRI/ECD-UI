import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })

export class VideoConsultationService {

  videoCallPrompt = false;
  videoConsultationAvailable = false;
  linkSent = false;
  linkStatus = 'Sent Successfully';
  receiptConfirmation: string = '';
  callStatus: 'Not Initiated' | 'Ongoing' | 'Completed' = 'Not Initiated';
  isMeetAvailable = false;
  meetLink = "https://meet.jit.si/oIYoMJbO";
  SMSStatus = '';
  apiInitialized = false;
  showFloatingVideo = false;
  isVideoCallActive = false; 
  callerPhoneNumber= '';
  agentID= '';
  agentName= '';
  callStartTime: Date | null = null;
  callEndTime: Date | null = null;

  // Add methods if needed to update status or reset
  reset() {
    console.error("Resetting video consultation service");
    this.videoCallPrompt = false;
    this.videoConsultationAvailable = false;
    this.linkSent = false;
    this.linkStatus = 'NOT Sent';
    this.receiptConfirmation = '';
    this.callStatus = 'Not Initiated';
    this.isMeetAvailable = false;
    this.meetLink = '';
    this.SMSStatus = '';
    this.isVideoCallActive = false; 
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

  setVideoCallData(isVideoCallActive: boolean, phoneNumber:any, meetLink: any, agentID: any, name: any) {
    this.isVideoCallActive = isVideoCallActive;
    this.callerPhoneNumber = phoneNumber;
    this.meetLink = meetLink;
    this.agentID = agentID;
    this.agentName = name;
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

