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
                    this.getFilterMatchModeOptions(field.parent?.model);
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

  getFilterMatchModeOptions(model: any) {
    const filterType = model.filterType;
    const type = model.type;

    if (type === 'multiSelect' || type === 'checkboxList')
      return [{ label: 'In selected values', value: 'in' }];
    if (filterType === 'boolean') return [{ label: 'Equals', value: 'equals' }];
    return (this.primeNGConfig.filterMatchModeOptions as any)[filterType]?.map(
      (key: any) => {
        return { label: this.primeNGConfig.getTranslation(key), value: key };
      }
    );
  }
}
