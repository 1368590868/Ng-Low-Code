import { Component, Input, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators
} from '@angular/forms';
import { NotifyService } from 'src/app/shared';

@Component({
  selector: 'app-advanced-dialog',
  templateUrl: './advanced-dialog.component.html',
  styleUrls: ['./advanced-dialog.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: AdvancedDialogComponent,
      multi: true
    }
  ]
})
export class AdvancedDialogComponent implements ControlValueAccessor {
  form!: FormGroup;
  visible = false;
  hasAdvanceData = false;
  @Input()
  set value(val: any) {
    this.innerValue = val;
    this.initForm(val ?? {});
  }
  typeOptions: { label: string; value: string }[] = [
    { label: 'Text', value: 'Text' },
    { label: 'Stored Procedure', value: 'StoredProcedure' }
  ];
  helperMessage =
    '-- Enter the query text for fetching the computed value. \r\n\r\n' +
    '-- E.g. \r\n' +
    '-- SELECT Max(AMOUNT) FROM DEMO_TABLE';

  innerValue: any;
  onChange!: any;
  onTouch!: any;

  formBuilder = new FormBuilder();

  constructor(private notifyService: NotifyService) {
    this.form = this.formBuilder.group({
      queryTextFormControl: new FormControl('', {
        validators: [Validators.required]
      }),
      typeFormControl: new FormControl('', {
        validators: [Validators.required]
      })
    });
  }

  writeValue(value: any): void {
    console.log(value);
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
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

  showDialog() {
    this.initForm(this.innerValue);
    setTimeout(() => {
      this.form.markAsPristine();
    });
    this.visible = true;
  }

  initForm(val: any) {
    if (val?.type && val?.queryText) {
      this.form.setValue(
        {
          queryTextFormControl: val.queryText ?? this.helperMessage,
          typeFormControl: val?.type ?? ''
        },
        { emitEvent: false }
      );
      this.hasAdvanceData = true;
    } else {
      this.form.setValue(
        {
          queryTextFormControl: this.helperMessage,
          typeFormControl: null
        },
        { emitEvent: false }
      );
      this.hasAdvanceData = false;
    }
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
    let data: { type?: string; queryText?: string } | undefined;
    if (this.hasAdvanceData) {
      data = {
        type: this.form.get('typeFormControl')?.value,
        queryText: this.form.get('queryTextFormControl')?.value
      };
    }
    this.innerValue = data;
    this.onChange?.(data);
  }

  onClear() {
    this.form.get('typeFormControl')?.reset();
  }

  onCancel() {
    this.visible = false;
  }
  onRemove() {
    this.hasAdvanceData = false;
    this.form.reset();
    this.innerValue = undefined;
    this.onChange?.(undefined);
  }
}
