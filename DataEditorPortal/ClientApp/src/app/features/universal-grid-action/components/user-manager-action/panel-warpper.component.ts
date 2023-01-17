import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-wrapper-panel',
  template: `
    <p-divider align="left" type="dashed">
      <b>{{ to.label }}</b>
    </p-divider>
  `
})
export class PanelWrapperComponent extends FieldWrapper {
  @ViewChild('fieldComponent', { read: ViewContainerRef })
  override fieldComponent!: ViewContainerRef;
}
