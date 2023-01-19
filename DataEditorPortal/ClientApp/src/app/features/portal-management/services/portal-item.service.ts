import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable, Subject } from 'rxjs';
import { NotifyService } from 'src/app/app.module';
import { ApiResponse } from 'src/app/core/models/api-response';
import { PortalItem, PortalItemData } from '../models/portal-item';

@Injectable({
  providedIn: 'root'
})
export class PortalItemService {
  public _apiUrl: string;

  public currentPortalItemId!: string;

  constructor(
    private http: HttpClient,
    private notifyService: NotifyService,
    @Inject('API_URL') apiUrl: string
  ) {
    this._apiUrl = apiUrl;
  }

  getPortalList(): Observable<PortalItem[]> {
    return this.http
      .get<ApiResponse<PortalItem[]>>(`${this._apiUrl}portal-item/list`)
      .pipe(map(x => x.result || []));
  }

  createRootFolder(data: PortalItemData): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this._apiUrl}portal-item/folder/create`,
      data
    );
  }

  updateRootFolder(
    id: string,
    data: PortalItemData
  ): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(
      `${this._apiUrl}portal-item/folder/${id}/update`,
      data
    );
  }

  publish(id: string): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(
      `${this._apiUrl}portal-item/${id}/publish`,
      null
    );
  }

  unpublish(id: string): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(
      `${this._apiUrl}portal-item/${id}/unpublish`,
      null
    );
  }
}
