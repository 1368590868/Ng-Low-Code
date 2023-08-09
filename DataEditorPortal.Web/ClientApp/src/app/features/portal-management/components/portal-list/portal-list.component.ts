import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MenuItem, TreeNode } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { Menu } from 'primeng/menu';
import { EMPTY, catchError, tap } from 'rxjs';
import { ConfigDataService, NotifyService } from 'src/app/shared';
import { PortalItem, PortalItemData } from '../../models/portal-item';
import { PortalItemService } from '../../services/portal-item.service';
import { CustomActionsComponent } from '../custom-actions/custom-actions.component';
import { AddPortalDialogComponent } from './add-portal-dialog/add-portal-dialog.component';

@Component({
  selector: 'app-portal-list',
  templateUrl: './portal-list.component.html',
  styleUrls: ['./portal-list.component.scss'],
  providers: [ConfirmationService]
})
export class PortalListComponent implements OnInit {
  data: PortalItem[] = [];
  addNewMenuModels: MenuItem[] = [
    {
      label: 'Create Folder',
      icon: 'pi pi-fw pi-folder',
      command: () => {
        this.addDialog.header = 'Create Folder';
        this.addDialog.okText = 'Create Folder';
        this.addDialog.model = { type: 'Folder', parentId: null };
        this.addDialog.showDialog();
      }
    },

    {
      label: 'Create External Link',
      icon: 'pi pi-fw pi-external-link',
      command: () => {
        this.addDialog.header = 'Create External Link';
        this.addDialog.okText = 'Create';
        this.addDialog.model = { type: 'External' };
        this.addDialog.showDialog();
      }
    },

    {
      label: 'Create Table Page',
      icon: 'pi pi-fw pi-table',
      command: () => {
        this.portalItemService.parentFolder = undefined;
        this.router.navigate([`../add-single`], {
          relativeTo: this.activatedRoute
        });
      }
    },
    {
      label: 'Create Linked Table Page',
      icon: 'pi pi-fw pi-sitemap',
      command: () => {
        this.portalItemService.parentFolder = undefined;
        this.router.navigate([`../add-linked`], {
          relativeTo: this.activatedRoute
        });
      }
    }
  ];

  contextMenuItems: MenuItem[] = [];

  @ViewChild('addDialog') addDialog!: AddPortalDialogComponent;
  @ViewChild('cm') contextMenu!: ContextMenu;
  @ViewChild('customActions') customActions!: CustomActionsComponent;
  @ViewChildren(Menu) menu!: Menu[];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private portalItemService: PortalItemService,
    private notifyService: NotifyService,
    private configDataService: ConfigDataService,
    private confirmationService: ConfirmationService
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
    this.menu.forEach(res => {
      res.hide();
    });
    this.contextMenuItems = this.getMenuList(event.node);
    setTimeout(() => {
      this.contextMenu.show(event.originalEvent);
    }, 0);
  }

  getMenuList(rowNode: TreeNode) {
    const row = rowNode.data as PortalItemData;
    const items: MenuItem[] = [];
    if (row['type'] === 'Portal Item') {
      const editLabel =
        row['itemType'] == 'linked'
          ? 'Edit Linked Table Page'
          : 'Edit Table Page';
      items.push({
        label: row['configCompleted'] ? editLabel : 'Continue Editing',
        icon: 'pi pi-fw pi-pencil',
        command: () => {
          const editRoute =
            row['itemType'] == 'linked' ? 'edit-linked' : 'edit-single';
          this.router.navigate([`../${editRoute}/${row['id']}`], {
            relativeTo: this.activatedRoute
          });
        }
      });
    } else if (row['type'] === 'System' || row['type'] === 'External') {
      items.push({
        label: 'Edit',
        icon: 'pi pi-fw pi-pencil',
        command: () => {
          // edit folder
          let siteGroupIds;
          if (row['siteGroups']) {
            siteGroupIds = row['siteGroups'].map((x: any) => x.id);
          }
          const { siteGroups, ...rest } = row;
          this.addDialog.header = 'Update details';
          this.addDialog.okText = 'Update';
          this.addDialog.model = { ...rest, siteGroupIds };
          this.addDialog.showDialog();
        }
      });
    } else {
      items.push({
        label: 'New Table page',
        icon: 'pi pi-fw pi-desktop',
        command: () => {
          // new portal item
          this.portalItemService.parentFolder = row['id'];
          this.router.navigate([`../add-single`], {
            relativeTo: this.activatedRoute
          });
        }
      });

      items.push({
        label: 'New Linked Table Page',
        icon: 'pi pi-fw pi-server',
        command: () => {
          // new portal item
          this.portalItemService.parentFolder = row['id'];
          this.router.navigate([`../add-linked`], {
            relativeTo: this.activatedRoute
          });
        }
      });

      items.push({
        label: 'New External Link',
        icon: 'pi pi-fw pi-external-link',
        command: () => {
          this.addDialog.header = 'Create External Link';
          this.addDialog.okText = 'Create';
          this.addDialog.model = { type: 'External', parentId: row['id'] };
          this.addDialog.showDialog();
        }
      });

      items.push({
        label: 'New Folder',
        icon: 'pi pi-fw pi-folder',
        command: () => {
          this.addDialog.header = 'New Folder';
          this.addDialog.okText = 'New Folder';
          this.addDialog.model = {
            type: 'Folder',
            parentId: row['id'] ?? '<root>'
          };
          this.addDialog.showDialog();
        }
      });

      items.push({
        separator: true
      });

      items.push({
        label: 'Edit Folder',
        icon: 'pi pi-fw pi-pencil',
        command: () => {
          // edit folder
          let siteGroupIds;
          if (row['siteGroups']) {
            siteGroupIds = row['siteGroups'].map((x: any) => x.id);
          }
          const { siteGroups, ...rest } = row;
          this.addDialog.header = 'Update Folder details';
          this.addDialog.okText = 'Update Folder';
          this.addDialog.model = {
            ...rest,
            siteGroupIds,
            parentId: row['parentId'] ?? '<root>'
          };
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

    // Portal Item Actions
    if (row['type'] === 'Portal Item') {
      items.push({
        separator: true
      });
      items.push({
        label: 'Export',
        icon: 'pi pi-fw pi-file-export',
        command: () => this.export(row)
      });
      items.push({
        label: 'Copy',
        icon: 'pi pi-fw pi-copy',
        command: () => this.copy(row)
      });
      if (row['configCompleted'] && row['itemType'] !== 'linked') {
        items.push({
          label: 'Config Actions',
          icon: 'pi pi-fw pi-th-large',
          command: () => {
            this.customActions.portalItemId = row['id'];
            this.customActions.showDialog();
          }
        });
      }
    }

    const hasChildren = rowNode.children && rowNode.children.length > 0;
    if (
      row['type'] !== 'System' &&
      (row['type'] === 'Portal Item' || !hasChildren)
    ) {
      items.push({
        separator: true
      });
      items.push({
        label: 'Delete',
        icon: 'pi pi-fw pi-trash',
        command: () => this.delete(row)
      });
    }

    return items;
  }

  getPortalList() {
    this.portalItemService
      .getPortalList()
      .pipe(
        tap(res => {
          res.forEach(x => {
            const exist = this.data.find(
              m => m.data?.['id'] === x.data?.['id']
            );
            if (exist) x.expanded = exist.expanded;
            else x.expanded = false;
          });
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
          if (res && res.code === 200) {
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
          if (res && res.code === 200) {
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
          if (res && res.code === 200) {
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
          if (res && res.code === 200) {
            this.getPortalList();
          }
        })
      )
      .subscribe();
  }

  copy(row: PortalItemData) {
    this.portalItemService.copyPortalItem(row['id']).subscribe(res => {
      if (res && res.code === 200) {
        this.notifyService.notifySuccess(
          'Success',
          'Copy Successfully Completed.'
        );
        this.getPortalList();
      }
    });
  }

  export(row: PortalItemData) {
    this.portalItemService
      .export(row['id'])
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        tap(result => {
          const url = window.URL.createObjectURL(result);
          const a = document.createElement('a');
          a.href = url;
          const fileName = `Export-${row['name']}-${new Date()
            .toLocaleString('en-US')
            .replace(/[^0-9APM]/g, '_')
            .replace(/(.)\1+/g, '$1')}.zip`;
          a.download = fileName;
          a.click();
          a.remove();
        })
      )
      .subscribe();
  }

  delete(row: PortalItemData) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this item?',
      accept: () => {
        const deleteMethod =
          row['type'] === 'Portal Item' ? 'deletePortalItem' : 'deleteMenuItem';
        this.portalItemService[deleteMethod](row['id'])
          .pipe(
            tap(res => {
              if (res && res.code === 200) {
                this.getPortalList();
              }
            })
          )
          .subscribe();
      }
    });
  }

  onDiaglogSaved() {
    this.getPortalList();
    this.configDataService.menuChange$.next(null);
  }

  onImportDialogSaved() {
    this.getPortalList();
  }
}
