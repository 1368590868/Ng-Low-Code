import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { MenuItem } from 'primeng/api';
import { Subject } from 'rxjs';
import { ManageRoleForm } from 'src/app/features/universal-grid-action/models/user-manager';
import { ConfigDataService, NgxFormlyService, NotifyService, UserService } from 'src/app/shared';

@Component({
  selector: 'app-personal-dialog',
  templateUrl: './personal-dialog.component.html',
  styleUrls: ['./personal-dialog.component.scss']
})
export class PersonalDialogComponent {
  @ViewChild('editForm') editForm!: NgForm;
  $destory = new Subject<void>();

  _visible = false;
  @Input() set visible(val: boolean) {
    this._visible = val;
    if (val) {
      this.onpenDialog();
    }
    this.visibleChange.emit(val);
  }
  get visible() {
    return this._visible;
  }
  @Output() visibleChange = new EventEmitter<boolean>();

  items!: MenuItem[];
  form = new FormGroup({});
  model = {};
  userId = '';
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [];
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

  getFileds(): FormlyFieldConfig[] {
    return [
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
              label: 'User ID',
              placeholder: 'User ID'
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
                      .subscribe(res => (res.code === 200 ? resolve(!res.data) : reject(res.message)));
                  });
                },
                message: () => {
                  return 'The User ID has already been exist.';
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
                  if (!control.value) return Promise.resolve(true);

                  return new Promise((resolve, reject) => {
                    const emailRegex = /^([a-zA-Z\d][\w-]{2,})@(\w{2,})\.([a-z]{2,})(\.[a-z]{2,})?$/;
                    resolve(emailRegex.test(control.value));
                  });
                },
                message: () => {
                  return 'Email format error.';
                }
              },
              emailExist: {
                expression: (control: AbstractControl) => {
                  if (!control.value) return Promise.resolve(true);
                  return new Promise((resolve, reject) => {
                    this.userService
                      .emailExists(control.value, this.userService.USER.id)
                      .subscribe(res => (res.code === 200 ? resolve(!res.data) : reject(res.message)));
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
              label: 'Receive Email Notifications',
              binary: true,
              required: true
            }
          }
        ]
      }
    ];
  }

  onpenDialog() {
    this.userService.getUserDetail(this.userService.USER.id || '').subscribe(res => {
      this.model = res;
      this.fields = this.getFileds();
    });
  }
  onFormSubmit(model: ManageRoleForm) {
    if (this.form.valid) {
      this.userService
        .updateUser({
          ...model,
          id: this.userService.USER.id
        })
        .subscribe(res => {
          if (res.code === 200 && res.data) {
            this.notifyService.notifySuccess('Success', 'Save Successfully Completed.');
            this.userService.USER = {
              ...this.userService.USER,
              displayName: model.name,
              vendor: model.vendor
            };
            this.visible = false;
          }
        });
    }
  }
  onHide() {
    this.$destory.next();
    this.form.reset(undefined, { emitEvent: false });
  }

  onCancel() {
    this.visible = false;
  }

  onOk() {
    this.editForm.onSubmit(new Event('submit'));
  }
}
