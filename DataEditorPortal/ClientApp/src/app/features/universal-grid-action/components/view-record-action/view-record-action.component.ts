import { Component } from '@angular/core';
import {
  GridActionDirective,
  OnGridActionDialogShow
} from '../../directives/grid-action.directive';

export interface ViewColumn {
  name?: string;
  value?: string;
}
@Component({
  selector: 'app-view-record-action',
  templateUrl: './view-record-action.component.html',
  styleUrls: ['./view-record-action.component.scss']
})
export class ViewRecordActionComponent
  extends GridActionDirective
  implements OnGridActionDialogShow
{
  viewData: ViewColumn[];
  loading = true;

  constructor() {
    super();
    this.viewData = [];
  }
  onDialogShow(): void {
    if (this.selectedRecords[0] !== undefined) {
      const key = Object.keys(this.selectedRecords[0]).map(key => {
        return { name: key, value: this.selectedRecords[0][key] };
      });
      this.viewData = key;
      this.loading = false;
      this.loadedEvent.emit();
    }
  }
}
