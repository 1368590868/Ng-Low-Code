import { Component } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';
import { catchError, elementAt, tap } from 'rxjs/operators';
import { DataCorrectionService } from '../services/data-correction.service';
import { NotificationService } from '../services/notification.service';
import { UIService } from '../services/UI.service';
import { UserService } from '../services/user.service';
import { ConfirmationService } from 'primeng/api';
import { Output, EventEmitter } from '@angular/core';

// import { MatSort } from '@angular/material/sort';
// import { MatPaginator  } from '@angular/material/paginator';
// import { MatTableDataSource } from '@angular/material/table';
//import { ViewChild } from '@angular/core';
//import { DataCorrectionElement, DataCorrection_DisplayCoumns } from '../models/data-correction';

@Component({
  selector: 'app-data-correction-dialogs',
  templateUrl: './data-correction-dialogs.component.html',
  styleUrls: ['./data-correction.component.css']
})



export class DataCorrectionDialogs {

  constructor(private uiService: UIService,
    private dataCorrectionService: DataCorrectionService,
    private notificationService: NotificationService,
    private userService: UserService,
    public confirmationService: ConfirmationService
  ) {
    this.user = userService.USER;
    console.log('user', this.user); 
  }

  @Output() refreshGrid = new EventEmitter<string>();

  public updateGrid() {
    this.refreshGrid.emit();
  }

  showWindow = {};
  user: any;
  assignUserData: AssignUserModel;
  exportItemData = new ExportItemModel();
  attachmentData: AttachmentModel;
  //responseData = new ResponseModel();
  responseData: ResponseModel;
  //detailData = new DetailModel(); 
  detailData: DetailModel;
  dataCorrectionData: DataCorrectionModel;
  updateStatusData: UpdateStatusModel; 
  reopenData: ReopenModel; 
  validationErrors: any;
  isSubmitting: boolean = false; 

  public activateWindow(key: string) {
    this.showWindow = {};
    if (key)
    {
      this.showWindow[key] = true;
    }

  }

  public closeWindow(event: any) {
    console.log('event', event);
    this.showWindow = {};
  }

  
  public canEdit(data: any) : boolean 
  {
    if (this.user.Permissions.DC_EDIT_VENDOR_ONLY)
    {
        if (data.Vendor && this.user.Vendor != data.Vendor)
        {
          return false; 
        }
        else 
        {
          return true; 
        }
    }
    else if (this.user.Permissions.DC_EDIT_BASIC || this.user.Permissions.DC_EDIT_ALL)
    {
        return true; 
    }
    else 
    {
      return false; 
    }
  }

  public attachmentInit(data: any) {


    console.log('attachmentInit', data);
    this.attachmentData = new AttachmentModel();
    this.attachmentData.Issue_ID = data['ISSUE_ID'];
    this.attachmentData.Vendor = data['VENDOR']; 

    //query for item
    this.dataCorrectionService.fetchAttachmentData(data['ISSUE_ID']).pipe(
      tap(result => {
        this.attachmentData.Attachments = result.Data || [];
        console.log('attachmentInit', this.attachmentData.Attachments);
        this.activateWindow('ATTACHMENT');
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


  }

  attachmentSubmit(event: any) {
    console.log('Attachment Submitting', event, event.formData);
    event.formData.append('Issue_ID', this.attachmentData.Issue_ID);
  }

  attachmentDelete(event: any, data: any, source: any) {
    this.uiService.addSiteVisitLog('DC', 'Delete Attachment', data);

    this.confirmationService.confirm({
      target: event.target,
      message: 'Are you sure that you want to remove ' + data.FILENAME + '?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        //confirm action
        //refresh attachment list
        console.log('attachmentDelete', data);
        data.SourceID = source.Issue_ID; 
        this.dataCorrectionService.deleteAttachment(data).pipe(
          tap(result => {
            if (!result.errormessage) {
              this.dataCorrectionService.fetchAttachmentData(source.Issue_ID).pipe(
                tap(result => {
                  source.Attachments = result.Data || [];
                  console.log('attachmentInit', source.Attachments);
                }),
                catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
              ).subscribe();
            }
          }),
          catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
        ).subscribe();
      },
      reject: () => {
        //reject action
      }
    });

  }

  attachmentDownload(data: any)
  {
    console.log('attachmentDownload', data);
    this.uiService.addSiteVisitLog('DC', 'Download Attachment', data);
    if (!data.ID)
    {
        data.ID = data.FileID; 
        data.FILENAME = data.FileName; 
    }

    this.dataCorrectionService.getAttachmentData(data).pipe(
      tap(result => {
  
        console.log('result', result); 
        const url = window.URL.createObjectURL(result);
        const a = document.createElement('a');
  
        a.href = url;
  
        const fileName = data.FILENAME;
        a.download = fileName;
        a.click();
        a.remove();
       
      }),
      catchError(err => this.notificationService.notifyErrorInPipe({ name: 'Error: ', message: 'File Does Not Exist' }, []))
  
    ).subscribe();
  
  }
  
  tempAttachmentDownload(data: any)
  {
    console.log('attachmentDownload', data);
    this.dataCorrectionService.getTempAttachmentData(data).pipe(
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
  attachmentRestore(event: any, data: any, source: any) {
    this.uiService.addSiteVisitLog('DC', 'Restore Attachment', data);

    this.confirmationService.confirm({
      target: event.target,
      message: 'Are you sure that you want to restore ' + data.FILENAME + '?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        //confirm action
        //refresh attachment list
        data.SourceID = source.Issue_ID; 
        console.log('attachmentRestore', data);
        this.dataCorrectionService.restoreAttachment(data).pipe(
          tap(result => {
            if (!result.errormessage) {
              this.dataCorrectionService.fetchAttachmentData(source.Issue_ID).pipe(
                tap(result => {
                  source.Attachments = result.Data || [];
                  console.log('attachmentInit', source.Attachments);
                }),
                catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
              ).subscribe();
            }
          }),
          catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
        ).subscribe();
      },
      reject: () => {
        //reject action
      }
    });

  }
  onFileUploadError(event: any, fileUpload: FileUpload) {
    fileUpload.clear();
    this.notificationService.notifyErrorInPipe(event.error).subscribe();
  }
  onFileUploadSuccess(event: any, fileUpload: FileUpload, originData: any) {
    console.log('onFileUploadSuccess', event);

    //refresh attachment list
    this.dataCorrectionService.fetchAttachmentData(originData.Issue_ID).pipe(
      tap(result => {
        originData.Attachments = result.Data || [];
        console.log('attachments', originData.Attachments);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
  }

  addNewRemoveAttachment(fileID: string) {
    for (let i = 0; i < this.dataCorrectionData.NewAttachments.length; i++)
      if (this.dataCorrectionData.NewAttachments[i].FileID === fileID) {
        this.dataCorrectionData.NewAttachments.splice(i, 1);
        break;
      }
  }

  addNewFileUploadSuccess(event: any, fileUpload: FileUpload) {
    console.log('onFileUploadSuccess', event);
    console.log('onFileUploadSuccess', event.originalEvent.body);
    console.log('fileUpload', fileUpload);

    //Add to file 
    var result = event.originalEvent.body;
    for (let i = 0; i < result.length; i++) {
      this.dataCorrectionData.NewAttachments.push(result[i]);
    }

    console.log('this.dataCorrectionData', this.dataCorrectionData);
  }

  public responseInit(data: any) {
    this.responseData = new ResponseModel();
    this.responseData.Issue_ID = data['ISSUE_ID'];
    this.responseData.Vendor = data['VENDOR'];
    
    //Add status from Issue
    this.responseData.Status = data['CURRENTSTATUS'];
    this.responseData.StatusDescription = data['STATUSDESCRIPTION'];

    console.log('responseInit', data);

    //query for item
    this.dataCorrectionService.fetchResponseData(data['ISSUE_ID']).pipe(
      tap(result => {
        this.responseData.Responses = result.Data || [];
        console.log('responses', this.responseData.Responses);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.activateWindow('RESPONSE');

  }

  public detailInit(data: any) {
    this.detailData = new DetailModel();
    this.detailData.Issue_ID = data['ISSUE_ID'];

    //query for item
    this.dataCorrectionService.fetchDetailData(data['ISSUE_ID']).pipe(
      tap(result => {
        this.detailData.Details = result || [];
        console.log('details', this.detailData);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    //query for item
    this.dataCorrectionService.fetchResponseData(data['ISSUE_ID']).pipe(
      tap(result => {
        this.detailData.Responses = result.Data || [];
        console.log('responses', this.detailData.Responses);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.dataCorrectionService.fetchAttachmentData(data['ISSUE_ID']).pipe(
      tap(result => {
        
        for (let i = 0; i < result.Data.length; i++)
        {
          if(result.Data[i].STATUS != 'Removed')
            {
              this.detailData.Attachments.push(result.Data[i]); 
            }
        }
        console.log('attachments', this.detailData.Attachments);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    //query for item
    this.dataCorrectionService.fetchTransactionData(data['ISSUE_ID']).pipe(
      tap(result => {
        this.detailData.Transactions = result.Data || [];
        console.log('Transactions', this.detailData.Transactions);
        for (let i = 0; i < this.detailData.Transactions.length; i++)
        {
           this.detailData.Transactions[i].Fields = JSON.parse(this.detailData.Transactions[i].DETAILS
           .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t"));  
        }
        console.log('responses', this.detailData.Transactions);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    console.log('responses', this.detailData);

    this.activateWindow('DETAIL');

  }
  public responseSubmit() {
    console.log('responseSubmit', this.responseData);
    this.uiService.addSiteVisitLog('DC', 'Add Response', this.responseData);

    this.dataCorrectionService.addResponseData(this.responseData).pipe(
      tap(result => {
        console.log('result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Add Response Failed", result.errormessage);
        }
        else {
          //Add to response data 
          var newResponse = {
            ISSUE_ID: result.Data.Issue_ID,
            REMARK: result.Data.Comment,
            WHO_REMARKED: this.user.DisplayName,
            DATE_REMARKED: result.Data.CreatedDate,
            DESCRIPTION: result.Data.StatusDescription,
            STATUS: result.Data.Status
          };
          
          this.responseData.Responses.push(newResponse);
          //Clear COmments 
          this.responseData.Comment = "";
          console.log('responseData', newResponse);
        }
      }
      ),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
  }

  public assignUserInit(checkedItems: any[]) {

    this.isSubmitting = false; 
    this.assignUserData = new AssignUserModel();
    this.validationErrors = {}; 
    this.assignUserData.checkedItems = checkedItems;

    var vendorOnly = this.user.Permissions.DC_ASSIGN_VENDOR_ONLY; 

    console.log('this.assignUserData', this.assignUserData);
    console.log('vendorOnly', vendorOnly);
    let invalidItems = [];
    checkedItems.forEach(function (item) {
      if (item.STATUSDESCRIPTION == 'DC QC COMPLETED'
        || item.STATUSDESCRIPTION == 'DC COMPLETED'        
        || item.STATUSDESCRIPTION == 'DC CLOSED NO FURTHER ACTION'        
      ) {
        //Can't assign this issue
        invalidItems.push(item.ISSUE_ID);
      }
      else if (vendorOnly && item.STATUSDESCRIPTION == 'DC ASSIGNED' && item.VENDOR != this.user.Vendor)
      {
        invalidItems.push(item.ISSUE_ID);
      }
    }
    );


    if (invalidItems.length > 0) 
    {
      this.validationErrors.ErrorIssues = invalidItems.join(', ');
    }


    
    if (this.assignUserData.checkedItems?.length == 0)
    {
       this.validationErrors.Issue_ID = "No Issues Selected";    
    }

    console.log('this.validationErrors', this.validationErrors); 
    if (Object.keys(this.validationErrors).length)
    {
      this.activateWindow('ASSIGN');
      console.log('has error'); 
      return; 
    }

    this.assignUserData.checkedItemsList = checkedItems?.map(e => e.ISSUE_ID).join(', ');
    this.assignUserData.Issue_IDs = checkedItems?.map(e => {
      let rObj = {}
      rObj['Issue_ID'] = e.ISSUE_ID; 
      rObj['Vendor'] = e.VENDOR; 
      return rObj
    });

    //Check to make sure the items can be assigned
    if (this.user.Permissions.DC_ASSIGN_ANY)
    {
      this.uiService.getLookups('Vendors').pipe(
        tap(result => {
          this.assignUserData.LK_Vendors = result || [];
        }),
        catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      ).subscribe();  
    }
    else  
    {
      this.assignUserData.Vendor = this.user.Vendor; 
      this.defaultVendorInputs();      
    }

    this.activateWindow('ASSIGN');

    console.log('this.assignUserData 2', this.assignUserData);

  }
 
  public defaultVendorInputs()
  {
    
    this.uiService.getLookups('DCAssignedTo', this.assignUserData.Vendor).pipe(
      tap(result => {
        this.assignUserData.LK_AssignUsers = result || [];
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
  }
  public updateStatusSubmit()
  {

    this.validationErrors = {};


    // if (!this.updateStatusData.ReasonCode) {
    //   this.validationErrors.ReasonCode = "ReasonCode is required";
    // }

    if (!this.updateStatusData.Status) {
      this.validationErrors.Status = "Status is required";
    }

    if (this.updateStatusData.Status != 'DCZ' && !this.updateStatusData.ReasonCode) {
      this.validationErrors.ReasonCode = "Reason Code is required";
    }

    if (this.updateStatusData.Status != 'DCZ' && !this.updateStatusData.Comment) {
      this.validationErrors.Comment = "Comment is required";
    }
    if (this.updateStatusData.ReasonCode == 'OTHER - SEE COMMENTS' && !this.updateStatusData.Comment)
    {
      this.validationErrors.Comment = "Missing Comments";
    }

    if(Object.keys(this.validationErrors).length)
    {
      return; 
    }

    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog('DC', 'Update Status', this.updateStatusData);

    this.dataCorrectionService.updateStatus(this.updateStatusData).pipe(
      tap(result => {
        console.log('updateStatusSubmit result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Update Status Failed", result.errormessage);
        }
        else {
          //Add to response data 
          //we're good
          this.notificationService.notifySuccess("Update Status Successfully Completed", "");
          this.updateGrid(); 

          this.showWindow = {};
        }
      }
      ),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

  }
  public updateStatusInit(checkedItems: any[]) {

    this.isSubmitting = false; 
    this.updateStatusData = new UpdateStatusModel();

    this.updateStatusData.checkedItems = checkedItems;
    this.validationErrors = {}; 

    let invalidItems = [];
    checkedItems.forEach(function (item) {
      if (item.CURRENTSTATUS == 'DCZ'
        || item.CURRENTSTATUS == 'DCQCZ'
        || item.CURRENTSTATUS == 'DCCNFA'
        
      ) {
        //Can't assign this issue
        invalidItems.push(item.ISSUE_ID);
      }
    }        
    );


    if (invalidItems.length > 0) 
    {
      this.validationErrors.ErrorIssues = invalidItems.join(', ');
    }

    if (this.updateStatusData.checkedItems?.length == 0)
    {
       this.validationErrors.Issue_ID = "No Issues Selected";    
       this.activateWindow('STATUS');
       return; 
    }

    this.updateStatusData.checkedItemsList = checkedItems?.map(e => e.ISSUE_ID).join(', ');
    this.updateStatusData.Issue_IDs = checkedItems?.map(e => {
      let rObj = {}
      rObj['Issue_ID'] = e.ISSUE_ID; 
      rObj['Vendor'] = e.VENDOR; 
      return rObj
    });

    this.uiService.getLookups('DCStatus').pipe(
      tap(result => {
        this.updateStatusData.LK_Status = result || [];
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    
    this.uiService.getLookups('ReasonCode').pipe(
      tap(result => {
        this.updateStatusData.LK_ReasonCode = result || [];
      }),

      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.activateWindow('STATUS');

    console.log('this.updateStatusData', this.updateStatusData);

  }

  public assignUserSubmit() {

    //Check validation 
    console.log('assignUserSubmit', this.assignUserData); 
    this.uiService.addSiteVisitLog('DC', 'Assign User', this.assignUserData);

    this.validationErrors = {};

    if (!this.assignUserData.Vendor) {
      this.validationErrors.Vendor = "Vendor is required";
    }

    if (!this.assignUserData.Assigned) {
      this.validationErrors.Assigned_To = "Assigned To is required";
    }
    else
    {
      this.assignUserData.Assigned_To = this.assignUserData.Assigned.Value; 
      this.assignUserData.AssignedName = this.assignUserData.Assigned.Label; 

    }

    
    if(Object.keys(this.validationErrors).length)
    {
      return; 
    }


    this.isSubmitting = true; 

    this.dataCorrectionService.assignIssue(this.assignUserData).pipe(
      tap(result => {
        console.log('assignUserSubmit result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Assign User Failed", result.errormessage);
        }
        else {
          //Add to response data 
          //we're good
          this.notificationService.notifySuccess("Assign User Successfully Completed", "");
          this.updateGrid(); 
          this.showWindow = {};
        }
      }
      ),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


  }
  public editSubmit() {
    //Transform data 
    
    if (this.dataCorrectionData.Submitter.Value2 == 'P')
    {
      this.dataCorrectionData.Name = this.dataCorrectionData.Submitter.Label; 
    }
    else
    {
      this.dataCorrectionData.Name = this.dataCorrectionData.Submitter.Value; 
    }
    this.dataCorrectionData.Attachments = this.attachmentData.Attachments; 

    this.uiService.addSiteVisitLog('DC', 'Update Data', this.dataCorrectionData);


    this.isSubmitting = true; 

    this.dataCorrectionService.saveData(this.dataCorrectionData).pipe(
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
          this.updateGrid(); 
          this.showWindow = {};
        }
      }
      ),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
  }

  public defaultWorkTypeInputs() {
    //Find WorkOrder State based on Work Order Number
    console.log('WorkOrderNumber', this.dataCorrectionData.WorkOrderNumber);
    let workTypeFilter = this.dataCorrectionData.WorkType.replace(',', '%');
    this.uiService.getLookups('DCJurisdictions', workTypeFilter).pipe(
      tap(result => {
        this.dataCorrectionData.LK_Jurisdictions = result || [];
        console.log(this.dataCorrectionData);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

  }

  public defaultWorkOrderStateInput2() 
  {
    if (this.dataCorrectionData.SelectedOrderNumber)
    {
      this.dataCorrectionData.LK_WorkOrderStates = this.dataCorrectionData.SelectedOrderNumber.Data; 
      this.dataCorrectionData.WorkOrderState = this.dataCorrectionData.SelectedOrderNumber.Data[0].WORKORDERSTATE;
      this.dataCorrectionData.WorkOrderNumber = this.dataCorrectionData.SelectedOrderNumber.ORDERNUMBER; 
    }

  }
  public defaultWorkOrderStateInput() {
    //Get Lookup
    //Get all necessary Lookups
    if (!this.validationErrors)
    {
      this.validationErrors = {};
    }
    if (!this.dataCorrectionData.WorkType)
    {
        this.dataCorrectionData.WorkType = 'GAS'; 
    }
    var filter = this.dataCorrectionData.WorkType.replace(',', '%');
    this.dataCorrectionService.fetchWorkOrderStates(this.dataCorrectionData.WorkType, this.dataCorrectionData.WorkOrderNumber).pipe(
      tap(result => {

        //Check number of ORDERNUMBERS
        console.log('fetchWorkOrderStates', result); 
        if (result.Total > 0)
        {
          
          var workorders = [];
          workorders.push(
            { 
              ORDERNUMBER: '...',
              Data: []
            }
          );
          result.Data.forEach(
            f => {
              var match = workorders.filter(x => x.ORDERNUMBER == f.ORDERNUMBER)[0];
              if (match) {
                match.Data.push(f);
              }
              else {
                var newGroup = {
                  ORDERNUMBER: f.ORDERNUMBER,
                  Data: []
                };
                newGroup.Data.push(f);
                workorders.push(newGroup);
              }
            }
          );
          console.log('workorders', workorders); 
          if (workorders.length > 2)
          {
            this.dataCorrectionData.LK_OrderNumbers = workorders; 
          }
          else 
          {
            this.dataCorrectionData.LK_WorkOrderStates = result.Data;
            this.dataCorrectionData.WorkOrderState = result.Data[0].WORKORDERSTATE; 
            this.validationErrors.WorkOrderNumberNA = "";   
            this.dataCorrectionData.LK_OrderNumbers = []; 
          }
        }
        else 
        {
          this.validationErrors.WorkOrderNumberNA = "Order Number does not exist"; 
        }
        console.log(this.dataCorrectionData);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


  }

  public defaultNotifyEmail() {
    //Get Lookup
    //Get all necessary Lookups
    var filter = this.dataCorrectionData.Submitter;
    console.log('Submitter', this.dataCorrectionData.Submitter);
    console.log('defaultNotifyEmail', filter);
    
    var emailService = ""; 
    
    if (filter)
    {
    if (filter.Value2 == 'G')
    {
      emailService = 'GroupEmail';
    }
    else 
    {
      emailService = 'UserEmail';
    }
    this.uiService.getLookups(emailService, filter.Value).pipe(
      tap(result => {
        console.log('defaultNotifyEmail', result);
        if (result.length > 1)  {
          if (this.dataCorrectionData.CreatedByEmail && result[1].Value != this.dataCorrectionData.CreatedByEmail)
            this.dataCorrectionData.EmailNotifications = this.dataCorrectionData.CreatedByEmail + "; " + result[1].Value || '';
          else
            this.dataCorrectionData.EmailNotifications = result[1].Value || '';            
        }
        else  
        {
          if (this.dataCorrectionData.CreatedByEmail)
          {
            this.dataCorrectionData.EmailNotifications = this.dataCorrectionData.CreatedByEmail;           
          }
         
        }
      
        
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
    }
    else 
    {
      if (this.dataCorrectionData.CreatedByEmail)
      {
        this.dataCorrectionData.EmailNotifications = this.dataCorrectionData.CreatedByEmail;           
      }
    }
  }

  public defaultDataCorrectionInputs() {
    //WorkOrder related
    //Set Default Dates
    console.log('default Inputs');

    if (this.dataCorrectionData.DataCorrectionType == "1") {
      
      var needDate = new Date();
      needDate.setDate(needDate.getDate() + 5);
      console.log('needDate', needDate);
      this.dataCorrectionData.NeedDate = needDate.toLocaleDateString();

      var vendorEstDate = new Date();
      vendorEstDate.setDate(vendorEstDate.getDate() + 5);
      this.dataCorrectionData.VendorEstDate = vendorEstDate.toLocaleDateString();

      this.dataCorrectionData.Chargeable = 'NO';
    }
    else {

      var needDate = new Date();
      needDate.setDate(needDate.getDate() + 14);
      console.log('needDate', needDate);
      this.dataCorrectionData.NeedDate = needDate.toLocaleDateString();

      var vendorEstDate = new Date();
      vendorEstDate.setDate(vendorEstDate.getDate() + 14);
      this.dataCorrectionData.VendorEstDate = vendorEstDate.toLocaleDateString();

      this.dataCorrectionData.Chargeable = 'YES';

    }
  }
  public addNewSubmit() {

    if  (this.validationErrors?.WorkOrderNumberNA)
    {
      var s = this.validationErrors?.WorkOrderNumberNA;
      this.validationErrors = {};
      this.validationErrors.WorkOrderNumberNA = s; 
    }
    else 
    {
      this.validationErrors = {};
    }

    
    
    //Check validation 
    let noError = true;

    if (!this.dataCorrectionData.IssueTitle?.trim()) {
      this.validationErrors.IssueTitle = "Issue Title is required";
    }

    if (!this.dataCorrectionData.Submitter || !this.dataCorrectionData?.Submitter.Value) {
      this.validationErrors.Submitter = "Submitter is required";
    }

    if (!this.dataCorrectionData.WorkType) {
      this.validationErrors.WorkType = "Work Type is required";
    }

    if (!this.dataCorrectionData.Jurisdiction) {
      this.validationErrors.Jurisdiction = "Jurisdiction is required";
    }

    if (this.dataCorrectionData.DataCorrectionType == "1")
    {

      
      if (!this.dataCorrectionData.WorkOrderNumber) {
        this.validationErrors.WorkOrderNumber = "Order Number is required";
      }

      
      
      if (this.dataCorrectionData.LK_OrderNumbers?.length > 0)
      {
        if (!this.dataCorrectionData.SelectedOrderNumber)
        {
          this.validationErrors.WorkOrderNumber = "Order Number is required";
        }
        else 
        {
          //Use what's in the combo box instead 
          this.dataCorrectionData.WorkOrderNumber = this.dataCorrectionData.SelectedOrderNumber.ORDERNUMBER;
        }

      }

    if (!this.dataCorrectionData.WorkOrderState) {
      this.validationErrors.WorkOrderState = "Work Order State is required";
    }
  }
  else
  {
     delete this.validationErrors.WorkOrderNumberNA;
     delete this.validationErrors.WorkOrderNumber;
     delete this.validationErrors.WorkOrderState;
  }

  if(!this.dataCorrectionData.NeedDate) {
    this.validationErrors.NeedDate = "Need Date is required";
  }

  if(!this.dataCorrectionData.IssueDescription) {
    this.validationErrors.IssueDescription = "Description is required";
  }



  if(Object.keys(this.validationErrors).length)
  {
    return;
  }
  console.log('validationErrors', this.validationErrors);

  
  //check attachments 
  if (!this.dataCorrectionData.NewAttachments.length)
  {
    this.confirmationService.confirm({
      target: event.target,
      message: 'This request does not have an attachment, do you want to continue?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        //confirm action
        //refresh attachment list
        this.addNewSubmit2();
      },
      reject: () => {
        //reject action
        return; 
      }
    });  
  }
  else 
  {
     this.addNewSubmit2(); 
  }

  }

  public addNewSubmit2()
  {
    
  //Transform data 
  if (this.dataCorrectionData.Submitter.Value2 == 'P')
  {
    this.dataCorrectionData.Name = this.dataCorrectionData.Submitter.Label; 
  }
  else
  {
    this.dataCorrectionData.Name = this.dataCorrectionData.Submitter.Value; 
  }

  this.dataCorrectionData.Vendor = this.dataCorrectionData.Submitter.Value3; 



  if (this.dataCorrectionData.DataCorrectionType == "1") {
      
    var vendorEstDate = new Date(this.dataCorrectionData.NeedDate);
    vendorEstDate.setDate(vendorEstDate.getDate() + 5);
    this.dataCorrectionData.VendorEstDate = vendorEstDate.toLocaleDateString();
    this.dataCorrectionData.Chargeable = 'NO';
  }
  else {

    var vendorEstDate = new Date(this.dataCorrectionData.NeedDate);
    vendorEstDate.setDate(vendorEstDate.getDate() + 14);
    this.dataCorrectionData.VendorEstDate = vendorEstDate.toLocaleDateString();

    this.dataCorrectionData.Chargeable = 'YES';
  }
  this.isSubmitting = true; 

  this.uiService.addSiteVisitLog('DC', 'Add New', this.dataCorrectionData);

  this.dataCorrectionService.addNewData(this.dataCorrectionData).pipe(
    tap(result => {
      console.log('addNew result', result);
      this.isSubmitting = false; 
      if (result.errormessage) {
        //Notify message
        this.notificationService.notifyError("Add New Failed", result.errormessage);
      }
      else {
        //Add to response data 
        //we're good
        //query detail data 

        this.notificationService.notifySuccess("Submission Successfully Completed", "");
        this.dataCorrectionData.Issue_ID = result.Data.Issue_ID; 
        this.dataCorrectionData.RelatedIssueID = result.Data.RelatedIssueID; 
        this.dataCorrectionData.Submitted = true; 

        //this.showWindow = {};
      }
    }
    ),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();
  }
  public editCancel(event: any)
  {
    //Conirm
    this.confirmationService.confirm({
      target: event.target,
      message: 'Are you sure that you want to cancel your edit and close this window?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        //confirm action
        //refresh attachment list
        this.showWindow = {}; 
      },
      reject: () => {
        //reject action
        return; 
      }
    });
  }
  public editInit(data: any) {
  this.dataCorrectionData = new DataCorrectionModel();
  
  
  this.isSubmitting = false; 


  this.dataCorrectionData.Issue_ID = data['ISSUE_ID'];
  this.dataCorrectionData.IssueDescription = data['ISSUE_DESCRIPTION'];
  this.dataCorrectionData.IssueTitle = data['ISSUE_NAME'];
  this.dataCorrectionData.Name = data['WHO_ISSUED'];
  this.dataCorrectionData.Department = data['DEPARTMENT'];
  this.dataCorrectionData.WorkType = data['DEPARTMENT']; 
  this.dataCorrectionData.Vendor = data['VENDOR'];
  this.dataCorrectionData.AssignedTo = data['ASSIGNED_TO'];
  this.dataCorrectionData.Jurisdiction = data['LOCATION'];
  this.dataCorrectionData.Chargeable = data['CHARGEABLE'];
  this.dataCorrectionData.VendorComments = data['VENDORCOMMENTS'];
  this.dataCorrectionData.VendorEstDate = data['VENDORE_EST_DATE'];
  this.dataCorrectionData.NeedDate = data['COMPLETION_DATE'];
  this.dataCorrectionData.QCCompletionDate = data['QCCOMPLETIONDATE'];
  this.dataCorrectionData.DataCorrectionType = data['DATA_CORC_TYPE'];
  this.dataCorrectionData.WorkOrderNumber = data['ORDERNUMBER'];
  this.dataCorrectionData.UpdateEmails = data['EMAIL_ADDRESS'];
  this.dataCorrectionData.Remarks = data['REASONTOUPDATE'];
  this.dataCorrectionData.CreatedBy = data['CREATEDBY'];
  this.dataCorrectionData.Status = data['CURRENTSTATUS']; 
  //Get all necessary Lookups
  this.uiService.getLookups('DCSubmitter').pipe(

    tap(result => {
      this.dataCorrectionData.LK_Submitter = result || [];
      console.log('LK_Submitter', this.dataCorrectionData.LK_Submitter);
      //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 

      //Find Submitter 
      var submitterName = this.dataCorrectionData.Name.toUpperCase();
      var submitterInfo =  this.dataCorrectionData.LK_Submitter.filter(f => f.Label == submitterName)[0]; 

        this.dataCorrectionData.Submitter = submitterInfo; 
        if (!submitterInfo)
        {
          //just create one with the name 
          submitterInfo = {
            Value : this.dataCorrectionData.Name,
            Value2 : 'G',
            Label : this.dataCorrectionData.Name
          }; 

          this.dataCorrectionData.LK_Submitter.push(submitterInfo); 
          this.dataCorrectionData.Submitter = submitterInfo; 
        }
        console.log('submitterInfo', submitterInfo);

          //Get all necessary Lookups
          this.uiService.getLookups('UserEmail', this.dataCorrectionData.CreatedBy).pipe(
            tap(result => {
              this.dataCorrectionData.CreatedByEmail = result[0].Value || [];
              console.log('this.dataCorrectionData.CreatedByEmail', this.dataCorrectionData.CreatedByEmail);
                    //Get email
              this.defaultNotifyEmail(); 

            }),
            catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
          ).subscribe();
        

    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();

  //Get all necessary Lookups
  this.uiService.getLookups('Departments').pipe(
    tap(result => {
      this.dataCorrectionData.LK_Departments = result || [];
      console.log(this.dataCorrectionData);
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();

  //Get all necessary Lookups
  this.uiService.getLookups('Vendors').pipe(
    tap(result => {
      this.dataCorrectionData.LK_Vendors = result || [];
      console.log(this.dataCorrectionData);
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();


  //Get all necessary Lookups
  this.uiService.getLookups('AssignedTo').pipe(
    tap(result => {
      this.dataCorrectionData.LK_AssignedTo = result || [];
      console.log(this.dataCorrectionData);
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();


  //query for item
  this.attachmentData = new AttachmentModel(); 
  this.dataCorrectionService.fetchAttachmentData(data['ISSUE_ID']).pipe(
    tap(result => {
      this.attachmentData.Attachments = result.Data || []; 
      this.attachmentData.Issue_ID = this.dataCorrectionData.Issue_ID; 
//      this.dataCorrectionData.Attachments = result.Data || [];
      console.log('attachments', this.dataCorrectionData.Attachments);
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();

  this.defaultWorkTypeInputs(); 
  this.activateWindow('DATACORRECTIONEDIT');
}

public addNewCancel(event: any)
{
    console.log('Canceling?', event); 
      //Conirm
      this.confirmationService.confirm({
        target: event.target,
        message: 'Are you sure that you want to cancel and close this window?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          //confirm action
          //refresh attachment list
          this.showWindow = {}; 
        },
        reject: () => {
          //reject action
          return; 
        }
      });
  
}
  public addNewInit() {

  this.isSubmitting = false; 

  this.dataCorrectionData = new DataCorrectionModel();
  this.dataCorrectionData.DataCorrectionType = '2';
  this.dataCorrectionData.Name = this.user?.DisplayName; //this.user.displayName; 
  this.dataCorrectionData.Vendor = this.user?.Vendor;
  this.dataCorrectionData.CreatedBy = this.user?.Username; 
  this.dataCorrectionData.CreatedByEmail = this.user?.Email; 

  this.dataCorrectionData.EmailNotifications = this.user?.Email;
  //Get all necessary Lookups
  this.uiService.getLookups('DCSubmitter').pipe(
    tap(result => {
      this.dataCorrectionData.LK_Submitter = result || [];
      console.log('LK_Submitter', this.dataCorrectionData.LK_Submitter);

      //Default to the current user 
      var submitterInfo =  this.dataCorrectionData.LK_Submitter.filter(f => f.Value == this.dataCorrectionData.CreatedBy)[0]; 
      this.dataCorrectionData.Submitter = submitterInfo; 

      //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();

  //Get all necessary Lookups
  this.uiService.getLookups('Jurisdictions').pipe(
    tap(result => {
      this.dataCorrectionData.LK_Jurisdictions = result || [];
      console.log('Jurisdictions', this.dataCorrectionData.LK_Jurisdictions);
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();


  //defaults 
  console.log('user', this.user);



  this.defaultDataCorrectionInputs();
    console.log('dataCorrectionData', this.dataCorrectionData)
  this.activateWindow('DATACORRECTIONADD');
}


public reopenSubmit()
{

  this.validationErrors = {};

  if (!this.reopenData.Comment) {
    this.validationErrors.Comment = "Comment is required";
  }

  if (!this.reopenData.ReasonCode) {
     this.validationErrors.ReasonCode = "ReasonCode is required";
  }

  
  if(Object.keys(this.validationErrors).length)
  {
    return; 
  }

  this.isSubmitting = true; 

  this.uiService.addSiteVisitLog('DC', 'Reopen', this.reopenData);

  this.dataCorrectionService.reOpen(this.reopenData).pipe(
    tap(result => {
      console.log('reopenSubmit result', result);
      if (result.errormessage) {
        //Notify message
        this.notificationService.notifyError("Update Failed", result.errormessage);
      }
      else {
        //Add to response data 
        //we're good
        this.notificationService.notifySuccess("Update Successfully Completed", "");
        this.updateGrid(); 

        this.showWindow = {};
      }
    }
    ),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();

}
public reopenInit(checkedItems: any[]) {

  this.isSubmitting = false; 

  this.reopenData = new UpdateStatusModel();

  this.reopenData.checkedItems = checkedItems;
  this.validationErrors = {}; 

  let invalidItems = [];
  checkedItems.forEach(function (item) {
    if (item.CURRENTSTATUS != 'DCZ'
      && item.CURRENTSTATUS != 'DCQCZ'
      && item.CURRENTSTATUS != 'DCCNFA'
      
    ) {
      //Can't assign this issue
      invalidItems.push(item.ISSUE_ID);
    }
  }        
  );


  if (invalidItems.length > 0) 
  {
    this.validationErrors.ErrorIssues = invalidItems.join(', ');
  }

  if (this.reopenData.checkedItems?.length == 0)
  {
     this.validationErrors.Issue_ID = "No Issues Selected";    
     this.activateWindow('REOPEN');
     return; 
  }

  this.reopenData.checkedItemsList = checkedItems?.map(e => e.ISSUE_ID).join(', ');
  this.reopenData.Issue_IDs = checkedItems?.map(e => {
    let rObj = {}
    rObj['Issue_ID'] = e.ISSUE_ID; 
    rObj['Vendor'] = e.VENDOR; 
    return rObj
  });

  
  this.uiService.getLookups('ReopenReasonCode').pipe(
    tap(result => {
      this.reopenData.LK_ReasonCode = result || [];
    }),

    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();

  this.activateWindow('REOPEN');

  console.log('this.reopenData', this.reopenData);

}

filterGroup()
{
  var submitterName = this.dataCorrectionData.Name.toUpperCase();
  if (this.dataCorrectionData.FilterGroup)
   {
        this.dataCorrectionData.LK_Submitter = this.dataCorrectionData.LK_Submitter.filter(f=>f.Value2 == 'G' || f.Label == '...'); 
   }
   else 
   {
    this.uiService.getLookups('DCSubmitter').pipe(

      tap(result => {
        this.dataCorrectionData.LK_Submitter = result || [];
        console.log('LK_Submitter', this.dataCorrectionData.LK_Submitter);
        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
  
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
   }
}
}


class AssignUserModel {
  checkedItems: any[];
  checkedItemsList: string = "";
  Issue_IDs: any[];
  LK_AssignUsers: any[];
  LK_Vendors: any[]; 
  Assigned: any; 
  Assigned_To: string = '';
  AssignedName: string = ''; 
  Vendor: string; 
  Error: string;
  SubmitError: string;

}

class UpdateStatusModel {
  LK_Status: any[];
  LK_ReasonCode: any[];
  checkedItems: any[];
  checkedItemsList: string = "";
  Issue_IDs: any[];
  Status: string;   
  Comment: string; 
  ReasonCode: string; 
  QCDone: string = "True";
  Hours: number;
}


class ReopenModel {
  LK_ReasonCode: any[];
  checkedItems: any[];
  checkedItemsList: string = "";
  Issue_IDs: any[];
  Comment: string; 
  ReasonCode: string; 
}


class AttachmentModel {
  ID: string;
  Issue_ID: string;
  Vendor: string; 
  Attachments: string[];

  //for collecting information 
  files: any[];
}

class ResponseModel {
  Responses: any[];
  //for collecting information
  Issue_ID: string;
  Vendor: string; 
  Status: string;
  StatusDescription: string;
  Comment: string;
  CreatedBy: string;
  CreatedDate: string;
}

class ExportItemModel {
  ExportName: string;
}

class DataCorrectionModel {

  LK_Departments: any[];
  LK_Vendors: any[];
  LK_AssignedTo: any[];
  LK_Jurisdictions: any[];
  LK_WorkOrderStates: any[];
  LK_OrderNumbers: any[]; 
  LK_Submitter: any[];
  
  Attachments: any[] = [];
  SelectedOrderNumber: any; 
  Issue_ID: string;
  RelatedIssueID: string; 
  Name: string;
  Submitter: any;
  CreatedBy: string;   
  CreatedByEmail: string; 
  Department: string;
  WorkType: string;
  DataCorrectionType: string;
  NeedDate: string;
  QCCompletionDate: string;
  WorkOrderNumber: string;
  WorkOrderState: string;
  IssueTitle: string;
  IssueDescription: string;
  UpdateNotify: boolean;
  UpdateEmails: string;
  EmailNotifications: string;
  Vendor: string;
  VendorEstDate: string;
  VendorComments: string;
  Remarks: string;
  AssignedTo: string;
  Jurisdiction: string;
  Chargeable: string;
  NewAttachments: any[] = [];
  Submitted: boolean = false;  
  Status: string; 
  FilterGroup: boolean = false; 
}

class DetailModel {
  Issue_ID: string;
  Details: any[];
  Attachments: string[] = [];
  Responses: any[] = [];
  Transactions: any[] = []; 
  sectionVisible: any =
    {
      Details: true,
      Responses: true,
      Attachments: true,
      Transactions: true
    }
}

