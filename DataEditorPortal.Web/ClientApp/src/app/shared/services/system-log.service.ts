import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ApiResponse, GridParam, GridResult } from '..';
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
    return this.http.post<ApiResponse<GridResult<SystemLogViewInfo>>>(`${this._apiUrl}event-log/list`, tableParams);
  }

  getRowData(id: string) {
    return this.http.get<ApiResponse<SystemLogViewInfo>>(`${this._apiUrl}event-log/${id}`);
  }

  addSiteVisitLog(data: { action: string; section: string; params: string }) {
    this.http.post(`${this._apiUrl}event-log/page-request`, data).subscribe();
  }
}
