import { Component, ViewChild } from '@angular/core';
import { NgForm, FormGroup, AbstractControl } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { MenuItem } from 'primeng/api';
import { ManageRoleForm } from 'src/app/features/universal-grid-action/models/user-manager';
import { NotifyService, ConfigDataService, UserService } from 'src/app/shared';

@Component({
  selector: 'app-personal-dialog',
  templateUrl: './personal-dialog.component.html',
  styleUrls: ['./personal-dialog.component.scss']
})
export class PersonalDialogComponent {
  @ViewChild('editForm') editForm!: NgForm;
  items!: MenuItem[];
  visible = false;
  form = new FormGroup({});
  model = {};
  userId = '';
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'flex flex-wrap justify-content-between',
      fieldGroup: [
        {
          className: 'w-6',
          key: 'username',
          type: 'input',
          props: {
            disabled: true,
            required: true,
            type: 'text',
            label: 'CNP ID',
            placeholder: 'CNP ID'
          },
          modelOptions: {
            updateOn: 'blur'
          },
          asyncValidators: {
            exist: {
              expression: (control: AbstractControl) => {
                return new Promise((resolve, reject) => {
                  this.userService
                    .userNameExists(control.value, this.userService.USER.id)
                    .subscribe(res =>
                      !res.isError ? resolve(!res.result) : reject(res.message)
                    );
                });
              },
              message: () => {
                return 'The  CNP ID has already been exist.';
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
                    .emailExists(control.value, this.userService.USER.id)
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
    public configDataService: ConfigDataService,
    public userService: UserService,
    private notifyService: NotifyService
  ) {
    this.items = [
      {
        label: 'Home',
        routerLink: ['/']
      },
      {
        label: 'About',
        routerLink: ['/about']
      },
      {
        label: 'Contact',
        routerLink: ['/contact']
      }
    ];
  }

  onpenDialog() {
    this.userService
      .getUserDetail(this.userService.USER.id || '')
      .subscribe(res => {
        this.form.setValue({
          name: res.name,
          username: res.username,
          email: res.email,
          phone: res.phone,
          vendor: res.vendor,
          employer: res.employer,
          autoEmail: res.autoEmail,
          division: res.division !== 'NONE' ? JSON.parse(res.division) : []
        });
      });
    this.visible = true;
  }
  onFormSubmit(model: ManageRoleForm) {
    if (this.form.valid) {
      this.userService
        .updateUser({
          ...model,
          id: this.userService.USER.id
        })
        .subscribe(res => {
          if (!res.isError && res.result) {
            this.notifyService.notifySuccess(
              'Success',
              'Save Successfully Completed.'
            );
            this.visible = false;
          }
        });
    }
  }
  onCancel() {
    this.options.resetModel?.();
    this.visible = false;
  }
  onOk() {
    this.editForm.onSubmit(new Event('submit'));
  }
}
