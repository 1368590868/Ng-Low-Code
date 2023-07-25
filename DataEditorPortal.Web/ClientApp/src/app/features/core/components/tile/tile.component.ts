import { ApplicationRef, Component, Inject, OnDestroy } from '@angular/core';
import { Observable, Subject, map, takeUntil } from 'rxjs';
import { ConfigDataService, SiteMenu } from 'src/app/shared';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnDestroy {
  loading = true;
  destroy$ = new Subject();

  menus$?: Observable<SiteMenu[]>;

  private flattenMenus(menus: any[]): any[] {
    return menus
      .map(menu => {
        return menu.items ? this.flattenMenus(menu.items) : menu;
      })
      .flat()
      .filter(x => x.type !== 'Folder')
      .map(menu => {
        const data = {
          ...menu,
          routerLink: menu.routerLink ? `/${menu.routerLink}` : undefined
        };

        if (data.icon && /^icons\/.*/.test(data.icon)) {
          data.iconStyle = {
            backgroundImage: `url(${this.apiUrl}attachment/${menu.icon})`,
            width: '4rem',
            height: '4rem',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundPosition: 'center'
          };
        }
        return data;
      });
  }

  constructor(
    private configDataService: ConfigDataService,
    @Inject('API_URL') private apiUrl: string,
    public app: ApplicationRef
  ) {
    app.isStable.pipe(takeUntil(this.destroy$)).subscribe(x => {
      if (x) this.loading = false;
    });
    this.menus$ = this.configDataService.siteMenus$.pipe(
      takeUntil(this.destroy$),
      map(menus => {
        return this.flattenMenus(menus);
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
