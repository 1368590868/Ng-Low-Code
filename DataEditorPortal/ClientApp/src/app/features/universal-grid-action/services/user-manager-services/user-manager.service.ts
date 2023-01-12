import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  UserManagerForm,
  UserManagerResponse
} from '../../models/user-manager';

@Injectable({
  providedIn: 'root'
})
export class UserManagerService {
  public _apiUrl: string;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  saveUserManager(formData: UserManagerForm): Observable<UserManagerResponse> {
    return this.http.post(
      `${this._apiUrl}UniversalGrid/usermanagement/config/columns`,
      formData
    );
  }
}
