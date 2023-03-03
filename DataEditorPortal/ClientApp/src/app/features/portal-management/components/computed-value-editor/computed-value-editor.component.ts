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
import { FieldType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core';

@Component({
  selector: 'app-computed-value-editor',
  templateUrl: './computed-value-editor.component.html',
  styleUrls: ['./computed-value-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ComputedValueEditorComponent,
      multi: true
    }
  ]
})
export class ComputedValueEditorComponent
  implements ControlValueAccessor, OnInit
{
  formBuilder = new FormBuilder();
  form!: FormGroup;
  visible = false;
  selectOptions: { label: string; value: string }[] = [
    { label: 'Current Username', value: 'CurrentUserName' },
    { label: 'Current User Id', value: 'CurrentUserId' },
    { label: 'Current User Guid', value: 'CurrentUserGuid' },
    { label: 'Current User Email', value: 'CurrentUserEmail' },
    { label: 'Current Date Time', value: 'CurrentDateTime' }
  ];

  typeOptions: { label: string; value: string }[] = [
    { label: 'Text', value: 'Text' },
    { label: 'Stored Procedure', value: 'StoredProcedure' }
  ];
  expressions: { expression: string; message: string } = {
    expression: '',
    message: ''
  };

  onChange!: any;
  onTouch!: any;

  advanceData: any = [];
  hasAdvanceData = false;

  @Input()
  set value(val: any) {
    this.initForm(val ?? {});
  }

  constructor() {
    this.form = this.formBuilder.group({
      nameFormControl: new FormControl(''),
      queryTextFormControl: new FormControl('', { updateOn: 'blur' }),
      typeFormControl: new FormControl('', { updateOn: 'blur' })
    });
  }

  initForm(val: any) {
    let selected = 'CurrentUserName';

    if (val?.name) {
      selected = val.name;
    }
    if (val?.type?.trim() || val?.queryText?.trim()) {
      this.expressions = val;
      this.hasAdvanceData = true;
    }
    this.form.setValue({
      nameFormControl: selected,
      queryTextFormControl: this.expressions?.expression ?? '',
      typeFormControl: this.expressions?.message ?? ''
    });
  }

  ngOnInit() {
    this.form.valueChanges.subscribe(() => {
      this.onSendData();
    });
    this.form.get('nameFormControl')?.setValue('CurrentUserName');
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
    if (
      this.form.get('typeFormControl')?.value?.trim() ||
      this.form.get('queryTextFormControl')?.value.trim()
    ) {
      this.hasAdvanceData = true;
    } else {
      this.hasAdvanceData = false;
    }
    this.onSendData();
    this.visible = false;
  }

  onSendData() {
    const name = this.form.get('nameFormControl')!.value ?? '';
    let data: { type?: string; name?: string; queryText?: string } = {};
    if (this.hasAdvanceData) {
      data = {
        type: this.form.get('typeFormControl')?.value,
        queryText: this.form.get('queryTextFormControl')?.value
      };
    } else {
      data = { name };
    }
    if (
      Object.prototype.hasOwnProperty.call(data, 'type') &&
      !data.type?.trim()
    ) {
      delete data.type;
    }

    if (
      Object.prototype.hasOwnProperty.call(data, 'queryText') &&
      !data.queryText?.trim()
    ) {
      delete data.queryText;
    }

    this.advanceData = data;
    this.onChange?.(data);
  }

  onCancel() {
    this.visible = false;
  }

  onClear() {
    this.form.get('typeFormControl')?.reset();
  }

  onRemove() {
    this.hasAdvanceData = false;
    this.form.get('typeFormControl')?.reset();
    this.form.get('queryTextFormControl')?.reset();
  }

  removeAdvance() {
    this.advanceData.forEach((item: any, index: number) => {
      if (typeof item === 'object') {
        if (Object.keys(item).length > 0) {
          this.advanceData.splice(index, 1);
        }
      }
    });
    this.form.get('queryTextFormControl')?.setValue('');
    this.form.get('typeFormControl')?.setValue('');
    this.onChange?.(this.advanceData);
    this.hasAdvanceData = false;
  }
}

@Component({
  selector: 'app-formly-feild-computed-value-editor',
  template: `
    <app-computed-value-editor
      [formControl]="formControl"
      [formlyAttributes]="field"
      (onChange)="
        props.change && props.change(field, $event)
      "></app-computed-value-editor>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldComputedValueEditorComponent extends FieldType<
  FieldTypeConfig<FormlyFieldProps & { options: any[] }>
> {}
