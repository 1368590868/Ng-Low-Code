import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent, UrlSerializer, UrlTree, DefaultUrlSerializer } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { AppDataService } from '../services/app-data.service';
import { DataCorrectionService } from '../services/data-correction.service';
import { NotificationService } from '../services/notification.service';
import { UIService } from '../services/UI.service';
import { DataCorrectionDialogs } from './data-correction-dialogs.component';
import { ConfirmationService } from 'primeng/api';

// import { MatSort } from '@angular/material/sort';
// import { MatPaginator  } from '@angular/material/paginator';
// import { MatTableDataSource } from '@angular/material/table';
//import { ViewChild } from '@angular/core';
//import { DataCorrectionElement, DataCorrection_DisplayCoumns } from '../models/data-correction';

@Component({
  selector: 'app-data-correction',
  templateUrl: './data-correction.component.html',
  styleUrls: ['./data-correction.component.css']
})

export class DataCorrectionComponent implements OnInit, OnDestroy {
  @ViewChild(DataCorrectionDialogs) dataCorrectionDialogs;
  @ViewChild('table') table;
  user : any; 
  isLoading = false;
  totalRecords = 0;
  isRunning = false; 

  isSubmitting: boolean = false; 
  datacorrections: any[];
  selectedItem: any[];
  checkedCount = 0;
  checkedState = {};
  checkedItems = [];
  checkedItemsList = "";
  exportData: ExportModel; 
  showWindow = {}; 
  searchClicked: boolean = false;
  followData: FollowModel; 
  validationErrors: any; 
  // showWindow: boolean = false; 

  //displayedColumns: string[] = DataCorrection_DisplayCoumns; // ['ISSUE_ID', 'ISSUE_NAME', 'ISSUE_DESCRIPTION', 'STATUSDESCRIPTION', 'LAST_UPDATED', 'ASSIGNED_TO_NAME', 'DATE_SUBMITTED', 'WHO_ISSUED', 'DEPARTMENT', 'LOCATION'];

  // @ViewChild(MatSort, { static: true }) sort: MatSort;
  // @ViewChild(MatPaginator) paginator: MatPaginator;
  cols: any[]; 
  searchParams: any;
  gridParam: any; 
  destroy$ = new Subject<void>();

  
  constructor(
    private router: Router,
    private dataCorrectionService: DataCorrectionService,
    private notificationService: NotificationService,
    private uiService: UIService,
    public appDataService: AppDataService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute, 
    private confirmationService: ConfirmationService
  ) {
    this.user = userService.USER; 
    console.log('user', this.user); 
  }

  ngOnInit() {
    // this.fetchData();
    this.initColumns();
    this.appDataService.searchClicked$.pipe(

      tap(searchParams => {
        this.searchClicked = false; 
        //this.isRunning = true;
        this.uiService.addSiteVisitLog('DC', 'Search', searchParams);
        this.fetchData(searchParams);
        this.table.reset();     

        this.searchParams = searchParams;
        console.log('data-correction searched');

        console.log('local storage', localStorage.getItem("DC-state")); 
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    
    this.route.params.pipe(
      takeUntil(this.destroy$)
      ).subscribe((param: any) => {
        console.log('Param', param['id']); 
        if (param['id'])
        {

          this.route.queryParams.subscribe(qparams => {
            console.log('queryParamsMap', qparams);
            var searchItem = {
              Name: "ISSUE_ID",
              Type: "pInputText",
              WhereClause: "ISSUE_ID = '{0}'",
              SelectedValue: qparams['Issue_ID']          
            };
            var searchParam = []; 
            searchParam.push(searchItem); 
            console.log('Route Search Param', searchParam); 
    
            this.fetchData(searchParam);
          }); 
        // var value = decodeURIComponent(param['id']);
        // let dus = new DefaultUrlSerializer();
        // let path = dus.parse(value); 
        // console.log('Param Path', path); 
        

      }
    });
  }
  
  initColumns() { 
    this.cols =  [
      { field: 'ISSUE_ID', header: 'ID', width: '100px', filterType: 'text' },
      { field: 'ISSUE_NAME', header: 'Name', width: '250px', filterType: 'text' },
      { field: 'STATUSDESCRIPTION', template: '{{data[\'CURRENTSTATUS\']}}', header: 'Status', width: '250px', filterType: 'text' }, //CURRENTSTATUS
      { field: 'ISSUE_DESCRIPTION', header: 'Description', width: '250px', filterType: 'text' },
      { field: 'LAST_UPDATED', header: 'Last Updated', width: '250px', filterType: 'text' },
      { field: 'ASSIGNED_TO_NAME', header: 'Assigned To', width: '250px', filterType: 'text' },
      { field: 'DATE_SUBMITTED', header: 'Submitted On', width: '250px', filterType: 'text' },
      { field: 'WHO_ISSUED', header: 'Submitted By', width: '250px', filterType: 'text' },
      { field: 'DEPARTMENT', header: 'Department', width: '250px', filterType: 'text' },
      { field: 'LOCATION', header: 'Location', width: '250px', filterType: 'text' },
      { field: 'DATA_CORC_TYPE_LABEL', header: 'Correction Type', width: '250px', filterType: 'text' },
      { field: 'ORDERNUMBER', header: 'W.O. Number', width: '250px', filterType: 'text' },
      { field: 'CHARGEABLE', header: 'Chargeable', width: '250px', filterType: 'text' },
      { field: 'COMPLETION_DATE', header: 'Cust. Need Date', width: '250px', filterType: 'date' },
      { field: 'VENDORE_EST_DATE', header: 'Vendor Est. Date', width: '250px', filterType: 'date' },
      { field: 'QCCOMPLETIONDATE', header: 'QC Completion Date', width: '250px', filterType: 'date' },
      { field: 'VENDOR', header: 'Vendor', width: '250px', filterType: 'text' },
      { field: 'VENDORCOMMENTS', header: 'Vendor Comment', width: '250px', filterType: 'text' },
      { field: 'REASONTOUPDATE', header: 'Remarks', width: '250px', filterType: 'text' },
      { field: 'CREATEDBY', header: 'Created By', width: '250px', filterType: 'text' }
    
    ];
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
this.dataCorrectionService.fetchData(searchParams, state).pipe(
      tap(result => {

        

        console.log('result', result);
        this.datacorrections = result['Data']  || [];
        this.totalRecords = result['Total'];
        this.isRunning = false;
        this.searchClicked = true;

        
        setTimeout(() => {
                      //add Follow Information         
          //Get list of UI_ID 
          this.followQueryUser(); 

        }, 0);
        this.initCheckState(false);
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


  openExportItem() {
    console.log('export item');

    this.checkedItems = this.getCheckedItems();
    this.dataCorrectionDialogs.exportItemInit(this.checkedItems);

  }

  
  openAddNewItem()
  {
    this.dataCorrectionDialogs.addNewInit(); 

  }

  openAttachment(data)
  {
    this.dataCorrectionDialogs.attachmentInit(data); 

  }

  openResponse(data)
  {
    this.dataCorrectionDialogs.responseInit(data); 
    
  }

  openDetail(data)
  {
    this.dataCorrectionDialogs.detailInit(data); 
    
  }

  openUpdateStatusTool()
  {
    this.checkedItems = this.getCheckedItems();
    this.dataCorrectionDialogs.updateStatusInit(this.checkedItems);

  }

  
  openReopenTool()
  {
    this.checkedItems = this.getCheckedItems();
    this.dataCorrectionDialogs.reopenInit(this.checkedItems);

  }


  showEdit(data: any) : boolean 
  {
       if (this.user.Permissions.DC_EDIT_BASIC || this.user.Permissions.DC_EDIT_ALL) 
       {
          if (data.VENDOR && this.user.Permissions.DC_EDIT_VENDOR_ONLY && this.user.Vendor != data.VENDOR)
          {
            return false; 
          }
          else 
          {
              return true; 
          }
       }
       else
       {
         return false; 
       }
  }

  openEdit(data)
  {
    this.dataCorrectionDialogs.editInit(data)
  }
  openAssignUserTool() {

    //    this.assignUserWindow = true;
    this.checkedItems = this.getCheckedItems();
    this.dataCorrectionDialogs.assignUserInit(this.checkedItems);

    // this.showWindow = true; 
    console.log('checkedItem', this.checkedItems);

    // this.notificationService.notifyInfo('Assign User', 'Finish update user assignment in the popup window');
  }
  
  initCheckState(isChecked: boolean) {
    const data = this.datacorrections || [];
    this.checkedState = data.reduce((checkedState, e) => {
      checkedState[e['ISSUE_ID']] = isChecked;
      return checkedState;
    }, {});
    this.checkedCount = this.getCheckedItems()?.length;
  }
  toggleCheckState(item: any) {
    if (!item || !item['ISSUE_ID']) {
      return;
    }
    const currentCheckState = this.checkedState[item['ISSUE_ID']];
    this.checkedState[item['ISSUE_ID']] = !currentCheckState;
    this.checkedCount = this.getCheckedItems()?.length;
  }
  getCheckedItems() {
    return this.datacorrections.filter(e => !!this.checkedState[e['ISSUE_ID']]);
  }
  getCheckedItemsList() {
    return this.checkedItems?.map(e => e.ISSUE_ID).join(', ');
  }

  onLazyLoad(event: any) {
    console.log('onLazyLoad', event);

    // reset state
    this.gridParam = event; 

    if (this.searchParams && this.searchClicked) {
      this.gridParam = event;

      this.fetchData(this.searchParams, event);
      this.searchClicked = false; 
    }
  }
  public resetColumns() {


    this.confirmationService.confirm({
      target: event.target,
      message: 'Are you sure that you want to reset your table back to the original view?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        //confirm action
        //refresh attachment list
        localStorage.removeItem("DC-state");
        this.initColumns();

        console.log('reset');
      },
      reject: () => {
        //reject action
      }
    });
  }
  
exportDataInit()
{
  this.exportData = new ExportModel(); 
  this.isSubmitting = false; 

  var today  = new Date();
  this.exportData.ExportName = "Export-Data Correction Results-" + today.toLocaleDateString("en-US"); 
  
  this.showWindow['EXPORT'] = true; 
}
exportDataSubmit ()
{

  console.log('exportData', this.exportData);

  this.isSubmitting = true; 

  this.uiService.addSiteVisitLog('DC', 'Export', this.exportData);
  
  if  (this.exportData.ExportOption == 'Selection')
  {
      //Get Checked Items
      this.exportData.SelectedIDs = this.getCheckedItems().map(e=>e.ISSUE_ID); 
  }
  else 
  {
    this.exportData.SelectedIDs = []; 
  }
  console.log('exportData', this.exportData);
  this.dataCorrectionService.exportData(this.exportData, this.cols, this.searchParams, this.gridParam).pipe(
    tap(result => {

      console.log(result); 
      const url = window.URL.createObjectURL(result);
      const a = document.createElement('a');

      a.href = url;

      const fileName = this.exportData.ExportName + '.xlsx';
      a.download = fileName;
      a.click();
      a.remove();
      this.isSubmitting = false; 

     
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, []))

  ).subscribe();


  
}


public followQueryUser() {

  var followData = new FollowModel();
  followData.User = this.user.Username;
  if (this.datacorrections.length) {
    followData.ISSUE_ID = this.datacorrections.map(e => e.ISSUE_ID);
  }

  if (followData.ISSUE_ID.length) {


    this.dataCorrectionService.fetchFollowByUserData(followData).pipe(
      tap(result => {


        if (result['Data'].length > 0) {
          var result = result['Data'] || [];
          console.log('followdata', result);
          result.forEach(e => {
            
              var match = this.datacorrections.filter(f => f.ISSUE_ID == e.ISSUE_ID)[0];
              if (match) {
                match.Follow = true;
              }
            
          });

          console.log('listRecord', this.datacorrections);
        }


      })).subscribe();
  }

}
public followEdit(data) {

  this.followData = new FollowModel();
  this.followData.User = this.user.Username;

  this.followData.checkedItems.push(data);
  this.followData.checkedItemsList = data.ISSUE_ID;

  this.followData.ISSUE_ID = [];
  this.followData.ISSUE_ID.push(data.ISSUE_ID);
  console.log('followEdit', this.followData);
  this.dataCorrectionService.fetchFollowByUserData(this.followData).pipe(
    tap(result => {


      if (result['Data'].length > 0) {
        var result = result['Data'] || [];
        this.followData.Status = result.map(m => m.STATUSCHANGE);

        console.log('follow Source', result)


        this.showWindow['FOLLOW'] = true;
      }


    })).subscribe();

}


openFollow(data) {
  if (data?.Follow)
  {
    this.followEdit(data); 
  }
  else 
  {
    this.followAdd(data); 
  }
}



public followSelected() {
  this.followData = new FollowModel();
  this.checkedItems = this.getCheckedItems();

  this.followData.checkedItems = this.checkedItems;
  this.followData.checkedItemsList = this.checkedItems?.map(e => e.ISSUE_ID).join(', ');
  this.followData.User = this.user.Username;


  this.followData.ISSUE_ID = this.followData.checkedItems?.map(e => e.ISSUE_ID);

  this.showWindow['FOLLOW'] = true;

}


public followToggle(state: boolean) {
  if (state) {
    this.followData.Status = ['DCA', 'DCASSIGN', 'DCB', 'DCCNFA', 'DCQCZ', 'OTHER', 'DCZ'];
  }
  else {
    this.followData.Status = [];
  }
}
public followAdd(data) {
  this.followData = new FollowModel();
  this.followData.checkedItems.push(data);
  this.followData.checkedItemsList = data.ORDERNUMBER;
  this.followData.User = this.user.Username;

  this.followData.ISSUE_ID = [];
  this.followData.ISSUE_ID.push(data.ISSUE_ID);

  console.log('followData', this.followData);

  this.showWindow['FOLLOW'] = true;
}

public followSubmit() {

  console.log('follow Submit', this.followData);
  if (this.validationErrors?.Selected) {
    return;
  }
  this.validationErrors = {};

  if (Object.keys(this.validationErrors).length) {
    return;
  }


  this.dataCorrectionService.followUpdate(this.followData).pipe(
    tap(result => {

      if (result.errormessage) {
        //Notify message
        this.notificationService.notifyError("Update Failed", result.errormessage);
      }
      else {
        this.notificationService.notifySuccess("Update Successfully Completed", "");
        var bFollow = false;
        if (this.followData.Status.length > 0) {
          bFollow = true;
        }

        this.followData.ISSUE_ID.forEach(e => {
          var match = this.datacorrections.filter(f => f.ISSUE_ID == e)[0];
          console.log('match', match);
          if (match) {
            match.Follow = bFollow;
          }
        }
        );
        //Refresh 
        this.showWindow = {};
      }

    })).subscribe();
}

}

class ExportModel {
  ExportOption: string = "All";
  ExportName: string;
  Key: string; 
  SelectedIDs: any[]; 
}


class FollowModel {

  ISSUE_ID: any[] = [];
  checkedItems: any[] = [];
  checkedItemsList: string = "";
  Status: string[] = [];
  User: string;
  OrderNumbers: any[];
}


