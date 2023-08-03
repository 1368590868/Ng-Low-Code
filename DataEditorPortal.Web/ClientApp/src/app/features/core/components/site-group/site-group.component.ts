import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import {
  NotifyService,
  PaginationEvent,
  SortMetaEvent,
  GridParam
} from 'src/app/shared';
import { SiteGroupService } from 'src/app/shared/services/site-group.service';
import { AddGroupComponent } from './add-group/add-group.component';
import { GroupData } from 'src/app/shared/models/site-group';

@Component({
  selector: 'app-site-group',
  templateUrl: './site-group.component.html',
  styleUrls: ['./site-group.component.scss'],
  providers: [ConfirmationService]
})
export class SiteGroupComponent implements OnInit {
  @ViewChild('addDialog') addDialog!: AddGroupComponent;
  public data: GroupData[] = [];

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
    private siteGroupService: SiteGroupService,
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

    this.siteGroupService.getGroupList(fetchDataParam).subscribe(res => {
      if (res.code === 200) {
        this.data = res.data?.data ?? [];
        this.totalRecords = res.data?.total ?? 0;
      }
      this.loading = false;
    });
  }

  onShowMenu(menu: Menu, $event: any, rowData: GroupData) {
    this.getMenuList(rowData);
    menu.toggle($event);
  }

  onNewOpen() {
    this.addDialog.header = 'Create Site Group';
    this.addDialog.model = {};
    this.addDialog.id = '';
    this.addDialog.okText = 'Create Group';
    this.addDialog.showDialog();
  }

  getMenuList(rowData: GroupData) {
    this.contextMenuItems.map(res => {
      switch (res.label) {
        case 'Edit':
          {
            res.command = () => {
              this.addDialog.id = rowData.ID || '';
              this.addDialog.header = 'Update Site Group';
              this.addDialog.okText = 'Update Group';
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

  deleteConfirm(rowData: GroupData) {
    this.confirmationService.confirm({
      message: 'Do you want to delete this site group?',
      header: 'Delete Site Group',
      icon: 'pi pi-info-circle',

      accept: () => {
        this.siteGroupService.deleteGroup(rowData.ID || '').subscribe(res => {
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
