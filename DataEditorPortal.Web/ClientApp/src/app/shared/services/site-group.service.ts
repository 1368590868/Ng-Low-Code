import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GridResult } from '../models';
import { ApiResponse } from '../models/api-response';
import { GroupData, GroupDetail } from '../models/site-group';

interface DropdownOptions {
  label: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class SiteGroupService {
  public _apiUrl: string;

  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getGroupList(fetchDataParam: any) {
    return this.http.post<ApiResponse<GridResult<GroupData>>>(`${this._apiUrl}site-group/list`, fetchDataParam);
  }

  getGroupOptions() {
    return this.http.get<ApiResponse<DropdownOptions[]>>(`${this._apiUrl}site-group/options`);
  }

  getGroupInfo(id: string) {
    return this.http.get<ApiResponse<GroupDetail>>(`${this._apiUrl}site-group/${id}`);
  }

  createGroup(data: GroupDetail) {
    return this.http.post<ApiResponse<string>>(`${this._apiUrl}site-group/create`, data);
  }

  updateGroup(data: GroupDetail, id: string) {
    return this.http.put<ApiResponse<string>>(`${this._apiUrl}site-group/${id}/update`, data);
  }

  deleteGroup(id: string) {
    return this.http.delete<ApiResponse<string>>(`${this._apiUrl}site-group/${id}/delete`);
  }

  nameExists(name: string, id?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams().set('name', name);
    if (id) params = params.set('id', id);
    return this.http.get<ApiResponse<any>>(`${this._apiUrl}site-group/name-exists`, {
      params
    });
  }

  getCodeName(name: string): Observable<ApiResponse<string>> {
    const params = new HttpParams().set('name', name);
    return this.http.get<ApiResponse<string>>(`${this._apiUrl}site-group/get-code-name`, {
      params
    });
  }
}
