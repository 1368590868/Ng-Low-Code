import { Component, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { NotifyService } from 'src/app/core/utils/notify.service';
import {
  GridActionDirective,
  OnGridActionDialogShow
} from '../../directives/grid-action.directive';
import { ManageRoleForm, RolePermissions } from '../../models/role-permisstion';
import { RolePermissionService } from '../../services/role-permission/role-permission.service';

@Component({
  selector: 'app-manager-role',
  templateUrl: './manager-role-action.component.html',
  styleUrls: ['./manager-role-action.component.scss']
})
export class ManagerRoleComponent
  extends GridActionDirective
  implements OnGridActionDialogShow
{
  @ViewChild('editForm') editForm!: NgForm;
  form = new FormGroup({});
  model: ManageRoleForm = {};
  options: FormlyFormOptions = {};
  // Role form config
  roleFields: FormlyFieldConfig[] = [];
  permisstionSelect: RolePermissions[] = [];
  roleId = '';

  permissions: any[] = [];
  constructor(
    private notifyService: NotifyService,
    private rolePermissionService: RolePermissionService
  ) {
    super();
    this.permissions = [];
  }

  onDialogShow(): void {
    console.log('show dialog');
    this.rolePermissionService.getRoleList().subscribe(res => {
      this.roleId = res[0].id || '';
      this.roleFields = [
        {
          fieldGroupClassName: 'flex flex-wrap justify-content-between',
          fieldGroup: [
            {
              className: 'w-full',
              key: 'roleName',
              type: 'select',
              defaultValue: res[0].id,
              props: {
                change: () => {
                  this.roleId = this.model.roleName || '';
                  this.getRolePermissionsList(this.roleId);
                },

                required: true,
                label: 'Roles',
                placeholder: 'Roles',
                valueProp: 'id',
                labelProp: 'roleName',
                options: res,
                appendTo: 'body'
              }
            },
            {
              className: 'w-full',
              key: 'name',
              type: 'input',
              props: {
                required: true,
                type: 'text',
                label: 'Name',
                placeholder: 'Name'
              }
            },
            {
              className: 'w-full',
              key: 'Description',
              type: 'textarea',
              props: {
                required: true,
                type: 'text',
                label: 'Description',
                placeholder: 'Description'
              }
            }
          ]
        }
      ];
      this.getRolePermissionsList(this.roleId);
      this.loadedEvent.emit();
    });
  }

  getRolePermissionsList(roleId = '') {
    this.rolePermissionService.getRolePermissions(roleId).subscribe(res => {
      this.permissions = res;
      this.permisstionSelect = this.permissions.filter(res => res.selected);
    });
  }

  onFormSubmit(model: ManageRoleForm) {
    console.log({ ...model, permissions: this.permisstionSelect });
    if (this.form.valid) {
      setTimeout(() => {
        this.notifyService.notifySuccess('Success', 'Save Success');
        this.savedEvent.emit();
      }, 1000);
    } else {
      this.errorEvent.emit();
    }
  }

  onSave(): void {
    this.editForm.onSubmit(new Event('submit'));
  }

  onCancel(): void {
    this.options.resetModel?.();
  }
}
