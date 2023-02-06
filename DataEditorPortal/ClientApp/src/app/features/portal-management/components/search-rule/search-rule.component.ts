import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  public code = '';

  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() set value(val: string) {
    this.code = val;
  }
  public visible = false;
  public buttonDisabled = false;
  public isLoading = false;

  public dialogStyle: any = {
    minWidth: '40rem'
  };

  public editorOptions = {
    theme: 'vs-studio',
    language: 'sql',
    minimap: { enabled: false }
  };

  constructor(private notifyService: NotifyService) {
    this.code = this.value;
  }

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

  showDialog() {
    this.visible = true;
  }

  onOk() {
    if (this.code) {
      this.valueChange.emit(this.code);
      this.visible = false;
    } else {
      this.notifyService.notifyWarning('Warning', 'Please Enter SQL');
    }
  }

  onCancel() {
    this.visible = false;
  }
}
