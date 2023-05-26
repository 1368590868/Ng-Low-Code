import { Component, Input, OnInit } from '@angular/core';
import { distinctUntilChanged, startWith, tap } from 'rxjs';
import { FormDesignerDirective } from '../../directives/form-designer.directive';

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
  `,
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
export class SearchDesignerConfigComponent
  extends FormDesignerDirective
  implements OnInit
{
  @Input() useTwoSearchRule = false;

  ngOnInit(): void {
    this.options.formState.hideValidation = true;
    this.options.formState.hideDefaultValue = true;
    this.options.formState.hideComputedValue = true;
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
                if (this.useTwoSearchRule) {
                  const searchRule1Field = field.parent?.get?.('searchRule1');
                  if (searchRule1Field && searchRule1Field.props) {
                    searchRule1Field.props.options =
                      this.portalItemService.getFilterMatchModeOptions(
                        field.parent?.model
                      );
                  }
                }
              })
            )
            .subscribe();
        }
      };
    }

    // add search rule editor.
    this.fields.push({
      fieldGroup: [
        {
          wrappers: ['divider'],
          props: {
            label: this.useTwoSearchRule ? 'Primary Search Rule' : 'Search Rule'
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

    if (this.useTwoSearchRule) {
      // add search rule editor.
      this.fields.push({
        fieldGroup: [
          {
            wrappers: ['divider'],
            props: {
              label: 'Secondary Search Rule'
            }
          },
          {
            key: 'searchRule1',
            type: 'searchRuleEditor',
            props: {
              options: []
            }
          }
        ]
      });
    }
  }
}
