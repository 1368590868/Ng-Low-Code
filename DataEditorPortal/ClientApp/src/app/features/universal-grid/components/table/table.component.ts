import { Component, OnInit, ViewChild } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { GridTableService } from '../../services/grid-table.service';
import { catchError } from 'rxjs';
import { NotifyService } from '../../../../app.module';

export interface Country {
  name?: string;
  code?: string;
}

export interface Representative {
  name?: string;
  image?: string;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  searchText = '';

  records: any;

  selectedRecords: any[];

  loading = true;

  @ViewChild('dt') table: any;

  cols: any[];

  totalRecords: any;

  constructor(
    private notifyService: NotifyService,
    private gridTableService: GridTableService,
    private primengConfig: PrimeNGConfig
  ) {
    this.totalRecords = 0;
    this.cols = [];
    this.records = [];
    this.selectedRecords = [];
    this.primengConfig.ripple = true;
  }

  ngOnInit() {
    this.gridTableService.getTableColumns().subscribe((res: never[]) => {
      this.cols = res;
    });
  }

  loadTableLazy(event: any) {
    //simulate remote connection with a timeout
    console.log('event', event);
    const fetchParam = {
      Filters: [],
      Sorts: [],
      // Searches: [],
      startIndex: 0,
      indexCount: 100
    };

    // event filters value != null
    const obj = event.filters;
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        // do stuff
        const fieldProp = obj[prop];
        for (let i = 0; i < fieldProp.length; i++) {
          if (fieldProp[i].value != null) {
            fieldProp[i].field = prop;
            fetchParam.Filters.push(fieldProp[i] as never);
          }
        }
      }
    }

    if (event.multiSortMeta && event.multiSortMeta.length > 0) {
      fetchParam.Sorts = event.multiSortMeta;
    }

    fetchParam.startIndex = event.first ?? 0;
    fetchParam.indexCount = event.rows ?? 100;

    this.gridTableService
      .getTableData(fetchParam)
      .pipe(
        catchError(err =>
          this.notifyService.notifyErrorInPipe(err, { data: [], total: 0 })
        )
      )
      .subscribe(res => {
        this.records = (res as any).data;
        this.loading = false;
        this.totalRecords = (res as any).total;
      });
  }

  onRowCheckBoxClick(event: any) {
    event.stopPropagation();
  }
}
