import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VideoConsultationService {
  constructor(private http: HttpClient) {}

  generaeLink() {
return this.http.post(environment.generateVideoLinkURL, {}); 
 }

  sendLink(reqObj: any) {
    return this.http.post(environment.sendSMSAPI, reqObj); 
  }
}
