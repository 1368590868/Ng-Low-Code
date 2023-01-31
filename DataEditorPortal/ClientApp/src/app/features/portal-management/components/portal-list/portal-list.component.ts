import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { tap } from 'rxjs';
import { NotifyService } from 'src/app/core';
import { PortalItem, PortalItemData } from '../../models/portal-item';
import { PortalItemService } from '../../services/portal-item.service';
import { AddPortalDialogComponent } from './add-portal-dialog/add-portal-dialog.component';

@Component({
  selector: 'app-portal-list',
  templateUrl: './portal-list.component.html',
  styleUrls: ['./portal-list.component.scss']
})
export class PortalListComponent implements OnInit {
  data!: PortalItem[];
  addNewMenuModels: MenuItem[] = [
    {
      label: 'Create Folder',
      icon: 'pi pi-fw pi-folder',
      command: () => {
        this.addDialog.header = 'Create Folder';
        this.addDialog.okText = 'Create Folder';
        this.addDialog.showDialog();
      }
    },
    {
      label: 'Create Portal Item',
      icon: 'pi pi-fw pi-desktop',
      command: () => {
        this.portalItemService.currentPortalItemParentFolder = undefined;
        this.router.navigate([`../add`], {
          relativeTo: this.activatedRoute
        });
      }
    }
  ];

  @ViewChild('addDialog') addDialog!: AddPortalDialogComponent;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private portalItemService: PortalItemService,
    private notifyService: NotifyService
  ) {}

  ngOnInit(): void {
    this.getPortalList();
  }

  getMenuList(row: PortalItemData) {
    const items: MenuItem[] = [];
    if (row['type'] === 'Portal Item') {
      items.push({
        label: 'Edit Portal Item',
        icon: 'pi pi-fw pi-pencil',
        command: () => {
          // edit portal item
          this.router.navigate([`../edit/${row['id']}`], {
            relativeTo: this.activatedRoute
          });
        }
      });
    } else {
      items.push({
        label: 'New Portal Item',
        icon: 'pi pi-fw pi-plus',
        command: () => {
          // new portal item
          this.portalItemService.currentPortalItemParentFolder = row['id'];
          this.router.navigate([`../add`], {
            relativeTo: this.activatedRoute
          });
        }
      });
      items.push({
        label: 'Edit Folder',
        icon: 'pi pi-fw pi-pencil',
        command: () => {
          // edit folder
          this.addDialog.header = 'Update Folder details';
          this.addDialog.okText = 'Update Folder';
          this.addDialog.model = { ...row };
          this.addDialog.showDialog();
        }
      });
    }
    if (row['status'] === 1) {
      items.push({
        label: 'Unpublish',
        icon: 'pi pi-fw pi-minus-circle',
        command: () => this.unpublish(row)
      });
    } else {
      items.push({
        label: 'Publish',
        icon: 'pi pi-fw pi-check-circle',
        command: () => this.publish(row)
      });
    }
    return items;
  }

  getPortalList() {
    this.portalItemService
      .getPortalList()
      .pipe(
        tap(res => {
          res.forEach(x => (x.expanded = true));
          this.data = res;
        })
      )
      .subscribe();
  }

  publish(row: PortalItemData) {
    this.portalItemService
      .publish(row['id'])
      .pipe(
        tap(res => {
          if (res && !res.isError) {
            row['status'] = 1;
          }
        })
      )
      .subscribe();
  }

  unpublish(row: PortalItemData) {
    this.portalItemService
      .unpublish(row['id'])
      .pipe(
        tap(res => {
          if (res && !res.isError) {
            row['status'] = 2;
          }
        })
      )
      .subscribe();
  }
}
