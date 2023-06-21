import {
  Directive,
  Output,
  EventEmitter,
  Input,
  Host,
  Optional,
  Self,
  OnInit
} from '@angular/core';
import { EditorComponent } from 'ngx-monaco-editor';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'ngx-monaco-editor'
})
export class MonacoEditorDirective implements OnInit {
  constructor(@Host() @Self() @Optional() private ngxEditor: EditorComponent) {}
  @Input()
  placeholder?: string;
  @Input()
  libSource?: string;

  ngOnInit(): void {
    this.ngxEditor.onInit.subscribe(editor => this.onMonacoEditorInit(editor));
  }

  onMonacoEditorInit(editor: any) {
    new PlaceholderContentWidget(this.placeholder, editor);
    if (this.libSource) {
      const libUri = 'ts:filename/lib.d.ts';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        this.libSource,
        libUri
      );
    }
  }
}

/**
 * Represents an placeholder renderer for monaco editor
 * Roughly based on https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/codeEditor/browser/untitledTextEditorHint/untitledTextEditorHint.ts
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
class PlaceholderContentWidget implements monaco.editor.IContentWidget {
  private static readonly ID = 'editor.widget.placeholderHint';

  private domNode: HTMLElement | undefined;

  constructor(
    private readonly placeholder?: string,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private readonly editor: monaco.editor.ICodeEditor
  ) {
    // register a listener for editor code changes
    editor.onDidChangeModelContent(() => this.onDidChangeModelContent());
    // ensure that on initial load the placeholder is shown
    this.onDidChangeModelContent();
  }

  private onDidChangeModelContent(): void {
    if (this.editor.getValue() === '') {
      this.editor.addContentWidget(this);
    } else {
      this.editor.removeContentWidget(this);
    }
  }

  getId(): string {
    return PlaceholderContentWidget.ID;
  }

  getDomNode(): HTMLElement {
    if (!this.domNode) {
      this.domNode = document.createElement('div');
      this.domNode.style.width = 'max-content';
      this.domNode.style.pointerEvents = 'none';
      this.domNode.innerHTML = this.placeholder || '';
      this.domNode.style.fontStyle = 'italic';
      this.domNode.style.color = 'var(--text-color-secondary)';
      this.domNode.style.overflowWrap = 'anywhere';
      this.editor.applyFontInfo(this.domNode);
    }

    return this.domNode;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  getPosition(): monaco.editor.IContentWidgetPosition | null {
    return {
      position: { lineNumber: 1, column: 1 },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      preference: [monaco.editor.ContentWidgetPositionPreference.EXACT]
    };
  }

  dispose(): void {
    this.editor.removeContentWidget(this);
  }
}
