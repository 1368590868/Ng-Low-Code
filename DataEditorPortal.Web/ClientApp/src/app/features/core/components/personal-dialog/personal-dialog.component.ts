import { Component, ViewChild } from '@angular/core';
import { NgForm, FormGroup, AbstractControl } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { MenuItem } from 'primeng/api';
import { ManageRoleForm } from 'src/app/features/universal-grid-action/models/user-manager';
import {
  NotifyService,
  ConfigDataService,
  UserService,
  NgxFormlyService
} from 'src/app/shared';

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
          className: 'w-6',
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
          className: 'w-6',
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
            optionsLookup: 'E1F3E2C7-25CA-4D69-9405-ABC54923864D',
            options: []
          },
          hooks: {
            onInit: (field: any) => {
              this.ngxFormlyService.initFieldOptions(field);
            }
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
            optionsLookup: '704A3D00-62DF-4C62-A4BD-457C4DC242CA',
            dependOnFields: ['vendor'],
            options: []
          },
          hooks: {
            onInit: (field: any) => {
              this.ngxFormlyService.initDependOnFields(field);
            }
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
    }
  ];
  constructor(
    public configDataService: ConfigDataService,
    public userService: UserService,
    private ngxFormlyService: NgxFormlyService,
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
          autoEmail: res.autoEmail
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
