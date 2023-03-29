import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { distinctUntilChanged, startWith, tap } from 'rxjs';
import { GridFormField } from '../../../models/portal-item';
import { PortalItemService } from '../../../services/portal-item.service';

export const FROM_DESIGNER_CONTROLS: {
  label: string;
  value: string;
  filterType: string;
}[] = [
  {
    label: 'Checkbox',
    value: 'checkbox',
    filterType: 'boolean'
  },
  {
    label: 'Date',
    value: 'datepicker',
    filterType: 'date'
  },
  {
    label: 'Textbox',
    value: 'input',
    filterType: 'text'
  },
  {
    label: 'Textarea',
    value: 'textarea',
    filterType: 'text'
  },
  {
    label: 'Dropdown',
    value: 'select',
    filterType: 'text'
  },
  {
    label: 'Multiple Dropdown',
    value: 'multiSelect',
    filterType: 'text'
  },
  {
    label: 'Checkbox List',
    value: 'checkboxList',
    filterType: 'text'
  },
  {
    label: 'Radio List',
    value: 'radio',
    filterType: 'text'
  },
  {
    label: 'Input Number',
    value: 'inputNumber',
    filterType: 'numeric'
  },
  {
    label: 'File Upload',
    value: 'fileUpload',
    filterType: 'text'
  }
];

@Component({
  selector: 'app-form-designer-config',
  template: `
    <form [formGroup]="form" #configForm="ngForm">
      <formly-form
        [form]="form"
        [fields]="fields"
        [model]="model"
        [options]="options"
        (modelChange)="modelChange($event)"
        class="p-fluid"></formly-form>
    </form>
  `
})
export class FormDesignerConfigComponent {
  form = new FormGroup({});
  options: FormlyFormOptions = {
    formState: {
      dependOnOptions: []
    }
  };
  model: any = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'filterType',
      type: 'input',
      hooks: {
        onInit: field => {
          field.formControl?.valueChanges
            .pipe(
              startWith(field.formControl.value),
              distinctUntilChanged(),
              tap(value => {
                if (field.parent?.get) {
                  const typeField = field.parent?.get('type');
                  if (typeField && typeField.props) {
                    const result = this.controls.filter(
                      x => x.filterType === value
                    );
                    typeField.props.options = result;
                    if (!result.find(o => o.value === this.model['type']))
                      typeField.formControl?.setValue(result[0].value);
                  }
                }
              })
            )
            .subscribe();
        }
      },
      hide: true
    },
    {
      key: 'type',
      type: 'select',
      defaultValue: 'input',
      props: {
        label: 'Control Type',
        placeholder: 'Please Select',
        showClear: false,
        required: true,
        options: []
      },
      hooks: {
        onInit: field => {
          field.formControl?.valueChanges
            .pipe(
              startWith(field.formControl.value),
              distinctUntilChanged(),
              tap(value => {
                const dField = field.parent?.get?.('defaultValue');
                if (dField != null) {
                  if (dField.props)
                    dField.props['hideLabel'] = value === 'checkbox';

                  dField.hide = true;
                  if (
                    'input,checkbox,textarea,inputNumber'.indexOf(value) >= 0
                  ) {
                    dField.type = value;
                    dField.hide = false;
                  }
                }
              })
            )
            .subscribe();
        }
      }
    },
    {
      key: 'defaultValue',
      type: 'input',
      props: {
        label: 'Default Value',
        placeholder: 'Default Value'
      }
    },
    {
      wrappers: ['divider'],
      props: {
        label: 'Properties'
      }
    },
    {
      key: 'props',
      fieldGroup: [
        // standard props
        {
          key: 'label',
          type: 'input',
          props: {
            label: 'Label',
            placeholder: 'Enter control label'
          }
        },
        {
          key: 'placeholder',
          type: 'input',
          props: {
            label: 'Placeholder',
            placeholder: 'Enter placeholder'
          },
          expressions: {
            hide: `['checkbox', 'radio', 'checkboxList' , 'fileUpload'].indexOf(field.parent.parent.model.type) >= 0`
          }
        },
        // props for select, mutiSelect, checkboxList, radio
        {
          fieldGroup: [
            {
              key: 'optionsLookup',
              type: 'optionsEditor',
              props: {
                label: 'Options'
              }
            },
            {
              key: 'dependOnFields',
              type: 'multiSelect',
              defaultValue: [],
              props: {
                label: 'Depends on',
                placeholder: 'Select fields',
                showHeader: false,
                filter: false
              },
              expressions: {
                hide: `!field.parent.model.optionsLookup || Array.isArray(field.parent.model.optionsLookup)`,
                'props.options': `formState.dependOnOptions`
              }
            }
          ],
          expressions: {
            hide: `['select', 'checkboxList', 'radio', 'multiSelect'].indexOf(field.parent.parent.model.type) < 0`
          }
        },
        // props for inputNumber
        {
          fieldGroup: [
            {
              key: 'maxFractionDigits',
              type: 'inputNumber',
              defaultValue: 2,
              props: {
                label: 'Max Fraction Digits',
                maxFractionDigits: 0,
                max: 4,
                min: 0,
                placeholder: 'Set max fraction digits'
              }
            },
            {
              key: 'max',
              type: 'inputNumber',
              props: {
                label: 'Maximum Boundary Value',
                placeholder: 'Set maximum boundary value'
              }
            },
            {
              key: 'min',
              type: 'inputNumber',
              props: {
                label: 'mMninum Boundary Value',
                placeholder: 'Set mininum boundary value'
              }
            }
          ],
          expressions: {
            hide: `'inputNumber' !== field.parent.parent.model.type`
          }
        },
        // props for date
        {
          fieldGroup: [
            {
              key: 'dateFormat',
              type: 'input',
              props: {
                label: 'Date Format',
                placeholder: 'Set date format. Eg. dd.mm.yy'
              }
            }
          ],
          expressions: {
            hide: `'datepicker' !== field.parent.parent.model.type`
          }
        },
        // props for file upload
        {
          fieldGroup: [
            {
              key: 'storageType',
              type: 'select',
              defaultValue: 'FileSystem',
              props: {
                label: 'Storage Provider',
                showClear: false,
                options: [
                  { label: 'File System', value: 'FileSystem' },
                  { label: 'Sql Binary', value: 'SqlBinary' }
                ],
                required: true
              }
            },
            {
              key: 'accept',
              type: 'input',
              props: {
                label: 'Accept',
                placeholder:
                  'Pattern to restrict the allowed file types such as "image/*".'
              }
            },
            {
              key: 'maxFileSize',
              type: 'inputNumber',
              props: {
                label: 'Max File Size',
                placeholder: 'Maximum file size allowed in bytes.'
              }
            },
            {
              key: 'fileLimit',
              type: 'inputNumber',
              props: {
                label: 'File Limit',
                placeholder: 'Maximum number of files that can be uploaded.'
              }
            },
            {
              key: 'chooseLabel',
              type: 'input',
              props: {
                label: 'Choose Label',
                placeholder:
                  'Label of the choose button. Defaults to global value in i18n translation configuration.'
              }
            },
            {
              key: 'multiple',
              type: 'checkbox',
              defaultValue: false,
              props: {
                label: 'Multiple',
                placeholder:
                  'Used to select multiple files at once from file dialog.'
              }
            }
          ],
          expressions: {
            hide: `'fileUpload' !== field.parent.parent.model.type`
          }
        },
        {
          key: 'required',
          type: 'checkbox',
          defaultValue: true,
          props: {
            label: 'Required'
          }
        }
      ]
    },
    {
      fieldGroup: [
        {
          wrappers: ['divider'],
          props: {
            label: 'Validator'
          }
        },
        {
          key: 'validatorConfig',
          type: 'validatorEditor',
          props: {
            label: ''
          }
        }
      ],
      expressions: {
        hide: `'fileUpload' === field.parent.model.type`
      }
    },
    {
      fieldGroup: [
        {
          wrappers: ['divider'],
          props: {
            label: 'Computed Value'
          }
        },
        {
          key: 'computedConfig',
          type: 'computedValueEditor',
          props: {
            label: ''
          }
        }
      ],
      expressions: {
        hide: `'fileUpload' === field.parent.model.type`
      }
    }
  ];

  constructor(
    @Inject('FROM_DESIGNER_CONTROLS')
    public controls: any[],
    public portalItemService: PortalItemService
  ) {}

  @Input()
  set config(val: GridFormField) {
    if (val) {
      this.model = val;
    }
  }
  @Input()
  set allSelectedFields(val: { key: string; type: string }[]) {
    this.options.formState.dependOnOptions = val
      .filter(
        x =>
          x.key !== this.model.key &&
          ['select', 'multiSelect'].indexOf(x.type) >= 0
      )
      .map(x => {
        return {
          label: x.key,
          value: x.key
        };
      });
  }

  @Output() configChange = new EventEmitter<GridFormField>();

  modelChange($event: any) {
    this.configChange.emit($event);
  }
}
