import { NgxMonacoEditorConfig } from 'ngx-monaco-editor';

export const MonacoEditorConfig: NgxMonacoEditorConfig = {
  defaultOptions: {
    theme: 'myTheme',
    language: 'sql',
    lineNumbers: 'off',
    roundedSelection: true,
    minimap: { enabled: false },
    wordWrap: true,
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

    // extra libraries
    const libSource = [
      '/**',
      '* Returns all data of the current row',
      '*/',
      'let RowData : any;',
      'declare class DecimalPipe {',
      '/**',
      '   * @param value The value to be formatted.',
      '   * @param digitsInfo Sets digit and decimal representation.',
      " * The value's decimal representation is specified by the `digitsInfo`",
      ' * parameter, written in the following format:<br>',
      ' *',
      ' * ```',
      ' * {minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}',
      ' * ```',
      ' *',
      ' *  - `minIntegerDigits`:',
      ' * The minimum number of integer digits before the decimal point.',
      ' * Default is 1.',
      ' *',
      ' * - `minFractionDigits`:',
      ' * The minimum number of digits after the decimal point.',
      ' * Default is 0.',
      ' *',
      ' *  - `maxFractionDigits`:',
      ' * The maximum number of digits after the decimal point.',
      ' * Default is 3.',
      '   * @param locale Specifies what locale format rules to use.',
      '   * [See more](#locale).',
      '   */',
      '     transform(value: number | string | null | undefined, digitsInfo?: string, locale?: string): string | null;',
      '}',
      'declare class DatePipe {',
      '/** ### Pre-defined format options',
      '*',
      '* | Option        | Equivalent to                       | Examples (given in `en-US` locale)              |',
      '* |---------------|-------------------------------------|-------------------------------------------------|',
      "* | `'short'`     | `'M/d/yy, h:mm a'`                  | `6/15/15, 9:03 AM`                              |",
      "* | `'medium'`    | `'MMM d, y, h:mm:ss a'`             | `Jun 15, 2015, 9:03:01 AM`                      |",
      "* | `'long'`      | `'MMMM d, y, h:mm:ss a z'`          | `June 15, 2015 at 9:03:01 AM GMT+1`             |",
      "* | `'full'`      | `'EEEE, MMMM d, y, h:mm:ss a zzzz'` | `Monday, June 15, 2015 at 9:03:01 AM GMT+01:00` |",
      "* | `'shortDate'` | `'M/d/yy'`                          | `6/15/15`                                       |",
      "* | `'mediumDate'`| `'MMM d, y'`                        | `Jun 15, 2015`                                  |",
      "* | `'longDate'`  | `'MMMM d, y'`                       | `June 15, 2015`                                 |",
      "* | `'fullDate'`  | `'EEEE, MMMM d, y'`                 | `Monday, June 15, 2015`                         |",
      "* | `'shortTime'` | `'h:mm a'`                          | `9:03 AM`                                       |",
      "* | `'mediumTime'`| `'h:mm:ss a'`                       | `9:03:01 AM`                                    |",
      "* | `'longTime'`  | `'h:mm:ss a z'`                     | `9:03:01 AM GMT+1`                              |",
      "* | `'fullTime'`  | `'h:mm:ss a zzzz'`                  | `9:03:01 AM GMT+01:00`                          |",
      '   */',
      '     transform(value: Date | string | number, format?: string, timezone?: string, locale?: string): s", | null;',
      '}',
      'declare class CurrencyPipe {',
      '/** ### digitsInfo',
      '* The value decimal representation is specified by the `digitsInfo`',
      '* parameter, written in the following format:<br>',
      '*',
      '* ```',
      '* {minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}',
      '* ```',
      '*',
      '*  - `minIntegerDigits`:',
      '* The minimum number of integer digits before the decimal point.',
      '* Default is 1.',
      '*',
      '* - `minFractionDigits`:',
      '* The minimum number of digits after the decimal point.',
      '* Default is 0.',
      '*',
      '*  - `maxFractionDigits`:',
      '* The maximum number of digits after the decimal point.',
      '* Default is 3.',
      '   */',
      '      transform(value: number | string, currencyCode?: string, display?: "code" | "symbol" | "symbol-narrow" | string | boolean, digitsInfo?: string, locale?: string): string | null;',
      '}',
      'declare class PercentPipe {',
      '       transform(value: number | string, digitsInfo?: string, locale?: string): string | null;',
      '}',
      'declare class Pipes {',
      '    /**',
      '     * Formats a value according to digit options and locale rules. [See more](https://angular.io/api/common/DecimalPipe)',
      '     */',
      '    static decimal:DecimalPipe',
      '    /**',
      '     * Formats a value according to digit options and locale rules. [See more](https://angular.io/api/common/DatePipe)',
      '     */',
      '    static date:DatePipe',
      '    /**',
      '     * Formats a value according to digit options and locale rules. [See more](https://angular.io/api/common/CurrencyPipe)',
      '     */',
      '    static currency:CurrencyPipe',
      '    /**',
      '     * Formats a value according to digit options and locale rules. [See more](https://angular.io/api/common/PercentPipe)',
      '     */',
      '    static percentPipe:PercentPipe',
      '}'
    ].join('\n');
    const libUri = 'ts:filename/facts.d.ts';
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      libSource,
      libUri
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    monaco.editor.createModel(
      libSource,
      'typescript',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      monaco.Uri.parse(libUri)
    );
  }
};
