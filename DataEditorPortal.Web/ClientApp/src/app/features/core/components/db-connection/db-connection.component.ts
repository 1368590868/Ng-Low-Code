import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import {
  DbConnectionData,
  DbConnectionService,
  DictionaryData,
  NotifyService,
  PaginationEvent
} from 'src/app/shared';
import { AddConnectionDialogComponent } from './add-connection-dialog/add-connection-dialog.component';

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
      label: 'Edit',
      icon: 'pi pi-pencil'
    },
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
      this.data = res;
      this.type = res[0].type;
      this.totalRecords = res.length;
      this.cdRef.detectChanges();
      this.loading = false;
    });
  }

  onShowMenu(
    menu: Menu,
    $event: any,
    rowData: DbConnectionData & { usedCount: number }
  ) {
    this.getMenuList(rowData);
    menu.toggle($event);
  }

  onNewOpen() {
    this.addDialog.header = 'Create Datasource Connection';
    this.addDialog.model = { name: '', dbName: '' };
    this.addDialog.okText = 'Create';
    this.addDialog.isEdit = false;
    this.addDialog.showDialog();
  }

  getMenuList(rowData: DbConnectionData & { usedCount: number }) {
    if (rowData.usedCount > 0) {
      this.contextMenuItems = [{ label: 'Edit', icon: 'pi pi-pencil' }];
    }
    this.contextMenuItems.map(res => {
      switch (res.label) {
        case 'Edit': {
          res.command = () => {
            this.addDialog.header = 'Edit Datasource Connection';
            this.addDialog.model = JSON.parse(JSON.stringify(rowData));
            this.addDialog.okText = 'Update';
            this.addDialog.isEdit = true;
            this.addDialog.showDialog();
          };
          break;
        }
        case 'Delete': {
          res.command = () => {
            this.deleteConfirm(rowData);
          };

          break;
        }
      }
    });
  }

  deleteConfirm(rowData: DbConnectionData) {
    this.confirmationService.confirm({
      message: 'Do you want to delete this dataSource Connection?',
      header: 'Delete DataSource Connection',
      icon: 'pi pi-info-circle',

      accept: () => {
        this.dbConnectionService.deleteConnection(rowData).subscribe(res => {
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

  onDialogSaved() {
    this.fetchData();
  }
}
