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
import { DCGroupContactService } from '../services/dcgroup-contact.service';

@Component({
  selector: 'app-dcgroup-contact',
  templateUrl: './dcgroup-contact.component.html',
  styleUrls: ['./dcgroup-contact.component.css']
})
export class DCGroupContactComponent implements OnInit, OnDestroy {

  user : any; 
  isLoading = false;
  totalRecords = 0;
  isRunning = false; 

  resultData: any[];
  selectedItem: any[];
  checkedCount = 0;
  checkedState = {};
  checkedItems = [];
  checkedItemsList = "";
  exportData: ExportModel; 
  showWindow = {}; 
  recordData: DCGroupContactModel; 
  validationErrors: any;

  cols: any[] = [
    { field: 'NAME', header: 'Name', width: '200px', filterType: 'text' },
    { field: 'EMAIL', header: 'Email', width: '200px', filterType: 'text' },
    { field: 'VENDOR', header: 'Vendor', width: '150px', filterType: 'text' }
  
  ];
  searchParams: any;
  gridParam: any; 
  destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private componentService: DCGroupContactService,
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
        console.log('searched');
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
this.componentService.fetchData(searchParams, state).pipe(
      tap(result => {
        console.log('result', result);
        this.resultData = result['Data']  || [];
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
    this.recordData = new DCGroupContactModel(); 
    this.recordData.Email = data['EMAIL']; 
    this.recordData.Name = data['NAME']; 
    this.recordData.Vendor = data['VENDOR']; 
    this.recordData.ID = data['ID']; 

    this.showWindow['DETAIL'] = true; 

  }

  
  initCheckState(isChecked: boolean) {
    const data = this.resultData || [];
    this.checkedState = data.reduce((checkedState, e) => {
      checkedState[e['ID']] = isChecked;
      return checkedState;
    }, {});
    this.checkedCount = this.getCheckedItems()?.length;
  }
  toggleCheckState(item: any) {
    if (!item || !item['ID']) {
      return;
    }
    const currentCheckState = this.checkedState[item['ID']];
    this.checkedState[item['ID']] = !currentCheckState;
    this.checkedCount = this.getCheckedItems()?.length;
  }
  getCheckedItems() {
    return this.resultData.filter(e => !!this.checkedState[e['UI_ID']]);
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
  this.exportData.ExportName = "Export-Contact Results-" + today.toLocaleDateString("en-US"); 
  
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
  this.componentService.exportData(this.exportData, this.cols, this.searchParams, this.gridParam).pipe(
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

editInit(data) {

    this.validationErrors = {}; 
      this.recordData = new DCGroupContactModel(); 
      this.recordData.Email = data['EMAIL']; 
      this.recordData.Name = data['NAME']; 
      this.recordData.OriginalName = data['NAME']; 
      this.recordData.Vendor = data['VENDOR']; 
      this.recordData.ID = data['ID']; 



      //Get vendors 
      this.uiService.getLookups('Vendor').pipe(
        tap(result => {
          this.recordData.LK_Vendor = result || [];
        }),
        catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      ).subscribe();  

      this.showWindow["EDIT"] = true; 
}

addNewInit() { 
  this.validationErrors = {}; 
  this.recordData = new DCGroupContactModel(); 
  this.recordData.Mode   = "Add"; 


  //Get vendors 
  this.uiService.getLookups('Vendor').pipe(
    tap(result => {
      this.recordData.LK_Vendor = result || [];
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();  

  this.showWindow["EDIT"] = true; 
}


deleteSubmit()
{

}
deleteInit(data)
{
  this.componentService.checkNameExists(this.recordData).pipe(
    tap(result => {      

      var isInUse = false; 
      if (result.errormessage) {
        //Notify message
        isInUse = true; 
      }

    }
    ),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();

}
editSubmit()
{

  //Validation 
  //check if name exist 
  this.validationErrors = {}; 

  if (!this.recordData.Name) {
    this.validationErrors.Name = "Name is required";
  }

  if (!this.recordData.Email) {
    this.validationErrors.Email = "Email is required";
  }
  
  if (Object.keys(this.validationErrors).length) {
    return; 
  }
  this.componentService.checkNameExists(this.recordData).pipe(
    tap(result => {      
      if (result.errormessage) {
        //Notify message
        this.validationErrors.Name = "Name already exist";
      }
      else {

        if (Object.keys(this.validationErrors).length) {
          return; 
        }
    
        if (this.recordData.Mode == 'Add')
        {
          this.componentService.addNewData(this.recordData).pipe(
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
          this.componentService.saveData(this.recordData).pipe(
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


class DCGroupContactModel {

  LK_Vendor: any[]; 

  Mode: string; 
  Name: string;
  OriginalName: string; 
  Email: string; 
  Vendor: string;
  ID: string; 

}
