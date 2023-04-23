import { Component, OnInit } from '@angular/core';
import { distinctUntilChanged, startWith, tap } from 'rxjs';
import { FormDesignerDirective } from '../../directives/form-designer.directive';

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
  `,
  styles: [
    `
      :host ::ng-deep {
        .monaco-editor-wrapper {
          height: 6rem !important;
        }
      }
    `
  ]
})
export class FormDesignerConfigComponent
  extends FormDesignerDirective
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
              tap(value => {
                const dField = field.parent?.get?.('defaultValue');
                if (dField != null) {
                  if (dField.props)
                    dField.props['hideLabel'] = value === 'checkbox';

                  dField.hide = true; // trigger ngx-formly to reload
                  if (
                    'input,checkbox,textarea,inputNumber'.indexOf(value) >= 0
                  ) {
                    dField.type = value;
                    dField.hide = false; // trigger ngx-formly to reload
                  }
                }
              })
            )
            .subscribe();
        }
      };
    }

    // add expressions.
    this.fields.push({
      key: 'expressionsConfig',
      fieldGroup: [
        {
          wrappers: ['divider'],
          props: {
            label: 'Reactions'
          }
        },
        {
          key: 'hide',
          type: 'monacoEditor',
          props: {
            label: 'hide = ',
            description:
              'Only Support Javascript Expression\nExpression value type is `boolean`',
            config: {
              language: 'javascript'
            }
          }
        },
        {
          key: 'props_required',
          type: 'monacoEditor',
          props: {
            label: 'props.required =',
            description:
              'Only Support Javascript Expression\nExpression value type is `boolean`',
            config: {
              language: 'javascript'
            }
          }
        }
      ]
    });
  }
}
