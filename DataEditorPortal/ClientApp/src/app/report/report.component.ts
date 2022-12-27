import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { AppDataService } from '../services/app-data.service';
import { NotificationService } from '../services/notification.service';
import { UIService } from '../services/UI.service';
import { ReportService } from '../services/report.service';
import { ActivatedRoute,  NavigationEnd, Router, RouterEvent, UrlSerializer, UrlTree, DefaultUrlSerializer } from '@angular/router';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit, OnDestroy {

constructor(    private router: Router,
    private notificationService: NotificationService,
    private uiService: UIService,
    public appDataService: AppDataService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private reportService: ReportService,
    private route: ActivatedRoute
) { 
  this.user = userService.USER; 

}


user : any; 
isLoading = false;
totalRecords = -1;
records: any[]; 
selectedRow: any; 
isRunning = false; 
searchParams: any;
gridParam: any; 
destroy$ = new Subject<void>();
cols: any[]; 

selectedItem: any[];
checkedCount = 0;
checkedState = {};
checkedItems = [];
checkedItemsList = "";

exportData: ExportModel; 
showWindow = {}; 
reportType = 'List'; 
hasAggregate: boolean = false; 

toExcel: boolean = false;  
isSubmitting: boolean = false; 

searchClicked: boolean = false; 

ngOnInit() {
  // this.fetchData();

  
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
      console.log('report searched', searchParams); 
      //check for Resutl
      this.reportType = 'List'; 
      searchParams.forEach(element => {
        if (element.Name == 'REPORT_RESULT') 
        {
           this.reportType = element.SelectedValue; 
        }
      });
      //reset
      this.checkedCount = 0;
      this.checkedState = {};
      this.checkedItems = [];
      //Build cols 
      this.reportService.fetchGridConfig(this.appDataService.currentNavigationItem.key, this.reportType).pipe(
        tap(result => {
         
          console.log('result', result);
          this.uiService.addSiteVisitLog('REPORT', this.appDataService.currentNavigationItem.key, result);

          this.cols = result as any[]; ; 
//          this.totalRecords = result['Total'];
         
          this.fetchData(searchParams);
          this.searchParams = searchParams;

          this.route.queryParams.subscribe(qparams => {
            console.log('queryParamsMap', qparams);
              if (qparams.FORMAT == 'xls')
              {
                this.toExcel = true; 
  
                this.exportData = new ExportModel(); 
                var today = new Date();
  
                if (qparams?.FILENAME)
                {
                  this.exportData.ExportName = qparams.FILENAME; 
                }
                else 
                {
                  if (this.appDataService.currentNavigationItem?.grouplabel)
                  {
                    this.exportData.ExportName = this.appDataService.currentNavigationItem?.grouplabel + "-" + this.appDataService.currentNavigationItem.label + '-' + today.toLocaleDateString("en-US"); 
                  }
                  else 
                  {
                    this.exportData.ExportName = "Export-" + this.appDataService.currentNavigationItem.label + '-' + today.toLocaleDateString("en-US"); 
                  }
                }
    
                this.exportDataSubmit();
    
              }
  
            //  this.appDataService.searchClicked$.next(this.searchParams);
  
            });
  
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

exportDataInit()
{
  this.exportData = new ExportModel(); 
  this.isSubmitting = false; 

  var today = new Date();

  if (this.appDataService.currentNavigationItem?.grouplabel)
  {
    this.exportData.ExportName = this.appDataService.currentNavigationItem?.grouplabel + "-" + this.appDataService.currentNavigationItem.label + '-' + today.toLocaleDateString("en-US"); 
  }
  else 
  {
    this.exportData.ExportName = "Export-" + this.appDataService.currentNavigationItem.label + '-' + today.toLocaleDateString("en-US"); 
  }
 // this.exportData.ExportName = "Export-" + this.appDataService.currentNavigationItem.label + today.toLocaleDateString("en-US"); 
  this.showWindow['EXPORT'] = true; 
}
exportDataSubmit ()
{

  console.log('exportData', this.exportData);
  this.isSubmitting = true; 
  this.uiService.addSiteVisitLog('REPORT', 'Export Data', this.exportData);

  this.exportData.Key = this.appDataService.currentNavigationItem.key; 
  if  (this.exportData.ExportOption == 'Selection')
  {
      //Get Checked Items
      this.exportData.SelectedIDs = this.getCheckedItems().map(e=>e.UI_ID); 
  }
  console.log('exportData', this.exportData);
  this.reportService.exportData(this.exportData, this.cols, this.searchParams, this.gridParam).pipe(
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
      this.showWindow = {}; 
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    finalize(() =>{ this.isLoading = false; 
                this.isSubmitting = false;
              } 
    ),
  ).subscribe();

}

fetchData(searchParams: any, state?: any) {
  console.log('fetchData', searchParams, state);

  
  if (!this.appDataService.currentNavigationItem?.key)
  {
    return; 
  }

//  this.isLoading = true;
  this.reportService.fetchData(this.appDataService.currentNavigationItem.key, searchParams, state).pipe(
    tap(result => {
      console.log('result', result);
      this.records = result['Data']  || [];
     
      this.totalRecords = result['Total'];
      this.searchClicked = true; 

      if (this.totalRecords > 0)
      {
          if (this.records[0].hasOwnProperty('ATTACHMENTS'))
          {
              this.records.forEach(f=> {
                f.ATTACHMENTS = f['ATTACHMENTS'].split('`').filter(n=>n).map(m=> m.split('|'));                
              }); 
              console.log('has attachments'); 
          } 
      
      //Check to see if there's a summary 
      var sumRecords = {}; 

      for (let i = 0; i < this.cols.length; i++ )
      {
         var colConfig = this.cols[i]; 
         if (colConfig.aggregate)
         {
           //Find the sum for all the records 
           sumRecords[colConfig.field] = this.records.map(c=>c[colConfig.field]).reduce((a,b)=>(parseInt(a) || 0) + (parseInt(b) || 0)); 
           this.hasAggregate = true; 
         }
      }
      if (Object.keys(sumRecords).length) {      
        sumRecords['IS_AGGREGATE'] = true; 
        console.log('added summary record'); 
        this.records.push(sumRecords); 
      }
    }
      this.isRunning = false; 
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
  console.log('onLazyLoad', event);

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


openAttachment(data)
{

  if (!data[0])
  {
    return; 
  }
  this.uiService.addSiteVisitLog('REPORT', 'Attachment Download', data);

  console.log('open attachment', data); 

  var param = 
  {
    SourceID: data[2],
    FileName: data[0]
  }; 

  this.reportService.getAttachmentData(param).pipe(
    tap(result => {

      console.log('result', result); 
      const url = window.URL.createObjectURL(result);
      const a = document.createElement('a');

      a.href = url;

      const fileName = data[0]; 
      a.download = fileName;
      a.click();
      a.remove();
     
    }),
    catchError(err => this.notificationService.notifyErrorInPipe({ name: 'Error: ', message: 'File Does Not Exist' }, []))

  ).subscribe();
}
}

class ExportModel {
  ExportOption: string = "All";
  ExportName: string;
  Key: string; 
  SelectedIDs: any[]; 
}