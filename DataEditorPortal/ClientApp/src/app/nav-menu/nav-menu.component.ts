import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent {
  items!: MenuItem[];
  constructor() {
    this.items = [
      {
        label: 'Gas',
        icon: 'pi pi-fw pi-file',
        items: [
          {
            label: 'Gas Facility',
            icon: 'pi pi-fw pi-plus'
          },
          {
            label: 'Gas setting',
            icon: 'pi pi-fw pi-trash'
          }
        ]
      },
      {
        label: 'Electric',
        icon: 'pi pi-fw pi-pencil',
        items: [
          {
            label: 'Electric Facility',
            icon: 'pi pi-fw pi-align-left'
          },
          {
            label: 'Electric Facility Right',
            icon: 'pi pi-fw pi-align-right'
          },
          {
            label: 'Electric Facility Center',
            icon: 'pi pi-fw pi-align-center'
          },
          {
            label: 'Electric Facility Justify',
            icon: 'pi pi-fw pi-align-justify'
          }
        ]
      },
      {
        label: 'Major',
        icon: 'pi pi-fw pi-user',
        items: [
          {
            label: 'Major Underground New',
            icon: 'pi pi-fw pi-user-plus'
          },
          {
            label: 'Major Underground Delete',
            icon: 'pi pi-fw pi-user-minus'
          }
        ]
      },
      {
        label: 'Data',
        icon: 'pi pi-fw pi-calendar',
        items: [
          {
            label: 'Data Corrections',
            icon: 'pi pi-fw pi-pencil'
          },
          {
            label: 'Data Corrections Archieve',
            icon: 'pi pi-fw pi-calendar-times'
          }
        ]
      },
      {
        label: 'Batch Processing',
        icon: 'pi pi-fw pi-power-off',
        routerLink: '/action/batch'
      }
    ];
  }
}
