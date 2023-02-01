import {
  Component,
  Input,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  Output,
  EventEmitter
} from '@angular/core';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { GridActionConfig } from '../../models/grid-config';

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

  @Input() actionConfig!: GridActionConfig;
  @Input() fetchDataParam!: any;

  @Output() savedEvent = new EventEmitter();

  @ViewChild('container', { read: ViewContainerRef, static: true })
  viewContainerRef!: ViewContainerRef;

  componentRef!: ComponentRef<GridActionDirective>;
  visible = false;
  isLoading = false;
  buttonDisabled = true;

  showDialog() {
    this.isLoading = false;
    this.visible = true;
    this.renderAction();
  }

  onShow() {
    if (this.hasEventHandler('onDialogShow')) {
      (this.componentRef.instance as any).onDialogShow();
    } else {
      this.buttonDisabled = false;
    }
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

  renderAction() {
    this.viewContainerRef.clear();

    const actionRef =
      this.viewContainerRef.createComponent<GridActionDirective>(
        this.actionConfig.component
      );

    // assign action data;
    if (this.actionConfig.props) {
      if (actionRef instanceof ComponentRef) {
        Object.assign(actionRef.instance, this.actionConfig.props);
      }
    }

    // actionRef.instance.selectedRecords = this.selectedRecords;
    // actionRef.instance.recordKey = this.recordKey;
    actionRef.instance.fetchDataParam = this.fetchDataParam;

    // bind action events
    actionRef.instance.savedEvent.asObservable().subscribe(() => {
      this.visible = false;
      this.savedEvent.emit();
    });
    actionRef.instance.errorEvent.asObservable().subscribe(() => {
      this.isLoading = false;
    });
    actionRef.instance.loadedEvent.asObservable().subscribe(() => {
      this.isLoading = false;
      this.buttonDisabled = false;
    });

    // set actionRef to wrapper, for it to invoke
    this.componentRef = actionRef;
  }
}
