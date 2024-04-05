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


import { Injectable } from '@angular/core';
// import { Subject } from 'rxjs/internal/Subject';

// export interface SpinnerState {
//   show: boolean;
// }

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  private loading = false;
  // spinnerSubject = new Subject<SpinnerState>();
  // spinnerState = this.spinnerSubject.asObservable();
  // temp: any = [];

  constructor() {}

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  getLoading(): boolean {
    return this.loading;
  }

  // show() {
  //   this.temp.push(true);
  //   if (this.temp.length == 1)
  //     this.spinnerSubject.next(<SpinnerState>{ show: true });
  // }

  // hide() {
  //   if (this.temp.length > 0) this.temp.pop();

  //   if (this.temp.length == 0)
  //     this.spinnerSubject.next(<SpinnerState>{ show: false });
  // }

  // clear() {
  //   this.temp = [false];
  //   this.hide();
  // }
}
