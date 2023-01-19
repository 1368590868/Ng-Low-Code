import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { PickList } from 'primeng/picklist';

@Component({
  selector: 'app-portal-edit-columns',
  templateUrl: './portal-edit-columns.component.html',
  styleUrls: ['./portal-edit-columns.component.scss']
})
export class PortalEditColumnsComponent implements OnInit {
  isSaving = false;

  sourceColumns: any[] = [
    {
      name: 'Name'
    },
    {
      name: 'UserId'
    },
    {
      name: 'Email'
    }
  ];
  targetColumns: any[] = [];
  @ViewChild('pickList') pickList!: PickList;

  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model: any = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'header',
      type: 'input',
      props: {
        label: 'Column Header',
        required: true,
        placeholder: 'Column Header'
      }
    },
    {
      key: 'width',
      defaultValue: '10rem',
      type: 'input',
      props: {
        label: 'Column Width',
        required: true,
        placeholder: 'Enter numeric value in rem or percentage'
      }
    },
    {
      key: 'filterType',
      type: 'select',
      defaultValue: 'text',
      props: {
        label: 'Filter Type',
        placeholder: 'Please Select',
        required: true,
        showClear: false,
        options: [
          {
            label: 'None',
            value: 'none'
          },
          {
            label: 'Text',
            value: 'text'
          },
          {
            label: 'Numeric',
            value: 'numeric'
          },
          {
            label: 'Boolean',
            value: 'boolean'
          },
          {
            label: 'Date',
            value: 'date'
          }
        ]
      }
    },
    {
      key: 'sortable',
      type: 'checkbox',
      defaultValue: true,
      props: {
        label: 'Sortable'
      }
    }
  ];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    console.log('test');
  }

  onMoveToTarget(event: any) {
    event.items.forEach((item: any) => {
      item.selected = true;
      item.key = item.name;
      item.header = item.name;
      item.width = '10rem';
      item.filterType = 'text'; // set by column type
      item.sortable = true;
    });
  }

  onMoveToSource(event: any) {
    event.items.forEach((item: any) => {
      item.selected = false;
      item.key = undefined;
      item.header = undefined;
      item.width = undefined;
      item.filterType = undefined;
      item.sortable = undefined;
    });
    if (event.items.find((x: any) => x.name === this.model.name)) {
      this.model = {};
    }
  }

  onTargetSelect(event: any) {
    if (event.items.length === 1) {
      this.model = event.items[0];
    } else {
      this.model = {};
    }
  }

  onSaveAndNext() {
    this.isSaving = true;
    console.log(this.targetColumns);
    setTimeout(() => {
      this.router.navigate(['../search'], {
        relativeTo: this.activatedRoute
      });
    }, 1000);
  }

  onBack() {
    this.router.navigate(['../datasource'], {
      relativeTo: this.activatedRoute
    });
  }
}
