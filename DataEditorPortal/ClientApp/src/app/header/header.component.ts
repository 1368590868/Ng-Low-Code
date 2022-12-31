import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ConfigDataService } from '../config-data.service';

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
  constructor(private configData: ConfigDataService) {
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
