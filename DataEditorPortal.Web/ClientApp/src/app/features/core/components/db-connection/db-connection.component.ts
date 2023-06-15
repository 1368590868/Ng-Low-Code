import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { DictionaryData, NotifyService, PaginationEvent } from 'src/app/shared';
import { AddConnectionDialogComponent } from './add-connection-dialog/add-connection-dialog.component';
import {
  DbConnectionData,
  DbConnectionService
} from 'src/app/shared/services/db-connection.service ';

@Component({
  selector: 'app-db-connection',
  templateUrl: './db-connection.component.html',
  styleUrls: ['./db-connection.component.scss'],
  providers: [ConfirmationService]
})
export class DbConnectionComponent {
  @ViewChild('addDialog') addDialog!: AddConnectionDialogComponent;
  public data: DictionaryData[] = [];

  type = '';
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
      label: 'Delete',
      icon: 'pi pi-times'
    }
  ];

  constructor(
    private notifyService: NotifyService,
    private confirmationService: ConfirmationService,
    public dbConnectionService: DbConnectionService,
    private cdRef: ChangeDetectorRef
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

  fetchData() {
    this.loading = true;

    this.dbConnectionService.getDbConnectionList().subscribe(res => {
      if (!res.isError) {
        this.data = res;
        this.type = res[0].type;
        this.totalRecords = res.length;
        this.cdRef.detectChanges();
      }
      this.loading = false;
    });
  }

  onShowMenu(menu: Menu, $event: any, rowData: DbConnectionData) {
    this.getMenuList(rowData);
    menu.toggle($event);
  }

  onNewOpen() {
    this.addDialog.header = 'Create Datasource Connection';
    this.addDialog.model = { name: '', dbName: '' };
    this.addDialog.okText = 'Create';
    this.addDialog.showDialog();
  }

  getMenuList(rowData: DbConnectionData) {
    this.contextMenuItems.map(res => {
      switch (res.label) {
        case 'Delete':
          res.command = () => {
            this.deleteConfirm(rowData);
          };
          break;
      }
    });
  }

  deleteConfirm(rowData: DbConnectionData) {
    this.confirmationService.confirm({
      message: 'Do you want to delete this data dictionary?',
      header: 'Delete Data Dictionary',
      icon: 'pi pi-info-circle',

      accept: () => {
        this.dbConnectionService.deleteConnection(rowData).subscribe(res => {
          if (!res.isError) {
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
}
