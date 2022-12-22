import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AppUser } from '../models/app-user';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionGuard implements CanActivate {

  constructor(
    private userService: UserService,
    private router: Router,
  ) {

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const hasPermission = this.hasPermission(this.userService.USER);
    if (!hasPermission) {
      this.router.navigate(['no-permission'], { queryParams: { returnUrl: this.router.url } });
    }
    return hasPermission;
  }

  hasPermission(user: AppUser) {
    if (user && user.Permissions) {
      return true;
    }
    return false;
  }
}
