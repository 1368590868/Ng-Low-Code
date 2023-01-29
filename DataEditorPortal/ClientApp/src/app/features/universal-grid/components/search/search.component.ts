import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { Subject, takeUntil } from 'rxjs';
import { NgxFormlyService } from 'src/app/core/services/ngx-formly.service';
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
              x => x.type === 'select' && x.props && x.props['optionLookup']
            )
            .forEach(f => {
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
    console.log(model);
    if (this.form.valid) {
      this.gridTableService.searchClicked$.next(model);
    }
  }

  onClear() {
    this.options.resetModel?.();
    this.gridTableService.searchClicked$.next(this.model);
  }
}