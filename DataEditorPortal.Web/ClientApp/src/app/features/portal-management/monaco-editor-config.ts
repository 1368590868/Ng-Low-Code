import { NgxMonacoEditorConfig } from 'ngx-monaco-editor-v2';

export const MonacoEditorConfig: NgxMonacoEditorConfig = {
  defaultOptions: {
    theme: 'myTheme',
    language: 'sql',
    lineNumbers: 'off',
    roundedSelection: true,
    minimap: { enabled: false },
    wordWrap: false,
    fixedOverflowWidgets: true,
    contextmenu: false,
    glyphMargin: false,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 0,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    scrollbar: {
      verticalScrollbarSize: 7,
      horizontalScrollbarSize: 7
    },
    'semanticHighlighting.enabled': true
  },
  onMonacoLoad: () => {
    const legend = {
      tokenTypes: ['##MACRO##'],
      tokenModifiers: []
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    monaco.languages.registerDocumentSemanticTokensProvider('sql', {
      getLegend: function () {
        return legend;
      },
      provideDocumentSemanticTokens: function (model: any) {
        const lines = model.getLinesContent();
        const data = [];

        let prevLine = 0;
        let prevChar = 0;

        const tokenPattern = new RegExp('##([a-zA-Z]{1}[a-zA-Z0-9_]+?)##', 'g');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          for (let match = null; (match = tokenPattern.exec(line)); ) {
            data.push(
              // translate line to deltaLine
              i - prevLine,
              // for the same line, translate start to deltaStart
              prevLine === i ? match.index - prevChar : match.index,
              match[0].length,
              0,
              0
            );

            prevLine = i;
            prevChar = match.index;
          }
        }
        return {
          data: new Uint32Array(data),
          resultId: undefined
        };
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      releaseDocumentSemanticTokens: function () {}
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    monaco.editor.defineTheme('myTheme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: '##MACRO##', foreground: '615a60', fontStyle: 'italic bold' }
      ],
      colors: {
        'editor.background': '#EEEEEE'
      }
    });
  }
};
