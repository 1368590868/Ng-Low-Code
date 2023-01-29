import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AppUser } from '../../models/user';
import { ConfigDataService } from '../../services/config-data.service';
import { UserService } from '../../services/user.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  items!: MenuItem[];

  public headerText = {
    WebHeaderDescription: '',
    WebHeaderMessage: ''
  };
  public USER: AppUser = {};
  constructor(
    private configData: ConfigDataService,
    private userService: UserService
  ) {
    this.USER = this.userService.USER;
    this.items = [
      {
        label: 'Home',
        routerLink: ['/']
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
    this.configData.getSiteEnvironment().subscribe((res: any) => {
      this.headerText = res;
    });
  }
}
