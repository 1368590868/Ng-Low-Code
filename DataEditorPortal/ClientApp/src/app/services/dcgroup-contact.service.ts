import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from './user.service';
import { AppUser } from '../models/app-user';

@Injectable({
  providedIn: 'root'
})
export class DCGroupContactService {

  public _apiUrl: string;
  user: AppUser; 
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string, userService: UserService) {
    this._apiUrl = apiUrl;
    this.user = userService.USER; 
  }

  
  saveData (data: any)
  {
    console.log('saveData', data); 
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}DCGroupContact/SaveData`, param).pipe(
      map(e => e as any)
    );

  }

  addNewData (data: any)
  {
    
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}DCGroupContact/AddNewData`, param).pipe(
      map(e => e as any)
    );

  }

  
  deleteData (data: any)
  {
    
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}DCGroupContact/DeleteData`, param).pipe(
      map(e => e as any)
    );

  }

  
  checkNameExists(data: any) {

    var param = {
      DataJSON: JSON.stringify(data)
    };
    return this.http.post<any>(`${this._apiUrl}DCGroupContact/CheckNameExists`, param).pipe(
      map(e => e as any)
    );

  }

  
  checkInUse(data: any) {

    var param = {
      DataJSON: JSON.stringify(data)
    };
    return this.http.post<any>(`${this._apiUrl}DCGroupContact/CheckInUse`, param).pipe(
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
    return this.http.post<any>(`${this._apiUrl}DCGroupContact/FetchData`, fetchParam).pipe(
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
    return this.http.post(`${this._apiUrl}DCGroupContact/ExportData`, fetchParam, { responseType: 'blob'}).pipe(
      map(e => e as any)
    );
  }  
}
