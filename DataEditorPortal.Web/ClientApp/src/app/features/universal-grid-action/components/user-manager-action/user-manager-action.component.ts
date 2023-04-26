import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { Subject } from 'rxjs';
import {
  NgxFormlyService,
  NotifyService,
  SystemLogService,
  UserService
} from 'src/app/shared';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { ManageRoleForm } from '../../models/user-manager';
import { UserManagerService } from '../../services/user-manager.service';

@Component({
  selector: 'app-user-manager-action',
  templateUrl: './user-manager-action.component.html',
  styleUrls: ['./user-manager-action.component.scss']
})
export class UserManagerActionComponent
  extends GridActionDirective
  implements OnInit
{
  @ViewChild('editForm') editForm!: NgForm;
  @Input() isAddForm = false;
  $destory = new Subject<void>();

  form = new FormGroup({});
  model: ManageRoleForm = {};
  options: FormlyFormOptions = {
    formState: {
      isAddForm: this.isAddForm
    }
  };
  fields: FormlyFieldConfig[] = [
    {
      fieldGroup: [
        {
          className: 'w-6',
          key: 'username',
          type: 'input',
          props: {
            required: true,
            type: 'text',
            label: 'User ID',
            placeholder: 'User ID'
          },
          expressions: {
            'props.disabled': 'formState.isAddForm'
          },
          modelOptions: {
            updateOn: 'blur'
          },
          asyncValidators: {
            exist: {
              expression: (control: AbstractControl) => {
                return new Promise((resolve, reject) => {
                  this.userService
                    .userNameExists(
                      control.value,
                      this.isAddForm
                        ? ''
                        : this.selectedRecords[0][this.recordKey]
                    )
                    .subscribe(res =>
                      !res.isError ? resolve(!res.result) : reject(res.message)
                    );
                });
              },
              message: () => {
                return 'The User ID has already been exist.';
              }
            }
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
          },
          modelOptions: {
            updateOn: 'blur'
          },
          asyncValidators: {
            emailFormat: {
              expression: (control: AbstractControl) => {
                return new Promise((resolve, reject) => {
                  const emailRegex =
                    /^([a-zA-Z\d][\w-]{2,})@(\w{2,})\.([a-z]{2,})(\.[a-z]{2,})?$/;
                  resolve(emailRegex.test(control.value));
                });
              },
              message: () => {
                return 'Email format error.';
              }
            },
            emailExist: {
              expression: (control: AbstractControl) => {
                return new Promise((resolve, reject) => {
                  this.userService
                    .emailExists(
                      control.value,
                      this.isAddForm
                        ? ''
                        : this.selectedRecords[0][this.recordKey]
                    )
                    .subscribe(res =>
                      !res.isError ? resolve(!res.result) : reject(res.message)
                    );
                });
              },
              message: () => {
                return 'The  Email has already been exist.';
              }
            }
          }
        },
        {
          className: 'w-6 pl-2',
          key: 'phone',
          type: 'inputMask',
          defaultValue: '',
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
      fieldGroup: [
        {
          className: 'w-6',
          key: 'vendor',
          type: 'select',
          defaultValue: null,
          props: {
            label: 'Vendor',
            placeholder: 'Please select',
            optionsLookup: {
              id: 'E1F3E2C7-25CA-4D69-9405-ABC54923864D'
            },
            options: []
          },
          hooks: {
            onInit: this.ngxFormlyService.getFieldLookupOnInit(this.$destory)
          }
        },
        {
          className: 'w-6',
          key: 'employer',
          type: 'select',
          defaultValue: null,
          props: {
            label: 'Employer',
            placeholder: 'Please select',
            optionsLookup: {
              id: '8BE7B1D6-F09A-4EEE-B8EC-4DFCF689005B',
              deps: ['vendor']
            },
            options: []
          },
          hooks: {
            onInit: this.ngxFormlyService.getFieldLookupOnInit(this.$destory)
          }
        }
      ]
    },
    {
      fieldGroup: [
        {
          key: 'autoEmail',
          type: 'checkbox',
          defaultValue: true,
          props: {
            label: 'Receive Email Notifycations',
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
    },
    {
      wrappers: ['divider'],
      props: {
        label: 'Roles'
      },
      hide: true
    },
    {
      wrappers: ['chip'],
      props: {
        forArray: []
      },
      expressions: {
        hide: () => {
          this.isAddForm;
        }
      },
      hooks: {
        onInit: field => {
          if (!this.isAddForm) {
            this.userManagerService
              .getUserRole(this.selectedRecords[0][this.recordKey])
              .subscribe(res => {
                const roles = res.filter(item => {
                  item.label = item.roleName;
                  return item.selected;
                });

                if (field.props) field.props['forArray'] = roles;
                if (field.parent?.fieldGroup) {
                  field.parent.fieldGroup[3].hide = roles.length === 0;
                }
              });
          }
        }
      }
    },
    {
      wrappers: ['divider'],
      props: {
        label: 'Permissions'
      },
      hide: true
    },
    {
      wrappers: ['chip'],
      props: {
        forArray: []
      },
      expressions: {
        hide: () => this.isAddForm
      },
      hooks: {
        onInit: field => {
          if (!this.isAddForm) {
            this.userManagerService
              .getUserPermissions(this.selectedRecords[0][this.recordKey])
              .subscribe(res => {
                const permissions = res.filter(item => {
                  item.label = item.permissionName;
                  return item.selected;
                });

                if (field.props) field.props['forArray'] = permissions;
                if (field.parent?.fieldGroup) {
                  field.parent.fieldGroup[5].hide = permissions.length === 0;
                }
              });
          }
        }
      }
    }
  ];

  constructor(
    private userManagerService: UserManagerService,
    private notifyService: NotifyService,
    private userService: UserService,
    private ngxFormlyService: NgxFormlyService,
    private systemLogService: SystemLogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.options.formState = {
      isAddForm: !this.isAddForm
    };
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
            autoEmail: res.autoEmail
          });
        });
    }
    this.loadedEvent.emit();
  }

  onFormSubmit(model: ManageRoleForm) {
    if (this.form.valid) {
      const apiName = this.isAddForm ? 'createUser' : 'updateUser';
      this.systemLogService.addSiteVisitLog({
        action: this.isAddForm ? 'Add User' : 'Update User',
        section: this.userManagerService.section,
        params: JSON.stringify(model)
      });
      this.userManagerService[apiName](
        this.isAddForm
          ? model
          : {
              ...model,
              id: this.selectedRecords[0][this.recordKey]
            }
      ).subscribe(res => {
        if (!res.isError && res.result) {
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
    this.$destory.next();
    this.options.resetModel?.();
  }
}
