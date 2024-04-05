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


import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-common-dialog',
  templateUrl: './common-dialog.component.html',
  styleUrls: ['./common-dialog.component.css'],
})
export class CommonDialogComponent implements OnInit {
  minutes: any;
  seconds: any;
  timer: any;
  intervalRef: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<CommonDialogComponent>
  ) {}
  @Output() confirm = new EventEmitter<boolean>();

  public title: string = this.data.action;
  public message: string = this.data.message;

  ngOnInit(): void {
    if (this.title === 'sessionTimeOut') {
      this.updateTimer(120);
    }
  }

  updateTimer(timer: any) {
    this.timer = timer;

    if (timer && timer > 0) {
      this.intervalRef = setInterval(() => {
        if (timer === 0) {
          clearInterval(this.intervalRef);
          this.dialog.close({ action: 'timeout' });
        } else {
          this.minutes = timer / 60;
          this.seconds = timer % 60;
          timer--;
          this.timer = timer;
        }
      }, 1000);
    }
  }

  stopTimer() {
    clearInterval(this.intervalRef);
    this.dialog.close({ action: 'cancel', remainingTime: this.timer });
  }

  continueSession() {
    clearInterval(this.intervalRef);
    this.dialog.close({ action: 'continue' });
  }

  onCancel() {
    this.dialog.close(false);
  }

  onConfirm() {
    this.dialog.close(true);
  }
}
