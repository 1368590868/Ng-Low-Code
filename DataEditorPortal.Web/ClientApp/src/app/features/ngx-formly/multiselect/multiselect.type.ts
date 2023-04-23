import { AsyncPipe } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  Type,
  ViewChild,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig
} from '@ngx-formly/core';
import { FormlySelectOptionsPipe } from '@ngx-formly/core/select';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import { MultiSelect } from 'primeng/multiselect';
import { Subject, takeUntil } from 'rxjs';

interface MultiSelectProps extends FormlyFieldProps {
  appendTo?: string;
  virtualScroll: boolean;
  virtualScrollItemSize: number;
  showHeader?: boolean;
  display?: string;
  filter?: boolean;
}
export interface FormlyMultiSelectFieldConfig
  extends FormlyFieldConfig<MultiSelectProps> {
  type: 'multiSelect' | Type<FormlyFieldMultiSelectComponent>;
}

@Component({
  selector: 'app-formly-field-primeng-multiselect',
  template: `
    <p-multiSelect
      #multiSelect
      [placeholder]="props.placeholder || ''"
      [options]="ddlOptions"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [showClear]="!props.required"
      (onChange)="props.change && props.change(field, $event)"
      [virtualScroll]="virtualScroll"
      [virtualScrollItemSize]="props.virtualScrollItemSize"
      [showToggleAll]="false"
      [filter]="ddlOptions.length > 5"
      (onFilter)="onFilter()"
      [appendTo]="props.appendTo || 'body'"
      [showHeader]="
        props.showHeader === undefined
          ? ddlOptions.length > 5
          : props.showHeader
      "
      [display]="props.display || 'chip'">
    </p-multiSelect>
  `,
  providers: [FormlySelectOptionsPipe, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldMultiSelectComponent
  extends FieldType<FieldTypeConfig<MultiSelectProps>>
  implements OnInit, OnDestroy
{
  destroy$ = new Subject<void>();
  filter = false;
  virtualScroll = false;
  ddlOptions: any[] = [];
  @ViewChild('multiSelect') multiSelect!: MultiSelect;

  constructor(
    private formlySelectOptionsPipe: FormlySelectOptionsPipe,
    private asyncPipe: AsyncPipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.setOptions(this.props.options);
    this.watchData(this.props, 'options', this.destroy$).subscribe(x => {
      this.setOptions(x.newVal);
    });
  }

  setOptions(value: any) {
    this.ddlOptions =
      this.asyncPipe.transform(
        this.formlySelectOptionsPipe.transform(value, this.field)
      ) || [];
    this.filter = this.ddlOptions.length > 5;
    this.virtualScroll = this.ddlOptions.length > 20;
  }

  onFilter() {
    if (this.virtualScroll) this.multiSelect.scroller?.setContentPosition(null);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  watchData(dataParent: any, key: string, destroy$: Subject<void>) {
    const watcher$ = new Subject<{ newVal: any; oldVal: any }>();
    let value = dataParent[key];
    Object.defineProperty(dataParent, key, {
      get() {
        return value;
      },
      set(newVal) {
        const oldVal = value;
        value = newVal;
        watcher$.next({ newVal, oldVal });
      }
    });
    return watcher$.pipe(takeUntil(destroy$));
  }
}
