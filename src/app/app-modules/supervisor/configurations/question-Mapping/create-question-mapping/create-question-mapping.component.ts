import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { AbstractControl, FormArray, FormBuilder } from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { MapQuestionaireConfigurationComponent } from '../map-questionaire-configuration/map-questionaire-configuration.component';
@Component({
  selector: 'app-create-question-mapping',
  templateUrl: './create-question-mapping.component.html',
  styleUrls: ['./create-question-mapping.component.css']
})
export class CreateQuestionMappingComponent implements OnInit, DoCheck {
  @Input()
  public data: any;
  currentLanguageSet: any;
  parentSelectedQuestion:any;
  selectedParentId:any;
  parentQuestionaireList:any=[]
  parentAnswersList:any=[];
  childQuestionaireList:any=[];
  enableEdit = false;
  selectedChildId:any;
  mappedQuestionaireId:any[]=[];
  constructor(
    private setLanguageService: SetLanguageService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private supervisorService: SupervisorService,
    readonly sessionstorage:SessionStorageService,
  ) { }
  createQuestionaireMappingForm = this.fb.group({
    parentQuestion:[''],
    answerType:[''],
    childQuestion:['']
  });
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: any;
  filteredChildOptions: any;
  questionnaireList:any=[];
  mappedId:any=[];

  getQuestionnaires() {
  const psmId = this.sessionstorage.getItem('providerServiceMapID');
  const alreadyMappedId:any=[];
  if(this.mappedQuestionaireId.length>0){
    for(let i=0;i<this.mappedQuestionaireId.length;i++){
      if(this.mappedQuestionaireId[i].deleted ===false){
        this.mappedId.push(this.mappedQuestionaireId[i]);
        // alreadyMappedId.push(this.mappedQuestionaireId[i].childQuestionId);
      } 
    }
    // this.mappedId=alreadyMappedId;
    console.log(this.mappedId);
  }
  this.supervisorService.getQuestionnairesForMapping(psmId).subscribe(
    (response: any) => {
      if (response) {
        this.questionnaireList = response; 
        this.parentQuestionaireList=this.questionnaireList.filter((values:any) => values.questionnaireType === "Question" && 
        (values.answerType === "Radio" || values.answerType === "Dropdown" || values.answerType === "Multiple"))
         
        // if(alreadyMappedId.length>0){
        //   for(let j= 0;j<alreadyMappedId.length;j++){
        //     pQList.forEach((value :any, index:any) => {
        //       if (value. questionnaireId == alreadyMappedId[j]) pQList.splice(index, 1);
        //     });
        //   }
        //   this.parentQuestionaireList=pQList;
        //  }
        //  else{
        //   this.parentQuestionaireList=pQList;
        //  }

      } else {
        this.confirmationService.openDialog(response.errorMessage, 'error');
      }
    },
    (err: any) => {
      if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
      else
      this.confirmationService.openDialog(err.title + err.detail, 'error')
      });

}
filterQuestionsList(createQuestionaireMappingForm:any){
  this.filteredOptions = this.createQuestionaireMappingForm.controls.parentQuestion.valueChanges.pipe(
    startWith(''),
    map(value => this._filter(createQuestionaireMappingForm)),
  );
}
filterChildQuestionsList(createQuestionaireMappingForm:any){
  this.filteredChildOptions = this.createQuestionaireMappingForm.controls.childQuestion.valueChanges.pipe(
    startWith(''),
    map(value => this._filterChild(createQuestionaireMappingForm)),
  );
}
  ngOnInit(): void {
    this.getSelectedLanguage();
    if (
      this.data.isEdit !== null &&
      this.data.isEdit !== undefined &&
      this.data.isEdit === true
    ) {
      this.enableEdit = true;
    } else {
      this.enableEdit = false;
    }
    if(this.data.questionaireMapedData.length>0){
      this.mappedQuestionaireId=this.data.questionaireMapedData;
    }
    this.getQuestionnaires();  
  }
  private _filter(value: string) {
    if(value!==undefined){
    console.log(value);
    const filterValue = value.toLowerCase();
    return this.parentQuestionaireList.filter((option: { questionnaire: string; }) => option.questionnaire.toLowerCase().includes(filterValue));
    }  
  }
  private _filterChild(value: string) {
    if(value === null){
      return this.childQuestionaireList;
    }
    if(value!==undefined && value !== null){
    console.log(value);
    const filterValue = value.toLowerCase();
    return this.childQuestionaireList.filter((option: { questionnaire: string; }) => option.questionnaire.toLowerCase().includes(filterValue));
    }
  }
  ngDoCheck() {
    this.getSelectedLanguage();
  }
  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }
  onChange(value:any,type:any){
    if(type === 'parent'){
      this.createQuestionaireMappingForm.controls.answerType.reset()
      // this.createQuestionaireMappingForm.controls.answerType.setErrors(null);
      this.createQuestionaireMappingForm.controls.childQuestion.reset();
      // this.createQuestionaireMappingForm.controls.childQuestion.setErrors(null);
      this.parentAnswersList=[];
      console.log(value.option.value.questionnaireId)
      const selectedQuestionaire =this.parentQuestionaireList.filter((values:any) => values.questionnaireId === value.option.value.questionnaireId)
      this.selectedParentId=selectedQuestionaire[0].questionnaireId;
      console.log(this.selectedParentId);
      this.parentAnswersList=selectedQuestionaire[0].options;
      let cQList:any=[];
      cQList=this.questionnaireList.filter((values:any) => values.questionnaireId !== this.selectedParentId)
      
      if(this.mappedId.length>0){
        // for(let j= 0;j<this.mappedId.length;j++){
          this.mappedId.forEach((item: any) => {
            cQList.forEach((value :any, index:any) => {
              if (item.parentQuestionId === this.selectedParentId && item.childQuestionId === value.questionnaireId) 
              cQList.splice(index, 1);
          })
          });
        //}
        this.childQuestionaireList=cQList;
       }
       else{
        this.childQuestionaireList=cQList;
      }

      this.createQuestionaireMappingForm.controls.parentQuestion.setValue(selectedQuestionaire[0].questionnaire);
    }
    else{
      console.log(value.option.value.questionnaireId)
      const selectedQuestionaire =this.childQuestionaireList.filter((values:any) => values.questionnaireId === value.option.value.questionnaireId)
      this.selectedChildId=selectedQuestionaire[0].questionnaireId;
      this.createQuestionaireMappingForm.controls.childQuestion.setValue(selectedQuestionaire[0].questionnaire);
    }  
  }
  back() {
    this.confirmationService
      .openDialog(
        "Do you really want to cancel? Any unsaved data would be lost",
        'confirm'
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          if (this.enableEdit === false) this.resetForm();
          this.supervisorService.createComponent(
            MapQuestionaireConfigurationComponent,
            null
          );
          this.enableEdit = false;
        }
      });
  }
  resetForm() {
    this.createQuestionaireMappingForm.reset();
  }
  createMapping() {
    // console.log(formData);
    let reqObj: any = {};
    reqObj = {
      parentQuestionId: this.selectedParentId,
      answer: this.createQuestionaireMappingForm.controls.answerType.value,
      childQuestionId: this.selectedChildId,
      createdBy: this.sessionstorage.getItem('userName'),
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
    };

    if(this.selectedParentId === null ||this.selectedChildId === null ){
      this.confirmationService.openDialog("Please select valid parent and child Question",'error')
    }
    else{
      console.log(reqObj);
      this.supervisorService.createParentChildMapping(reqObj).subscribe(
        (response: any) => {
          if (response) {
            this.confirmationService.openDialog(
              response.response,
              'success'
            );
            this.resetForm();
            this.selectedParentId=undefined;
            this.selectedChildId=undefined
            this.supervisorService.createComponent(
              MapQuestionaireConfigurationComponent,
              null
            );
          } else {
            this.confirmationService.openDialog(response.errorMessage, 'error');
          }
        },
        (err:any) => {
          if(err && err.error)
          this.confirmationService.openDialog(err.error, 'error');
          else
          this.confirmationService.openDialog(err.title + err.detail, 'error')
          });
    }
   
  }
  checkValidChildQuestionQuestion(){
    this.selectedChildId=null;
  }
  checkValidParentQuestion(){
    this.selectedParentId=null;
  }
}
