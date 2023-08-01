import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { Subject, takeUntil } from 'rxjs';
import {
  NgxFormlyService,
  NotifyService,
  SearchParam,
  SystemLogService
} from 'src/app/shared';
import { GridTableService } from '../../services/grid-table.service';
import { UrlParamsService } from '../../services/url-params.service';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [UrlParamsService]
})
export class SearchComponent implements OnInit, OnDestroy {
  @Input()
  gridName!: string;
  destroy$ = new Subject<void>();

  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model: {
    [name: string]: any;
  } = {};
  fields!: FormlyFieldConfig[];

  isLoading = false;
  visible = false;
  dialogStyle = { width: '35rem' };
  showStar = false;

  formControlSearchHistory = new FormControl();
  formControlDialogSearchHistory = new FormControl();
  formControlDialogName = new FormControl();
  dialogHistoryOptions: {
    label: string;
    value: {
      [name: string]: any;
    };
    id?: string;
  }[] = [
    {
      label: '...',
      value: {}
    }
  ];
  searchHistoryOptions: {
    label: string;
    value: {
      [name: string]: any;
    };
    id?: string;
  }[] = [];

  constructor(
    private gridTableService: GridTableService,
    private ngxFormlyService: NgxFormlyService,
    private systemLogService: SystemLogService,
    private urlParamsService: UrlParamsService,
    private searchService: SearchService,
    private notifyService: NotifyService
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
              this.ngxFormlyService.initFieldLookup(f, this.destroy$);
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
      const searchParams = this.urlParamsService.getSearchInitParams();
      if (searchParams && searchParams.action === 'search') {
        if (searchParams?.payload) {
          this.model = { ...this.model, ...searchParams?.payload };
        }

        // wait table listening Search
        setTimeout(() => {
          this.onSubmit(this.model);
        });
      }
    });

    // get search history
    this.searchService.getSearchHistory(this.gridName).subscribe(res => {
      if (res.code === 200 && res.data) {
        const newOptions = res.data.map(x => ({
          label: x.name,
          value: x.searches,
          id: x.id
        }));
        this.dialogHistoryOptions = [
          ...this.dialogHistoryOptions,
          ...newOptions
        ];
        this.searchHistoryOptions = [...newOptions];
      }
    });

    this.formControlSearchHistory.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (value && Object.keys(value).length > 0) {
          this.model = { ...this.model, ...value };
          this.onSubmit(this.model);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
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

  modelChange(value: any) {
    const hasValue = Object.keys(value).map(key => {
      const newValue = (value as { [key: string]: any })[key];
      if (newValue != null && newValue !== '') return true;
      return false;
    });

    this.showStar = hasValue.indexOf(true) >= 0;
  }

  showDialog() {
    this.visible = true;
    this.formControlDialogSearchHistory.setValue({});
    this.formControlDialogName.reset();
  }

  onClear() {
    this.options.resetModel?.({});
    this.gridTableService.searchClicked$.next(undefined);
    this.formControlSearchHistory.reset();
  }

  onOk() {
    if (
      this.formControlDialogSearchHistory.valid &&
      this.formControlDialogName.valid
    ) {
      const name = this.formControlDialogName.value;
      if (Object.keys(this.formControlDialogSearchHistory.value).length === 0) {
        // Create

        this.searchService
          .addSearchHistory(this.gridName, name, this.model)
          .subscribe(res => {
            if (res.code === 200) {
              this.notifyService.notifySuccess(
                'Success',
                'Create successfully'
              );
              this.visible = false;
              this.searchHistoryOptions.push({
                label: name,
                value: this.model
              });
              this.dialogHistoryOptions.push({
                label: name,
                value: this.model
              });
            }
          });
      } else {
        // Update
        const selectedOption = this.dialogHistoryOptions.find(
          option => option.value === this.formControlDialogSearchHistory.value
        );
        this.searchService
          .updateSearcHistory(
            this.gridName,
            selectedOption?.id || '',
            name,
            this.model
          )
          .subscribe(res => {
            if (res.code === 200) {
              this.notifyService.notifySuccess(
                'Success',
                'Create successfully'
              );
              this.visible = false;

              this.searchHistoryOptions.forEach(option => {
                if (
                  option.value === this.formControlDialogSearchHistory.value
                ) {
                  option.label = name;
                  option.value = this.model;
                }
              });
              this.formControlSearchHistory.setValue(this.model);
            }
          });
      }
    } else {
      this.formControlDialogName.markAsDirty();
      this.formControlDialogSearchHistory.markAsDirty();
    }
  }

  onCancel() {
    this.visible = false;
  }
}
