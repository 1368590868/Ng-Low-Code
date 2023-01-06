import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  FormlyFieldConfig,
  FormlyFieldProps,
  FormlyFormOptions
} from '@ngx-formly/core';
import { Subject, takeUntil } from 'rxjs';
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
  model = {};
  fields!: FormlyFieldConfig[];

  constructor(
    private route: ActivatedRoute,
    private gridTableService: GridTableService
  ) {}

  ngOnInit(): void {
    // subscribe route change to get search config
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((param: any) => {
      if (param && param.name) {
        // get search config
        this.gridTableService.getSearchConfig().subscribe((result: any) => {
          // this.options.resetModel?.();
          this.model = {};
          this.fields = result;
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  onSubmit(model: any) {
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
