import { Component } from '@angular/core';
import { NotifyService } from 'src/app/core/utils/notify.service';
import {
  GridActionDirective,
  OnGridActionDialogShow
} from '../../directives/grid-action.directive';
import { Permisstion } from '../../models/role-permisstion';
import { RolePermissionService } from '../../services/role-permission/role-permission.service';

@Component({
  selector: 'app-user-permission',
  templateUrl: './user-permission.component.html',
  styleUrls: ['./user-permission.component.scss']
})
export class UserPermissionComponent
  extends GridActionDirective
  implements OnGridActionDialogShow
{
  isPermissionLoading = false;
  permisstionSelect = [];
  permissions: Permisstion[] = [
    {
      id: 1,
      name: 'Permission 1',
      desc: 'Description 1'
    },
    {
      id: 2,
      name: 'Permission 2',
      desc: 'Description 2 '
    }
  ];
  constructor(
    private rolePermisstionService: RolePermissionService,
    private notifyService: NotifyService
  ) {
    super();
  }

  onDialogShow(): void {
    this.rolePermisstionService.getPermissions().subscribe(res => {
      this.permissions = res;
      this.loadedEvent.emit();
    });
  }

  onSave(): void {
    this.isPermissionLoading = true;
    this.rolePermisstionService
      .savePermissions(this.permisstionSelect)
      .subscribe(res => {
        if (res.isError) {
          this.notifyService.notifySuccess('Success', 'Save Success');
          this.savedEvent.emit();
        } else {
          this.errorEvent.emit();
        }
      });
  }

  onCancel(): void {
    console.log('cancel');
  }
}
