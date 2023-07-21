import {
  AfterViewChecked,
  Directive,
  Host,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  SimpleChanges
} from '@angular/core';
import { Dropdown } from 'primeng/dropdown';
import { MultiSelect } from 'primeng/multiselect';
import { Subject, takeUntil } from 'rxjs';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'p-dropdown,p-multiSelect'
})
export class AutoFilterDirective
  implements OnInit, OnChanges, OnDestroy, AfterViewChecked
{
  @Input() options!: any[];
  private destroy$ = new Subject<void>();
  private optionsChanged = false;
  private overlayVisible = false;

  constructor(
    @Host() @Self() @Optional() private dropdown: Dropdown,
    @Host() @Self() @Optional() private multiSelect: MultiSelect
  ) {}

  ngOnInit(): void {
    if (this.dropdown) {
      this.dropdown.onFilter.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.onFilter(this.dropdown);
      });
      this.dropdown.onShow.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.overlayVisible = true;
      });
      this.dropdown.onHide.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.overlayVisible = false;
      });
    } else if (this.multiSelect) {
      this.multiSelect.showToggleAll = false;
      this.multiSelect.onFilter.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.onFilter(this.multiSelect);
      });
      this.multiSelect.onPanelShow
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.overlayVisible = true;
        });
      this.multiSelect.onPanelHide
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.overlayVisible = false;
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('options' in changes) {
      this.optionsChanged = true;

      const enableFilter = this.options.length > 5;
      const enableVirtual = this.options.length > 10;

      if (this.dropdown) {
        this.dropdown.filter = enableFilter;
        this.dropdown.resetFilterOnHide = enableFilter;
        this.dropdown.virtualScroll = enableVirtual;
      }
      if (this.multiSelect) {
        this.multiSelect.filter = enableFilter;
        this.multiSelect.showHeader = enableFilter;
        this.multiSelect.resetFilterOnHide = enableFilter;
        this.multiSelect.virtualScroll = enableVirtual;
      }
    }
  }

  ngAfterViewChecked(): void {
    if (this.optionsChanged && this.overlayVisible) {
      this.optionsChanged = false;
      this.setVirtualItemSize(this.dropdown || this.multiSelect);
    }
  }

  onFilter(compRef: Dropdown | MultiSelect) {
    if (compRef && compRef.virtualScroll) {
      compRef.scroller?.setContentPosition(null);
    }
  }

  setVirtualItemSize(compRef: Dropdown | MultiSelect) {
    if (compRef && compRef.virtualScroll && this.overlayVisible) {
      const optionElements =
        compRef.overlayViewChild.overlayEl.querySelectorAll(
          '.p-dropdown-items .p-dropdown-item, .p-multiselect-items .p-multiselect-item'
        );
      // console.log(optionElements);
      if (optionElements.length > 0) {
        const firstOptionElement = optionElements[0] as HTMLElement;
        const itemHeight = firstOptionElement.offsetHeight;
        // Set the item height as the virtual item size
        compRef.virtualScrollItemSize = itemHeight;
        compRef.cd.detectChanges();
        // Force the dom height to change
        setTimeout(() => {
          compRef.scroller.elementViewChild.nativeElement.style.height =
            compRef.scrollHeight;
        }, 0);
      }
    }
  }
}
