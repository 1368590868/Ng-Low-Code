import { Component, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { NotifyService } from 'src/app/core/utils/notify.service';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { UserManagerForm } from '../../models/user-manager';
import { UserManagerService } from '../../services/user-manager-services/user-manager.service';

@Component({
  selector: 'app-user-manager-action',
  templateUrl: './user-manager-action.component.html',
  styleUrls: ['./user-manager-action.component.scss']
})
export class UserManagerActionComponent extends GridActionDirective {
  @ViewChild('editForm') editForm!: NgForm;
  form = new FormGroup({});
  model: UserManagerForm = {};
  options: FormlyFormOptions = {};

  fields: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'flex flex-wrap justify-content-between',
      fieldGroup: [
        {
          className: 'w-6',
          key: 'firstName',
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
          key: 'town1',
          type: 'input',
          props: {
            required: true,
            type: 'text',
            label: 'Town',
            placeholder: 'Town'
          }
        },
        {
          className: 'w-6',
          key: 'town2',
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
          key: 'town3',
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
                value: 1,
                label: 'Option 1'
              },
              {
                value: 2,
                label: 'Option 2'
              },
              {
                value: 3,
                label: 'Option 3'
              },
              {
                value: 4,
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
                value: 1,
                label: 'Option 1'
              },
              {
                value: 2,
                label: 'Option 2'
              },
              {
                value: 3,
                label: 'Option 3'
              },
              {
                value: 4,
                label: 'Option 4'
              }
            ],
            appendTo: 'body'
          }
        }
      ]
    },
    {
      fieldGroupClassName: 'flex flex-warp justify-content-between ',
      wrappers: ['panel'],
      props: { label: 'Division' },
      fieldGroup: [
        {
          key: 'Gas',
          type: 'checkbox',
          name: 'Gas',
          props: {
            label: 'Gas'
          }
        },
        {
          key: 'ELECTRIC',
          type: 'checkbox',
          name: 'Gas',

          props: {
            label: 'Electric'
          }
        },
        {
          key: 'LANDBASE',
          type: 'checkbox',
          name: 'Gas',

          props: {
            label: 'Landbase'
          }
        },
        {
          key: 'UNDERGROUND',
          type: 'checkbox',
          name: 'Gas',

          props: {
            label: 'Underground'
          }
        }
      ]
    },
    {
      wrappers: ['panel'],
      props: { label: 'Receive Email Notifications' },
      fieldGroup: [
        {
          key: 'Notify',
          type: 'checkbox',
          props: {
            label: 'Notify'
          }
        }
      ]
    }
  ];

  constructor(
    private userManagerService: UserManagerService,
    private notifyService: NotifyService
  ) {
    super();
  }

  onFormSubmit(model: UserManagerForm) {
    if (this.form.valid) {
      this.userManagerService.saveUserManager(model).subscribe(res => {
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
}
