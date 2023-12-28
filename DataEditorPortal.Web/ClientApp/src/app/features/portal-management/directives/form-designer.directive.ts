import { Directive, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { distinctUntilChanged, startWith, tap } from 'rxjs';
import { FieldControlType, GridFormField } from '../models/portal-item';
import { PortalItemService } from '../services/portal-item.service';

export const FROM_DESIGNER_CONTROLS: FieldControlType[] = [
  {
    label: 'Checkbox',
    value: 'checkbox',
    filterType: 'boolean',
    hidePlaceholderConfig: true
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
    filterType: 'text',
    hidePlaceholderConfig: true
  },
  {
    label: 'Radio List',
    value: 'radio',
    filterType: 'text',
    hidePlaceholderConfig: true
  },
  {
    label: 'Input Number',
    value: 'inputNumber',
    filterType: 'numeric'
  },
  {
    label: 'File Upload',
    value: 'fileUpload',
    filterType: 'attachmentField',
    hideComputedConfig: true,
    hidePlaceholderConfig: true,
    hideValidatorConfig: true
  },
  {
    label: 'Link Data Editor',
    value: 'linkDataEditor',
    filterType: 'linkDataField',
    hideComputedConfig: true,
    hidePlaceholderConfig: true,
    hideValidatorConfig: true,
    isCustom: true
  },
  {
    label: 'Location Editor',
    value: 'locationEditor',
    filterType: 'locationField',
    hideComputedConfig: true,
    hidePlaceholderConfig: true,
    hideValidatorConfig: true,
    isCustom: true,
    initialConfig: {
      fromLabel: 'From',
      fromMeasureLabel: 'From Measure',
      toLabel: 'To',
      toMeasureLabel: 'To Measure',
      locationType: 2
    }
  },
  {
    label: 'GPS Locator',
    value: 'gpsLocator',
    filterType: 'gpsLocatorField',
    hideComputedConfig: true,
    hidePlaceholderConfig: true,
    hideValidatorConfig: true,
    isCustom: true,
    initialConfig: {
      lookupLinesLabel: 'Lookup Lines',
      showLinesLabel: 'Show Lines'
    }
  }
];

@Directive({
  selector: '[appFormDesigner]'
})
export class FormDesignerDirective {
  // hideValidation = false;

  form = new FormGroup({});
  options: FormlyFormOptions = {
    formState: {
      hideValidation: false,
      hideComputedValue: false,
      hideDefaultValue: false
    }
  };
  model: any = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'filterType',
      type: 'input',
      props: { placeholder: 'Enter Filter Type' },
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
                    const result = this.controls.filter(x => x.filterType === value);
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
      key: 'key',
      type: 'input',
      props: {
        label: 'Field Name',
        disabled: true,
        placeholder: 'Enter Field Name'
      }
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
      }
    },
    {
      key: 'defaultValue',
      type: 'input',
      props: {
        label: 'Default Value',
        placeholder: 'Default Value'
      },
      expressions: {
        hide: `formState.hideDefaultValue || 'input,checkbox,textarea,inputNumber'.indexOf(field.parent.model.type) < 0`
      }
    },
    {
      fieldGroup: [
        {
          wrappers: ['divider'],
          props: {
            label: 'Computed Value'
          },
          hide: true
        },
        {
          key: 'computedConfig',
          type: 'computedValueEditor',
          props: {
            label: 'Computed Value'
          }
        }
      ],
      expressions: {
        hide: `formState.hideComputedValue${this.controls
          .filter(c => c.hideComputedConfig)
          .map(c => ` || '${c.value}' === field.parent.model.type`)
          .join('')}`
      }
    },
    {
      wrappers: ['divider'],
      props: {
        label: 'Properties'
      },
      expressions: {
        hide: `field.parent.model.computedConfig`
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
          key: 'description',
          type: 'input',
          props: {
            label: 'Description',
            placeholder: 'Enter control description'
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
            hide: `${this.controls
              .filter(c => c.hidePlaceholderConfig)
              .map(c => `'${c.value}' === field.parent.parent.model.type`)
              .join('||')}`
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
            }
          ],
          expressions: {
            hide: `['select', 'checkboxList', 'radio', 'multiSelect' ].indexOf(field.parent.parent.model.type) < 0`
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
                label: 'Mninum Boundary Value',
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
              key: 'accept',
              type: 'input',
              props: {
                label: 'Accept',
                description: 'Pattern to restrict the allowed file types such as "image/*".',
                placeholder: 'Pattern to restrict the allowed file types such as "image/*".'
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
              defaultValue: 0,
              props: {
                min: 0,
                max: 99,
                label: 'File Limit',
                description: 'Maximum number of files that can be uploaded.',
                placeholder: 'Maximum number of files that can be uploaded.'
              }
            },
            {
              key: 'chooseLabel',
              type: 'input',
              props: {
                label: 'Choose Label',
                description: 'Label of the choose button. Defaults to global value in i18n translation configuration.',
                placeholder: 'Label of the choose button. Defaults to global value in i18n translation configuration.'
              }
            },
            {
              key: 'multiple',
              type: 'checkbox',
              defaultValue: false,
              props: {
                label: 'Multiple',
                placeholder: 'Used to select multiple files at once from file dialog.'
              }
            }
          ],
          expressions: {
            hide: `'fileUpload' !== field.parent.parent.model.type`
          }
        },
        // props for location
        {
          fieldGroup: [
            {
              key: 'locationType',
              type: 'select',
              props: {
                label: 'Location Type',
                placeholder: 'Select location type',
                required: true,
                options: [
                  { label: 'Point Location', value: 2 },
                  { label: 'Linear Location', value: 3 },
                  { label: 'Linear Multiple', value: 4 }
                ],
                change: (field: any) => {
                  field.parent.get('mappingColumns').formControl.setValue(null);
                }
              }
            },
            {
              key: 'system',
              type: 'optionsEditor',
              props: {
                label: 'From/To Options',
                onlyAdvanced: true,
                dialogTitle: 'From/To Options'
              }
            },
            {
              key: 'mappingColumns',
              type: 'locationConfig',
              props: {
                label: 'Fields Mapping',
                description: 'Set location fields mapping',
                locationType: 2
              },
              expressions: {
                'props.locationType': `field.parent.model.locationType`
              }
            },

            {
              key: 'fromLabel',
              type: 'input',
              defaultValue: 'From',
              props: {
                label: 'From Label',
                placeholder: 'Enter from  label'
              }
            },
            {
              key: 'fromDescription',
              type: 'input',
              props: {
                label: 'From Description',
                placeholder: 'Enter from description'
              }
            },
            {
              key: 'fromMeasureLabel',
              type: 'input',
              defaultValue: 'From Measure',
              props: {
                label: 'From Measure Label',
                placeholder: 'Enter from Measure label'
              },
              expressions: {
                hide: `field.parent.parent.model.locationType < 2`
              }
            },
            {
              key: 'fromMeasureDescription',
              type: 'input',
              props: {
                label: 'From Measure Description',
                placeholder: 'Enter from Measure description'
              }
            },
            {
              key: 'toLabel',
              type: 'input',
              defaultValue: 'To',
              props: {
                label: 'To Label',
                placeholder: 'Enter to label'
              },
              expressions: {
                hide: `field.parent.parent.model.locationType === 2 || field.parent.parent.model.locationType === 3`
              }
            },
            {
              key: 'toDescription',
              type: 'input',
              props: {
                label: 'to Description',
                placeholder: 'Enter to description'
              },
              expressions: {
                hide: `field.parent.parent.model.locationType === 2 || field.parent.parent.model.locationType === 3`
              }
            },
            {
              key: 'toMeasureLabel',
              type: 'input',
              defaultValue: 'To Measure',
              props: {
                label: 'To Measure Label',
                placeholder: 'Enter to Measure label'
              },
              expressions: {
                hide: `field.parent.parent.model.locationType === 2`
              }
            },
            {
              key: 'toMeasureDescription',
              type: 'input',
              props: {
                label: 'To Measure Description',
                placeholder: 'Enter to description'
              },
              expressions: {
                hide: `field.parent.parent.model.locationType === 2`
              }
            },
            {
              key: 'lengthLabel',
              type: 'input',
              props: {
                label: 'Length Label',
                placeholder: 'Enter length label'
              }
            }
          ],
          expressions: {
            hide: `'locationEditor' !== field.parent.parent.model.type`
          }
        },
        // props for gps locator
        {
          fieldGroup: [
            {
              key: 'mappingColumns',
              type: 'gpsLocatorFieldsConfig',
              props: {
                label: 'Fields Mapping',
                description: 'Set GPS fields mapping'
              }
            },
            {
              key: 'serviceConfig',
              type: 'gpsLocatorServiceConfig',
              props: {
                label: 'GPS Service Config',
                description: 'Set gps service and fields mapping'
              }
            },
            {
              key: 'lookupLinesLabel',
              type: 'input',
              props: {
                label: 'Lookup Lines Label',
                placeholder: 'Enter lookup lines label'
              }
            },
            {
              key: 'showLinesLabel',
              type: 'input',
              props: {
                label: 'Show Lines Label',
                placeholder: 'Enter show lines label'
              }
            },
            {
              key: 'showLinesUrl',
              type: 'input',
              props: {
                label: 'Show Lines Url',
                placeholder: 'Enter show lines url'
              }
            },
            {
              key: 'noDataMessage',
              type: 'input',
              props: {
                label: 'No Data Message',
                placeholder: 'Enter no data message'
              }
            }
          ],
          expressions: {
            hide: `'gpsLocator' !== field.parent.parent.model.type`
          }
        },
        {
          key: 'required',
          type: 'checkbox',
          defaultValue: true,
          props: {
            label: 'Required'
          },
          expressions: {
            hide: `formState.hideValidation`
          }
        }
      ],
      expressions: {
        hide: `field.parent.model.computedConfig`
      }
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
        hide: `formState.hideValidation || field.parent.model.computedConfig${this.controls
          .filter(c => c.hideValidatorConfig)
          .map(c => ` || '${c.value}' === field.parent.model.type`)
          .join('')}`
      }
    }
  ];

  constructor(
    @Inject('FROM_DESIGNER_CONTROLS') public controls: FieldControlType[],
    public portalItemService: PortalItemService
  ) {}

  @Input()
  set config(val: GridFormField) {
    if (val) {
      this.model = val;
    }
  }

  @Output() configChange = new EventEmitter<GridFormField>();

  modelChange($event: any) {
    this.configChange.emit($event);
  }
}
