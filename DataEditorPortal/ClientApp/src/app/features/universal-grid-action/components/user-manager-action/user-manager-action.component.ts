import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { NotifyService } from 'src/app/core/utils/notify.service';
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

  form = new FormGroup({});
  model: ManageRoleForm = {};
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
    },
    {
      wrappers: ['divider'],
      props: {
        label: 'Role'
      },
      expressions: {
        hide: () => this.isAddForm
      }
    },
    {
      wrappers: ['tag'],
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
                field.props!['forArray'] = res.filter(item => {
                  item.label = item.roleName;
                  return item.selected;
                });
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
      expressions: {
        hide: () => this.isAddForm
      }
    },
    {
      wrappers: ['tag'],
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
                field.props!['forArray'] = res.filter(item => {
                  item.label = item.permissionName;
                  return item.selected;
                });
              });
          }
        }
      }
    }
  ];

  constructor(
    private userManagerService: UserManagerService,
    private notifyService: NotifyService
  ) {
    super();
  }

  ngOnInit(): void {
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
            division: res.division !== 'NONE' ? JSON.parse(res.division) : []
          });
        });
    }
    this.loadedEvent.emit();
  }

  onFormSubmit(model: ManageRoleForm) {
    if (this.form.valid) {
      const apiName = this.isAddForm ? 'createUser' : 'updateUser';

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
    this.options.resetModel?.();
  }
}
