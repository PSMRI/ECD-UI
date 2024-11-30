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
import { SessionStorageService } from 'src/app/app-modules/services/core/session-storage.service';

@Component({
  selector: 'app-set-security-questions',
  templateUrl: './set-security-questions.component.html',
  styleUrls: ['./set-security-questions.component.css']
})
export class SetSecurityQuestionsComponent implements OnInit {
  
  answers: {[key: string]: string} = {};
  questions:any[] = [];
  questionSection = true;
  passwordSection = false;
  selectedQuestions : any;
  filteredQuestions:any[] = [];
  filteredQuestions2: any[] = [];
  filteredQuestions3: any[] = [];
  dataArray :any[] = [];
  hide = true;
  passwordpattern = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,12}$/;
  uname: any;
  confirmPassword: any;
  newPassword: any;
  

 
  constructor(
    public loginService: LoginserviceService, 
    private router : Router,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    readonly sessionstorage:SessionStorageService,
  ) { }

  ngOnInit(): void {
  this.getSecurityQuestions();
  this.filteredQuestions = this.questions;
  this.filteredQuestions2 = this.questions;
  this.filteredQuestions3 = this.questions;
  this.uname = this.sessionstorage.userName;
  }
  
 getSecurityQuestions(){
  this.loginService.getData().subscribe((res:any)=>{
    if(res.data !== undefined && res.data !== null &&  res.statusCode === 200 ){
      this.questions = res.data;
    }
  })
 }
 

questionSelected1(selectedValue: number) {
  this.filteredQuestions = this.questions.filter(question => question.QuestionID !== selectedValue);
  this.filteredQuestions2 = this.filteredQuestions;
  this.filteredQuestions3 = this.filteredQuestions;
}

questionSelected2(selectedValue: number) {
  this.filteredQuestions2 = this.filteredQuestions.filter(question => question.QuestionID !== selectedValue);
  this.filteredQuestions3 = this.filteredQuestions2;
}

questionSelected3(selectedValue: number) {
  this.filteredQuestions3 = this.filteredQuestions2.filter(question => question.QuestionID !== selectedValue);
}

setpasswordform = this.fb.group({
  newPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,12}$/)]],
  confirmPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,12}$/)]],
});

questionForm = this.fb.group({
  question1: ['', Validators.required],
  answer1: ['', Validators.required],
  question2: ['', Validators.required],
  answer2: ['', Validators.required],
  question3: ['', Validators.required],
  answer3: ['', Validators.required],
});


setSecurityQuestions(){
  this.dataArray = [
    {
      'userID': this.sessionstorage.userID,
      'questionID': this.questionForm.controls.question1.value,
      'answers': ((this.questionForm.controls.answer1.value !== null && this.questionForm.controls.answer1.value !== undefined) ? this.questionForm.controls.answer1.value.trim() : ''),
      'mobileNumber': '1234567890',
      'createdBy': this.uname
    },
    {
      'userID': this.sessionstorage.userID,
      'questionID': this.questionForm.controls.question2.value,
      'answers': ((this.questionForm.controls.answer2.value !== null && this.questionForm.controls.answer2.value !== undefined) ? this.questionForm.controls.answer2.value.trim() : ''),
      'mobileNumber': '1234567890',
      'createdBy': this.uname
    },
    {
      'userID': this.sessionstorage.userID,
      'questionID': this.questionForm.controls.question3.value,
      'answers': ((this.questionForm.controls.answer3.value !== null && this.questionForm.controls.answer3.value !== undefined) ? this.questionForm.controls.answer3.value.trim() : ''),
      'mobileNumber': '1234567890',
      'createdBy': this.uname
    }];
    this.updatePassword();
}


updatePassword(){
    this.loginService.saveSecurityQuesAns(this.dataArray).subscribe((res:any)=>{
      if(res.statuscode === 200){
        if(res.data !== undefined && res.data !== null){
          this.loginService.transactionId = res.data.transactionId;
          this.router.navigate(['/set-password']);
        }
      }
      else{
        this.confirmationService.openDialog(res.errorMessage, 'error')
      }
    })
    
  }

}




