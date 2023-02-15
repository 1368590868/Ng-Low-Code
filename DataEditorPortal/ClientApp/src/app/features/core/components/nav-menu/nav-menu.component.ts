import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ConfigDataService, UserService, SiteMenu } from 'src/app/shared';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {
  public menuItems: MenuItem[] = [];
  public currentUrl?: string;

  constructor(
    public userService: UserService,
    private configDataService: ConfigDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe((event: any) => {
      if (event.type === 1) {
        this.currentUrl = event.url;

        this.menuItems.forEach(menu => {
          this.setParentActive(menu, event.url);
        });
      }
    });
    this.configDataService.menuChange$.subscribe(() => {
      this.configDataService.getSiteMenus().subscribe(res => {
        res.forEach(menu => {
          this.setMenu(menu);
          this.setParentActive(menu, this.currentUrl);
        });
        this.menuItems = res;
      });
    });
  }

  setMenu(menu: SiteMenu) {
    if (menu && menu.description) {
      menu.tooltipOptions = {
        tooltipPosition: 'bottom',
        showDelay: 500,
        tooltipLabel: menu.description
      };
    }
    if (menu.type === 'Portal Item') {
      menu.routerLink = `/portal-item/${menu.name.toLowerCase()}`;
    } else if (menu.type === 'External') {
      menu.url = menu.link;
    } else menu.routerLink = menu.link;

    menu.items &&
      menu.items.forEach(i => {
        this.setMenu(i);
      });
  }

  setParentActive(menu: SiteMenu | MenuItem, url?: string) {
    if (menu.items && menu.items.find(x => x.routerLink === url)) {
      menu.styleClass = 'active-parent-menu';
    } else {
      menu.styleClass = '';
    }
  }
}
