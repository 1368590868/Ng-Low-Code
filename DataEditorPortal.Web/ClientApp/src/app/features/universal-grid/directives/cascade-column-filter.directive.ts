import { Directive, Host, Input, OnDestroy, OnInit, Optional, Self } from '@angular/core';
import { ColumnFilter } from 'primeng/table';
import { Subject, filter, map, switchMap, takeUntil, tap } from 'rxjs';
import { GridParam } from 'src/app/shared';
import { TableComponent } from '../components/table/table.component';
import { GridColumn } from '../models/grid-types';
import { GridTableService } from '../services/grid-table.service';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'p-columnFilter'
})
export class PTableCascadeColumnFilterDirective implements OnInit, OnDestroy {
  @Input() field!: string;
  @Input() column!: GridColumn;
  private destroy$ = new Subject();

  constructor(
    @Host() @Self() @Optional() private columnFilter: ColumnFilter,
    private appTable: TableComponent,
    private gridTableService: GridTableService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.appTable.fetchDataParam$
      .pipe(
        takeUntil(this.destroy$),
        // check if the filter should be updated
        filter(params => this.shouldUpdateFilter(params)),
        // remove the param from itself
        map(params => {
          const temp = JSON.parse(JSON.stringify(params || {})) as GridParam;
          if (temp && temp.filters) {
            const index = temp.filters.findIndex(x => x.field === this.field);
            if (index > -1) {
              temp.filters.splice(index, 1);
            }
          }
          return temp;
        }),
        // set dependency params
        tap(params => {
          this.column._filterDepParam = params;
        }),
        // only when the filter is set to enum valus will go on
        filter(() => !!this.column.enumFilterValue),
        // get options from backend
        switchMap(params => {
          return this.gridTableService.getTableColumnFilterOptions(this.appTable.gridName, this.field, params);
        }),
        // update filter options
        tap(val => {
          if (this.columnFilter && this.columnFilter.fieldConstraints && this.columnFilter.fieldConstraints.length === 1) {
            // append current param value to options, in case of Mutiple select shows empty
            const currentFilter = this.columnFilter.fieldConstraints[0].value;
            if (currentFilter && currentFilter.length > 0) {
              const added = currentFilter.filter((o: any) => val.filter(v => v.value === o).length === 0);
              val.unshift(...added.map((x: any) => ({ label: x, value: x })));
            }
          }
          this.column._filterOptions = val;
        })
      )
      .subscribe();
  }

  shouldUpdateFilter(params: GridParam | undefined) {
    const temp = this.column._filterDepParam;
    const filtersPrev = temp?.filters || [];
    const filtersCurr = params?.filters || [];
    const removed = filtersPrev.filter(f1 => {
      const f2 = filtersCurr.find(f2 => f1.field === f2.field);
      return !f2;
    });
    if (removed.length > 0 && !!removed.find(f => f.field !== this.field)) {
      // there is filter removed and not itself
      return true;
    }
    const changed = filtersPrev.filter(f1 => {
      const f2 = filtersCurr.find(f2 => f1.field === f2.field);
      return f2 && (f1.matchMode != f2.matchMode || JSON.stringify(f1.value) != JSON.stringify(f2.value));
    });
    if (changed.length > 0 && !!changed.find(f => f.field !== this.field)) {
      // there is filter changed and not itself
      return true;
    }
    const added = filtersCurr.filter(f1 => {
      const f2 = filtersPrev.find(f2 => f1.field === f2.field);
      return !f2;
    });
    if (added.length > 0) {
      const fieldsDoesnotDependWithCurrentField = added
        .filter(f => f.field !== this.field) // except the filed itself
        .filter(f => {
          const fieldAdded = this.appTable.columns.find(c => c.field === f.field);
          if (fieldAdded) {
            const deps = fieldAdded._filterDepParam;
            const depsFilters = deps?.filters || [];
            // if current field is not in new added dependence, should return true
            return !depsFilters.find(d => d.field === this.field);
          }
          return true;
        });
      return fieldsDoesnotDependWithCurrentField.length > 0;
    }
    return true;
  }
}
