import { Component } from '@angular/core';
import { GlobalLoadingService } from '../../services/global-loading.service';

@Component({
  selector: 'app-global-loading',
  template: `<div
    *ngIf="globalLoadingService.loading$ | async"
    style="z-index: 99 !important; background-color: rgba(255, 255, 255, 0.4)"
    class="p-datatable-loading-overlay p-component-overlay absolute flex justify-content-center align-items-center">
    <i [class]="'p-datatable-loading-icon pi pi-spin pi-spinner text-4xl'"></i>
  </div>`
})
export class GlobalLoadingComponent {
  constructor(public globalLoadingService: GlobalLoadingService) {}
}
