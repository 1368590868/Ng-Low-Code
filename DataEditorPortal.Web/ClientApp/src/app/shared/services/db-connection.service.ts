import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, DbConnectionData } from '..';

@Injectable({
  providedIn: 'root'
})
export class DbConnectionService {
  public _apiUrl: string;

  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getDbConnectionList(): Observable<any> {
    return this.http
      .get<ApiResponse<any>>(`${this._apiUrl}portal-item/datasource/connections/list`)
      .pipe(map(x => x.data || []));
  }

  createConnection(data: DbConnectionData) {
    return this.http.post<ApiResponse<string>>(`${this._apiUrl}portal-item/datasource/connections/create`, data);
  }

  updateConnection(name: string, data: DbConnectionData) {
    return this.http.put<ApiResponse<string>>(`${this._apiUrl}portal-item/datasource/connections/${name}/update`, data);
  }

  deleteConnection(data: DbConnectionData) {
    return this.http.delete<ApiResponse<string>>(
      `${this._apiUrl}portal-item/datasource/connections/${data.name}/delete`
    );
  }
}
