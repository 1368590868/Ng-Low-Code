import { Component, EventEmitter, Inject, Injectable, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AppDataService, SearchDetailResult } from '../services/app-data.service';
import { UserService } from '../services/user.service';
import { NotificationService } from '../services/notification.service';
import { UIService } from '../services/UI.service';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { ConfirmationService } from 'primeng/api';
import { WOService } from '../services/WO.service';
import { HttpClient } from '@angular/common/http';
import { FileUpload } from 'primeng/fileupload';
import {ListboxModule} from 'primeng/listbox';


@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-work-order',
  templateUrl: './work-order.component.html',
  styleUrls: ['./work-order.component.css']
})

export class WorkOrderComponent {


  constructor(
    private http: HttpClient,
    @Inject('API_URL') apiUrl: string,
    private router: Router,
    private notificationService: NotificationService,
    public uiService: UIService,
    public appDataService: AppDataService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService,
    private workOrderService: WOService

  ) {
    this.user = userService.USER;
    this.toolPermission = new ToolPermissionModel();


  }

  user: any;
  enableTool = {
  };

  toolPermission: ToolPermissionModel;

  checkedCount = 0;
  checkedState = {};
  checkedItems = [];
  checkedItemsList = "";

  listrecords: any[];
  detailrecord: any;

  datasource: string; //GAS, ELECTRIC, LANDBASE



  @Output() refreshGrid = new EventEmitter<string>();
  showWindow = {};
  validationErrors: any;
  cols: any[];
  colData: any[];
  assignWorkOrderData: AssignWorkOrderModel;
  closedProblemData: ClosedProblemModel;
  CNFAData: CFNAModel;
  completeData: CompleteModel;
  problemData: ProblemModel;
  deleteData: DeleteModel;
  sentReceivedData: SentReceivedModel;
  reOpenData: ReOpenModel;
  packetData: PacketModel;
  postableData: PostableModel;
  relatedOrderData: RelatedOrderModel;
  assignProjectData: AssignProjectModel;
  holdData: HoldModel;
  exportData: ExportModel;
  followData: FollowModel;
  qcData: QCModel;
  commentsData: CommentsModel; 
  isSubmitting: boolean = false; 
  holdrecord: any;
  searchParams: any;
  gridParam: any;
  refData: any; 
  public initializeComponent(searchParams: any, gridParam: any, cols: any[], detailrecord: any, listrecords: any, datasource: any, holdrecord: any = undefined) {

    this.cols = cols;
    this.searchParams = searchParams;
    this.gridParam = gridParam;
    this.detailrecord = detailrecord;
    this.listrecords = listrecords;
    this.datasource = datasource;
    this.holdrecord = holdrecord;

    //Check Permission 
    let prefix = datasource.toUpperCase();
    let len = prefix.length + 1;

    for (let [key, value] of Object.entries(this.user.Permissions)) {
      if (key.startsWith(prefix) && value) {
        let pKey = key.substr(len);
        this.toolPermission[pKey] = true;
      }


    }

    console.log('toolPermission', this.toolPermission);

    this.activateDetailTool();

    this.initCheckState();
    this.workOrderService.initializeService(datasource);
  }



  public getDefaultColumns(datasource: string, getState: boolean): any[] {

    var defaultcols: any[] = [
      { field: 'ORDERNUMBER', header: 'Order Number', width: '250px', filterType: 'text', aggregate: true, aggregateValue: 1000 },
      { field: 'WORKORDERSTATE', header: 'Work Order State', width: '250px', filterType: 'text' },
      { field: 'ORDERTYPE', header: 'Order Type', width: '250px', filterType: 'text' },
      { field: 'STATUSDESCRIPTION', header: 'Status', width: '250px', filterType: 'text', aggregate: true, aggregateValue: 2342 },
      { field: 'SERVICEAREA', header: 'Service Area', width: '250px', filterType: 'text' },
      { field: 'DESIGNAREA', hidden: true, header: 'Design Area', width: '250px', filterType: 'text' },
      { field: 'FNDOCID', header: 'FNDOCID', width: '250px', filterType: 'text' },
      { field: 'OFFICE', header: 'Office', width: '250px', filterType: 'text' },
      { field: 'PROJECT', header: 'Project', width: '250px', filterType: 'text' },
      { field: 'ASSIGNEDTO', header: 'Assigned To', width: '250px', filterType: 'text' },
      { field: 'VERIFY', hidden: true, header: 'Verify', width: '200px', filterType: 'text' },
      { field: 'SHORTTEXT', hidden: true, header: 'Low Confidence Desc.', width: '250px', filterType: 'text' },
      { field: 'PACKET', header: 'Packet', width: '250px', filterType: 'text' },
      { field: 'VENDOR', header: 'Vendor', width: '250px', filterType: 'text' },
      { field: 'BATCH', header: 'Batch', width: '250px', filterType: 'text' },
      { field: 'ADDRESS', header: 'Address', width: '250px', filterType: 'text' },
      { field: 'CITY', hidden: true, header: 'City', width: '200px', filterType: 'text' },
      { field: 'TOWNSHIP', hidden: true, header: 'Township', width: '200px', filterType: 'text' },
      { field: 'SECTION', hidden: true, header: 'Section', width: '200px', filterType: 'text' },
      { field: 'QUARTER_SECTION', hidden: true, header: 'Qtr. Section', width: '200px', filterType: 'text' },
      { field: 'RANGE', hidden: true, header: 'Range', width: '200px', filterType: 'text' },
      { field: 'MAPNUM', hidden: true, header: 'Map Num', width: '150px', filterType: 'text' },
      { field: 'REF_ORDER_NOS', header: 'Reference Order', width: '250px', filterType: 'text' },
      { field: 'XYCORD', hidden: true, header: 'XY Coord', width: '250px', filterType: 'text', aggregate: true, aggregateValue: 1000 },
      { field: 'PLATNAME', header: 'Name', width: '250px', filterType: 'text' },
      { field: 'PROBLEM_REMARKS', hidden: true, header: 'Problem Remarks', width: '250px', filterType: 'text' },
      { field: 'COMMENTS', header: 'Comments', width: '250px', filterType: 'text' },
      { field: 'VENDOR_COMMENTS', hidden: true, header: 'Vendor Comments', width: '250px', filterType: 'text' },
      { field: 'NEED_DATE', header: 'Need Date', width: '250px', filterType: 'date' },
      { field: 'REQUESTBY', header: 'Requested By', width: '250px', filterType: 'text' },
      { field: 'REQUESTOR_PHONE', hidden: true, header: 'Requested Phone', width: '250px', filterType: 'text' },
      { field: 'EMAIL',  hidden: true, header: 'Email', width: '250px', filterType: 'text' },
      { field: 'DESCRIPTION', header: 'Description', width: '250px', filterType: 'text' },
      { field: 'ACTTOTCOST', hidden: true, header: 'Actual Total Cost', width: '250px', filterType: 'text' },
      { field: 'BUILDINGTYPE', hidden: true, header: 'Building Type', width: '250px', filterType: 'text' },
      { field: 'CP_STATUS', hidden: true, header: 'CP Status', width: '250px', filterType: 'text' },
      { field: 'CP_MATERIAL', hidden: true, header: 'CP Material', width: '250px', filterType: 'text' },
      { field: 'DESIGN_STATUS', hidden: true, header: 'Design Status', width: '250px', filterType: 'text' },
      { field: 'EQUIP_INSTALLYEAR', hidden: true, header: 'Equip. Install Year', width: '250px', filterType: 'text' },
      { field: 'ESTTIME', hidden: true, header: 'Est. Time', width: '250px', filterType: 'text' },
      { field: 'HPT_STATUS', hidden: true, header: 'HPT Status', width: '250px', filterType: 'text' },
      { field: 'INSTALLATION_TYPE', hidden: true, header: 'Installation Type', width: '250px', filterType: 'text' },
      { field: 'JT_PROJECT_ID', hidden: true, header: 'JT Project ID', width: '250px', filterType: 'text' },
      { field: 'NAVIGATION', hidden: true, header: 'Navigation', width: '250px', filterType: 'text' },
      { field: 'NUMCOMP', hidden: true, header: 'Num Comp.', width: '250px', filterType: 'text' },
      { field: 'NUMNOTCOMP', hidden: true, header: 'Num Not Comp.', width: '250px', filterType: 'text' },
      { field: 'PERUNIT', hidden: true, header: 'Per Unit', width: '250px', filterType: 'text' },
      { field: 'PINT', hidden: true, header: 'Pint', width: '250px', filterType: 'text' },
      { field: 'PLANT', hidden: true, header: 'Plant', width: '250px', filterType: 'text' },
      { field: 'POSTTIME', hidden: true, header: 'Post Time', width: '250px', filterType: 'text' },
      { field: 'QAQC', hidden: true, header: 'QAQC', width: '200px', filterType: 'text' },
      { field: 'QC_ASSIGNEDTO', hidden: true, header: 'QC Assigned To', width: '250px', filterType: 'text' },
      { field: 'QC_DESCRIPTION', hidden: true, header: 'QC Description', width: '250px', filterType: 'text' },
      { field: 'QC_REMARKS', hidden: true, header: 'QC Remarks', width: '250px', filterType: 'text' },
      { field: 'QC_CHECKER_FIXED', hidden: true, header: 'QC Checker Fixed', width: '250px', filterType: 'text' },
      { field: 'RELATED_REASON', hidden: true, header: 'Related Reason', width: '250px', filterType: 'text' },
      { field: 'ROOM', hidden: true, header: 'Room', width: '250px', filterType: 'text' },
      { field: 'SAP_COMMENTS', hidden: true, header: 'SAP Comments', width: '250px', filterType: 'text' },
      { field: 'SAP_EQUIP_NUMBER', hidden: true, header: 'SAP Equipment No.', width: '250px', filterType: 'text' },
      { field: 'STARTDATE', hidden: true, header: 'Start Date', width: '250px', filterType: 'date' },
      { field: 'TOTALITEMS', hidden: true, header: 'Total Items', width: '250px', filterType: 'text' },
      { field: 'TYPE', hidden: true, header: 'Type', width: '250px', filterType: 'text' },
      { field: 'WO_LAST_USER', hidden: true, header: 'Modifiedy By', width: '250px', filterType: 'text' }
    ];

    //Add the state information for visibility 
    var stateColsString = localStorage.getItem(datasource + "-displayColumns");
    console.log('stateColString', datasource, stateColsString);

    if (getState && stateColsString) {
      var stateCols = JSON.parse(stateColsString);
      console.log('stateCols', stateCols);
      for (let i = 0; i < defaultcols.length; i++) {
        var match = stateCols.filter(f => f.field == defaultcols[i].field)[0];
        if (match) {
          console.log('match columns', match);
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

  public searchStaging(searchParam: any) {
    this.searchParams.push(
      {
        Name: 'WORKTYPE',
        SelectedValue: this.appDataService.currentModule
      }
    )
    localStorage.setItem('Staging-Data', JSON.stringify(searchParam));
    //Open up window 
    window.open("STAGING/Search", "_blank");
  }

  public showColumnsInit() {
    console.log('show columns', this.cols);

    this.colData = this.getDefaultColumns(this.datasource, false); 
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
    localStorage.setItem(this.datasource + "-displayColumns", JSON.stringify(this.cols));
    //console.log('showColumnData', localStorage.getItem(this.datasource + '-displayColumns'));
    return;

    //modify state stored 
    var stateDataString = localStorage.getItem(this.datasource + '-state');
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

      localStorage.setItem(this.datasource + '-state', JSON.stringify(stateData));

    }






  }

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


  initCheckState() {
    this.checkedState = [];
    this.checkedCount = 0;

  }

  SelectAll(isChecked: boolean) {
    const data = this.listrecords || [];
    this.checkedState = data.reduce((checkedState, e) => {
      checkedState[e['UI_ID']] = isChecked;
      return checkedState;
    }, {});
    this.checkedCount = this.getCheckedItems()?.length;
  }
  toggleCheckState(item: any) {
    console.log('toggleCheckState', item);
    if (!item || !item['UI_ID']) {
      return;
    }
    const currentCheckState = this.checkedState[item['UI_ID']];
    this.checkedState[item['UI_ID']] = !currentCheckState;
    this.checkedCount = this.getCheckedItems()?.length;
  }
  getCheckedItems() {
    if (this.appDataService.currentSearchView == 'Detail') {
      var data = []
      data.push(this.detailrecord);
      this.checkedItems = data;
    }
    else {
      this.checkedItems = this.listrecords.filter(e => !!this.checkedState[e['UI_ID']]);
    }
    console.log('get checked items', this.checkedItems);
    return this.checkedItems;
  }
  getCheckedItemsList() {
    //return this.checkedItems?.map(e => e.UI_ID).join(', ');
    return this.checkedItems?.map(e => e.UI_ID.split('|')[0]).join(', ');

  }



  public activateDetailTool() {

    this.enableTool = {};

    //Tools without validations
    this.enableTool["RELATED"] = true;



    //If this is the List View, enable all 
    console.log('this.appDataService.currentSearchView', this.appDataService.currentSearchView);

    if (this.appDataService.currentSearchView == 'Multiple') {
      this.enableTool["ASSIGN"] = true;
      this.enableTool["COMPLETE"] = true;
      this.enableTool["PROBLEM"] = true;
      this.enableTool["CLOSEDPROBLEM"] = true;
      this.enableTool["CNFA"] = true;
      this.enableTool["RECEIVED"] = true;
      this.enableTool["SENT"] = true;
      this.enableTool["POSTABLE"] = true;
      this.enableTool["REOPEN"] = true;
      this.enableTool["PACKET"] = true;
      this.enableTool["EDIT"] = true;
      this.enableTool["DELETE"] = true;
      this.enableTool["PROJECT"] = true;
      this.enableTool["HOLD"] = true;

      this.enableTool["QC"] = true;

      console.log('???', this.enableTool);
      return;
    }


    if (this.toolPermission.EDIT_VENDOR_ONLY && this.detailrecord.VENDOR && this.user.Vendor != this.detailrecord.VENDOR) {
      //Can't edit anything
      return;
    }

    
    if (!this.toolPermission.EDIT_FN_STATUS && this.detailrecord.CURRENTSTATUS == 'FN') {
      //Can't edit anything
      return;
    }

    //Received or Fixed, not Assigned
    if ((!this.detailrecord.ASSIGNEDTO || this.detailrecord.ASSIGNEDTO == 'NONE') &&
      ["A", "C"].indexOf(this.detailrecord.CURRENTSTATUS) > -1) {
      this.enableTool['ASSIGN'] = true;
    }

    //Received or Fixed and Assigned
    if (["A", "C"].indexOf(this.detailrecord.CURRENTSTATUS) > -1 && (this.detailrecord.ASSIGNEDTO && this.detailrecord.ASSIGNEDTO != 'NONE')) {
      this.enableTool['SENT'] = true;
      this.enableTool['CLOSEDPROBLEM'] = true;
      this.enableTool['COMPLETE'] = true;
      this.enableTool['PROBLEM'] = true;
      this.enableTool['CNFA'] = true;

    }


    //Problem
    if (["B", "B1", "B2", "B3", "BP"].indexOf(this.detailrecord.CURRENTSTATUS) > -1) {
      this.enableTool['CLOSEDPROBLEM'] = true;
      this.enableTool['POSTABLE'] = true;
      this.enableTool['CNFA'] = true;

    }
    //Closed Problem
    if (["R"].indexOf(this.detailrecord.CURRENTSTATUS) > -1) {
      this.enableTool['CNFA'] = true;
      this.enableTool['POSTABLE'] = true;
      this.enableTool['PROBLEM'] = true;

    }

    //FIELDCHECK SENT
    if (["F", "Fa", "Fb"].indexOf(this.detailrecord.CURRENTSTATUS) > -1) {
      this.enableTool['POSTABLE'] = true;
    }


    //Completed, CNFA, Archived, FileNetOnly
    if (["Y", "Z", "X", "FN"].indexOf(this.detailrecord.CURRENTSTATUS) > -1) {
      console.log('enable reopen', this.detailrecord.CURRENTSTATUS)
      this.enableTool['REOPEN'] = true;
    }
    else {
      this.enableTool['DELETE'] = true;
      console.log('enable reopen NOT ', this.detailrecord.CURRENTSTATUS)
    }

    //NOT Completed, CNFA, Archived, FileNetOnly
    if (["Y", "Z", "X", "FN"].indexOf(this.detailrecord.CURRENTSTATUS) < 0) {
      this.enableTool['PACKET'] = true;
      this.enableTool["EDIT"] = true;
    }

    //Complete
    if (["Z"].indexOf(this.detailrecord.CURRENTSTATUS) > -1 && this.detailrecord.QAQC != 'QCZ') {
      this.enableTool["QC"] = true;
    }

    if (this.holdrecord?.Total > 0) {
      this.enableTool["HOLD"] = true;

    }
  }



  public ValidateTool(toolName: string): boolean {

    this.getCheckedItems();

    console.log('validateTool', this.user);
    let invalidItems = [];
    let u = this.user;
    if (this.toolPermission.EDIT_VENDOR_ONLY) {
      //Can't edit anything
      this.checkedItems.forEach(function (item) {

        if (item.VENDOR && item.VENDOR != u.Vendor) {
          //Can't assign this issue
          invalidItems.push(item.ORDERNUMBER);
        }
      });

    }

    //FILETNET ONLY 
    if (!this.toolPermission.EDIT_FN_STATUS) {
      //Can't edit anything
      this.checkedItems.forEach(function (item) {

        if (item.CURRENTSTATUS == 'FN') {
          //Can't assign this issue
          invalidItems.push(item.ORDERNUMBER);
        }
      });

    }

    switch (toolName) {
      case "ASSIGN":
        var validStatus = ["A", "C"];
        this.checkedItems.forEach(function (item) {
          if (validStatus.indexOf(item.CURRENTSTATUS) > 0
            || !item.ASSIGNEDTO || item.ASSIGNEDTO == 'NONE') {
            //OK
          }
          else {
            //Can't assign this issue
            if (invalidItems.indexOf(item.ORDERNUMBER) < 0)
              invalidItems.push(item.ORDERNUMBER);
          }
        });
        break;
      case "PROBLEMTOOL":
        var validStatus = ["R", "A", "C"];
        this.checkedItems.forEach(function (item) {
          if (validStatus.indexOf(item.CURRENTSTATUS) < 0
            && (item.ASSIGNEDTO && item.ASSIGNEDTO != 'NONE')) {
            //Can't assign this issue
            if (invalidItems.indexOf(item.ORDERNUMBER) < 0)
              invalidItems.push(item.ORDERNUMBER);
          }
        });
        break;
      case "COMPLETETOOL":
        var validStatus = ["Z", "Y", "X", "FN", "B", "R"]
        this.checkedItems.forEach(function (item) {
          if (validStatus.indexOf(item.CURRENTSTATUS) > -1 || !item.ASSIGNEDTO || item.ASSIGNEDTO == 'NONE') {
            //Can't assign this issue
            if (invalidItems.indexOf(item.ORDERNUMBER) < 0)
              invalidItems.push(item.ORDERNUMBER);
          }
        });
        break;
      case "CLOSEDPROBLEM":
        var validStatus = ["A", "C", "B", "B1", "B2", "B3", "BP"];
        this.checkedItems.forEach(function (item) {
          if (validStatus.indexOf(item.CURRENTSTATUS) < 0 &&
            (item.ASSIGNEDTO && item.ASSIGNEDTO != 'NONE')
          ) {
            //Can't assign this issue
            if (invalidItems.indexOf(item.ORDERNUMBER) < 0)
              invalidItems.push(item.ORDERNUMBER);
          }
        });
        break;
      case "CNFA":
        var validStatus = ["Y", "Z", "X", "FN"];
        this.checkedItems.forEach(function (item) {
          if (validStatus.indexOf(item.CURRENTSTATUS) > -1
          ) {
            //Can't assign this issue
            if (invalidItems.indexOf(item.ORDERNUMBER) < 0)
              invalidItems.push(item.ORDERNUMBER);
          }
        });
        break;
      case "POSTABLE":

        var validStatus = ["C", "B", "R", "F", "Fa", "Fb"];
        this.checkedItems.forEach(function (item) {
          if (validStatus.indexOf(item.CURRENTSTATUS) < 0
          ) {
            //Can't assign this issue
            if (invalidItems.indexOf(item.ORDERNUMBER) < 0)
              invalidItems.push(item.ORDERNUMBER);
          }
        });

        break;

      case "SENT":
        var validStatus = ["B", "C"];
        this.checkedItems.forEach(function (item) {
          if (validStatus.indexOf(item.CURRENTSTATUS) < 0
          ) {
            //Can't assign this issue
            if (invalidItems.indexOf(item.ORDERNUMBER) < 0)
              invalidItems.push(item.ORDERNUMBER);
          }
        });

        toolName = "SENTRECEIVED";
        break;

      case "REOPEN":
        var validStatus = ["Z", "Y", "X", "FN"];
        this.checkedItems.forEach(function (item) {
          if (validStatus.indexOf(item.CURRENTSTATUS) < 0
          ) {
            //Can't assign this issue
            if (invalidItems.indexOf(item.ORDERNUMBER) < 0)
              invalidItems.push(item.ORDERNUMBER);
          }
        });

        break;


      case "QCASSIGN":
      case "QCCOMPLETE":
      case "QCPROBLEMFIXED":
      case "QCPROBLEM":
        var validStatus = ["Z"];
        this.checkedItems.forEach(function (item) {
          console.log('validating QC', item.CURRENTSTATUS);
          if (validStatus.indexOf(item.CURRENTSTATUS) < 0 || item.QAQC == 'QCZ'
          ) {
            //Can't assign this issue
            if (invalidItems.indexOf(item.ORDERNUMBER) < 0)
              invalidItems.push(item.ORDERNUMBER);
          }
        });

        break;

      default:
        break;
    }

    this.validationErrors = {};
    if (this.checkedItems?.length == 0) {
      this.validationErrors.Selected = "No Order Number(s) were selected";
    }
    else {
      if (invalidItems.length > 0) {
        this.validationErrors.InitError = invalidItems.join(', ');
      }
    }


    console.log('this.validationErrors', this.validationErrors);
    if (Object.keys(this.validationErrors).length) {
      this.activateWindow(toolName);
      console.log('has error');
      return false;
    }

    return true;

    /* 
    this.enableTool = {}; 
    if (!this.detailrecord.ASSIGNEDTO && 
      ["A", "C"].indexOf(this.detailrecord.CURRENTSTATUS) > -1)    
    {
      this.enableTool['ASSIGN'] = true; 
    }

    if (this.detailrecord.CURRENTSTATUS != 'Z' && this.detailrecord.ASSIGNEDTO)    
    {
      this.enableTool['COMPLETE'] = true; 
      this.enableTool['PROBLEM'] = true; 
    }

    if (["B","B1","B2","B3","BP"].indexOf(this.detailrecord.CURRENTSTATUS) > -1)
    {
      this.enableTool['CLOSEDPROBLEM'] = true; 
    }

    if (["B","R"].indexOf(this.detailrecord.CURRENTSTATUS) > -1)
    {
      this.enableTool['CNFA'] = true; 
    }

    if (["B"].indexOf(this.detailrecord.CURRENTSTATUS) > -1)
    {
      this.enableTool['RECEIVED'] = true; 
    }

    if (["B", "C"].indexOf(this.detailrecord.CURRENTSTATUS) > -1)
    {
      this.enableTool['SENT'] = true; 
    }
 */
  }

  public holdToolInit() {
    this.holdData = new HoldModel();

    this.isSubmitting = false; 

    if (!this.ValidateTool("HOLD")) {
      return;
    }

    this.holdData.checkedItems = this.checkedItems;
    this.holdData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
    this.holdData.UserVendor = this.user.Vendor;

    this.holdData.OrderNumbers = this.checkedItems?.map(e => {
      let rObj = {}
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;
      rObj['OrderType'] = e.ORDERTYPE;
      rObj['Packet'] = e.PACKET;
      rObj['AssignedTo'] = e.ASSIGNEDTO;
      rObj['CurrentStatus'] = e.CURRENTSTATUS;
      return rObj
    });


    this.activateWindow('HOLD');

    console.log('this.holdData', this.holdData);

  }

  public holdToolSubmit() {

    if (this.validationErrors?.Selected) {
      return;
    }
    this.validationErrors = {};


    if (Object.keys(this.validationErrors).length) {
      return;
    }

    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog(this.datasource, 'Hold', this.holdData);
    this.workOrderService.onHoldWorkOrder(this.holdData).pipe(
      tap(result => {
        console.log('onHoldWorkOrder result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Update Failed", result.errormessage);
        }
        else {
          this.notificationService.notifySuccess("Update Successfully Completed", "");
          this.updateGrid();
          this.showWindow = {};
        }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
  }

  public editPacketToolInit() {

    this.isSubmitting = false; 

    this.packetData = new PacketModel();
    this.packetData.Submitted = false; 

    if (!this.ValidateTool("PACKET")) {
      return;
    }

    this.packetData.checkedItems = this.checkedItems;
    this.packetData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
    this.packetData.UserVendor = this.user.Vendor;

    this.packetData.OrderNumbers = this.checkedItems?.map(e => {
      let rObj = {}
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;
      rObj['OrderType'] = e.ORDERTYPE;
      rObj['Packet'] = e.PACKET;
      rObj['AssignedTo'] = e.ASSIGNEDTO;
      rObj['CurrentStatus'] = e.CURRENTSTATUS;
      return rObj
    });


    this.activateWindow('PACKET');


    console.log('this.packetData', this.packetData);

  }

  public editPacketToolSubmit() {

    if (this.validationErrors?.Selected) {
      return;
    }
    this.validationErrors = {};


    if (Object.keys(this.validationErrors).length) {
      return;
    }
    if (this.packetData.Action == 'MOVE') {
      if (this.packetData.SelectedPacket?.PACKET) {


        this.packetData.AssignedTo = this.packetData.SelectedPacket.ASSIGNEDTO;
        this.packetData.Packet = this.packetData.SelectedPacket.PACKET;
      }
      else {
        //Error 
      }
    }

    this.packetData.UserVendor = this.user.Vendor;

    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog(this.datasource, 'Edit Packet Tool', this.packetData);

    this.workOrderService.editPacket(this.packetData).pipe(
      tap(result => {
        console.log('Packet result', result);

        this.isSubmitting = false ; 
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Packet Failed", result.errormessage);
        }
        else {
          this.packetData.Packet = result.Data['Packet']; 
          this.packetData.Submitted = true; 
          if (this.packetData.Action == 'REMOVE')
          {
            this.showWindow = {};
          }
          this.notificationService.notifySuccess("Packet Update Successfully Completed", "");
          this.updateGrid();
        }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

  }

  public defaultPacketInput() {
    console.log('Default Packet List', this.packetData.Action);
    if (this.packetData.Action == 'MOVE') {
      //Poulate Packet List 

      this.workOrderService.getPacketList().pipe(
        tap(result => {
          console.log('getPacketList result', result);
          this.packetData.LK_Packet = result.Data || [];
          //Add Empty item 
          this.packetData.LK_Packet.splice(0, 0, { PACKET: '...' });
        }),
        catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      ).subscribe();

    }
  }

  public reOpenToolInit() {
    this.reOpenData = new ReOpenModel();

    this.isSubmitting = false; 

    if (!this.ValidateTool("REOPEN")) {
      return;
    }

    this.reOpenData.checkedItems = this.checkedItems;
    this.reOpenData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
    this.reOpenData.UserVendor = this.user.Vendor;

    this.reOpenData.OrderNumbers = this.checkedItems?.map(e => {
      let rObj = {}
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;
      rObj['OrderType'] = e.ORDERTYPE;
      rObj['CurrentStatus'] = e.CURRENTSTATUS;
      return rObj
    });


    this.activateWindow('REOPEN');

    console.log('this.reOpenToolInit', this.reOpenData);

  }

  public reOpenToolSubmit() {

    if (this.validationErrors?.Selected) {
      return;
    }
    this.validationErrors = {};


    if (Object.keys(this.validationErrors).length) {
      return;
    }
    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog(this.datasource, 'Reopen', this.reOpenData);
    this.workOrderService.reopenWorkOrder(this.reOpenData).pipe(
      tap(result => {
        console.log('reopenWorkOrder result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Reopen Failed", result.errormessage);
        }
        else {
          this.notificationService.notifySuccess("Reopen Successfully Completed", "");
          this.updateGrid();
          this.showWindow = {};
        }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

  }


  public relatedOrderToolInit() {
    this.relatedOrderData = new RelatedOrderModel();
    this.isSubmitting = false; 


    if (!this.ValidateTool("RELATED")) {
      return;
    }

    this.relatedOrderData.checkedItems = this.checkedItems;
    this.relatedOrderData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
    this.relatedOrderData.UserVendor = this.user.Vendor;

    this.relatedOrderData.OrderNumbers = this.checkedItems?.map(e => {
      let rObj = {}
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;
      rObj['OrderType'] = e.ORDERTYPE;

      return rObj
    });
    console.log('datasource', this.datasource);
    this.uiService.getLookups('RelatedReasons', this.datasource).pipe(
      tap(result => {
        this.relatedOrderData.LK_RelatedReason = result || [];
        console.log('LK_RelatedReason', this.relatedOrderData.LK_RelatedReason);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.activateWindow('RELATED');

    console.log('this.relatedOrderData', this.relatedOrderData);

  }

  public relatedOrderToolSubmit() {
    if (this.validationErrors?.Selected) {
      return;
    }
    this.validationErrors = {};

    if (!this.relatedOrderData.RelatedReason) {
      this.validationErrors.RelatedReason = "Related Reason is required";
    }

    if (Object.keys(this.validationErrors).length) {
      return;
    }
    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog(this.datasource, 'Receive', this.relatedOrderData);
    this.workOrderService.receiveRelatedWorkOrder(this.relatedOrderData).pipe(
      tap(result => {
        console.log('receiveRelatedWorkOrder result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Update Failed", result.errormessage);
        }
        else {
          this.notificationService.notifySuccess("Related Work Order Successfully Completed", "");
          if (this.appDataService.currentSearchView == 'Detail') {
            this.appDataService.currentSearchTransferToOrderNumber = result.Data['ChildWO'];
          }
          this.updateGrid();
          this.showWindow = {};
        }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

  }
  public assignWorkOrderToolInit() {

    this.isSubmitting = false; 
    this.assignWorkOrderData = new AssignWorkOrderModel();
    this.assignWorkOrderData.Submitted = false; 
    if (!this.ValidateTool("ASSIGN")) {
      return;
    }

    this.assignWorkOrderData.checkedItems = this.checkedItems;
    this.assignWorkOrderData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
    this.assignWorkOrderData.UserVendor = this.user.Vendor;

    this.assignWorkOrderData.OrderNumbers = this.checkedItems?.map(e => {
      let rObj = {}
      rObj['PlatID'] = e.PLATID;
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;
      rObj['OrderType'] = e.ORDERTYPE;
      rObj['Packet'] = e.PACKET;

      return rObj
    });

    this.uiService.getLookups('Employer', this.datasource).pipe(
      tap(result => {
        this.assignWorkOrderData.LK_Employer = result || [];
        console.log('LK_Employer', this.assignWorkOrderData.LK_Employer);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.activateWindow('ASSIGN');

    console.log('this.assignWorkOrderInit', this.assignWorkOrderData);

  }

  public assignWorkOrderToolSubmit() {


    if (this.validationErrors?.Selected) {
      return;
    }
    this.validationErrors = {};

    if (!this.assignWorkOrderData.SelectedEmployer) {
      this.validationErrors.AssignedTo = "Assigned To is required";
    }
    else {
      this.assignWorkOrderData.AssignedTo = this.assignWorkOrderData.SelectedEmployer.Value;
      this.assignWorkOrderData.AssignedVendor = this.assignWorkOrderData.SelectedEmployer.Value2;

    }


    if (Object.keys(this.validationErrors).length) {
      return;
    }

    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog(this.datasource, 'Assign', this.assignWorkOrderData);

    this.workOrderService.assignWorkOrder(this.assignWorkOrderData).pipe(
      tap(result => {
        console.log('assignWorkOrderData result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Assign Failed", result.errormessage);
        }
        else {
          this.assignWorkOrderData.Submitted = true; 
          this.isSubmitting = false; 

          this.assignWorkOrderData.Packet = result.Data['Packet']; 

          this.notificationService.notifySuccess("Assign Successfully Completed", "");
          this.updateGrid();          
//          this.showWindow = {};
        }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


  }

  public deleteInit() {

    this.isSubmitting = false; 

    this.deleteData = new DeleteModel();

    if (!this.ValidateTool("DELETE")) {
      return;
    }

    this.deleteData.checkedItems = this.checkedItems;
    this.deleteData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');


    this.deleteData.OrderNumbers = this.checkedItems?.map(e => {
      let rObj = {}
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;
      return rObj
    });


    this.activateWindow('DELETE');

    console.log('this.deleteData', this.deleteData);

  }

  public deleteSubmit() {


    if (this.validationErrors?.Selected) {
      return;
    }

    this.isSubmitting = true; 
    this.uiService.addSiteVisitLog(this.datasource, 'Delete', this.deleteData);

    this.workOrderService.deleteData(this.deleteData).pipe(
      tap(result => {
        console.log('delete result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Delete Failed", result.errormessage);
        }
        else {
          this.updateGrid();
          this.notificationService.notifySuccess("Delete Successfully Completed", "");
          this.showWindow = {};
        }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


  }

  public assignProject_JurisdictionChange() {

    this.uiService.getLookups('Project' + this.datasource, this.assignProjectData.Jurisdiction).pipe(
      tap(result => {
        this.assignProjectData.LK_Project = result || [];
        console.log('LK_Project', this.assignProjectData.LK_Project);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.uiService.getLookups('City', this.assignProjectData.Jurisdiction).pipe(
      tap(result => {
        this.assignProjectData.LK_City = result || [];
        console.log('LK_City', this.assignProjectData.LK_City);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


  }

  public assignProjectToolInit() {

    this.isSubmitting = false; 

    this.assignProjectData = new AssignProjectModel();

    if (!this.ValidateTool("PROJECT")) {
      return;
    }


    this.assignProjectData.checkedItems = this.checkedItems;
    this.assignProjectData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
    this.assignProjectData.UserVendor = this.user.Vendor;

    this.assignProjectData.OrderNumbers = this.checkedItems?.map(e => {
      let rObj = {}
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;
      rObj['OrderType'] = e.ORDERTYPE;
      rObj['City'] = e.CITY;

      if (this.assignProjectData.Batches.indexOf(e.BATCH) < 0) {
        this.assignProjectData.Batches.push(e.BATCH);
      }
      return rObj
    });

    //Get batch list 
    this.assignProjectData.BatchList = this.assignProjectData.Batches.join(', ');

    this.uiService.getLookups('ServiceArea', this.datasource).pipe(
      tap(result => {
        this.assignProjectData.LK_Jurisdiction = result || [];
        console.log('LK_Jurisdiction', this.assignProjectData.LK_Jurisdiction);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


    this.activateWindow('PROJECT');

    console.log('this.assignProjectData', this.assignProjectData);

  }

  public assignProjectToolSubmit() {
    if (this.validationErrors?.Selected) {
      return;
    }
    this.validationErrors = {};

    if (this.assignProjectData.Assign == 'Batch' && !this.assignProjectData.BatchList) {
      this.validationErrors.Assign = 'No Batch was found in selected workorder(s)';
    }

    //Check date 
    if (!this.assignProjectData.ProjectCompletionDate) {
      this.validationErrors.ProjectCompletionDate = 'Project Completion Date is required';
    }
    else {
      let projDate = new Date(this.assignProjectData.SelectedProject.Value2);
      let inputDate = new Date(this.assignProjectData.ProjectCompletionDate);

      if (inputDate > projDate) {
        this.validationErrors.ProjectCompletionDate = 'Project Completion Date must not be greater than Actual Project Completion Date (' + this.assignProjectData.SelectedProject.Value2 + ')';
      }
    }

    if (Object.keys(this.validationErrors).length) {
      return;
    }

    this.assignProjectData.Project = this.assignProjectData.SelectedProject.Value;

    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog(this.datasource, 'Assign Project', this.assignProjectData);

    this.workOrderService.assignProject(this.assignProjectData).pipe(
      tap(result => {
        console.log('sentReceivedData result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Submit Failed", result.errormessage);
        }
        else {
          this.notificationService.notifySuccess("Update Successfully Completed", "");
          this.updateGrid();
          this.showWindow = {};
        }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


  }

  public postableToolInit() {
    this.isSubmitting = false; 

    this.postableData = new PostableModel();

    if (!this.ValidateTool("POSTABLE")) {
      return;
    }

    this.postableData.checkedItems = this.checkedItems;
    this.postableData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
    this.postableData.UserVendor = this.user.Vendor;

    this.postableData.OrderNumbers = this.checkedItems?.map(e => {
      let rObj = {}
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;
      rObj['OrderType'] = e.ORDERTYPE;

      return rObj
    });

    this.activateWindow('POSTABLE');

    console.log('this.sentReceivedData', this.postableData);

  }

  public postableToolSubmit() {
    if (this.validationErrors?.Selected) {
      return;
    }
    this.validationErrors = {};

    if (Object.keys(this.validationErrors).length) {
      return;
    }

    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog(this.datasource, 'Postable', this.postableData);

    this.workOrderService.postableWorkOrder(this.postableData).pipe(
      tap(result => {
        console.log('postableWorkOrder result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Submit Failed", result.errormessage);
        }
        else {
          this.notificationService.notifySuccess("Update Successfully Completed", "");
          this.updateGrid();
          this.showWindow = {};
        }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

  }

  public sentReceivedToolInit() {

    this.isSubmitting = false; 

    this.sentReceivedData = new SentReceivedModel();

    if (!this.ValidateTool("SENT")) {
      return;
    }

    this.sentReceivedData.checkedItems = this.checkedItems;
    this.sentReceivedData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
    this.sentReceivedData.UserVendor = this.user.Vendor;

    this.sentReceivedData.OrderNumbers = this.checkedItems?.map(e => {
      let rObj = {}
      rObj['PlatID'] = e.PLATID;
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;
      rObj['OrderType'] = e.ORDERTYPE;

      return rObj
    });
    this.sentReceivedData.DialogTitle = "Sent Plats Back For More Information";

    this.activateWindow('SENTRECEIVED');

    console.log('this.sentReceivedData', this.sentReceivedData);

  }

  public sentReceivedToolSubmit() {


    if (this.validationErrors?.Selected) {
      return;
    }
    this.validationErrors = {};

    if (Object.keys(this.validationErrors).length) {
      return;
    }

    this.isSubmitting = true; 

    this.workOrderService.sentReceivedBackWorkOrder(this.sentReceivedData).pipe(
      tap(result => {
        console.log('sentReceivedData result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Submit Failed", result.errormessage);
        }
        else {
          this.notificationService.notifySuccess("Update Successfully Completed", "");
          this.updateGrid();
          this.showWindow = {};
        }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

  }

  public closedProblemToolInit() {

    this.isSubmitting = false; 

    this.closedProblemData = new ClosedProblemModel();


    if (!this.ValidateTool("CLOSEDPROBLEM")) {
      return;
    }

    this.closedProblemData.checkedItems = this.checkedItems;
    this.closedProblemData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
    this.closedProblemData.UserVendor = this.user.Vendor;

    
    this.closedProblemData.OrderNumbers = this.checkedItems?.map(e => {
      let rObj = {}
      rObj['PlatID'] = e.PLATID;
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;
      rObj['OrderType'] = e.ORDERTYPE;
      rObj['ProblemDescription'] = e.DESCRIPTION; 
      return rObj
    });

    this.uiService.getLookups('ProblemDescription', this.datasource).pipe(
      tap(result => {
        this.closedProblemData.LK_ProblemDescription = result || [];
        console.log('LK_ProblemDescription', this.closedProblemData.LK_ProblemDescription);

        var descriptions = Array.from(new Set(this.closedProblemData.OrderNumbers.map(e=>e['ProblemDescription'])));
        console.log('problem descriptions', descriptions); 
        if (descriptions.length < 2)
        {
            this.closedProblemData.ProblemDescription = descriptions[0]; 
        }
    
        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


    this.activateWindow('CLOSEDPROBLEM');

    console.log('this.closedProblemData', this.closedProblemData);

  }

  public closedProblemToolSubmit() {


    if (this.validationErrors?.Selected) {
      return;
    }
    this.validationErrors = {};

    if (Object.keys(this.validationErrors).length) {
      return;
    }

    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog(this.datasource, 'Closed Problem', this.closedProblemData);
    this.workOrderService.closedProblemWorkOrder(this.closedProblemData).pipe(
      tap(result => {
        console.log('problemData result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Closed Problem Failed", result.errormessage);
        }
        else {
          this.notificationService.notifySuccess("Closed Problem Successfully Submitted", "");
          this.updateGrid();
          this.showWindow = {};
        }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
  }


  public CNFAToolInit() {

    this.isSubmitting = false; 

    this.CNFAData = new CFNAModel();


    if (!this.ValidateTool("CNFA")) {
      return;
    }

    this.CNFAData.checkedItems = this.checkedItems;
    this.CNFAData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
    this.CNFAData.UserVendor = this.user.Vendor;

    this.CNFAData.OrderNumbers = this.checkedItems?.map(e => {
      let rObj = {}
      rObj['PlatID'] = e.PLATID;
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;
      rObj['OrderType'] = e.ORDERTYPE;

      return rObj
    });

    this.activateWindow('CNFA');

    console.log('this.CNFAData', this.CNFAData);
  }


  public CNFAToolSubmit() {


    if (this.validationErrors?.Selected) {
      return;
    }
    this.validationErrors = {};

    if (Object.keys(this.validationErrors).length) {
      return;
    }

    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog(this.datasource, 'CNFA', this.CNFAData);
    this.workOrderService.CNFAWorkOrder(this.CNFAData).pipe(
      tap(result => {
        console.log('CNFAData result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Update Failed", result.errormessage);
        }
        else {
          this.updateGrid();
          this.notificationService.notifySuccess("Update Successfully Completed", "");
          this.showWindow = {};
        }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
  }

  public problemToolInit() {

    this.isSubmitting = false; 

    this.problemData = new ProblemModel();

    if (!this.ValidateTool("PROBLEMTOOL")) {
      return;
    }

    this.problemData.checkedItems = this.checkedItems;
    this.problemData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
    this.problemData.UserVendor = this.user.Vendor;
    this.problemData.NewAttachments = [];

    this.problemData.OrderNumbers = this.checkedItems?.map(e => {
      let rObj = {}
      rObj['PlatID'] = e.PLATID;
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;
      rObj['OrderType'] = e.ORDERTYPE;

      return rObj
    });

    this.uiService.getLookups('ProblemDescription', this.datasource).pipe(
      tap(result => {
        this.problemData.LK_ProblemDescription = result || [];
        console.log('LK_ProblemDescription', this.problemData.LK_ProblemDescription);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

    this.activateWindow('PROBLEMTOOL');

  }


  public problemToolSubmit() {


    if (this.validationErrors?.Selected) {
      return;
    }
    this.validationErrors = {};
    if (!this.problemData.ProblemDescription) {
      this.validationErrors.ProblemDescription = "Problem Description is required";
    }

    if (Object.keys(this.validationErrors).length) {
      return;
    }

    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog(this.datasource, 'Problem', this.problemData);
    this.workOrderService.problemWorkOrder(this.problemData).pipe(
      tap(result => {
        console.log('problemData result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Set Problem Failed", result.errormessage);
        }
        else {
          this.notificationService.notifySuccess("Set Problem Successfully Submitted", "");
          this.updateGrid();
          this.showWindow = {};
        }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
  }

  public completeToolInit() {

    this.isSubmitting = false; 

    this.completeData = new CompleteModel();

    if (!this.ValidateTool("COMPLETETOOL")) {
      return;
    }

    this.completeData.checkedItems = this.checkedItems;
    this.completeData.PerUnit = "1";
    this.completeData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
    this.completeData.UserVendor = this.user.Vendor;
    if (this.datasource == 'GAS' || this.datasource == 'LANDBASE') {
      this.completeData.EnableNumberOfLots = true;
    }

    this.completeData.OrderNumbers = this.checkedItems?.map(e => {
      let rObj = {}
      rObj['PlatID'] = e.PLATID;
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;
      rObj['OrderType'] = e.ORDERTYPE;
      rObj['JTProjectID'] = e.JT_PROJECT_ID;
      rObj['Remarks'] = e.REMARKS;
      rObj['ShortText'] = e.SHORTTEXT;
      rObj['Verify'] = e.VERIFY;
      rObj['QAQC'] = e.QAQC;

      // var GasLowConfidenceType = [
      //   "MAIN",
      //   "SERVICE",
      //   "LEAK REPAIR-MAIN",
      //   "LEAK REPAIR-SERVICE",
      //   "CP",
      //   "ODORIZER",
      //   "REG"
      // ];
      if (this.datasource == 'GAS') {
        this.completeData.EnableLowConfidence = true;
      }
      else if (e.ORDERTYPE == 'CATEGORY 6') {
        this.completeData.EnableNumberOfLots = true;
      }


      return rObj
    });

    //Query Low Confidence Work Orders 
    if (this.datasource == 'GAS')
    {

    
    this.workOrderService.fetchLowConfidenceOrder(this.completeData).pipe(
      tap(result => {
        this.completeData.LK_LowConfidenceOrder = result.Data || [];
        console.log('LK_LowConfidenceOrder', this.completeData.LK_LowConfidenceOrder);

          //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
          if (this.completeData.LK_LowConfidenceOrder.length > 0)
          {
            this.completeData.EnableLowConfidenceFix = true; 
          }
        
        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
    }
    
    if (this.completeData.EnableLowConfidence) {
      this.uiService.getLookups('LowConfidenceReasons', this.datasource).pipe(
        tap(result => {
          this.completeData.LK_ConfidenceReason = result || [];
          console.log('LK_ConfidenceReason', this.completeData.LK_ConfidenceReason);

        }),
        catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      ).subscribe();
    }
    this.activateWindow('COMPLETETOOL');

  }

  public completeToolSubmit() {

    console.log('this.completeData', this.completeData); 
    if (this.validationErrors?.Selected) {
      return;
    }

    this.validationErrors = {};

    if (this.completeData.EnableLowConfidence && this.completeData.LowConfidence) {
      //check description and remarks  
      if (!this.completeData.LowConfidenceDescription) {
        this.validationErrors.LowConfidenceDescription = "Description is Required";
      }

      if (!this.completeData.LowConfidenceRemark) {
        this.validationErrors.LowConfidenceRemark = "Remark is Required";
      }

    }

    if (Object.keys(this.validationErrors).length) {
      return;
    }

    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog(this.datasource, 'Complete', this.completeData);
    this.workOrderService.completeWorkOrder(this.completeData).pipe(
      tap(result => {
        console.log('completeWorkOrder result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Set Complete Failed", result.errormessage);
        }
        else {
          this.notificationService.notifySuccess("Set Complete Successfully Completed", "");
          this.updateGrid();
          this.showWindow = {};
        }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
  }



  exportDataInit() {

    this.isSubmitting = false; 

    this.exportData = new ExportModel();
    var today = new Date();
    this.exportData.ExportName = "Export-" + this.datasource + " Results-" + today.toLocaleDateString("en-US");

    this.showWindow['EXPORT'] = true;
  }
  exportDataSubmit() {

    console.log('exportData', this.exportData);

    if (this.exportData.ExportOption == 'Selection') {
      //Get Checked Items
      this.exportData.SelectedIDs = this.getCheckedItems().map(e => e.UI_ID);
    }
    else {
      this.exportData.SelectedIDs = [];
    }

    //get column order 
    var stateDataString = localStorage.getItem(this.datasource + "-state");
    var gridCols = [];

    if (stateDataString) {
      var stateData = JSON.parse(stateDataString);
      console.log('stateData', stateDataString);

      for (let i = 0; i < stateData.columnOrder.length; i++) {
        //Look for config 
        var col = this.cols.filter(f => f.field == stateData.columnOrder[i])[0];
        if (col && !col.hidden) {
          gridCols.push(col);
        }
      }

    }
    else {
      for (let i = 0; i < this.cols.length; i++) {
        //Look for config            
        var col = this.cols[i];
        if (!col.hidden) {
          gridCols.push(col);
        }
      }
    }


    console.log('exportData', this.exportData);
    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog(this.datasource, 'Export', this.exportData);
    this.workOrderService.exportData(this.exportData, gridCols, this.searchParams, this.gridParam).pipe(
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


  public followSelected() {
    this.followData = new FollowModel();

    this.followData.checkedItems = this.checkedItems;
    this.followData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
    this.followData.User = this.user.Username;

    this.followData.OrderNumbers = this.followData.checkedItems?.map(e => {
      let rObj = {}
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;
      return rObj
    });

    this.followData.UI_ID = this.followData.checkedItems?.map(e => e.UI_ID);

    this.showWindow['FOLLOW'] = true;

  }

  public followQueryUser() {

    var followData = new FollowModel();
    followData.User = this.user.Username;
    if (this.detailrecord) {
      followData.UI_ID = [];
      followData.UI_ID.push(this.detailrecord.UI_ID);
    }
    else if (this.listrecords.length) {
      followData.UI_ID = this.listrecords.map(e => e.UI_ID);
    }

    if (followData.UI_ID.length) {


      this.workOrderService.fetchFollowByUserData(followData).pipe(
        tap(result => {


          if (result['Data'].length > 0) {
            var result = result['Data'] || [];
            console.log('followdata', result);
            result.forEach(e => {
              if (this.detailrecord) {
                this.detailrecord.Follow = true;
              }
              else {
                var match = this.listrecords.filter(f => f.UI_ID == e.UI_ID)[0];
                if (match) {
                  match.Follow = true;
                }
              }
            });

            console.log('listRecord', this.listrecords);
          }


        })).subscribe();
    }

  }
  public followEdit(data) {

    this.followData = new FollowModel();
    this.followData.User = this.user.Username;

    this.followData.checkedItems.push(data);
    this.followData.checkedItemsList = data.ORDERNUMBER;

    this.followData.OrderNumbers = this.followData.checkedItems?.map(e => {
      let rObj = {}
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;

      return rObj
    });

    this.followData.UI_ID = [];
    this.followData.UI_ID.push(data.UI_ID);
    console.log('followEdit', this.followData);
    this.workOrderService.fetchFollowByUserData(this.followData).pipe(
      tap(result => {


        if (result['Data'].length > 0) {
          var result = result['Data'] || [];
          this.followData.Status = result.map(m => m.STATUSCHANGE);

          console.log('follow Source', result)


          this.showWindow['FOLLOW'] = true;
        }


      })).subscribe();

  }

  public followToggle(state: boolean) {
    if (state) {
      this.followData.Status = ['A', 'B', 'C', 'R', 'Y', 'Z', 'QCA', 'QCP', 'QCPF', 'QCZ'];
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

    this.followData.UI_ID = [];
    this.followData.UI_ID.push(data.UI_ID);

    this.followData.OrderNumbers = this.followData.checkedItems?.map(e => {
      let rObj = {}
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;

      return rObj
    });
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


    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog(this.datasource, 'Follow', this.followData);
    this.workOrderService.followUpdate(this.followData).pipe(
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

          this.followData.UI_ID.forEach(e => {
            var match = this.listrecords.filter(f => f.UI_ID == e)[0];
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

  public qcAssignInit() {
    this.isSubmitting = false; 


    this.qcData = new QCModel();


    if (!this.ValidateTool("QCASSIGN")) {
      return;
    }


    this.qcData.checkedItems = this.checkedItems;
    this.qcData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
    this.qcData.UserVendor = this.user.Vendor;

    this.qcData.OrderNumbers = this.checkedItems?.map(e => {
      let rObj = {}
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;
      rObj['OrderType'] = e.ORDERTYPE;

      return rObj
    });

    this.uiService.getLookups('Employer', this.datasource).pipe(
      tap(result => {
        this.qcData.LK_Employer = result || [];
        console.log('LK_Employer', this.qcData.LK_Employer);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


    this.activateWindow('QCASSIGN');

    console.log('this.qcData', this.qcData);
  }


  public qcCompleteInit() {
    this.isSubmitting = false; 

    this.qcData = new QCModel();


    if (!this.ValidateTool("QCCOMPLETE")) {
      return;
    }


    this.qcData.checkedItems = this.checkedItems;
    this.qcData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
    this.qcData.UserVendor = this.user.Vendor;

    this.qcData.OrderNumbers = this.checkedItems?.map(e => {
      let rObj = {}
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;
      rObj['OrderType'] = e.ORDERTYPE;

      return rObj
    });


    this.activateWindow('QCCOMPLETE');

    console.log('this.qcData', this.qcData);
  }


  public qcProblemInit() {

    this.isSubmitting = false; 

    this.qcData = new QCModel();


    if (!this.ValidateTool("QCPROBLEM")) {
      return;
    }


    this.qcData.checkedItems = this.checkedItems;
    this.qcData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
    this.qcData.UserVendor = this.user.Vendor;

    this.qcData.OrderNumbers = this.checkedItems?.map(e => {
      let rObj = {}
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;
      rObj['OrderType'] = e.ORDERTYPE;

      return rObj
    });

    this.uiService.getLookups('QCList', this.datasource).pipe(
      tap(result => {
        this.qcData.LK_Description = result || [];
        console.log('LK_Employer', this.qcData.LK_Description);

        //this.dataCorrectionData.Submitter = this.dataCorrectionData.LK_Submitter[0]; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();


    this.activateWindow('QCPROBLEM');

    console.log('this.qcData', this.qcData);
  }


  public qcProblemFixedInit() {
    this.qcData = new QCModel();

    this.isSubmitting = false; 


    if (!this.ValidateTool("QCPROBLEMFIXED")) {
      return;
    }


    this.qcData.checkedItems = this.checkedItems;
    this.qcData.checkedItemsList = this.checkedItems?.map(e => e.ORDERNUMBER).join(', ');
    this.qcData.UserVendor = this.user.Vendor;

    this.qcData.OrderNumbers = this.checkedItems?.map(e => {
      let rObj = {}
      rObj['OrderNumber'] = e.ORDERNUMBER;
      rObj['WorkOrderState'] = e.WORKORDERSTATE;
      rObj['OrderType'] = e.ORDERTYPE;

      return rObj
    });


    this.activateWindow('QCPROBLEMFIXED');

    console.log('this.qcData', this.qcData);
  }


  public qcAssignSubmit() {

    if (this.validationErrors?.Selected) {
      return;
    }
    this.validationErrors = {};

    if (!this.qcData.Employer) {
      this.validationErrors.Employer = "Employer is required";
    }

    if (Object.keys(this.validationErrors).length) {
      return;
    }
    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog(this.datasource, 'QC Assign', this.qcData);
    this.workOrderService.qcAssign(this.qcData).pipe(
      tap(result => {
        console.log('qcData result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("QC Update Failed", result.errormessage);
        }
        else {
          this.notificationService.notifySuccess("QC Update Successfully Completed", "");
          this.updateGrid();
          this.showWindow = {};
        }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

  }

  public qcCompleteSubmit() {

    if (this.validationErrors?.Selected) {
      return;
    }
    this.validationErrors = {};



    if (Object.keys(this.validationErrors).length) {
      return;
    }

    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog(this.datasource, 'QC Complete', this.qcData);
    this.workOrderService.qcComplete(this.qcData).pipe(
      tap(result => {
        console.log('qcData result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("QC Update Failed", result.errormessage);
        }
        else {
          this.notificationService.notifySuccess("QC Update Successfully Completed", "");
          this.updateGrid();
          this.showWindow = {};
        }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

  }

  public qcProblemSubmit() {

    if (this.validationErrors?.Selected) {
      return;
    }
    this.validationErrors = {};

    if (Object.keys(this.validationErrors).length) {
      return;
    }

    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog(this.datasource, 'QC Problem', this.qcData);
    this.workOrderService.qcProblem(this.qcData).pipe(
      tap(result => {
        console.log('qcData result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("QC Update Failed", result.errormessage);
        }
        else {
          this.notificationService.notifySuccess("QC Update Successfully Completed", "");
          this.updateGrid();
          this.showWindow = {};
        }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

  }

  public qcProblemFixedSubmit() {

    if (this.validationErrors?.Selected) {
      return;
    }
    this.validationErrors = {};

    if (Object.keys(this.validationErrors).length) {
      return;
    }

    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog(this.datasource, 'QC Problem Fixed', this.qcData);
    this.workOrderService.qcProblemFixed(this.qcData).pipe(
      tap(result => {
        console.log('qcData result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("QC Update Failed", result.errormessage);
        }
        else {
          this.notificationService.notifySuccess("QC Update Successfully Completed", "");
          this.updateGrid();
          this.showWindow = {};
        }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

  }


  tempAttachmentDownload(data: any) {
    console.log('attachmentDownload', data);
    this.workOrderService.getTempAttachmentData(data).pipe(
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

  addNewRemoveAttachment(fileID: string, sourceData: any) {
    for (let i = 0; i < sourceData.NewAttachments.length; i++)
      if (sourceData.NewAttachments[i].FileID === fileID) {
        sourceData.NewAttachments.splice(i, 1);
        break;
      }
  }


  onFileUploadError(event: any, fileUpload: FileUpload) {
    fileUpload.clear();
    this.notificationService.notifyErrorInPipe(event.error).subscribe();
  }

  addNewFileUploadSuccess(event: any, fileUpload: FileUpload, sourceData: any) {
    console.log('onFileUploadSuccess', event);
    console.log('onFileUploadSuccess', event.originalEvent.body);
    console.log('fileUpload', fileUpload);

    //Add to file 
    var result = event.originalEvent.body;
    for (let i = 0; i < result.length; i++) {
      sourceData.NewAttachments.push(result[i]);
    }

    console.log('this.sourceData', sourceData);
  }

  commentsInit(data: any)
  {
    this.refData = data; 

    this.commentsData = new CommentsModel(); 
    this.commentsData.OrderNumber = data.ORDERNUMBER; 
    this.commentsData.WorkOrderState = data.WORKORDERSTATE; 
    this.commentsData.Vendor = this.user.Vendor; 
    this.commentsData.OrderStatus = data.CURRENTSTATUS; 
    this.commentsData.WorkType = this.datasource; 
    this.commentsData.CanEdit = true; 

    if (this.toolPermission.EDIT_VENDOR_ONLY && data.VENDOR && this.user.Vendor != data.VENDOR) {
      //Can't edit anything
      this.commentsData.CanEdit = false; 
    }

    if (!this.toolPermission.EDIT_BASIC && !this.toolPermission.EDIT_ALL) {
      //Can't edit anything
      this.commentsData.CanEdit = false; 
    }
    
    if (!this.toolPermission.EDIT_FN_STATUS && data.CURRENTSTATUS == 'FN') {
      //Can't edit anything
      this.commentsData.CanEdit = false; 
    }

    if (["Z", "Y", "X", "FN"].indexOf(data.CURRENTSTATUS) > -1)
    {
      this.commentsData.CanEdit = false; 
    }



    this.uiService.addSiteVisitLog(this.datasource, 'Get Comments', this.commentsData);
  
    this.workOrderService.getComments(this.commentsData).pipe(
      tap(result => {
        this.commentsData.CommentsList = result.Data || [];
        console.log('CommentsList', this.commentsData.CommentsList);
        this.showWindow['COMMENTS'] = true; 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
  }

  commentsSubmit()
  {
    this.validationErrors = {};
    if (!this.commentsData.Comments)
    {
        this.validationErrors.Comments = "A comment is required";
    }
    if (Object.keys(this.validationErrors).length) {
      return;
    }

    this.isSubmitting = true; 

    this.uiService.addSiteVisitLog(this.datasource, 'Add Comment', this.commentsData);
    console.log('commentData', this.commentsData); 

    this.workOrderService.addComments(this.commentsData).pipe(
      tap(result => {
        console.log('commentsData result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Comment Update Failed", result.errormessage);
        }
        else {
          this.notificationService.notifySuccess("Comment Added Successfully Completed", "");

                
          this.workOrderService.getComments(this.commentsData).pipe(
            tap(result => {
              this.commentsData.CommentsList = result.Data || [];
              console.log('CommentsList', this.commentsData.CommentsList);
              this.refData.HASCOMMENTS = 'Y'; 
             
              if (this.appDataService.currentSearchView == 'Detail') {
                this.updateGrid(); 
              }
            }),
            catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
          ).subscribe();

          //this.updateGrid();
       }
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

  }
}


class ToolPermissionModel {
  EDIT: boolean = true;
  DELETE: boolean = false;
  ASSIGN_ANY: boolean = false;
  ASSIGN_VENDOR_ONLY: boolean = false;
  ASSIGN_SELF: boolean = false;
  COMPLETE: boolean = false;
  PROBLEM: boolean = false;
  CLOSED_PROBLEM: boolean = false;
  CNFA: boolean = false;
  SENTBACK: boolean = false;
  FIXED: boolean = false;
  REOPEN: boolean = false;
  EDIT_PACKET: boolean = false;
  ASSIGN_PROJECT: boolean = false;
  POSTABLE: boolean = false;
  RECEIVE_RELATED: boolean = false;
  RELEASE_HOLD: boolean = false;
  EDIT_VENDOR_ONLY: boolean = false;
  QC_ASSIGN: boolean = false;
  QC_COMPLETE: boolean = false;
  QC_PROBLEM: boolean = false;
  QC_PROBLEM_FIXED: boolean = false;
  EDIT_FN_STATUS: boolean  = false; 
  EDIT_BASIC: boolean = false; 
  EDIT_ALL: boolean = false; 
}


class AssignWorkOrderModel {
  LK_Employer: any[];
  SelectedEmployer: any;
  Submitted: boolean = false;
  Packet: string; 
  AssignedTo: string;
  AssignedVendor: string;
  checkedItems: any[];
  checkedItemsList: string = "";
  MakePacket: string;
  UserVendor: string;
  OrderNumbers: any[];
}

class DeleteModel {
  checkedItems: any[];
  checkedItemsList: string = "";
  OrderNumbers: any[];
}

class ClosedProblemModel {
  LK_ProblemDescription: any[];

  checkedItems: any[];
  checkedItemsList: string = "";
  Remarks: string;
  UserVendor: string;
  OrderNumbers: any[];
  ProblemDescription: string;

}

class CompleteModel {
  LK_ConfidenceReason: any[];
  LK_LowConfidenceOrder: any[]; 

  checkedItems: any[];
  checkedItemsList: string = "";
  PerUnit: string;
  PostTime: string = "0";
  NumberOfLots: string;
  UserVendor: string;
  LowConfidence: boolean;
  LowConfidenceDescription: string;
  LowConfidenceRemark: string;
 
  LowConfidenceFix: boolean = false; 
  LowConfidenceRelate: any[]; 


  EnableLowConfidence: boolean;
  EnableNumberOfLots: boolean = false;
  EnableLowConfidenceFix: boolean = false; 

  OrderNumbers: any[];

  NewAttachments: any[] = [];

}
class ProblemModel {
  LK_ProblemDescription: any[];

  checkedItems: any[];
  checkedItemsList: string = "";
  ProblemDescription: string;
  Remarks: string;
  UserVendor: string;
  OrderNumbers: any[];
  XCoord: string;
  YCoord: string;
  NewAttachments: any[] = [];

}


class ReOpenModel {


  checkedItems: any[];
  checkedItemsList: string = "";
  VendorComment: string;

  UserVendor: string;
  OrderNumbers: any[];

}

class PacketModel {

  LK_Packet: any[];
  SelectedPacket: any;
  Submitted: boolean = false; 
  checkedItems: any[];
  checkedItemsList: string = "";

  Packet: string;
  AssignedTo: string;
  Action: string;

  UserVendor: string;
  OrderNumbers: any[];
}

class CFNAModel {
  checkedItems: any[];
  checkedItemsList: string = "";
  Remarks: string;
  UserVendor: string;
  OrderNumbers: any[];
}

class SentReceivedModel {
  Mode: string;
  DialogTitle: string;
  checkedItems: any[];
  checkedItemsList: string = "";
  UserVendor: string;
  OrderNumbers: any[];

}

class HoldModel {
  checkedItems: any[];
  checkedItemsList: string = "";
  UserVendor: string;
  OrderNumbers: any[];

  Action: string;

}
class PostableModel {

  checkedItems: any[];
  checkedItemsList: string = "";
  UserVendor: string;
  OrderNumbers: any[];
  VendorComment: string;
}

class RelatedOrderModel {

  LK_RelatedReason: any[];

  checkedItems: any[];
  checkedItemsList: string = "";
  UserVendor: string;
  OrderNumbers: any[];
  RelatedReason: string;
}

class AssignProjectModel {
  LK_City: any[];
  LK_Jurisdiction: any[];
  LK_Project: any[];

  SelectedProject: any;
  Batches: string[] = [];
  BatchList: string;

  checkedItems: any[];
  checkedItemsList: string = "";
  UserVendor: string;
  OrderNumbers: any[];

  Jurisdiction: string;
  City: string;
  ProjectCompletionDate: string;
  Project: string;
  BatchNumber: string;
  Assign: string;
}

class FollowModel {

  UI_ID: any[] = [];
  checkedItems: any[] = [];
  checkedItemsList: string = "";
  Status: string[] = [];
  User: string;
  OrderNumbers: any[];
}

class ExportModel {
  ExportOption: string = "All";
  ExportName: string;
  Key: string;
  SelectedIDs: any[];
}


class QCModel {
  LK_Employer: any[];
  LK_Description: any[];

  checkedItems: any[];
  checkedItemsList: string = "";
  UserVendor: string;
  OrderNumbers: any[];
  Employer: string;
  Description: string;
  Remarks: string;
  Fixed: string;

}

class CommentsModel
{
  CommentsList: any[]; 
  Comments: string; 
  OrderNumber: string; 
  WorkOrderState: string; 
  Vendor: string; 
  OrderStatus: string; 
  WorkType: string; 
  CanEdit: boolean = false; 
}

