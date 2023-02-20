import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs';
import { ConfigDataService, SiteMenu } from 'src/app/shared';

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
            .filter(x => x.type !== 'Folder')
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
