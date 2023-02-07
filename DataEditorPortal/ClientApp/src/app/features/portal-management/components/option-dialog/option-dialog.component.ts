import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Lookup } from '../../models/lookup';
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
    options: [],
    optionLookup: '<new_lookup>'
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
    scrollbar: {
      verticalScrollbarSize: 7,
      horizontalScrollbarSize: 7
    }
  };

  lookups: Lookup[] = [];
  showLookupForm = false;
  formControlLookups: FormControl = new FormControl();
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
      this.lookupService.getLookups().subscribe(res => {
        res.push({
          name: '...',
          id: '<new_lookup>',
          queryText: ''
        });
        this.lookups = res;
        this.formControlLookups.setErrors(null);
        this.formControlName.setErrors(null);
        this.formControlQuery.setErrors(null);
      });
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
        options: [],
        optionLookup: '<new_lookup>'
      };
    }
    this.advanced = this.value.isAdvanced || false;

    if (this.advanced) {
      this.optionArr = [];
      this.lookupService.getLookups().subscribe(res => {
        res.push({
          name: '...',
          id: '<new_lookup>',
          queryText: ''
        });
        this.lookups = res;
        if (
          this.value.optionLookup &&
          res.find(x => x.id === this.value.optionLookup)
        ) {
          this.formControlLookups.setValue(this.value.optionLookup);
          this.showLookupForm = false;
        } else {
          this.formControlLookups.setValue('<new_lookup>');
          this.showLookupForm = true;
        }
        this.visible = true;
      });
    } else {
      this.formControlLookups.setValue(undefined);
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
      this.formControlLookups.updateValueAndValidity();
      if (!this.formControlLookups.valid) {
        this.formControlLookups.markAsDirty();
        return false;
      } else {
        if (this.formControlLookups.value === '<new_lookup>') {
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
          return true;
        }
      }
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
        if (this.formControlLookups.value == '<new_lookup>') {
          this.lookupService
            .saveOptionQuery({
              id: '',
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
            isAdvanced: true,
            optionLookup: this.formControlLookups.value
          });
          this.visible = false;
        }
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

  changeLookup() {
    const id = this.formControlLookups.value;
    if (id === '<new_lookup>') {
      this.showLookupForm = true;
      this.formControlName.setValue('');
      this.formControlQuery.setValue('');
    } else {
      this.showLookupForm = false;
      // this.lookupService.getOptionQuery(id).subscribe(res => {
      //   this.formControlName.setValue(res?.name);
      //   this.formControlQuery.setValue(res?.queryText);
      // });
    }
  }

  onDragOption(event: any) {
    console.log('test');
    event.stopPropagation();
  }
}
