import { Directive, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appPortalEditStep]'
})
export class PortalEditStepDirective {
  @Output() saveNextEvent = new EventEmitter();
  @Output() saveDraftEvent = new EventEmitter();
  @Output() backEvent = new EventEmitter();
}
