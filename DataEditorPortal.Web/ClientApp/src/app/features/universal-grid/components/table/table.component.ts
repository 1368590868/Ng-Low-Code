import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { GridTableService } from '../../services/grid-table.service';
import {
  BehaviorSubject,
  finalize,
  forkJoin,
  Subject,
  takeUntil,
  tap
} from 'rxjs';
import {
  GridActionOption,
  GridActionWrapperOption
} from 'src/app/features/universal-grid-action';
import { GridColumn, GridConfig, GridData } from '../../models/grid-types';
import { Table } from 'primeng/table';
import { ConfirmationService, TableState } from 'primeng/api';
import {
  GridFilterParam,
  GridParam,
  SearchParam,
  SystemLogService,
  UserService
} from 'src/app/shared';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DomHandler } from 'primeng/dom';
import { UrlParamsService } from '../../services/url-params.service';
import * as pluralize from 'pluralize';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  providers: [UrlParamsService]
})
export class TableComponent implements OnInit, OnDestroy {
  @Input() headerSize: 'compact' | 'normal' = 'normal';
  @Input() gridName!: string;
  @Input() selectionMode = 'multiple';
  @Input() connectToSearch = true;
  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowUnselect = new EventEmitter<any>();
  @Output() resetData = new EventEmitter<any>();

  isShowHighlight = false;

  destroy$ = new Subject();

  records: GridData[] = [];
  totalRecords = 0;

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
    private route: ActivatedRoute
  ) {}

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

      // load column filter options
      this.columns.forEach(col => {
        if (col.field && col.filterType === 'enums') {
          this.gridTableService
            .getTableColumnFilterOptions(this.gridName, col.field)
            .subscribe(val => {
              col.filterOptions = val;
            });
        }
      });
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
              this.fetchData();
            } else {
              this.resetAndClear();
            }
          }),
          tap(() => {
            this.defaultFilter = [];
          }),
          takeUntil(this.destroy$)
        )
        .subscribe();
    }
  }

  initUrlParams() {
    this.urlParamsService.getInitParams(
      this.gridName,
      this.tableConfig.dataKey
    );
    if (this.urlParamsService.initParams) {
      this.filters = this.urlParamsService.getIdFilter(
        this.tableConfig.dataKey
      );

      this.selection = this.urlParamsService.getTableSelection(
        this.tableConfig.dataKey
      );

      this.onFilter({ filters: this.filters });
    }
  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  getPermission(name: string) {
    return (
      this.userService.USER.permissions?.[
        name + this.gridName.toUpperCase().replace(/-/g, '_')
      ] ?? false
    );
  }

  openHelpUrl(url: string) {
    this.visible = true;
    this.helpUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  setAllows() {
    const isAdmin = this.userService.USER.isAdmin;
    this.allowAdd =
      this.tableConfig.allowAdding && (isAdmin || this.getPermission('ADD_'));
    this.allowEdit =
      this.tableConfig.allowEditing && (isAdmin || this.getPermission('EDIT_'));
    this.allowDelete =
      this.tableConfig.allowDeleting &&
      (isAdmin || this.getPermission('DELETE_'));
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
            header: `Create ${pluralize.singular(
              this.tableConfig.caption || ''
            )}`,
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
      .getTableData(this.gridName, this.fetchDataParam)
      .pipe(
        tap(res => {
          this.records = res.data;
          this.totalRecords = res.total;

          if (this.urlParamsService.initParams && !this.firstLoadDone) {
            this.selection = JSON.parse(JSON.stringify(this.selection));
          }
          this.firstLoadDone = true;
        }),
        tap(() => {
          if (!this.isShowHighlight) {
            this.highlightLinkedData(this.table2Id);
          } else {
            if (this.table2Id) {
              this.records = this.records.map(data => {
                data['linked_highlighted'] = 'highlighted';
                return data;
              });
            }
          }
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe();
  }

  onlyShowHighlight(isClick = false) {
    if (isClick) this.isShowHighlight = !this.isShowHighlight;

    if (this.isShowHighlight) {
      if (this.table2Id) {
        this.defaultFilter = [
          {
            field: 'LINK_DATA_FIELD',
            matchMode: 'in',
            value: this.table2Id
          }
        ];
      }
    } else {
      this.defaultFilter = [];
    }
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
            if (
              Array.isArray(fieldProp[i].value) &&
              fieldProp[i].value.length === 0
            ) {
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

    return fetchParam;
  }

  onRowCheckBoxClick(event: MouseEvent) {
    event.stopPropagation();
  }

  onRowSelect(event: any) {
    this.rowSelect.emit(event);
  }
  onRowUnselect(event: any) {
    this.rowUnselect.emit(event);
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
    const dropCol =
      dragIndex > dropIndex ? columns[dropIndex + 1] : columns[dropIndex - 1];

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
  table2Id?: any;
  clearHighlighted() {
    this.table2Id = undefined;
    this.records = this.records.map(data => {
      data['linked_highlighted'] = '';
      return data;
    });
  }

  highlightLinkedData(table2Id: string) {
    this.table2Id = table2Id;
    if (table2Id) {
      this.systemLogService.addSiteVisitLog({
        action: 'Get Relation Data',
        section: this.gridName,
        params: JSON.stringify(table2Id)
      });

      this.selection = [];
      this.gridTableService
        .getHighlightLinkedData(this.gridName, table2Id)
        .pipe(
          tap(res => {
            this.records = this.records.map(data => {
              data['linked_highlighted'] = res.find(
                x => data[this.tableConfig.dataKey] === x
              )
                ? 'highlighted'
                : '';

              //On highlight  filter
              if (this.isShowHighlight) {
                this.onlyShowHighlight();
              } else {
                this.defaultFilter = [];
              }

              return data;
            });
          })
        )
        .subscribe();
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
  }

  restoreColumns() {
    const reorderedColumns: GridColumn[] = [];
    this.columnsOrderState.forEach((key, index) => {
      const col = this.columnsConfig.find(x => x.field === key);
      if (col) {
        const savedWidth =
          index + 2 < this.columnsWidthState.length
            ? this.columnsWidthState[index + 2]
            : 0;
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
    const tableHead = DomHandler.findSingle(
      this.table.containerViewChild.nativeElement,
      '.p-datatable-thead'
    );
    const headers = DomHandler.find(
      tableHead,
      'tr > th.selection, tr > th.action'
    );
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
      message:
        'Are you sure that you want to reset your table back to original view?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.resetToDefaultColumns();
      }
    });
  }
}
