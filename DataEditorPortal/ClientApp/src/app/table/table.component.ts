import { Component, OnInit, ViewChild } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { GridTableService } from '../grid-table.service';
import { ConfigDataService } from '../config-data.service';
import { catchError } from 'rxjs';

export interface Country {
  name?: string;
  code?: string;
}

export interface Representative {
  name?: string;
  image?: string;
}

export interface Customer {
  id?: number;
  name?: number;
  country?: Country;
  company?: string;
  date?: string;
  status?: string;
  representative?: Representative;
  data?: Customer[];
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  searchText = '';

  customers: any;

  selectedCustomers: Customer[];

  loading = true;

  @ViewChild('dt') table: any;

  cols: any[];

  totalRecords: any;

  constructor(
    private gridTableService: GridTableService,
    private primengConfig: PrimeNGConfig,
    private configData: ConfigDataService
  ) {
    this.totalRecords = 0;
    this.cols = [];
    this.customers = [];
    this.selectedCustomers = [];
    this.primengConfig.ripple = true;
  }

  ngOnInit() {
    this.configData.getTableColumns().subscribe((res: never[]) => {
      this.cols = res;
    });
  }

  loadTableLazy(event: any) {
    //simulate remote connection with a timeout
    console.log('event', event);
    const fetchParam = {
      Filters: [],
      Sorts: [],
      Searches: [],
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

    fetchParam.startIndex = event.first ?? 0;
    fetchParam.indexCount = event.rows ?? 100;

    // Please replace the current api
    // this.gridTableService
    //   .getTableData(JSON.stringify(fetchParam))
    //   .pipe(
    //     catchError(err =>
    //       this.configData.notifyErrorInPipe(err, { data: [], total: 0 })
    //     )
    //   )
    //   .subscribe(res => {
    //     this.customers = (res as any).data;
    //     this.loading = false;
    //     this.totalRecords = (res as any).total;
    //   });

    // Please remove local JSON API , this is testing purpose
    this.gridTableService.getCustomersLarge().then(customers => {
      this.customers = customers['data'];
      this.loading = false;
      this.totalRecords = customers['total'];
    });
  }
}
