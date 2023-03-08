import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse, NotifyService } from 'src/app/shared';
import { GridColumn } from '../../portal-management/models/portal-item';
import { EditFormData, EditFormField } from '../models/edit';
import { ExportParam } from '../models/export';

@Injectable({
  providedIn: 'root'
})
export class UniversalGridService {
  public currentPortalItem = 'usermanagement';

  public _apiUrl: string;
  constructor(
    private http: HttpClient,
    private notifyService: NotifyService,
    @Inject('API_URL') apiUrl: string
  ) {
    this._apiUrl = apiUrl;
  }

  getDetailConfig(type: 'ADD' | 'UPDATE'): Observable<EditFormField[]> {
    return this.http
      .get<ApiResponse<EditFormField[]>>(
        `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/config/detail`,
        { params: { type } }
      )
      .pipe(map(res => res.result || []));
  }

  getDetailData(id: string): Observable<EditFormData> {
    return this.http
      .get<ApiResponse<EditFormData>>(
        `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/data/${id}`
      )
      .pipe(map(res => res.result || {}));
  }

  addGridData(data: EditFormData): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/data/create`,
      data
    );
  }

  updateGridData(
    id: string,
    data: EditFormData
  ): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/data/${id}/update`,
      data
    );
  }

  deleteGridData(ids: string[]): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/data/batch-delete`,
      { ids }
    );
  }

  exportGridData(param: ExportParam): Observable<Blob> {
    return this.http.post(
      `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/data/export`,
      param,
      { responseType: 'blob' }
    );
  }

  getTableColumns(): Observable<GridColumn[]> {
    return this.http
      .get<ApiResponse<GridColumn[]>>(
        `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/config/columns`
      )
      .pipe(map(res => res.result || []));
  }
}
