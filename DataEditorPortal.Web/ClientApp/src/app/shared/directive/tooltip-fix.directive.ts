import { Directive, Host, Optional, Self } from '@angular/core';
import { DomHandler } from 'primeng/dom';
import { Tooltip } from 'primeng/tooltip';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[pTooltip]'
})
export class PTooltipFixDirective {
  constructor(@Host() @Self() @Optional() private tooltip: Tooltip) {
    if (this.tooltip) {
      this.tooltip.onMouseLeave = (e: MouseEvent) => {
        if (!this.tooltip.isAutoHide()) {
          const valid =
            DomHandler.hasClass(e.relatedTarget, 'p-tooltip') ||
            DomHandler.hasClass(e.relatedTarget, 'p-tooltip-text') ||
            DomHandler.hasClass(e.relatedTarget, 'p-tooltip-arrow');

          console.log(valid);
          !valid && this.tooltip.deactivate();
        } else {
          this.tooltip.deactivate();
        }
      };
    }
  }
}
