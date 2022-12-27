import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AppUser } from '../models/app-user';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private userService: UserService,
    private router: Router,
  ) {

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isLoggedIn = this.isLoggedIn(this.userService.USER);
    if (!isLoggedIn) {
      this.router.navigate(['login'], { queryParams: { returnUrl: state.url } });
    }
    return isLoggedIn;
  }

  isLoggedIn(user: AppUser) {
    if (user && user.Authenticated) {
      return true;
    }
    return false;
  }
}
