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
    this.configData.getSiteMenus().subscribe((res: any) => {
      this.items = res;
    });
  }
}
