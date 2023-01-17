import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';

@Component({
  selector: 'app-add-portal-dialog',
  templateUrl: './add-portal-dialog.component.html',
  styleUrls: ['./add-portal-dialog.component.scss']
})
export class AddPortalDialogComponent {
  @Input() class = 'mr-2';
  @Input() label = 'Add New';
  @Input() icon = 'pi pi-plus';
  @Input() buttonStyleClass = '';
  @Input() header = 'Add / Edit';
  @Input() okText = 'Ok';
  @Input() cancelText = 'Cancel';
  @Input() dialogStyle = { width: '40rem' };
  @Input() isAddForm = false;

  @ViewChild('container', { read: ViewContainerRef, static: true })
  viewContainerRef!: ViewContainerRef;

  visible = false;
  isLoading = false;
  buttonDisabled = true;

  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'name',
      type: 'input',
      className: 'w-full',
      props: {
        label: 'Folder Name',
        placeholder: 'Portal Name'
      }
    },
    {
      key: 'label',
      type: 'input',
      props: {
        label: 'Menu Label',
        placeholder: 'Menu Label'
      }
    },
    {
      key: 'Icon',
      type: 'input',
      props: {
        label: 'Icon',
        placeholder: 'Icon'
      }
    },
    {
      key: 'description',
      type: 'textarea',
      className: 'w-full',
      props: {
        label: 'Description',
        placeholder: 'description'
      }
    }
  ];

  showDialog() {
    this.isLoading = false;
    this.visible = true;
  }

  onShow() {
    this.buttonDisabled = false;
  }

  onHide() {
    console.log('onHide');
  }
  onCancel() {
    this.visible = false;
  }

  onOk() {
    this.isLoading = true;

    this.visible = false;
  }

  onFormSubmit(model: any) {
    console.log(model);
  }
}
