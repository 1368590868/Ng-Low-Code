import {
  Directive,
  Host,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self
} from '@angular/core';
import { Dropdown } from 'primeng/dropdown';
import { Subject, takeUntil } from 'rxjs';
import { DomHandler } from 'primeng/dom';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'p-dropdown'
})
export class DropdownFixDirective implements OnInit, OnDestroy {
  @Input() options!: any[];
  private destroy$ = new Subject<void>();

  constructor(@Host() @Self() @Optional() private dropdown: Dropdown) {}

  ngOnInit(): void {
    if (this.dropdown) {
      this.dropdown.onShow.pipe(takeUntil(this.destroy$)).subscribe(() => {
        setTimeout(() => {
          if (this.options && this.options.length) {
            // Set virtualScroll, scroll to selected item
            if (this.dropdown.virtualScroll) {
              const selectedIndex = this.dropdown.selectedOption
                ? this.dropdown.findOptionIndex(
                    this.dropdown.getOptionValue(this.dropdown.selectedOption),
                    this.dropdown.optionsToDisplay
                  )
                : -1;
              if (selectedIndex !== -1) {
                this.dropdown.scroller.scrollToIndex(selectedIndex);
              }
            } else {
              // Set appendTO to body, Requires a global re-lookup and scroll to the current highlighted option
              if (this.dropdown.appendTo === 'body') {
                const wrapperDom = document.querySelector(
                  '.p-dropdown-items-wrapper'
                );
                const selectedListItem = DomHandler.findSingle(
                  wrapperDom,
                  '.p-dropdown-item.p-highlight'
                );
                if (selectedListItem) {
                  selectedListItem.scrollIntoView({
                    block: 'nearest',
                    inline: 'center'
                  });
                }
              }
            }
          }
        }, 0);
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
