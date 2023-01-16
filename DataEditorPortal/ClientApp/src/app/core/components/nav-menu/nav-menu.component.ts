import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ConfigDataService } from '../../services/config-data.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {
  items!: MenuItem[];
  constructor(private configData: ConfigDataService) {
    this.items = [];
  }

  ngOnInit(): void {
    this.configData.getSiteMenus().subscribe((res: any[]) => {
      res.forEach(m => {
        this.setMenu(m);
      });
      this.items = res;
    });
  }

  setMenu(menu: any) {
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
      menu.items.forEach((i: any) => {
        this.setMenu(i);
      });
  }
}
