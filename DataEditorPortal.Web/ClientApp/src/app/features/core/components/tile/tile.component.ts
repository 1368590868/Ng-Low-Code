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
  public loading = false;
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
              const data = {
                ...menu,
                routerLink:
                  menu.type === 'Portal Item'
                    ? `/portal-item/${menu.itemType}/${menu.name.toLowerCase()}`
                    : menu.type !== 'External'
                    ? menu.link
                    : undefined
              };
              if (
                data.icon &&
                /^data:image\/([a-z]+);base64,/.test(data.icon)
              ) {
                data.iconStyle = {
                  backgroundImage: `url(${data.icon})`,
                  width: '4rem',
                  height: '4rem',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center'
                };
                data.icon = 'pi ';
              }
              return data;
            });
          this.loading = true;
        })
      )
      .subscribe();
  }
}
