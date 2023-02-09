import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { MenuItem } from 'primeng/api';
import { ManageRoleForm } from 'src/app/features/universal-grid-action/models/user-manager';
import { ConfigDataService } from '../../services/config-data.service';
import { PersonalInfoService } from '../../services/personal-info.service';
import { SiteSettingsService } from '../../services/site-settings.service';
import { UserService } from '../../services/user.service';
import { NotifyService } from '../../utils/notify.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @ViewChild('editForm') editForm!: NgForm;
  items!: MenuItem[];
  visible = false;
  form = new FormGroup({});
  model = {};
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
    public siteSettingsService: SiteSettingsService,
    private notifyService: NotifyService,
    private personalInfoService: PersonalInfoService
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
  ngOnInit(): void {
    this.personalInfoService.getUserDetail().subscribe(res => {
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

  onPerfileDialog() {
    this.visible = true;
  }
  onFormSubmit(model: ManageRoleForm) {
    if (this.form.valid) {
      this.personalInfoService
        .updateUser({
          ...model,
          id: this.userService.USER.identityName
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
