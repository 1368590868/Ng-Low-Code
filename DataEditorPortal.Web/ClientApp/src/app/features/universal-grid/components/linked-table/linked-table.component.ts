import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { GridTableService } from '../../services/grid-table.service';
import { TableComponent } from '../table/table.component';

@Component({
  selector: 'app-linked-table',
  templateUrl: './linked-table.component.html',
  styleUrls: ['./linked-table.component.scss']
})
export class LinkedTableComponent implements OnInit {
  @Input() gridName!: string;

  @ViewChild('primaryTable') primaryTable!: TableComponent;
  @ViewChild('secondaryTable') secondaryTable!: TableComponent;
  primaryTableName!: string;
  secondaryTableName!: string;

  constructor(private gridTableService: GridTableService) {}

  ngOnInit(): void {
    this.gridTableService.getLinkedTableConfig(this.gridName).subscribe(res => {
      this.primaryTableName = res.primaryTableName;
      this.secondaryTableName = res.secondaryTableName;
    });
  }

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
