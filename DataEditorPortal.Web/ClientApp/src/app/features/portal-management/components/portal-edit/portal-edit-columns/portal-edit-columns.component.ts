import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { PickList } from 'primeng/picklist';
import { forkJoin, tap } from 'rxjs';
import { NotifyService } from 'src/app/shared';
import { DataSourceTableColumn, GridColumn } from '../../../models/portal-item';
import { PortalItemService } from '../../../services/portal-item.service';
import { PortalEditStepDirective } from '../../../directives/portal-edit-step.directive';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-portal-edit-columns',
  templateUrl: './portal-edit-columns.component.html',
  styleUrls: ['./portal-edit-columns.component.scss']
})
export class PortalEditColumnsComponent
  extends PortalEditStepDirective
  implements OnInit
{
  isLoading = true;
  isSaving = false;
  isSavingAndNext = false;
  isSavingAndExit = false;

  dataSourceTableColumns: GridColumn[] = [];
  sourceColumns: GridColumn[] = [];
  targetColumns: GridColumn[] = [];
  @ViewChild('pickList') pickList!: PickList;

  form = new FormGroup({});
  options: FormlyFormOptions = {
    formState: {
      foreignKeyOptions: []
    }
  };
  model: any = {};
  helperMessage =
    '// E.g. \r\n' +
    "// Pipes.date.transform($rowData.CREATE_DATE,'short') \r\n" +
    '// OR \r\n' +
    '// $rowData.NAME + $rowData.CHECKED';
  fields: FormlyFieldConfig[] = [
    {
      key: 'type',
      type: 'input',
      props: {
        disabled: true,
        label: 'Column Type'
      }
    },
    {
      key: 'header',
      type: 'input',
      props: {
        label: 'Column Header',
        required: true,
        placeholder: 'Column Header'
      }
    },
    {
      key: 'hidden',
      defaultValue: false,
      type: 'checkbox',
      props: {
        label: 'Hidden'
      }
    },
    {
      key: 'width',
      defaultValue: '200',
      type: 'inputNumber',
      props: {
        label: 'Column Width',
        required: true,
        placeholder: 'Enter numeric value in px'
      }
    },
    {
      key: 'template',
      type: 'monacoEditor',
      props: {
        label: 'Data Template',
        config: {
          language: 'javascript'
        },
        onInit: (editor: any) => this.onMonacoEditorInit(editor)
      },
      expressions: {
        hide: `field.parent.model.type !== 'TemplateField'`
      }
    },
    {
      key: 'fileUploadConfig',
      type: 'fileUploadConfig',
      props: {
        label: 'Attachments Configration'
      },
      expressions: {
        'props.foreignKeyOptions': 'formState.foreignKeyOptions',
        hide: `field.parent.model.type !== 'AttachmentField'`
      }
    },
    {
      fieldGroup: [
        {
          key: 'filterType',
          type: 'select',
          defaultValue: 'text',
          props: {
            label: 'Filter Type',
            placeholder: 'Please Select',
            required: true,
            showClear: false,
            options: [
              {
                label: 'None',
                value: 'none'
              },
              {
                label: 'Text',
                value: 'text'
              },
              {
                label: 'Numeric',
                value: 'numeric'
              },
              {
                label: 'Boolean',
                value: 'boolean'
              },
              {
                label: 'Date',
                value: 'date'
              },
              {
                label: 'Enums',
                value: 'enums'
              },
              {
                label: 'Attachments',
                value: 'attachments'
              }
            ]
          }
        },
        {
          key: 'sortable',
          type: 'checkbox',
          defaultValue: true,
          props: {
            label: 'Sortable'
          }
        },
        {
          key: 'format',
          type: 'input',
          props: {
            label: 'Data Format'
          },
          expressions: {
            hide: `['numeric','date'].indexOf(field.parent.model.filterType) < 0`
          }
        }
      ],
      expressions: {
        hide: `field.parent.model.type !== 'DataBaseField'`
      }
    }
  ];

  addCustomColumnModels: MenuItem[] = [
    {
      label: 'Template Column',
      icon: 'pi pi-fw pi-code',
      command: () => {
        this.onAddTemplateColumn();
      }
    },
    {
      label: 'Attachments Column',
      icon: 'pi pi-fw pi-file',
      command: () => {
        this.onAddAttachmentsColumn();
      }
    }
  ];

  constructor(
    private portalItemService: PortalItemService,
    private notifyService: NotifyService
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.portalItemService.itemId) {
      forkJoin([
        this.portalItemService.getGridColumnsConfig(),
        this.portalItemService.getDataSourceTableColumnsByPortalId()
      ]).subscribe(res => {
        this.isLoading = false;
        this.targetColumns = res[0]
          .filter(c =>
            res[1].find(
              s =>
                c.type !== 'DataBaseField' ||
                (s.columnName === c.field && s.filterType === c.filterType)
            )
          )
          .map<GridColumn>(x => {
            return {
              ...x,
              key: x.field,
              selected: true
            };
          });
        this.options.formState.foreignKeyOptions = res[1].map(x => {
          return { label: x.columnName, value: x.columnName };
        });
        this.sourceColumns = res[1]
          .filter(s => !this.targetColumns.find(t => t.field === s.columnName))
          .map<GridColumn>(x => {
            return {
              type: 'DataBaseField',
              field: x.columnName,
              key: x.columnName,
              filterType: x.filterType,
              header: x.columnName,
              width: 200,
              sortable: true
            };
          });
      });

      this.portalItemService.saveCurrentStep('columns');
    }
  }
  onMonacoEditorInit(editor: any) {
    const formControlTemplate = this.form.get('template');
    if (formControlTemplate?.value === null) {
      formControlTemplate?.setValue(this.helperMessage as never);
    }
    editor.onMouseDown(() => {
      if (formControlTemplate?.value === this.helperMessage) {
        formControlTemplate?.setValue(null as never);
        setTimeout(() => {
          formControlTemplate.markAsPristine();
        }, 100);
      }
    });
    editor.onDidBlurEditorText(() => {
      if (!formControlTemplate?.value) {
        formControlTemplate?.setValue(this.helperMessage as never);
      }
    });
    setTimeout(() => {
      formControlTemplate?.markAsPristine();
    });

    // extra libraries
    const libSource = [
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
  }

  onMoveToTarget({ items }: { items: GridColumn[] }) {
    items.forEach(item => {
      item.selected = true;
    });
  }

  onMoveToSource({ items }: { items: GridColumn[] }) {
    items.forEach(item => {
      item.selected = false;
    });
    if (items.find(x => x.field === this.model.field)) {
      this.model = {};
    }
  }

  onTargetSelect({ items }: { items: GridColumn[] }) {
    if (items.length === 1) {
      this.model = items[0];
    } else {
      this.model = {};
    }
  }

  valid() {
    if (!this.targetColumns || this.targetColumns.length === 0) {
      this.notifyService.notifyWarning(
        'Warning',
        'Please select at least one field as column.'
      );
      return false;
    }
    return true;
  }

  saveGridColumnsConfig() {
    this.isSaving = true;
    if (this.portalItemService.itemId) {
      const data = JSON.parse(JSON.stringify(this.targetColumns));
      data.forEach((x: GridColumn) => {
        if (x.template === this.helperMessage) {
          x.template = null as never;
        }
      });
      this.portalItemService
        .saveGridColumnsConfig(data)
        .pipe(
          tap(res => {
            if (res && !res.isError) {
              this.saveSucess();
            }

            this.isSaving = false;
            this.isSavingAndExit = false;
            this.isSavingAndNext = false;
          })
        )
        .subscribe();
    }
  }

  saveSucess() {
    if (this.isSavingAndNext) {
      this.saveNextEvent.emit();
    }
    if (this.isSavingAndExit) {
      this.saveDraftEvent.emit();
    }
  }

  onSaveAndNext() {
    if (!this.valid()) return;
    this.isSavingAndNext = true;
    this.saveGridColumnsConfig();
  }

  onSaveAndExit() {
    if (!this.valid()) return;
    this.isSavingAndExit = true;
    this.saveGridColumnsConfig();
  }

  onBack() {
    this.backEvent.emit();
  }

  onAddTemplateColumn() {
    let index = 1;
    for (index = 1; index <= 100; index++) {
      if (!this.targetColumns.find(x => x.field === `TEMPLATE_${index}`)) break;
    }
    this.targetColumns = [
      {
        type: 'TemplateField',
        field: `TEMPLATE_${index}`,
        filterType: 'none',
        header: `TEMPLATE_${index}`,
        width: 200,
        selected: true
      },
      ...this.targetColumns
    ];
  }

  onAddAttachmentsColumn() {
    let index = 1;
    for (index = 1; index <= 100; index++) {
      if (!this.targetColumns.find(x => x.field === `ATTACHMENT_${index}`))
        break;
    }
    this.targetColumns = [
      {
        type: 'AttachmentField',
        field: `ATTACHMENT_${index}`,
        filterType: 'attachments',
        header: `ATTACHMENT_${index}`,
        width: 200,
        selected: true
      },
      ...this.targetColumns
    ];
  }

  onRemoveCustomColumn(event: MouseEvent, field: GridColumn) {
    event.stopPropagation();
    const index = this.targetColumns.findIndex(x => x.field === field.field);
    if (index >= 0) {
      this.targetColumns.splice(index, 1);
      if (field.field === this.model.field) {
        this.model = {};
      }
    }
  }
}
