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
    const matchMode = this.formControlMatchMode.value;
    if (!matchMode || !this._options.find(x => x.value === matchMode)) {
      // setTimeout(() => {
      this.formControlMatchMode.setValue(val[0].value);
      // });
    }
  }
  _options: any[] = [];

  visible = false;
  dialogStyle: any = {
    minWidth: '40rem'
  };
  editorOptions = {
    theme: 'vs-studio',
    language: 'sql',
    lineNumbers: 'off',
    roundedSelection: true,
    minimap: { enabled: false },
    wordWrap: true,
    contextmenu: false,
    scrollbar: {
      verticalScrollbarSize: 7,
      horizontalScrollbarSize: 7
    }
  };
  helperMessage =
    '-- Enter the where clause, which will be used to filter data. \r\n' +
    '-- Use ##VALUE## to reference the field value. \r\n' +
    '-- E.g. \r\n' +
    '--      FirstName = ##VALUE## \r\n' +
    "--      FirstName LIKE  ##VALUE## + '%'";

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
      field: this.field,
      whereClause: val
    });
  }
  onChange?: any;
  onTouch?: any;

  set value(val: { field: string; matchMode?: string; whereClause?: string }) {
    if (val) {
      this.field = val.field;
      this.formControlMatchMode.setValue(val.matchMode, { emitEvent: false });
      this._whereClause = val.whereClause;
    }
    this.onChange?.(val);
    this.onTouch?.(val);
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

  ngOnInit(): void {
    this.formControlMatchMode.valueChanges.subscribe(val => {
      this.onChange?.({
        field: this.field,
        matchMode: val
      });
    });
  }

  onMonacoInit() {
    monaco.editor.defineTheme('myTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#EEEEEE'
      }
    });
    monaco.editor.setTheme('myTheme');
  }

  showDialog() {
    this.visible = true;
    this.formControlQuery.reset();
    if (this.whereClause) this.formControlQuery.setValue(this.whereClause);
    else this.formControlQuery.setValue(this.helperMessage);
  }

  onOk() {
    if (this.formControlQuery.valid) {
      this.whereClause = this.formControlQuery.value;
      this.visible = false;
    } else {
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
