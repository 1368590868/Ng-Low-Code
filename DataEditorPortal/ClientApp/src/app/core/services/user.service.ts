import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { AppUser } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public _apiUrl: string;
  public USER: AppUser = {};
  public durationMs = 5000;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  login() {
    return this.getLoggedInUser().pipe(
      tap(user => {
        this.USER = user.result || {};
      })
    );
  }

  getLoggedInUser() {
    return this.http.get<ApiResponse<AppUser>>(
      `${this._apiUrl}User/GetLoggedInUser`
    );
  }
}
