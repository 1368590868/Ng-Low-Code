import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import {
  DictionaryData,
  NotifyService,
  DataDictionaryService
} from 'src/app/shared';
import { PaginationEvent } from 'src/app/shared/models/system-log';
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

  totalRecords = 0;
  first = 0;
  rows = 10;
  rowsPerPageOptions: number[] = [10, 20, 50];
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
    this.getDictionaryList();
  }

  onPageChange(event: PaginationEvent) {
    const { first, rows } = event;
    this.first = first;
    this.rows = rows;
  }

  getDictionaryList() {
    this.dataDictionaryService.getDictionaryList().subscribe(res => {
      this.data = res;
      this.totalRecords = res.length;
    });
  }

  onShowMenu(menu: Menu, $event: any, rowData: DictionaryData) {
    this.getMenuList(rowData);
    menu.toggle($event);
  }

  onNewOpen() {
    this.addDialog.header = 'Add Dictionary';
    this.addDialog.model = {};
    this.addDialog.showDialog();
  }

  getMenuList(rowData: DictionaryData) {
    this.contextMenuItems.map(res => {
      switch (res.label) {
        case 'Edit':
          {
            res.command = () => {
              this.addDialog.model = JSON.parse(JSON.stringify(rowData));
              this.addDialog.header = 'Edit Dictionary';
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
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',

      accept: () => {
        this.dataDictionaryService.deleteDictionary(rowData).subscribe(res => {
          if (!res.isError) {
            this.notifyService.notifySuccess(
              'Success',
              'Record deleted successfully'
            );
            this.getDictionaryList();
          }
        });
      }
    });
  }

  onDiaglogSaved() {
    this.getDictionaryList();
  }
}
