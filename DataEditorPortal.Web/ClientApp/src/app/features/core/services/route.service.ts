import { Inject, Injectable } from '@angular/core';
import { Route, Router, Routes } from '@angular/router';
import { tap } from 'rxjs';
import {
  SiteMenu,
  ConfigDataService,
  AuthRouterGuard,
  AdminPermissionGuard
} from 'src/app/shared';
import { GroupLayoutComponent } from '../layout/group-layout.component';
import {
  SiteSettingsComponent,
  DataDictionaryComponent,
  DbConnectionComponent,
  SystemLogComponent,
  TileComponent
} from '../components';

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
        tap(menus => {
          this.resetRoutesConfig(menus);
        })
      )
      .subscribe();
  }

  resetRoutesConfig(menus: SiteMenu[]) {
    const routes = this.buildPortalItemRoutes(menus);
    this.router.resetConfig([...routes, ...this.staticRoutes]);
  }

  routeCorrect: (route: Route) => boolean = r =>
    !!(
      r &&
      r.path &&
      (r.children || r.component || r.loadChildren || r.loadComponent)
    );

  buildPortalItemRoutes(menus: SiteMenu[], level = 1) {
    return menus
      .map(menu => {
        let route: Route = {};
        switch (level) {
          case 1:
            route = {
              path: menu.name,
              data: { group: { ...menu, items: undefined } },
              component: GroupLayoutComponent,
              children: [{ path: '', component: TileComponent }]
            };
            break;
          case 2:
            route = this.generateRoute(menu);
            break;
          case 3:
            route = this.generateRoute(menu);
            break;
          default:
            break;
        }
        if (menu.items && menu.items.length > 0) {
          route.children = [
            ...(route.children || []),
            ...this.buildPortalItemRoutes(menu.items, level + 1).filter(
              this.routeCorrect
            )
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
        path: menu.name
        // component: FolderLayoutComponent
      };
    } else {
      const route: Route = { path: menu.name, canActivate: [] };
      switch (menu.component) {
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
        default:
          break;
      }
      if (menu.requireAuth) route.canActivate?.push(AuthRouterGuard);
      if (menu.requireAuth) route.canActivate?.push(AdminPermissionGuard);
      return route;
    }
  }
}
