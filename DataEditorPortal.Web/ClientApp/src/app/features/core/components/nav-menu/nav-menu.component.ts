import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Component, Inject, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Observable, combineLatest, filter, map } from 'rxjs';
import { ConfigDataService, UserService, SiteMenu } from 'src/app/shared';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss'],
  animations: [
    trigger('transformMenu', [
      state('left1', style({ paddingLeft: '1rem' })),
      state('left3', style({ paddingLeft: '3rem' })),
      transition('left3 => left1', [animate('200ms')]),
      transition('left1 => left3', [animate('200ms 300ms')])
    ])
  ]
})
export class NavMenuComponent implements OnInit {
  public menuItemsInGroup$?: Observable<MenuItem[]>;

  constructor(
    public userService: UserService,
    public configDataService: ConfigDataService,
    private router: Router,
    @Inject('API_URL') private apiUrl: string
  ) {}

  ngOnInit(): void {
    this.menuItemsInGroup$ = combineLatest([
      this.router.events.pipe(
        filter(e => e instanceof NavigationEnd && e.type === 1),
        map(e => e as NavigationEnd)
      ),
      this.configDataService.siteMenus$
    ]).pipe(
      map(([event, menus]) => {
        let items: SiteMenu[] = menus;
        if (this.configDataService.siteGroupName) {
          // if site group exist, use its children to show in nav and tile
          const group = menus.find(
            m => m.name === this.configDataService.siteGroupName
          );
          if (group) items = group.items || [];
        }

        return items.map(menu => {
          this.setMenu(menu);
          this.setParentActive(menu, event.url);

          const menuItem: MenuItem = menu;
          if (menuItem.url) menuItem.target = '_blank';
          return menuItem;
        });
      })
    );
  }

  setMenu(menu: SiteMenu) {
    if (menu && menu.description) {
      menu.tooltipOptions = {
        tooltipPosition: 'bottom',
        showDelay: 500,
        tooltipLabel: menu.description
      };
    }

    if (menu.status !== 1) {
      menu.badge = 'Draft';
      menu.badgeStyleClass = 'p-badge p-badge-warning';
    }

    if (menu.icon && /^icons\/.*/.test(menu.icon)) {
      menu.iconStyle = {
        backgroundImage: `url(${this.apiUrl}attachment/${menu.icon})`,
        width: '1rem',
        height: '1rem',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        backgroundPosition: 'center'
      };
    }

    if (menu.items) {
      menu.items.forEach(i => {
        this.setMenu(i);
      });
    }
  }

  setParentActive(menu: SiteMenu | MenuItem, url?: string) {
    if (menu.items && menu.items.find(x => `/${x.routerLink}` === url)) {
      menu.styleClass = 'active-parent-menu';
    } else {
      menu.styleClass = '';
    }
  }
}
