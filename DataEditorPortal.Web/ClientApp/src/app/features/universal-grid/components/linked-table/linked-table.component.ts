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

  onPrimaryRowSelect(event: any) {
    // mark linked data highlighted
    this.primaryTable.clearHighlighted();
    this.secondaryTable.highlightLinkedData(
      event.data[this.primaryTable.tableConfig.dataKey]
    );
  }
  onPrimaryRowUnselect() {
    this.secondaryTable.clearHighlighted();
  }

  onSecondaryRowSelect(event: any) {
    // mark linked data highlighted
    this.secondaryTable.clearHighlighted();
    this.primaryTable.highlightLinkedData(
      event.data[this.secondaryTable.tableConfig.dataKey]
    );
  }
  onSecondaryRowUnselect() {
    this.primaryTable.clearHighlighted();
  }
}
