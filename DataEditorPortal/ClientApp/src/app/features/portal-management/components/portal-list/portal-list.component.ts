import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-portal-list',
  templateUrl: './portal-list.component.html',
  styleUrls: ['./portal-list.component.scss']
})
export class PortalListComponent implements OnInit {
  data!: any[];
  addNewMenuModels: any[] = [
    {
      label: 'Create Folder',
      icon: 'pi pi-fw pi-folder',
      command: () => {
        this.addDialog.showDialog();
      }
    },
    {
      label: 'Create Portal Item',
      icon: 'pi pi-fw pi-desktop',
      command: () => {
        this.router.navigate([`../add`], {
          relativeTo: this.activatedRoute
        });
      }
    }
  ];

  @ViewChild('addDialog') addDialog: any;
  @ViewChild('newButton') newButton: any;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

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
          // new portal item
          this.router.navigate([`../add`], {
            relativeTo: this.activatedRoute
          });
        }
      });
      items.push({
        label: 'Edit',
        icon: 'pi pi-fw pi-pencil',
        command: () => {
          // edit folder
          this.addDialog.showDialog();
        }
      });
    } else {
      items.push({
        label: 'Edit',
        icon: 'pi pi-fw pi-pencil',
        command: () => {
          // edit portal item
          this.router.navigate([`../edit/${row.id}`], {
            relativeTo: this.activatedRoute
          });
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
}
