import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { GridResult } from 'src/app/features/universal-grid/models/grid-types';
import { ApiResponse, GridParam } from '..';
import { SystemLogViewInfo } from '../models/system-log';

@Injectable({
  providedIn: 'root'
})
export class SystemLogService {
  public _apiUrl: string;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getTableData(tableParams: GridParam) {
    return this.http.post<ApiResponse<GridResult>>(
      `${this._apiUrl}event-log/list`,
      tableParams
    );
  }

  getRowData(id: string) {
    return this.http.get<ApiResponse<SystemLogViewInfo>>(
      `${this._apiUrl}event-log/${id}`
    );
  }
}
