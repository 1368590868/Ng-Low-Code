import { Component, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { NotifyService } from 'src/app/core/utils/notify.service';
import { GridActionDirective } from '../../../directives/grid-action.directive';
import { UserManagerForm } from '../../../models/user-manager';

@Component({
  selector: 'app-manager-role',
  templateUrl: './manager-role.component.html',
  styleUrls: ['./manager-role.component.scss']
})
export class ManagerRoleComponent extends GridActionDirective {
  @ViewChild('editForm') editForm!: NgForm;
  form = new FormGroup({});
  model: UserManagerForm = {};
  options: FormlyFormOptions = {};
  // Role form config
  roleFields: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'flex flex-wrap justify-content-between',
      fieldGroup: [
        {
          className: 'w-6',
          key: 'Roles',
          type: 'select',
          props: {
            required: true,
            label: 'Roles',
            placeholder: 'Roles',
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
          className: 'w-full',
          key: 'Description',
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

  permissions: any[] = [];
  constructor(private notifyService: NotifyService) {
    super();
    this.permissions = [
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
  }

  onFormSubmit(model: UserManagerForm) {
    console.log(model);
    if (this.form.valid) {
      setTimeout(() => {
        this.notifyService.notifySuccess('Success', 'Save Success');
        this.savedEvent.emit();
      }, 1000);
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
