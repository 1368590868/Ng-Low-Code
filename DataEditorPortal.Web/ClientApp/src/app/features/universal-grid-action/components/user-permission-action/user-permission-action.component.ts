import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { NotifyService } from 'src/app/shared';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { UserPemissions } from '../../models/user-manager';
import { UserManagerService } from '../../services/user-manager.service';

@Component({
  selector: 'app-user-permission-action',
  templateUrl: './user-permission-action.component.html',
  styleUrls: ['./user-permission-action.component.scss']
})
export class UserPermissionActionComponent
  extends GridActionDirective
  implements OnInit
{
  groupPermissions: any[] = [];
  permissionSelect: UserPemissions[] = [];
  permissions: TreeNode[] = [];
  constructor(
    private userManagerService: UserManagerService,
    private notifyService: NotifyService
  ) {
    super();
  }

  childrenSelected(node: TreeNode) {
    if (node?.children) {
      node.children.forEach((child: any) => {
        if (child.selected) {
          this.permissionSelect.push(child);
        }
        if (Array.isArray(node?.children)) {
          this.childrenSelected(child);
        }
      });
    }
  }

  initData(data: TreeNode[]) {
    this.permissions = data;
    data.forEach((item: any) => {
      if (item.selected) {
        this.permissionSelect.push(item);
      }

      this.childrenSelected(item);
    });
  }

  getPermissionsList(id = '') {
    this.userManagerService.getUserPermissions(id).subscribe(res => {
      this.initData(res);
      this.loadedEvent.emit();
    });
  }

  // dialog function

  ngOnInit(): void {
    this.getPermissionsList(this.selectedRecords[0][this.recordKey]);
  }

  onSave(): void {
    const permissionSelect = this.permissionSelect
      .filter((x: any) => !x.type)
      .map((res: any) => {
        return {
          id: res.key,
          selected: true,
          permissionName: res.label,
          permissionDescription: res.description
        };
      });
    this.userManagerService
      .saveUserPermissions(
        permissionSelect,
        this.selectedRecords[0][this.recordKey]
      )
      .subscribe(res => {
        if (!res?.isError) {
          this.notifyService.notifySuccess(
            'Success',
            'Permissions saved successfully'
          );
          this.savedEvent.emit();
        } else {
          this.errorEvent.emit();
        }
      });
  }
}