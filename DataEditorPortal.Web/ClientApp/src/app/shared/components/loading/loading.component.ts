import { Component, Input, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RequestLogUtility } from '../../services/request-log-utility';

@Component({
  selector: 'app-loading',
  template: `<div
    *ngIf="loading$ | async"
    style="z-index: 99 !important; background-color: rgba(255, 255, 255, 0.6); border-radius: var(--border-radius)"
    class="p-datatable-loading-overlay p-component-overlay absolute flex justify-content-center align-items-center">
    <i [class]="'p-datatable-loading-icon pi pi-spin pi-spinner text-4xl'"></i>
  </div>`
})
export class LoadingComponent implements OnDestroy {
  @Input() mode: 'always' | 'once' = 'always';
  @Input() autoStart = true;

  destory$ = new Subject();
  loading$ = new Subject<boolean>();
  isStart = false;
  requestArr: number[] = [];
  callback: any;

  constructor(private requestLogUtility: RequestLogUtility) {
    this.requestLogUtility.start$
      .pipe(takeUntil(this.destory$))
      .subscribe(t => this.add(t));
    this.requestLogUtility.end$
      .pipe(takeUntil(this.destory$))
      .subscribe(t => this.remove(t));
    if (this.autoStart) this.start();
  }
  ngOnDestroy(): void {
    this.destory$.next(null);
    this.destory$.complete();
  }

  start() {
    this.requestArr = [];
    this.isStart = true;
    this.loading$.next(false);
  }

  add(timestep: number) {
    if (!this.isStart) return;
    if (this.callback) clearTimeout(this.callback);

    this.requestArr.push(timestep);
    if (this.requestArr.length === 1) {
      setTimeout(() => {
        this.loading$.next(true);
      }, 0);
    }
  }

  remove(timestep: number) {
    if (!this.isStart) return;
    if (this.callback) clearTimeout(this.callback);
    const index = this.requestArr.findIndex(x => x === timestep);
    if (index > -1) {
      this.requestArr.splice(index, 1);
    }

    this.callback = setTimeout(() => {
      if (this.requestArr.length === 0) {
        if (this.mode === 'once') this.isStart = false;
        this.loading$.next(false);
      }
    }, 100);
  }
}
