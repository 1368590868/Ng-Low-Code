import { Component, Input, OnInit } from '@angular/core';
import {
  OnGridActionSave,
  OnGridActionCancel,
  GridActionDirective,
  OnGridActionDialogShow
} from '../../directives/grid-action.directive';

@Component({
  selector: 'app-edit-record-action',
  templateUrl: './edit-record-action.component.html',
  styleUrls: ['./edit-record-action.component.scss']
})
export class EditRecordActionComponent
  extends GridActionDirective
  implements
    OnInit,
    OnGridActionSave,
    OnGridActionCancel,
    OnGridActionDialogShow
{
  onDialogShow(): void {
    console.log('On dialog show');
  }

  onSave(): void {
    console.log('On save');
    // do ajax request
    setTimeout(() => {
      // this.savedEvent.emit();
      this.errorEvent.emit();
    }, 1000);
  }

  onCancel(): void {
    console.log('On cancel');
    // this.cancelEvent.emit();
  }

  ngOnInit(): void {
    console.log(this.selectedRecords.length);
  }
}
