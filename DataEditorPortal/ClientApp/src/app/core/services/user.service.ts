import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { map, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { AppUser } from '../models/user';
import { ConfigDataService } from './config-data.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public _apiUrl: string;
  public USER: AppUser = {};
  public isLogin = false;
  public durationMs = 5000;

  public headerText = {
    WebHeaderDescription: '',
    WebHeaderMessage: ''
  };

  public menuItems: MenuItem[] = [];
  constructor(
    private http: HttpClient,
    @Inject('API_URL') apiUrl: string,
    private configData: ConfigDataService
  ) {
    this._apiUrl = apiUrl;
  }

  login() {
    return this.getLoggedInUser().pipe(
      tap(res => {
        if (!res.isError && res.result) {
          this.isLogin = true;
          this.loginAfter();
          this.USER = res.result;
        }
      })
    );
  }

  loginAfter() {
    this.configData.getSiteEnvironment().subscribe((res: any) => {
      this.headerText = res;
    });

    this.configData.getSiteMenus().subscribe((res: any[]) => {
      res.forEach(m => {
        this.setMenu(m);
      });
      this.menuItems = res;
    });
  }

  getLoggedInUser() {
    return this.http.get<ApiResponse<AppUser>>(
      `${this._apiUrl}User/GetLoggedInUser`
    );
  }

  setMenu(menu: any) {
    if (menu && menu.description) {
      menu.tooltipOptions = {
        tooltipPosition: 'bottom',
        showDelay: 500,
        tooltipLabel: menu.description
      };
    }
    if (menu.type === 'Portal Item') {
      menu.routerLink = `/portal-item/${menu.name.toLowerCase()}`;
    } else if (menu.type === 'External') {
      menu.url = menu.link;
    } else menu.routerLink = menu.link;

    menu.items &&
      menu.items.forEach((i: any) => {
        this.setMenu(i);
      });
  }
}
