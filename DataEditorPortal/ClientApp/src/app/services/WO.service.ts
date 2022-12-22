import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from './user.service';
import { AppUser } from '../models/app-user';

@Injectable({
  providedIn: 'root'
})
export class WOService {
  public _apiUrl: string;
  public _apiSourceUrl: string; 
  public dataSource: string; 

  user: AppUser; 
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string, userService: UserService) {
    this._apiUrl = apiUrl;
    this.user = userService.USER; 
  }

  public initializeService(datasource: string)
  {
    this.dataSource = datasource; 
    this._apiSourceUrl = this._apiUrl + this.dataSource; 
  }


  fetchDetailData(id: string)
  {

    return this.http.get(`${this._apiSourceUrl}/FetchDetailData?id=` + id).pipe(
      map(e => e as any)
    );

  }

  fetchDataSingle(id: string)
  {
    var fetchParam = {
      AppendFilter : "a.ORDERNUMBER = '" + id + "'"
    }; 
    return this.http.post<any>(`${this._apiSourceUrl}/FetchDataSingle`, fetchParam).pipe(
      map(e => e as any)
    );
  }

  
  exportData(exportData: any, cols: any[], searchParam?: any, gridParam?: any)
  {
    var fetchParam = {
      Name: exportData.Key,
      Description: "",
      Filters: [],
      Sorts: [],
      Searches: [],
      StartIndex: 0,
      IndexCount: -99,
      AppendFilter: "",
      GridColumns: cols,
      SelectedIDs : exportData.SelectedIDs
    };


    if (searchParam != undefined) {
      fetchParam.Searches = searchParam;
    }
    if (gridParam != undefined) {

      var obj = gridParam.filters;
      for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          // do stuff
          let fieldProp = obj[prop];
          for (let i = 0; i < fieldProp.length; i++) {
            if (fieldProp[i].value != null) {
              fieldProp[i].field = prop;
              //gridParam.filters.ISSUE_ID[0]
              fetchParam.Filters.push(fieldProp[i]);
            }
          }
        }
      }

      console.log('testParam', fetchParam);
      if (gridParam.multiSortMeta && gridParam.multiSortMeta.length > 0) {
        fetchParam.Sorts = gridParam.multiSortMeta;
        // for (let i = 0; i < gridParam.multiSortMeta.length; i++) {
        //   testParam.Sorts.push(gridParam.multiSortMeta[0]);
        // }
      }

      fetchParam.StartIndex = 0;
      fetchParam.IndexCount = -99;
    }
    return this.http.post(`${this._apiSourceUrl}/ExportData`, fetchParam, { responseType: 'blob'}).pipe(
      map(e => e as any)
    );
  }  
  fetchData(searchParam?: any, gridParam?: any): any {

    console.log('fetchdata', searchParam, gridParam);
    var fetchParam = {
      Name: "Test",
      Description: "Testing2",
      Filters: [],
      Sorts: [],
      Searches: [],
      StartIndex: 0,
      IndexCount: 100,
      AppendFilter: ""
    };

    // //Add filter if only VENDOR ONLY view, otherwise ignore if DC_VIEW_ALL
    // if (!this.user.Permissions.DC_VIEW_ALL && this.user.Permissions.DC_VIEW_VENDOR_ONLY)
    // {
    //   fetchParam.AppendFilter = "a.VENDOR = '" + this.user.Vendor + "' or a.VENDOR is null";
    // }

    if (searchParam != undefined) {
      fetchParam.Searches = searchParam;
    }
    if (gridParam != undefined) {

      var obj = gridParam.filters;
      for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          // do stuff
          let fieldProp = obj[prop];
          for (let i = 0; i < fieldProp.length; i++) {
            if (fieldProp[i].value != null) {
              fieldProp[i].field = prop;
              //gridParam.filters.ISSUE_ID[0]
              fetchParam.Filters.push(fieldProp[i]);
            }
          }
        }
      }

      console.log('testParam', fetchParam);
      if (gridParam.multiSortMeta && gridParam.multiSortMeta.length > 0) {
        fetchParam.Sorts = gridParam.multiSortMeta;
        // for (let i = 0; i < gridParam.multiSortMeta.length; i++) {
        //   testParam.Sorts.push(gridParam.multiSortMeta[0]);
        // }
      }

      fetchParam.StartIndex = gridParam.first;
      fetchParam.IndexCount = gridParam.rows;
    }
    return this.http.post<any>(`${this._apiSourceUrl}/FetchData`, fetchParam).pipe(
      map(e => e as any)
    );
  }

  
  getAttachmentData(data: any)
  {
    return this.http.post(`${this._apiSourceUrl}/GetAttachmentFile`, data, { responseType: 'blob'}).pipe(
      map(e => e as any)
    );

  }

  getTempAttachmentData(data: any)
  {
    return this.http.post(`${this._apiSourceUrl}/GetTempAttachmentFile`, data, { responseType: 'blob'}).pipe(
      map(e => e as any)
    );

  }
  fetchAttachmentData(id: string)
  {

    return this.http.get(`${this._apiSourceUrl}/FetchAttachmentData?id=` + id).pipe(
      map(e => e as any)
    );

  }

  fetchTransactionData(id: string)
  {

    return this.http.get(`${this._apiSourceUrl}/FetchTransactionData?id=` + id).pipe(
      map(e => e as any)
    );

  }

 
  followUpdate(data: any)
  {
    
    var param = {
      DataJSON: JSON.stringify(data)
    };


    return this.http.post<any>(`${this._apiSourceUrl}/FollowUpdate`, param).pipe(
      map(e => e as any)
    );

  }

  
  fetchFollowByUserData(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };


    return this.http.post<any>(`${this._apiSourceUrl}/FetchFollowByUserData`, param).pipe(
      map(e => e as any)
    );


  }

  
  validateBatch(id: string)
  {

    return this.http.get(`${this._apiSourceUrl}/ValidateBatch?id=` + id).pipe(
      map(e => e as any)
    );

  }


  
  assignWorkOrder(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/AssignWorkOrder`, param).pipe(
      map(e => e as any)
    );


  }

  
  
  assignProject(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/AssignProject`, param).pipe(
      map(e => e as any)
    );


  }


  getPacketList()
  {
    return this.http.get(`${this._apiSourceUrl}/GetPacketList`).pipe(
      map(e => e as any)
    );

  }
  
  
  editPacket(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/EditPacket`, param).pipe(
      map(e => e as any)
    );


  }

  reopenWorkOrder(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/ReopenWorkOrder`, param).pipe(
      map(e => e as any)
    );


  }
  
  completeWorkOrder(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/CompleteWorkOrder`, param).pipe(
      map(e => e as any)
    );


  }

  onHoldWorkOrder(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/OnHoldWorkOrder`, param).pipe(
      map(e => e as any)
    );


  }

  receiveRelatedWorkOrder(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/ReceiveRelatedWorkOrder`, param).pipe(
      map(e => e as any)
    );


  }


  postableWorkOrder(data: any)
  {
        
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/MakePostableWorkOrder`, param).pipe(
      map(e => e as any)
    );

 }
  
  problemWorkOrder(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/ProblemWorkOrder`, param).pipe(
      map(e => e as any)
    );


  }

  
  closedProblemWorkOrder(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/ClosedProblemWorkOrder`, param).pipe(
      map(e => e as any)
    );


  }

  CNFAWorkOrder(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/CNFAWorkOrder`, param).pipe(
      map(e => e as any)
    );


  }
  
  sentReceivedBackWorkOrder(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/SentReceivedBackWorkOrder`, param).pipe(
      map(e => e as any)
    );


  }

  saveData (data: any)
  {
    console.log('saveData', data); 
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/SaveData`, param).pipe(
      map(e => e as any)
    );

  }

  deleteData(data: any)
  {
    console.log('saveData', data); 
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/DeleteData`, param).pipe(
      map(e => e as any)
    );
  }

  addNewData (data: any)
  {
    
    console.log('addNewData', data); 
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/AddNewData`, param).pipe(
      map(e => e as any)
    );

  }

  
  
  qcAssign(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/QCAssign`, param).pipe(
      map(e => e as any)
    );


  }

  qcProblem(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/QCProblem`, param).pipe(
      map(e => e as any)
    );


  }

  qcComplete(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/QCComplete`, param).pipe(
      map(e => e as any)
    );


  }

  qcProblemFixed(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/QCProblemFixed`, param).pipe(
      map(e => e as any)
    );


  }


  getComments(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/FetchComments`, param).pipe(
      map(e => e as any)
    );


  }
  
  addComments(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/AddComments`, param).pipe(
      map(e => e as any)
    );


  }
  
  
  fetchLowConfidenceOrder(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/FetchLowConfidenceOrder`, param).pipe(
      map(e => e as any)
    );


  }

  
  getRelatedOrders(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiSourceUrl}/FetchRelatedOrder`, param).pipe(
      map(e => e as any)
    );


  }
  
}
