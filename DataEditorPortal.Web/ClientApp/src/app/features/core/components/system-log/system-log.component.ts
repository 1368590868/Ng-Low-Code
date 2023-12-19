import { Component, OnInit, ViewChild } from '@angular/core';
import { PaginatorState } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { tap } from 'rxjs';
import { GridParam, SortMetaEvent, SystemLogData, SystemLogService } from 'src/app/shared';
import { SystemLogDialogComponent } from './system-log-dialog/system-log-dialog.component';

@Component({
  selector: 'app-system-log',
  templateUrl: './system-log.component.html',
  styleUrls: ['./system-log.component.scss']
})
export class SystemLogComponent implements OnInit {
  @ViewChild('systemDialog') systemDialog!: SystemLogDialogComponent;
  public data: any = [];
  public totalRecords = 0;
  public loading = false;

  searchModel = {};
  first = 0;
  rows = 50;
  filters?: any;
  multiSortMeta?: any;
  sortMeta?: any;
  rowsPerPageOptions: number[] = [50, 100, 150];

  constructor(private systemLogService: SystemLogService) {}

  ngOnInit() {
    this.fetchData();
  }

  onPageChange(event: PaginatorState, tableRef: Table) {
    const { first, rows } = event;
    this.first = first ?? 0;
    this.rows = rows ?? 50;
    this.fetchData();

    tableRef.resetScrollTop();
  }

  onRefresh() {
    this.first = 0;

    this.fetchData();
  }

  onFilter({ filters }: any) {
    this.first = 0;
    this.filters = filters;
    this.fetchData();
  }

  onSort(sortMeta: SortMetaEvent) {
    this.first = 0;
    this.sortMeta = sortMeta;
    this.fetchData();
  }

  getFetchParam() {
    const fetchParam: GridParam = {
      filters: [],
      sorts: [],
      searches: this.searchModel,
      startIndex: this.first,
      indexCount: this.rows
    };

    // set filters from table onFilter params
    const obj = this.filters;
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        // do stuff
        const fieldProp = obj[prop];
        for (let i = 0; i < fieldProp.length; i++) {
          if (fieldProp[i].value != null) {
            if (Array.isArray(fieldProp[i].value) && fieldProp[i].value.length === 0) {
              continue;
            }
            fieldProp[i].field = prop;
            fetchParam.filters.push(fieldProp[i]);
          }
        }
      }
    }

    // set sorts from table onSort event
    if (this.multiSortMeta && this.multiSortMeta.length > 0) {
      fetchParam.sorts = this.multiSortMeta;
    } else if (this.sortMeta) {
      fetchParam.sorts = [this.sortMeta];
    }

    // set pagination
    fetchParam.startIndex = this.first ?? 0;
    fetchParam.indexCount = this.rows;

    return fetchParam;
  }

  showDescription(row: SystemLogData) {
    this.systemDialog.show(row);
  }

  fetchData() {
    this.loading = true;
    const fetchDataParam = this.getFetchParam();
    this.systemLogService
      .getTableData(fetchDataParam)
      .pipe(
        tap(res => {
          if (res.code === 200) {
            this.data = res.data?.data;
            this.totalRecords = res.data?.total ?? 0;
          }
        })
      )
      .subscribe(() => (this.loading = false));
  }
}
