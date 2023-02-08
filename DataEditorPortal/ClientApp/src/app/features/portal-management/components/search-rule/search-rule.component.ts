import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NotifyService } from 'src/app/core/utils/notify.service';
export interface SaveData {
  label: string;
}
@Component({
  selector: 'app-search-rule',
  templateUrl: './search-rule.component.html',
  styleUrls: ['./search-rule.component.scss']
})
export class SearchRuleComponent {
  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() value?: string;

  public visible = false;
  public buttonDisabled = false;
  public isLoading = false;

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

  formControlQuery: FormControl = new FormControl();

  helperMessage =
    '-- Enter the where clause, which will be used to filter data. \r\n' +
    '-- Use ##VALUE## to reference the field value. \r\n' +
    '-- E.g. \r\n' +
    '--      FirstName = ##VALUE## \r\n' +
    "--      FirstName LIKE '%##VALUE##%'";

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
    if (this.value) this.formControlQuery.setValue(this.value);
    else this.formControlQuery.setValue(this.helperMessage);
    setTimeout(() => {
      this.formControlQuery.setErrors(null);
    }, 100);
  }

  onOk() {
    this.formControlQuery.updateValueAndValidity();
    if (this.formControlQuery.valid) {
      this.valueChange.emit(this.formControlQuery.value);
      this.visible = false;
    } else {
      this.formControlQuery.markAsDirty();
    }
  }

  onCancel() {
    this.visible = false;
  }
}
