import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, NotifyService } from 'src/app/shared';
import { Lookup } from '../models/lookup';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  public _apiUrl: string;

  constructor(
    private http: HttpClient,
    private notifyService: NotifyService,
    @Inject('API_URL') apiUrl: string
  ) {
    this._apiUrl = apiUrl;
  }

  getLookups(): Observable<Lookup[]> {
    return this.http
      .get<ApiResponse<Lookup[]>>(`${this._apiUrl}lookup/list`)
      .pipe(map(x => x.data || []));
  }

  getOptionQuery(id: string): Observable<Lookup | undefined> {
    return this.http
      .get<ApiResponse<Lookup | undefined>>(`${this._apiUrl}lookup/${id}`)
      .pipe(map(x => x.data));
  }

  saveOptionQuery(data: Lookup) {
    if (data.id !== undefined) {
      return this.http.put<ApiResponse<string>>(
        `${this._apiUrl}lookup/${data.id}/update`,
        data
      );
    } else {
      return this.http.post<ApiResponse<string>>(
        `${this._apiUrl}lookup/create`,
        data
      );
    }
  }
}
