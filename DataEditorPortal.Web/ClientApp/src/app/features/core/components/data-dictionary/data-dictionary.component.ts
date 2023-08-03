import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import {
  DictionaryData,
  NotifyService,
  DataDictionaryService,
  PaginationEvent,
  SortMetaEvent,
  GridParam
} from 'src/app/shared';
import { AddDictionaryDialogComponent } from './add-dictionary-dialog/add-dictionary-dialog.component';

@Component({
  selector: 'app-data-dictionary',
  templateUrl: './data-dictionary.component.html',
  styleUrls: ['./data-dictionary.component.scss'],
  providers: [ConfirmationService]
})
export class DataDictionaryComponent implements OnInit {
  @ViewChild('addDialog') addDialog!: AddDictionaryDialogComponent;
  public data: DictionaryData[] = [];

  loading = false;
  totalRecords = 0;
  first = 0;
  rows = 50;
  searchModel = {};
  filters?: any;
  multiSortMeta?: any;
  sortMeta?: any;
  rowsPerPageOptions: number[] = [50, 100, 150];
  contextMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi  pi-pencil'
    },
    {
      label: 'Delete',
      icon: 'pi pi-times'
    }
  ];

  constructor(
    private dataDictionaryService: DataDictionaryService,
    private notifyService: NotifyService,
    private confirmationService: ConfirmationService
  ) {}

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

  fetchData() {
    this.loading = true;
    const fetchDataParam = this.getFetchParam();

    this.dataDictionaryService
      .getDictionaryList(fetchDataParam)
      .subscribe(res => {
        if (res.code === 200) {
          this.data = res.data?.data ?? [];
          this.totalRecords = res.data?.total ?? 0;
        }
        this.loading = false;
      });
  }

  onShowMenu(menu: Menu, $event: any, rowData: DictionaryData) {
    this.getMenuList(rowData);
    menu.toggle($event);
  }

  onNewOpen() {
    this.addDialog.header = 'Create Data Dictionaries';
    this.addDialog.model = {};
    this.addDialog.okText = 'Create Dictionary';
    this.addDialog.showDialog();
  }

  getMenuList(rowData: DictionaryData) {
    this.contextMenuItems.map(res => {
      switch (res.label) {
        case 'Edit':
          {
            res.command = () => {
              this.addDialog.model = JSON.parse(JSON.stringify(rowData));
              this.addDialog.header = 'Update Data Dictionary';
              this.addDialog.okText = 'Update Dictionary';
              this.addDialog.showDialog();
            };
          }
          break;

        case 'Delete':
          res.command = () => {
            this.deleteConfirm(rowData);
          };
          break;
      }
    });
  }

  deleteConfirm(rowData: DictionaryData) {
    this.confirmationService.confirm({
      message: 'Do you want to delete this data dictionary?',
      header: 'Delete Data Dictionary',
      icon: 'pi pi-info-circle',

      accept: () => {
        this.dataDictionaryService
          .deleteDictionary(rowData.ID ?? '')
          .subscribe(res => {
            if (res.code === 200) {
              this.notifyService.notifySuccess(
                'Success',
                'Record deleted successfully'
              );
              this.fetchData();
            }
          });
      }
    });
  }

  onDiaglogSaved() {
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
}
