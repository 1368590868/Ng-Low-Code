import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ApiResponse, ConfigDataService } from 'src/app/shared';
import { DictionaryData, DictionaryResult } from '../models/dictionary';

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

  getDictionaryList(fetchDataParam: any) {
    return this.http.post<ApiResponse<DictionaryResult>>(
      `${this._apiUrl}dictionary/list`,
      fetchDataParam
    );
  }

  createDictionary(data: DictionaryData) {
    return this.http.post<ApiResponse<string>>(
      `${this._apiUrl}dictionary/create`,
      data
    );
  }

  updateDictionary(data: DictionaryData) {
    return this.http.put<ApiResponse<string>>(
      `${this._apiUrl}dictionary/${data.ID}/update`,
      data
    );
  }

  deleteDictionary(data: DictionaryData) {
    return this.http.delete<ApiResponse<string>>(
      `${this._apiUrl}dictionary/${data.ID}/delete`
    );
  }
}
