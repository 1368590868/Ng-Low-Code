import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GridTableService } from '../../services/grid-table.service';
import { catchError, skip, Subject, takeUntil, tap } from 'rxjs';
import { NotifyService } from '../../../../app.module';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();

  records: any = [];
  totalRecords: any = 0;
  selectedRecords: any[] = [];

  searchModel: any;

  loading = true;
  @ViewChild('dt') table: any;

  cols: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private notifyService: NotifyService,
    private gridTableService: GridTableService
  ) {}

  ngOnInit() {
    // subscribe route change to update currentPortalItem and then get grid column and data
    this.route.params
      .pipe(
        tap(param => {
          if (param && param['name']) {
            // reset
            this.reset();
            // get grid column
            this.gridTableService
              .getTableColumns()
              .subscribe((res: never[]) => {
                this.cols = res;
              });
          }
        }),
        skip(1),
        tap(param => {
          if (param && param['name']) {
            // get grid data, skip the first notification, as the data will be load by table lazyLoading
            this.fetchData();
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    // subscribe search click to do searching
    this.gridTableService.searchClicked$
      .pipe(
        tap(model => {
          this.searchModel = model;
          this.fetchData();
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  loadTableLazy(event: any) {
    //simulate remote connection with a timeout
    console.log('event', event);
    const fetchParam = {
      Filters: [],
      Sorts: [],
      // Searches: [],
      startIndex: 0,
      indexCount: 100
    };

    // event filters value != null
    const obj = event.filters;
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        // do stuff
        const fieldProp = obj[prop];
        for (let i = 0; i < fieldProp.length; i++) {
          if (fieldProp[i].value != null) {
            fieldProp[i].field = prop;
            fetchParam.Filters.push(fieldProp[i] as never);
          }
        }
      }
    }

    if (event.multiSortMeta && event.multiSortMeta.length > 0) {
      fetchParam.Sorts = event.multiSortMeta;
    }

    fetchParam.startIndex = event.first ?? 0;
    fetchParam.indexCount = event.rows ?? 100;

    this.fetchData(fetchParam);
  }

  fetchData(fetchParam?: any) {
    if (!fetchParam) {
      fetchParam = {
        startIndex: 0,
        indexCount: 100
      };
    }
    this.gridTableService
      .getTableData(fetchParam)
      .pipe(
        catchError(err =>
          this.notifyService.notifyErrorInPipe(err, { data: [], total: 0 })
        )
      )
      .subscribe(res => {
        this.records = (res as any).data;
        this.loading = false;
        this.totalRecords = (res as any).total;
      });
  }

  onRowCheckBoxClick(event: any) {
    event.stopPropagation();
  }

  reset() {
    this.totalRecords = 0;
    this.cols = [];
    this.records = [];
    this.selectedRecords = [];
  }
}
