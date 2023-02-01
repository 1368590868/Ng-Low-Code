import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ConfigDataService } from '../../services/config-data.service';
import { UserService } from '../../services/user.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  items!: MenuItem[];
  constructor(
    public configDataService: ConfigDataService,
    public userService: UserService
  ) {
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
}
