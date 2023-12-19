import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { GridFormField } from '../../models/portal-item';

@Component({
  selector: 'app-form-designer-view',
  template: `<formly-form [fields]="fields" class="p-fluid {{ layout }}"></formly-form>`,
  styles: [
    `
      :host {
        ::ng-deep {
          formly-form > formly-field > formly-group > formly-field {
            .p-field {
              margin-bottom: 0rem !important;
            }
          }
        }
      }
    `
  ]
})
export class FormDesignerViewComponent {
  @Input() layout: 'vertical' | 'horizontal' = 'vertical';
  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model: any = {};
  fields: FormlyFieldConfig[] = [];

  key?: string;

  @Input()
  set config(val: GridFormField) {
    if (val) {
      this.key = val.key;

      const field = JSON.parse(JSON.stringify(val));
      if (field.type === 'datepicker') {
        field.defaultValue = new Date();
      }
      if (field.type === 'checkbox') {
        field.props['hideLabel'] = this.layout === 'vertical';
      }
      this.fields = [field];
    }
  }

  updateConfig(config: GridFormField) {
    const field = this.fields[0];

    Object.assign(field, config);
    field.props = {};
    Object.assign(field.props, config.props);
    if (field.type === 'datepicker') {
      field.defaultValue = new Date();
    }
    if (field.type === 'checkbox') {
      field.props['hideLabel'] = this.layout === 'vertical';
    }

    // trigger ngx-formly to reload
    field.hide = true;
    field.hide = false;
  }
}
