import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss']
})
export class EditDialogComponent implements OnInit {
  @Input() label = 'Add New';
  @Input() icon = 'pi pi-plus';

  @Input() header = 'Add / Edit';
  @Input() okText = 'Ok';
  @Input() cancelText = 'Cancel';

  visible = false;
  isLoading = false;

  ngOnInit(): void {
    throw new Error('Method not implemented.');
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
