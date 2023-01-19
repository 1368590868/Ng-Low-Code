import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import {
  FieldTypeConfig,
  FieldWrapper,
  FormlyFieldProps
} from '@ngx-formly/core';
interface TagProps extends FormlyFieldProps {
  styleClass?: string;
  forArray?: any[];
  label: string;
}
@Component({
  selector: 'app-formly-wrapper-tag',
  template: `
    <div
      class="flex flex-wrap justify-content-start"
      style="margin-top:'-1.5rem'">
      <p-tag
        [style]="{ 'min-width': '5rem' }"
        class="p-tag-rounded"
        styleClass="mr-2"
        *ngFor="let item of props.forArray"
        [styleClass]="item.styleClass || 'mr-2 mt-3'"
        [value]="item.label"></p-tag>
    </div>
  `
})
export class TagWrapperComponent extends FieldWrapper<
  FieldTypeConfig<TagProps>
> {
  @ViewChild('fieldComponent', { read: ViewContainerRef })
  override fieldComponent!: ViewContainerRef;
}
