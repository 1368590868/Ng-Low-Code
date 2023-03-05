import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators
} from '@angular/forms';
import {
  FieldType,
  FieldTypeConfig,
  FormlyConfig,
  FormlyFieldProps
} from '@ngx-formly/core';
import { NotifyService } from 'src/app/shared';

@Component({
  selector: 'app-validator-editor',
  templateUrl: './validator-editor.component.html',
  styleUrls: ['./validator-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ValidatorEditorComponent,
      multi: true
    }
  ]
})
export class ValidatorEditorComponent implements ControlValueAccessor, OnInit {
  formBuilder = new FormBuilder();
  form!: FormGroup;
  visible = false;
  selectOptions: { label: string; value: string }[] = [];

  onChange!: any;
  onTouch!: any;

  advanceData: any = [];
  hasAdvanceData = false;
  helperMessage =
    '//Please enter the connection string to connect to your server.\r\n\r\n' +
    '//form.get(`filedKey`).value === xxx';

  @Input()
  set value(val: any) {
    this.initForm(val ?? []);
  }

  constructor(
    private formlyConfig: FormlyConfig,
    private notifyService: NotifyService
  ) {
    this.form = this.formBuilder.group({
      validatorFormControl: new FormControl([]),
      expressionFormControl: new FormControl('', {
        validators: [Validators.required]
      }),
      messageFormControl: new FormControl('', {
        validators: [Validators.required]
      })
    });
    this.selectOptions = this.extractNameAndLabel(this.formlyConfig.validators);
  }

  extractNameAndLabel(obj: any) {
    const data = [];
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key].name;
        const label = obj[key].options.label;
        data.push({ label, value });
      }
    }
    return data;
  }

  onMonacoEditorInit(editor: any) {
    const expressionFormControl = this.form.get('expressionFormControl');
    editor.onMouseDown(() => {
      if (expressionFormControl?.value === this.helperMessage) {
        expressionFormControl.reset();
        setTimeout(() => {
          expressionFormControl.markAsPristine();
        }, 100);
      }
    });
    editor.onDidBlurEditorText(() => {
      if (!expressionFormControl?.value) {
        expressionFormControl?.setValue(this.helperMessage);
      }
    });
    setTimeout(() => {
      expressionFormControl?.markAsPristine();
    });
  }

  initForm(val: any) {
    const selected: any[] = [];
    let expressions: any = {};

    val.map((item: any) => {
      if (typeof item === 'string') {
        selected.push(item);
      } else {
        expressions = item;
        if (item?.expression?.trim() || item?.message?.trim()) {
          this.hasAdvanceData = true;
        }
      }
    });
    this.form.setValue({
      validatorFormControl: selected,
      expressionFormControl: expressions.expression ?? this.helperMessage,
      messageFormControl: expressions.message ?? ''
    });
  }

  ngOnInit() {
    this.form.get('validatorFormControl')?.valueChanges.subscribe(() => {
      this.onSendData();
    });
  }

  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  showDialog() {
    this.visible = true;
  }

  onOk() {
    const expressionFormControl = this.form.get('expressionFormControl');
    const messageFormControl = this.form.get('messageFormControl');
    if (
      expressionFormControl?.valid &&
      messageFormControl?.valid &&
      expressionFormControl.value != this.helperMessage
    ) {
      this.visible = false;
      this.hasAdvanceData = true;
    } else {
      this.notifyService.notifyWarning(
        '',
        'Javascript Expression or Error Message is required.'
      );
      expressionFormControl?.markAsDirty();
      messageFormControl?.markAsDirty();
      this.hasAdvanceData = false;
    }
    this.onSendData();
  }

  onSendData() {
    const data = [
      ...this.form.get('validatorFormControl')!.value,
      {
        expression: this.form.get('expressionFormControl')?.value,
        message: this.form.get('messageFormControl')?.value
      }
    ];
    data.forEach((item: any, index: number) => {
      if (typeof item === 'object') {
        Object.keys(item).forEach((key: string) => {
          if (!item[key]) {
            delete data[index][key];
          }
        });
        if (Object.keys(item).length === 0) {
          data.splice(index, 1);
        }
      }
    });
    this.advanceData = data;
    this.onChange?.(data);
  }

  onCancel() {
    this.form.get('expressionFormControl')?.reset();
    this.form.get('messageFormControl')?.reset();
    this.visible = false;
  }

  removeAdvance() {
    this.advanceData.forEach((item: any, index: number) => {
      if (typeof item === 'object') {
        if (Object.keys(item).length > 0) {
          this.advanceData.splice(index, 1);
        }
      }
    });
    this.form.get('expressionFormControl')?.reset();
    this.form.get('messageFormControl')?.reset();
    this.onChange?.(this.advanceData);
    this.hasAdvanceData = false;
  }
}

@Component({
  selector: 'app-formly-feild-validator-editor',
  template: `
    <app-validator-editor
      [formControl]="formControl"
      [formlyAttributes]="field"
      (onChange)="
        props.change && props.change(field, $event)
      "></app-validator-editor>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldValidatorEditorComponent extends FieldType<
  FieldTypeConfig<FormlyFieldProps & { options: any[] }>
> {}
