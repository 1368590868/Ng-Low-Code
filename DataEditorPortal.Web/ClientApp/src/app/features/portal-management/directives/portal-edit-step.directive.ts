import { Directive, Output, EventEmitter, Input } from '@angular/core';

@Directive({
  selector: '[appPortalEditStep]'
})
export class PortalEditStepDirective {
  @Input() isLastStep = false;
  @Output() saveNextEvent = new EventEmitter();
  @Output() saveDraftEvent = new EventEmitter();
  @Output() backEvent = new EventEmitter();
}
