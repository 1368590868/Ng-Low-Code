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
import { ElectricService } from '../services/electric.service';
import { ElectricDialogs } from './electric-dialogs.component';
import { WOService } from '../services/WO.service';
import { WorkOrderComponent } from '../work-order/work-order.component';
@Component({
  selector: 'app-electric',
  templateUrl: './electric.component.html',
  styleUrls: ['./electric.component.css']
})
export class ElectricComponent implements OnInit, OnDestroy {
  @ViewChild(ElectricDialogs) electricDialogs;
  @ViewChild(WorkOrderComponent) workOrder;
  @ViewChild('table') table; 

  constructor(
    private router: Router,
    private electricService: ElectricService,
    private notificationService: NotificationService,
    private uiService: UIService,
    public appDataService: AppDataService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService,
    public WOService: WOService,
    private route: ActivatedRoute,

  ) {
    this.user = userService.USER;
  }

  user: any;
  isLoading = false;
  isRunning = false; 
  totalRecords = 0;
  searchClicked: boolean = false;
  electricrecords: any[];
  grouprecords: any[];
  selectedGroupIdx = 0;
  selectedDetailIdx = 0;
  detailrecord: any;
  selectedItem: any[];
  holdrecord: any;
  searchParams: any;
  gridParam: any;
  destroy$ = new Subject<void>();

  detailrecord_states: Record<string, boolean> = {};
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
    console.log('init');
    this.appDataService.currentModule = 'ELECTRIC';

    setTimeout(() => {
      this.cols = this.workOrder.getDefaultColumns('ELECTRIC', true).filter(f=>!f.hidden);; 
    }, 1);

    this.totalRecords = -1; 

    this.resetWorkOrderState();
    this.detailrecord = null;

    this.electricrecords = [];
    this.appDataService.searchViewChanged$.pipe(
      tap(() => {
        //Changing view 
        console.log('view changed');
        this.electricrecords = [];
        this.totalRecords = -1; 
        this.detailrecord = null;
        this.searchClicked = false;
        console.log('view changed', this.electricrecords);

      }

      ), takeUntil(this.destroy$)
    ).subscribe();

    this.appDataService.searchClicked$.pipe(
      tap(searchParams => {
        this.searchClicked = false; 
        this.uiService.addSiteVisitLog('ELECTRIC', 'Search', searchParams);

        if (searchParams.CachedIndex != undefined) {
          //If the search param contains an ID already retrieved, just use it
          console.log('cached', searchParams);
          this.selectedGroupIdx = searchParams.CachedIndex;

          let groupRecord = this.grouprecords[searchParams.CachedIndex];

          this.resetWorkOrderState();

          for (let index = groupRecord.Data.length - 1; index >= 0; index--) {
            const e = groupRecord.Data[index];
            this.detailrecord_states[e.WORKORDERSTATE] = true;

            this.selectedDetailIdx = index;

          }
          this.detailrecord = this.grouprecords[this.selectedGroupIdx].Data[this.selectedDetailIdx];
          console.log('showing detailrecord', this.detailrecord);

          this.fetchOtherData();

          ////this.WOService.checkedState = []; 
          ////this.WOService.checkedState[this.detailrecord.UI_ID] = true; 
        }
        else {

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
        this.isRunning = true;

        this.electricService.fetchDataSingle(qparams['OrderNumber'], '').pipe(
          tap(result => {
            if (result['Data'].length > 0) {
  
              this.detailrecord = result['Data'][0];
  
              this.fetchOtherData();
  
              this.isRunning = false;
  
            }
            else {
              this.detailrecord = null;
              this.isRunning = false;
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
        var ds = "ELECTRIC"; 
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


  public showEdit(data: any) : boolean 
  {

    if (!this.user.Permissions.ELECTRIC_EDIT_FN_STATUS && data.CURRENTSTATUS == 'FN')
    {
      return false; 
    }

       if (this.user.Permissions.ELECTRIC_EDIT_BASIC || this.user.Permissions.ELECTRIC_EDIT_ALL) 
       {
          if (this.user.Permissions.ELECTRIC_EDIT_VENDOR_ONLY && data.VENDOR && this.user.Vendor != data.VENDOR)
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

  resetWorkOrderState() {
    this.detailrecord_states['PRELIMINARY'] = false;
    this.detailrecord_states['ASBUILT'] = false;
    this.detailrecord_states['SWITCHING ORDER'] = false;
    this.detailrecord_states['JOINT TRENCH'] = false;
    this.detailrecord_states['LEGACY'] = false;
  }
  selectWorkOrderState(state: string) {
    var data = this.grouprecords[this.selectedGroupIdx].Data.filter(f => f.WORKORDERSTATE == state)[0];
    this.detailrecord = data;
    this.fetchOtherData(); 

    console.log('select new detail', this.detailrecord);
  }

  fetchOtherData() {
    let id = this.detailrecord['ORDERNUMBER'];
    let state = this.detailrecord['WORKORDERSTATE'];

    //query for item
    this.electricService.fetchTransactionData(id, state).pipe(
      tap(result => {
        this.detailrecord.Transactions = result.Data || [];
        console.log('Transactions', this.detailrecord.Transactions);
        for (let i = 0; i < this.detailrecord.Transactions.length; i++) {
          this.detailrecord.Transactions[i].Fields = JSON.parse(this.detailrecord.Transactions[i].DETAILS.replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/\t/g, "\\t"));
        }
        console.log('responses', this.detailrecord.Transactions);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


    this.detailrecord.Attachments = [];

    this.electricService.fetchAttachmentData(id, state).pipe(
      tap(result => {

        for (let i = 0; i < result.Data.length; i++) {
          
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

    this.electricService.fetchComments(id, state).pipe(
      tap(result => {
        this.detailrecord.Comments = result.Data; 

        console.log('Comments', this.detailrecord.Comments);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    // this.electricService.fetchHoldData(id, state).pipe(
    //   tap(result => {
    //     this.holdrecord = result;
     
    //     console.log('holdrecord', this.holdrecord);
    //   }),
    //   catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    // ).subscribe();

    setTimeout(() => {
      this.workOrder.initializeComponent(this.searchParams, this.gridParam, this.cols, this.detailrecord, this.electricrecords, 'ELECTRIC', this.holdrecord);
      this.workOrder.checkedState[this.detailrecord['UI_ID']] = true;
      this.workOrder.followQueryUser(); 

    }, 0);
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

  // fecthTransactionData(id: string)
  // {
  //   //query for item
  //   this.electricService.fetchTransactionData(id).pipe(
  //     tap(result => {
  //       this.detailrecord.Transactions = result.Data || [];
  //       console.log('Transactions', this.detailrecord.Transactions);
  //       for (let i = 0; i < this.detailrecord.Transactions.length; i++)
  //       {
  //         this.detailrecord.Transactions[i].Fields = JSON.parse(this.detailrecord.Transactions[i].DETAILS);  
  //       }
  //       console.log('responses', this.detailrecord.Transactions);
  //     }),
  //     catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  //   ).subscribe();

  // }

  public openReceiveElectric() {
     this.electricDialogs.receiveInit(); 
  }
  public openEdit(data) {
    console.log('openEdit', data);
    this.electricDialogs.editInit(data);
  }

  // fetchAttachmentData(id: string)
  // {

  //   this.detailrecord.Attachments = []; 

  //   this.electricService.fetchAttachmentData(id).pipe(
  //     tap(result => {

  //       for (let i = 0; i < result.Data.length; i++)
  //       {
  //         this.detailrecord.Attachments.push(result.Data[i]); 
  //       }
  //       console.log('attachments', this.detailrecord.Attachments);
  //     }),
  //     catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  //   ).subscribe();
  // }

  attachmentDownload(data: any)
  {
    console.log('attachmentDownload', data);
    this.uiService.addSiteVisitLog('ELECTRIC', 'Download Attachment', data);

    if (!data.ID)
    {
        data.ID = data.FileID; 
        data.FILE_NAME = data.FileName; 
    }

    this.electricService.getAttachmentData(data).pipe(
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

  fetchData(searchParams: any, state?: any) {
    console.log('fetchData', searchParams, state);

    this.appDataService.currentSearchNoMatch = false; 
    this.appDataService.currentSearchResult = []; 
    this.isRunning = true; 
    //this.isLoading = true;
    this.electricService.fetchData(searchParams, state).pipe(
      tap(result => {
        console.log('result', result);
        this.electricrecords = result['Data'] || [];
        if (this.appDataService.currentSearchView == 'Detail') {
          //Group Results 
          this.grouprecords = [];
          this.electricrecords.forEach(
            f => {
              var match = this.grouprecords.filter(x => x.ORDERNUMBER == f.ORDERNUMBER)[0];
              if (match) {
                match.Data.push(f);
              }
              else {
                var newGroup = {
                  ORDERNUMBER: f.ORDERNUMBER,
                  CURRENTSTATUS: f.CURRENTSTATUS,
                  STATUSDESCRIPTION: f.STATUSDESCRIPTION,
                  Data: []
                };
                newGroup.Data.push(f);
                this.grouprecords.push(newGroup);
              }
            }
          );

          console.log('grouprecords', this.grouprecords);


          // console.log('testResult.keys.length', testResult.size); 
          console.log('this.detailrecord_states', this.detailrecord_states);
          if (this.grouprecords.length > 1) {
            this.appDataService.currentSearchResult = this.grouprecords.map(
              (d, idx) => {
                let obj: SearchDetailResult = {
                  Label: d.ORDERNUMBER,
                  Status: d.CURRENTSTATUS,
                  StatusDescription: d.STATUSDESCRIPTION,
                  ID: d.ORDERNUMBER,
                  Index: idx
                };
                return obj;
              }
            );
          }
          else if (this.grouprecords.length == 0)
          {
             this.appDataService.currentSearchNoMatch = true; 
          }
          else {
            console.log('fetch single');
            this.selectedGroupIdx = 0
            this.detailrecord = this.grouprecords[this.selectedGroupIdx].Data[0];


            ////this.WOService.checkedState = []; 
            ////this.WOService.checkedState[this.detailrecord['UI_ID']] = true; 
            this.appDataService.currentSearchResult = [];

            this.resetWorkOrderState();

            for (let index = this.grouprecords[this.selectedGroupIdx].Data.length - 1; index >= 0; index--) {
              const e = this.grouprecords[this.selectedGroupIdx].Data[index];
              this.detailrecord_states[e.WORKORDERSTATE] = true;
              this.selectedDetailIdx = index;
            }


            this.fetchOtherData(); 
          }
        }
        else {
          if (this.totalRecords == -1)
          {
            this.table.reset(); 
          }
          this.detailrecord = null;
          this.searchClicked = true;
          ////this.WOService.initCheckState(this.electricrecords, this.detailrecord);

          setTimeout(() => {
            this.workOrder.initializeComponent(this.searchParams, this.gridParam, this.cols, this.detailrecord, this.electricrecords, 'ELECTRIC');

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

  public refreshData() {
    if (this.appDataService.currentSearchView == 'Detail') {

      this.electricService.fetchDataSingle(this.detailrecord['ORDERNUMBER'], this.detailrecord['WORKORDERSTATE']).pipe(
        tap(result => {
          if (result['Data'].length > 0) {

            this.detailrecord = result['Data'][0];

            this.fetchOtherData();
            

          }
          else {
            this.detailrecord = null;
          }
          console.log('Refresh Detail', this.detailrecord);
        })).subscribe();


    }
    else {
      this.fetchData(this.searchParams, this.gridParam);
    }
  }


  openDetail(data) {
    this.electricDialogs.detailInit(data);

  }

  openAttachment(data) {
    this.electricDialogs.attachmentInit(data);

  }

  onLazyLoad(event: any) {
    console.log('onLazyLoad', event);

    // reset state
    if (this.searchParams && this.searchClicked) {
      this.gridParam = event;

      this.fetchData(this.searchParams, event);
      this.searchClicked = false; 
      }
  }




  // groupBy<T, K>(list: T[], getKey: (item: T) => K) {
  //   const map = new Map<K, T[]>();
  //   list.forEach((item) => {
  //       const key = getKey(item);
  //       const collection = map.get(key);
  //       if (!collection) {
  //           map.set(key, [item]);
  //       } else {
  //           collection.push(item);
  //       }
  //   });
  //   return map; 
  // //  return Array.from(map.values());
  // }
}
