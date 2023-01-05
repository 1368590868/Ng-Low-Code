import { Component, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormlyFieldConfig } from '@ngx-formly/core';
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
  model = {};
  fields1: FormlyFieldConfig[] = [
    {
      key: 'email',
      type: 'input',
      props: {
        label: 'Email address',
        placeholder: 'Enter email',
        required: true
      }
    },
    {
      key: 'select',
      type: 'select',
      props: {
        label: 'Select 1',
        placeholder: 'Please select',
        required: true,
        options: [
          { value: 1, label: 'Option 1' },
          { value: 2, label: 'Option 2' },
          { value: 3, label: 'Option 3' },
          { value: 4, label: 'Option 4', disabled: true }
        ]
      }
    },
    {
      key: 'Checkbox',
      type: 'checkbox',
      props: {
        label: 'Accept terms',
        description: 'In order to proceed, please accept terms',
        pattern: 'true',
        required: true
      },
      validation: {
        messages: {
          pattern: 'Please accept the terms'
        }
      }
    },
    {
      key: 'Datepicker',
      type: 'datepicker',
      props: {
        label: 'Datepicker',
        placeholder: 'Placeholder',
        description: 'Description',
        dateFormat: 'yy/mm/dd',
        hourFormat: '24',
        numberOfMonths: 1,
        selectionMode: 'single',
        required: true,
        readonlyInput: false,
        showTime: false,
        showButtonBar: true,
        showIcon: false,
        showOtherMonths: true,
        selectOtherMonths: false,
        monthNavigator: false,
        yearNavigator: false,
        yearRange: '2020:2030',
        inline: false,
        appendTo: 'body'
      }
    },
    {
      key: 'MultipleSelect',
      type: 'multiSelect',
      props: {
        label: 'MultipleSelect',
        placeholder: 'Placeholder',
        description: 'Description'
      }
    },
    {
      key: 'Textarea',
      type: 'textarea',
      props: {
        label: 'Textarea',
        placeholder: 'Placeholder',
        description: 'Description',
        required: true
      }
    }
  ];
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
        console.log('get search config');
        this.fields = this.fields1;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  onSubmit(model: any) {
    console.log(model);
    this.gridTableService.searchClicked$.next(model);
  }
}
