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

  @ViewChild('masterTable') masterTable!: TableComponent;
  @ViewChild('slaveTable') slaveTable!: TableComponent;
  primaryTableName!: string;
  secondaryTableName!: string;

  constructor(private gridTableService: GridTableService) {}

  ngOnInit(): void {
    this.gridTableService.getLinkedTableConfig(this.gridName).subscribe(res => {
      this.primaryTableName = res.primaryTableName;
      this.secondaryTableName = res.secondaryTableName;
    });
  }

  onMasterRowSelect(event: any) {
    console.log(event);
    // mark linked data highlighted
    // this.slaveTable.fetchData();
  }

  onSlaveRowSelect(event: any) {
    console.log(event);
    // mark linked data highlighted
    // this.masterTable.fetchData();
  }
}
