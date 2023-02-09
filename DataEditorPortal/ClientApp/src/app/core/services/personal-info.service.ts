import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  ManageRoleForm,
  UpdateRole
} from 'src/app/features/universal-grid-action/models/user-manager';
import { ApiResponse } from '../models/api-response';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class PersonalInfoService {
  public _apiUrl: string;
  public durationMs = 5000;

  constructor(
    private http: HttpClient,
    @Inject('API_URL') apiUrl: string,
    private userService: UserService
  ) {
    this._apiUrl = apiUrl;
  }
  getUserDetail(): Observable<ManageRoleForm> {
    return this.http
      .get<ApiResponse<ManageRoleForm>>(
        `${this._apiUrl}user/detail/${this.userService.USER.identityName}`
      )
      .pipe(map(res => res.result || {}));
  }

  updateUser(data: ManageRoleForm) {
    return this.http.put<ApiResponse<UpdateRole[]>>(
      `${this._apiUrl}user/update/${data.id}`,
      { ...data, division: JSON.stringify(data.division) }
    );
  }
}
