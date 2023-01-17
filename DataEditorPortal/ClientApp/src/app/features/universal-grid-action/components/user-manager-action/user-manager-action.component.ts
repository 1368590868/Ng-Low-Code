import { Component, Input, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { tap } from 'rxjs';
import { NotifyService } from 'src/app/core/utils/notify.service';
import {
  GridActionDirective,
  OnGridActionDialogShow
} from '../../directives/grid-action.directive';
import { Permisstion } from '../../models/role-permisstion';
import { ManageRoleForm, UserManagerForm } from '../../models/user-manager';
import { RolePermissionService } from '../../services/role-permission/role-permission.service';
import { UserManagerService } from '../../services/user-manager-services/user-manager.service';

@Component({
  selector: 'app-user-manager-action',
  templateUrl: './user-manager-action.component.html',
  styleUrls: ['./user-manager-action.component.scss']
})
export class UserManagerActionComponent
  extends GridActionDirective
  implements OnGridActionDialogShow
{
  @ViewChild('editForm') editForm!: NgForm;
  @Input() isAddForm = false;

  form = new FormGroup({});
  model: ManageRoleForm = {};
  options: FormlyFormOptions = {};

  roleVisible = false;
  permissionVisible = false;
  isLoading = false;
  isPermissionLoading = false;
  permisstionSelect = [];
  rolesArr = [
    { key: '', checked: true, label: 'Admin', value: 'Admin' },
    { key: '', checked: false, label: 'User', value: 'User' },
    { key: '', checked: false, label: 'Guest', value: 'Guest' }
  ];

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

  fields: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'flex flex-wrap justify-content-between',
      fieldGroup: [
        {
          className: 'w-6',
          key: 'username',
          type: 'input',
          props: {
            required: true,
            type: 'text',
            label: 'CNP ID',
            placeholder: 'CNP ID'
          }
        },
        {
          className: 'w-6 pl-2',
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
          className: 'w-6',
          key: 'email',
          type: 'input',
          props: {
            required: true,
            type: 'text',
            label: 'Email',
            placeholder: 'Email'
          }
        },
        {
          className: 'w-6 pl-2',
          key: 'phone',
          type: 'inputMask',
          props: {
            required: true,
            type: 'text',
            mask: '(999) 999-9999',
            label: 'Phone',
            placeholder: 'Phone'
          }
        }
      ]
    },
    {
      fieldGroupClassName: 'flex flex-warp justify-between w-full ',
      fieldGroup: [
        {
          className: 'w-6 ',
          key: 'vendor',
          type: 'select',
          props: {
            label: 'Vendor',
            placeholder: 'Please select',
            options: [
              {
                value: '1',
                label: 'Option 1'
              },
              {
                value: '2',
                label: 'Option 2'
              },
              {
                value: '3',
                label: 'Option 3'
              },
              {
                value: '4',
                label: 'Option 4'
              }
            ],
            appendTo: 'body'
          }
        },
        {
          className: 'w-6 ml-2',
          key: 'employer',
          type: 'select',
          props: {
            label: 'Employer',
            placeholder: 'Please select',
            options: [
              {
                value: '1',
                label: 'Option 1'
              },
              {
                value: '2',
                label: 'Option 2'
              },
              {
                value: '3',
                label: 'Option 3'
              },
              {
                value: '4',
                label: 'Option 4'
              }
            ],
            appendTo: 'body'
          }
        }
      ]
    },
    {
      fieldGroupClassName: 'flex flex-warp justify-content-between w-full ',
      fieldGroup: [
        {
          className: 'w-full',

          key: 'division',
          type: 'checkboxList',
          props: {
            label: 'Division(s)',
            options: [
              {
                value: 'Gas',
                label: 'Gas'
              },
              {
                value: 'ELECTRIC',
                label: 'Electric'
              },
              {
                value: 'LANDBASE',
                label: 'Landbase'
              },
              {
                value: 'UNDERGROUND',
                label: 'Underground'
              }
            ]
          }
        }
      ]
    },
    {
      fieldGroup: [
        {
          key: 'autoEmail',
          type: 'checkbox',
          props: {
            label: 'Notify',
            binary: true,
            required: true,
            options: [
              {
                value: 'Notify',
                label: 'Notify'
              }
            ]
          }
        }
      ]
    }
  ];

  constructor(
    private userManagerService: UserManagerService,
    private rolePermisstionService: RolePermissionService,
    private notifyService: NotifyService
  ) {
    super();
  }

  onDialogShow(): void {
    if (!this.isAddForm) {
      this.userManagerService
        .getUserDetail(this.selectedRecords[0][this.recordKey])
        .subscribe(res => {
          this.form.setValue({
            name: res.name,
            username: res.username,
            email: res.email,
            phone: res.phone,
            vendor: res.vendor,
            employer: res.employer,
            autoEmail: res.autoEmail,
            division: JSON.parse(res.division)
          });
          this.loadedEvent.emit();
        });
    } else {
      this.loadedEvent.emit();
    }
  }

  onFormSubmit(model: ManageRoleForm) {
    if (this.form.valid) {
      const apiName = this.isAddForm ? 'createUser' : 'updateUser';

      this.userManagerService[apiName]({
        ...model,
        id: this.selectedRecords[0][this.recordKey]
      }).subscribe(res => {
        if (!res.isError && res.result) {
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
  /**
   * Role dialog functions
   */
  onRoleShow(): void {
    this.rolePermisstionService
      .getRoles()
      .pipe(
        tap(result => {
          this.rolesArr = result;
        })
      )
      .subscribe();
  }
  onRoleHide(): void {
    console.log('hide');
  }

  onRoleCancel(): void {
    this.roleVisible = false;
  }

  onRoleOk(): void {
    this.isLoading = true;
    this.rolePermisstionService.saveRoles(this.rolesArr).subscribe(res => {
      if (res.isError) {
        this.notifyService.notifySuccess('Success', 'Save Success');
        this.roleVisible = false;
      }
      this.isLoading = false;
    });
  }

  /**
   * permission dialog functions
   */
  onPermisstionShow(): void {
    this.rolePermisstionService.getPermissions().subscribe(res => {
      this.permissions = res;
    });
  }
  onPermissionCancel(): void {
    this.permissionVisible = false;
  }

  onPermisstionOk(): void {
    this.isPermissionLoading = true;
    console.log(this.permisstionSelect);
    this.rolePermisstionService
      .savePermissions(this.permisstionSelect)
      .subscribe(res => {
        if (res.isError) {
          this.notifyService.notifySuccess('Success', 'Save Success');
          this.permissionVisible = false;
        }
        this.isPermissionLoading = false;
      });
  }
}
