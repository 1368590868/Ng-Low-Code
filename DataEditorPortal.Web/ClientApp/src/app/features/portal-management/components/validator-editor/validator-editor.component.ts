import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators
} from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyConfig, FormlyFieldProps } from '@ngx-formly/core';
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

  hasAdvanceData = false;
  helperMessage =
    'Please enter the validation expression that returns boolean.<br />' +
    'E.g. <br /><br />' +
    '$model.NAME && $model.NAME.length > 5 <br />' +
    '$model.PASSWORD === $model.CONFIRM_PASSOWRD <br />' +
    '/^[0-9]*$/.test($model.PHONE_NUMBER)';
  libSource = ['/**', '* Current form model', '*/', 'let $model : any;'].join('\n');

  innerValue: any;

  @Input()
  set value(val: any) {
    this.innerValue = val ?? [];
    this.initForm(val ?? []);
  }

  constructor(private formlyConfig: FormlyConfig, private notifyService: NotifyService) {
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

  initForm(val: any) {
    const selected: any[] = [];
    let expressions: any = {};

    val.forEach((item: any) => {
      if (typeof item === 'string') {
        selected.push(item);
      } else {
        expressions = item;
        if (item?.expression || item?.message) {
          this.hasAdvanceData = true;
        }
      }
    });

    this.form.setValue(
      {
        validatorFormControl: selected,
        expressionFormControl: expressions.expression ?? '',
        messageFormControl: expressions.message ?? ''
      },
      { emitEvent: false }
    );
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
    this.initForm(this.innerValue);
  }

  onHide() {
    this.form.markAsUntouched();
  }

  onOk() {
    const expressionFormControl = this.form.get('expressionFormControl');
    const messageFormControl = this.form.get('messageFormControl');
    if (expressionFormControl?.valid && messageFormControl?.valid) {
      this.visible = false;
      this.hasAdvanceData = true;
      this.onSendData();
    } else {
      this.notifyService.notifyWarning('', 'Javascript Expression or Error Message is required.');
      expressionFormControl?.markAsTouched();
      messageFormControl?.markAsTouched();
    }
  }

  onSendData() {
    let data: any[] = [];
    if (this.form.get('validatorFormControl')?.value) {
      data = data.concat(this.form.get('validatorFormControl')?.value);
    }
    if (this.form.get('expressionFormControl')?.value && this.form.get('messageFormControl')?.value) {
      data.push({
        expression: this.form.get('expressionFormControl')?.value,
        message: this.form.get('messageFormControl')?.value
      });
    }

    this.innerValue = data;
    this.onChange?.(data);
  }

  onCancel() {
    this.visible = false;
  }

  removeAdvance() {
    this.form.get('expressionFormControl')?.reset();
    this.form.get('messageFormControl')?.reset();
    this.hasAdvanceData = false;
    this.onSendData();
  }
}

@Component({
  selector: 'app-formly-feild-validator-editor',
  template: `
    <app-validator-editor
      [formControl]="formControl"
      [formlyAttributes]="field"
      (onChange)="props.change && props.change(field, $event)"></app-validator-editor>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldValidatorEditorComponent extends FieldType<
  FieldTypeConfig<FormlyFieldProps & { options: any[] }>
> {}
