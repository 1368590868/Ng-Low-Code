import { Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import * as pluralize from 'pluralize';
import { ConfirmationService, TableState } from 'primeng/api';
import { DomHandler } from 'primeng/dom';
import { Table, TableHeaderCheckbox } from 'primeng/table';
import { BehaviorSubject, Subject, finalize, forkJoin, takeUntil, tap } from 'rxjs';
import { GridActionOption, GridActionWrapperOption } from 'src/app/features/universal-grid-action';
import { GridFilterParam, GridParam, SearchParam, SystemLogService, UserService } from 'src/app/shared';
import { GridColumn, GridConfig, GridData } from '../../models/grid-types';
import { GridTableService } from '../../services/grid-table.service';
import { UrlParamsService } from '../../services/url-params.service';
import { LinkedTableComponent } from '../linked-table/linked-table.component';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  providers: [UrlParamsService]
})
export class TableComponent implements OnInit, OnDestroy {
  @Input() headerSize: 'compact' | 'normal' = 'normal';
  @Input() gridName!: string;
  @Input() selectionMode: 'single' | 'multiple' | undefined | null = 'multiple';
  @Input() connectToSearch = true;
  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowUnselect = new EventEmitter<any>();
  @Output() resetData = new EventEmitter<any>();
  @Output() rowClick = new EventEmitter<any>();

  showHighlightOnly = false;

  destroy$ = new Subject();

  records: GridData[] = [];
  totalRecords = 0;

  innerSelectedRecords: GridData[] = [];

  _selection: any;
  set selection(value: any) {
    this._selection = value;
    if (Array.isArray(value)) this.selectedRecords = [...value];
    else {
      this.selectedRecords = value ? [value] : [];
    }
  }
  get selection() {
    return this._selection;
  }
  selectedRecords: GridData[] = [];

  searchModel?: SearchParam;
  fetchDataParam?: GridParam;
  fetchDataParam$ = new BehaviorSubject<GridParam | undefined>(this.fetchDataParam);
  filters?: any;
  sortMeta?: any;
  multiSortMeta?: any;
  visible = false;
  helpUrl?: SafeResourceUrl;

  loading = false;
  loaded$ = new BehaviorSubject(false);
  @ViewChild('dataTable') table!: Table;

  columnsConfig: GridColumn[] = [];
  columnsConfigCached: GridColumn[] = [];
  columns: GridColumn[] = [];
  columnSelectorVisible = false;
  columnsSelected: string[] = [];
  columnsHiddenState: string[] = [];
  columnsOrderState: string[] = [];
  columnsWidthState: number[] = [];

  stateKey!: string;
  first = 0;
  rows = 100;
  rowsPerPageOptions: any[] = [100, 200, 500, { showAll: 'Show All' }];

  tableConfig: GridConfig = { dataKey: 'Id' };
  rowActions: GridActionOption[] = [];
  tableActions: GridActionOption[] = [];
  allowAdd: boolean | undefined = false;
  allowEdit: boolean | undefined = false;
  allowDelete: boolean | undefined = false;
  allowExport = false;

  firstLoadDone = false;

  // default filter
  defaultFilter: GridFilterParam[] = [];

  // Item Type
  itemType = '';

  constructor(
    private gridTableService: GridTableService,
    private userService: UserService,
    private domSanitizer: DomSanitizer,
    private confirmationService: ConfirmationService,
    private urlParamsService: UrlParamsService,
    private systemLogService: SystemLogService,
    private route: ActivatedRoute,
    @Optional() private linkedTable: LinkedTableComponent
  ) {
    this.allowHighlightOnly = !!this.linkedTable;
  }

  ngOnInit() {
    // get item type from route
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.itemType = data['type'];
    });

    // this.reset();
    this.stateKey = `universal-grid-state-${this.gridName}`;

    forkJoin([
      // get grid config
      this.gridTableService.getTableConfig(this.gridName),
      // get grid column
      this.gridTableService.getTableColumns(this.gridName)
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

      // set grid columns
      this.restoreColumnState();
      this.columnsConfig = result[1];
      this.columnsConfigCached = JSON.parse(JSON.stringify(result[1]));
      this.restoreColumns();

      this.initUrlParams();
      this.loading = false;
      this.loaded$.next(true);
    });

    if (this.connectToSearch) {
      this.gridTableService.searchClicked$
        .pipe(
          tap(model => {
            if (model) {
              this.searchModel = model;
              this.first = 0;
              this.rows = this.tableConfig.pageSize || 100;
              this.selection = [];
              this.clearHighlighted();
              this.showHighlightOnly = false;
              this.defaultFilter = [];
              this.fetchData();
            } else {
              this.resetAndClear();
            }
          }),
          takeUntil(this.destroy$)
        )
        .subscribe();
    }
  }

  initUrlParams() {
    this.urlParamsService.getInitParams(this.gridName, this.tableConfig.dataKey);
    if (this.urlParamsService.initParams) {
      this.filters = this.urlParamsService.getIdFilter(this.tableConfig.dataKey);

      this.selection = this.urlParamsService.getTableSelection(this.tableConfig.dataKey);

      this.onFilter({ filters: this.filters });
    }
  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  getPermission(name: string) {
    return this.userService.USER.permissions?.[name + this.gridName.toUpperCase().replace(/-/g, '_')] ?? false;
  }

  openHelpUrl(url: string) {
    this.visible = true;
    this.helpUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  setAllows() {
    const isAdmin = this.userService.USER.isAdmin;
    this.allowAdd = this.tableConfig.allowAdding && (isAdmin || this.getPermission('ADD_'));
    this.allowEdit = this.tableConfig.allowEditing && (isAdmin || this.getPermission('EDIT_'));
    this.allowDelete = this.tableConfig.allowDeleting && (isAdmin || this.getPermission('DELETE_'));
    this.allowExport = isAdmin || this.getPermission('EXPORT_');
  }

  setRowActions() {
    const actions: GridActionOption[] = [];
    const viewWrapper: GridActionWrapperOption = {
      label: '',
      icon: 'pi pi-info-circle',
      class: 'flex',
      buttonStyleClass: 'p-button-text'
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

    if (this.allowEdit) {
      const editWrapper: GridActionWrapperOption = {
        label: '',
        icon: 'pi pi-file-edit',
        class: 'flex',
        buttonStyleClass: ' p-button-text',
        header: `Update ${pluralize.singular(this.tableConfig.caption || '')}`
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
        actions.push({
          name: 'add-record',
          wrapper: {
            header: `Create ${pluralize.singular(this.tableConfig.caption || '')}`,
            label: `Add ${pluralize.singular(this.tableConfig.caption || '')}`
          }
        });
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
      if (!this.allowEdit && x.name === 'edit-multiple-record') {
        return;
      }
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
    (this.table as any).highlightRowId = undefined;

    this.loading = true;
    this.fetchDataParam = this.getFetchParam();
    this.gridTableService
      .getTableData(this.gridName, this.fetchDataParam)
      .pipe(
        tap(res => {
          this.records = res.data;
          this.totalRecords = res.total;
          this.innerSelectedRecords = JSON.parse(JSON.stringify(this.selectedRecords));

          if (this.urlParamsService.initParams && !this.firstLoadDone) {
            this.selection = JSON.parse(JSON.stringify(this.selection));
          }
          this.firstLoadDone = true;
        }),
        tap(res => {
          if (this.table2Id) {
            // if table2Id is set, need to reset hightlight row after data refresh
            this.showHighlightOnly
              ? this.setHightlightRow(res.data.map(data => data[this.tableConfig.dataKey]))
              : this.setHightlightRow(this.linkedTable1Ids);
          }
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
            if (Array.isArray(fieldProp[i].value) && fieldProp[i].value.length === 0) {
              continue;
            }
            fieldProp[i].field = prop;
            fetchParam.filters.push(fieldProp[i]);
          }
        }
      }
    }

    // add default filter
    if (this.defaultFilter) {
      fetchParam.filters = fetchParam.filters.concat(this.defaultFilter);
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

    this.fetchDataParam$.next(fetchParam);

    return fetchParam;
  }

  onRowCheckBoxClick(event: MouseEvent) {
    event.stopPropagation();
  }

  onHeaderCheckbox(tableHeaderCheckboxRef: TableHeaderCheckbox) {
    if (tableHeaderCheckboxRef.checked) {
      this.selection = [...new Set([...this.records, ...this.innerSelectedRecords])];
    } else {
      this.innerSelectedRecords = this.innerSelectedRecords.filter(x => {
        return !this.records.find(y => y[this.tableConfig.dataKey] === x[this.tableConfig.dataKey]);
      });
      this.selection = [...new Set(this.innerSelectedRecords)];
    }
  }

  onRowSelect(event: any) {
    this.rowSelect.emit(event);
  }
  onRowUnselect(event: any) {
    this.rowUnselect.emit(event);
  }
  onRowClick(event: MouseEvent, data: any) {
    this.rowClick.emit({ event, data });
  }

  refresh() {
    this.systemLogService.addSiteVisitLog({
      action: 'Refresh',
      section: this.gridName,
      params: JSON.stringify(this.searchModel || {})
    });

    this.selection = [];
    this.resetData.emit();
    this.table.saveState();
    this.fetchData();
  }

  resetAndRefresh() {
    this.systemLogService.addSiteVisitLog({
      action: 'Reset & Refresh',
      section: this.gridName,
      params: JSON.stringify({})
    });

    this.reset();
    this.table.reset();
    this.table.saveState();
    this.fetchData();
  }

  resetAndClear() {
    this.reset();

    this.searchModel = undefined;
    this.first = 0;
    this.rows = this.tableConfig.pageSize || 100;
    this.clearHighlighted();
    this.defaultFilter = [];
    this.showHighlightOnly = false;
    this.fetchDataParam = this.getFetchParam();
    this.records = [];
    this.totalRecords = 0;
    this.firstLoadDone = false;

    this.table.reset();
    this.table.saveState();
  }

  reset() {
    // this.searchModel = {};
    this.filters = null;
    this.sortMeta = null;
    this.multiSortMeta = null;
    this.first = 0;
    this.selection = [];
    this.resetData.emit();
  }

  onColResize($event: any) {
    const colIndex = DomHandler.index($event.element);
    const shiftIndex = this.selectionMode === 'multiple' ? 2 : 1;

    const cols = [...this.columns];
    const width = cols[colIndex - shiftIndex].width;
    cols[colIndex - shiftIndex].width = width + $event.delta;

    this.columns = [...cols];
    this.table.destroyStyleElement(); // remove primeNg table column width style

    this.table.cd.detectChanges();
  }

  onColReorder($event: any) {
    const { dragIndex, dropIndex, columns } = $event;
    const dragCol = columns[dropIndex];
    const dropCol = dragIndex > dropIndex ? columns[dropIndex + 1] : columns[dropIndex - 1];

    const from = this.columnsConfig.findIndex(x => x.field === dragCol.field);
    const to = this.columnsConfig.findIndex(x => x.field === dropCol.field);

    this.columnsConfig.splice(to, 0, this.columnsConfig.splice(from, 1)[0]);
  }

  onStateSave(state: TableState) {
    // do not save selection to state.
    state.selection = undefined;
    state.filters = undefined;
    state.multiSortMeta = undefined;
    state.sortField = undefined;
    state.sortOrder = undefined;

    (state as any).hiddenColumns = this.columnsHiddenState;

    this.table.getStorage().setItem(this.stateKey, JSON.stringify(state));
  }

  // linked features
  allowHighlightOnly = false;
  table2Id: any | undefined;
  linkedTable1Ids: any[] | undefined;
  clearHighlighted() {
    this.table2Id = undefined;
    this.linkedTable1Ids = undefined;
    this.records = this.records.map(data => {
      data['linked_highlighted'] = '';
      return data;
    });
  }

  highlightLinkedData(table2Id: string) {
    (this.table as any).highlightRowId = undefined;
    this.table2Id = table2Id;
    if (table2Id) {
      this.systemLogService.addSiteVisitLog({
        action: 'Get Relation Data',
        section: this.gridName,
        params: JSON.stringify(table2Id)
      });

      this.selection = [];

      if (this.showHighlightOnly) {
        // set filter by linked data and reload data
        this.setHighlightFilter();
        this.fetchData();
      } else {
        // reset default filter and load linked data only
        this.defaultFilter = [];
        this.gridTableService
          .getHighlightLinkedData(this.gridName, table2Id)
          .pipe(tap(res => this.setHightlightRow(res)))
          .subscribe();
      }
    }
  }

  onShowHighlightOnlyClick() {
    this.showHighlightOnly = !this.showHighlightOnly;

    this.setHighlightFilter();
    this.fetchData();
    if (!this.showHighlightOnly) {
      this.gridTableService
        .getHighlightLinkedData(this.gridName, this.table2Id)
        .pipe(tap(res => this.setHightlightRow(res)))
        .subscribe();
    }
  }

  setHighlightFilter() {
    if (this.showHighlightOnly && this.table2Id) {
      // set filter by linked data only when table2 has value
      this.defaultFilter = [
        {
          field: 'LINK_DATA_FIELD',
          matchMode: 'in',
          value: this.table2Id
        }
      ];
    } else {
      this.defaultFilter = [];
    }
  }

  setHightlightRow(linkedTable1Ids: any[] | undefined) {
    this.linkedTable1Ids = linkedTable1Ids;

    if (this.linkedTable1Ids) {
      this.records = this.records.map(data => {
        data['linked_highlighted'] = this.linkedTable1Ids?.find(x => data[this.tableConfig.dataKey] === x)
          ? 'highlighted'
          : '';
        return data;
      });
    }
  }

  // column state, order, width, visiblity
  restoreColumnState() {
    const stateString = this.table.getStorage().getItem(this.stateKey);
    if (stateString) {
      const state = JSON.parse(stateString);
      this.columnsHiddenState = state.hiddenColumns || [];
      this.columnsOrderState = state.columnOrder;
      this.columnsWidthState = state.columnWidths.split(',');
    }
    // The first load set the default value
    this.table.setResizeTableWidth(1 + 'px');
  }

  restoreColumns() {
    const reorderedColumns: GridColumn[] = [];
    this.columnsOrderState.forEach((key, index) => {
      const col = this.columnsConfig.find(x => x.field === key);
      if (col) {
        const savedWidth = index + 2 < this.columnsWidthState.length ? this.columnsWidthState[index + 2] : 0;
        if (savedWidth) col.width = savedWidth * 1; // restore column width
        reorderedColumns.push(col);
      }
    });
    // add any new columns if not in state.
    this.columnsConfig.forEach(col => {
      if (reorderedColumns.findIndex(r => r.field === col.field) < 0) {
        reorderedColumns.push(col);
      }
    });
    this.columnsConfig = reorderedColumns;

    // // remove the hidden columns
    const visibleColumns: GridColumn[] = [];
    this.columnsConfig.forEach(x => {
      if (this.columnsHiddenState.findIndex(name => x.field === name) < 0) {
        if (!x.width) x.width = 200; // set default width
        visibleColumns.push(x);
      }
    });

    this.setTableWidth(visibleColumns);
    this.table.destroyStyleElement(); // remove primeNg table column width style

    this.columns = visibleColumns;
    this.columnsSelected = this.columns.map(x => x.field || '');
  }

  setTableWidth(visibleCols: GridColumn[]) {
    // get the width of selection colmun and action column
    const tableHead = DomHandler.findSingle(this.table.containerViewChild?.nativeElement, '.p-datatable-thead');
    const headers = DomHandler.find(tableHead, 'tr > th.selection, tr > th.action');

    let width = 0;
    headers.forEach(header => (width += DomHandler.getOuterWidth(header) * 1));
    // reset table width
    visibleCols.forEach(cols => (width += cols.width * 1));
    this.table.setResizeTableWidth(width + 'px');
  }

  onColumnsSelected(columnsSelected: string[]) {
    this.columnsHiddenState = this.columnsConfig
      .filter(x => columnsSelected.findIndex(name => name === x.field) < 0)
      .map(x => x.field || '');

    const visibleCols: GridColumn[] = [];
    this.columnsConfig.forEach(x => {
      if (this.columnsHiddenState.findIndex(name => x.field === name) < 0) {
        if (!x.width) x.width = 200; // set default width
        visibleCols.push(x);
      }
    });
    this.setTableWidth(visibleCols);
    this.columns = visibleCols;

    setTimeout(() => this.table.saveState(), 100);
  }

  resetToDefaultColumns() {
    this.columnsHiddenState = [];
    this.columnsOrderState = [];
    this.columnsWidthState = [];
    this.columnsConfig = JSON.parse(JSON.stringify(this.columnsConfigCached));
    this.restoreColumns();
    setTimeout(() => this.table.saveState(), 100);
  }

  confirmResetColumns(event: any) {
    this.confirmationService.confirm({
      target: event.target,
      message: 'Are you sure that you want to reset your table back to original view?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.resetToDefaultColumns();
      }
    });
  }
}
