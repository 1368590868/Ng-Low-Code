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
          height: 10rem !important;
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
      fieldGroup: [
        {
          wrappers: ['divider'],
          props: {
            label: 'Expressions'
          }
        },
        {
          key: 'expressionsConfig',
          type: 'monacoEditor',
          props: {
            label: 'expression =',
            description:
              'Please enter value in JSON format.\n<a href="https://formly.dev/docs/guide/expression-properties" target="_blank">See more</a>',
            config: {
              language: 'json'
            },
            placeholder:
              '{<br>&nbsp;&nbsp;"props.required": "model.CHECKED", <br>&nbsp;&nbsp;"props.fullName": "model.FIRST_NAME + \' \' + model.LAST_NAME" <br>}'
          }
        }
      ],
      expressions: {
        hide: `field.parent.model.computedConfig`
      }
    });
  }
}
