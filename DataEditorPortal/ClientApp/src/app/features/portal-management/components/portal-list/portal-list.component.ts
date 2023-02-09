import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, TreeNode } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { Menu } from 'primeng/menu';
import { tap } from 'rxjs';
import { ConfigDataService, NotifyService } from 'src/app/core';
import { PortalItem, PortalItemData } from '../../models/portal-item';
import { PortalItemService } from '../../services/portal-item.service';
import { CustomActionsComponent } from '../custom-actions/custom-actions.component';
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

  contextMenuItems: MenuItem[] = [];

  @ViewChild('addDialog') addDialog!: AddPortalDialogComponent;
  @ViewChild('cm') contextMenu!: ContextMenu;
  @ViewChild('customActions') customActions!: CustomActionsComponent;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private portalItemService: PortalItemService,
    private notifyService: NotifyService,
    private configDataService: ConfigDataService
  ) {}

  ngOnInit(): void {
    this.getPortalList();
  }

  onShowMenu(menu: Menu, $event: any, rowNode: TreeNode) {
    if (!menu.visible) {
      this.contextMenuItems = this.getMenuList(rowNode);
    }
    menu.toggle($event);
  }

  onContextMenuSelect(event: any) {
    this.contextMenuItems = this.getMenuList(event.node);
    setTimeout(() => {
      this.contextMenu.show(event.originalEvent);
    }, 0);
  }

  getMenuList(rowNode: TreeNode) {
    const row = rowNode.data as PortalItemData;

    const items: MenuItem[] = [];
    if (row['type'] === 'Portal Item') {
      items.push({
        label: row['configCompleted'] ? 'Edit Portal Item' : 'Continue Editing',
        icon: 'pi pi-fw pi-pencil',
        command: () => {
          // edit portal item
          this.router.navigate([`../edit/${row['id']}`], {
            relativeTo: this.activatedRoute
          });
        }
      });
      if (row['configCompleted']) {
        items.push({
          label: 'Config Actions',
          icon: 'pi pi-fw pi-th-large',
          command: () => {
            this.customActions.portalItemId = row['id'];
            this.customActions.showDialog();
          }
        });
      }
    } else if (row['type'] === 'System') {
      items.push({
        label: 'Edit',
        icon: 'pi pi-fw pi-pencil',
        command: () => {
          // edit folder
          this.addDialog.header = 'Update details';
          this.addDialog.okText = 'Update';
          this.addDialog.model = { ...row };
          this.addDialog.showDialog();
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

    if (row['type'] !== 'System') {
      if (row['status'] === 1) {
        items.push({
          label: 'Unpublish',
          icon: 'pi pi-fw pi-minus-circle',
          command: () => this.unpublish(row)
        });
      } else if (row['configCompleted'] != false) {
        items.push({
          label: 'Publish',
          icon: 'pi pi-fw pi-check-circle',
          command: () => this.publish(row)
        });
      }
    }

    const maxOrder = (rowNode: TreeNode) => {
      const nodes = rowNode.parent?.children
        ? rowNode.parent?.children
        : this.data;
      if (!nodes || nodes.length == 0) return 0;
      return nodes
        .map(x => x.data['order'])
        .reduce(
          (result: number, current: number) =>
            current > result ? current : result,
          0
        );
    };
    const minOrder = (rowNode: TreeNode) => {
      const nodes = rowNode.parent?.children
        ? rowNode.parent?.children
        : this.data;
      if (!nodes || nodes.length == 0) return 0;
      return nodes
        .map(x => x.data['order'])
        .reduce(
          (result: number, current: number) =>
            current < result ? current : result,
          9999
        );
    };

    if (row['order'] > minOrder(rowNode)) {
      items.push({
        label: 'Move Up',
        icon: 'pi pi-fw pi-angle-up',
        command: () => this.moveUp(row)
      });
    }
    if (row['order'] < maxOrder(rowNode)) {
      items.push({
        label: 'Move Down',
        icon: 'pi pi-fw pi-angle-down',
        command: () => this.moveDown(row)
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

  moveUp(row: PortalItemData) {
    this.portalItemService
      .moveUp(row['id'])
      .pipe(
        tap(res => {
          if (res && !res.isError) {
            this.getPortalList();
          }
        })
      )
      .subscribe();
  }

  moveDown(row: PortalItemData) {
    this.portalItemService
      .moveDown(row['id'])
      .pipe(
        tap(res => {
          if (res && !res.isError) {
            this.getPortalList();
          }
        })
      )
      .subscribe();
  }

  onDiaglogSaved() {
    this.getPortalList();
    this.configDataService.menuChange$.next(null);
  }
}
