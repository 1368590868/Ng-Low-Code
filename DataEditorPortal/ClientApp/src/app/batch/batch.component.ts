import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { AppDataService } from '../services/app-data.service';
import { BatchService } from '../services/batch.service';
import { NotificationService } from '../services/notification.service';
import { UIService } from '../services/UI.service';
import { FileUpload } from 'primeng/fileupload';

@Component({
  selector: 'app-batch',
  templateUrl: './batch.component.html',
  styleUrls: ['./batch.component.css']
})
export class BatchComponent implements OnInit, OnDestroy {

  user: any;
  isLoading = false;
  totalRecords = 0;
  isRunning = false;

  batches: any[];
  selectedItem: any[];
  checkedCount = 0;
  checkedState = {};
  checkedItems = [];
  checkedItemsList = "";
  exportData: ExportModel;
  showWindow = {};
  batchData: BatchModel;
  validationErrors: any;
  detailData: any[];
  completeData: CompleteModel;
  receivedData: ReceiveModel;

  cols: any[] = [
    { field: 'BATCH', header: 'Batch', width: '200px', filterType: 'numeric' },
    { field: 'SERVICEAREA', header: 'Jurisdiction', width: '200px', filterType: 'text' },
    { field: 'OFFICE', header: 'Office', width: '200px', filterType: 'text' },
    { field: 'WORKTYPE', header: 'Work Type', width: '150px', filterType: 'text' },
    { field: 'USER_WO_COUNT', header: 'Client WO COunt', width: '250px', filterType: 'numeric' },
    { field: 'RESUBMITED', header: 'Resubmitted', width: '150px', filterType: 'text' },
    { field: 'FILENETONLY', header: 'FileNet Only', width: '150px', filterType: 'text' },
    { field: 'REQUESTED_USER', header: 'Requested By', width: '200px', filterType: 'text' },
    { field: 'REQUESTED_DATE', header: 'Requested On', width: '200px', filterType: 'date' },
    { field: 'FILENET_REC_DATE', header: 'FileNet Rec. Date', width: '200px', filterType: 'date' },
    { field: 'FILENET_WO_COUNT', header: 'FileNet WO Count', width: '200px', filterType: 'numeric' },
    { field: 'FILENET_COMP_DATE', header: 'FileNet Complete Date', width: '200px', filterType: 'date' },
    { field: 'FILENET_COMMENTS', header: 'FileNet Comments', width: '200px', filterType: 'text' },
    { field: 'WOTS_WO_COUNT', header: 'WOTS WO Count', width: '200px', filterType: 'numeric' },
    { field: 'WOTS_RECEIVED_DATE', header: 'WOTS Rec. Date', width: '200px', filterType: 'date' },
    { field: 'WOTS_HOLD_COUNT', header: 'WOTS Hold Count', width: '200px', filterType: 'numeric' },
    { field: 'COMPLETED_WO_COUNT', header: 'Completed WO Count', width: '200px', filterType: 'numeric' },
    { field: 'CLOSED_WO_COUNT', header: 'Closed WO Count', width: '200px', filterType: 'numeric' },
    { field: 'PROBLEM_WO_COUNT', header: 'Problem_WO_Count', width: '200px', filterType: 'numeric' }

  ];
  searchParams: any;
  gridParam: any;
  destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private batchService: BatchService,
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
        this.uiService.addSiteVisitLog('BATCH', 'Search', searchParams);

        //this.isRunning = true;
        this.fetchData(searchParams);
        this.searchParams = searchParams;
        console.log('batch searched');
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
    this.batchService.fetchData(searchParams, state).pipe(
      tap(result => {
        console.log('result', result);
        this.batches = result['Data'] || [];
        this.totalRecords = result['Total'];
        this.isRunning = false;
        this.initCheckState(false);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      finalize(() => this.isLoading = false),
    ).subscribe();

  }





  openDetail(data) {

    this.batchData = new BatchModel();
    this.batchData.BatchNumber = data['BATCH'];
    this.uiService.addSiteVisitLog('BATCH', 'View Detail', this.batchData);

    //query for item
    this.batchService.fetchDetailData(data['BATCH']).pipe(
      tap(result => {
        this.detailData = result || [];
        console.log('details', this.detailData);
        this.showWindow['DETAIL'] = true;

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();



  }


  initCheckState(isChecked: boolean) {
    const data = this.batches || [];
    this.checkedState = data.reduce((checkedState, e) => {
      checkedState[e['BATCH']] = isChecked;
      return checkedState;
    }, {});
    this.checkedCount = this.getCheckedItems()?.length;
  }
  toggleCheckState(item: any) {
    if (!item || !item['BATCH']) {
      return;
    }
    const currentCheckState = this.checkedState[item['BATCH']];
    this.checkedState[item['BATCH']] = !currentCheckState;
    this.checkedCount = this.getCheckedItems()?.length;
  }
  getCheckedItems() {
    return this.batches.filter(e => !!this.checkedState[e['BATCH']]);

  }
  getCheckedItemsList() {
    return this.checkedItems?.map(e => e.BATCH).join(', ');
  }

  onLazyLoad(event: any) {
    console.log('onLazyLoad', event);

    // reset state
    this.gridParam = event;

    this.fetchData(this.searchParams, event);
  }


  exportDataInit() {
    this.exportData = new ExportModel();
    var today = new Date();
    this.exportData.ExportName = "Export-Batch Results-" + today.toLocaleDateString("en-US");

    this.showWindow['EXPORT'] = true;
  }
  exportDataSubmit() {

    console.log('exportData', this.exportData);

    if (this.exportData.ExportOption == 'Selection') {
      //Get Checked Items
      this.exportData.SelectedIDs = this.getCheckedItems().map(e => e.BATCH);
    }
    else {
      this.exportData.SelectedIDs = [];
    }
    console.log('exportData', this.exportData);
    this.uiService.addSiteVisitLog('BATCH', 'Export Data', this.exportData);

    this.batchService.exportData(this.exportData, this.cols, this.searchParams, this.gridParam).pipe(
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


    this.uiService.getLookups('ServiceArea', this.batchData.WorkType).pipe(
      tap(result => {
        this.batchData.LK_Jurisdiction = result || [];
        console.log('LK_Project', this.batchData.LK_Jurisdiction);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();



  }

  serviceAreaChange() {


    this.uiService.getLookups('Office', this.batchData.Jurisdiction).pipe(
      tap(result => {
        this.batchData.LK_Office = result || [];
        console.log('LK_Office', this.batchData.LK_Office);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


    this.uiService.getLookups('Project', this.batchData.Jurisdiction).pipe(
      tap(result => {
        this.batchData.LK_Project = result || [];
        console.log('LK_Project', this.batchData.LK_Project);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


  }
  editInit(data) {

    this.validationErrors = {};
    this.batchData = new BatchModel();
    this.batchData.Mode = "Edit";


    this.batchData.Project = data.PROJECT;
    this.batchData.Office = data.OFFICE;
    this.batchData.Jurisdiction = data.SERVICEAREA;
    this.batchData.WorkType = data.WORKTYPE;
    this.batchData.BatchNumber = data.BATCH;
    this.batchData.WorkOrderCount = data.USER_WO_COUNT;
    this.batchData.FileNetComments = data.FILENET_COMMENTS;

    if (data.FILENETONLY == 'YES') {
      this.batchData.FileNetOnly = true;
    }

    this.batchData.OrigFileName = data.FILE_NAME
    this.batchData.OrigFilePath = data.FILE_PATH;
    this.batchData.OrigFileStatus = 'Keep';

    //Get vendors 
    this.uiService.getLookups('Departments').pipe(
      tap(result => {
        this.batchData.LK_WorkType = result || [];
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.workTypeChange();
    this.serviceAreaChange();

    this.showWindow["EDIT"] = true;
  }

  addNewInit() {
    this.validationErrors = {};
    this.batchData = new BatchModel();
    this.batchData.Mode = "Add";

    //Get vendors 
    this.uiService.getLookups('Departments').pipe(
      tap(result => {
        this.batchData.LK_WorkType = result || [];
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.showWindow["EDIT"] = true;
  }

  editSubmit() {

    //Validation 
    //check if name exist 
    this.validationErrors = {};



    if (this.batchData.Mode == 'Add') {
      console.log('this.batchData', this.batchData);
      this.uiService.addSiteVisitLog('BATCH', 'Add New', this.batchData);

      this.batchService.addNewData(this.batchData).pipe(
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
    else {
      if (this.batchData.OrigFileStatus == 'Removed') {
        this.batchData.OrigFileName = "";
        this.batchData.OrigFilePath = "";
      }

      this.uiService.addSiteVisitLog('BATCH', 'Update', this.batchData);

      this.batchService.saveData(this.batchData).pipe(
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

  completeInit() {
    this.completeData = new CompleteModel();

    this.completeData.checkedItems = this.getCheckedItems();
    this.completeData.checkedItemsList = this.completeData.checkedItems?.map(e => e.BATCH).join(', ');

    this.completeData.Batch = this.completeData.checkedItems?.map(e => {
      let rObj = {}
      rObj['BATCH'] = e.BATCH;
      return rObj
    });
    this.validationErrors = {};

    console.log('completeData', this.completeData);
    this.showWindow['COMPLETE'] = true;
  }

  receiveInit() {
    this.receivedData = new ReceiveModel();

    this.receivedData.checkedItems = this.getCheckedItems();
    this.receivedData.checkedItemsList = this.receivedData.checkedItems?.map(e => e.BATCH).join(', ');

    this.receivedData.Batch = this.receivedData.checkedItems?.map(e => {
      let rObj = {}
      rObj['BATCH'] = e.BATCH;
      return rObj
    });
    this.validationErrors = {};

    console.log('receiveData', this.receivedData);
    this.showWindow['RECEIVED'] = true;
  }

  completeSubmit() {

    this.uiService.addSiteVisitLog('BATCH', 'Update Complete', this.completeData);

    this.batchService.updateCompleted(this.completeData).pipe(
      tap(result => {

        console.log('updateCompleted result', result);
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

  receiveSubmit() {

    this.uiService.addSiteVisitLog('BATCH', 'Update Receive', this.receivedData);

    this.batchService.updateReceived(this.receivedData).pipe(
      tap(result => {

        console.log('updateReceived result', result);
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


  tempAttachmentDownload(data: any) {
    console.log('attachmentDownload', data);
    this.batchService.getTempAttachmentData(data).pipe(
      tap(result => {

        console.log('result', result);
        const url = window.URL.createObjectURL(result);
        const a = document.createElement('a');

        a.href = url;

        const fileName = data.FileName;
        a.download = fileName;
        a.click();
        a.remove();

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, []))

    ).subscribe();

  }

  attachmentDelete() {
    this.batchData.OrigFileStatus = 'Removed';
  }


  attachmentRestore() {
    this.batchData.OrigFileStatus = 'Keep';
  }


  attachmentDownload(data: any) {
    console.log('attachmentDownload', data);
    this.uiService.addSiteVisitLog('BATCH', 'Attachment Download', data);

    var param = {};
    if (data.OrigFileName) {
      param = {
        fileName: data.OrigFileName,
        filePath: data.OrigFilePath
      };
    }
    else if (data.FILE_NAME) {
      param = {
        fileName: data.FILE_NAME,
        filePath: data.FILE_PATH
      };
    }
    else {
      param = {
        fileName: data
      };
    }

    this.batchService.getAttachmentData(param).pipe(
      tap(result => {

        console.log('result', result);
        const url = window.URL.createObjectURL(result);
        const a = document.createElement('a');

        a.href = url;

        const fileName = param['fileName'];
        a.download = fileName;
        a.click();
        a.remove();

      }),
      catchError(err => this.notificationService.notifyErrorInPipe({ name: 'Error: ', message: 'File Does Not Exist' }, []))

    ).subscribe();

  }


  onFileUploadError(event: any, fileUpload: FileUpload) {
    fileUpload.clear();
    this.notificationService.notifyErrorInPipe(event.error).subscribe();
  }
  onFileUploadSuccess(event: any, fileUpload: FileUpload, originData: any) {
    console.log('onFileUploadSuccess', event);

    this.batchData.Attachment = event;
    //  originData.Attachment = result 
    //refresh attachment list


    console.log('this.batchData', this.batchData);
  }


  addNewFileUploadSuccess(event: any, fileUpload: FileUpload) {
    console.log('onFileUploadSuccess', event);
    console.log('onFileUploadSuccess 2', event.originalEvent.body);
    console.log('fileUpload', fileUpload);

    //Add to file 
    var result = event.originalEvent.body;
    this.batchData.Attachment = result;
    this.batchData.OrigFileStatus = 'Removed';

    console.log('this.batchData', this.batchData);
  }

  addNewRemoveAttachment() {

    this.batchData.Attachment = {};
  }

}


class ExportModel {
  ExportOption: string = "All";
  ExportName: string;
  Key: string;
  SelectedIDs: any[];
}


class BatchModel {

  LK_Jurisdiction: any[];
  LK_WorkType: any[];
  LK_Office: any[];
  LK_Project: any[];

  Mode: string;
  Project: string;
  Office: string;
  Jurisdiction: string;
  WorkType: string;
  BatchNumber: string;
  WorkOrderCount: string;
  FileNetOnly: boolean;
  Attachment: any;
  FileNetComments: string;
  OrigFileName: string;
  OrigFilePath: string;
  OrigFileStatus: string;
  Submitted: boolean = false;

}

class CompleteModel {
  checkedItems: any[];
  checkedItemsList: string = "";
  Batch: any[];

  FileNetComment: string;
  FileNetWorkOrderCount: string;
}

class ReceiveModel {
  checkedItems: any[];
  checkedItemsList: string = "";
  Batch: any[];
  ReceivedDate: string;
}
