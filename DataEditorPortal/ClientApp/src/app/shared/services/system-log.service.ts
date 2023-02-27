import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import {
  GridParam,
  GridResult
} from 'src/app/features/universal-grid/models/grid-types';
import { ApiResponse } from '..';

@Injectable({
  providedIn: 'root'
})
export class SystemLogService {
  public _apiUrl: string;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getTableData(tableParams: GridParam): Observable<GridResult> {
    return this.http
      .post<ApiResponse<GridResult>>(
        `${this._apiUrl}UniversalGrid/demo-item/data`,
        tableParams
      )
      .pipe(map(res => res.result || { data: [], total: 0 }));
  }

  getRowData(id: string) {
    return of({
      EventTime: '2020-03-01',
      EventSection: 'test page delete',
      Category: 'Success',
      EventName: 'delte page',
      UserName: 'Admin',
      Details: 'more details',
      Params: '{str:test,str:test,str:test,str:test}',
      Result: 'null'
    });
  }
}
