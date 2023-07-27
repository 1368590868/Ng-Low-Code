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
    // this.configDataService.menuGroupChange$.subscribe(x => {
    //   if (x) {
    //     const [_, ...rest] = this.items;
    //     this.items = [
    //       {
    //         label: 'Home',
    //         routerLink: ['/' + x.name],
    //         routerLinkActiveOptions: { exact: true }
    //       },
    //       ...rest
    //     ];
    //     this.siteName = x.label;
    //   }
    // });
  }
}
