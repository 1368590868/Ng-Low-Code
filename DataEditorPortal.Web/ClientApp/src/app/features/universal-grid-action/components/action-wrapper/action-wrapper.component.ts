import {
  Component,
  ComponentRef,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { UrlParamsService } from 'src/app/features/universal-grid/services/url-params.service';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { GridActionConfig } from '../../models/grid-config';

@Component({
  selector: 'app-action-wrapper',
  templateUrl: './action-wrapper.component.html',
  styleUrls: ['./action-wrapper.component.scss']
})
export class ActionWrapperComponent implements OnInit {
  @Input() class = 'mr-2';
  @Input() label = 'Add New';
  @Input() icon = 'pi pi-plus';
  @Input() buttonStyleClass = '';
  @Input() header = 'Add / Edit';
  @Input() okText = 'Ok';
  @Input() cancelText = 'Cancel';
  @Input() dialogStyle = { width: '31.25rem' };
  @Input() dialogContentStyleClass = 'border-top-1 surface-border pt-4 pb-0 flex flex-column';
  @Input() dialogModal = true;
  @Input() set visible(val: boolean) {
    if (val) this.display = 'block';
    else this.display = 'none';
  }
  @HostBinding('style.display') display = 'block';
  @Input() dialogHideFooter = false;

  @Input() actionConfig!: GridActionConfig;

  @Output() savedEvent = new EventEmitter();

  @ViewChild('container', { read: ViewContainerRef, static: true })
  viewContainerRef!: ViewContainerRef;
  @ViewChild(LoadingComponent) loadingRef!: LoadingComponent;
  @ViewChild(Dialog) dialogRef!: Dialog;

  componentRef!: ComponentRef<GridActionDirective>;
  dialogVisible = false;
  isSaving = false;
  buttonDisabled = true;
  loaded = false;

  initParams?: any;

  constructor(private urlParamsService: UrlParamsService, private confirmationService: ConfirmationService) {}

  ngOnInit(): void {
    this.initParams = this.urlParamsService.initParams;
    if (this.initParams && this.initParams.name === this.actionConfig?.props?.['gridName']) {
      if (this.initParams.action === this.actionConfig?.name) {
        this.showDialog();
        this.urlParamsService.clearInitParams();
      }
    }
  }

  showDialog() {
    this.loaded = false;
    if (!this.dialogVisible) {
      this.dialogVisible = true;
      this.loadingRef.start();
      this.renderAction();
    } else {
      this.dialogRef.moveOnTop();
    }
  }

  onHide() {
    if (this.hasEventHandler('onCancel')) (this.componentRef.instance as any).onCancel();
    this.viewContainerRef.clear();
  }

  onCancel() {
    this.closeDialog();
  }

  onOk() {
    this.isSaving = true;
    if (this.hasEventHandler('onSave')) (this.componentRef.instance as any).onSave();
    else {
      this.dialogVisible = false;
      this.isSaving = false;
    }
  }

  hasEventHandler(event: string) {
    return event in this.componentRef.instance && typeof (this.componentRef.instance as any)[event] === 'function';
  }

  renderAction() {
    this.viewContainerRef.clear();

    const actionRef = this.viewContainerRef.createComponent<GridActionDirective>(this.actionConfig.component);

    // assign action data;
    if (this.actionConfig.props) {
      if (actionRef instanceof ComponentRef) {
        Object.assign(actionRef.instance, this.actionConfig.props);
      }
    }

    // assign initParams
    Object.assign(actionRef.instance, { initParams: this.initParams });

    // bind action events
    actionRef.instance.savedEvent.subscribe(() => {
      this.dialogVisible = false;
      this.isSaving = false;
      this.savedEvent.emit();
    });
    actionRef.instance.cancelEvent.subscribe(() => {
      this.closeDialog();
      this.isSaving = false;
    });
    actionRef.instance.errorEvent.subscribe(() => {
      this.isSaving = false;
    });
    actionRef.instance.loadedEvent.subscribe(() => {
      this.buttonDisabled = false;
      this.loaded = true;
    });

    // set actionRef to wrapper, for it to invoke
    this.componentRef = actionRef;
  }

  onVisibleChange(visible: boolean) {
    this.closeDialog(visible);
  }

  closeDialog(visible = false) {
    if (this.componentRef.instance.isFormUnmodified === undefined) {
      this.dialogVisible = visible;
      return;
    }

    if (this.componentRef.instance.isFormUnmodified?.()) {
      this.dialogVisible = false;
    } else {
      this.confirmationService.confirm({
        key: 'confirm-dialog',
        rejectButtonStyleClass: 'p-button-text',
        acceptButtonStyleClass: 'ml-1',
        header: 'Close Form',
        message: `You have unsaved changes in the form \n Are you sure you want to close the form?`,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.dialogVisible = false;
          this.confirmationService.close();
        },
        reject: () => {
          this.confirmationService.close();
        }
      });
    }
  }
}
