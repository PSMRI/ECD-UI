import { Injectable } from '@angular/core';
import { environment } from "../../../../environments/environment";
import { StorageService } from 'ng-cryptostore';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {

  userID:any;
  userName:any;
  username:any;
  fullName:any;
  facilityID:any;
  facilityDetail:any;
  benFlowID:any;
  healthID:any;
  providerServiceID:any;
  services:any;
  SECRET_KEY = environment.encKey;
  uid:any;
  uname:any;
  
  constructor(
    private store:StorageService
  ) {}

  setItem(key: string, value: any): void {  
    this.store.set(key, value, this.SECRET_KEY);
  }

  getItem(key: string): any | null {
    return this.store.get(key, this.SECRET_KEY);
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  clear(): void {
    sessionStorage.clear();
  }

}
