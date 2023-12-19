import { Component, Inject, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { NotifyService, SystemLogService } from 'src/app/shared';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { UserPemissions } from '../../models/user-manager';
import { UserManagerService } from '../../services/user-manager.service';

@Component({
  selector: 'app-user-permission-action',
  templateUrl: './user-permission-action.component.html',
  styleUrls: ['./user-permission-action.component.scss']
})
export class UserPermissionActionComponent extends GridActionDirective implements OnInit {
  groupPermissions: any[] = [];
  permissionSelect: UserPemissions[] = [];
  permissions: TreeNode[] = [];
  constructor(
    private userManagerService: UserManagerService,
    private notifyService: NotifyService,
    private systemLogService: SystemLogService,
    @Inject('API_URL') private apiUrl: string
  ) {
    super();
  }

  childrenSelected(node: TreeNode) {
    if (node?.children) {
      node.children.forEach((child: any) => {
        if (child.icon && /^icons\/.*/.test(child.icon)) {
          child.iconStyle = {
            backgroundImage: `url(${this.apiUrl}attachment/${child.icon})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: '1rem',
            height: '1rem'
          };
          child.icon = '';
        }
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
      if (item.icon && /^icons\/.*/.test(item.icon)) {
        item.iconStyle = {
          backgroundImage: `url(${this.apiUrl}attachment/${item.icon})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          width: '1rem',
          height: '1rem'
        };
        item.icon = '';
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

  selectionChange($event: any) {
    this.permissionSelect = $event;
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
    this.systemLogService.addSiteVisitLog({
      action: 'Update User Permissions',
      section: this.userManagerService.section,
      params: JSON.stringify({
        permissionSelect,
        userId: this.selectedRecords[0][this.recordKey]
      })
    });
    this.userManagerService
      .saveUserPermissions(permissionSelect, this.selectedRecords[0][this.recordKey])
      .subscribe(res => {
        if (res.code === 200) {
          this.notifyService.notifySuccess('Success', 'Permissions saved successfully');
          this.savedEvent.emit();
        } else {
          this.errorEvent.emit();
        }
      });
  }
}
