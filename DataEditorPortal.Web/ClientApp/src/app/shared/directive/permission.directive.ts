import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { UserService } from '../services/user.service';

@Directive({
  selector: '[appNgPermission]'
})
export class PermissionDirective {
  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private userService: UserService
  ) {}
  @Input()
  set appNgPermission(value: any) {
    if (this.userService.USER.permissions && this.userService.USER.permissions[value]) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }
}
