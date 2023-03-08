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

  isOk!: boolean | undefined;

  helperMessage =
    '-- Enter the query text for fetching the data. \r\n\r\n' +
    '-- E.g. \r\n' +
    '-- SELECT * FROM dbo.demoTables WHERE ##WHERE## AND ##SEARCHES## AND ##FILTERS## ORDER BY ##ORDERBY##';

  onChange!: any;
  onTouch!: any;

  advanceData: any = [];
  hasAdvanceData = false;

  _computedValue: any;
  get computedValue() {
    return this._computedValue;
  }
  set computedValue(val: any) {
    this._computedValue = val;
  }

  @Input()
  set value(val: any) {
    this._computedValue = val;
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
  onMonacoEditorInit(editor: any) {
    const queryTextFormControl = this.form.get('queryTextFormControl');
    editor.onMouseDown(() => {
      if (queryTextFormControl?.value === this.helperMessage) {
        queryTextFormControl.reset();
        setTimeout(() => {
          queryTextFormControl.markAsPristine();
        }, 100);
      }
    });
    editor.onDidBlurEditorText(() => {
      if (!queryTextFormControl?.value) {
        queryTextFormControl?.setValue(this.helperMessage);
      }
    });
    setTimeout(() => {
      queryTextFormControl?.markAsPristine();
    });
  }

  initForm(val: any) {
    if (val?.type && val?.queryText) {
      this.form.setValue({
        nameFormControl: null,
        queryTextFormControl: val.queryText ?? this.helperMessage,
        typeFormControl: val?.type ?? ''
      });
      this.hasAdvanceData = true;
    } else {
      if (val?.name) {
        this.form.setValue({
          nameFormControl: val.name,
          queryTextFormControl: this.helperMessage,
          typeFormControl: null
        });
      }
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
    if (this.isOk) {
      this.initForm(this.advanceData);
    } else {
      this.initForm(this.computedValue ?? {});
    }
    this.visible = true;
  }

  onOk() {
    const queryTextFormControl = this.form.get('queryTextFormControl');
    const typeFormControl = this.form.get('typeFormControl');
    if (
      typeFormControl?.valid &&
      queryTextFormControl?.valid &&
      queryTextFormControl?.value != this.helperMessage
    ) {
      this.hasAdvanceData = true;
      this.isOk = true;
      this.visible = false;
      this.onSendData();
    } else {
      this.notifyService.notifyWarning(
        '',
        'Query Type or Query Text is required.'
      );
      queryTextFormControl?.markAsDirty();
      typeFormControl?.markAsDirty();
    }
  }

  onSendData() {
    const name = this.form.get('nameFormControl')!.value ?? null;
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
      !data.queryText
    ) {
      delete data.queryText;
    }

    this.advanceData = data;
    this.onChange?.(data);
  }

  onCancel() {
    this.form.get('typeFormControl')?.reset();
    this.form.get('queryTextFormControl')?.reset();
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
