import { AfterViewInit, Component, DoCheck, OnInit, ViewChild } from '@angular/core';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';
import { CreateQuestionMappingComponent } from '../create-question-mapping/create-question-mapping.component';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { EditQuestionMappingComponent } from '../edit-question-mapping/edit-question-mapping.component';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { AmritTrackingService } from 'Common-UI/src/tracking';

@Component({
  selector: 'app-map-questionaire-configuration',
  templateUrl: './map-questionaire-configuration.component.html',
  styleUrls: ['./map-questionaire-configuration.component.css']
})
export class MapQuestionaireConfigurationComponent implements OnInit, DoCheck, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  currentLanguageSet: any;
  mappedQuestionaireList:any[]=[];
  dataSource = new MatTableDataSource<any>();
  searchTerm: any;
  displayedColumns: string[] = [
    'sno',
    'pQuestion',
    'answer',
    'cQuestion',
    'edit',
    'delete',
  ];
  constructor(
    private setLanguageService: SetLanguageService,
    private supervisorService: SupervisorService,
    private confirmationService: ConfirmationService,
    readonly sessionstorage:SessionStorageService,
    private trackingService: AmritTrackingService,
  ) { }

  ngOnInit(): void {
    this.getSelectedLanguage();
     this.getMappedQuestionaireList();
  }
  ngDoCheck() {
    this.getSelectedLanguage();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }
  openCreateQuestionnaireMapping() {
    const reqObj = {
     questionaireMapedData: this.mappedQuestionaireList,
     isEdit: false,
   };
    this.supervisorService.createComponent(
      CreateQuestionMappingComponent,
      reqObj
    );
  }
  getMappedQuestionaireList() {
  //   this.mappedQuestionaireList=[
  //     {
  //     id:1,
  //     parentQuestionId:3736,
  //     parentQuestion:"How your chid",
  //     answer:"Fine",
  //     childQuestionId:3752,
  //     childQuestion:"Is suffering from any Disease",
  //     psmId:3478,
  //     createdBy:"meghaecd",
  //     deleted :false
  //   },
  //   {
  //     id:2,
  //     parentQuestionId:3738,
  //     parentQuestion:"Are You Good",
  //     answer:"Yes",
  //     childQuestionId:3753,
  //     childQuestion:"Howz Your Health",
  //     psmId:3478,
  //     createdBy:"meghaecd",
  //     deleted :false
  //   },
  //   {
  //     id:3,
  //     parentQuestionId:3738,
  //     parentQuestion:"Are You Good",
  //     answer:"Yes",
  //     childQuestionId:3748,
  //     childQuestion:"Howz Your Health",
  //     psmId:3478,
  //     createdBy:"meghaecd",
  //     deleted :true
  //   },
  //   {
  //     id:4,
  //     parentQuestionId:3738,
  //     parentQuestion:"Are You Good",
  //     answer:"Yes",
  //     childQuestionId:3891,
  //     childQuestion:"How Your wife?",
  //     psmId:3478,
  //     createdBy:"meghaecd",
  //     deleted :true
  //   },

  // ]
  //   this.dataSource.data = this.mappedQuestionaireList;
  //   this.dataSource.paginator = this.paginator;
  //   this.mappedQuestionaireList.forEach((sectionCount: any, index: number) => {
  //     sectionCount.sno = index + 1;
  //   });
    const reqObj: any = {
      providerServiceMapID: this.sessionstorage.getItem('providerServiceMapID'),
    };
    this.supervisorService.getMappedQuestions(reqObj).subscribe(
      (response: any) => {
        if (response) {
          this.mappedQuestionaireList = response;
          this.mappedQuestionaireList.forEach((sectionCount: any, index: number) => {
            sectionCount.sno = index + 1;
          });
          this.dataSource.data = response;
          this.dataSource.paginator = this.paginator;
        } else {
          this.confirmationService.openDialog(response.errorMessage, 'error');
        }
      },
      (err: any) => {
        if(err && err.error)
        this.confirmationService.openDialog(err.error, 'error');
        else
        this.confirmationService.openDialog(err.title + err.detail, 'error')
        }
    );
  }
  editQuestionMapping(value: any) {
    console.log(value);
    const reqObj = {
      selectedMappedQuestion: value,
      mappedQuestionListData: this.mappedQuestionaireList,
      isEdit: true,
    };
    this.supervisorService.createComponent(
      EditQuestionMappingComponent,
      reqObj
    );
  }
  filterSearchTerm(searchTerm?: string) {
    if (!searchTerm) {
      this.dataSource.data = this.mappedQuestionaireList;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
      this.mappedQuestionaireList.forEach((item) => {
        for (const key in item) {
          if (
            key === 'parentQuestion' ||
            key === 'childQuestion' ||
            key === 'answer'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.dataSource.data.push(item);
              this.dataSource.paginator = this.paginator;
              break;
            }
          }
        }
      });
    }
  }
  activateDeactivateQuestionnaire(element: any, status: any){
    if(!this.checkIfMappingsExist(element, status)){
    this.confirmationService.openDialog(this.currentLanguageSet.areYouSureYouWouldLike + " " + status + " " + this.currentLanguageSet.thisConfiguration, 'info')
    .afterClosed().subscribe(res => {
      if(res){
        const reqObj = {
          id: element.id,
          parentQuestionId: element.parentQuestionId,
          answer:element.answer,
          childQuestionId: element.childQuestionId,
          createdBy: this.sessionstorage.getItem('userName'),
          psmId: this.sessionstorage.getItem('providerServiceMapID'),
          deleted: status === 'activate' ? false : true,
          modifiedBy: this.sessionstorage.getItem('userName'),
        }

        console.log("vaibhav",reqObj)
        this.supervisorService.updateParentChildMapping(reqObj).subscribe((res: any) => {
          if(res){
          this.confirmationService.openDialog(this.currentLanguageSet.successfully + " " + status + this.currentLanguageSet.adQuestion, 'success');
          this.getMappedQuestionaireList();
          }
          else{
            this.confirmationService.openDialog(res.errorMessage, 'error')
          }
        });
        (err: any) => {
          if(err && err.error)
          this.confirmationService.openDialog(err.error, 'error');
          else
          this.confirmationService.openDialog(err.title + err.detail, 'error')
          };
      } 
    });
  } else {
      this.confirmationService.openDialog("Parent Child Mapping Already exist", 'error')
    }  
  }
  checkIfMappingsExist(element: any, status: any) {
    if (status === 'activate') {
      const filteredItems = this.mappedQuestionaireList.filter((item: any) => {
        return item.parentQuestionId === element.parentQuestionId &&  item.childQuestionId === element.childQuestionId && item.deleted === false;
      });
      return filteredItems.length !== 0;
    } else {
      return false;
    }
  }
  trackFieldInteraction(fieldName: string) {
    this.trackingService.trackFieldInteraction(fieldName, 'Map Questionnaire Configuration');
  }

}
