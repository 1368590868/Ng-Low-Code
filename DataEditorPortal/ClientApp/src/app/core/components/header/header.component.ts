import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ConfigDataService } from '../../services/config-data.service';

export interface AppUser {
  identityName: string;
  username: string;
  domain: string;
  displayName: string;
  email: string;
  vendor: string;
  authenticated: boolean;
}
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
  public USER: AppUser;
  constructor(private configData: ConfigDataService) {
    this.USER = {
      identityName: '',
      username: '',
      domain: '',
      displayName: '',
      email: '',
      vendor: '',
      authenticated: false
    };
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
    this.configData.getLoggedInUser().subscribe(user => {
      this.USER = user as AppUser;
    });
  }
}
