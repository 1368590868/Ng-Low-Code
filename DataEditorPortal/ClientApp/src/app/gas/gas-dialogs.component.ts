import { Component } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';
import { catchError, elementAt, tap } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { UIService } from '../services/UI.service';
import { UserService } from '../services/user.service';
import { ConfirmationService } from 'primeng/api';
import { Output, EventEmitter } from '@angular/core';
import { GasService } from '../services/gas.service';

@Component({
  selector: 'app-gas-dialogs',
  templateUrl: './gas-dialogs.component.html',
  styleUrls: ['./gas.component.css']
})
export class GasDialogs {

  constructor(private uiService: UIService,
    private gasService: GasService,
    private notificationService: NotificationService,
    private userService: UserService,
    public confirmationService: ConfirmationService
  ) {
    this.user = userService.USER;
    console.log('user', this.user);
  }

  @Output() refreshGrid = new EventEmitter<string>();
  showWindow = {};
  user: any;
  gasData: GasDataModel; 
  validationErrors: any; 
  attachmentData: AttachmentModel;
  detailData: DetailModel;
  receiveData: ReceiveModel; 
  activeData: any; 
  isSubmitting: boolean = false; 

  public activateWindow(key: string) {
    this.showWindow = {};
    if (key) {
      this.showWindow[key] = true;
    }

  }

  
  public updateGrid() {
    this.refreshGrid.emit();
  }
  
  public closeWindow(event: any) {
    console.log('event', event);
    this.showWindow = {};
  }


  public receiveDefaultServiceAreaInput()
  {
    var filter = this.receiveData.ServiceArea;
    this.uiService.getLookups('Office', filter).pipe(
      tap(result => {
        this.receiveData.LK_Office = result || [];
        console.log('LK_Office', this.receiveData.LK_Office);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


  }
  public receiveInit()
  {
    this.receiveData = new ReceiveModel(); 
    this.isSubmitting = false; 

    this.uiService.getLookups('OrderState', 'GAS').pipe(
      tap(result => {
        this.receiveData.LK_WorkOrderState = result || [];
        console.log('LK_WorkOrderState', this.receiveData.LK_WorkOrderState);

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


    this.uiService.getLookups('OrderType', 'GAS').pipe(
      tap(result => {
        this.receiveData.LK_OrderType = result || [];
        console.log('LK_OrderType', this.receiveData.LK_OrderType);

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.uiService.getLookups('ServiceArea', 'GAS').pipe(
      tap(result => {
        this.receiveData.LK_ServiceArea = result || [];
        console.log('LK_ServiceArea', this.receiveData.LK_ServiceArea);

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.showWindow['RECEIVE'] = true; 
  }
  
  public receiveSubmit()
  {
    this.validationErrors = {}; 

    //Check to make sure the work order doesn't already exists 
    if (!this.receiveData.OrderNumber)
    {
      this.validationErrors.OrderNumber = "Order Number is required"; 
    }

    if (!this.receiveData.WorkOrderState)
    {
      this.validationErrors.WorkOrderState = "Order State is required"; 
    }


    if (Object.keys(this.validationErrors).length) {
      return;
    }

   
      this.gasService.validateWorkOrder(this.receiveData.OrderNumber, this.receiveData.WorkOrderState).pipe(
        tap(result => {
          if (result.Total > 0) {
            this.validationErrors.OrderNumber = "Work Order already exists";
    
          }
          else {
            this.isSubmitting = true; 

            this.uiService.addSiteVisitLog('GAS', 'Receive', this.receiveData);

    this.gasService.addNewData(this.receiveData).pipe(
      tap(result => {
        console.log('editSubmit result', result);
        this.isSubmitting = false; 

        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Add Failed", result.errormessage);
        }
        else {
          //Add to response data 
          //we're good
          //Copy properties over               
          //this.updateGrid(); 
          //this.notificationService.notifySuccess("Save Successfully Completed", "");
          //this.updateGrid(); 
          //this.showWindow = {};
          var data = {
            OrderNumber: this.receiveData.OrderNumber,
            ServiceArea: this.receiveData.ServiceArea,
            WorkOrderState: this.receiveData.WorkOrderState,
            OrderType: this.receiveData.OrderType,
            Office: this.receiveData.Office,
            ReferenceOrder: this.receiveData.ReferenceOrder,
            Attachments: [] 
          };

          this.gasService.fetchAttachmentData(data.OrderNumber, data.WorkOrderState).pipe(
            tap(result => {
              data.Attachments = result.Data || [];
              
              console.log('Attachments', data.Attachments);
            }),
            catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
          ).subscribe();

//          data.Attachments = this.receiveData.NewAttachments; 

          this.receiveData.SubmittedItems.push(data); 

          //reset attachments 
          this.receiveData.OrderNumber = "";
          this.receiveData.NewAttachments = []; 
          
        }
      }
      ),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
    
          }
          //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
        }),
        catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      ).subscribe();
    



  }

  
  attachmentRestore(event: any, data: any, source: any) {

    this.confirmationService.confirm({
      target: event.target,
      message: 'Are you sure that you want to restore ' + data.FILE_NAME + '?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        //confirm action
        //refresh attachment list
        console.log('attachmentRestore', data);
        this.uiService.addSiteVisitLog('GAS', 'Restore Attachment',data);

        this.gasService.restoreAttachment(data).pipe(
          tap(result => {
            if (!result.errormessage) {
              this.gasService.fetchAttachmentData(source.OrderNumber, source.OrderState).pipe(
                tap(result => {
                  source.Attachments = result.Data || [];
                  console.log('attachmentInit', source.Attachments);
                  this.activeData['HASATTACHMENTS'] = 'Y'; 
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

  attachmentDelete(event: any, data: any, source: any) {

    this.confirmationService.confirm({
      target: event.target,
      message: 'Are you sure that you want to remove ' + data.FILE_NAME + '?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        //confirm action
        //refresh attachment list
        this.uiService.addSiteVisitLog('GAS', 'Delete Attachment',data);

        console.log('attachmentDelete', data);
        this.gasService.deleteAttachment(data).pipe(
          tap(result => {
            if (!result.errormessage) {
              this.gasService.fetchAttachmentData(source.OrderNumber, source.OrderState).pipe(
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

  public canEdit(data: any) : boolean 
  {
    if (!this.user.Permissions.GAS_EDIT_FN_STATUS && data.CURRENTSTATUS == 'FN')
    {
      return false; 
    }

    if (this.user.Permissions.GAS_EDIT_VENDOR_ONLY)
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
    else if (this.user.Permissions.GAS_EDIT_BASIC || this.user.Permissions.GAS_EDIT_ALL)
    {
        return true; 
    }
    else 
    {
      return false; 
    }
  }
  public editInit(data: any) {
    console.log('editData', data); 
    
    this.isSubmitting = false; 

    this.validationErrors = {}; 

    this.gasData = new GasDataModel();

    this.gasData.UserVendor = this.user.Vendor;
    this.gasData.PlatName = data['PLATNAME'];
    this.gasData.WorkOrderState = data['WORKORDERSTATE'];
    this.gasData.WorkOrderStateNew = data['WORKORDERSTATE'];
    this.gasData.OrderNumber = data['ORDERNUMBER'];
    this.gasData.OrderType = data['ORDERTYPE'];
    this.gasData.City = data['CITY'];
    this.gasData.ServiceArea = data['SERVICEAREA'];
    this.gasData.Vendor = data['VENDOR'];
    this.gasData.VendorComment = data['VENDOR_COMMENTS'];
    this.gasData.BatchNumber = data['BATCH'];
    this.gasData.ProblemRemark = data['PROBLEM_REMARKS'];
    this.gasData.EstCompletionDate = data['EST_PROJ_COMP_DATE'];
    this.gasData.ProblemDescription = data['DESCRIPTION'];
    this.gasData.NeedDate = data['NEED_DATE']; 

    //this.gasData.UpdateEmails = data['CITY'];
    this.gasData.Office = data['OFFICE'];
    this.gasData.Project = data['PROJECT'];
    this.gasData.ReferenceWO = data['REF_ORDER_NOS'];
    this.gasData.CurrentStatus = data['CURRENTSTATUS']; 


    this.uiService.getLookups('OrderType', 'GAS').pipe(
      tap(result => {
        this.gasData.LK_OrderType = result || [];
        console.log('LK_OrderType', this.gasData.LK_OrderType);

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


    this.uiService.getLookups('ServiceArea', 'GAS').pipe(
      tap(result => {
        this.gasData.LK_ServiceArea = result || [];
        console.log('LK_ServiceArea', this.gasData.LK_ServiceArea);

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    
    this.uiService.getLookups('OrderState', 'GAS').pipe(
      tap(result => {
        this.gasData.LK_WorkOrderState = result || [];
        console.log('LK_WorkOrderState', this.gasData.LK_WorkOrderState);

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.uiService.getLookups('Vendor').pipe(
      tap(result => {
        this.gasData.LK_Vendor = result || [];
        console.log('LK_Vendor', this.gasData.LK_Vendor);

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
    
    this.uiService.getLookups('DesignArea').pipe(
      tap(result => {
        this.gasData.LK_DesignArea = result || [];
        console.log('LK_DesignArea', this.gasData.LK_DesignArea);

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.uiService.getLookups('ProblemDescription', 'GAS').pipe(
      tap(result => {
        this.gasData.LK_ProblemDescription = result || [];
        console.log('LK_ProblemDescription', this.gasData.LK_ProblemDescription);

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.defaultServiceAreaInput(); 

    this.showWindow['EDIT'] = true;


  }

  public editSubmit()
  {
    var noError: boolean = true;
    this.validationErrors = {}; 

    if (!this.gasData.OrderType)
    {
      this.validationErrors.OrderType = "Order Type is required"; 
    }

    
    if (!this.gasData.WorkOrderStateNew)
    {
      this.validationErrors.WorkOrderState = "Order State is required"; 
    }

    if (!this.gasData.ServiceArea)
    {
      this.validationErrors.ServiceArea = "Service Area is required"; 
    }

    if (Object.keys(this.validationErrors).length) {
      return;
    }
    
    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog('GAS', 'Update',this.gasData);

    this.gasService.saveData(this.gasData).pipe(
      tap(result => {
        console.log('editSubmit result', result);
        this.isSubmitting = false; 
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
  public defaultServiceAreaInput() {
    console.log('defaultServiceAreaInput', this.gasData.ServiceArea);
    var filter = this.gasData.ServiceArea;
    this.uiService.getLookups('City', filter).pipe(
      tap(result => {
        this.gasData.LK_City = result || [];
        console.log('LK_City', this.gasData.LK_City);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.uiService.getLookups('Project', filter).pipe(
      tap(result => {
        this.gasData.LK_Project = result || [];
        console.log('LK_Project', this.gasData.LK_Project);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.uiService.getLookups('Office', filter).pipe(
      tap(result => {
        this.gasData.LK_Office = result || [];
        console.log('LK_Office', this.gasData.LK_Office);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.validateBatchNumber();
  }

  attachmentDownload(data: any)
  {
    console.log('attachmentDownload', data);
    this.uiService.addSiteVisitLog('GAS', 'Download Attachment',data);

    if (!data.ID)
    {
        data.ID = data.FileID; 
        data.FILE_NAME = data.FileName; 
    }

    this.gasService.getAttachmentData(data).pipe(
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
      //err.name || err.statusText, err.message || err.error
      catchError(err => this.notificationService.notifyErrorInPipe({ name: 'Error: ', message: 'File Does Not Exist' }, []))
  
    ).subscribe();
  
  }

    tempAttachmentDownload(data: any)
  {
    console.log('attachmentDownload', data);
    this.gasService.getTempAttachmentData(data).pipe(
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

  public validateBatchNumber() {
    if (this.gasData.BatchNumber) {
      this.gasService.validateBatch(this.gasData.BatchNumber).pipe(
        tap(result => {
          if (result.Total > 0) {
            if (result.Data[0]['SERVICEAREA'] != this.gasData.ServiceArea) {              
              this.validationErrors.BatchNumber = "Batch Number Service Area (" + result.Data[0]['SERVICEAREA'] + ") is different";
            }
            else {
              delete this.validationErrors.BatchNumber;
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
    else
    {
      delete this.validationErrors.BatchNumber;
    }
  }

  
  onFileUploadError(event: any, fileUpload: FileUpload) {
    fileUpload.clear();
    this.notificationService.notifyErrorInPipe(event.error).subscribe();
  }
  onFileUploadSuccess(event: any, fileUpload: FileUpload, originData: any) {
    console.log('onFileUploadSuccess', event);

    //refresh attachment list
    this.gasService.fetchAttachmentData(originData.OrderNumber, originData.OrderState).pipe(
      tap(result => {
        originData.Attachments = result.Data || [];
        this.activeData['HASATTACHMENTS'] = 'Y'; 
        console.log('attachments', originData.Attachments);
        
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
  }


  addNewRemoveAttachment(fileID: string) {
    for (let i = 0; i < this.receiveData.NewAttachments.length; i++)
      if (this.receiveData.NewAttachments[i].FileID === fileID) {
        this.receiveData.NewAttachments.splice(i, 1);
        break;
      }
  }

  
  public detailInit(data: any) {
    this.detailData = new DetailModel();

    this.detailData.OrderNumber = data['ORDERNUMBER'];

    this.uiService.addSiteVisitLog('GAS', 'View Detail',this.detailData);

    //query for item
    this.gasService.fetchDetailData(data['ORDERNUMBER'], data['WORKORDERSTATE']).pipe(
      tap(result => {
        this.detailData.Details = result || [];
        console.log('details', this.detailData);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


    this.gasService.fetchAttachmentData(data['ORDERNUMBER'], data['WORKORDERSTATE']).pipe(
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
    this.gasService.fetchTransactionData(data['ORDERNUMBER'], data['WORKORDERSTATE']).pipe(
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

    
    this.gasService.fetchComments(data['ORDERNUMBER'], data['WORKORDERSTATE']).pipe(
      tap(result => {
        this.detailData.Comments = result.Data || []; 
        console.log('Comments', this.detailData.Comments);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    
    this.gasService.fetchRelatedOrders(data['ORDERNUMBER'], data['WORKORDERSTATE']).pipe(
      tap(result => {
        this.detailData.RelatedOrders = result.Data || []; 
        console.log('RelatedOrders', this.detailData.RelatedOrders);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    console.log('responses', this.detailData);

    this.activateWindow('DETAIL');
  }
  public attachmentInit(data: any) {


    console.log('attachmentInit', data);
    this.attachmentData = new AttachmentModel();
    this.attachmentData.OrderNumber = data['ORDERNUMBER'];
    this.attachmentData.OrderType = data['ORDERTYPE'];
    this.attachmentData.OrderState = data['WORKORDERSTATE'];
    this.attachmentData.Vendor = data['VENDOR']; 
    this.attachmentData.CURRENTSTATUS = data['CURRENTSTATUS']; 
    this.attachmentData.OrderStatus = data['CURRENTSTATUS'];

    this.activeData = data; 

    //query for item
    this.gasService.fetchAttachmentData(data['ORDERNUMBER'], data['WORKORDERSTATE']).pipe(
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
      this.gasData.NewAttachments.push(result[i]);
    }

    console.log('this.dataCorrectionData', this.gasData);
  }

  
  receiveAddNewFileUploadSuccess(event: any, fileUpload: FileUpload) {
    console.log('onFileUploadSuccess', event);
    console.log('onFileUploadSuccess', event.originalEvent.body);
    console.log('fileUpload', fileUpload);

    //Add to file 
    var result = event.originalEvent.body;
    for (let i = 0; i < result.length; i++) {
      this.receiveData.NewAttachments.push(result[i]);
    }

    console.log('this.dataCorrectionData', this.gasData);
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
  OrderType: string;
  OrderStatus: string; 
  Vendor: string;   
  Attachments: string[];
  CURRENTSTATUS: string; 

  //for collecting information 
  files: any[];
}


class DetailModel {
  OrderNumber: string;
  Details: any[];
  Attachments: string[] = [];
  Transactions: any[] = [];
  Comments: any[] = []; 
  RelatedOrders: any[] = []; 
  sectionVisible: any =
    {
      Details: true,
      Attachments: true,
      Transactions: true,
      Comments: true,
      RelatedOrders: true,
    }
}

class ReceiveModel {
  LK_OrderType: any[];
  LK_ServiceArea: any[];
  LK_WorkOrderState: any[]; 
  LK_Jurisdiction: any[]; 
  LK_Office: any[]; 

  OrderNumber: string; 
  ServiceArea: string; 
  WorkOrderState: string; 
  OrderType: string;
  BatchNumber: string; 
  Jurisdiction: string; 
  Office: string; 
  ReferenceOrder: string; 

  NewAttachments: any[] = [];

  SubmittedItems: any[] = []; 
  UserVendor: string;

}
class GasDataModel {

  LK_OrderType: any[];
  LK_ServiceArea: any[];
  LK_Project: any[];
  LK_Office: any[];
  LK_City: any[];
  LK_Vendor: any[];
  LK_DesignArea: any[]; 
  LK_WorkOrderState: any[]; 
  LK_ProblemDescription: any[];

  OrderNumber: string;
  WorkOrderState: string;
  WorkOrderStateNew: string;
  OrderType: string;
  ProblemDescription: string;
  ProblemRemark: string;
  ServiceArea: string;
  AssignedTo: string;
  BatchNumber: string;
  CurrentStatus: string; 
  Office: string;
  Project: string;
  EstCompletionDate: string;
  City: string;
  PlatName: string;
  NeedDate: string; 
  ReferenceWO: string;

  Vendor: string;
  VendorComment: string;


    //The Vendor of the User, used to Transaction Purpose
    UserVendor: string;

    Attachments: any[] = [];
  
    NewAttachments: any[] = [];
    Submitted: boolean = false;
  
}