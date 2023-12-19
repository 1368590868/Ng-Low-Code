import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ImportActionService } from '../../services/import-action.service';
import { Subject, repeat, takeUntil } from 'rxjs';
@Component({
  selector: 'app-import-status',
  template: `
    <p-tag
      *ngIf="rowData?.status !== 'InProgress'"
      [pTooltip]="rowData?.result ?? ''"
      [severity]="rowData.status === 'Failed' ? 'danger' : rowData.status === 'Complete' ? 'success' : 'warning'"
      [tooltipStyleClass]="rowData.status === 'Failed' ? 'tooltip-error' : 'tooltip-success'"
      >{{ rowData.status === 'Failed' ? 'Failed' : rowData.status === 'Complete' ? 'Complete' : 'InProgress' }}</p-tag
    >
    <p-progressBar
      *ngIf="rowData?.progress !== 100"
      [value]="rowData?.progress ?? 0"
      [style]="{ height: '1rem' }"></p-progressBar>
  `,
  styles: [],
  providers: []
})
export class ImportStatusComponent implements OnInit, OnDestroy {
  @Input() rowData: any;
  @Input() file = { fileId: '' };
  @Input() gridName = '';

  destroy$ = new Subject<void>();

  constructor(@Inject('API_URL') public apiUrl: string, private importExcelService: ImportActionService) {}

  ngOnInit(): void {
    if (this.rowData?.progress !== 100 && this.rowData?.status === 'InProgress') {
      this.destroy$.next();
      this.onStartPolling();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  onStartPolling() {
    // Polling for load status
    this.importExcelService
      .getImportState(this.rowData?.id, this.gridName)
      .pipe(repeat({ delay: 1000 }), takeUntil(this.destroy$))
      .subscribe(res => {
        if (res && res.progress) {
          res.progress = Math.floor(res?.progress ?? 0);
          this.rowData = res;
          if (res?.progress === 100) {
            this.destroy$.next();
          }
        }
      });
  }
}
