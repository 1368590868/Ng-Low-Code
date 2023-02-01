import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs';
import { SiteMenu } from '../../models/menu';
import { ConfigDataService } from '../../services/config-data.service';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {
  public homeMenus: SiteMenu[] = [];
  constructor(private configDataService: ConfigDataService) {}
  ngOnInit() {
    this.configDataService
      .getHomeMenus()
      .pipe(
        tap(res => {
          this.homeMenus = res
            .map(menu => {
              return menu.items ? menu.items : menu;
            })
            .flat()
            .map(menu => {
              return {
                ...menu,
                url:
                  menu.type === 'Portal Item'
                    ? `/portal-item/${menu.name.toLowerCase()}`
                    : menu.link
              };
            });
        })
      )
      .subscribe();
  }
}
