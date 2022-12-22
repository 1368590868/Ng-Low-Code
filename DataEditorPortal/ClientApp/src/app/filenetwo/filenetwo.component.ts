import { Component, OnDestroy, OnInit, ViewChild, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent, UrlSerializer, UrlTree, DefaultUrlSerializer } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { AppDataService } from '../services/app-data.service';
import { FileNetWOService } from '../services/filenetwo.service';
import { NotificationService } from '../services/notification.service';
import { UIService } from '../services/UI.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-filenetwo',
  templateUrl: './filenetwo.component.html',
  styleUrls: ['./filenetwo.component.css']
})
export class FileNetWOComponent implements OnInit, OnDestroy {
  @ViewChild('table') table; 

  user: any;
  isLoading = false;
  totalRecords = 0;
  isRunning = false;
  searchClicked: boolean = false;

  workorders: any[];
  woDetail: DetailModel;
  selectedItem: any[];
  checkedCount = 0;
  checkedState = {};
  checkedItems = [];
  checkedItemsList = "";
  exportData: ExportModel;
  exceptionData: ExceptionModel;
  showWindow = {};
  workOrderData: WorkOrderModel;
  validationErrors: any;
  releaseData: ReleaseModel;
  cols: any[];
  colData: any[];

  searchParams: any;
  gridParam: any;
  destroy$ = new Subject<void>();

  @Input() get selectedColumns(): any[] {
    return this.cols; //.filter(c=>!c.hidden); ;
  }

  constructor(
    private router: Router,
    private filenetService: FileNetWOService,
    private notificationService: NotificationService,
    private uiService: UIService,
    public appDataService: AppDataService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute
  ) {
    this.user = userService.USER;
  }

  public getDefaultColumns(getState: boolean): any[] {

    var defaultcols: any[] = [
      { field: 'FNDOCID', header: 'FNDOCID', width: '200px', filterType: 'text' },
      { field: 'BATCH', header: 'Batch', width: '200px', filterType: 'text' },
      { field: 'ORDERNUMBER', header: 'Order Number', width: '200px', filterType: 'text' },
      { field: 'FILENET_ORDER_TYPE', header: 'FileNet Order Type', width: '200px', filterType: 'text' },
      { field: 'WOTS_STATUS', header: 'WOTS Status', width: '200px', filterType: 'text' },
      { field: 'WORKTYPE', header: 'Work Type', width: '150px', filterType: 'text' },
      { field: 'ORDER_TYPE', header: 'Order Type', width: '200px', filterType: 'text' },
      { field: 'CATEGORY', header: 'Category', width: '150px', filterType: 'text' },
      { field: 'DOCUMENT_TYPE', header: 'Document Type', width: '150px', filterType: 'text' },
      { field: 'MAINTENANCEACTIVITYTYPE', hidden: true, header: 'Maint. Act. Type', width: '200px', filterType: 'text' },
      { field: 'ROOM', header: 'Room', width: '200px', filterType: 'text' },
      { field: 'ASSOCIATED_MAIN_ORDER', header: 'Associated Main Order', width: '200px', filterType: 'text' },
      { field: 'SUPERIOR_ORDER', hidden: true,  header: 'Superior Order', width: '200px', filterType: 'text' },
      { field: 'MAINWORKCENTER', header: 'Main Work Center', width: '200px', filterType: 'text' },
      { field: 'PLANPLANT', header: 'Plan Plant', width: '200px', filterType: 'text' },
      { field: 'FUNCTIONAL_LOCATION', header: 'Functional Location', width: '250px', filterType: 'text' },
      { field: 'OFFICE', header: 'Office', width: '200px', filterType: 'text' },
      { field: 'WBSHEADER', hidden: true, header: 'WBS Header', width: '200px', filterType: 'text' },
      { field: 'LOCATION', header: 'Location', width: '250px', filterType: 'text' },
      { field: 'STREET_NUMBER', header: 'Street Number', width: '200px', filterType: 'text' },
      { field: 'STREET_NAME', header: 'Street Name', width: '200px', filterType: 'text' },
      { field: 'CITY', header: 'City', width: '200px', filterType: 'text' },
      { field: 'REGIONAL_PREFIX', hidden: true, header: 'Regional Prefix', width: '200px', filterType: 'text' },
      { field: 'STATE', header: 'State', width: '100px', filterType: 'text' },
      { field: 'KEY_MAP', hidden: true, header: 'Key Map', width: '150px', filterType: 'text' },
      { field: 'ACTIVEUSERSTATUS', hidden: true,  header: 'Active User Status', width: '250px', filterType: 'text' },
      { field: 'WO_COMPLETION_DATE',hidden: true,  header: 'W.O. Completion Date', width: '200px', filterType: 'date' },
      { field: 'DATE_MODIFIED',hidden: true,  header: 'Date Modified', width: '200px', filterType: 'date' },
      { field: 'CREATION_USER', hidden: true, header: 'Creation User', width: '200px', filterType: 'text' },
      { field: 'LAST_USER',hidden: true,  header: 'Last User', width: '200px', filterType: 'text' },
      { field: 'WO_CREATION_USER', hidden: true, header: 'WO Creation User', width: '200px', filterType: 'text' },
      { field: 'WO_LAST_USER', hidden: true, header: 'WO Last User', width: '200px', filterType: 'text' },
      { field: 'COMMENTS', header: 'Comments', width: '250px', filterType: 'text' }
  ];

    //Add the state information for visibility 
    var stateColsString = localStorage.getItem("FN-displayColumns");

    if (getState && stateColsString) {
      var stateCols = JSON.parse(stateColsString);
      console.log('stateCols', stateCols);
      for (let i = 0; i < defaultcols.length; i++) {
        var match = stateCols.filter(f => f.field == defaultcols[i].field)[0];
        if (match) {
          
          defaultcols[i].hidden = match.hidden;
        }
        else 
        {
          defaultcols[i].hidden = true;
        }
      }
    }
    console.log('defaultCOlumns', defaultcols);
    return defaultcols;
  }

  ngOnInit() {
    // this.fetchData();

    setTimeout(() => {
      this.cols = this.getDefaultColumns(true).filter(f=>!f.hidden);; 
    }, 1);

    this.appDataService.searchClicked$.pipe(
      
      tap(searchParams => {
        this.searchClicked = false; 
        this.uiService.addSiteVisitLog('FILENET_WOTS', 'Search', this.searchParams);

        this.table.reset();
        if (this.table.columns)
        {
          console.log('this.table.columns', this.table.column); 
          this.cols = this.table.columns; 
        }       
        else 
        {
          console.log('this.table.columns 2', this.table.column); 
          this.table.columns = this.cols; 
        }

        //this.isRunning = true;
        this.fetchData(searchParams);
        this.searchParams = searchParams;

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
    this.filenetService.fetchData(searchParams, state).pipe(
      tap(result => {
        console.log('result', result);
        this.workorders = result['Data'] || [];
        this.totalRecords = result['Total'];
        this.isRunning = false;
        this.initCheckState(false);
        this.searchClicked = true;

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      finalize(() => this.isLoading = false),
    ).subscribe();

  }



  editExceptionInit(data) {
    this.exceptionData = new ExceptionModel();

    if (data.WORKTYPE == 'GAS') {
      this.exceptionData.FunctionalLocation = data.FUNCTIONAL_LOCATION;
      this.exceptionData.DocumentType = data.DOCUMENT_TYPE;

      this.exceptionData.OfficeCode = data.OFFICE;

      //Get Lookup
      this.uiService.getLookups('SAPFuncLocation').pipe(
        tap(result => {
          this.exceptionData.LK_FunctionalLocation = result || [];
        }),
        catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      ).subscribe();

      // this.uiService.getLookups('DocumentTypeGas').pipe(
      //   tap(result => {
      //     this.exceptionData.LK_DocumentType = result || [];
      //   }),
      //   catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      // ).subscribe();
    }
    else if (data.WORKTYPE == 'ELECTRIC') {
      this.exceptionData.Category = data.CATEGORY;
      this.exceptionData.DocumentType = data.DOCUMENT_TYPE;

      //Get Lookup
      this.uiService.getLookups('SAPCategory').pipe(
        tap(result => {
          this.exceptionData.LK_Category = result || [];
        }),
        catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      ).subscribe();
    }
    this.exceptionData.WorkType = data.WORKTYPE;
    this.exceptionData.FNDOCID = data.FNDOCID;
    this.exceptionData.Batch = data.BATCH;
    this.exceptionData.OrderNumber = data.ORDERNUMBER;
    this.exceptionData.WOTSStatus = data.WOTS_STATUS;
    this.exceptionData.Comments = data.COMMENTS;

    //Get Lookup
    this.uiService.getLookups('WOTSStatus').pipe(
      tap(result => {
        this.exceptionData.LK_WOTSStatus = result || [];
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.showWindow['EXCEPTION'] = true;
  }

  editExceptionSubmit() {
    this.uiService.addSiteVisitLog('FILENET_WOTS', 'Edit Exception', this.exceptionData);

    this.validationErrors = {};

    if (!this.exceptionData.OrderNumber) {
      this.validationErrors.OrderNumber = "Order Number is required";
    }

    if (!this.exceptionData.Batch) {
      this.validationErrors.Batch = "Batch Number is required";
    }

    if (this.exceptionData.WorkType == "GAS") {


      if (!this.exceptionData.FunctionalLocation) {
        this.validationErrors.FunctionalLocation = "Functional Location is required";
      }
      else {
        //Check Functional Location 
        var luFound = this.exceptionData.LK_FunctionalLocation.filter(f => f.Value && this.exceptionData.FunctionalLocation.includes(f.Value));
        if (luFound.length) {
          console.log('LU FOUND', luFound);
        }
        else {
          console.log('LU NOT FOUND', luFound);
          this.validationErrors.FunctionalLocation = "Invalid SAP Functional Location";

        }
      }

    }
    else {
      if (!this.exceptionData.Category) {
        this.validationErrors.Category = "Category is required";
      }

    }
    //Validate Batch 
    this.filenetService.validateBatch(this.exceptionData.Batch).pipe(
      tap(result => {

        console.log('updateException result', result);
        if (result.errormessage) {
          //Notify message
          this.validationErrors.Batch = "Batch Number Does Not Exist";

        }
        else {
          this.filenetService.updateException(this.exceptionData).pipe(
            tap(result => {
      
              console.log('updateException result', result);
              if (result.errormessage) {
                //Notify message
                this.notificationService.notifyError("Update Failed", result.errormessage);
              }
              else {
                //Add to response data 
                //we're good
                this.notificationService.notifySuccess("Updates Successfully Completed", "");
                this.refreshData();
                this.showWindow = {};
              }
      
            }),
            catchError(err => this.notificationService.notifyErrorInPipe(err, []))
      
          ).subscribe();
        }

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, []))

    ).subscribe();


  }


  openDetail(data) {
    this.woDetail = new DetailModel();
    this.woDetail.FNDOCID = data['FNDOCID'];
    //query for item
    this.uiService.addSiteVisitLog('FILENET_WOTS', 'View Detail', data);
    this.filenetService.fetchDetailData(data['FNDOCID']).pipe(
      tap(result => {
        this.woDetail.Details = result || [];
        console.log('details', this.woDetail);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


    this.showWindow['DETAIL'] = true;

  }


  initCheckState(isChecked: boolean) {
    const data = this.workorders || [];
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
    return this.workorders.filter(e => !!this.checkedState[e['UI_ID']]);
  }
  getCheckedItemsList() {
    return this.checkedItems?.map(e => e.UI_ID).join(', ');
  }

  onLazyLoad(event: any) {

    // reset state
    this.gridParam = event;

    
    if (this.searchParams && this.searchClicked) {
      this.gridParam = event;
      console.log('onLazyLoad', event);

      this.fetchData(this.searchParams, event);
      this.searchClicked = false; 
    }
  }

  public resetColumns()
  {

    
    this.confirmationService.confirm({
      target: event.target,
      message: 'Are you sure that you want to reset your table back to the original view?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        //confirm action
        //refresh attachment list
       
        localStorage.removeItem("FN-state"); 
        localStorage.removeItem("FN-displayColumns"); 
        this.cols = this.getDefaultColumns(false).filter(f=>!f.hidden);; 
        this.cols = this.cols; 
    
        console.log('reset'); 
        },
      reject: () => {
        //reject action
      }
    });
  }

  releaseHoldInit() {

    this.validationErrors = {};

    this.releaseData = new ReleaseModel();

    this.releaseData.checkedItems = this.getCheckedItems();

    let invalidItems = [];
    this.releaseData.checkedItems.forEach(function (item) {
      if (item.WOTS_STATUS != 'WOTS HOLD') {
        //Can't assign this issue
        invalidItems.push(item.ORDERNUMBER);
      }
    }
    );


    if (invalidItems.length > 0) {
      this.validationErrors.ErrorIssues = invalidItems.join(', ');
    }



    if (this.releaseData.checkedItems?.length == 0) {
      this.validationErrors.Selected = "No Work Orders Selected";
    }


    console.log('this.validationErrors', this.validationErrors);
    if (Object.keys(this.validationErrors).length) {
      this.showWindow['RELEASE'] = true;
      console.log('has error');
      return;
    }

    this.releaseData.checkedItemsList = this.releaseData.checkedItems?.map(e => e.ORDERNUMBER).join(', ');

    this.releaseData.OrderNumbers = this.releaseData.checkedItems?.map(e => {
      let rObj = {}
      rObj['ORDERNUMBER'] = e.ORDERNUMBER;
      rObj['FNDOCID'] = e.FNDOCID;
      return rObj
    });

    console.log('releaseData', this.releaseData);
    this.showWindow['RELEASE'] = true;
  }

  releaseHoldSubmit() {

    this.uiService.addSiteVisitLog('FILENET_WOTS', 'Release Hold', this.releaseData);

    this.filenetService.releaseHold(this.releaseData).pipe(
      tap(result => {

        console.log('releaseHold result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Update Failed", result.errormessage);
        }
        else {
          //Add to response data 
          //we're good
          this.notificationService.notifySuccess("Updates Successfully Completed", "");
          this.refreshData();
          this.showWindow = {};
        }

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, []))

    ).subscribe();
  }
  exportDataInit() {
    this.exportData = new ExportModel();
    var today = new Date();
    this.exportData.ExportName = "Export-FileNet WOTS WorkOrder Results-" + today.toLocaleDateString("en-US");

    this.showWindow['EXPORT'] = true;
  }

  public showColumnsInit() {
    console.log('show columns', this.cols);

    this.colData = this.getDefaultColumns(false); 
    var visibleItems = this.cols.map(m=>m.field); 
    console.log('visibleItems', visibleItems); 
    this.colData.forEach(f=> {
      if (visibleItems.includes(f.field))
      {
        f.hidden = false; 
      }
      else 
      {
        f.hidden = true; 
      }
    }); 
    console.log('colData', this.colData); 

    // this.cols; // Object.assign([], this.cols);
    this.showWindow["COLUMNS"] = true;

  }
  public showColumnsSubmit() {
    console.log('submit columns', this.colData);
  }

  public showColumnsChange(c: any, checked: boolean) {
    
    c.hidden = !checked;
    
    var getCol = this.cols.findIndex(x => x.field == c.field);  
    console.log('colmatch', getCol); 
    if (c.hidden)
    {     
      if (getCol > -1)
      {
        this.cols.splice(getCol, 1); // = this.colData.filter(f=>!f.hidden); 
      }
    }
    else 
    {
       if (getCol < 0)
       {
         //Find closest non-hidden one 
         var pos = this.colData.indexOf(c); 
         this.cols.splice(pos, 0, c);
        
          //Add column 
          
       }
    }

    //store state 
    console.log('this.cols', this.cols);
    localStorage.setItem("FN-displayColumns", JSON.stringify(this.cols));
    return;

    //modify state stored 
    var stateDataString = localStorage.getItem('FN-state');
    if (stateDataString) {
      var stateData = JSON.parse(stateDataString);
      console.log('stateData', stateDataString);
      //rebuild width 
      var stateWidths = stateData.columnWidths.split(',');
      var idx = stateData.columnOrder.indexOf(c.field);
      stateWidths[idx + 1] = c.width.replace('px', '');

//      if (c.hidden) {
//        stateWidths[idx + 1] = 400;
//      }
//      else {
//        stateWidths[idx + 1] = c.width.replace('px', '');
//      }

      //get total 
      var totalWidth = stateWidths.reduce((a, b) => parseInt(a) + parseInt(b), 0);
      stateData.tableWidth = (totalWidth + 2) + 'px';
      stateData.columnWidths = stateWidths.join(',');

      localStorage.setItem('FN-state', JSON.stringify(stateData));

    }

  }
  exportDataSubmit() {

    console.log('exportData', this.exportData);
    this.uiService.addSiteVisitLog('FILENET_WOTS', 'Export Data', this.exportData);

    if (this.exportData.ExportOption == 'Selection') {
      //Get Checked Items
      this.exportData.SelectedIDs = this.getCheckedItems().map(e => e.UI_ID);
    }
    else {
      this.exportData.SelectedIDs = [];
    }
    console.log('exportData', this.exportData);
    this.filenetService.exportData(this.exportData, this.cols, this.searchParams, this.gridParam).pipe(
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



  }
  editInit(data) {

  }

  addNewInit() {

  }

  editSubmit() {

  }

}


class ExportModel {
  ExportOption: string = "All";
  ExportName: string;
  Key: string;
  SelectedIDs: any[];
}


class WorkOrderModel {


}


class DetailModel {
  FNDOCID: string;
  Details: any[];
}

class ReleaseModel {
  checkedItems: any[];
  checkedItemsList: string = "";
  OrderNumbers: any[];

}

class ExceptionModel {
  LK_FunctionalLocation: any[];
  LK_WOTSStatus: any[];
  LK_Category: any[];
  LK_DocumentType: any[]; 
  FNDOCID: string;
  OrderNumber: string;
  FunctionalLocation: string;
  Category: string;
  DocumentType: string;
  Batch: string;
  OfficeCode: string;
  WOTSStatus: string;
  Comments: string;
  WorkType: string;
}