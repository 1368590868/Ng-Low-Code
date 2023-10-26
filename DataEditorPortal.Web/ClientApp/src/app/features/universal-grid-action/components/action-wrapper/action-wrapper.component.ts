import {
  Component,
  Input,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  Output,
  EventEmitter,
  OnInit,
  HostBinding
} from '@angular/core';
import { UrlParamsService } from 'src/app/features/universal-grid/services/url-params.service';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { GridActionConfig } from '../../models/grid-config';
import { GlobalLoadingService } from 'src/app/shared';

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
  @Input() dialogContentStyleClass =
    'border-top-1 surface-border pt-4 pb-0 flex flex-column';
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

  componentRef!: ComponentRef<GridActionDirective>;
  dialogVisible = false;
  isLoading = false;
  buttonDisabled = true;

  initParams?: any;

  constructor(
    private urlParamsService: UrlParamsService,
    public globalLoadingService: GlobalLoadingService
  ) {}

  ngOnInit(): void {
    this.initParams = this.urlParamsService.initParams;
    if (
      this.initParams &&
      this.initParams.name === this.actionConfig?.props?.['gridName']
    ) {
      if (this.initParams.action === this.actionConfig?.name) {
        this.showDialog();
        this.urlParamsService.clearInitParams();
      }
    }
  }

  showDialog() {
    this.isLoading = false;
    this.dialogVisible = true;
    this.globalLoadingService.start();
    this.renderAction();
  }

  onHide() {
    if (this.hasEventHandler('onCancel'))
      (this.componentRef.instance as any).onCancel();
    this.viewContainerRef.clear();
  }

  onCancel() {
    this.dialogVisible = false;
  }

  onOk() {
    this.isLoading = true;
    if (this.hasEventHandler('onSave'))
      (this.componentRef.instance as any).onSave();
    else {
      this.dialogVisible = false;
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

    // assign initParams
    Object.assign(actionRef.instance, { initParams: this.initParams });

    // bind action events
    actionRef.instance.savedEvent.subscribe(() => {
      this.dialogVisible = false;
      this.savedEvent.emit();
    });
    actionRef.instance.cancelEvent.subscribe(() => {
      this.dialogVisible = false;
    });
    actionRef.instance.errorEvent.subscribe(() => {
      this.isLoading = false;
    });
    actionRef.instance.loadedEvent.subscribe(() => {
      this.isLoading = false;
      this.buttonDisabled = false;
    });

    // set actionRef to wrapper, for it to invoke
    this.componentRef = actionRef;
  }
}
