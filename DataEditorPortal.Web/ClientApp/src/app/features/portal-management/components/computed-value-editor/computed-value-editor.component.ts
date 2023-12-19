import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators
} from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core';
import { NotifyService } from 'src/app/shared';

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
export class ComputedValueEditorComponent implements ControlValueAccessor, OnInit {
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
  innerValue: any;

  helperMessage =
    'Enter the query text for fetching the computed value. <br />' +
    'E.g. <br /><br />' +
    'SELECT Max(AMOUNT) FROM DEMO_TABLE';

  onChange!: any;
  onTouch!: any;
  hasAdvanceData = false;

  @Input()
  set value(val: any) {
    this.innerValue = val;
    this.initForm(val ?? {});
  }
  constructor(private notifyService: NotifyService) {
    this.form = this.formBuilder.group({
      nameFormControl: new FormControl(''),
      queryTextFormControl: new FormControl('', {
        validators: [Validators.required]
      }),
      typeFormControl: new FormControl('', {
        validators: [Validators.required]
      })
    });
  }

  initForm(val: any) {
    if (val?.type && val?.queryText) {
      this.form.setValue(
        {
          nameFormControl: null,
          queryTextFormControl: val.queryText ?? '',
          typeFormControl: val?.type ?? ''
        },
        { emitEvent: false }
      );
      this.hasAdvanceData = true;
    } else {
      this.form.setValue(
        {
          nameFormControl: val?.name ?? null,
          queryTextFormControl: '',
          typeFormControl: null
        },
        { emitEvent: false }
      );
      this.hasAdvanceData = false;
    }
  }

  ngOnInit() {
    this.form.get('nameFormControl')?.valueChanges.subscribe(() => {
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
    this.initForm(this.innerValue);
    setTimeout(() => {
      this.form.markAsPristine();
    }, 100);
    this.visible = true;
  }

  onOk() {
    const queryTextFormControl = this.form.get('queryTextFormControl');
    const typeFormControl = this.form.get('typeFormControl');
    if (typeFormControl?.valid && queryTextFormControl?.valid) {
      this.hasAdvanceData = true;
      this.visible = false;
      this.onSendData();
    } else {
      this.notifyService.notifyWarning('', 'Query Type or Query Text is required.');
      queryTextFormControl?.markAsDirty();
      typeFormControl?.markAsDirty();
    }
  }

  onSendData() {
    const name = this.form.get('nameFormControl')?.value ?? null;
    let data: { type?: string; name?: string; queryText?: string } | undefined;
    if (this.hasAdvanceData) {
      data = {
        type: this.form.get('typeFormControl')?.value,
        queryText: this.form.get('queryTextFormControl')?.value
      };
    } else {
      data = name ? { name } : undefined;
    }
    this.innerValue = data;
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
    this.form.reset();
  }

  removeAdvance() {
    this.form.get('queryTextFormControl')?.reset();
    this.form.get('typeFormControl')?.reset();
    this.hasAdvanceData = false;
    this.onSendData();
  }
}

@Component({
  selector: 'app-formly-feild-computed-value-editor',
  template: `
    <app-computed-value-editor
      [formControl]="formControl"
      [formlyAttributes]="field"
      (onChange)="props.change && props.change(field, $event)"></app-computed-value-editor>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldComputedValueEditorComponent extends FieldType<
  FieldTypeConfig<FormlyFieldProps & { options: any[] }>
> {}
