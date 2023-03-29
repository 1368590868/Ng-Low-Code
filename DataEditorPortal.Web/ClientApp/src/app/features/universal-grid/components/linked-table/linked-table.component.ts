import { Component, Input, ViewChild } from '@angular/core';
import { TableComponent } from '../table/table.component';

@Component({
  selector: 'app-linked-table',
  templateUrl: './linked-table.component.html',
  styleUrls: ['./linked-table.component.scss']
})
export class LinkedTableComponent {
  @Input() gridName!: string;

  @ViewChild('masterTable') masterTable!: TableComponent;
  @ViewChild('slaveTable') slaveTable!: TableComponent;

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
