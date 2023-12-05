import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Splitter } from 'primeng/splitter';
import { Subject, takeUntil, tap } from 'rxjs';
import { GridTableService } from '../../services/grid-table.service';
import { TableComponent } from '../table/table.component';

@Component({
  selector: 'app-master-table',
  templateUrl: './master-table.component.html',
  styleUrls: ['./master-table.component.scss']
})
export class MasterTableComponent implements OnInit, OnDestroy {
  @ViewChild(Splitter) splitterRef!: Splitter;
  @ViewChild('masterTable') masterTable!: TableComponent;
  @ViewChild('detailTable') detailTable!: TableComponent;
  @Input() masterTableName!: string;
  @Input() detailTableName!: string;

  showDetail = false;
  destroy$ = new Subject();

  constructor(private gridTableService: GridTableService) {}

  ngOnInit(): void {
    this.gridTableService.searchClicked$
      .pipe(
        tap(() => {
          this.onMasterRowClear();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  selectedMasterRow: any;
  onMasterRowClick(event: any) {
    const table1Id = event.data[this.masterTable.tableConfig.dataKey];
    if (this.selectedMasterRow != table1Id) {
      this.selectedMasterRow = table1Id;
      // open detail table
      if (!this.showDetail) {
        this.splitterRef.panelSizes = [50, 50];
        this.splitterRef.gutterSize = 4;
        this.showDetail = true;
      }

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
    } else {
      this.onMasterRowClear();
    }
  }

  onMasterRowClear() {
    this.selectedMasterRow = undefined;
    this.showDetail = false;
    this.splitterRef.gutterSize = 0;
    this.splitterRef.panelSizes = [99.9, 0.1];
  }
}
