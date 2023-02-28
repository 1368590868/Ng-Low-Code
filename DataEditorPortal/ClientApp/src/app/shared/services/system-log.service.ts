import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import {
  GridParam,
  GridResult
} from 'src/app/features/universal-grid/models/grid-types';
import { ApiResponse } from '..';
import { GridProp } from '../models/system-log';

@Injectable({
  providedIn: 'root'
})
export class SystemLogService {
  public _apiUrl: string;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getTableData(tableParams: GridParam): Observable<GridResult> {
    return of({
      data: [
        {
          Category: 'Success',
          Id: 'd0689f13-ba93-4e9a-be15-e7557d2d597c',
          UserName: 'John',
          EventName: 'sam',
          EventTime: '2020-05-15T09:40:38.9541006Z',
          EventSection: 'test page delete'
        },
        {
          Category: 'error',
          Id: 'd0689f13-ba93-4e9a-be15-e7557d2d5972',
          UserName: 'John',
          EventName: 'tom',
          EventTime: '2020-05-15T09:40:38.9541006Z',
          EventSection: 'page edit'
        }
      ],
      total: 2
    });
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
