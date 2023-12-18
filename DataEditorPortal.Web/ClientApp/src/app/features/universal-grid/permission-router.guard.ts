import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class PermissionRouterGuard  {
  constructor(private userService: UserService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.userService.USER.isAdmin) {
      if (route.data['name']) {
        const routerParam =
          'VIEW_' + route.data['name'].toUpperCase().replace(/-/g, '_');
        if (!this.userService.USER.permissions?.[routerParam]) {
          this.router.navigate(['error-page'], {
            queryParams: { code: '401' }
          });
        }
      } else {
        this.router.navigate(['error-page'], {
          queryParams: { code: '401' }
        });
      }
    }
    return true;
  }
}
