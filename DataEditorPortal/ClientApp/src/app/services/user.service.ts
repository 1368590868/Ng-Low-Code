import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { AppUser } from '../models/app-user';
import { NotificationService } from './notification.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public _apiUrl: string;
  public USER: AppUser;

  constructor(
    private http: HttpClient,
    @Inject('API_URL') apiUrl: string,
    private notificationService: NotificationService,
  ) {
    this._apiUrl = apiUrl;
    // this.login().subscribe();
  }

  // // this.USER$.next(user)
  // login() {
  //   console.log('Calling login');
  //   this.getLoggedInUser().pipe(
  //     tap(user => 
  //       {
  //         this.USER = user as AppUser;
  //         console.log('USER', this.USER); 
  //       }),
  //     catchError(err => this.notificationService.notifyErrorInPipe(err))
  //   ).subscribe();
  // }

  logout() {
    //this.USER$.next(undefined);
  }


  // this.USER$.next(user)
  login() {
    // console.log('Calling login');
    return this.getLoggedInUser().pipe(
      tap(user => {
        this.USER = user as AppUser;
        
        // console.log('USER', this.USER);
      })
    );
  }

  getLoggedInUser() {
    return this.http.get(`${this._apiUrl}User/GetLoggedInUser`, { withCredentials: true });
  }

  fetchUserData(userid: string)
  {
    return this.http.get(`${this._apiUrl}User/FetchUserData?userid=` + userid).pipe(
      map(e => e as any)
    );

  }

  fetchPermissionData(userid: string)
  {
    return this.http.get(`${this._apiUrl}User/FetchPermissionData?userid=` + userid).pipe(
      map(e => e as any)
    );

  }

  
  fetchSitePermissionData(userid: string)
  {
    return this.http.get(`${this._apiUrl}User/FetchSitePermissionData?userid=` + userid).pipe(
      map(e => e as any)
    );

  }

  fetchRolePermissionData(id: string)
  {
    return this.http.get(`${this._apiUrl}User/FetchRolePermissionData?id=` + id).pipe(
      map(e => e as any)
    );

  }
  saveData(data: any)
  {
    console.log('saveData', data); 
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}User/SaveData`, param).pipe(
      map(e => e as any)
    );

  }

  addNew(data: any)
  {
    console.log('saveData', data); 
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}User/AddNew`, param).pipe(
      map(e => e as any)
    );

  }


  saveRoles(data: any )
  {
    console.log('saveData', data); 
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}User/UpdateRoles`, param).pipe(
      map(e => e as any)
    );
  }

  addNewRole(data: any)
  {
    console.log('saveData', data); 
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}User/addNewRole`, param).pipe(
      map(e => e as any)
    );

  }

  
  updateRole(data: any)
  {
    console.log('saveData', data); 
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}User/UpdateRole`, param).pipe(
      map(e => e as any)
    );

  }
  
  savePermissions(data: any )
  {
    console.log('saveData', data); 
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}User/UpdatePermissions`, param).pipe(
      map(e => e as any)
    );
  }

  
fetchData(searchParam?: any, gridParam?: any): any {

  console.log('fetchdata', searchParam, gridParam);
  var fetchParam = {
    Name: "Test",
    Description: "Testing2",
    Filters: [],
    Sorts: [],
    Searches: [],
    StartIndex: 0,
    IndexCount: 100,
    AppendFilter: ""
  };

  // //Add filter if only VENDOR ONLY view, otherwise ignore if DC_VIEW_ALL
  // if (!this.user.Permissions.DC_VIEW_ALL && this.user.Permissions.DC_VIEW_VENDOR_ONLY)
  // {
  //   fetchParam.AppendFilter = "a.VENDOR = '" + this.user.Vendor + "' or a.VENDOR is null";
  // }

  if (searchParam != undefined) {
    fetchParam.Searches = searchParam;
  }
  if (gridParam != undefined) {

    var obj = gridParam.filters;
    for (var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        // do stuff
        let fieldProp = obj[prop];
        for (let i = 0; i < fieldProp.length; i++) {
          if (fieldProp[i].value != null) {
            fieldProp[i].field = prop;
            //gridParam.filters.ISSUE_ID[0]
            fetchParam.Filters.push(fieldProp[i]);
          }
        }
      }
    }

    console.log('testParam', fetchParam);
    if (gridParam.multiSortMeta && gridParam.multiSortMeta.length > 0) {
      fetchParam.Sorts = gridParam.multiSortMeta;
      // for (let i = 0; i < gridParam.multiSortMeta.length; i++) {
      //   testParam.Sorts.push(gridParam.multiSortMeta[0]);
      // }
    }

    fetchParam.StartIndex = gridParam.first;
    fetchParam.IndexCount = gridParam.rows;
  }
  return this.http.post<any>(`${this._apiUrl}User/FetchData`, fetchParam).pipe(
    map(e => e as any)
  );
}


}

