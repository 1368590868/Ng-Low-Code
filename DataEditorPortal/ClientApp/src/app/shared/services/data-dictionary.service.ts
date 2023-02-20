import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Subject, tap } from 'rxjs';
import { ApiResponse, ConfigDataService } from 'src/app/shared';
import { DictionaryData } from '../models/dictionary';

@Injectable({
  providedIn: 'root'
})
export class DataDictionaryService {
  public _apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject('API_URL') apiUrl: string,
    private configDataService: ConfigDataService
  ) {
    this._apiUrl = apiUrl;
  }

  getDictionaryList() {
    return this.http
      .get<ApiResponse<DictionaryData[]>>(`${this._apiUrl}dictionary/list`)
      .pipe(map(x => x.result || []));
  }

  createDictionary(data: DictionaryData) {
    return this.http.post<ApiResponse<string>>(
      `${this._apiUrl}dictionary/create`,
      {
        label: data.label,
        value: data.value,
        value1: data.value1,
        value2: data.value2,
        category: data.category
      }
    );
  }

  updateDictionary(data: DictionaryData) {
    return this.http.put<ApiResponse<string>>(
      `${this._apiUrl}dictionary/${data.id}/update`,
      data
    );
  }

  deleteDictionary(data: DictionaryData) {
    return this.http.delete<ApiResponse<string>>(
      `${this._apiUrl}dictionary/${data.id}/delete`
    );
  }
}
