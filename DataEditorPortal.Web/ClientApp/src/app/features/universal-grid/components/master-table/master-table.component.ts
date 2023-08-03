import { Component, Input, ViewChild } from '@angular/core';
import { GridTableService } from '../../services/grid-table.service';
import { TableComponent } from '../table/table.component';
import { Splitter } from 'primeng/splitter';

@Component({
  selector: 'app-master-table',
  templateUrl: './master-table.component.html',
  styleUrls: ['./master-table.component.scss']
})
export class MasterTableComponent {
  // @Input() gridName!: string;

  @ViewChild(Splitter) splitterRef!: Splitter;
  @ViewChild('masterTable') masterTable!: TableComponent;
  @ViewChild('detailTable') detailTable!: TableComponent;
  @Input() masterTableName!: string;
  @Input() detailTableName!: string;

  showDetail = false;

  constructor(private gridTableService: GridTableService) {}

  onMasterRowSelect(event: any) {
    // open detail table
    if (!this.showDetail) {
      this.splitterRef.panelSizes = [50, 50];
      this.splitterRef.gutterSize = 4;
      this.showDetail = true;
    }

    const table1Id = event.data[this.masterTable.tableConfig.dataKey];
    setTimeout(() => {
      this.detailTable.defaultFilter = [
        {
          field: 'LINK_DATA_FIELD',
          matchMode: 'in',
          value: table1Id
        }
      ];
      this.detailTable.fetchData();
    }, 100);
  }

  onMasterRowUnselect() {
    this.showDetail = false;
    this.splitterRef.gutterSize = 0;
    this.splitterRef.panelSizes = [99.9, 0.1];
  }
}
