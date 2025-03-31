import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoConsultationService {
  sendLink(): Observable<string> {
    return of('Sent');
  }

  resendLink(): Observable<string> {
    return of('Sent Successfully');
  }
}
