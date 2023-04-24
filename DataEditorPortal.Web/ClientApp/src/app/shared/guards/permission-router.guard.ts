import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '..';

@Injectable({
  providedIn: 'root'
})
export class PermissionRouterGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.userService.USER.isAdmin) {
      if (route.params['name']) {
        const routerParam =
          'VIEW_' + route.params['name'].toUpperCase().replace(/-/g, '_');
        console.log(routerParam);
        if (!this.userService.USER.permissions![routerParam]) {
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
