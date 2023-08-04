import { Component } from '@angular/core';
import { EditorComponent } from 'ngx-monaco-editor';
import { SystemLogData, SystemLogService } from 'src/app/shared';

@Component({
  selector: 'app-system-log-dialog',
  templateUrl: './system-log-dialog.component.html',
  styleUrls: ['./system-log-dialog.component.scss']
})
export class SystemLogDialogComponent {
  public visible = false;
  public viewData: any = {};
  public loading = true;
  constructor(private systemLogService: SystemLogService) {}

  config: any = {
    readOnly: true,
    domReadOnly: true,
    language: 'sql',
    lineNumbers: 'off',
    roundedSelection: false,
    minimap: { enabled: false },
    wordWrap: false,
    contextmenu: false,
    glyphMargin: false,
    folding: false,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 0,
    automaticLayout: false,
    scrollBeyondLastLine: false,
    scrollbar: {
      verticalScrollbarSize: 2,
      horizontalScrollbarSize: 2
    },
    guides: {
      indentation: false
    }
  };
  sqlConfig = { ...this.config, language: 'sql' };
  jsonConfig = { ...this.config, language: 'json' };

  show(row: SystemLogData) {
    this.systemLogService.getRowData(row.ID).subscribe(res => {
      if (res.code === 200) {
        const { data } = res;
        this.viewData = {
          'Event time': data?.eventTime,
          Category: data?.category,
          'Event Section': data?.eventSection,
          'Event Name': data?.eventName,
          'User Name ': data?.username,
          Details: this.removeExtraIndentation(data?.details),
          Params: data?.params,
          Result: data?.result,
          Connection: data?.connection
        };
        this.viewData = Object.keys(this.viewData).map(key => {
          return {
            name: key,
            value: this.viewData[key]
          };
        });
        this.loading = false;
      }
    });

    this.visible = true;
  }

  cancel() {
    this.visible = false;
  }

  removeExtraIndentation(inputString?: string) {
    if (!inputString) return;
    // Split the string into lines
    const lines = inputString.split(/[\r|\n]+/g);
    if (lines.length <= 1) return inputString;

    // Find the indentation of first non-empty lines
    let indentation = Number.MAX_SAFE_INTEGER;
    for (const line of lines) {
      if (line.trim() !== '') {
        const matches = line.match(/^\s*/);
        if (matches) {
          indentation = matches[0].length;
          break;
        }
      }
    }

    // Remove the minimum indentation from each line
    const result = lines
      .map(line => {
        const matches = line.match(/^\s*/);
        let lineIndentation = 0;
        if (matches) {
          lineIndentation = matches[0].length;
        }
        return line.slice(Math.min(lineIndentation, indentation));
      })
      .filter(line => line !== '')
      .join('\n');

    return result;
  }

  onMonacoInit(editor: any, ngxEditor: EditorComponent) {
    editor.onDidContentSizeChange(
      this.updateHeight(editor, ngxEditor._editorContainer.nativeElement)
    );
  }

  updateHeight(editor: any, container: any) {
    let timer: any;
    return () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const contentHeight = Math.min(200, editor.getContentHeight());
        container.style.height = `${contentHeight}px`;
        editor.layout({ width: container.offsetWidth, height: contentHeight });
      }, 200);
    };
  }
}
