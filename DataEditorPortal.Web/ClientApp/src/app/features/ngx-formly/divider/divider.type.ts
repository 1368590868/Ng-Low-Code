import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-wrapper-divider',
  template: `
    <p-divider align="left" [type]="'solid'">
      {{ to.label }}
    </p-divider>
  `
})
export class DividerWrapperComponent extends FieldWrapper {
  @ViewChild('fieldComponent', { read: ViewContainerRef })
  override fieldComponent!: ViewContainerRef;
}
