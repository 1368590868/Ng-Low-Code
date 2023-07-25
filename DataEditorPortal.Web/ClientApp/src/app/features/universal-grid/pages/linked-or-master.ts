import { Component, Input, OnInit } from '@angular/core';
import { GridTableService } from '../services/grid-table.service';

@Component({
  selector: 'app-linked-or-master',
  template: `<app-linked-table
      *ngIf="!useAsMasterDetailView"
      [primaryTableName]="primaryTableName"
      [secondaryTableName]="secondaryTableName"></app-linked-table>
    <app-master-table
      *ngIf="useAsMasterDetailView"
      [masterTableName]="primaryTableName"
      [detailTableName]="secondaryTableName"></app-master-table>`,
  styles: [``]
})
export class LinkedOrMasterComponent implements OnInit {
  @Input() gridName!: string;

  primaryTableName!: string;
  secondaryTableName!: string;
  useAsMasterDetailView = false;

  constructor(private gridTableService: GridTableService) {}

  ngOnInit(): void {
    this.gridTableService.getLinkedTableConfig(this.gridName).subscribe(res => {
      this.primaryTableName = res.primaryTableName;
      this.secondaryTableName = res.secondaryTableName;
      this.useAsMasterDetailView = res.useAsMasterDetailView;
    });
  }
}
