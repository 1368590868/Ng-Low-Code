import {
  Component,
  ChangeDetectionStrategy,
  Type,
  DoCheck,
  OnInit,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig
} from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import {
  FormlyFieldSelectProps,
  FormlySelectOptionsPipe
} from '@ngx-formly/core/select';
import { Subject, takeUntil } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Dropdown } from 'primeng/dropdown';

interface SelectProps extends FormlyFieldProps, FormlyFieldSelectProps {
  appendTo?: string;
  autoDisplayFirst: boolean;
  virtualScrollItemSize?: number;
}

export interface FormlySelectFieldConfig
  extends FormlyFieldConfig<SelectProps> {
  type: 'select' | Type<FormlyFieldSelectComponent>;
}

@Component({
  selector: 'app-formly-field-primeng-select',
  template: `
    <p-dropdown
      #dropdown
      [filter]="filter"
      [placeholder]="props.placeholder || ''"
      [options]="ddlOptions"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [showClear]="!props.required"
      (onChange)="props.change && props.change(field, $event)"
      [appendTo]="props.appendTo || 'body'"
      [autoDisplayFirst]="!!props.autoDisplayFirst"
      [resetFilterOnHide]="true"
      (onFilter)="onFilter()"
      [virtualScroll]="virtualScroll"
      [virtualScrollItemSize]="props.virtualScrollItemSize ?? 38">
    </p-dropdown>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldSelectComponent
  extends FieldType<FieldTypeConfig<SelectProps>>
  implements OnInit, OnDestroy
{
  destroy$ = new Subject<void>();
  filter = false;
  virtualScroll = false;
  ddlOptions: any[] = [];
  @ViewChild('dropdown') dropdown!: Dropdown;

  constructor(
    private optionsPipe: FormlySelectOptionsPipe,
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
      this.asyncPipe.transform(this.optionsPipe.transform(value, this.field)) ||
      [];
    this.filter = this.ddlOptions.length > 5;
    this.virtualScroll = this.ddlOptions.length > 20;
  }

  onFilter() {
    if (this.virtualScroll) this.dropdown.scroller?.setContentPosition(null);
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
