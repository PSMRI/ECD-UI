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


import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import * as CryptoJS from 'crypto-js';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

/**
 * KA40094929
 */

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.css']
})
export class SetPasswordComponent implements OnInit {

  hide = true;
  passwordpattern = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,12}$/;
  uname: any;
  encryptedVar: any;
  key: any;
	iv: any;
	SALT = "RandomInitVector";
	Key_IV = "Piramal12Piramal";
	encPassword: any;
	_keySize: any;
	_ivSize: any;
	_iterationCount: any;
	encryptedConfirmPwd : any;
	password:any;  

  // (/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/)


  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private router: Router,
    private loginService: LoginserviceService,
    private sessionstorage: SessionStorageService
  ) { 
    this._keySize = 256;
      this._ivSize = 128;
      this._iterationCount = 1989;
  }

  ngOnInit(): void {
    this.uname = this.sessionstorage.getItem('userName');
  }

  setpasswordform = this.fb.group({
    newPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,12}$/)]],
    confirmPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,12}$/)]],
  });

  get keySize() {
    return this._keySize;
    }
  
    set keySize(value) {
    this._keySize = value;
    }
  
    get iterationCount() {
    return this._iterationCount;
    }
  
  
  
    set iterationCount(value) {
    this._iterationCount = value;
    }
  
  
  
    generateKey(salt:any, passPhrase:any) {
    return CryptoJS.PBKDF2(passPhrase, CryptoJS.enc.Hex.parse(salt), {
      hasher: CryptoJS.algo.SHA512,
      keySize: this.keySize / 32,
      iterations: this._iterationCount
    })
    }
  
  
  
    encryptWithIvSalt(salt:any, iv:any, passPhrase:any, plainText:any) {
    const key = this.generateKey(salt, passPhrase);
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: CryptoJS.enc.Hex.parse(iv)
    });
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    }
  
    encrypt(passPhrase:any, plainText:any) {
    const iv = CryptoJS.lib.WordArray.random(this._ivSize / 8).toString(CryptoJS.enc.Hex);
    const salt = CryptoJS.lib.WordArray.random(this.keySize / 8).toString(CryptoJS.enc.Hex);
    const ciphertext = this.encryptWithIvSalt(salt, iv, passPhrase, plainText);
    return salt + iv + ciphertext;
    }
  updatePassword(){
    if(this.setpasswordform.controls.newPassword.value !== this.setpasswordform.controls.confirmPassword.value){
      this.confirmationService.openDialog('Passwords mismatch', 'error');
    } else {
      const transactionId = this.loginService.transactionId;
      this.password = this.encrypt(this.Key_IV, this.setpasswordform.controls.newPassword.value)
		  this.encryptedConfirmPwd = this.encrypt(this.Key_IV, this.setpasswordform.controls.confirmPassword.value)
      // this.encryptedConfirmPwd = this.encrypt(this.Key_IV, this.setpasswordform.controls.confirmPassword.value);
      const reqObj = {
       userName: this.uname,
       password: this.password,
       transactionId: transactionId,
      }
      this.loginService.updatePassword(reqObj).subscribe((res: any) =>{
        if(res){
          if(res.statusCode === 200){
            this.confirmationService.openDialog("Password changed successfully", 'success');
            this.userLogout();
          } else {
            this.confirmationService.openDialog(res.errorMessage, 'error')
            // this.router.navigate(['/set-password']);
          }
        }
        this.loginService.transactionId = null;
      });
    }
  }

  userLogout(){
    this.loginService.sessionLogout().subscribe((res: any) => {
      if(res.statusCode === 200){
        this.router.navigate(['/login']);
          localStorage.clear();
          sessionStorage.clear();
      }
    });
  }
}
