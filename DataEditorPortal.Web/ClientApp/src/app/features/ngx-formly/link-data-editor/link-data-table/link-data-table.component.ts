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
import { GridParam, SystemLogService } from 'src/app/shared';

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
  columnsConfig: ColumnsConfig[] = [];
  fetchDataParam?: GridParam;
  dataSource: any[] = [];
  table2IdColumn = '';
  table2Name = '';

  selectionMode = 'multiple';
  selection: any = [];
  onChange?: any;
  onTouch?: any;
  disabled = false;

  innerValue: any[] = [];

  sortMeta!: any;

  @Input()
  set value(val: any[]) {
    this.innerValue = val || [];

    this.setLinkedFlag();
    this.setSelection();
    this.sortBySelection();
  }

  constructor(
    private linkDataTableService: LinkDataTableService,
    private cdr: ChangeDetectorRef,
    private systemLogService: SystemLogService
  ) {}

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
        item.__LINKED__ = true;
        const repeat = this.innerValue.find(
          (x: any) => x.table2Id === item[this.table2IdColumn]
        );
        if (!repeat) {
          this.innerValue.push({ table2Id: item[this.table2IdColumn] });
        }
      });
    } else {
      this.dataSource.forEach((item: any) => {
        item.__LINKED__ = false;
        const removeIds = this.innerValue.findIndex(x => {
          return x.table2Id === item[this.table2IdColumn];
        });

        this.innerValue.splice(removeIds, 1);
      });
    }
    this.onChange(this.innerValue);
  }

  onRowUnselect(event: any) {
    const { data } = event;
    data.__LINKED__ = false;
    const removeIds = this.innerValue.findIndex(x => {
      return x.table2Id === data[this.table2IdColumn];
    });

    this.innerValue.splice(removeIds, 1);
    this.onChange(this.innerValue);
  }

  onRowSelect(event: any) {
    const { data } = event;
    data.__LINKED__ = true;
    if (this.selectionMode === 'multiple')
      this.innerValue.push({ table2Id: data[this.table2IdColumn] });
    else this.innerValue = [{ table2Id: data[this.table2IdColumn] }];
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
        this.setLinkedFlag();
        this.setSelection();
        this.cdr.detectChanges();
      });
  }

  onSort(sortMeta: any) {
    if (sortMeta && sortMeta.field === 'linked') {
      this.sortBySelection(sortMeta.order);
      return;
    }
    this.sortMeta = sortMeta;
    this.fetchData();
  }

  ngOnInit(): void {
    if (this.table1Name !== '') {
      this.systemLogService.addSiteVisitLog({
        action: 'Get Table Data',
        section: this.table1Name,
        params: JSON.stringify(this.getFetchParam())
      });
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
        this.table2IdColumn = tableConfig.table2IdColumn;
        this.table2Name = tableConfig.table2Name;

        this.selectionMode =
          tableConfig.isOneToMany && !tableConfig.table1IsPrimary
            ? 'single'
            : 'multiple';

        this.setLinkedFlag();
        this.setSelection();
        this.sortBySelection();

        this.cdr.detectChanges();
      });
    }
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

  setLinkedFlag() {
    this.dataSource.forEach(item => {
      item.__LINKED__ = !!this.innerValue.find(
        (x: any) => x.table2Id === item[this.table2IdColumn]
      );
    });
  }

  setSelection() {
    if (this.selectionMode === 'multiple')
      this.selection = this.dataSource.filter(x => x.__LINKED__);
    else this.selection = this.dataSource.find(x => x.__LINKED__);
  }

  sortBySelection(order = -1) {
    const data = [...this.dataSource];
    data.sort((a, b) => order * (a.__LINKED__ - b.__LINKED__));
    this.dataSource = data;
  }
}
