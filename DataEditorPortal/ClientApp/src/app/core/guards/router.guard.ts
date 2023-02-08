import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { SiteSettingsService } from '../services/site-settings.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class RouterGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router,
    private siteSettingsService: SiteSettingsService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.userService.isLogin) {
      this.router.navigate(['login'], {
        queryParams: { returnUrl: state.url }
      });
    } else {
      if (state.url !== '/site-settings') {
        this.siteSettingsService.convertOldSiteSettings();
      }
    }
    return this.userService.isLogin;
  }
}
