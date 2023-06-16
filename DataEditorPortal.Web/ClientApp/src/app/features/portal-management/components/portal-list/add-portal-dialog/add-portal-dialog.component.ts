import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { AbstractControl, FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { NotifyService } from 'src/app/shared';
import { PortalItemService } from '../../../services/portal-item.service';

@Component({
  selector: 'app-add-portal-dialog',
  templateUrl: './add-portal-dialog.component.html',
  styleUrls: ['./add-portal-dialog.component.scss']
})
export class AddPortalDialogComponent {
  @Input() header = 'Add / Edit';
  @Input() okText = 'Ok';
  @Input() cancelText = 'Cancel';
  @Input() dialogStyle = { width: '50rem' };

  @Output() saved = new EventEmitter<string>();

  @ViewChild('editForm') editForm!: NgForm;

  visible = false;
  isLoading = false;
  buttonDisabled = true;

  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model: { [name: string]: any } = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'label',
      type: 'input',
      props: {
        label: 'Menu Label',
        placeholder: 'Menu Label',
        required: true
      },
      modelOptions: {
        updateOn: 'blur'
      },
      asyncValidators: {
        exist: {
          expression: (c: AbstractControl) => {
            return new Promise((resolve, reject) => {
              this.portalItemService
                .nameExists(c.value, this.model['id'])
                .subscribe(res =>
                  !res.isError ? resolve(!res.result) : reject(res.message)
                );
            });
          },
          message: () => {
            return 'The Menu Name has already been exist.';
          }
        }
      }
    },
    {
      key: 'icon',
      type: 'iconSelect',
      props: {
        label: 'Icon',
        placeholder: 'Icon',
        virtualScroll: false,
        required: true,
        description:
          '<a href="https://fontawesome.com/search?o=r&m=free&s=regular" target="__blank">More icons can be click</a>'
      }
    },
    {
      className: 'w-full',
      fieldGroup: [
        {
          key: 'parentId',
          type: 'select',
          props: {
            label: 'Parent Folder',
            placeholder: 'Please Select',
            required: true,
            showClear: false
          },
          hooks: {
            onInit: field => {
              this.portalItemService.getPortalList().subscribe(res => {
                if (field.props) {
                  const options = res
                    .filter(x => x.data?.['type'] === 'Folder')
                    .map(x => {
                      return {
                        label: `- ${x.data?.['label']}`,
                        value: x.data?.['id']
                      };
                    });
                  options.splice(0, 0, {
                    label: 'Root',
                    value: '<root>'
                  });

                  field.props.options = options;

                  // reset the dropdown value, if the options come after the model value, dropdown may has no options selected
                  if (this.model && !this.model['parentId'])
                    this.model = { ...this.model, parentId: '<root>' };
                  else this.model = { ...this.model };
                }
              });
            }
          }
        },
        {
          key: 'link',
          type: 'input',
          props: {
            label: 'External Url',
            placeholder: 'External Url',
            required: true
          }
        }
      ],
      expressions: { hide: `field.parent.model.type !== 'External'` }
    },
    {
      key: 'description',
      type: 'textarea',
      className: 'w-full',
      props: {
        label: 'Description',
        placeholder: 'Description'
      }
    }
  ];

  constructor(
    private portalItemService: PortalItemService,
    private notifyService: NotifyService
  ) {}

  showDialog() {
    this.isLoading = false;
    this.visible = true;
    this.buttonDisabled = false;

    this.options.resetModel?.();
  }

  onCancel() {
    this.visible = false;
  }

  onOk() {
    this.editForm.onSubmit(new Event('submit'));
  }

  onFormSubmit(model: { [name: string]: unknown }) {
    if (this.form.valid) {
      this.isLoading = true;
      if (model['parentId'] === '<root>') model['parentId'] = null;

      if (model['id']) {
        this.portalItemService
          .updateMenuItem(model['id'] as string, model)
          .subscribe(res => {
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
      } else {
        this.portalItemService.createMenuItem(model).subscribe(res => {
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
}
