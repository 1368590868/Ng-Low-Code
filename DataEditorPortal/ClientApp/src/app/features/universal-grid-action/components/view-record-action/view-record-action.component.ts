import { Component } from '@angular/core';
import {
  GridActionDirective,
  OnGridActionDialogShow
} from '../../directives/grid-action.directive';

@Component({
  selector: 'app-view-record-action',
  templateUrl: './view-record-action.component.html',
  styleUrls: ['./view-record-action.component.scss']
})
export class ViewRecordActionComponent
  extends GridActionDirective
  implements OnGridActionDialogShow
{
  onDialogShow(): void {
    console.log('On dialog show');
    console.log(this.selectedRecords[0]);
  }
}
