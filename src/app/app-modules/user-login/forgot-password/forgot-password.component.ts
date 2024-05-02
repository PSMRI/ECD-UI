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


import { Component, OnInit , Renderer2, Inject, OnDestroy} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
import { DOCUMENT } from '@angular/common';
/**
 * KA40094929
 */

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {

  securityQues: any = [
  ];
  showQuestions = false;
  finalQuesAns= [];
  questionId: any[] = [];
  questions: any[] = [];
  forgotpasswordform!: FormGroup;
  securityquestion: any;
  securityans: any;
  today: number = Date.now();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginserviceService,
    private confirmationService: ConfirmationService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
  ) { }

  ngOnInit() {
    console.log(this.router.url)
    console.log(this.router.url)
    if(this.router.url==='/forgot-password'){
      this.renderer.addClass(this.document.body, 'test');
    }
    this.forgotpasswordform = this.fb.group({
        userName: ['', [Validators.required, Validators.minLength(2)]],
    });
    // for (let i = 0; i < this.securityQues.length; i++) {
    //     this.forgotpasswordform.addControl(`answer${i}`, new FormControl('', Validators.required));
    // };
}
ngOnDestroy(): void {
  this.renderer.removeClass(this.document.body, 'test');
}

  backToLogin(){
    this.router.navigate(['/login']);
  }

  validateUsernameAndGetQuestions(){
    const userNameControl = this.forgotpasswordform.get('userName');
    if (userNameControl) {
      const reqObj = {
        userName: userNameControl.value
      };
      this.loginService.validateUserName(reqObj).subscribe((res: any) => {
        if(res){
          if(res.statusCode === 200){
            if(res.data.SecurityQuesAns.length > 0){
              this.securityQues = res.data.SecurityQuesAns;
              for (let i = 0; i < this.securityQues.length; i++) {
                this.forgotpasswordform.addControl(`answer${i}`, new FormControl('', Validators.required));
              }
              this.showQuestions = true;
            } else {
              this.confirmationService.openDialog("Questions are not set for the user", 'info');
            }
          } else {
            this.confirmationService.openDialog(res.errorMessage, 'error');
          }
        } 
      },
      (err: any) => {
        this.confirmationService.openDialog(err.error, 'error');
      });
    } else {
      console.error('Username control not found in the form');
    }
  }
  

  // validateUsernameAndGetQuestions(){
  //   const reqObj = {
  //     userName: this.forgotpasswordform.get('userName')!.value
  //   }
  //   this.loginService.validateUserName(reqObj).subscribe((res: any) => {
  //     if(res){
  //       if(res.statusCode === 200){
  //         if(res.data.SecurityQuesAns.length > 0){
  //         this.securityQues = res.data.SecurityQuesAns;
  //         for (let i = 0; i < this.securityQues.length; i++) {
  //           this.forgotpasswordform.addControl(`answer${i}`, new FormControl('', Validators.required));
  //         }
  //         this.showQuestions = true;
  //       } else {
  //         this.confirmationService.openDialog("Questions are not set for the user", 'info')
  //       }
  //       }else{
  //         this.confirmationService.openDialog(res.errorMessage, 'error')
  //       }
  //     } else {
  //       this.confirmationService.openDialog(res.errorMessage, 'error')
  //     }
  //   });
  //   (err: any) => {
  //     this.confirmationService.openDialog(err.error, 'error');
  //   }
  // }

  splitQuestionAndQuestionID() {
		console.log('Q n A', this.securityQues);
		for (let i = 0; i < this.securityQues.length; i++) {
			this.questions.push(this.securityQues[i].question);
			this.questionId.push(this.securityQues[i].questionId);
		}
		console.log('questions', this.questions);
		console.log('questionID', this.questionId);
		this.showMyQuestion();
	}

  bufferQuestionId: any;
	bufferQuestion: any;
	counter = 0;

	showMyQuestion() {
		console.log('this is question' + (this.counter + 1));
		this.bufferQuestion = this.questions[this.counter];
		this.bufferQuestionId = this.questionId[this.counter];
	}

  validateSecurityAnswers(){
    const questionAnswers: any[] = [];
    this.securityQues.forEach((question:any,i:any) => {
        const answer = this.forgotpasswordform.get(`answer${i}`)?.value || ''; 
        questionAnswers.push({questionId: question.questionId, answer: answer});
    });
    const reqObj = { 
      SecurityQuesAns: questionAnswers,
      userName: this.forgotpasswordform.get('userName')?.value || ''
    }
    console.log(reqObj);
    this.loginService.validateAnswers(reqObj).subscribe((res:any) => {
      if(res !== undefined && res !== null && res.statusCode === 200){
        if(res.data !== undefined && res.data !== null){
          this.loginService.transactionId = res.data.transactionId;
          this.router.navigate(['/set-password']);
        }else {
          this.confirmationService.openDialog(res.errorMessage, 'error')
        }
      } else {
        this.confirmationService.openDialog(res.errorMessage, 'error')
      }
    });
  }

  routeToSetPassword(){
    this.router.navigate(['/set-password']);
  }

}