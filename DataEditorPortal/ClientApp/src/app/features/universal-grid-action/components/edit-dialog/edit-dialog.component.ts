import { Component, Input, OnInit } from '@angular/core';
import { GridActionDirective } from '../../directives/grid-action.directive';

@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss']
})
export class EditDialogComponent extends GridActionDirective implements OnInit {
  visible = false;
  isLoading = false;

  ngOnInit(): void {
    console.log('Not Implemented');
  }

  showDialog() {
    // reset dialog and form status
    this.isLoading = false;
    this.visible = true;
  }

  onCancel() {
    this.visible = false;
  }

  onOk() {
    this.isLoading = true;

    // do ajax request
    setTimeout(() => {
      this.visible = false;
    }, 1000);
  }
}
