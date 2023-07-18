import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { GlobalLoadingService } from '../services/global-loading.service';

@Injectable({
  providedIn: 'root'
})
export class PortalRouterLoadingGuard implements CanActivateChild {
  constructor(private globalLoadingService: GlobalLoadingService) {}

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    this.globalLoadingService.start();
    return true;
  }
}
