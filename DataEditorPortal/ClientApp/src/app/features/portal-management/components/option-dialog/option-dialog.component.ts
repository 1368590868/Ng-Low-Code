import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LookupService } from '../../services/lookup.service';

interface OptionItem {
  formControl: FormControl;
  label?: string;
}

export interface OptionValueModel {
  options?: { label: string }[];
  isAdvanced?: boolean;
  optionLookup?: string;
}

@Component({
  selector: 'app-option-dialog',
  templateUrl: './option-dialog.component.html',
  styleUrls: ['./option-dialog.component.scss']
})
export class OptionDialogComponent {
  public optionArr: OptionItem[] = [];
  @Output() valueChange: EventEmitter<OptionValueModel> =
    new EventEmitter<OptionValueModel>();

  @Input()
  value: OptionValueModel = {
    isAdvanced: false,
    options: []
  };

  public visible = false;
  public buttonDisabled = false;
  public isLoading = false;
  public advanced = false;

  public dialogStyle: any = {
    minWidth: '40rem'
  };

  public editorOptions = {
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

  formControlName: FormControl = new FormControl();
  formControlQuery: FormControl = new FormControl();

  constructor(private lookupService: LookupService) {}

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

  changeMode() {
    this.advanced = !this.advanced;
    if (this.advanced) {
      this.dialogStyle = {
        minWidth: '50rem',
        minHeight: '20rem'
      };
      if (this.value.optionLookup) {
        this.lookupService
          .getOptionQuery(this.value.optionLookup)
          .subscribe(res => {
            this.optionArr = [];
            this.formControlName.setValue(res?.name);
            this.formControlQuery.setValue(res?.queryText);
          });
      } else {
        this.formControlName.setValue(null);
        this.formControlQuery.setValue(null);
        setTimeout(() => {
          this.formControlName.setErrors(null);
          this.formControlQuery.setErrors(null);
        }, 100);
      }
    }
  }

  onRemoveFilter(filter: OptionItem) {
    this.optionArr = this.optionArr.filter(item => item !== filter);
  }

  onAdd() {
    this.optionArr = [...this.optionArr, { formControl: new FormControl() }];
  }

  showDialog() {
    if (!this.value) {
      this.value = {
        isAdvanced: false,
        options: []
      };
    }
    this.advanced = this.value.isAdvanced || false;

    if (this.advanced) {
      this.optionArr = [];
      if (this.value.optionLookup) {
        this.lookupService
          .getOptionQuery(this.value.optionLookup)
          .subscribe(res => {
            this.formControlName.setValue(res?.name);
            this.formControlQuery.setValue(res?.queryText);
          });
      }
      this.visible = true;
    } else {
      if (this.value.options && this.value.options?.length > 0) {
        this.optionArr = this.value.options.map(item => {
          return { ...item, formControl: new FormControl(item.label) };
        });
      } else {
        this.optionArr = [];
      }
      this.visible = true;
    }
  }

  validate() {
    if (this.advanced) {
      this.formControlName.updateValueAndValidity();
      if (!this.formControlName.valid) {
        this.formControlName.markAsDirty();
      }
      this.formControlQuery.updateValueAndValidity();
      if (!this.formControlQuery.valid) {
        this.formControlQuery.markAsDirty();
      }
      return this.formControlName.valid && this.formControlQuery.valid;
    } else {
      const existInvalid = this.optionArr
        .map(item => {
          item.formControl.markAsDirty();
          return item.formControl.valid;
        })
        .find(item => item === false);
      return !existInvalid;
    }
  }

  onOk() {
    if (this.validate()) {
      if (this.advanced) {
        this.lookupService
          .saveOptionQuery({
            id: this.value.optionLookup || '',
            name: this.formControlName.value,
            queryText: this.formControlQuery.value
          })
          .subscribe(res => {
            if (res && !res.isError) {
              this.valueChange.emit({
                isAdvanced: true,
                optionLookup: res.result || ''
              });
              this.visible = false;
            }
          });
      } else {
        this.valueChange.emit({
          options: this.optionArr.map(item => {
            return {
              label: item.formControl.value,
              value: item.formControl.value
            };
          })
        });
        this.visible = false;
      }
    }
  }

  onCancel() {
    this.visible = false;
  }
}
