import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GridTableService } from '../../services/grid-table.service';
import { finalize, forkJoin, Subject, takeUntil, tap } from 'rxjs';
import {
  GridActionOption,
  GridActionWrapperOption
} from 'src/app/features/universal-grid-action';
import { GridColumn, GridConfig, GridData } from '../../models/grid-types';
import { Table } from 'primeng/table';
import { TableState } from 'primeng/api';
import { GridParam, SearchParam, UserService } from 'src/app/shared';
import { evalExpression, evalStringExpression } from 'src/app/shared/utils';
import { DataFormatService } from '../../services/data-format.service';

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
  fetchDataParam?: GridParam;
  filters?: any;
  sortMeta?: any;
  multiSortMeta?: any;

  loading = true;
  @ViewChild('dataTable') table!: Table;

  cols: GridColumn[] = [];
  stateKey!: string;
  first = 0;
  rows = 100;
  rowsPerPageOptions: any[] = [100, 200, 500, { showAll: 'Show All' }];

  tableConfig: GridConfig = { dataKey: 'Id' };
  rowActions: GridActionOption[] = [];
  tableActions: GridActionOption[] = [];
  allowAdd = false;
  allowEdit = false;
  allowDelete = false;
  allowExport = false;

  firstLoadDone = false;

  formatters?: any;

  constructor(
    private gridTableService: GridTableService,
    private dataFormatService: DataFormatService,
    private userService: UserService
  ) {
    this.formatters = this.dataFormatService.getFormatters();
  }

  ngOnInit() {
    // this.reset();
    this.stateKey = `universal-grid-state-${this.gridTableService.currentPortalItem}`;

    forkJoin([
      // get grid config
      this.gridTableService.getTableConfig(),
      // get grid column
      this.gridTableService.getTableColumns()
    ]).subscribe(result => {
      this.tableConfig = result[0];
      if (this.tableConfig.pageSize && this.tableConfig.pageSize >= 10) {
        this.rows = this.tableConfig.pageSize;
        if (!this.rowsPerPageOptions.find(x => x === this.rows)) {
          const index = this.rowsPerPageOptions.findIndex(x => x > this.rows);
          this.rowsPerPageOptions.splice(index, 0, this.rows);
        }
      }
      this.setAllows();
      this.setRowActions();
      this.setTableActions();
      this.cols = result[1];

      // load column filter options
      this.cols.forEach(col => {
        if (col.field && col.filterType === 'enums') {
          this.gridTableService
            .getTableColumnFilterOptions(col.field)
            .subscribe(val => {
              col.filterOptions = val;
            });
        }
      });

      this.loading = false;
    });

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

  getPermission(name: string) {
    return (
      this.userService.USER.permissions![
        name +
          this.gridTableService.currentPortalItem
            .toUpperCase()
            .replace('-', '_')
      ] ?? false
    );
  }

  setAllows() {
    if (this.userService.USER.isAdmin) {
      this.allowAdd = true;
      this.allowEdit = true;
      this.allowDelete = true;
      this.allowExport = true;
    } else {
      this.allowAdd = this.getPermission('ADD_');
      this.allowEdit = this.getPermission('EDIT_');
      this.allowDelete = this.getPermission('DELETE_');
      this.allowExport = this.getPermission('EXPORT_');
    }
  }

  setRowActions() {
    const actions: GridActionOption[] = [];
    if (this.allowEdit) {
      const viewWrapper: GridActionWrapperOption = {
        label: '',
        icon: 'pi pi-info-circle',
        class: 'flex',
        buttonStyleClass: 'p-button-lg p-button-rounded p-button-text'
      };
      if (this.tableConfig.customViewFormName) {
        actions.push({
          name: this.tableConfig.customViewFormName,
          wrapper: viewWrapper
        });
      } else {
        actions.push({
          name: 'view-record',
          wrapper: viewWrapper
        });
      }

      const editWrapper: GridActionWrapperOption = {
        label: '',
        icon: 'pi pi-file-edit',
        class: 'flex',
        buttonStyleClass: 'p-button-lg p-button-rounded p-button-text'
      };
      if (this.tableConfig.customEditFormName) {
        actions.push({
          name: this.tableConfig.customEditFormName,
          wrapper: editWrapper
        });
      } else {
        actions.push({
          name: 'edit-record',
          wrapper: editWrapper
        });
      }
    }
    this.rowActions = [...actions];
  }

  setTableActions() {
    const actions: GridActionOption[] = [];

    if (this.allowAdd) {
      if (this.tableConfig.customAddFormName) {
        actions.push({ name: this.tableConfig.customAddFormName });
      } else {
        actions.push({ name: 'add-record' });
      }
    }
    if (this.allowDelete) {
      if (this.tableConfig.customDeleteFormName) {
        actions.push({ name: this.tableConfig.customDeleteFormName });
      } else {
        actions.push({ name: 'remove-record' });
      }
    }
    if (this.allowExport) {
      actions.push({ name: 'export-excel' });
    }

    this.tableConfig.customActions?.forEach(x => {
      actions.push(x);
    });

    this.tableActions = [...actions];
  }

  onPageChange(event: any) {
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

  onSort(sortMeta: any) {
    this.first = 0;
    this.sortMeta = sortMeta;
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
          this.firstLoadDone = true;
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

  onRowCheckBoxClick(event: MouseEvent) {
    event.stopPropagation();
  }

  refresh() {
    this.selectedRecords = [];
    this.table.saveState();
    this.fetchData();
  }

  resetAndRefresh() {
    this.reset();
    this.table.reset();
    this.table.saveState();
    this.fetchData();
  }

  reset() {
    // this.searchModel = {};
    this.filters = null;
    this.sortMeta = null;
    this.multiSortMeta = null;
    this.first = 0;
    this.selectedRecords = [];
  }

  onStateSave(state: TableState) {
    // do not save selection to state.
    state.selection = undefined;
    state.filters = undefined;
    state.multiSortMeta = undefined;
    state.sortField = undefined;
    state.sortOrder = undefined;
    this.table.getStorage().setItem(this.stateKey, JSON.stringify(state));
  }

  calcCustomTemplate(data: any, template: string) {
    const expression = evalStringExpression(template, ['row', 'pipes']);
    return evalExpression(expression, data, [data, this.formatters]);
  }
}
