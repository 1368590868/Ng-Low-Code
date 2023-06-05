import { Component, OnInit, ViewChild } from '@angular/core';
import { tap } from 'rxjs';
import {
  GridParam,
  PaginationEvent,
  SortMetaEvent,
  SystemLogData,
  SystemLogDialogComponent,
  SystemLogService
} from 'src/app/shared';

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

  onPageChange(event: PaginationEvent) {
    const { first, rows } = event;
    this.first = first;
    this.rows = rows;
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
          if (!res.isError) {
            this.data = res.result?.data;
            this.totalRecords = res.result?.total ?? 0;
          }
        })
      )
      .subscribe(() => (this.loading = false));
  }
}
