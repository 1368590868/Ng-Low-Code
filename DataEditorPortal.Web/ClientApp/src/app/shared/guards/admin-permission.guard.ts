import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '..';

@Injectable({
  providedIn: 'root'
})
export class AdminPermissionGuard {
  constructor(private userService: UserService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.userService.USER.isAdmin) {
      this.router.navigate(['error-page'], {
        queryParams: { code: '401' }
      });
      return false;
    } else {
      return true;
    }
  }
}
