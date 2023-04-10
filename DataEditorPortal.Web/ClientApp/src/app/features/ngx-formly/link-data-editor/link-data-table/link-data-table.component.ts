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
  dataSource: any[] = [];
  dataKey = '';

  selection: any = [];
  onChange?: any;
  onTouch?: any;
  disabled = false;

  innerValue: any[] = [];

  @Input()
  set value(val: any[]) {
    this.innerValue = val || [];

    this.selection = this.dataSource.filter((item: any) =>
      this.innerValue.find((x: any) => x.table2Id === item[this.dataKey])
    );
  }

  constructor(
    private linkDataTableService: LinkDataTableService,
    private cdr: ChangeDetectorRef
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
        this.innerValue.push({
          table1Id: this.table1Id,
          table2Id: item[this.dataKey]
        });
      });
    } else {
      this.dataSource.forEach((item: any) => {
        const removeIds = this.innerValue.findIndex(x => {
          return x.table2Id === item[this.dataKey];
        });

        this.innerValue.splice(removeIds, 1);
      });
    }
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

  ngOnInit(): void {
    if (this.table1Name !== '') {
      forkJoin([
        this.linkDataTableService.getTableConfig(this.table1Name),
        this.linkDataTableService.getTableData(
          this.table1Name,
          this.searchParams
        )
      ]).subscribe(([tableConfig, dataSource]) => {
        this.columnsConfig = tableConfig.columns;
        this.dataSource = dataSource || [];
        this.dataKey = tableConfig.dataKey;
        this.selection = dataSource.filter((item: any) =>
          this.innerValue.find((x: any) => x.table2Id === item[this.dataKey])
        );

        this.cdr.detectChanges();
      });
    }
  }
}
