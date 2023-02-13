import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { Subject, takeUntil } from 'rxjs';
import { NgxFormlyService } from 'src/app/shared';
import { SearchParam } from '../../models/grid-types';
import { GridTableService } from '../../services/grid-table.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();

  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model: {
    [name: string]: any;
  } = {};
  fields!: FormlyFieldConfig[];

  constructor(
    private route: ActivatedRoute,
    private gridTableService: GridTableService,
    private ngxFormlyService: NgxFormlyService
  ) {}

  ngOnInit(): void {
    // subscribe route change to get search config
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(param => {
      if (param && param['name']) {
        // get search config
        this.gridTableService.getSearchConfig().subscribe(result => {
          // this.options.resetModel?.();
          this.model = {};
          this.fields = result;

          // fetch lookups
          this.fields
            .filter(
              // advanced setting: options from lookup
              x =>
                typeof x.type === 'string' &&
                ['select', 'multiSelect'].indexOf(x.type) >= 0 &&
                x.props &&
                x.props['optionLookup']
            )
            .forEach(f => {
              if (f.props && f.props.placeholder)
                f.props.placeholder = 'Please Select';
              f.hooks = {
                onInit: field => {
                  if (field.props && field.props['dependOnFields']) {
                    this.ngxFormlyService.initDependOnFields(field);
                  } else {
                    this.ngxFormlyService.initFieldOptions(field);
                  }
                }
              };
            });
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  onSubmit(model: SearchParam) {
    if (this.form.valid) {
      this.gridTableService.searchClicked$.next(model);
    }
  }

  onClear() {
    this.options.resetModel?.();
    this.gridTableService.searchClicked$.next(this.model);
  }
}
