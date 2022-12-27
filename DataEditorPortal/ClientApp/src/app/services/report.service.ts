import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from './user.service';
import { AppUser } from '../models/app-user';

@Injectable()

export class ReportService {

  public _apiUrl: string;
  user: AppUser; 
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string, userService: UserService) {
    this._apiUrl = apiUrl;
    this.user = userService.USER; 
  }


  fetchGridConfig(key: string, type: string)
  {
    return this.http.get(`${this._apiUrl}Report/FetchGridConfig?key=` + key + '&type=' + type).pipe(
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
      SelectedIDs : exportData.SelectedIDs,
      WorkType: ""
    };


    if (searchParam != undefined) {
      fetchParam.Searches = searchParam;

      searchParam.forEach(element => {
        if (element.Name == 'WORKTYPE') 
        {
           fetchParam.WorkType = element.SelectedValue; 
           return;          
        }
      });
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
    return this.http.post(`${this._apiUrl}Report/ExportData`, fetchParam, { responseType: 'blob'}).pipe(
      map(e => e as any)
    );
  }  
  fetchData(key: string, searchParam?: any, gridParam?: any): any {

    console.log('fetchdata', searchParam, gridParam);
    var fetchParam = {
      Name: key,
      Description: "",
      Filters: [],
      Sorts: [],
      Searches: [],
      StartIndex: 0,
      IndexCount: 100,
      AppendFilter: "",
      WorkType: ""
    };


    if (searchParam != undefined) {
      fetchParam.Searches = searchParam;

      
      searchParam.forEach(element => {
      if (element.Name == 'WORKTYPE') 
      {
         fetchParam.WorkType = element.SelectedValue; 
         return;          
      }
    });

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
    return this.http.post<any>(`${this._apiUrl}Report/FetchData`, fetchParam).pipe(
      map(e => e as any)
    );
  }

  
  
  getAttachmentData(data: any)
  {
    return this.http.post(`${this._apiUrl}Report/GetAttachmentFile`, data, { responseType: 'blob'}).pipe(
      map(e => e as any)
    );

  }

}
