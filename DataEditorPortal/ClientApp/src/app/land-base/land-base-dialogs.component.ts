import { Component } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';
import { catchError, elementAt, tap } from 'rxjs/operators';
import { LandBaseService } from '../services/land-base.service';
import { NotificationService } from '../services/notification.service';
import { UIService } from '../services/UI.service';
import { UserService } from '../services/user.service';
import { ConfirmationService } from 'primeng/api';
import { Output, EventEmitter } from '@angular/core';
import { AppDataService } from '../services/app-data.service';


@Component({
  selector: 'app-land-base-dialogs',
  templateUrl: './land-base-dialogs.component.html',
  styleUrls: ['./land-base.component.css']
})
export class LandBaseDialogs {
  constructor(private uiService: UIService,
    private landbaseService: LandBaseService,
    private notificationService: NotificationService,
    private userService: UserService,
    public confirmationService: ConfirmationService,
    public appDataService: AppDataService
  ) {
    this.user = userService.USER;
    console.log('user', this.user);
  }

  @Output() refreshGrid = new EventEmitter<string>();
  showWindow = {};
  user: any;
  validationErrors: any;
  platData: PlatDataModel;
  attachmentData: AttachmentModel;
  detailData: DetailModel;
  activeData: any; 
  isSubmitting: boolean = false; 


  public activateWindow(key: string) {
    this.showWindow = {};
    if (key) {
      this.showWindow[key] = true;
    }

  }

  public closeWindow(event: any) {
    console.log('event', event);
    this.showWindow = {};
  }

  public updateGrid() {
    this.refreshGrid.emit();
  }


  public defaultPlatLookups() {

    this.uiService.getLookups('RequestedUser').pipe(
      tap(result => {
        this.platData.LK_RequestedBy = result || [];
        console.log('LK_RequestedBy', this.platData.LK_RequestedBy);

        //Default to the current user 
        if (this.platData.Mode == 'ADD') {
          this.platData.Requestor = this.platData.LK_RequestedBy.filter(f => f.Value == this.platData.CreatedBy)[0];
          this.defaultRequestInput();
        }
        else 
        {
          this.platData.Requestor = this.platData.LK_RequestedBy.filter(f => f.Value == this.platData.RequestedBy)[0];          
        }
        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.uiService.getLookups('OrderState', 'LANDBASE').pipe(
      tap(result => {
        this.platData.LK_WorkOrderState = result || [];
        console.log('LK_WorkOrderState', this.platData.LK_WorkOrderState);

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.uiService.getLookups('DesignArea').pipe(
      tap(result => {
        this.platData.LK_DesignArea = result || [];
        console.log('LK_DesignArea', this.platData.LK_DesignArea);

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


    this.uiService.getLookups('ProblemDescription', 'LANDBASE').pipe(
      tap(result => {
        this.platData.LK_ProblemDescription = result || [];
        console.log('LK_ProblemDescription', this.platData.LK_ProblemDescription);

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    if (this.platData.Mode == 'EDIT') {
      this.uiService.getLookups('ProblemDescription', 'LANDBASE').pipe(
        tap(result => {
          this.platData.LK_ProblemDescription = result || [];
          console.log('LK_ProblemDescription', this.platData.LK_ProblemDescription);

        }),
        catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      ).subscribe();

      this.uiService.getLookups('Vendor').pipe(
        tap(result => {
          this.platData.LK_Vendor = result || [];
          console.log('LK_Vendor', this.platData.LK_Vendor);

        }),
        catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      ).subscribe();
    }

    this.uiService.getLookups('ServiceArea', 'LANDBASE').pipe(
      tap(result => {
        this.platData.LK_ServiceArea = result || [];
        console.log('LK_ServiceArea', this.platData.LK_ServiceArea);

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.uiService.getLookups('OrderType', 'LANDBASE').pipe(
      tap(result => {
        this.platData.LK_OrderType = result || [];
        console.log('LK_OrderType', this.platData.LK_OrderType);

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


    this.uiService.getLookups('LBStatus').pipe(
      tap(result => {
        this.platData.LK_Status = result || [];
        console.log('LK_Status', this.platData.LK_Status);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


    this.uiService.getLookups('Section').pipe(
      tap(result => {
        this.platData.LK_Section = result || [];
        console.log('LK_Section', this.platData.LK_Section);

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();



    this.uiService.getLookups('QuarterSection').pipe(
      tap(result => {
        this.platData.LK_QuarterSection = result || [];
        console.log('LK_QuarterSection', this.platData.LK_QuarterSection);

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();



    console.log('platData', this.platData);
  }
  
  public editInit(data: any) {
    console.log('editData', data); 
    this.isSubmitting = false; 


    this.validationErrors = {}; 

    this.platData = new PlatDataModel();
    this.platData.Mode = 'EDIT';
    
    this.platData.PlatID = data['PLATID'];
    this.platData.UserVendor = this.user.Vendor;
    this.platData.PlatName = data['PLATNAME'];
    this.platData.WorkOrderState = data['WORKORDERSTATE'];
    this.platData.WorkOrderStateNew = data['WORKORDERSTATE'];
    this.platData.OrderNumber = data['ORDERNUMBER'];
    this.platData.OrderType = data['ORDERTYPE'];
    this.platData.City = data['CITY'];
    this.platData.ServiceArea = data['SERVICEAREA'];
    this.platData.Vendor = data['VENDOR'];
    this.platData.VendorComment = data['VENDOR_COMMENTS'];
    this.platData.BatchNumber = data['BATCH'];
    this.platData.ProblemRemark = data['PROBLEM_REMARKS'];
    this.platData.EstCompletionDate = data['EST_PROJ_COMP_DATE'];
    this.platData.ProblemDescription = data['DESCRIPTION'];
    this.platData.RequestedBy = data['REQUESTBY'];
    this.platData.RequestorEmail = data['EMAIL'];
    this.platData.RequestorPhone = data['REQUESTOR_PHONE'];
    this.platData.Status = data['USERSTATUS'];
    this.platData.DesignArea = data["DESIGNAREA"]; 
    this.platData.CurrentStatus = data['CURRENTSTATUS']; 

    //this.platData.UpdateEmails = data['CITY'];
    this.platData.Office = data['OFFICE'];
    this.platData.Project = data['PROJECT'];
    this.platData.JTProjectID = data['JT_PROJECT_ID'];
    this.platData.Address = data['ADDRESS'];
    this.platData.Township = data['TOWNSHIP'];
    this.platData.Range = data['RANGE'];
    this.platData.Section = data['SECTION'];
    this.platData.QuarterSection = data['QUARTER_SECTION'];
    this.platData.Comments = data['COMMENTS'];
    this.platData.NeedDate = data['NEED_DATE'];
    this.platData.MapNumber = data['MAPNUM'];
    this.platData.County = data['COUNTY'];
    this.platData.BuildingTypeList = data['BUILDINGTYPE']; 
    this.platData.BuildingType = data['BUILDINGTYPE'].split(',');
    this.platData.ReferenceWO = data['REF_ORDER_NOS'];

    this.platData.DialogTitle = "Edit Existing Work Order " + this.platData.OrderNumber;

    this.defaultPlatLookups();

    //query for item
    this.attachmentData = new AttachmentModel();
    this.attachmentData.OrderNumber = this.platData.OrderNumber;
    this.attachmentData.PlatID = this.platData.PlatID;
    this.attachmentData.OrderState = this.platData.WorkOrderState;
    this.attachmentData.OrderType = this.platData.OrderType;
    this.attachmentData.Vendor = this.platData.Vendor; 
    this.attachmentData.CURRENTSTATUS = data['CURRENTSTATUS']; 
    this.attachmentData.OrderStatus = data['CURRENTSTATUS']; 

    this.landbaseService.fetchAttachmentData(data['ORDERNUMBER'], data['WORKORDERSTATE']).pipe(
      tap(result => {
        this.attachmentData.Attachments = result.Data || [];

        //      this.dataCorrectionData.Attachments = result.Data || [];
        console.log('attachments', this.attachmentData);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.defaultServiceAreaInput(); 

    console.log('attachments', this.attachmentData);

    this.showWindow['PLAT'] = true;


  }

  public ValidatePlatInfo() {

    if (this.validationErrors?.BatchNumber) {
      var s = this.validationErrors?.BatchNumber;
      this.validationErrors = {};
      this.validationErrors.BatchNumber = s;
    }
    else {
      this.validationErrors = {};
    }

    if (!this.platData.Requestor && !this.platData?.Requestor.Value) {
      this.validationErrors.Requestor = "Requestor is required";
    }

    if (!this.platData.NeedDate) {
      this.validationErrors.NeedDate = "Need Date is required";
    }

    if (!this.platData.ServiceArea) {
      this.validationErrors.ServiceArea = "Service Area is required";
    }

//    if (!this.platData.Office) {
//      this.validationErrors.Office = "Office is required";
//    }

    if (!this.platData.PlatName) {
      this.validationErrors.PlatName = "Plat Name is required";
    }

    if (!this.platData.WorkOrderState) {
      this.validationErrors.WorkOrderState = "Order State is required";
    }
    
    if (!this.platData.WorkOrderStateNew && this.platData.Mode == 'EDIT') {
      this.validationErrors.WorkOrderStateNew = "Order State is required";
    }

    if (!this.platData.OrderType) {
      this.validationErrors.OrderType = "Order Type is required";
    }

    if (!this.platData.County) {
      this.validationErrors.County = "County is required";
    }


    if (!this.platData.MapNumber) {
      this.validationErrors.MapNumber = "Map Number is required";
    }

  }

  public validateBatchNumber() {
    if (this.platData.BatchNumber) {
      this.landbaseService.validateBatch(this.platData.BatchNumber).pipe(
        tap(result => {
          if (result.Total > 0) {
            if (result.Data[0]['SERVICEAREA'] != this.platData.ServiceArea) {              
              this.validationErrors.BatchNumber = "Batch Number Service Area (" + result.Data[0]['SERVICEAREA'] + ") is different";
            }
            else {
              this.validationErrors.BatchNumber = "";
            }
          }
          else {
            this.validationErrors.BatchNumber = "Batch Number does not exist";
          }
          //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
        }),
        catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      ).subscribe();
    }
  }

  public AddEditSubmit() {

    //Transfer Requestor to just ID f
    this.platData.RequestedBy = this.platData.Requestor.Value;

    if (this.platData.BuildingType.length > 0)
    {
      this.platData.BuildingTypeList = this.platData.BuildingType.join(','); 
    }

    this.ValidatePlatInfo();

    var noError: boolean = true;
    if (Object.keys(this.validationErrors).length) {
      noError = false;
    }

    if (noError) {


      if (this.platData.Mode == "ADD") {

            
          //check attachments 
          if (!this.platData.NewAttachments.length)
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
      else {

        this.isSubmitting = true; 

        this.uiService.addSiteVisitLog('LANDBASE', 'Edit Plat',  this.platData);

        this.landbaseService.saveData(this.platData).pipe(
          tap(result => {
            this.isSubmitting = false; 

            console.log('editSubmit result', result);
            if (result.errormessage) {
              //Notify message
              this.notificationService.notifyError("Save Data Failed", result.errormessage);
            }
            else {
              //Add to response data 
              //we're good
              //Copy properties over               
              this.updateGrid(); 
              this.notificationService.notifySuccess("Save Successfully Completed", "");
              //this.updateGrid(); 
              this.showWindow = {};
            }
          }
          ),
          catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
        ).subscribe();
      }
    }
  }

  public addNewSubmit2()
  {

    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog('LANDBASE', 'Receive Plat',  this.platData);

    this.landbaseService.addNewData(this.platData).pipe(
      tap(result => {
        this.isSubmitting = false; 

        console.log('addNewData result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Add Data Failed", result.errormessage);
        }
        else {
          //Add to response data 
          //we're good
          this.platData.Submitted = true;
          this.platData.PlatID = result.Data.PlatID;
          this.platData.OrderNumber = result.Data.OrderNumber;
          this.notificationService.notifySuccess("Save Successfully Completed", "");
        }
      }
      ),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
  }
  
  public defaultRequestInput() {

    console.log('defaultRequestInput', this.platData.Requestor);

    this.uiService.getLookups('UserContact', this.platData.Requestor.Value).pipe(
      tap(result => {
        console.log('defaultNotifyEmail', result);
        if (result.length > 1) {
          this.platData.RequestorEmail = result[1].Label;
          this.platData.RequestorPhone = result[1].Value;
        }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
  }

  public ReceivePlatInit() {
    this.isSubmitting = false; 

    this.validationErrors = {};
    this.platData = new PlatDataModel();
    this.platData.Mode = 'ADD';
    this.platData.UserVendor = this.user.Vendor;
    this.platData.DialogTitle = "Submit New Landbase Work";
    this.platData.CreatedBy = this.user?.Username;
    this.platData.BuildingType = [];
    this.defaultPlatLookups();

    this.activateWindow('PLAT');
  }
  public defaultServiceAreaInput() {
    console.log('defaultServiceAreaInput', this.platData.ServiceArea);
    var filter = this.platData.ServiceArea;
    this.uiService.getLookups('City', filter).pipe(
      tap(result => {
        this.platData.LK_City = result || [];
        console.log('LK_City', this.platData.LK_City);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    var filter = this.platData.ServiceArea;
    this.uiService.getLookups('Project', filter).pipe(
      tap(result => {
        this.platData.LK_Project = result || [];
        console.log('LK_Project', this.platData.LK_Project);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    var filter = this.platData.ServiceArea;
    this.uiService.getLookups('Office', filter).pipe(
      tap(result => {
        this.platData.LK_Office = result || [];
        console.log('LK_Office', this.platData.LK_Office);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.validateBatchNumber();
  }

  attachmentRestore(event: any, data: any, source: any) {

    this.uiService.addSiteVisitLog('LANDBASE', 'Restore Attachment',  data);

    this.confirmationService.confirm({
      target: event.target,
      message: 'Are you sure that you want to restore ' + data.FILE_NAME + '?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        //confirm action
        //refresh attachment list
        console.log('attachmentRestore', data);
        this.landbaseService.restoreAttachment(data).pipe(
          tap(result => {
            if (!result.errormessage) {
              this.landbaseService.fetchAttachmentData(source.OrderNumber, source.OrderState).pipe(
                tap(result => {
                  source.Attachments = result.Data || [];
                  this.activeData['HASATTACHMENTS'] = 'Y'; 
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

  public canEdit(data: any) : boolean 
  {

    if (!this.user.Permissions.LANDBASE_EDIT_FN_STATUS && data.CURRENTSTATUS == 'FN')
    {
      return false; 
    }


    if (this.user.Permissions.LANDBASE_EDIT_VENDOR_ONLY)
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
    else if (this.user.Permissions.LANDBASE_EDIT_BASIC || this.user.Permissions.LANDBASE_EDIT_ALL)
    {
        return true; 
    }
    else 
    {
      return false; 
    }
  }

  attachmentDelete(event: any, data: any, source: any) {

    this.uiService.addSiteVisitLog('LANDBASE', 'Delete Attachment',  data);

    this.confirmationService.confirm({
      target: event.target,
      message: 'Are you sure that you want to remove ' + data.FILE_NAME + '?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        //confirm action
        //refresh attachment list
        console.log('attachmentDelete', data);
        this.landbaseService.deleteAttachment(data).pipe(
          tap(result => {
            if (!result.errormessage) {
              this.landbaseService.fetchAttachmentData(source.OrderNumber, source.OrderState).pipe(
                tap(result => {
                  source.Attachments = result.Data || [];
                  if (!source.Attachments.filter(f => f.STATUS != 'Removed')[0])
                  {
                      this.activeData['HASATTACHMENTS'] = ''; 
                  }
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
    this.landbaseService.fetchAttachmentData(originData.OrderNumber, originData.OrderState).pipe(
      tap(result => {
        originData.Attachments = result.Data || [];
        this.activeData['HASATTACHMENTS'] = 'Y'; 
        console.log('attachments', originData.Attachments);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
  }

  closeAttachment()
  {
    if (this.appDataService.currentSearchView == 'Detail')
    {
      this.updateGrid(); 
    }
    
    this.showWindow = {};
  }
  addNewRemoveAttachment(fileID: string) {
    for (let i = 0; i < this.platData.NewAttachments.length; i++)
      if (this.platData.NewAttachments[i].FileID === fileID) {
        this.platData.NewAttachments.splice(i, 1);
        break;
      }
  }

  public detailInit(data: any) {

    this.uiService.addSiteVisitLog('LANDBASE', 'Show Detail', data);

    this.detailData = new DetailModel();

    this.detailData.OrderNumber = data['ORDERNUMBER'];
    //query for item
    this.landbaseService.fetchDetailData(data['ORDERNUMBER']).pipe(
      tap(result => {
        this.detailData.Details = result || [];
        console.log('details', this.detailData);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


    this.landbaseService.fetchAttachmentData(data['ORDERNUMBER'], data['WORKORDERSTATE']).pipe(
      tap(result => {

        for (let i = 0; i < result.Data.length; i++) {

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
    this.landbaseService.fetchTransactionData(data['ORDERNUMBER']).pipe(
      tap(result => {
        this.detailData.Transactions = result.Data || [];
        console.log('Transactions', this.detailData.Transactions);
        for (let i = 0; i < this.detailData.Transactions.length; i++) {
          this.detailData.Transactions[i].Fields = JSON.parse(this.detailData.Transactions[i].DETAILS.replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/\t/g, "\\t"));
        }
        console.log('responses', this.detailData.Transactions);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    console.log('responses', this.detailData);

    
    this.landbaseService.fetchComments(data['ORDERNUMBER'], data['WORKORDERSTATE']).pipe(
      tap(result => {
        this.detailData.Comments = result.Data || []; 
        console.log('Comments', this.detailData.Comments);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


    this.activateWindow('DETAIL');
  }


  attachmentDownload(data: any)
  {
    console.log('attachmentDownload', data);
    this.uiService.addSiteVisitLog('LANDBASE', 'Download Attachment', data);

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

  
  tempAttachmentDownload(data: any)
  {
    console.log('attachmentDownload', data);
    this.landbaseService.getTempAttachmentData(data).pipe(
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

  public attachmentInit(data: any) {


    console.log('attachmentInit', data);
    this.attachmentData = new AttachmentModel();
    this.attachmentData.PlatID = data['PLATID'];
    this.attachmentData.OrderNumber = data['ORDERNUMBER'];
    this.attachmentData.OrderType = data['ORDERTYPE'];
    this.attachmentData.OrderState = data['WORKORDERSTATE'];
    this.attachmentData.Vendor = data['VENDOR']; 
    this.attachmentData.OrderStatus = data['CURRENTSTATUS'];
    this.activeData = data; 

    //query for item
    this.landbaseService.fetchAttachmentData(data['ORDERNUMBER'], data['WORKORDERSTATE']).pipe(
      tap(result => {
        this.attachmentData.Attachments = result.Data || [];
        console.log('attachmentInit', this.attachmentData.Attachments);
        this.activateWindow('ATTACHMENT');
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


  }

  addNewFileUploadSuccess(event: any, fileUpload: FileUpload) {
    console.log('onFileUploadSuccess', event);
    console.log('onFileUploadSuccess', event.originalEvent.body);
    console.log('fileUpload', fileUpload);

    //Add to file 
    var result = event.originalEvent.body;
    for (let i = 0; i < result.length; i++) {
      this.platData.NewAttachments.push(result[i]);
    }

    console.log('this.dataCorrectionData', this.platData);
  }

  attachmentSubmit(event: any) {
    console.log('Attachment Submitting', event, event.formData);
    event.formData.append('OrderNumber', this.attachmentData.OrderNumber);
    event.formData.append('OrderType', this.attachmentData.OrderType);
    event.formData.append('PlatID', this.attachmentData.PlatID);
    event.formData.append('OrderState', this.attachmentData.OrderState);
    event.formData.append('OrderStatus', this.attachmentData.OrderStatus);


  }

}


class AttachmentModel {
  ID: string;
  PlatID: string;
  OrderNumber: string;
  OrderState: string;
  OrderStatus: string; 
  OrderType: string;
  Vendor: string; 
  Attachments: string[];
  CURRENTSTATUS: string; 

  //for collecting information 
  files: any[];
}

class PlatDataModel {
  LK_Status: any[];
  LK_ServiceArea: any[];
  LK_RequestedBy: any[];
  LK_OrderType: any[];
  LK_DesignArea: any[];
  LK_WorkOrderState: any[];
  LK_City: any[];
  LK_ProblemDescription: any[];
  LK_Project: any[];
  LK_Office: any[];
  LK_Vendor: any[];
  LK_Section: any[];
  LK_QuarterSection: any[];

  Mode: string;
  DialogTitle: string;
  PlatID: string;
  PlatName: string;
  ServiceArea: string;
  OrderType: string;
  OrderNumber: string;
  DesignArea: string;
  County: string;
  MapNumber: string;
  BuildingType: string[] = [];
  BuildingTypeList: string; 
  Requestor: any;
  RequestedBy: string;
  RequestorEmail: string;
  RequestorPhone: string;

  Superior: boolean;
  ReferenceWO: string;
  BatchNumber: string;
  JTProjectID: string;
  Status: string;
  CreatedBy: string;
  EmailNotifications: string;
  UpdateEmails: string;
  WorkOrderState: string;
  WorkOrderStateNew: string;
  ProblemDescription: string;
  ProblemRemark: string;
  AssignedTo: string;
  Office: string;
  Project: string;
  EstCompletionDate: string;
  City: string;
  Address: string;
  Township: string;
  Range: string;
  Section: string;
  QuarterSection: string;
  Comments: string;
  CurrentStatus: string; 

  //The Vendor of the User, used to Transaction Purpose
  UserVendor: string;

  Vendor: string;
  VendorComment: string;
  NeedDate: string;
  Attachments: any[] = [];

  NewAttachments: any[] = [];
  Submitted: boolean = false;

}


class DetailModel {
  OrderNumber: string;
  Details: any[];
  Attachments: string[] = [];
  Transactions: any[] = [];
  Comments: any[] = [];
  sectionVisible: any =
    {
      Details: true,
      Attachments: true,
      Transactions: true,
      Comments: true,
    }
}