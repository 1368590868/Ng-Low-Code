import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core';
import { distinctUntilChanged, startWith } from 'rxjs';
import { NotifyService } from 'src/app/shared';

export interface SaveData {
  label: string;
}
@Component({
  selector: 'app-search-rule',
  templateUrl: './search-rule.component.html',
  styleUrls: ['./search-rule.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SearchRuleComponent,
      multi: true
    }
  ]
})
export class SearchRuleComponent implements ControlValueAccessor, OnInit {
  @Input()
  set options(val: any[]) {
    this._options = val;
    this.setFirstMatchModeIfEmpty(this.formControlMatchMode.value);
  }
  _options: any[] = [];

  visible = false;
  dialogStyle: any = {
    minWidth: '40rem',
    height: '16rem'
  };

  helperMessage =
    'Enter the where clause, which will be used to filter data. <br />' +
    'Use ##VALUE## to reference current field value. <br />' +
    'E.g. <br /><br />' +
    'FIRST_NAME = ##VALUE## <br />' +
    "FIRST_NAME LIKE ##VALUE## + '%'";

  formControlField: FormControl = new FormControl();
  formControlMatchMode: FormControl = new FormControl();
  formControlQuery: FormControl = new FormControl();
  field?: string;
  disabled = false;

  _whereClause?: string;
  get whereClause() {
    return this._whereClause;
  }
  set whereClause(val: string | undefined) {
    this._whereClause = val;
    this.onChange?.({
      field: this.formControlField.value,
      whereClause: val
    });
  }
  onChange?: any;
  onTouch?: any;

  setFirstMatchModeIfEmpty(matchMode?: string) {
    if (!matchMode || !this._options.find(x => x.value === matchMode)) {
      if (this._options.length > 0) {
        this.formControlMatchMode.setValue(this._options[0].value);
      } else {
        this.formControlMatchMode.setValue(undefined);
      }
    }
  }

  set value(val: { field: string; matchMode?: string; whereClause?: string }) {
    if (val) {
      this.field = val.field;
      this.formControlField.setValue(val.field);
      if (val.matchMode)
        this.formControlMatchMode.setValue(val.matchMode, { emitEvent: false });
      this._whereClause = val.whereClause;
    }
    // this.onChange?.(val);
    // this.onTouch?.(val);
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
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  constructor(private notifyService: NotifyService) {}

  ngOnInit(): void {
    this.formControlMatchMode.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(val => {
        this.onChange?.({
          field: this.formControlField.value,
          matchMode: val
        });
      });
    this.formControlField.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(val => {
        this.onChange?.({
          field: val,
          matchMode: this.formControlMatchMode.value
        });
      });
  }
  onFormControlFieldBlur() {
    const val = this.formControlField.value;
    if (!val) {
      this.formControlField.setValue(this.field);
    }
  }

  showDialog() {
    this.visible = true;
    this.formControlQuery.setValue(this.whereClause);
    setTimeout(() => {
      this.formControlQuery.markAsPristine();
    }, 100);
  }

  onOk() {
    if (this.formControlQuery.valid) {
      this.whereClause = this.formControlQuery.value;
      this.visible = false;
    } else {
      this.notifyService.notifyWarning('', 'Query text is required.');
      this.formControlQuery.markAsDirty();
    }
  }

  onCancel() {
    this.visible = false;
  }
}

@Component({
  selector: 'app-formly-field-search-rule',
  template: `
    <app-search-rule
      [formControl]="formControl"
      [formlyAttributes]="field"
      [options]="props.options"
      (onChange)="
        props.change && props.change(field, $event)
      "></app-search-rule>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldSearchRuleEditorComponent extends FieldType<
  FieldTypeConfig<FormlyFieldProps & { options: any[] }>
> {}
