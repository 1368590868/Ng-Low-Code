import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from './user.service';
import { AppUser } from '../models/app-user';

@Injectable()
export class DataCorrectionService {
  public _apiUrl: string;
  user: AppUser; 
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string, userService: UserService) {
    this._apiUrl = apiUrl;
    this.user = userService.USER; 
  }

  getData(params?: object): Observable<any[]> {
    return this.http.get(`${this._apiUrl}DataCorrection`, params).pipe(
      map(e => e as any[])
    );
  }

  fetchResponseData(issue_id: string)
  {

    return this.http.get(`${this._apiUrl}DataCorrection/FetchResponseData?issue_id=` + issue_id).pipe(
      map(e => e as any)
    );

  }

  fetchDetailData(issue_id: string)
  {

    return this.http.get(`${this._apiUrl}DataCorrection/FetchDetailData?issue_id=` + issue_id).pipe(
      map(e => e as any)
    );

  }

  
  fetchTransactionData(issue_id: string)
  {

    return this.http.get(`${this._apiUrl}DataCorrection/FetchTransactionData?issue_id=` + issue_id).pipe(
      map(e => e as any)
    );

  }
  fetchAttachmentData(issue_id: string)
  {

    return this.http.get(`${this._apiUrl}DataCorrection/FetchAttachmentData?issue_id=` + issue_id).pipe(
      map(e => e as any)
    );

  }
  
  saveData (data: any)
  {
    console.log('saveData', data); 
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}DataCorrection/SaveData`, param).pipe(
      map(e => e as any)
    );

  }

  addNewData (data: any)
  {
    
    console.log('saveData', data); 
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}DataCorrection/AddNewData`, param).pipe(
      map(e => e as any)
    );

  }

  fetchWorkOrderStates (type: string, orderNumber: string)
  {
    return this.http.get(`${this._apiUrl}DataCorrection/FetchWorkOrderStateData?type=` + type + '&ordernumber=' + orderNumber).pipe(
      map(e => e as any)
    );

  }

  
  fetchSubmitterInfo (name: string )
  {
    return this.http.get(`${this._apiUrl}DataCorrection/FetchSubmitterInfo?name=` + name).pipe(
      map(e => e as any)
    );

  }
  assignIssue (data: any)
  {
    
    var param = {
      DataJSON: JSON.stringify(data)
    };

    console.log('assignIssue', data);     

    return this.http.post<any>(`${this._apiUrl}DataCorrection/AssignIssue`, param).pipe(
      map(e => e as any)
    );

  }

  updateStatus (data: any)
  {
    
    console.log('updateStatus', data);     

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}DataCorrection/UpdateStatus`, param).pipe(
      map(e => e as any)
    );

  }

  

  reOpen (data: any)
  {
    
    console.log('updateStatus', data);     

    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}DataCorrection/Reopen`, param).pipe(
      map(e => e as any)
    );

  }

  addResponseData(data: any)
  {
    console.log('addResponseData', data); 

    
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}DataCorrection/AddResponse`, param).pipe(
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

    //Add filter if only VENDOR ONLY view, otherwise ignore if DC_VIEW_ALL
    if (!this.user.Permissions.DC_VIEW_ALL && this.user.Permissions.DC_VIEW_VENDOR_ONLY)
    {
      fetchParam.AppendFilter = "a.VENDOR = '" + this.user.Vendor + "' or a.VENDOR is null";
    }

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
    return this.http.post<any>(`${this._apiUrl}DataCorrection/FetchData`, fetchParam).pipe(
      map(e => e as any)
    );
  }

  deleteAttachment(data: any)
  {
    return this.http.post<any>(`${this._apiUrl}DataCorrection/DeleteAttachment`, data).pipe(
      map(e => e as any)
    );

  }

  
  restoreAttachment(data: any)
  {
    return this.http.post<any>(`${this._apiUrl}DataCorrection/RestoreAttachment`, data).pipe(
      map(e => e as any)
    );

  }

  
  getAttachmentData(data: any)
  {
    return this.http.post(`${this._apiUrl}DataCorrection/GetAttachmentFile`, data, { responseType: 'blob'}).pipe(
      map(e => e as any)
    );

  }

  getTempAttachmentData(data: any)
  {
    return this.http.post(`${this._apiUrl}DataCorrection/GetTempAttachmentFile`, data, { responseType: 'blob'}).pipe(
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

      fetchParam.StartIndex = gridParam.first;
      fetchParam.IndexCount = -99;
    }
    return this.http.post(`${this._apiUrl}DataCorrection/ExportData`, fetchParam, { responseType: 'blob'}).pipe(
      map(e => e as any)
    );
  }  


  
  followUpdate(data: any)
  {
    
    var param = {
      DataJSON: JSON.stringify(data)
    };


    return this.http.post<any>(`${this._apiUrl}DataCorrection/FollowUpdate`, param).pipe(
      map(e => e as any)
    );

  }

  fetchFollowByUserData(data: any)
  {

    var param = {
      DataJSON: JSON.stringify(data)
    };


    return this.http.post<any>(`${this._apiUrl}DataCorrection/FetchFollowByUserData`, param).pipe(
      map(e => e as any)
    );


  }
  

}
