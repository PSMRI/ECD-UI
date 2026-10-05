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
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { FloatingVideoComponent } from './floating-video.component';
import { VideoConsultationService } from '../video-consultation/videoService';

describe('FloatingVideoComponent', () => {
  let component: FloatingVideoComponent;
  let fixture: ComponentFixture<FloatingVideoComponent>;
  let video: VideoConsultationService;
  let jitsiCtor: jasmine.Spy;
  let api: any;

  function create() {
    fixture = TestBed.createComponent(FloatingVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    api = jasmine.createSpyObj('JitsiApi', ['addListener', 'dispose']);
    jitsiCtor = jasmine.createSpy('JitsiMeetExternalAPI').and.callFake(function () { return api; });
    (window as any).JitsiMeetExternalAPI = jitsiCtor;

    await TestBed.configureTestingModule({
      declarations: [FloatingVideoComponent],
      providers: [
        VideoConsultationService,
        { provide: SessionStorageService, useValue: { getItem: () => 'Agent One' } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(FloatingVideoComponent, '<div #floatingWindow style="position:fixed;width:100px;height:50px"><div #jitsiContainer></div></div>')
      .compileComponents();
    video = TestBed.inject(VideoConsultationService);
  });

  afterEach(() => {
    delete (window as any).JitsiMeetExternalAPI;
  });

  it('should not start Jitsi without a meet link', () => {
    create();
    expect(jitsiCtor).not.toHaveBeenCalled();
  });

  it('should start Jitsi in the container using the room from the link', () => {
    video.meetLink = 'https://vc.example/room-42';
    create();
    expect(jitsiCtor).toHaveBeenCalledTimes(1);
    const [domain, opts] = jitsiCtor.calls.mostRecent().args;
    expect(domain).toBe('vc.piramalswasthya.org');
    expect(opts.roomName).toBe('room-42');
    expect(opts.jwt).toBeUndefined();
    expect(opts.parentNode).toBe(component.jitsiContainerRef.nativeElement);
    expect(opts.userInfo.displayName).toBe('Agent One');
    expect(video.apiInitialized).toBeTrue();
    expect(video.jitsiApi).toBe(api);
  });

  it('should prefer the agent room name and JWT when available', () => {
    video.meetLink = 'https://vc.example/room-42';
    video.agentRoomName = 'agent-room';
    video.agentJwt = 'jwt-token';
    create();
    const opts = jitsiCtor.calls.mostRecent().args[1];
    expect(opts.roomName).toBe('agent-room');
    expect(opts.jwt).toBe('jwt-token');
  });

  it('should not start twice when already initialized', () => {
    video.meetLink = 'https://vc.example/room';
    video.apiInitialized = true;
    create();
    expect(jitsiCtor).not.toHaveBeenCalled();
  });

  it('should reset the init flag when Jitsi fails to load', () => {
    video.meetLink = 'https://vc.example/room';
    delete (window as any).JitsiMeetExternalAPI;
    create();
    expect(video.apiInitialized).toBeFalse();
  });

  it('closing from Jitsi should reset the video call', () => {
    video.meetLink = 'https://vc.example/room';
    create();
    const onClose = api.addListener.calls.mostRecent().args[1];
    expect(api.addListener.calls.mostRecent().args[0]).toBe('readyToClose');
    onClose();
    expect(api.dispose).toHaveBeenCalled();
    expect(video.showFloatingVideo).toBeFalse();
  });

  it('dragging should move the window within the viewport', () => {
    create();
    const el: HTMLElement = component.floatingWindowRef.nativeElement;
    spyOn(el, 'getBoundingClientRect').and.returnValue({ left: 0, top: 0 } as DOMRect);
    const down = new MouseEvent('mousedown', { clientX: 10, clientY: 10 });
    component.startDrag(down);
    (component as any).lastMove = 0;
    component.onDrag(new MouseEvent('mousemove', { clientX: 60, clientY: 40 }));
    expect(el.style.left).toBe('50px');
    expect(el.style.top).toBe('30px');
    expect(el.style.right).toBe('auto');
    (component as any).lastMove = 0;
    component.onDrag(new MouseEvent('mousemove', { clientX: -500, clientY: -500 }));
    expect(el.style.left).toBe('0px');
    expect(el.style.top).toBe('0px');
    component.endDrag();
    (component as any).lastMove = 0;
    component.onDrag(new MouseEvent('mousemove', { clientX: 80, clientY: 80 }));
    expect(el.style.left).toBe('0px');
  });

  it('ngOnDestroy should detach drag listeners', () => {
    create();
    spyOn(document, 'removeEventListener').and.callThrough();
    component.ngOnDestroy();
    expect(document.removeEventListener).toHaveBeenCalledWith('mousemove', component.onDrag);
    expect(document.removeEventListener).toHaveBeenCalledWith('mouseup', component.endDrag);
  });
});
