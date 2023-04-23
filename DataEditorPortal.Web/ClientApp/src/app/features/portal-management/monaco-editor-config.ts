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
      '* Returns all data of the current form',
      '*/',
      'let $model : any;',
      '/**',
      '* Returns all data of the current row',
      '*/',
      'let $rowData : any;',
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
      '   * [See more](https://angular.io/api/common/DecimalPipe#digitsinfo).',
      '   * @param locale Specifies what locale format rules to use.',
      '   * [See more](https://angular.io/api/common/DecimalPipe#locale).',
      '   */',
      '     transform(value: number | string | null | undefined, digitsInfo?: string, locale?: string): string | null;',
      '}',
      'declare class DatePipe {',

      ' /**',
      '  * @param value The date expression: a `Date` object,  a number',
      '  * (milliseconds since UTC epoch), or an ISO string (https://www.w3.org/TR/NOTE-datetime).',
      '  * @param format The date/time components to include, using predefined options or a',
      '  * custom format string.  When not provided, the `DatePipe` looks for the value using the',
      '  * `DATE_PIPE_DEFAULT_OPTIONS` injection token (and reads the `dateFormat` property).',
      '  * If the token is not configured, the `mediumDate` is used as a value.',
      '* ### Pre-defined format options',
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
      ' *',
      '  * @param timezone A timezone offset (such as `+0430`), or a standard UTC/GMT, or continental US',
      '  * timezone abbreviation. When not provided, the `DatePipe` looks for the value using the',
      '  * `DATE_PIPE_DEFAULT_OPTIONS` injection token (and reads the `timezone` property). If the token',
      '  * is not configured, the end-user local system timezone is used as a value.',
      '  * @param locale A locale code for the locale format rules to use.',
      '  * When not supplied, uses the value of `LOCALE_ID`, which is `en-US` by default.',
      '  * See [Setting your app locale](guide/i18n-common-locale-id).',
      '  *',
      '  * @see `DATE_PIPE_DEFAULT_OPTIONS`',
      '  *',
      '  * @returns A date string in the desired format.',
      '  */',
      '     transform(value: Date | string | number, format?: string, timezone?: string, locale?: string): s", | null;',
      '}',
      'declare class CurrencyPipe {',
      ' /**',
      '  *',
      '  * @param value The number to be formatted as currency.',
      '  * @param currencyCode The [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code,',
      '  * such as `USD` for the US dollar and `EUR` for the euro. The default currency code can be',
      '  * configured using the `DEFAULT_CURRENCY_CODE` injection token.',
      '  * @param display The format for the currency indicator. One of the following:',
      '  *   - `code`: Show the code (such as `USD`).',
      '  *   - `symbol`(default): Show the symbol (such as `$`).',
      '  *   - `symbol-narrow`: Use the narrow symbol for locales that have two symbols for their',
      '  * currency.',
      '  * For example, the Canadian dollar CAD has the symbol `CA$` and the symbol-narrow `$`. If the',
      '  * locale has no narrow symbol, uses the standard symbol for the locale.',
      '  *   - String: Use the given string value instead of a code or a symbol.',
      '  * For example, an empty string will suppress the currency & symbol.',
      '  *   - Boolean (marked deprecated in v5): `true` for symbol and false for `code`.',
      '  *',
      '  * @param digitsInfo Decimal representation options, specified by a string',
      '  * in the following format:<br>',
      '  * <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>.',
      '  *   - `minIntegerDigits`: The minimum number of integer digits before the decimal point.',
      '  * Default is `1`.',
      '  *   - `minFractionDigits`: The minimum number of digits after the decimal point.',
      '  * Default is `2`.',
      '  *   - `maxFractionDigits`: The maximum number of digits after the decimal point.',
      '  * Default is `2`.',
      '  * If not provided, the number will be formatted with the proper amount of digits,',
      '  * depending on what the [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) specifies.',
      '  * For example, the Canadian dollar has 2 digits, whereas the Chilean peso has none.',
      '  * @param locale A locale code for the locale format rules to use.',
      '  * When not supplied, uses the value of `LOCALE_ID`, which is `en-US` by default.',
      '  * See [Setting your app locale](guide/i18n-common-locale-id).',
      '  */',
      '      transform(value: number | string, currencyCode?: string, display?: "code" | "symbol" | "symbol-narrow" | string | boolean, digitsInfo?: string, locale?: string): string | null;',
      '}',
      'declare class PercentPipe {',
      '  /**',
      '  *',
      '  * @param value The number to be formatted as a percentage.',
      '  * @param digitsInfo Decimal representation options, specified by a string',
      '  * in the following format:<br>',
      '  * <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>.',
      '  *   - `minIntegerDigits`: The minimum number of integer digits before the decimal point.',
      '  * Default is `1`.',
      '  *   - `minFractionDigits`: The minimum number of digits after the decimal point.',
      '  * Default is `0`.',
      '  *   - `maxFractionDigits`: The maximum number of digits after the decimal point.',
      '  * Default is `0`.',
      '  * @param locale A locale code for the locale format rules to use.',
      '  * When not supplied, uses the value of `LOCALE_ID`, which is `en-US` by default.',
      '  * See [Setting your app locale](https://angular.io/guide/i18n-common-locale-id).',
      '  */',
      '       transform(value: number | string, digitsInfo?: string, locale?: string): string | null;',
      '}',
      '/**',
      '* Angular All Pipes. [See more](https://angular.io/api/common#pipes)',
      '*/',
      'declare class Pipes {',
      '    /**',
      '     * Formats a value according to digit options and locale rules. Locale determines group sizing and separator, decimal point character, and other locale-specific configurations. [See more](https://angular.io/api/common/DecimalPipe)',
      '     */',
      '    static number:DecimalPipe',
      '    /**',
      '     * Formats a date value according to locale rules. [See more](https://angular.io/api/common/DatePipe)',
      '     */',
      '    static date:DatePipe',
      '    /**',
      '     * Transforms a number to a currency string, formatted according to locale rules that determine group sizing and separator, decimal-point character, and other locale-specific configurations. [See more](https://angular.io/api/common/CurrencyPipe)',
      '     */',
      '    static currency:CurrencyPipe',
      '    /**',
      '     * Transforms a number to a percentage string, formatted according to locale rules that determine group sizing and separator, decimal-point character, and other locale-specific configurations. [See more](https://angular.io/api/common/PercentPipe)',
      '     */',
      '    static percent:PercentPipe',
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
