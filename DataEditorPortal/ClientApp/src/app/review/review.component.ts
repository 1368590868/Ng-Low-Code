import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { AppDataService } from '../services/app-data.service';
import { NotificationService } from '../services/notification.service';
import { UIService } from '../services/UI.service';
import { ReviewService } from '../services/review.service';
import { ThrowStmt } from '@angular/compiler';


@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit, OnDestroy {

constructor(    private router: Router,
    private notificationService: NotificationService,
    private uiService: UIService,
    public appDataService: AppDataService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private reviewService: ReviewService
) { 
  this.user = userService.USER; 

}
user : any; 
isLoading = false;
totalRecords = -1;
records: any[]; 
isRunning = false; 

searchParams: any;
gridParam: any; 
destroy$ = new Subject<void>();
cols: any[]; 

selectedItem: any;
checkedCount = 0;
checkedState = {};
checkedItems = [];
checkedItemsList = "";
showWindow = {}; 
toolEnabled = {}; 
validationErrors: any;
isSubmitting: boolean = false; 
reviewData: ReviewModel; 
reportType = 'List'; 
exportData: ExportModel; 
searchClicked: boolean = false; 

ngOnInit() {
  // this.fetchData();
  this.records = []; 

  this.appDataService.searchViewChanged$.pipe(
    tap(() => {
      //Changing view 
      console.log('view changed');
      this.records = [];
      this.searchClicked = false;
      this.totalRecords = -1;
    }

    ), takeUntil(this.destroy$)
  ).subscribe();

  this.appDataService.searchClicked$.pipe(
    tap(searchParams => {

      this.searchClicked = false; 
      this.isRunning = true; 
      if (!this.appDataService.currentNavigationItem?.key)
      {
        this.isRunning = false; 
        return; 
      }

      console.log('review searched', searchParams); 

      searchParams.forEach(element => {
        if (element.Name == 'REPORT_RESULT') 
        {
           this.reportType = element.SelectedValue; 
        }
      });
      //Build cols 
      this.reviewService.fetchGridConfig(this.appDataService.currentNavigationItem.key, this.reportType).pipe(
        tap(result => {
          console.log('result', result);
          this.cols = result as any[]; ; 
//          this.totalRecords = result['Total'];
         
          this.fetchData(searchParams);
          this.searchParams = searchParams;
        }),
        catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
        finalize(() => this.isLoading = false),
      ).subscribe();


      console.log('searched');
    }),
    takeUntil(this.destroy$),
  ).subscribe();
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

test()
{
  console.log('inputs', this.records); 
}

CPStatusReviewedInit()
{
  
  this.checkedItems = this.getCheckedItems(); 
  this.validationErrors = {};
  if (this.checkedItems?.length == 0) {
    this.validationErrors.Selected = "No Order Number(s) were selected";
    
  }
  this.reviewData = new ReviewModel(); 
  this.reviewData.checkedItems = this.checkedItems;
  this.reviewData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
  this.reviewData.UserVendor = this.user.Vendor;
  this.reviewData.Key = this.appDataService.currentNavigationItem.key; 
  this.reviewData.Data = this.checkedItems?.map(e => {
    let rObj = {}
    rObj['OrderNumber'] = e.ORDERNUMBER;
    rObj['WorkOrderState'] = e.WORKORDERSTATE;


    return rObj
  });

  this.showWindow['CPSTATUS'] = true; 
}


DesignInstalledStatusReviewedInit()
{
  
  this.checkedItems = this.getCheckedItems(); 
  this.validationErrors = {};
  if (this.checkedItems?.length == 0) {
    this.validationErrors.Selected = "No Order Number(s) were selected";
    
  }
  this.reviewData = new ReviewModel(); 
  this.reviewData.checkedItems = this.checkedItems;
  this.reviewData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
  this.reviewData.UserVendor = this.user.Vendor;
  this.reviewData.Key = this.appDataService.currentNavigationItem.key; 
  this.reviewData.Data = this.checkedItems?.map(e => {
    let rObj = {}
    rObj['OrderNumber'] = e.ORDERNUMBER;
    rObj['WorkOrderState'] = e.WORKORDERSTATE;


    return rObj
  });

  this.showWindow['DESIGNINSTALLEDSTATUS'] = true; 
}

HPTStatusReviewedInit()
{
  
  this.checkedItems = this.getCheckedItems(); 
  this.validationErrors = {};
  if (this.checkedItems?.length == 0) {
    this.validationErrors.Selected = "No Order Number(s) were selected";
    
  }
  this.reviewData = new ReviewModel(); 
  this.reviewData.checkedItems = this.checkedItems;
  this.reviewData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
  this.reviewData.UserVendor = this.user.Vendor;
  this.reviewData.Key = this.appDataService.currentNavigationItem.key; 
  this.reviewData.Data = this.checkedItems?.map(e => {
    let rObj = {}
    rObj['OrderNumber'] = e.ORDERNUMBER;
    rObj['WorkOrderState'] = e.WORKORDERSTATE;


    return rObj
  });

  this.showWindow['HPTSTATUS'] = true; 
}


HPTStatusReviewedNonWOTSInit()
{
  
  this.checkedItems = this.getCheckedItems(); 
  this.validationErrors = {};
  if (this.checkedItems?.length == 0) {
    this.validationErrors.Selected = "No Order Number(s) were selected";
    
  }
  this.reviewData = new ReviewModel(); 
  this.reviewData.checkedItems = this.checkedItems;
  this.reviewData.checkedItemsList = this.checkedItems?.map(e => e.GIS_OBJECTID).join(', ');
  this.reviewData.UserVendor = this.user.Vendor;
  this.reviewData.Key = this.appDataService.currentNavigationItem.key; 
  this.reviewData.Data = this.checkedItems?.map(e => {
    let rObj = {}
    rObj['GIS_OBJECTID'] = e.GIS_OBJECTID;
    rObj['OrderNumber'] = e.ORDERNUMBER;
    

    return rObj
  });

  this.showWindow['HPTSTATUSNONWOTS'] = true; 
}

restatusInit()
{

  this.checkedItems = this.getCheckedItems(); 
  this.validationErrors = {};
  if (this.checkedItems?.length == 0) {
    this.validationErrors.Selected = "No Order Number(s) were selected";
    
  }
  this.reviewData = new ReviewModel(); 
  this.reviewData.checkedItems = this.checkedItems;
  this.reviewData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
  this.reviewData.UserVendor = this.user.Vendor;
  this.reviewData.WorkType = this.appDataService.currentNavigationItem.Module;
  this.reviewData.Key = this.appDataService.currentNavigationItem.key; 
  this.reviewData.Data = this.checkedItems?.map(e => {
    let rObj = {}
    rObj['OrderNumber'] = e.ORDERNUMBER;
    rObj['WorkOrderState'] = e.WORKORDERSTATE;
    rObj['OrderType'] = e.ORDERTYPE;
    rObj['Comments'] = e.Comments;
    rObj['ServiceArea'] = e.SERVICEAREA; 
    return rObj
  });

  this.showWindow['RESTATUS'] = true; 
}

resubmitInit()
{
  this.checkedItems = this.getCheckedItems(); 

  this.validationErrors = {};
  if (this.checkedItems?.length == 0) {
    this.validationErrors.Selected = "No Order Number(s) were selected";
    
  }
  this.reviewData = new ReviewModel(); 
  this.reviewData.checkedItems = this.checkedItems;
  this.reviewData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
  this.reviewData.UserVendor = this.user.Vendor;
  this.reviewData.Key = this.appDataService.currentNavigationItem.key; 
  this.reviewData.WorkType = this.appDataService.currentNavigationItem.Module; 

  this.reviewData.Data = this.checkedItems?.map(e => {
    let rObj = {}
    rObj['OrderNumber'] = e.ORDERNUMBER;
    rObj['WorkOrderState'] = e.WORKORDERSTATE;
    rObj['OrderType'] = e.ORDERTYPE;
    rObj['Comments'] = e.Comments;
    rObj['ServiceArea'] = e.SERVICEAREA; 

    return rObj
  });

  this.showWindow['RESUBMIT'] = true; 

}

GasLCFixSubmit()
{


  if (!this.reviewData?.OrderNumber?.ORDERNUMBER)
  {
    this.validationErrors.OrderNumber = "An Order Number Is Required";
  }

  if (Object.keys(this.validationErrors).length) {
    
    console.log('has error');
    return;
  }

  
  this.isSubmitting = true; 
  this.reviewService.GasLCFix(this.reviewData).pipe(
    tap(result => {
      console.log('result', result);
      if (result.errormessage) {
        //Notify message
        this.notificationService.notifyError("Update Failed", result.errormessage);
      }
      else {
        this.notificationService.notifySuccess("Update Successfully Completed", "");
        //this.updateGrid();
        this.showWindow = {};
        this.refreshData(); 
      }
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();
}

GasLCRestatusInit()
{

  this.isSubmitting = false; 
  this.checkedItems = this.getCheckedItems(); 

  this.validationErrors = {};
  if (this.checkedItems?.length == 0) {
    this.validationErrors.Selected = "No Order Number(s) were selected";
    
  }

  this.reviewData = new ReviewModel(); 
  this.reviewData.checkedItems = this.checkedItems;
  this.reviewData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
  this.reviewData.UserVendor = this.user.Vendor;
  this.reviewData.Key = this.appDataService.currentNavigationItem.key; 
  this.reviewData.Data = this.checkedItems?.map(e => {
    let rObj = {}
    rObj['OrderNumber'] = e.ORDERNUMBER;
    rObj['WorkOrderState'] = e.WORKORDERSTATE;
    rObj['OrderType'] = e.ORDERTYPE;

    return rObj
  });

  this.showWindow['GAS_LC_RESTATUS'] = true; 
  
}

GasLCRestatusSubmit()
{


  if (Object.keys(this.validationErrors).length) {
    
    console.log('has error');
    return;
  }

  
  this.isSubmitting = true; 
  this.reviewService.GasLCRestatus(this.reviewData).pipe(
    tap(result => {
      console.log('result', result);
      if (result.errormessage) {
        //Notify message
        this.notificationService.notifyError("Update Failed", result.errormessage);
      }
      else {
        this.notificationService.notifySuccess("Update Successfully Completed", "");
        //this.updateGrid();
        this.showWindow = {};
        this.refreshData(); 
      }
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();
}

searchWorkOrder()
{
  console.log('reviewData', this.reviewData); 
  
  this.isSubmitting = true; 

  this.reviewService.FetchOrderNumbers(this.reviewData.Key, this.reviewData.OrderNumberInput).pipe(
    tap(result => {
      this.reviewData.LK_OrderNumber = result.Data || [];
      this.reviewData.OrderNumber = {}; 
      this.isSubmitting = false; 
      console.log('LK_OrderNumber', this.reviewData.LK_OrderNumber);

    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();

}
GasLCFixInit()
{

  this.isSubmitting = false; 
  this.checkedItems = this.getCheckedItems(); 

  this.validationErrors = {};
  if (this.checkedItems?.length == 0) {
    this.validationErrors.Selected = "No Order Number(s) were selected";
    
  }

  this.reviewData = new ReviewModel(); 
  this.reviewData.checkedItems = this.checkedItems;
  this.reviewData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
  this.reviewData.UserVendor = this.user.Vendor;
  this.reviewData.Key = this.appDataService.currentNavigationItem.key; 
  this.reviewData.Data = this.checkedItems?.map(e => {
    let rObj = {}
    rObj['OrderNumber'] = e.ORDERNUMBER;
    rObj['WorkOrderState'] = e.WORKORDERSTATE;

    return rObj
  });

  this.showWindow['GAS_LC_FIXED'] = true; 
  
}
CPStatusReviewedSubmit()
{

  if (Object.keys(this.validationErrors).length) {
    
    console.log('has error');
    return;
  }

  this.reviewService.CPStatus(this.reviewData).pipe(
    tap(result => {
      console.log('result', result);
      if (result.errormessage) {
        //Notify message
        this.notificationService.notifyError("Update Failed", result.errormessage);
      }
      else {
        this.notificationService.notifySuccess("Update Successfully Completed", "");
        //this.updateGrid();
        this.showWindow = {};
        this.refreshData(); 
      }
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();
}



DesignInstalledStatusReviewedSubmit()
{
  
  if (Object.keys(this.validationErrors).length) {
    
    console.log('has error');
    return;
  }

  this.reviewService.DesignInstalledStatus(this.reviewData).pipe(
    tap(result => {
      console.log('result', result);
      if (result.errormessage) {
        //Notify message
        this.notificationService.notifyError("Update Failed", result.errormessage);
      }
      else {
        this.notificationService.notifySuccess("Update Successfully Completed", "");
        //this.updateGrid();
        this.showWindow = {};
        this.refreshData(); 
      }
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();
}
HPTStatusReviewedSubmit()
{
  
  if (Object.keys(this.validationErrors).length) {
    
    console.log('has error');
    return;
  }

  this.reviewService.HPTStatus(this.reviewData).pipe(
    tap(result => {
      console.log('result', result);
      if (result.errormessage) {
        //Notify message
        this.notificationService.notifyError("Update Failed", result.errormessage);
      }
      else {
        this.notificationService.notifySuccess("Update Successfully Completed", "");
        //this.updateGrid();
        this.showWindow = {};
        this.refreshData(); 
      }
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();
}

HPTStatusReviewedNonWOTSSubmit()
{
  
  if (Object.keys(this.validationErrors).length) {
    
    console.log('has error');
    return;
  }

  this.reviewService.HPTStatusNonWOTS(this.reviewData).pipe(
    tap(result => {
      console.log('result', result);
      if (result.errormessage) {
        //Notify message
        this.notificationService.notifyError("Update Failed", result.errormessage);
      }
      else {
        this.notificationService.notifySuccess("Update Successfully Completed", "");
        //this.updateGrid();
        this.showWindow = {};
        this.refreshData(); 
      }
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();
}

restatusSubmit()
{

  if (Object.keys(this.validationErrors).length) {
    
    console.log('has error');
    return;
  }

  this.reviewService.Restatus(this.reviewData).pipe(
    tap(result => {
      console.log('result', result);
      if (result.errormessage) {
        //Notify message
        this.notificationService.notifyError("Update Failed", result.errormessage);
      }
      else {
        this.notificationService.notifySuccess("Update Successfully Completed", "");
        //this.updateGrid();
        this.showWindow = {};
        this.refreshData(); 
      }
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();}

resubmitSubmit()
{

  if (Object.keys(this.validationErrors).length) {
    
    console.log('has error');
    return;
  }
  
  this.reviewService.Resubmit(this.reviewData).pipe(
    tap(result => {
      console.log('result', result);
      if (result.errormessage) {
        //Notify message
        this.notificationService.notifyError("Update Failed", result.errormessage);
      }
      else {
        this.notificationService.notifySuccess("Update Successfully Completed", "");
        //this.updateGrid();
        this.refreshData(); 
        this.showWindow = {};
      }
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();

}


exportDataInit()
{
  this.exportData = new ExportModel(); 
  var today = new Date();
  this.exportData.ExportName = "Export-" + this.appDataService.currentNavigationItem.label + today.toLocaleDateString("en-US"); 
  this.showWindow['EXPORT'] = true; 
}
exportDataSubmit ()
{

  console.log('exportData', this.exportData);
  this.exportData.Key = this.appDataService.currentNavigationItem.key; 
  if  (this.exportData.ExportOption == 'Selection')
  {
      //Get Checked Items
      this.exportData.SelectedIDs = this.getCheckedItems().map(e=>e.UI_ID); 
  }
  console.log('exportData', this.exportData);
  this.reviewService.exportData(this.exportData, this.cols, this.searchParams, this.gridParam).pipe(
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
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    finalize(() => this.isLoading = false),
  ).subscribe();

}
fetchData(searchParams: any, state?: any) {
  console.log('fetchData', searchParams, state);

  
  if (!this.appDataService.currentNavigationItem?.key)
  {
    return; 
  }

  this.isLoading = true;
  this.isRunning = true; 
  this.reviewService.fetchData(this.appDataService.currentNavigationItem.key, searchParams, state).pipe(
    tap(result => {
      console.log('result', result);
      this.records = result['Data']  || [];
      this.checkedState = []; 
      this.totalRecords = result['Total'];
      this.isRunning = false; 
      this.searchClicked = true; 
     
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    finalize(() => this.isLoading = false),
  ).subscribe();
  // .subscribe(result => {
  //   //this.datacorrections = result;
  //   this.datacorrections = result as any[]; // new MatTableDataSource <DataCorrectionElement>(result as DataCorrectionElement[]);
  //   // this.datacorrections.sort = this.sort;      
  //   // this.datacorrections.paginator = this.paginator; 
  //   //console.log(this.displayedColumns); 
  // }, error => console.error(error));
}
onLazyLoad(event: any) {
  console.log('onLazyLoad', this.searchClicked);

  // reset state

  
  if (this.searchParams && this.searchClicked) {
    this.gridParam = event;

    this.fetchData(this.searchParams, event);
    this.searchClicked = false; 
  }

}

initCheckState(isChecked: boolean) {
  const data = this.records || [];
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
  return this.records.filter(e => !!this.checkedState[e['UI_ID']]);
}
getCheckedItemsList() {
  return this.checkedItems?.map(e => e.ISSUE_ID).join(', ');
}

refreshData() {
  this.fetchData(this.searchParams, this.gridParam);
}

}

class ReviewModel
{
    Data: any[]; 
    checkedItems: any[];
    checkedItemsList: string = "";
    Key: string;
    UserVendor: string; 
    WorkType: string; 
    OrderNumberInput: string; 
    LK_OrderNumber: any[]; 
    OrderNumber: any; 
    Comment: string; 

}


class ExportModel {
  ExportOption: string = "All";
  ExportName: string;
  Key: string; 
  SelectedIDs: any[]; 
}