import { Inject, Injectable } from '@angular/core';
import { Route, Router, Routes } from '@angular/router';
import { tap, withLatestFrom } from 'rxjs';
import {
  AdminPermissionGuard,
  AuthRouterGuard,
  ConfigDataService,
  SiteMenu
} from 'src/app/shared';
import {
  DataDictionaryComponent,
  DbConnectionComponent,
  SiteGroupComponent,
  SiteSettingsComponent,
  SystemLogComponent,
  TileComponent
} from '../components';
import { FolderLayoutComponent } from '../layout/folder-layout.component';
import { GroupLayoutComponent } from '../layout/group-layout.component';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  constructor(
    private router: Router,
    @Inject('STATIC_ROUTES') private staticRoutes: Routes,
    private configDataService: ConfigDataService
  ) {
    this.configDataService.siteMenus$
      .pipe(
        withLatestFrom(this.configDataService.siteGroup$),
        tap(([menus, siteGroup]) => {
          this.resetRoutesConfig(menus, siteGroup?.name);
        })
      )
      .subscribe();
  }

  resetRoutesConfig(menus: SiteMenu[], siteGroupName: string | undefined) {
    this.updateRoute(
      { path: '', children: this.router.config },
      { name: '', items: menus },
      true
    );

    // update home and static pages to site group
    if (siteGroupName) {
      const homeRoute = this.router.config.find(r => r.path === '');
      if (homeRoute) {
        homeRoute.redirectTo = siteGroupName;
      }
      const groupRoute = this.router.config.find(r => r.path === siteGroupName);
      if (groupRoute) {
        this.staticRoutes
          .filter(r => r.path !== '')
          .forEach(r => groupRoute.children?.push(r));
      }
    }
  }

  updateRoute(route: Route, menu: SiteMenu, isRoot = false) {
    // update path
    route.path = menu.name;

    // update children
    if (!menu.items) route.children = undefined;
    else {
      if (!route.children) route.children = [];

      // find menu in routes, if not exist, add new route
      for (let i = menu.items.length - 1; i >= 0; i--) {
        const m = menu.items[i];
        if (route.children.findIndex(r => r.path === m.name) < 0) {
          const r = this.generateRoute(menu.items[i]);
          if (route.children && this.routeCorrect(r)) {
            route.children.unshift(r);
          }
        }
      }

      // find route in site menus, if not exist, remove it
      for (let i = route.children.length - 1; i >= 0; i--) {
        const path = route.children[i].path;
        if (path === '') continue; // do not remove the default route

        if (isRoot && this.staticRoutes.findIndex(m => path == m.path) >= 0) {
          // do not update static root
          continue;
        }

        if (menu.items.findIndex(m => path === m.name) < 0) {
          route.children.splice(i, 1);
        }
      }

      if (route.children.length > 0) {
        // update children
        for (let i = 0; i < route.children.length; i++) {
          const path = route.children[i].path;
          const m = menu.items.find(m => m.name === path);
          if (m) this.updateRoute(route.children[i], m);
        }
      } else route.children = undefined;
    }
  }

  routeCorrect: (route: Route) => boolean = r =>
    !!(
      r &&
      r.path &&
      (r.children || r.component || r.loadChildren || r.loadComponent)
    );

  buildPortalItemRoutes(menus: SiteMenu[]) {
    return menus
      .map(menu => {
        const route = this.generateRoute(menu);
        if (menu.items && menu.items.length > 0) {
          route.children = [
            ...(route.children || []),
            ...this.buildPortalItemRoutes(menu.items).filter(this.routeCorrect)
          ];
        }
        return route;
      })
      .filter(this.routeCorrect);
  }

  generateRoute(menu: SiteMenu): Route {
    if (menu.type === 'Portal Item') {
      return {
        path: menu.name,
        loadChildren: () =>
          import('src/app/features/universal-grid/universal-grid.module').then(
            m => m.UniversalGridModule
          ),
        data: { type: menu.itemType, name: menu.name },
        canActivate: [AuthRouterGuard]
      };
    } else if (menu.type === 'Folder') {
      return {
        path: menu.name,
        component: FolderLayoutComponent
      };
    } else {
      const route: Route = { path: menu.name, canActivate: [] };
      switch (menu.component) {
        case 'GroupLayoutComponent':
          route.data = { group: { ...menu, items: undefined } };
          route.component = GroupLayoutComponent;
          route.children = [{ path: '', component: TileComponent }];
          break;
        case 'UniversalGridModule':
          route.loadChildren = () =>
            import(
              'src/app/features/universal-grid/universal-grid.module'
            ).then(m => m.UniversalGridModule);
          route.data = { type: menu.itemType, name: menu.name };
          break;
        case 'PortalManagementModule':
          route.loadChildren = () =>
            import(
              'src/app/features/portal-management/portal-management.module'
            ).then(m => m.PortalManagementModule);
          break;
        case 'DbConnectionComponent':
          route.component = DbConnectionComponent;
          break;
        case 'SystemLogComponent':
          route.component = SystemLogComponent;
          break;
        case 'SiteSettingsComponent':
          route.component = SiteSettingsComponent;
          break;
        case 'DataDictionaryComponent':
          route.component = DataDictionaryComponent;
          break;
        case 'SiteGroupComponent':
          route.component = SiteGroupComponent;
          break;
        default:
          break;
      }
      if (menu.requireAuth) route.canActivate?.push(AuthRouterGuard);
      if (menu.requireAuth) route.canActivate?.push(AdminPermissionGuard);
      return route;
    }
  }
}
