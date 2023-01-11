import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GridTableService } from '../../services/grid-table.service';
import { catchError, skip, Subject, takeUntil, tap } from 'rxjs';
import { NotifyService } from '../../../../app.module';
import { ActivatedRoute } from '@angular/router';
import { GridActionOption } from 'src/app/features/universal-grid-action/universal-grid-action.module';

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
  lazyLoadParam: any;

  loading = true;
  @ViewChild('dt') table: any;
  actions: GridActionOption[] = [];

  cols: any[] = [];
  dataKey = 'Id';
  stateKey!: string;

  constructor(
    private route: ActivatedRoute,
    private notifyService: NotifyService,
    private gridTableService: GridTableService
  ) {}

  ngOnInit() {
    this.reset();
    this.stateKey = `universal-grid-state-${this.gridTableService.currentPortalItem}`;

    // get grid column
    this.gridTableService.getTableColumns().subscribe((res: never[]) => {
      this.cols = res;
    });

    // get grid config
    this.actions = [
      {
        name: 'add-record',
        wrapper: {
          label: 'Add New',
          icon: 'pi pi-plus'
        }
      },

      { name: 'addEdit1' },
      { name: 'addEdit' },
      {
        name: 'export-excel',
        wrapper: {
          label: 'Export To Excel',
          icon: 'pi pi-file-excel',
          buttonStyleClass: 'p-button-outlined mr-2 mb-1'
        }
      },
      {
        name: 'remove-record',
        wrapper: {
          label: 'Remove',
          icon: 'pi pi-trash',
          buttonStyleClass: 'p-button-outlined p-button-danger'
        }
      }
    ];

    // subscribe search click to do searching
    this.gridTableService.searchClicked$
      .pipe(
        tap(model => {
          this.searchModel = model;
          this.fetchData();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  loadTableLazy(event: any) {
    this.lazyLoadParam = event;
    this.fetchData();
  }

  fetchData() {
    this.loading = true;
    const fetchParam = this.getFetchParam();
    this.gridTableService
      .getTableData(fetchParam)
      .pipe(
        catchError(err => {
          this.loading = false;
          return this.notifyService.notifyErrorInPipe(err, {
            data: [],
            total: 0
          });
        })
      )
      .subscribe((res: any) => {
        this.loading = false;

        if (res.errormessage) {
          this.notifyService.notifyError('Operation faild', res.errormessage);
        } else {
          const data = (res as any).data;
          const data1 = [
            ...data,
            ...data,
            ...data,
            ...data,
            ...data,
            ...data,
            ...data,
            ...data
          ];
          console.log(data1);
          const data2 = data1.map((x, index) => {
            return { ...x, Id: Math.random() };
          });
          console.log(data2);
          this.records = data;
          this.totalRecords = 100; //(res as any).total;
        }
      });
  }

  getFetchParam() {
    const fetchParam = {
      filters: [],
      sorts: [],
      searches: this.searchModel,
      startIndex: 0,
      indexCount: 50
    };

    if (this.lazyLoadParam) {
      // set filters from table lazyload event
      const obj = this.lazyLoadParam.filters;
      for (const prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          // do stuff
          const fieldProp = obj[prop];
          for (let i = 0; i < fieldProp.length; i++) {
            if (fieldProp[i].value != null) {
              fieldProp[i].field = prop;
              fetchParam.filters.push(fieldProp[i] as never);
            }
          }
        }
      }

      // set sorts from table lazyload event
      if (
        this.lazyLoadParam.multiSortMeta &&
        this.lazyLoadParam.multiSortMeta.length > 0
      ) {
        fetchParam.sorts = this.lazyLoadParam.multiSortMeta;
      }

      // set pagination
      fetchParam.startIndex = this.lazyLoadParam.first ?? 0;
      fetchParam.indexCount = this.lazyLoadParam.rows ?? 50;
    }

    return fetchParam;
  }

  onRowCheckBoxClick(event: any) {
    event.stopPropagation();
  }

  onRefresh() {
    this.table.reset();
  }

  reset() {
    this.searchModel = {};
    this.lazyLoadParam = null;
    this.totalRecords = 0;
    this.cols = [];
    this.records = [];
    this.selectedRecords = [];
  }
}
