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

import { TestBed } from '@angular/core/testing';
import { VideoConsultationService } from './videoService';

describe('VideoConsultationService', () => {
  let service: VideoConsultationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoConsultationService);
  });

  it('should start with no active call', () => {
    expect(service.callStatus).toBe('Not Initiated');
    expect(service.getIsVideoCallActive()).toBeFalse();
    expect(service.getMeetLink()).toBe('');
  });

  it('setVideoCallData should store call details and emit a state change', () => {
    const events: any[] = [];
    service.videoStateChange$.subscribe((e) => events.push(e));
    service.setVideoCallData(true, '9876543210', 'http://meet/room', 'A-1', 'Agent One');
    expect(service.getIsVideoCallActive()).toBeTrue();
    expect(service.getCallerPhoneNumber()).toBe('9876543210');
    expect(service.getMeetLink()).toBe('http://meet/room');
    expect(service.getAgentId()).toBe('A-1');
    expect(service.getAgentName()).toBe('Agent One');
    expect(events).toEqual([{}, { action: 'setVideoCallData', isVideoCallActive: true }]);
  });

  it('reset should clear call state and emit a reset event', () => {
    const events: any[] = [];
    service.setVideoCallData(true, 'p', 'l', 'a', 'n');
    service.linkSent = true;
    service.callStatus = 'Ongoing';
    service.videoStateChange$.subscribe((e) => events.push(e));
    service.reset();
    expect(service.linkSent).toBeFalse();
    expect(service.callStatus).toBe('Not Initiated');
    expect(service.meetLink).toBe('');
    expect(service.isVideoCallActive).toBeFalse();
    expect(events.pop()).toEqual({ action: 'reset', isVideoCallActive: false });
  });

  it('resetVideoCall should dispose the Jitsi API and hide the floating window', () => {
    const api = jasmine.createSpyObj('jitsi', ['dispose']);
    service.jitsiApi = api;
    service.showFloatingVideo = true;
    service.apiInitialized = true;
    service.resetVideoCall();
    expect(api.dispose).toHaveBeenCalled();
    expect(service.jitsiApi).toBeNull();
    expect(service.showFloatingVideo).toBeFalse();
    expect(service.apiInitialized).toBeFalse();
  });

  it('resetVideoCall should swallow dispose errors', () => {
    service.jitsiApi = { dispose: () => { throw new Error('boom'); } };
    expect(() => service.resetVideoCall()).not.toThrow();
    expect(service.jitsiApi).toBeNull();
  });

  it('startFloatingCall and reinitializeJitsi should prepare a new session', () => {
    service.apiInitialized = true;
    service.startFloatingCall('http://meet/x');
    expect(service.meetLink).toBe('http://meet/x');
    expect(service.showFloatingVideo).toBeTrue();
    expect(service.apiInitialized).toBeFalse();
    service.reinitializeJitsi();
    expect(service.isMeetAvailable).toBeTrue();
  });
});
