import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { catchError, map, Observable, takeWhile, tap } from 'rxjs';
import { ApiResponse } from 'src/app/core/models/api-response';
import { NotifyService } from 'src/app/core/utils/notify.service';
import { EditFormData, EditFormField } from '../models/edit';

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

  getDetailConfig(): Observable<EditFormField[]> {
    return this.http
      .get<ApiResponse<EditFormField[]>>(
        `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/config/detail`
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
}
