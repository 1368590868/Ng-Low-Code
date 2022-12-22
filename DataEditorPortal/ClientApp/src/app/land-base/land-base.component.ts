import { Component, OnDestroy, OnInit, ViewChild, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AppDataService, SearchDetailResult } from '../services/app-data.service';
import { UserService } from '../services/user.service';
import { NotificationService } from '../services/notification.service';
import { UIService } from '../services/UI.service';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent, UrlSerializer, UrlTree, DefaultUrlSerializer } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { ConfirmationService } from 'primeng/api';
import { LandBaseService } from '../services/land-base.service';
import { LandBaseDialogs } from './land-base-dialogs.component';
import { WorkOrderComponent}  from '../work-order/work-order.component'; 

@Component({
  selector: 'app-land-base',
  templateUrl: './land-base.component.html',
  styleUrls: ['./land-base.component.css']
})
export class LandBaseComponent  implements OnInit, OnDestroy {
  @ViewChild(LandBaseDialogs) landbaseDialogs; 
  @ViewChild(WorkOrderComponent) workOrder; 
  @ViewChild('table') table; 

  constructor(
    private router: Router,
    private landbaseService: LandBaseService,
    private notificationService: NotificationService,
    public uiService: UIService,
    public appDataService: AppDataService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,

  )  
  {
    this.user = userService.USER;  
  }

  user : any; 
  isLoading = false;
  isRunning = false; 
  totalRecords = 0;
  searchClicked: boolean = false; 
  landbaserecords: any[];
  detailrecord : any; 
  selectedItem: any[];

  searchParams: any;
  gridParam: any; 
  destroy$ = new Subject<void>();
  enableTool = {}; 
  
  cols: any[];

  @Input() get selectedColumns(): any[] {
    return this.cols; //.filter(c=>!c.hidden); ;
  }


  set selectedColumns(val: any[]) {
      //restore original order
      //this._selectedColumns = this.cols.filter(col => !col.hidden);
  }

  ngOnInit() {
    // this.fetchData();
    this.totalRecords = -1; 
    this.appDataService.currentModule = 'LANDBASE';

    setTimeout(() => {
      this.cols = this.workOrder.getDefaultColumns('LANDBASE', true).filter(f=>!f.hidden);; 
    }, 1);

    console.log('init');
    this.detailrecord = null; 
    this.landbaserecords = []; 
    this.appDataService.searchViewChanged$.pipe(
      tap(() => {
        //Changing view 
        console.log('view changed'); 
        this.landbaserecords = []; 
        this.detailrecord = null; 
        this.searchClicked = false; 
        this.totalRecords = -1; 

        console.log('view changed', this.landbaserecords); 

      }

      ), takeUntil(this.destroy$)
    ).subscribe(); 

    this.appDataService.searchClicked$.pipe(
      tap(searchParams => {
        this.searchClicked = false; 
        this.uiService.addSiteVisitLog('LANDBASE', 'Search', searchParams);

        if (searchParams.CachedIndex != undefined)
        {
            //If the search param contains an ID already retrieved, just use it
            console.log('cached', searchParams); 
            this.detailrecord = this.landbaserecords[searchParams.CachedIndex];
            this.fetchOtherData(); 

            setTimeout(()=>
              {
                this.workOrder.initializeComponent(this.searchParams, this.gridParam, this.cols, this.detailrecord, this.landbaserecords, 'LANDBASE'); 
                this.workOrder.checkedState[this.detailrecord['UI_ID']] = true; 
                this.workOrder.followQueryUser(); 

              }, 0);

        }
        else 
        {

          if (this.appDataService.currentSearchView == 'Detail') {
            //no table
          }
          else {
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
          }

          this.fetchData(searchParams);
          this.searchParams = searchParams;
        }
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
          Name: "ORDERNUMBER",
          Type: "pOrderNumber",
          SelectedValue: qparams['OrderNumber']       
        };
        var searchParam = []; 
        searchParam.push(searchItem); 

        this.appDataService.currentSearchView = 'Detail';
        this.landbaseService.fetchDataSingle(qparams['OrderNumber'], '').pipe(
          tap(result => {
            if (result['Data'].length > 0) {
  
              this.detailrecord = result['Data'][0]; 
              this.fetchOtherData(); 
              
              
              setTimeout(()=>
              {
                this.workOrder.initializeComponent(this.searchParams, this.gridParam, this.cols, this.detailrecord, this.landbaserecords, 'LANDBASE'); 
                this.workOrder.checkedState[this.detailrecord['UI_ID']] = true; 
                this.workOrder.followQueryUser(); 
              }, 0);
      
  
            }
            else {
              this.detailrecord = null;
            }
            console.log('Refresh Detail', this.detailrecord);
          })).subscribe();

          });
         
        
      }
    });

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
        var ds = "LANDBASE"; 
        localStorage.removeItem(ds + "-state"); 
        localStorage.removeItem(ds + "-displayColumns"); 
        this.cols = this.workOrder.getDefaultColumns(ds, false).filter(f=>!f.hidden);; 
        this.workOrder.cols = this.cols; 
    
        console.log('reset'); 
        },
      reject: () => {
        //reject action
      }
    });
  }
  attachmentDownload(data: any)
  {
    console.log('attachmentDownload', data);
    this.uiService.addSiteVisitLog('LANDBASE', 'Attachment Download', data);

    if (!data.ID)
    {
        data.ID = data.FileID; 
        data.FILE_NAME = data.FileName; 
    }

    this.landbaseService.getAttachmentData(data).pipe(
      tap(result => {
  
        console.log('result', result); 
        const url = window.URL.createObjectURL(result);
        const a = document.createElement('a');
  
        a.href = url;
  
        const fileName = data.FILE_NAME;
        a.download = fileName;
        a.click();
        a.remove();
       
      }),
      catchError(err => this.notificationService.notifyErrorInPipe({ name: 'Error: ', message: 'File Does Not Exist' }, []))
  
    ).subscribe();
  
  }
  public showEdit(data: any) : boolean 
  {

    if (!this.user.Permissions.LANDBASE_EDIT_FN_STATUS && data.CURRENTSTATUS == 'FN')
    {
      return false; 
    }

       if (this.user.Permissions.LANDBASE_EDIT_BASIC || this.user.Permissions.LANDBASE_EDIT_ALL) 
       {
          if (this.user.Permissions.LANDBASE_EDIT_VENDOR_ONLY && this.user.Vendor != data.VENDOR)
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
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDetail(data)
  {
    this.landbaseDialogs.detailInit(data); 
    
  }
  openReceivePlat()
  {
    this.landbaseDialogs.ReceivePlatInit(); 
  }

  public openEdit(data)
  {
    console.log('openEdit', data); 
    this.landbaseDialogs.editInit(data); 
  }
  

  fetchOtherData()
  {
    let id = this.detailrecord['ORDERNUMBER'];
    let state = this.detailrecord['WORKORDERSTATE'];

    
    this.detailrecord.Attachments = []; 

    this.landbaseService.fetchAttachmentData(id, state).pipe(
      tap(result => {
        
        for (let i = 0; i < result.Data.length; i++)
        {

          if(result.Data[i].STATUS != 'Removed')
          {
            this.detailrecord.Attachments.push(result.Data[i]); 
          }

        }
        console.log('attachments', this.detailrecord.Attachments);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    
    this.detailrecord.Comments = [];

    this.landbaseService.fetchComments(id, state).pipe(
      tap(result => {
        this.detailrecord.Comments = result.Data; 

        console.log('Comments', this.detailrecord.Comments);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


     //query for item
     this.landbaseService.fetchTransactionData(id).pipe(
      tap(result => {
        this.detailrecord.Transactions = result.Data || [];
        console.log('Transactions', this.detailrecord.Transactions);
        for (let i = 0; i < this.detailrecord.Transactions.length; i++)
        {
          this.detailrecord.Transactions[i].Fields = JSON.parse(this.detailrecord.Transactions[i].DETAILS.replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/\t/g, "\\t"));  
        }
        console.log('responses', this.detailrecord.Transactions);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


  }
  
  

  fetchData(searchParams: any, state?: any) {
    console.log('fetchData', searchParams, state);
    this.isRunning = true; 

//    this.isLoading = true;
    this.landbaseService.fetchData(searchParams, state).pipe(
      tap(result => {
        console.log('result', result);
        this.landbaserecords = result['Data']  || [];
        if (this.appDataService.currentSearchView == 'Detail')
        {
          if (this.landbaserecords.length > 1)
          {
            this.appDataService.currentSearchNoMatch = false; 
            this.appDataService.currentSearchResult = this.landbaserecords.map(
               (d, idx) => {
                  let obj : SearchDetailResult = {
                    Label: d.ORDERNUMBER + '-' + d.PLATNAME,
                    Status:  d.CURRENTSTATUS,
                    StatusDescription: d.STATUSDESCRIPTION,
                    ID: d.PLATID,
                    Index: idx
                  };
                  return obj;
                }                
             );
          }
          else 
          {
            if (this.landbaserecords.length == 0)
            {
                this.appDataService.currentSearchNoMatch = true; 
                this.appDataService.currentSearchResult = []; 
            }
            else  
            {

              this.appDataService.currentSearchNoMatch = false; 
              console.log('fetch single'); 
              this.detailrecord = this.landbaserecords[0]; 
              this.fetchOtherData(); 
              
              
              this.appDataService.currentSearchResult = [];

              
            setTimeout(()=>
            {
              this.workOrder.initializeComponent(this.searchParams, this.gridParam, this.cols, this.detailrecord, this.landbaserecords, 'LANDBASE'); 
              this.workOrder.checkedState[this.detailrecord['UI_ID']] = true; 
              this.workOrder.followQueryUser(); 

            }, 0);

            }              
          }
        }
        else    
        {
          this.appDataService.currentSearchNoMatch = false; 
          if (this.totalRecords == -1)
          {
            this.table.reset(); 
          }
          this.detailrecord = null; 
          this.searchClicked = true; 
          
          setTimeout(()=>
          {
            console.log('WORKORDER', this.workOrder); 
            this.workOrder.initializeComponent(this.searchParams, this.gridParam, this.cols, this.detailrecord, this.landbaserecords, 'LANDBASE'); 
                     //add Follow Information         
            //Get list of UI_ID 
            this.workOrder.followQueryUser(); 

          }, 0);

        }
        this.totalRecords = result['Total'];
        this.isRunning = false; 

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      finalize(() => this.isLoading = false),
    ).subscribe();
   
}

public refreshData()
{
  if (this.appDataService.currentSearchView == 'Detail')
  {

    if (this.appDataService.currentSearchTransferToOrderNumber)
    {
      //Reset this value after it has been modified
      this.detailrecord['ORDERNUMBER'] = this.appDataService.currentSearchTransferToOrderNumber;
      this.appDataService.currentSearchTransferToOrderNumber = null; 
    }
    this.landbaseService.fetchDataSingle(this.detailrecord['ORDERNUMBER'], this.detailrecord['WORKORDERSTATE']).pipe(
      tap(result => {
        if (result['Data'].length > 0)
        {
          
          this.detailrecord = result['Data'][0]; 
          this.fetchOtherData(); 
          
          
          setTimeout(()=>
          {
            this.workOrder.initializeComponent(this.searchParams, this.gridParam, this.cols, this.detailrecord, this.landbaserecords, 'LANDBASE'); 
            this.workOrder.checkedState[this.detailrecord['UI_ID']] = true; 
            this.workOrder.followQueryUser(); 
          }, 0);
          
    }
        else 
        {
          this.detailrecord = null; 
        }
        console.log('Refresh Detail', this.detailrecord); 
      })).subscribe();


  }
  else 
  {
    this.fetchData(this.searchParams, this.gridParam);
  }
}

openAttachment(data)
{
  this.landbaseDialogs.attachmentInit(data); 

}



onLazyLoad(event: any) {
  console.log('onLazyLoad', event);

  // reset state
  if (this.searchParams && this.searchClicked)
  {
  this.gridParam = event; 

  this.fetchData(this.searchParams, event);
  this.searchClicked = false; 
  }
}

openFollow(data) {
  if (data?.Follow)
  {
    this.workOrder.followEdit(data); 
  }
  else 
  {
    this.workOrder.followAdd(data); 
  }
}


}
