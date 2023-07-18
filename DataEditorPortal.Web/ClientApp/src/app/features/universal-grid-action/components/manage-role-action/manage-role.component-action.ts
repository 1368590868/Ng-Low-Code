import { Component, Inject, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { TreeNode } from 'primeng/api';
import { NotifyService, SystemLogService } from 'src/app/shared';
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
              this.permissionSelect = [];

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
                      roleName: '<New Role>',
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
            'props.disabled': `model.roleName === 'Users' || model.roleName === 'Administrators' `
          }
        },
        {
          className: 'w-full',
          key: 'roleDescription',
          type: 'textarea',
          props: {
            type: 'text',
            label: 'Description',
            placeholder: 'Description'
          }
        }
      ]
    }
  ];
  permissionSelect: TreeNode[] = [];
  roleId = '';
  roleName = '';

  permissions: TreeNode[] = [];
  constructor(
    private notifyService: NotifyService,
    private rolePermissionService: RolePermissionService,
    private systemLogService: SystemLogService,
    @Inject('API_URL') private apiUrl: string
  ) {
    super();
  }

  setFormValue(role: RoleItem) {
    this.roleId = role.id || '';
    this.roleName = role.id === '<new_role>' ? '' : role.roleName || '';

    this.form.setValue({
      roleId: role.id,
      roleName: this.roleName,
      roleDescription:
        role.id === '<new_role>' ? '' : role?.roleDescription ?? ''
    });
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

  getRolePermissionsList(roleId: string | undefined) {
    if (roleId) {
      this.rolePermissionService.getRolePermissions(roleId).subscribe(res => {
        this.initData(res);
      });
    } else {
      this.rolePermissionService.getSitePermissions().subscribe(res => {
        this.initData(res);
      });
    }
  }

  onFormSubmit(model: ManageRoleForm) {
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
    if (this.form.valid) {
      const apiName =
        this.model.roleId === '<new_role>' ? 'createRole' : 'updateRole';
      this.systemLogService.addSiteVisitLog({
        action: this.model.roleId === '<new_role>' ? 'Add Role' : 'Update Role',
        section: this.rolePermissionService.section,
        params: JSON.stringify({
          ...model,
          permissions: permissionSelect as RolePermissions[]
        })
      });
      this.rolePermissionService[apiName]({
        ...model,
        permissions: permissionSelect as RolePermissions[]
      }).subscribe(res => {
        if (res.code === 200) {
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
