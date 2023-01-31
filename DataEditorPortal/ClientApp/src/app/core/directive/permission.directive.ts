import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appNgPermission]'
})
export class PermissionDirective {
  // permission list
  private hasPermission: any = {
    edit: false,
    update: true,
    delete: false
  };
  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>
  ) {}
  @Input()
  set appNgPermission(value: any) {
    if (this.hasPermission[value]) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }
}
