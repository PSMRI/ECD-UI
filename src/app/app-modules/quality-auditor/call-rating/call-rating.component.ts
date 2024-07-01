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


import { X } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService } from '../../services/confirmation/confirmation.service';
import { QualityAuditorService } from '../../services/quality-auditor/quality-auditor.service';
import { SetLanguageService } from '../../services/set-language/set-language.service';
import { CallAuditComponent } from '../call-audit/call-audit/call-audit.component';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-call-rating',
  templateUrl: './call-rating.component.html',
  styleUrls: ['./call-rating.component.css']
})
export class CallRatingComponent implements OnInit{

  @Input()
  public data: any;

  currentLanguageSet: any;
  routedData: any;
  displayedColumns = ['questionnaire', 'optionsQuestionnaire', 'scoreQuestionaire'];
  displayRows = ['finalScore']
  answer: any;
  finalScore = 0;
  callRemarks: any;
  
  callAuditData = new MatTableDataSource();
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  sections: any = [];
  uniqueSectionId: any;
  grades: any;
  finalGrade: any;
  benCallId: any;
  auditType: any;
  filteredRatingQuestions: any = [];
  audioResponse: any = " ";
  ratingId: any;
  showCallAuditForm  = false;
  ratedQuestions: any =[];
  enableUpdateButton = false;
  totalScore = 0; // Variable to store the total score
  finalScorePercentage = 0;

  ratingQuestions: any = [];

  constructor(
    private setLanguageService: SetLanguageService,
    private fb: FormBuilder,
    private qualityAuditorService: QualityAuditorService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getQualityGrades();
    if(this.data !== undefined && this.data !== null){
      this.routedData = this.data.data;
      this.benCallId = this.routedData.benCallID;
      this.auditType = this.data.type;
    }
    this.getSectionQuestions();
    this.getCallRecording();
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  getCallRecording() {

    const reqObj = {
      "agentID" : this.routedData.agentid,
      // "callID" : "1681876041.2000000000"
      "callID" : this.routedData.callId
    }
    this.qualityAuditorService.getCallRecording(reqObj).subscribe((res: any) => {
      if(res && res.statusCode === 200 && res.data && res.data.response){
        this.audioResponse = res.data.response;
     
      } 
    },
    (err: any) => {
      this.confirmationService.openDialog(err.error, 'error');
    }
    );

  }
  getQualityGrades(){
    const psmId = sessionStorage.getItem('providerServiceMapID');
    this.qualityAuditorService.getQualityAuditGrades(psmId).subscribe((res: any) => {
      if(res && res.length > 0){
        this.grades = res;
      } else {
        console.log("no grades found");
      }
    },
    (err: any) => {
      this.confirmationService.openDialog(err.error, 'error');
    }
    );
  }

  getBenCallRatings(){
    const benCallId = this.routedData.benCallID;
    this.qualityAuditorService.getBenCallRatings(benCallId).subscribe((res: any) => {
      if(res && res.qualityQuestionResponse?.length > 0){
        this.ratedQuestions = res.qualityQuestionResponse;
        this.ratingId = res.qualityRating.id;
        this.callRemarks = res.qualityRating.callRemarks;
        this.finalScore = res.qualityRating.finalScore;
        this.finalGrade = res.qualityRating.finalGrade;
        this.mapOptionsForQuestions();
      } else {
        this.ratedQuestions = []
        this.confirmationService.openDialog(this.currentLanguageSet.issueInGettingBenCallRatings, 'error');
      }
    }, (err : any) => {
      if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
      else
      this.confirmationService.openDialog(err.title + err.detail, 'error')
      });
  }

  getSectionQuestions(){
    const psmId = sessionStorage.getItem('providerServiceMapID');
    this.qualityAuditorService.getQuesSecForCallRatings(psmId).subscribe((res: any) => {
      if(res && res.length > 0){
        this.ratingQuestions = res;
        if(this.auditType === "callAudit"){
        this.filterQuestionsForRatings();
        } else{
          this.getBenCallRatings();
        }
      } else {
        this.ratingQuestions = []
        this.confirmationService.openDialog(this.currentLanguageSet.noQuestionsMappedForRatingCall, 'info');
      }
    }, (err : any) => {
      if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
      else
      this.confirmationService.openDialog(err.title + err.detail, 'error')
      });
  }

  mapOptionsForQuestions(){
    this.ratedQuestions.forEach((answeredQuestion: any, i: number) => {
    this.ratingQuestions.forEach((element: any) => {
      if(answeredQuestion.questionId === element.questionId){
        this.ratedQuestions[i].options = element.options,
        this.ratedQuestions[i].isFatalQues = element.isFatalQues
      }
    });
  });
  this.filterRatedQuestions();
  this.calculateScoreForAllSectionsForEdit();
  }

  calculateScoreForAllSectionsForEdit() {
    this.filteredRatingQuestions.forEach((section: any) => {
      section.questions.forEach((question: any) => {
      this.calculateScore(question, section);
      });
    });
  }

  filterQuestions(){
    let questionsArray: any = [];
    const sectionNames = this.ratingQuestions.map((item: any) => item.sectionName);
    this.uniqueSectionId = new Set(sectionNames);
    this.uniqueSectionId.forEach((item: any) => {
      questionsArray = [];
      this.ratingQuestions.filter((value: any) => {
        if(item === value.sectionName){
          questionsArray.push({questionId: value.questionId, question: value.question, answer: '', score: null})
        }
      });
      this.sections.push({sectionName: item, sectionId: item.sectionId,  questions: questionsArray, finalScore: 0});
    });
    console.log("FinalData", this.sections);
  }

  filterQuestionsForRatings(){
    this.filteredRatingQuestions = this.ratingQuestions.reduce((acc: { sectionId: number; sectionName: string; sectionRank: number; questions: any[] }[], curr: any) => {
      const existingSection = acc.find(section => section.sectionRank === curr.sectionRank);
  
      if (existingSection) {
        existingSection.questions.push(curr);
      } else {
        acc.push({
          sectionId: curr.sectionId,
          sectionName: curr.sectionName,
          sectionRank: curr.sectionRank,
          questions: [{...curr, answer: null}]
        });
      }
  
      return acc;
      }, []).sort((a: { sectionRank: number; }, b: { sectionRank: number; }) => a.sectionRank - b.sectionRank)
      .map((section: any) => ({
        ...section,
        questions: section.questions.sort((a: { questionRank: number; }, b: { questionRank: number; }) => a.questionRank - b.questionRank)
      }));
      console.log("filtered data", this.filteredRatingQuestions);
  }
  
  filterRatedQuestions(){
    this.filteredRatingQuestions = this.ratedQuestions.reduce((acc: { sectionId: number; sectionName: string; sectionRank: number; questions: any[] }[], curr: any) => {
      const existingSection = acc.find(section => section.sectionRank === curr.sectionRank);
  
      if (existingSection) {
        existingSection.questions.push(curr);
      } else {
        acc.push({
          sectionId: curr.sectionId,
          sectionName: curr.sectionName,
          sectionRank: curr.sectionRank,
          questions: [{...curr}]
        });
      }
      return acc;
      }, []).sort((a: { sectionRank: number; }, b: { sectionRank: number; }) => a.sectionRank - b.sectionRank)
      .map((section: any) => ({
        ...section,
        questions: section.questions.sort((a: { questionRank: number; }, b: { questionRank: number; }) => a.questionRank - b.questionRank)
      }));
      console.log("filtered data", this.filteredRatingQuestions);
  }

  calculateScore(element: any, section: any) {
    // Find the selected option
    const selectedOption = element.options.find(
      (option: { option: any; }) => option.option === element.answer
    );
    element.score = selectedOption.score;
    // Calculate the total score for the section
    section.totalScore = section.questions.reduce(
      (total: any, question: { score: any; }) => total + (question.score || 0),
      0
    );

    const isZeroCall = this.checkIfZeroCall();
    // Calculate final score
    if(isZeroCall) {
      this.finalScore = 0;
      this.finalScorePercentage = 0;
    } else {
    // Calculate final score
    this.finalScore = this.filteredRatingQuestions.reduce(
      (total: any, section: { totalScore: any; }) => total + (section.totalScore || 0),
      0
    );
    this.calculateFinalScorePercentage();
    // this.getFinalGrade();
    }
    this.getFinalGrade();
  }
  
  calculateFinalScorePercentage() {
    const highestScoresSum = this.filteredRatingQuestions.reduce(
      (total: number, section: any) => {
        const sectionHighestScore = section.questions.reduce(
          (highestScore: number, question: any) => {
            const questionHighestScore = Math.max(...question.options.map((option: any) => option.score));
            return highestScore + questionHighestScore;
          },
          0
        );
        return total + sectionHighestScore;
      },
      0
    );

    // Check if any question in this section is fatal and answered "no"
    const isZeroCallPercentage = this.filteredRatingQuestions.some((section: any) => {
      return section.questions.some((question: any) => {
        if(question.answer !== null && question.answer !== undefined)
        return question.isFatalQues && question.answer.toLowerCase() === "no";
      });
    });

    if(isZeroCallPercentage) {
      this.finalScorePercentage = 0;
    } else {
    this.finalScorePercentage = (this.finalScore / highestScoresSum) * 100;
    }
  }
  
  getFinalGrade() {
    let foundGrade = false;
    this.grades.forEach((item: any) => {
      if (this.finalScore >= item.minValue && this.finalScore <= item.maxValue) {
        this.finalGrade = item.grade;
        foundGrade = true;
      }
    });
    if (!foundGrade) {
      this.finalGrade = null;
    }
  }

  // enable update on change of call remarks
  enableUpdate(){
    this.enableUpdateButton = true;
  }
  checkIfValidSubmit(){
    const ratingData = [...this.filteredRatingQuestions];
    // return ratingData.every(item => item.questions.every((question: any) => question.score && question.answer && question.score !== '' && question.answer !== ''));
      return this.filteredRatingQuestions.every((questionnaire: any) => {
        return questionnaire.questions.every((question: any) => {
          return question.answer && question.score !== '' && question.answer && question.answer !== '';
        });
      });
    }

    checkIfZeroCall() {
      return this.filteredRatingQuestions.some((section: any) => {
        return section.questions.some((question: any) => {
          if(question.answer !== null && question.answer !== undefined)
          return question.isFatalQues && question.answer.toLowerCase() === "no";
        });
      });
    }
  
  saveRatings(){
    if(this.checkIfValidSubmit()){
    const reqObj: any[] = [];
    const isZeroCall = this.checkIfZeroCall();
    this.filteredRatingQuestions.forEach((section: any) => {
      section.questions.forEach((question: any) => {
        if (question.score !== null && question.score !== "" && question.answer !== null && question.answer !== "") {
          const obj = {
            sectionId: section.sectionId,
            questionId: question.questionId,
            answer: question.answer,
            score: question.score,
            isZeroCall: isZeroCall, 
            finalScore: this.finalScore,
            finalGrade: this.finalGrade,
            callRemarks: this.callRemarks ? this.callRemarks: null,
            ecdCallType: this.routedData.outboundCallType,
            agentId: this.routedData.agentid,
            benCallId: this.routedData.benCallID,
            qualityAuditorId: sessionStorage.getItem('userId'),
            createdBy: sessionStorage.getItem('userName'),
            psmId: sessionStorage.getItem('providerServiceMapID'),
          };
          reqObj.push(obj);
        }
      });
    });
    console.log("reqObj", reqObj);
    this.qualityAuditorService.saveCallRatings(reqObj).subscribe((res: any) => {
      if(res && res.response){
        this.confirmationService.openDialog(this.currentLanguageSet.successfullyCallRated, 'success');
        const data:any = {};
        data.paginator = this.data.data.paginator;
        data.sort = this.data.data.sort;
        this.qualityAuditorService.loadComponent(CallAuditComponent, {data:data});
        this.qualityAuditorService.showForm = this.showCallAuditForm;
      } else if(res.statusCode !== 200) {
        this.confirmationService.openDialog(res.errorMessage, 'error');
      } else {
        this.confirmationService.openDialog(this.currentLanguageSet.issueInSavingBenCallRatings, 'error');
      }
    },(err : any) => {
      if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
      else
      this.confirmationService.openDialog(err.title + err.detail, 'error')
      });
    } else {
      this.confirmationService.openDialog(this.currentLanguageSet.pleaseFillAllQuestionsToProceedFurther, 'info');
    }
    
  }

  updateRatings(){
    const quesObj: any = [];
    const isZeroCall = this.checkIfZeroCall();
    this.filteredRatingQuestions.forEach((section: any) => {
      section.questions.forEach((question: any) => {
        if (question.score !== null && question.score !== "" && question.answer !== null && question.answer !== "") {
          const obj = {
            id: question.id,
            sectionId: section.sectionId,
            questionId: question.questionId,
            answer: question.answer,
            score: question.score,
            ecdCallType: this.routedData.outboundCallType,
            agentId: this.routedData.agentid,
            benCallId: this.routedData.benCallID,
            qualityAuditorId: sessionStorage.getItem('userId'),
            psmId: sessionStorage.getItem('providerServiceMapID'),
            deleted: false,
            modifiedBy: sessionStorage.getItem('userName'),
            createdBy: sessionStorage.getItem('userName'),
          };
          quesObj.push(obj)
        }
      });
    });

    const ratingObj = {
      id: this.ratingId,
      finalScore: this.finalScore,
      finalGrade: this.finalGrade,
      isZeroCall: isZeroCall,
      callRemarks: this.callRemarks ? this.callRemarks: null,
      agentId: this.routedData.agentid,
      benCallId: this.routedData.benCallID,
      qualityAuditorId: sessionStorage.getItem('userId'),      
      psmId: sessionStorage.getItem('providerServiceMapID'),
      deleted: false,
      modifiedBy: sessionStorage.getItem('userName'),
      createdBy: sessionStorage.getItem('userName'),
    }

    const reqObj = {
      qualityQuestionResponse: quesObj,
      qualityRating: ratingObj
    }

    console.log("updateRatingsReqObj", reqObj);
    this.qualityAuditorService.updateCallRatings(reqObj).subscribe((res: any) => {
      if(res && res.response){
        this.confirmationService.openDialog(this.currentLanguageSet.successfullyCallRatingUpdated, 'success');
        const data:any = {};
        data.paginator = this.data.data.paginator;
        data.sort = this.data.data.sort;
        this.qualityAuditorService.loadComponent(CallAuditComponent, {data:data});
        this.qualityAuditorService.showForm = this.showCallAuditForm;
      } else if(res.statusCode !== 200) {
        this.confirmationService.openDialog(res.errorMessage, 'error');
      } else {
        this.confirmationService.openDialog(this.currentLanguageSet.issueInUpdatingBenCallRatings, 'error');
      }
    },(err : any) => {
      if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
      else
      this.confirmationService.openDialog(err.title + err.detail, 'error')
      });
  }

  backToQualityAudit(){
    const data:any = {};
    data.paginator = this.data.data.paginator;
    data.sort = this.data.data.sort;
    this.qualityAuditorService.loadComponent(CallAuditComponent, {data:data});
    this.qualityAuditorService.showForm = this.showCallAuditForm;
  }
}
