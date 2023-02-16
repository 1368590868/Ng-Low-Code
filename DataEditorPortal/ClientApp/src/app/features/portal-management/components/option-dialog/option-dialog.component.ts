import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormControl,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { LookupService } from '../../services/lookup.service';

interface OptionItem {
  formControl: FormControl;
  label?: string;
}

@Component({
  selector: 'app-option-dialog',
  templateUrl: './option-dialog.component.html',
  styleUrls: ['./option-dialog.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: OptionDialogComponent,
      multi: true
    }
  ]
})
export class OptionDialogComponent implements ControlValueAccessor {
  isAdvanced = false;
  optionLookup?: string;
  options: any[] = [];
  onChange?: any;
  onTouch?: any;
  disabled = false;

  visible = false;
  buttonDisabled = false;
  isLoading = false;
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

  formControlOptions: OptionItem[] = [];
  formControlName: FormControl = new FormControl();
  formControlQuery: FormControl = new FormControl();

  constructor(private lookupService: LookupService) {}

  set value(val: string | any[]) {
    if (Array.isArray(val)) {
      this.options = val;
    } else if (val) {
      this.optionLookup = val;
    } else {
      this.options = [];
      this.optionLookup = undefined;
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
    setTimeout(() => {
      this.formControlQuery.markAsPristine();
    });
  }

  changeMode() {
    this.isAdvanced = !this.isAdvanced;
    if (this.isAdvanced) {
      this.dialogStyle = {
        minWidth: '50rem',
        minHeight: '20rem'
      };
      this.formControlName.reset();
      this.formControlQuery.reset();
      if (this.optionLookup) {
        this.lookupService.getOptionQuery(this.optionLookup).subscribe(res => {
          this.formControlOptions = [];
          this.formControlName.setValue(res?.name);
          this.formControlQuery.setValue(res?.queryText);
        });
      }
    }
  }

  onRemoveFilter(filter: OptionItem) {
    this.formControlOptions = this.formControlOptions.filter(
      item => item !== filter
    );
  }

  onAdd() {
    this.formControlOptions = [
      ...this.formControlOptions,
      { formControl: new FormControl() }
    ];
  }

  showDialog() {
    this.isAdvanced =
      (!this.options || this.options.length === 0) && !!this.optionLookup;

    if (this.isAdvanced) {
      this.formControlOptions = [];
      if (this.optionLookup) {
        this.lookupService.getOptionQuery(this.optionLookup).subscribe(res => {
          this.formControlName.setValue(res?.name);
          this.formControlQuery.setValue(res?.queryText);
        });
      }
      this.visible = true;
    } else {
      if (this.options && this.options?.length > 0) {
        this.formControlOptions = this.options.map(item => {
          return { ...item, formControl: new FormControl(item.label) };
        });
      } else {
        this.formControlOptions = [];
      }
      this.visible = true;
    }
  }

  validate() {
    if (this.isAdvanced) {
      if (!this.formControlName.valid) {
        this.formControlName.markAsDirty();
      }
      if (!this.formControlQuery.valid) {
        this.formControlQuery.markAsDirty();
      }
      return this.formControlName.valid && this.formControlQuery.valid;
    } else {
      const valid = this.formControlOptions.reduce((r, x) => {
        if (!x.formControl.valid) {
          x.formControl.markAsDirty();
          x.formControl.updateValueAndValidity();
        }
        return r && x.formControl.valid;
      }, true);

      return valid;
    }
  }

  onOk() {
    if (this.validate()) {
      if (this.isAdvanced) {
        this.lookupService
          .saveOptionQuery({
            id: this.optionLookup || '',
            name: this.formControlName.value,
            queryText: this.formControlQuery.value
          })
          .subscribe(res => {
            if (res && !res.isError) {
              this.options = [];
              this.optionLookup = res.result;
              this.onChange(this.optionLookup);
              this.visible = false;
            }
          });
      } else {
        this.optionLookup = undefined;
        this.options = this.formControlOptions.map(item => {
          return {
            label: item.formControl.value,
            value: item.formControl.value
          };
        });
        this.onChange(this.options);
        this.visible = false;
      }
    }
  }

  onCancel() {
    this.visible = false;
  }
}

@Component({
  selector: 'app-formly-field-options-editor',
  template: `
    <app-option-dialog
      [formControl]="formControl"
      [formlyAttributes]="field"
      (onChange)="
        props.change && props.change(field, $event)
      "></app-option-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldOptionsEditorComponent extends FieldType<
  FieldTypeConfig<any>
> {}
