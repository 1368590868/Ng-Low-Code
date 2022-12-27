import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from './user.service';
import { AppUser } from '../models/app-user';

@Injectable({
  providedIn: 'root'
})
export class GasService {
  public _apiUrl: string;
  user: AppUser; 
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string, userService: UserService) {
    this._apiUrl = apiUrl;
    this.user = userService.USER; 
  }

  fetchDetailData(id: string, state: string)
  {

    return this.http.get(`${this._apiUrl}Gas/FetchDetailData?id=` + id + '&state=' + state).pipe(
      map(e => e as any)
    );

  }

  
  fetchHoldData(id: string, state: string)
  {

    return this.http.get(`${this._apiUrl}Gas/FetchOnHoldData?id=` + id + '&state=' + state).pipe(
      map(e => e as any)
    );

  }

  
  fetchDataSingle(id: string, state: string)
  {
    var filter = ''; 
    if (state)
    {
        //filter =  "a.ORDERNUMBER || ' ' || a.WORKORDERSTATE = '" + id + " " + state + "'"
        filter =  "a.ORDERNUMBER = '" + id + "' and a.WORKORDERSTATE = '" + state + "'";

    }
    else 
    {
      //Quick Link method
        //split value 
        let orderNumber = id.substring(0, id.indexOf(' '));
        let orderState = id.substring(id.indexOf(' ') + 1);
        if (orderNumber)
        {          
          if (orderState)
          {
            filter =  "a.ORDERNUMBER = '" + orderNumber + "' and a.WORKORDERSTATE = '" + orderState + "'";
          }
          else 
          {
            filter =  "a.ORDERNUMBER = '" + orderNumber + "'";
          }
        }
        else 
        {
          //There was no space
          filter =  "a.ORDERNUMBER = '" + orderState + "'";
        }
        //          filter = "a.ORDERNUMBER || ' ' || a.WORKORDERSTATE = '" + id + "'";             

    }
    console.log('filter', filter); 
    var fetchParam = {
      //
      AppendFilter : filter
    }; 
    return this.http.post<any>(`${this._apiUrl}Gas/FetchDataSingle`, fetchParam).pipe(
      map(e => e as any)
    );
  }
  fetchData(searchParam?: any, gridParam?: any): any {

    console.log('fetchdataservice', searchParam, gridParam);
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

        //Add filter if only VENDOR ONLY view, otherwise ignore if DC_VIEW_ALL
      if (!this.user.Permissions.GAS_VIEW_ALL && this.user.Permissions.GAS_VIEW_VENDOR_ONLY)
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
    console.log('final fetchparam', fetchParam); 
    return this.http.post<any>(`${this._apiUrl}Gas/FetchData`, fetchParam).pipe(
      map(e => e as any)
    );
  }

  deleteAttachment(data: any)
  {
    return this.http.post<any>(`${this._apiUrl}Gas/DeleteAttachment`, data).pipe(
      map(e => e as any)
    );

  }

  getAttachmentData(data: any)
  {
    return this.http.post(`${this._apiUrl}Gas/GetAttachmentFile`, data, { responseType: 'blob'}).pipe(
      map(e => e as any)
    );

  }

  getTempAttachmentData(data: any)
  {
    return this.http.post(`${this._apiUrl}Gas/GetTempAttachmentFile`, data, { responseType: 'blob'}).pipe(
      map(e => e as any)
    );

  }

  restoreAttachment(data: any)
  {
    return this.http.post<any>(`${this._apiUrl}Gas/RestoreAttachment`, data).pipe(
      map(e => e as any)
    );

  }

  fetchAttachmentData(id: string, state: string)
  {

    return this.http.get(`${this._apiUrl}Gas/FetchAttachmentData?id=` + id + '&state=' + state).pipe(
      map(e => e as any)
    );

  }

  fetchTransactionData(id: string, state: string)
  {

    return this.http.get(`${this._apiUrl}Gas/FetchTransactionData?id=` + id + '&state=' + state).pipe(
      map(e => e as any)
    );

  }

  
  validateBatch(id: string)
  {

    return this.http.get(`${this._apiUrl}Gas/ValidateBatch?id=` + id).pipe(
      map(e => e as any)
    );

  }

  saveData (data: any)
  {
    console.log('saveData', data); 
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}Gas/SaveData`, param).pipe(
      map(e => e as any)
    );

  }

  deleteData(data: any)
  {
    console.log('saveData', data); 
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}Gas/DeleteData`, param).pipe(
      map(e => e as any)
    );
  }

  validateWorkOrder(id: string, state: string)
  {

    return this.http.get(`${this._apiUrl}Gas/ValidateWorkOrder?id=` + id + '&state=' + state).pipe(
      map(e => e as any)
    );

  }
  
  addNewData (data: any)
  {
    
    console.log('addNewData', data); 
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}Gas/AddNewData`, param).pipe(
      map(e => e as any)
    );

  }

  fetchComments(orderNumber: string, workOrderState: string)
  {
    var data = {
      OrderNumber: orderNumber, 
      WorkOrderState: workOrderState,
      WorkType: 'GAS'
    }; 
    console.log('addNewData', data); 
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}Gas/FetchComments`, param).pipe(
      map(e => e as any)
    );


  }

  fetchRelatedOrders(orderNumber: string, workOrderState: string)
  {
    var data = {
      OrderNumber: orderNumber, 
      WorkOrderState: workOrderState
      
    }; 
    console.log('addNewData', data); 
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}Gas/FetchRelatedOrder`, param).pipe(
      map(e => e as any)
    );


  }
}
