import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  forwardRef
} from '@angular/core';
import { ColumnsConfig } from '../link-data-editor.type';
import { LinkDataTableService } from '../service/link-data-table.service';
import { forkJoin } from 'rxjs';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { GridParam } from 'src/app/shared';
import { evalExpression, evalStringExpression } from 'src/app/shared/utils';
import { DataFormatService } from 'src/app/features/universal-grid/services/data-format.service';

@Component({
  selector: 'app-link-data-table',
  templateUrl: './link-data-table.component.html',
  styleUrls: ['./link-data-table.component.scss'],
  providers: [
    {
      provide: CUSTOM_ELEMENTS_SCHEMA,
      useExisting: LinkDataTableComponent,
      multi: true
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LinkDataTableComponent),
      multi: true
    }
  ]
})
export class LinkDataTableComponent implements OnInit, ControlValueAccessor {
  @Input() table1Name!: string;
  @Input() searchParams: any = {};
  @Input() table1Id?: string;
  columnsConfig: ColumnsConfig[] = [];
  fetchDataParam?: GridParam;
  dataSource: any[] = [];
  dataKey = '';
  table2Name = '';

  selection: any = [];
  onChange?: any;
  onTouch?: any;
  disabled = false;

  innerValue: any[] = [];

  sortMeta!: any;
  formatters?: any;

  @Input()
  set value(val: any[]) {
    this.innerValue = val || [];

    this.selection = this.dataSource.filter((item: any) =>
      this.innerValue.find((x: any) => x.table2Id === item[this.dataKey])
    );
  }

  constructor(
    private linkDataTableService: LinkDataTableService,
    private cdr: ChangeDetectorRef,
    private dataFormatService: DataFormatService
  ) {
    this.formatters = this.dataFormatService.getFormatters();
  }

  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onRowAllSelect(event: any) {
    const { checked } = event;
    if (checked) {
      this.dataSource.forEach((item: any) => {
        const repeat = this.innerValue.find(
          (x: any) => x.table2Id === item[this.dataKey]
        );
        if (!repeat) {
          this.innerValue.push({
            table1Id: this.table1Id,
            table2Id: item[this.dataKey]
          });
        }
      });
    } else {
      this.dataSource.forEach((item: any) => {
        const removeIds = this.innerValue.findIndex(x => {
          return x.table2Id === item[this.dataKey];
        });

        this.innerValue.splice(removeIds, 1);
      });
    }
    console.log(this.innerValue);
    this.onChange(this.innerValue);
  }

  onRowUnselect(event: any) {
    const { data } = event;
    const removeIds = this.innerValue.findIndex(x => {
      return x.table2Id === data[this.dataKey];
    });

    this.innerValue.splice(removeIds, 1);
    this.onChange(this.innerValue);
  }

  onRowSelect(event: any) {
    const { data } = event;
    this.innerValue.push({
      table1Id: this.table1Id,
      table2Id: data[this.dataKey]
    });
    this.onChange(this.innerValue);
  }

  onRowCheckBoxClick(event: MouseEvent) {
    event.stopPropagation();
  }

  fetchData() {
    this.fetchDataParam = this.getFetchParam();
    this.linkDataTableService
      .getTableData(this.table1Name, this.fetchDataParam)
      .subscribe(dataSource => {
        this.dataSource = dataSource || [];
        this.selection = dataSource.filter((item: any) =>
          this.innerValue.find((x: any) => x.table2Id === item[this.dataKey])
        );
        this.cdr.detectChanges();
      });
  }

  onSort(sortMeta: any) {
    this.sortMeta = sortMeta;
    this.fetchData();
  }

  ngOnInit(): void {
    if (this.table1Name !== '') {
      this.fetchDataParam = this.getFetchParam();
      forkJoin([
        this.linkDataTableService.getTableConfig(this.table1Name),
        this.linkDataTableService.getTableData(
          this.table1Name,
          this.fetchDataParam
        )
      ]).subscribe(([tableConfig, dataSource]) => {
        this.columnsConfig = tableConfig.columns;
        this.dataSource = dataSource || [];
        this.dataKey = tableConfig.dataKey;
        this.table2Name = tableConfig.table2Name;
        this.selection = dataSource.filter((item: any) =>
          this.innerValue.find((x: any) => x.table2Id === item[this.dataKey])
        );

        this.cdr.detectChanges();
      });
    }
  }

  calcCustomTemplate(data: any, template: string) {
    const expression = evalStringExpression(template, ['$rowData', 'Pipes']);
    return evalExpression(expression, data, [data, this.formatters]);
  }

  getFetchParam() {
    const fetchParam: any = {
      filters: [],
      sorts: [],
      searches: this.searchParams
    };

    // set filters from table onFilter params
    // const obj = this.filters;
    // for (const prop in obj) {
    //   if (Object.prototype.hasOwnProperty.call(obj, prop)) {
    //     // do stuff
    //     const fieldProp = obj[prop];
    //     for (let i = 0; i < fieldProp.length; i++) {
    //       if (fieldProp[i].value != null) {
    //         fieldProp[i].field = prop;
    //         fetchParam.filters.push(fieldProp[i]);
    //       }
    //     }
    //   }
    // }

    if (this.sortMeta) {
      fetchParam.sorts = [this.sortMeta];
    }
    return fetchParam;
  }
}
