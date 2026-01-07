import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { AbstractControl, FormArray, FormBuilder } from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { MapQuestionaireConfigurationComponent } from '../map-questionaire-configuration/map-questionaire-configuration.component';
import { AmritTrackingService } from 'Common-UI/src/tracking';

@Component({
  selector: 'app-edit-question-mapping',
  templateUrl: './edit-question-mapping.component.html',
  styleUrls: ['./edit-question-mapping.component.css']
})
export class EditQuestionMappingComponent implements OnInit, DoCheck {
  @Input()
  public data: any;
  currentLanguageSet: any;
  parentSelectedQuestion:any;
  selectedParentId:any;
  parentQuestionaireList:any=[]
  parentAnswersList:any=[];
  childQuestionaireList:any=[];
  enableEdit = false;
  selectedChildId:any
  mappedQuestionListData:any=[];
  selectedmappedList:any;
  parentField=true;
  mappedId:any=[];
  constructor(
    private setLanguageService: SetLanguageService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private supervisorService: SupervisorService,
    readonly sessionstorage:SessionStorageService,
    private trackingService: AmritTrackingService
  ) { }
  editQuestionaireMappingForm = this.fb.group({
    id:[''],
    parentQuestion:[''],
    answerType:[''],
    childQuestion:['']
  });
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: any;
  filteredChildOptions: any;
  questionnaireList:any=[];

  getQuestionnaires() {
  const psmId = this.sessionstorage.getItem('providerServiceMapID');
  const alreadyMappedId:any=[];
  if(this.mappedQuestionListData.length>0){
    for(let i=0;i<this.mappedQuestionListData.length;i++){
      if(this.mappedQuestionListData[i].deleted ===false && this.mappedQuestionListData[i].childQuestionId !== this.selectedmappedList.childQuestionId){
        this.mappedId.push(this.mappedQuestionListData[i]);
        // alreadyMappedId.push(this.mappedQuestionListData[i].childQuestionId);
      } 
    }
    // this.mappedId=alreadyMappedId;
    console.log(this.mappedId);
  }
  this.supervisorService.getQuestionnaires(psmId).subscribe(
    (response: any) => {
      if (response) {
        this.questionnaireList = response; 
        this.parentQuestionaireList=this.questionnaireList.filter((values:any) => values.questionnaireType === "Question" && (values.answerType === "Radio" || values.answerType === "Dropdown" || values.answerType === "Multiple"))
        const selectedQuestionaire =this.parentQuestionaireList.filter((values:any) => values.questionnaireId === this.selectedmappedList.parentQuestionId)
         this.parentAnswersList=selectedQuestionaire[0].options;
         console.log( this.parentAnswersList)
         let cQList:any=[];
          cQList=this.questionnaireList.filter((values:any) => values.questionnaireId !== this.selectedParentId )
      
        if(this.mappedId.length>0){
        // for(let j= 0;j<this.mappedId.length;j++){
          this.mappedId.forEach((item: any) => {
          cQList.forEach((value :any, index:any) => {
            if (item.parentQuestionId === this.selectedParentId && item.childQuestionId === value.questionnaireId) 
            cQList.splice(index, 1);
          });
        });
        //}
        this.childQuestionaireList=cQList;
       }
       else{
        this.childQuestionaireList=cQList;
       }

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
filterQuestionsList(editQuestionaireMappingForm:any){
  this.filteredOptions = this.editQuestionaireMappingForm.controls.parentQuestion.valueChanges.pipe(
    startWith(''),
    map(value => this._filter(editQuestionaireMappingForm)),
  );
}
filterChildQuestionsList(editQuestionaireMappingForm:any){
  this.filteredChildOptions = this.editQuestionaireMappingForm.controls.childQuestion.valueChanges.pipe(
    startWith(''),
    map(value => this._filterChild(editQuestionaireMappingForm)),
  );
}
  ngOnInit(): void {
    this.editQuestionaireMappingForm.get('parentQuestion')?.disable();
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
    if (
      this.data.mappedQuestionListData !== null &&
      this.data.mappedQuestionListData !== undefined
    ) {
      this.mappedQuestionListData = this.data.mappedQuestionListData;
    }

    if (
      this.data.selectedMappedQuestion !== null &&
      this.data.selectedMappedQuestion !== undefined
    ) {
      this.selectedmappedList = this.data.selectedMappedQuestion;
      this.patchValuesForEdit();
    }
    console.log("Mapped",this.mappedQuestionListData);
    console.log("sMap",this.selectedmappedList);
    this.getQuestionnaires();  
  }
  patchValuesForEdit() {
    this.editQuestionaireMappingForm.controls['id'].patchValue(
      this.selectedmappedList.id
    );

    this.editQuestionaireMappingForm.controls['parentQuestion'].patchValue(
      this.selectedmappedList.parentQuestion
    );    
     this.selectedParentId=this.selectedmappedList.parentQuestionId;
     this.editQuestionaireMappingForm.controls['answerType'].patchValue(
      this.selectedmappedList.answer
    ); 
    this.editQuestionaireMappingForm.controls['childQuestion'].patchValue(
      this.selectedmappedList.childQuestion
    );    
     this.selectedChildId=this.selectedmappedList.childQuestionId;
    
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
      this.editQuestionaireMappingForm.controls.answerType.reset();
      this.editQuestionaireMappingForm.controls.childQuestion.reset();
      this.parentAnswersList=[];
      console.log(value.option.value.questionnaireId)
      const selectedQuestionaire =this.parentQuestionaireList.filter((values:any) => values.questionnaireId === value.option.value.questionnaireId)
      this.selectedParentId=selectedQuestionaire[0].questionnaireId;
      console.log(this.selectedParentId);
      this.parentAnswersList=selectedQuestionaire[0].options;
      this.childQuestionaireList=this.questionnaireList.filter((values:any) => values.questionnaireId !== this.selectedParentId)
      this.editQuestionaireMappingForm.controls.parentQuestion.setValue(selectedQuestionaire[0].questionnaire);
    }
    else{
      console.log(value.option.value.questionnaireId)
      const selectedQuestionaire =this.childQuestionaireList.filter((values:any) => values.questionnaireId === value.option.value.questionnaireId)
      this.selectedChildId=selectedQuestionaire[0].questionnaireId;
      this.editQuestionaireMappingForm.controls.childQuestion.setValue(selectedQuestionaire[0].questionnaire);
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
    this.editQuestionaireMappingForm.reset();
  }
  editMapping() {
    // console.log(formData);
    let reqObj: any = {};
    reqObj = {
      id:this.selectedmappedList.id,
      parentQuestionId: this.selectedParentId,
      answer: this.editQuestionaireMappingForm.controls.answerType.value,
      childQuestionId: this.selectedChildId,
      createdBy: this.sessionstorage.getItem('userName'),
      psmId: this.sessionstorage.getItem('providerServiceMapID'),
      modifiedBy: this.sessionstorage.getItem('userName'),
      deleted: false,
    };
    if(this.selectedParentId === null ||this.selectedChildId === null ){
      this.confirmationService.openDialog("Please select valid parent and child Question",'error')
    }
    else{
      console.log(reqObj);
      this.supervisorService.updateParentChildMapping(reqObj).subscribe(
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

  trackFieldInteraction(fieldName: string) {
    this.trackingService.trackFieldInteraction(fieldName, 'Edit Question Mapping');
  }
}
