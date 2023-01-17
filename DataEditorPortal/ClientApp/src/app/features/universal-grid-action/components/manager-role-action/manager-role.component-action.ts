import { Component, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { NotifyService } from 'src/app/core/utils/notify.service';
import {
  GridActionDirective,
  OnGridActionDialogShow
} from '../../directives/grid-action.directive';
import {
  ManageRoleForm,
  RoleList,
  RolePermissions
} from '../../models/role-permisstion';
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
  permissionSelect: RolePermissions[] = [];
  roleId = '';
  roleName = '';
  roleList: RoleList[] = [];

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

  onDialogShow(): void {
    this.rolePermissionService.getRoleList().subscribe(res => {
      this.roleId = res[0].id || '';
      this.roleName = res[0].roleName || '';
      this.initData(res);
      this.roleList = [
        ...res,
        {
          id: res[0].id + ',new',
          roleName: 'Add New Role',
          roleDescription: 'Add new role'
        }
      ];
      this.roleFields = [
        {
          fieldGroupClassName: 'flex flex-wrap justify-content-between',
          fieldGroup: [
            {
              className: 'w-full pb-0',
              key: 'roleId',
              type: 'select',
              defaultValue: res[0].id,
              props: {
                change: () => {
                  this.roleId = this.model.roleId || '';
                  const isNew = this.roleId.split(',')[1];

                  if (isNew === 'new') {
                    this.roleId = this.roleId.split(',')[0];
                  }
                  this.getRolePermissionsList(this.roleId, isNew === 'new');

                  let roleDesc = '';
                  this.roleList.map(res => {
                    if (this.roleId == res.id) {
                      this.roleName = res.roleName || '';
                      roleDesc = res.roleDescription || '';
                    }
                  });
                  this.form.setValue({
                    roleId:
                      isNew === 'new' ? `${this.roleId},new` : this.roleId,
                    roleName: isNew === 'new' ? '' : this.roleName,
                    roleDescription: isNew === 'new' ? '' : roleDesc
                  });
                },

                required: true,
                label: 'Roles',
                placeholder: 'Roles',
                valueProp: 'id',
                labelProp: 'roleName',
                options: this.roleList,
                appendTo: 'body'
              }
            },
            {
              wrappers: ['panel'],
              className: 'w-full',
              templateOptions: { label: 'Input Text' }
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
      this.getRolePermissionsList(this.roleId);
      this.loadedEvent.emit();
    });
  }

  initData(data: RoleList[]) {
    setTimeout(() => {
      this.form.setValue({
        roleId: data[0].id,
        roleName: data[0].roleName,
        roleDescription: data[0].roleDescription
      });
    }, 500);
  }

  getRolePermissionsList(roleId = '', isNew = false) {
    this.rolePermissionService.getRolePermissions(roleId).subscribe(res => {
      this.groupPermissions = this.groupBy(res);
      this.groupPermissions.map((item, i) => {
        this.permissions[i] = item;
      });

      if (isNew) {
        this.permissions.map(res => {
          res.map((item: any) => {
            item.selected = false;
          });
        });
      }
      this.permissions.map((res, i) => {
        this.permissionSelect[i] = res.filter((item: any) => {
          return item.selected;
        });
      });
    });
  }

  onFormSubmit(model: ManageRoleForm) {
    this.permissionSelect = this.permissionSelect.flat(3);
    if (this.form.valid) {
      const apiName =
        this.model.roleId!.split(',')[1] === 'new'
          ? 'createRole'
          : 'updateRole';

      this.permissionSelect.map(res => {
        res.selected = true;
      });
      this.rolePermissionService[apiName]({
        ...model,
        permissions: this.permissionSelect
      }).subscribe(res => {
        if (!res.isError) {
          this.notifyService.notifySuccess('Success', 'Save Success');
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
