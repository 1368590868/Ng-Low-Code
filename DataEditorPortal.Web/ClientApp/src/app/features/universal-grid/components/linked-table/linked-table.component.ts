import { AfterViewChecked, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { GridTableService } from '../../services/grid-table.service';
import { TableComponent } from '../table/table.component';

@Component({
  selector: 'app-linked-table',
  templateUrl: './linked-table.component.html',
  styleUrls: ['./linked-table.component.scss']
})
export class LinkedTableComponent implements AfterViewChecked, OnDestroy {
  @ViewChild('primaryTable') primaryTable!: TableComponent;
  @ViewChild('secondaryTable') secondaryTable!: TableComponent;
  @Input() primaryTableName!: string;
  @Input() secondaryTableName!: string;
  useAsMasterDetailView = false;
  convertTableLinkSelect: any = {};

  subPrimarySelectionChange: Subscription | undefined;
  subSecondarySelectionChange: Subscription | undefined;

  constructor(private gridTableService: GridTableService) {}

  ngAfterViewChecked(): void {
    if (this.primaryTable && !this.subPrimarySelectionChange) {
      this.subPrimarySelectionChange = this.primaryTable.table.selectionChange.subscribe((event: any) => {
        this.onPrimaryRowSelect(event || []);
      });
    }

    if (this.secondaryTable && !this.subSecondarySelectionChange) {
      this.subSecondarySelectionChange = this.secondaryTable.table.selectionChange.subscribe((event: any) => {
        this.onSecondaryRowSelect(event || []);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subPrimarySelectionChange) {
      this.subPrimarySelectionChange.unsubscribe();
    }

    if (this.subSecondarySelectionChange) {
      this.subSecondarySelectionChange.unsubscribe();
    }
  }

  onPrimaryRowSelect(event: any) {
    const kevs = event.map((item: any) => {
      return {
        key: item[this.primaryTable.tableConfig.dataKey]
      };
    });

    this.convertTableLinkSelect[this.secondaryTableName] = kevs;
  }

  onSecondaryRowSelect(event: any) {
    const kevs = event.map((item: any) => {
      return {
        key: item[this.secondaryTable.tableConfig.dataKey]
      };
    });

    this.convertTableLinkSelect[this.primaryTableName] = kevs;
  }

  selectedPrimaryRow: any;
  onPrimaryRowClick(event: any) {
    if (this.primaryTable.showHighlightOnly) return;

    this.selectedSecondaryRow = undefined;
    const dataId = event.data[this.primaryTable.tableConfig.dataKey];
    if (this.selectedPrimaryRow !== dataId) {
      this.selectedPrimaryRow = dataId;
      // mark linked data highlighted
      this.primaryTable.clearHighlighted();
      this.secondaryTable.highlightLinkedData(dataId);
    }
  }
  onPrimaryRowClear() {
    this.selectedPrimaryRow = undefined;
    this.secondaryTable.clearHighlighted();
  }

  selectedSecondaryRow: any;
  onSecondaryRowClick(event: any) {
    if (this.secondaryTable.showHighlightOnly) return;

    this.selectedPrimaryRow = undefined;
    const dataId = event.data[this.secondaryTable.tableConfig.dataKey];
    if (this.selectedSecondaryRow != dataId) {
      this.selectedSecondaryRow = dataId;
      // mark linked data highlighted
      this.secondaryTable.clearHighlighted();
      this.primaryTable.highlightLinkedData(dataId);
    }
  }
  onSecondaryRowClear() {
    this.selectedSecondaryRow = undefined;
    this.primaryTable.clearHighlighted();
  }
}
