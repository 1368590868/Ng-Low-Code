import { Component, Input, ViewChild } from '@angular/core';
import { GridTableService } from '../../services/grid-table.service';
import { TableComponent } from '../table/table.component';

@Component({
  selector: 'app-linked-table',
  templateUrl: './linked-table.component.html',
  styleUrls: ['./linked-table.component.scss']
})
export class LinkedTableComponent {
  @ViewChild('primaryTable') primaryTable!: TableComponent;
  @ViewChild('secondaryTable') secondaryTable!: TableComponent;
  @Input() primaryTableName!: string;
  @Input() secondaryTableName!: string;
  useAsMasterDetailView = false;

  constructor(private gridTableService: GridTableService) {}

  selectedPrimaryRow: any;
  onPrimaryRowSelect(event: any) {
    this.selectedSecondaryRow = undefined;
    const dataId = event.data[this.primaryTable.tableConfig.dataKey];
    if (this.selectedPrimaryRow !== dataId) {
      this.selectedPrimaryRow = dataId;
      // mark linked data highlighted
      this.primaryTable.clearHighlighted();
      this.secondaryTable.highlightLinkedData(dataId);
    } else {
      this.onPrimaryRowClear();
    }
  }
  onPrimaryRowClear() {
    this.selectedPrimaryRow = undefined;
    this.secondaryTable.clearHighlighted();
  }

  selectedSecondaryRow: any;
  onSecondaryRowClick(event: any) {
    this.selectedPrimaryRow = undefined;
    const dataId = event.data[this.secondaryTable.tableConfig.dataKey];

    if (this.selectedSecondaryRow != dataId) {
      this.selectedSecondaryRow = dataId;
      // mark linked data highlighted
      this.secondaryTable.clearHighlighted();
      this.primaryTable.highlightLinkedData(dataId);
    } else {
      this.onSecondaryRowClear();
    }
  }
  onSecondaryRowClear() {
    this.selectedSecondaryRow = undefined;
    this.primaryTable.clearHighlighted();
  }
}
