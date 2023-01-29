import { Component } from '@angular/core';
import { ConfigDataService } from '../../services/config-data.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent {
  constructor(public userService: UserService) {}
}
