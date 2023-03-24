import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { Subject, takeUntil } from 'rxjs';
import {
  NgxFormlyService,
  SearchParam,
  SystemLogService
} from 'src/app/shared';
import { GridTableService } from '../../services/grid-table.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  @Input()
  gridName!: string;
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
    private ngxFormlyService: NgxFormlyService,
    private systemLogService: SystemLogService
  ) {}

  ngOnInit(): void {
    // get search config
    this.gridTableService.getSearchConfig(this.gridName).subscribe(result => {
      // this.options.resetModel?.();
      this.model = {};

      // fetch lookups
      const fields = result as FormlyFieldConfig[];
      fields
        .filter(
          // advanced setting: options from lookup
          x =>
            typeof x.type === 'string' &&
            ['select', 'multiSelect'].indexOf(x.type) >= 0 &&
            x.props &&
            x.props['optionsLookup']
        )
        .forEach(f => {
          if (f.props) {
            f.props.placeholder = 'Please Select';
            if (!f.props.options) f.props.options = [];

            if (Array.isArray(f.props['optionsLookup'])) {
              f.props.options = f.props['optionsLookup'];
            } else {
              f.hooks = {
                onInit: field => {
                  if (
                    field.props &&
                    field.props['dependOnFields'] &&
                    field.props['dependOnFields'].length > 0
                  ) {
                    this.ngxFormlyService.initDependOnFields(field);
                  } else {
                    this.ngxFormlyService.initFieldOptions(field);
                  }
                }
              };
            }
          }
        });

      // set triStateCheckbox
      fields
        .filter(x => x.type == 'checkbox')
        .forEach(f => {
          f.type = 'triStateCheckbox';
          f.defaultValue = null;
          if (f.props) f.props['hideLabel'] = true;
        });

      this.fields = fields;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  onSubmit(model: SearchParam) {
    if (this.form.valid) {
      this.systemLogService.addSiteVisitLog({
        action: 'Search',
        section: this.gridName,
        params: JSON.stringify(model)
      });
      this.gridTableService.searchClicked$.next(model);
    }
  }

  onClear() {
    this.options.resetModel?.();
    this.gridTableService.searchClicked$.next(this.model);
  }
}
