import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GridTableService } from '../../services/grid-table.service';
import { finalize, Subject, takeUntil, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { GridActionOption } from 'src/app/features/universal-grid-action';
import {
  GridColumn,
  GridConfig,
  GridParam,
  GridData,
  SearchParam
} from '../../models/grid-types';
import { Table } from 'primeng/table';
import { TableState } from 'primeng/api';
import { NotifyService } from 'src/app/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();

  records: GridData[] = [];
  totalRecords = 0;
  selectedRecords: GridData[] = [];

  searchModel?: SearchParam;
  lazyLoadParam: any;
  fetchDataParam?: GridParam;

  loading = true;
  @ViewChild('dt') table!: Table;
  actions: GridActionOption[] = [];

  cols: GridColumn[] = [];
  stateKey!: string;

  tableConfig: GridConfig = { dataKey: 'Id' };

  constructor(
    private route: ActivatedRoute,
    private notifyService: NotifyService,
    private gridTableService: GridTableService
  ) {}

  ngOnInit() {
    this.reset();
    this.stateKey = `universal-grid-state-${this.gridTableService.currentPortalItem}`;

    // get grid config
    this.gridTableService.getTableConfig().subscribe(result => {
      this.tableConfig = result;
    });

    // get grid column
    this.gridTableService.getTableColumns().subscribe(res => {
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
      {
        name: 'export-excel',
        wrapper: {
          label: 'Export To Excel',
          icon: 'pi pi-file-excel',
          buttonStyleClass: 'p-button-outlined'
        }
      },
      {
        name: 'remove-record',
        wrapper: {
          label: 'Remove',
          icon: 'pi pi-trash',
          buttonStyleClass: 'p-button-outlined p-button-danger'
        }
      },
      {
        name: 'user-manager',
        wrapper: {
          label: 'User Manager',
          icon: 'pi pi-plus'
        },
        props: {
          isAddForm: true
        }
      },
      {
        name: 'add-role',
        wrapper: {
          label: 'Manage Roles',
          icon: 'pi pi-plus'
        }
      },
      {
        name: 'edit-role',
        wrapper: {
          label: 'Edit Roles',
          icon: 'pi pi-plus'
        }
      },
      {
        name: 'edit-permission',
        wrapper: {
          label: 'Edit Permission',
          icon: 'pi pi-plus'
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
    this.fetchDataParam = this.getFetchParam();
    this.gridTableService
      .getTableData(this.fetchDataParam)
      .pipe(
        tap(res => {
          this.records = res.data;
          this.totalRecords = res.total;
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe();
  }

  getFetchParam() {
    const fetchParam: GridParam = {
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
              fetchParam.filters.push(fieldProp[i]);
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

  onRowCheckBoxClick(event: MouseEvent) {
    event.stopPropagation();
  }

  onRefresh() {
    this.selectedRecords = [];
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

  onStateSave(state: TableState) {
    // do not save selection to state.
    state.selection = undefined;
    this.table.getStorage().setItem(this.stateKey, JSON.stringify(state));
  }
}
