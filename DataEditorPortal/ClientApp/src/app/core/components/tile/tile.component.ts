import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { tap } from 'rxjs';
import { ConfigDataService } from '../../services/config-data.service';

interface HomeMenu extends MenuItem {
  name: string;
  link?: string;
}

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {
  public homeMenus: HomeMenu[] = [];
  constructor(private configDataService: ConfigDataService) {}
  ngOnInit() {
    this.configDataService
      .getHomeMenus()
      .pipe(
        tap(res => {
          res.map((item: HomeMenu) => {
            item.url = item.link;
          });
          this.homeMenus = res;
        })
      )
      .subscribe();
  }
}
