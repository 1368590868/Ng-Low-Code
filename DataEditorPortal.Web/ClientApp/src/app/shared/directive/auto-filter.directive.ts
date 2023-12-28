import { Directive, Host, Input, OnChanges, OnDestroy, OnInit, Optional, Self, SimpleChanges } from '@angular/core';
import { Dropdown } from 'primeng/dropdown';
import { MultiSelect } from 'primeng/multiselect';
import { Subject, takeUntil } from 'rxjs';
import { ConfigDataService } from '../services/config-data.service';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'p-dropdown,p-multiSelect'
})
export class AutoFilterDirective implements OnInit, OnChanges, OnDestroy {
  @Input() options!: any[];
  private destroy$ = new Subject<void>();

  constructor(
    @Host() @Self() @Optional() private dropdown: Dropdown,
    @Host() @Self() @Optional() private multiSelect: MultiSelect,
    private configDataService: ConfigDataService
  ) {}

  ngOnInit(): void {
    if (this.dropdown) {
      this.dropdown.onFilter.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.onFilter(this.dropdown);
      });
    } else if (this.multiSelect) {
      this.multiSelect.showToggleAll = false;
      this.multiSelect.onFilter.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.onFilter(this.multiSelect);
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('options' in changes) {
      const enableFilter = this.options.length > 5;
      const enableVirtual = this.options.length > 50;

      if (this.dropdown) {
        this.dropdown.filter = enableFilter;
        this.dropdown.resetFilterOnHide = enableFilter;
        this.dropdown.virtualScroll = enableVirtual;
        this.dropdown.virtualScrollItemSize = this.configDataService.dropdownItemSize || 0;
      }
      if (this.multiSelect) {
        this.multiSelect.filter = enableFilter;
        this.multiSelect.showHeader = enableFilter;
        this.multiSelect.resetFilterOnHide = enableFilter;
        this.multiSelect.virtualScroll = enableVirtual;
        this.multiSelect.virtualScrollItemSize = this.configDataService.dropdownItemSize || 0;
      }
    }
  }

  onFilter(compRef: Dropdown | MultiSelect) {
    if (compRef && compRef.virtualScroll) {
      compRef.scroller?.setContentPosition(null);
    }
  }
}
