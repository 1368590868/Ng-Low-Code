import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  public _apiUrl: string;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getSearchHistory(gridName: string) {
    return this.http.get<
      ApiResponse<
        { id: string; name: string; model: { [name: string]: any } }[]
      >
    >(`${this._apiUrl}search/${gridName}/saved-search`);
  }

  addSearchHistory(
    gridName: string,
    name: string,
    model: { [name: string]: any }
  ) {
    return this.http.post<ApiResponse<any>>(
      `${this._apiUrl}search/${gridName}/saved-search/create`,
      { name, model }
    );
  }

  updateSearcHistory(
    gridName: string,
    id: string,
    name: string,
    model: { [name: string]: any }
  ) {
    return this.http.put<ApiResponse<any>>(
      `${this._apiUrl}search/${gridName}/saved-search/${id}/update`,
      { name, model }
    );
  }
}
