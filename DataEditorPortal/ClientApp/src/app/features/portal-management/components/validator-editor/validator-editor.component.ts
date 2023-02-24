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
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import {
  FieldType,
  FieldTypeConfig,
  FormlyConfig,
  FormlyFieldProps
} from '@ngx-formly/core';

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
  expressions: { expression: string; message: string } = {
    expression: '',
    message: ''
  };

  onChange!: any;
  onTouch!: any;

  @Input()
  set value(val: any) {
    this.initForm(val ?? []);
  }

  constructor(private formlyConfig: FormlyConfig) {
    this.form = this.formBuilder.group({
      validatorFormControl: new FormControl([]),
      expressionFormControl: new FormControl('', { updateOn: 'blur' }),
      messageFormControl: new FormControl('', { updateOn: 'blur' })
    });

    const validators = this.formlyConfig.validators;
    Object.keys(validators).forEach((key: string) => {
      this.selectOptions.push({ label: key, value: key });
    });
  }

  initForm(val: any) {
    const selected: never[] = [];

    val.map((item: never) => {
      if (typeof item === 'string') {
        selected.push(item);
      } else {
        this.expressions = item;
      }
    });
    this.form.setValue({
      validatorFormControl: selected,
      expressionFormControl: this.expressions.expression,
      messageFormControl: this.expressions.message
    });
  }

  ngOnInit() {
    this.form.valueChanges.subscribe(() => {
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
    this.onSendData();
    this.visible = false;
  }

  onSendData() {
    this.onChange?.([
      ...this.form.get('validatorFormControl')!.value,
      {
        expression: this.form.get('expressionFormControl')?.value,
        message: this.form.get('messageFormControl')?.value
      }
    ]);
  }

  onCancel() {
    this.visible = false;
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
