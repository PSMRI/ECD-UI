/* 
* AMRIT – Accessible Medical Records via Integrated Technology 
* Integrated EHR (Electronic Health Records) Solution 
*
* Copyright (C) "Piramal Swasthya Management and Research Institute" 
*
* This file is part of AMRIT.
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see https://www.gnu.org/licenses/.
*/


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

import { VideoConsultationComponent } from './video-consultation.component';
import { VideoConsultationService } from './videoService';
import { AssociateAnmMoService } from '../../services/associate-anm-mo/associate-anm-mo.service';
import { SmsTemplateService } from '../../services/smsTemplate/sms-template.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';

describe('VideoConsultationComponent', () => {
  let component: VideoConsultationComponent;
  let fixture: ComponentFixture<VideoConsultationComponent>;
  let associate: jasmine.SpyObj<AssociateAnmMoService>;
  let sms: jasmine.SpyObj<SmsTemplateService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let video: any;
  const session: any = { providerServiceMapID: 4, userName: 'agent1', userEmailID: 'a@b.org' };
  const LINK = 'https://meet.example/v?m=room-123';

  beforeEach(async () => {
    associate = jasmine.createSpyObj('AssociateAnmMoService', ['generateLink', 'getAgentToken', 'updateCallStatus', 'saveVideoCall']);
    sms = jasmine.createSpyObj('SmsTemplateService', ['getSMStypes', 'getSMStemplates', 'sendSMS']);
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    video = {
      agentName: 'Agent One',
      agentID: 1001,
      callerPhoneNumber: '9999999999',
      benRegId: 77,
      startFloatingCall: jasmine.createSpy('startFloatingCall'),
      setVideoCallData: jasmine.createSpy('setVideoCallData'),
      reset: jasmine.createSpy('reset'),
    };
    associate.saveVideoCall.and.returnValue(of({}));
    sms.getSMStypes.and.returnValue(of({ data: [{ smsType: 'Other', smsTypeID: 1 }, { smsType: 'Video Consultation', smsTypeID: 5 }] }));
    sms.getSMStemplates.and.returnValue(of({ data: [{ smsTemplateID: 8, deleted: true }, { smsTemplateID: 9, deleted: false }] }));
    sms.sendSMS.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      declarations: [VideoConsultationComponent],
      providers: [
        { provide: AssociateAnmMoService, useValue: associate },
        { provide: SmsTemplateService, useValue: sms },
        { provide: LoginserviceService, useValue: { currentServiceId: 3 } },
        { provide: SessionStorageService, useValue: { getItem: (k: string) => session[k] } },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: VideoConsultationService, useValue: video },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(VideoConsultationComponent, '')
      .compileComponents();
    spyOn(console, 'warn');
    spyOn(console, 'error');
    fixture = TestBed.createComponent(VideoConsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('sendOrResendLink', () => {
    it('stores the link and moderator token and sends the SMS', () => {
      associate.generateLink.and.returnValue(of({ meetingLink: LINK }));
      associate.getAgentToken.and.returnValue(of({ roomName: 'room-123', jwt: 'jwt' }));
      spyOn(component, 'send_sms');
      component.sendOrResendLink();
      expect(video.linkSent).toBeTrue();
      expect(video.meetLink).toBe(LINK);
      expect(associate.getAgentToken).toHaveBeenCalledWith('room-123', 'Agent One', 'a@b.org');
      expect(video.agentRoomName).toBe('room-123');
      expect(video.agentJwt).toBe('jwt');
      expect(component.send_sms).toHaveBeenCalledWith(LINK, '9999999999');
    });

    it('defaults missing token fields and tolerates token errors', () => {
      associate.generateLink.and.returnValue(of({ meetingLink: LINK }));
      associate.getAgentToken.and.returnValue(of({}));
      spyOn(component, 'send_sms');
      component.sendOrResendLink();
      expect(video.agentRoomName).toBe('');
      expect(video.agentJwt).toBe('');
      associate.getAgentToken.and.returnValue(throwError(() => 'down'));
      component.sendOrResendLink();
      expect(console.warn).toHaveBeenCalled();
    });

    it('marks the link not sent when generation fails', () => {
      associate.generateLink.and.returnValue(throwError(() => 'down'));
      component.sendOrResendLink();
      expect(video.linkStatus).toBe('Not Sent');
    });
  });

  describe('send_sms', () => {
    it('saves the call and sends the video consultation SMS', () => {
      component.send_sms(LINK, '9999999999');
      expect(associate.saveVideoCall).toHaveBeenCalledWith(
        jasmine.objectContaining({
          callerPhoneNumber: '9999999999',
          agentID: 1001,
          agentName: 'Agent One',
          meetingLink: LINK,
          callStatus: 'Initiated',
          callDuration: '0',
          providerServiceMapID: 4,
          beneficiaryRegID: 77,
        }),
      );
      expect(sms.getSMStypes).toHaveBeenCalledWith(3);
      expect(sms.getSMStemplates).toHaveBeenCalledWith(4, 5 as any);
      expect(sms.sendSMS).toHaveBeenCalledWith([
        {
          sms_Advice: LINK,
          benPhoneNo: '9999999999',
          createdBy: 'agent1',
          is1097: false,
          providerServiceMapID: 4,
          smsTemplateID: 9,
          smsTemplateTypeID: 5,
          beneficiaryRegID: 77,
        },
      ]);
      expect(video.linkStatus).toBe('Sent Successfully');
      expect(video.SMSStatus).toBe('SMS Sent Successfully');
      expect(snackBar.open).toHaveBeenCalledWith('SMS sent successfully', 'Close', jasmine.any(Object));
    });

    it('fails without a video consultation SMS type', () => {
      sms.getSMStypes.and.returnValue(of({ data: [] }));
      component.send_sms(LINK, '1');
      expect(sms.getSMStemplates).not.toHaveBeenCalled();
      expect(video.linkStatus).toBe('Not Sent');
      expect(video.SMSStatus).toBe('Failed to send SMS');
      expect(snackBar.open).toHaveBeenCalledWith('SMS not sent', 'Close', jasmine.any(Object));
    });

    it('fails without an active template', () => {
      sms.getSMStemplates.and.returnValue(of({ data: [{ smsTemplateID: 8, deleted: true }] }));
      component.send_sms(LINK, '1');
      expect(sms.sendSMS).not.toHaveBeenCalled();
      expect(video.linkStatus).toBe('Not Sent');
    });
  });

  it('startConsultation starts the floating call', () => {
    video.meetLink = LINK;
    component.startConsultation();
    expect(video.callStartTime).toEqual(jasmine.any(Date));
    expect(video.callStatus).toBe('Ongoing');
    expect(video.isMeetAvailable).toBeTrue();
    expect(video.startFloatingCall).toHaveBeenCalledWith(LINK);
    expect(video.showFloatingVideo).toBeTrue();
    expect(snackBar.open).toHaveBeenCalledWith('Call has started', 'Close', jasmine.any(Object));
  });

  describe('endConsultation', () => {
    beforeEach(() => {
      video.meetLink = LINK;
      video.callStartTime = new Date(Date.now() - 125000);
      spyOn(component.consultationClosed, 'emit');
    });

    it('records the call, resets the service and closes', () => {
      associate.updateCallStatus.and.returnValue(of({}));
      component.endConsultation();
      const req: any = associate.updateCallStatus.calls.mostRecent().args[0];
      expect(req).toEqual(
        jasmine.objectContaining({ meetingLink: LINK, callStatus: 'COMPLETED', modifiedBy: 'agent1', isLinkUsed: true }),
      );
      expect(req.callDuration).toMatch(/^2m \d+s$/);
      expect(video.callStatus).toBe('Completed');
      expect(video.SMSStatus).toBe('Call record updated successfully');
      expect(video.setVideoCallData).toHaveBeenCalledWith(false, '', '', '', '');
      expect(video.reset).toHaveBeenCalled();
      expect(component.consultationClosed.emit).toHaveBeenCalled();
    });

    it('reports a failed update', () => {
      associate.updateCallStatus.and.returnValue(throwError(() => 'down'));
      component.endConsultation();
      expect(video.SMSStatus).toBe('Failed to update call record');
    });
  });

  it('calculateCallDuration is 0 without both times', () => {
    video.callStartTime = undefined;
    video.callEndTime = new Date();
    expect(component.calculateCallDuration()).toBe('0');
  });

  it('updateReceiptConfirmation resets the link status when not received', () => {
    component.updateReceiptConfirmation({ target: { value: 'Received' } } as any);
    expect(video.receiptConfirmation).toBe('Received');
    expect(video.linkStatus).toBeUndefined();
    component.updateReceiptConfirmation({ target: { value: 'Not Received' } } as any);
    expect(video.linkStatus).toBe('Not Sent');
  });

  describe('handleConsent', () => {
    it('enables the consultation on agreement', () => {
      component.handleConsent(true);
      expect(video.videoConsultationAvailable).toBeTrue();
    });

    it('resets and closes on refusal', () => {
      spyOn(component.consultationClosed, 'emit');
      component.handleConsent(false);
      expect(video.reset).toHaveBeenCalled();
      expect(component.consultationClosed.emit).toHaveBeenCalled();
    });
  });

  it('saveVideoCallRequest records the call status', () => {
    component.saveVideoCallRequest(LINK, 'Missed');
    expect(associate.saveVideoCall).toHaveBeenCalledWith(jasmine.objectContaining({ meetingLink: LINK, callStatus: 'Missed' }));
    expect(video.SMSStatus).toBe('SMS Sent Successfully');
    associate.saveVideoCall.and.returnValue(throwError(() => 'down'));
    component.saveVideoCallRequest(LINK, 'Missed');
    expect(video.SMSStatus).toBe('Failed to send SMS');
  });
});
