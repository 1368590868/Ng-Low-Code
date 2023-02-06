import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

interface Option {
  formControl: FormControl;
  label?: string;
}

export interface SaveData {
  option?: { label: string }[];
  isAdvance?: boolean;
  code?: string;
}

@Component({
  selector: 'app-option-dialog',
  templateUrl: './option-dialog.component.html',
  styleUrls: ['./option-dialog.component.scss']
})
export class OptionDialogComponent {
  public optionArr: Option[] = [];
  @Output() saveChange: EventEmitter<SaveData> = new EventEmitter<SaveData>();
  @Input()
  set options(val: any) {
    val.length > 0 &&
      val.map((item: any) => {
        item.formControl = new FormControl(item.label);
      });
    this.optionArr = [...this.optionArr, ...val];
  }
  public visible = false;
  public buttonDisabled = false;
  public isLoading = false;
  public advance = false;

  public dialogStyle: any = {
    minWidth: '40rem'
  };

  public editorOptions = {
    theme: 'vs-studio',
    language: 'sql',
    minimap: { enabled: false }
  };
  public code = '';

  onInit() {
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

  changeSwitch(val: boolean) {
    if (val) {
      this.dialogStyle = {
        minWidth: '50rem',
        minHeight: '20rem'
      };
    }
  }

  onRemoveFilter(filter: Option) {
    this.optionArr = this.optionArr.filter(item => item !== filter);
  }

  onAdd() {
    this.optionArr = [...this.optionArr, { formControl: new FormControl() }];
  }

  showDialog() {
    this.visible = true;
  }

  onOk() {
    const isValid = this.optionArr
      .map(item => {
        item.formControl.markAsDirty();
        return item.formControl.valid;
      })
      .find(item => item === false);
    if (isValid !== false) {
      const saveData: SaveData = {};
      const optionLabel = this.optionArr.map(item => {
        return { label: item.formControl.value };
      });
      saveData.option = optionLabel;
      saveData.isAdvance = this.advance;
      saveData.code = this.code;
      this.saveChange.emit(saveData);
      this.visible = false;
    }
  }

  onCancel() {
    this.visible = false;
  }
}
