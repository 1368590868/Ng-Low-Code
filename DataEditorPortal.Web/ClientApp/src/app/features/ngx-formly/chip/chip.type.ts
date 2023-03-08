import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import {
  FieldTypeConfig,
  FieldWrapper,
  FormlyFieldProps
} from '@ngx-formly/core';
interface ChipProps extends FormlyFieldProps {
  styleClass?: string;
  forArray?: any[];
  label: string;
}
@Component({
  selector: 'app-formly-wrapper-chip',
  template: `
    <div
      class="flex flex-wrap justify-content-start"
      style="margin-top:'-1.5rem'">
      <p-chip
        styleClass="mr-2"
        *ngFor="let item of props.forArray"
        [styleClass]="item.styleClass || 'mr-2 mt-3'"
        [label]="item.label"></p-chip>
    </div>
  `
})
export class ChipWrapperComponent extends FieldWrapper<
  FieldTypeConfig<ChipProps>
> {
  @ViewChild('fieldComponent', { read: ViewContainerRef })
  override fieldComponent!: ViewContainerRef;
}
