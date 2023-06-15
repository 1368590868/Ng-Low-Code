import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { ConfirmationService } from 'primeng/api';
import { NotifyService } from 'src/app/shared';
import {
  DbConnectionData,
  DbConnectionService
} from 'src/app/shared/services/db-connection.service ';

@Component({
  selector: 'app-add-connection-dialog',
  templateUrl: './add-connection-dialog.component.html',
  styleUrls: ['./add-connection-dialog.component.scss'],
  providers: [ConfirmationService]
})
export class AddConnectionDialogComponent {
  @Input() header = 'Add / Edit';
  @Input() okText = 'Ok';
  @Input() cancelText = 'Cancel';
  @Input() dialogStyle = { width: '40rem' };
  @Input()
  set type(val: string) {
    this.fields.forEach(field => {
      if (field.props) {
        if (field.key === 'authentication') {
          field.defaultValue =
            val === 'SqlConnection'
              ? 'Sql Server Authentication'
              : 'Oracle Database Native';

          field.props.options =
            val === 'SqlConnection'
              ? [
                  {
                    label: 'Sql Server Authentication',
                    value: 'Sql Server Authentication'
                  },
                  {
                    label: 'Windows Authentication',
                    value: 'Windows Authentication'
                  }
                ]
              : [
                  {
                    label: 'Oracle Database Native',
                    value: 'Oracle Database Native'
                  },
                  {
                    label: 'OS Authentication',
                    value: 'OS Authentication'
                  }
                ];
        }
        if (field.key === 'serverName') {
          field.props.label = val === 'SqlConnection' ? 'Server Name' : 'Host';
        }
        if (field.key === 'dbName') {
          field.props.label =
            val === 'SqlConnection' ? 'Database Name' : 'Service Name';
        }
      }
    });
  }

  @Output() saved = new EventEmitter<string>();

  @ViewChild('editForm') editForm!: NgForm;

  visible = false;
  isLoading = false;
  buttonDisabled = true;

  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model: DbConnectionData = { name: '', authentication: 0, dbName: '' };
  fields: FormlyFieldConfig[] = [
    {
      key: 'name',
      type: 'input',
      props: {
        label: ' Name',
        required: true
      }
    },
    {
      wrappers: ['divider'],
      props: {
        label: 'Connection Details'
      }
    },
    {
      key: 'serverName',
      type: 'input',
      props: {
        label: 'Server Name',
        required: true
      }
    },
    {
      key: 'authentication',
      type: 'select',
      props: {
        label: 'Authentication',
        required: true,
        disabled: true,
        options: []
      }
    },
    {
      fieldGroup: [
        {
          key: 'username',
          type: 'input',
          props: {
            label: 'Username',
            required: true
          }
        },
        {
          key: 'password',
          type: 'input',
          props: {
            type: 'password',
            label: 'Password',
            required: true
          }
        }
      ]
    },
    {
      key: 'dbName',
      type: 'input',
      props: {
        label: 'Database Name',
        required: true
      }
    }
  ];

  constructor(
    private notifyService: NotifyService,
    private dbConnectionService: DbConnectionService
  ) {}
  showDialog() {
    this.isLoading = false;
    this.visible = true;
    this.buttonDisabled = false;
  }

  onHide() {
    this.options.resetModel?.();
  }

  onCancel() {
    this.visible = false;
  }

  onOk() {
    this.editForm.onSubmit(new Event('submit'));
  }

  onFormSubmit(model: DbConnectionData) {
    if (this.form.valid) {
      this.isLoading = true;
      this.dbConnectionService.createConnection(model).subscribe(res => {
        if (!res.isError && res.result) {
          this.notifyService.notifySuccess(
            'Success',
            'Save Successfully Completed.'
          );
          this.visible = false;
          this.saved.emit(res.result);
        } else {
          this.isLoading = false;
        }
      });
    }
  }
}
