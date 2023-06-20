import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { delay, map } from 'rxjs';
import { ApiResponse } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class LocationEditorService {
  constructor(
    private http: HttpClient,
    @Inject('API_URL') public apiUrl: string
  ) {}

  getPipeOptions(id: string, data = {}) {
    return this.http
      .post<ApiResponse<any[]>>(`${this.apiUrl}lookup/${id}/options`, data)
      .pipe(map(res => res.result || []));
  }
}
