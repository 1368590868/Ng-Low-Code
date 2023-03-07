import { Component, OnInit } from '@angular/core';
import { distinctUntilChanged, startWith, tap } from 'rxjs';
import { FormDesignerConfigComponent } from './form-designer-config.component';

@Component({
  selector: 'app-search-designer-config',
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
export class SearchDesignerConfigComponent
  extends FormDesignerConfigComponent
  implements OnInit
{
  ngOnInit(): void {
    // modify type change logic.
    const type = this.fields.find(x => x.key === 'type');
    if (type) {
      type.hooks = {
        onInit: field => {
          field.formControl?.valueChanges
            .pipe(
              startWith(field.formControl.value),
              distinctUntilChanged(),
              tap(() => {
                // update filter match Mode options
                const searchRuleField = field.parent?.get?.('searchRule');
                if (searchRuleField && searchRuleField.props) {
                  searchRuleField.props.options =
                    this.portalItemService.getFilterMatchModeOptions(
                      field.parent?.model
                    );
                }
              })
            )
            .subscribe();
        }
      };
    }

    // remove required
    const props = this.fields.find(x => x.key === 'props');
    if (props && props.fieldGroup) {
      const required = props.fieldGroup?.find(x => x.key === 'required');
      if (required) required.hide = true;
    }
    // remove default value
    const defaultValue = this.fields.find(x => x.key === 'defaultValue');
    if (defaultValue) defaultValue.hide = true;
    // remove validator
    const validatorIndex = this.fields.findIndex(
      x => x.fieldGroup && x.fieldGroup.find(f => f.key === 'validatorConfig')
    );
    if (validatorIndex) this.fields.splice(validatorIndex, 1);
    // remove computed
    const computedIndex = this.fields.findIndex(
      x => x.fieldGroup && x.fieldGroup.find(f => f.key === 'computedConfig')
    );
    if (computedIndex) this.fields.splice(computedIndex, 1);

    // add search rule editor.
    this.fields.push({
      fieldGroup: [
        {
          wrappers: ['divider'],
          props: {
            label: 'Search Rule'
          }
        },
        {
          key: 'searchRule',
          type: 'searchRuleEditor',
          props: {
            options: []
          }
        }
      ]
    });
  }
}
