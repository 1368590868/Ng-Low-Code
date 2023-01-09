import {
  Component,
  Input,
  ViewChild,
  ViewContainerRef,
  ComponentRef
} from '@angular/core';
import { GridActionDirective } from '../../directives/grid-action.directive';

@Component({
  selector: 'app-action-wrapper',
  templateUrl: './action-wrapper.component.html',
  styleUrls: ['./action-wrapper.component.scss']
})
export class ActionWrapperComponent {
  @Input() class = 'mr-2';
  @Input() label = 'Add New';
  @Input() icon = 'pi pi-plus';
  @Input() buttonStyleClass = '';
  @Input() header = 'Add / Edit';
  @Input() okText = 'Ok';
  @Input() cancelText = 'Cancel';
  @Input() dialogStyle = { width: '31.25rem' };

  @ViewChild('container', { read: ViewContainerRef, static: true })
  viewContainerRef!: ViewContainerRef;

  public componentRef!: ComponentRef<GridActionDirective>;
  visible = false;
  isLoading = false;

  showDialog() {
    this.isLoading = false;
    this.visible = true;
  }

  onShow() {
    if (this.hasEventHandler('onDialogShow'))
      (this.componentRef.instance as any).onDialogShow();
  }

  onHide() {
    if (this.hasEventHandler('onCancel'))
      (this.componentRef.instance as any).onCancel();
  }
  onCancel() {
    this.visible = false;
  }

  onOk() {
    this.isLoading = true;
    if (this.hasEventHandler('onSave'))
      (this.componentRef.instance as any).onSave();
    else {
      this.visible = false;
    }
  }

  hasEventHandler(event: string) {
    return (
      event in this.componentRef.instance &&
      typeof (this.componentRef.instance as any)[event] === 'function'
    );
  }
}
