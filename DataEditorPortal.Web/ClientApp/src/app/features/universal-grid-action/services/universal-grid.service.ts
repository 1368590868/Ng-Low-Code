import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, NotifyService } from 'src/app/shared';
import { GridColumn } from '../../portal-management/models/portal-item';
import { GridSearchConfig } from '../../universal-grid/models/grid-types';
import { EditFormData, EditFormField, FormEventConfig } from '../models/edit';
import { ExportParam } from '../models/export';

@Injectable({
  providedIn: 'root'
})
export class UniversalGridService {
  public _apiUrl: string;
  constructor(
    private http: HttpClient,
    private notifyService: NotifyService,
    @Inject('API_URL') apiUrl: string
  ) {
    this._apiUrl = apiUrl;
  }

  getFormConfig(
    name: string,
    type: 'ADD' | 'UPDATE'
  ): Observable<EditFormField[]> {
    return this.http
      .get<ApiResponse<EditFormField[]>>(
        `${this._apiUrl}universal-grid/${name}/config/form`,
        { params: { type } }
      )
      .pipe(map(res => res.data || []));
  }

  getEventConfig(
    name: string,
    type: 'ADD' | 'UPDATE' | 'DELETE'
  ): Observable<FormEventConfig> {
    return this.http
      .get<ApiResponse<FormEventConfig>>(
        `${this._apiUrl}universal-grid/${name}/config/event`,
        { params: { type } }
      )
      .pipe(map(res => res.data || {}));
  }

  getDetailData(name: string, id: string): Observable<EditFormData> {
    return this.http
      .get<ApiResponse<EditFormData>>(
        `${this._apiUrl}universal-grid/${name}/data/${id}`
      )
      .pipe(map(res => res.data || {}));
  }

  batchGet(name: string, ids: string[]): Observable<EditFormData> {
    return this.http
      .post<ApiResponse<EditFormData>>(
        `${this._apiUrl}universal-grid/${name}/data/batch-get`,
        { ids }
      )
      .pipe(map(res => res.data || {}));
  }

  addGridData(
    name: string,
    data: EditFormData
  ): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this._apiUrl}universal-grid/${name}/data/create`,
      data
    );
  }

  updateGridData(
    name: string,
    id: string,
    data: EditFormData
  ): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${this._apiUrl}universal-grid/${name}/data/${id}/update`,
      data
    );
  }

  batchUpdate(
    name: string,
    ids: string[],
    data: EditFormData
  ): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${this._apiUrl}universal-grid/${name}/data/batch-update`,
      { ids, data }
    );
  }

  deleteGridData(
    name: string,
    ids: string[]
  ): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${this._apiUrl}universal-grid/${name}/data/batch-delete`,
      { ids }
    );
  }

  exportGridData(name: string, param: ExportParam): Observable<Blob> {
    return this.http.post(
      `${this._apiUrl}universal-grid/${name}/data/export`,
      param,
      { responseType: 'blob' }
    );
  }

  getTableColumns(name: string): Observable<GridColumn[]> {
    return this.http
      .get<ApiResponse<GridColumn[]>>(
        `${this._apiUrl}universal-grid/${name}/config/columns`
      )
      .pipe(map(res => res.data || []));
  }

  getSearchConfig(name: string): Observable<GridSearchConfig[]> {
    return this.http
      .get<ApiResponse<GridSearchConfig[]>>(
        `${this._apiUrl}universal-grid/${name}/config/search`
      )
      .pipe(map(res => res.data || []));
  }
}
