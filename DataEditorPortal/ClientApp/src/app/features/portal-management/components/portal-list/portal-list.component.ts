import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-portal-list',
  templateUrl: './portal-list.component.html',
  styleUrls: ['./portal-list.component.scss']
})
export class PortalListComponent implements OnInit {
  data!: any[];

  @ViewChild('addDialog') addDialog: any;

  ngOnInit(): void {
    this.data = [
      {
        data: {
          id: 'b4b490ea-9df3-4f7a-8806-936ca7f87b8f',
          name: 'PortalManagement',
          label: 'Portal Management',
          icon: 'pi pi-desktop',
          description: null,
          type: 'System',
          link: '/portal-management/list'
        },
        children: []
      },
      {
        data: {
          id: '4e22e18e-492e-4786-8170-fb8f0c9d3a62',
          name: 'UserManagement',
          label: 'User Management',
          icon: 'pi pi-fw pi-user',
          description: '1',
          type: 'Portal Item',
          link: null,
          status: 0
        },
        children: null
      },
      {
        data: {
          id: '4e22e18e-492e-4786-8170-fb8f0c9d3a63',
          name: 'UserManagement1',
          label: 'User Management 1',
          icon: 'pi pi-fw pi-user',
          description: '2',
          type: 'Folder',
          link: null,
          status: 1
        },
        children: [
          {
            data: {
              id: '4e22e18e-492e-4786-8170-fb8f0c9d3a64',
              name: 'UserManagement1',
              label: 'Portal Item 2',
              icon: 'pi pi-fw pi-user',
              description: '3',
              type: 'Portal Item',
              link: null
            }
          }
        ]
      }
    ];
  }

  getMenuList(row: any) {
    const items: MenuItem[] = [];
    if (row.type === 'Folder') {
      items.push({
        label: 'New',
        icon: 'pi pi-fw pi-plus',
        command: () => {
          this.addDialog.showDialog();
        }
      });
    } else {
      items.push({
        label: 'Edit',
        icon: 'pi pi-fw pi-pencil',
        command: () => {
          this.addDialog.showDialog();
        }
      });
    }
    if (row.status === 1) {
      items.push({ label: 'Unpublish', icon: 'pi pi-fw pi-check-circle' });
    } else {
      items.push({ label: 'Publish', icon: 'pi pi-fw pi-minus-circle' });
    }
    return items;
  }

  addRootItem() {
    this.addDialog.showDialog();
  }
}
