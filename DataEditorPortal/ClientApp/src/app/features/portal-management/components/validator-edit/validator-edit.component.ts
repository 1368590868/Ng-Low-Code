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
  selector: 'app-validator-edit',
  templateUrl: './validator-edit.component.html',
  styleUrls: ['./validator-edit.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ValidatorEditComponent,
      multi: true
    }
  ]
})
export class ValidatorEditComponent implements ControlValueAccessor, OnInit {
  formBuilder = new FormBuilder();
  form!: FormGroup;
  visible = false;
  selectOptions: { label: string; value: string }[] = [];
  regexp: { regex: string; msg: string }[] = [];

  onChange!: any;
  onTouch!: any;
  @Input() options: any = [];

  @Input()
  set value(val: any) {
    this.initForm(val ?? []);
  }

  constructor(private formlyConfig: FormlyConfig) {
    this.form = this.formBuilder.group({
      validatorFormControl: new FormControl([]),
      regexpFormControl: new FormControl('', { updateOn: 'blur' }),
      messageFormControl: new FormControl('', { updateOn: 'blur' })
    });

    const validators = this.formlyConfig.validators;
    Object.keys(validators).forEach((key: string) => {
      this.selectOptions.push({ label: key, value: key });
    });
  }

  initForm(val: any) {
    if (!val.length) {
      val = [{ regex: '', msg: '' }];
    }
    const selected: never[] = [];

    val.map((item: never) => {
      if (typeof item === 'string') {
        selected.push(item);
      } else {
        this.regexp.push(item);
      }
    });
    this.form.setValue({
      validatorFormControl: selected,
      regexpFormControl: this.regexp[0].regex,
      messageFormControl: this.regexp[0].msg
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
    this.regexp[0].regex = this.form.get('regexpFormControl')?.value || '';
    this.regexp[0].msg = this.form.get('messageFormControl')?.value || '';
    const data = [];
    if (this.form.get('validatorFormControl')?.value) {
      data.push(...this.form.get('validatorFormControl')!.value, {
        regex: this.regexp[0].regex || '',
        msg: this.regexp[0].msg
      });
    }
    this.onChange?.({
      data
    });
  }

  onCancel() {
    this.visible = false;
  }
}

@Component({
  selector: 'app-formly-feild-validator-edit',
  template: `
    <app-validator-edit
      [formControl]="formControl"
      [formlyAttributes]="field"
      [options]="props.options"
      (onChange)="
        props.change && props.change(field, $event)
      "></app-validator-edit>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldValidatorEditorComponent extends FieldType<
  FieldTypeConfig<FormlyFieldProps & { options: any[] }>
> {}
