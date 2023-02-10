import { Component, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { NotifyService } from 'src/app/shared';
import { GridActionDirective } from '../../directives/grid-action.directive';
import {
  ManageRoleForm,
  RoleItem,
  RolePermissions
} from '../../models/role-permisstion';
import { RolePermissionService } from '../../services/role-permission.service';

@Component({
  selector: 'app-manage-action-role',
  templateUrl: './manage-role-action.component.html',
  styleUrls: ['./manage-role-action.component.scss']
})
export class ManageRoleActionComponent extends GridActionDirective {
  @ViewChild('editForm') editForm!: NgForm;
  form = new FormGroup({});
  model: ManageRoleForm = {};
  options: FormlyFormOptions = {};
  // Role form config
  roleList: RoleItem[] = [];
  roleFields: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'flex flex-wrap justify-content-between',
      fieldGroup: [
        {
          className: 'w-full pb-0',
          key: 'roleId',
          type: 'select',

          props: {
            change: () => {
              this.roleId = this.model.roleId || '';

              this.getRolePermissionsList(
                this.roleId === '<new_role>' ? undefined : this.roleId
              );

              const role = this.roleList.find(x => this.roleId == x.id);
              if (role) {
                this.setFormValue(role);
              }
            },
            required: true,
            label: 'Roles',
            placeholder: 'Roles',
            valueProp: 'id',
            labelProp: 'roleName',
            appendTo: 'body'
          },
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              this.rolePermissionService.getRoleList().subscribe(res => {
                if (field.props) {
                  this.roleList = [
                    ...res,
                    {
                      id: '<new_role>',
                      roleName: '...',
                      roleDescription: ''
                    }
                  ];
                  field.props.options = this.roleList;

                  if (res.length > 0) {
                    this.setFormValue(res[0]);
                    this.getRolePermissionsList(res[0].id);
                  }
                  this.loadedEvent.emit();
                }
              });
            }
          }
        },
        {
          wrappers: ['divider'],
          className: 'w-full',
          props: {
            label: 'Role Details'
          },
          expressions: {
            'props.label': `model.roleId === '<new_role>' ? 'Add New Role' : 'Role Details'`
          }
        },
        {
          className: 'w-full',
          key: 'roleName',
          type: 'input',
          props: {
            required: true,
            type: 'text',
            label: 'Name',
            placeholder: 'Name'
          },
          expressions: {
            'props.disabled': `model.roleName === 'Users'`
          }
        },
        {
          className: 'w-full',
          key: 'roleDescription',
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
  permissionSelect: RolePermissions[] = [];
  roleId = '';
  roleName = '';

  permissions: any[] = [];
  groupPermissions: any[] = [];
  constructor(
    private notifyService: NotifyService,
    private rolePermissionService: RolePermissionService
  ) {
    super();
  }

  groupBy(objectArray: any[]) {
    const map = new Map();
    objectArray.forEach((item, _, arr) => {
      if (!map.has(item.category)) {
        map.set(
          item.category,
          arr.filter(a => a.category == item.category)
        );
      }
    });
    return Array.from(map).map(item => [...item[1]]);
  }

  setFormValue(role: RoleItem) {
    this.roleId = role.id || '';
    this.roleName = role.id === '<new_role>' ? '' : role.roleName || '';

    this.form.setValue({
      roleId: role.id,
      roleName: this.roleName,
      roleDescription: role.id === '<new_role>' ? '' : role.roleDescription
    });
  }

  setPermissions(res: RolePermissions[]) {
    this.groupPermissions = this.groupBy(res);
    this.groupPermissions.forEach((item, i) => {
      this.permissions[i] = item;
      this.permissionSelect[i] = item.filter((item: any) => {
        return item.selected;
      });
    });
  }

  getRolePermissionsList(roleId: any) {
    if (roleId) {
      this.rolePermissionService.getRolePermissions(roleId).subscribe(res => {
        this.setPermissions(res);
      });
    } else {
      this.rolePermissionService.getSitePermissions().subscribe(res => {
        this.setPermissions(res);
      });
    }
  }

  onFormSubmit(model: ManageRoleForm) {
    this.permissionSelect = this.permissionSelect.flat(3).map(res => {
      res.selected = true;
      return res;
    });
    if (this.form.valid) {
      const apiName =
        this.model.roleId === '<new_role>' ? 'createRole' : 'updateRole';
      this.rolePermissionService[apiName]({
        ...model,
        permissions: this.permissionSelect
      }).subscribe(res => {
        if (!res.isError) {
          this.notifyService.notifySuccess(
            'Success',
            'Save Successfully Completed.'
          );
          this.savedEvent.emit();
        } else {
          this.errorEvent.emit();
        }
      });
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
