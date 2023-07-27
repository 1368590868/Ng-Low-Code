import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ConfigDataService, UserService } from 'src/app/shared';
import { PersonalDialogComponent } from '..';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @ViewChild('dialog') dialog!: PersonalDialogComponent;
  items!: MenuItem[];

  public visible = false;
  siteName?: string;

  constructor(
    public configDataService: ConfigDataService,
    public userService: UserService
  ) {
    this.items = [
      {
        label: 'Home',
        routerLink: ['/'],
        routerLinkActiveOptions: { exact: true }
      },
      {
        label: 'About',
        routerLink: ['/about']
      },
      {
        label: 'Contact',
        routerLink: ['/contact']
      }
    ];
  }

  ngOnInit(): void {
    this.configDataService.getSiteSettings().subscribe();
    this.configDataService.siteGroup$.subscribe(x => {
      if (x) {
        this.items = this.items.map(m => {
          return { ...m, routerLink: [`/${x.name}${m.routerLink[0]}`] };
        });
        this.siteName = x.label;
      }
    });
  }
}
