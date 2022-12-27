import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { AppDataService } from '../services/app-data.service';
import { ProjectService } from '../services/project.service';
import { NotificationService } from '../services/notification.service';
import { UIService } from '../services/UI.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit, OnDestroy {

  user : any; 
  isLoading = false;
  totalRecords = 0;
  isRunning = false; 

  projects: any[];
  selectedItem: any[];
  checkedCount = 0;
  checkedState = {};
  checkedItems = [];
  checkedItemsList = "";
  exportData: ExportModel; 
  showWindow = {}; 
  projectData: ProjectModel; 
  validationErrors: any;

  cols: any[] = [
    { field: 'PROJECT', header: 'Project Name', width: '200px', filterType: 'text' },
    { field: 'JURISDICTION', header: 'Jurisdiction', width: '200px', filterType: 'text' },
    { field: 'WORKTYPE', header: 'Work Type', width: '150px', filterType: 'text' },
    { field: 'DESCRIPTION', header: 'Project Description', width: '250px', filterType: 'text' },
    { field: 'EST_PROJ_COMP_DATE', header: 'Est. Proj. Comp. Date', width: '150px', filterType: 'date' },
    { field: 'WORKORDERSTATE', header: 'Work Order State', width: '200px', filterType: 'text' }
  
  ];
  searchParams: any;
  gridParam: any; 
  destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private projectService: ProjectService,
    private notificationService: NotificationService,
    private uiService: UIService,
    public appDataService: AppDataService,
    private userService: UserService,
    private sanitizer: DomSanitizer
  ) {
    this.user = userService.USER; 
    console.log('user', this.user); 
  }

  ngOnInit() {
    // this.fetchData();
    this.appDataService.searchClicked$.pipe(
      tap(searchParams => {
        //this.isRunning = true;
        
        this.fetchData(searchParams);
        this.searchParams = searchParams;
        console.log('project searched');
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refreshData() {
    this.fetchData(this.searchParams, this.gridParam);
  }

  fetchData(searchParams: any, state?: any) {
    console.log('fetchData', searchParams, state);

//    this.isLoading = true;
this.isRunning = true; 
this.projectService.fetchData(searchParams, state).pipe(
      tap(result => {
        console.log('result', result);
        this.projects = result['Data']  || [];
        this.totalRecords = result['Total'];
        this.isRunning = false; 
        this.initCheckState(false);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      finalize(() => this.isLoading = false),
    ).subscribe();
   
  }




  
  openDetail(data)
  {
    this.projectData = new ProjectModel(); 
    this.projectData.Project = data['PROJECT']; 
    this.projectData.Description = data['DESCRIPTION']; 
    this.projectData.EstProjCompDate = data['EST_PROJ_COMP_DATE']; 
    this.projectData.WorkType = data['WORKTYPE']; 
    this.projectData.WorkOrderState = data['WORKORDERSTATE']; 
    this.projectData.Jurisdiction = data['JURISDICTION']; 

    this.showWindow['DETAIL'] = true; 

  }

  
  initCheckState(isChecked: boolean) {
    const data = this.projects || [];
    this.checkedState = data.reduce((checkedState, e) => {
      checkedState[e['UI_ID']] = isChecked;
      return checkedState;
    }, {});
    this.checkedCount = this.getCheckedItems()?.length;
  }
  toggleCheckState(item: any) {
    if (!item || !item['UI_ID']) {
      return;
    }
    const currentCheckState = this.checkedState[item['UI_ID']];
    this.checkedState[item['UI_ID']] = !currentCheckState;
    this.checkedCount = this.getCheckedItems()?.length;
  }
  getCheckedItems() {
    return this.projects.filter(e => !!this.checkedState[e['UI_ID']]);
  }
  getCheckedItemsList() {
    return this.checkedItems?.map(e => e.UI_ID).join(', ');
  }

  onLazyLoad(event: any) {
    console.log('onLazyLoad', event);

    // reset state
    this.gridParam = event; 

    this.fetchData(this.searchParams, event);
  }

  
exportDataInit()
{
  this.exportData = new ExportModel(); 
  var today  = new Date();
  this.exportData.ExportName = "Export-Project Info Results-" + today.toLocaleDateString("en-US"); 
  
  this.showWindow['EXPORT'] = true; 
}
exportDataSubmit ()
{

  console.log('exportData', this.exportData);
  
  if  (this.exportData.ExportOption == 'Selection')
  {
      //Get Checked Items
      this.exportData.SelectedIDs = this.getCheckedItems().map(e=>e.UI_ID); 
  }
  else 
  {
    this.exportData.SelectedIDs = []; 
  }
  console.log('exportData', this.exportData);
  this.projectService.exportData(this.exportData, this.cols, this.searchParams, this.gridParam).pipe(
    tap(result => {

      console.log(result); 
      const url = window.URL.createObjectURL(result);
      const a = document.createElement('a');

      a.href = url;

      const fileName = this.exportData.ExportName + '.xlsx';
      a.download = fileName;
      a.click();
      a.remove();
     
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, []))

  ).subscribe();

}

workTypeChange() {

  
  this.uiService.getLookups('ServiceArea', this.projectData.WorkType).pipe(
    tap(result => {
      this.projectData.LK_Jurisdiction = result || [];
      console.log('LK_Project', this.projectData.LK_Jurisdiction);

      //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();

  
  this.uiService.getLookups('OrderState', this.projectData.WorkType).pipe(
    tap(result => {
      this.projectData.LK_WorkOrderState = result || [];
      console.log('LK_WorkOrderState', this.projectData.LK_WorkOrderState);

      //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();



}
editInit(data) {

    this.projectData = new ProjectModel(); 
    this.projectData.Mode   = "Edit"; 
    this.projectData.OriginalProjectName = data['PROJECT']; 
    this.projectData.Project = data['PROJECT']; 
    this.projectData.Description = data['DESCRIPTION']; 
    this.projectData.EstProjCompDate = data['EST_PROJ_COMP_DATE']; 
    this.projectData.WorkType = data['WORKTYPE']; 
    this.projectData.WorkOrderState = data['WORKORDERSTATE']; 
    this.projectData.Jurisdiction = data['JURISDICTION']; 



      //Get vendors 
      this.uiService.getLookups('Departments').pipe(
        tap(result => {
          this.projectData.LK_WorkType = result || [];
          this.workTypeChange(); 
        }),
        catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      ).subscribe();  

      this.showWindow["EDIT"] = true; 
}

addNewInit() { 
  this.validationErrors = {}; 
  this.projectData = new ProjectModel(); 
  this.projectData.Mode   = "Add"; 

    //Get vendors 
    this.uiService.getLookups('Departments').pipe(
      tap(result => {
        this.projectData.LK_WorkType = result || [];
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();  

  this.showWindow["EDIT"] = true; 
}

editSubmit()
{

  //Validation 
  //check if name exist 
  this.validationErrors = {}; 

  if (!this.projectData.Project) {
    this.validationErrors.Project = "Project is required";
  }

  if (!this.projectData.Description) {
    this.validationErrors.Description = "Description is required";
  }
  
  if (!this.projectData.WorkType) {
    this.validationErrors.WorkType = "Work Type is required";
  }
  
  if (!this.projectData.Jurisdiction) {
    this.validationErrors.Jurisdiction = "Jurisdiction is required";
  }
  
  if (!this.projectData.WorkOrderState) {
    this.validationErrors.WorkOrderState = "Work Order State is required";
  }

 
  if (!this.projectData.EstProjCompDate) {
    this.validationErrors.EstProjCompDate = "Est. Complation Date is required";
  }


  this.projectService.checkNameExists(this.projectData).pipe(
    tap(result => {      
      if (result.errormessage) {
        //Notify message
        this.validationErrors.Project = "Project Name already exist";
      }
      else {

        if (Object.keys(this.validationErrors).length) {
          return; 
        }
    
        if (this.projectData.Mode == 'Add')
        {
          this.projectService.addNewData(this.projectData).pipe(
            tap(result => {
              console.log('editSubmit result', result);
              if (result.errormessage) {
                //Notify message
                this.notificationService.notifyError("Save Data Failed", result.errormessage);
              }
              else {
                //Add to response data 
                //we're good
                this.notificationService.notifySuccess("Save Successfully Completed", "");
                this.refreshData(); 
                this.showWindow = {};
              }
            }
            ),
            catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
          ).subscribe();
        }
        else 
        {
          this.projectService.saveData(this.projectData).pipe(
            tap(result => {
              console.log('editSubmit result', result);
              if (result.errormessage) {
                //Notify message
                this.notificationService.notifyError("Save Data Failed", result.errormessage);
              }
              else {
                //Add to response data 
                //we're good
                this.notificationService.notifySuccess("Save Successfully Completed", "");
                this.refreshData(); 
                this.showWindow = {};
              }
            }
            ),
            catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
          ).subscribe();
        }
      }
    }
    ),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();


}

}


class ExportModel {
  ExportOption: string = "All";
  ExportName: string;
  Key: string; 
  SelectedIDs: any[]; 
}


class ProjectModel {

  LK_Jurisdiction: any[]; 
  LK_WorkType: any[]; 
  LK_WorkOrderState: any[]; 

  Mode: string; 
  Project: string;
  OriginalProjectName: string; 
  Description: string;
  Jurisdiction: string; 
  WorkType: string; 
  EstProjCompDate: string; 
  WorkOrderState: string; 

}
