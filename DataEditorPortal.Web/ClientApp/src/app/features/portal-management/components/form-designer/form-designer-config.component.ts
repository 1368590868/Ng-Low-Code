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
            label: 'Expressions'
          }
        },
        {
          key: 'hide',
          type: 'monacoEditor',
          props: {
            label: 'hide = ',
            description:
              'Only Support Javascript Expression\nExpression value type is `boolean`\n<a href="https://formly.dev/docs/guide/expression-properties" target="_blank">See more</a>',
            config: {
              language: 'javascript'
            },
            onInit: (editor: any) => this.onMonacoEditorInit(editor)
          }
        },
        {
          key: 'props_required',
          type: 'monacoEditor',
          props: {
            label: 'props.required =',
            description:
              'Only Support Javascript Expression\nExpression value type is `boolean`\n<a href="https://formly.dev/docs/guide/expression-properties" target="_blank">See more</a>',
            config: {
              language: 'javascript'
            },
            onInit: (editor: any) => this.onMonacoEditorInit(editor)
          }
        },
        {
          key: 'customExpression',
          type: 'monacoEditor',
          props: {
            label: 'expression =',
            description:
              'Only Support Javascript Expression\nExpression value type is `boolean`\n<a href="https://formly.dev/docs/guide/expression-properties" target="_blank">See more</a>',
            config: {
              language: 'json'
            },
            onInit: (editor: any) => this.onMonacoEditorInit(editor)
          }
        }
      ],
      expressions: {
        hide: `field.parent.model.computedConfig`
      }
    });
  }

  onMonacoEditorInit(editor: any) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      [
        '/**',
        '* Current field config',
        '*/',
        'let field : any;',
        '/**',
        '* Current form model',
        '*/',
        'let model : any;'
      ].join('\n'),
      'expressions.d.ts'
    );
  }
}
