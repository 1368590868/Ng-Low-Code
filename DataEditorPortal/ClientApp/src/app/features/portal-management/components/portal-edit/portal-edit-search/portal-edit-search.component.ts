import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { PickList } from 'primeng/picklist';

@Component({
  selector: 'app-portal-edit-search',
  templateUrl: './portal-edit-search.component.html',
  styleUrls: ['./portal-edit-search.component.scss']
})
export class PortalEditSearchComponent implements OnInit {
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
      key: 'type',
      type: 'select',
      defaultValue: 'input',
      props: {
        label: 'Control Type',
        placeholder: 'Please Select',
        showClear: false,
        required: true,
        options: [
          {
            label: 'Checkbox',
            value: 'checkbox'
          },
          {
            label: 'Checkbox List',
            value: 'checkboxList'
          },
          {
            label: 'Date',
            value: 'datepicker'
          },
          {
            label: 'Dropdown',
            value: 'select'
          },
          {
            label: 'Multiple Dropdown',
            value: 'multiSelect'
          },
          {
            label: 'Radio List',
            value: 'radio'
          },
          {
            label: 'Textbox',
            value: 'input'
          },
          {
            label: 'Textarea',
            value: 'textarea'
          }
        ]
      }
    },
    {
      key: 'props',
      fieldGroup: [
        {
          key: 'label',
          type: 'input',
          props: {
            label: 'Label',
            placeholder: 'Control label'
          }
        },
        {
          key: 'placeholder',
          type: 'input',
          props: {
            label: 'Placeholder',
            placeholder: 'Placeholder'
          }
        }
      ]
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
      item.type = 'input';
      item.props = {
        label: item.name,
        placeholder: item.name
      };
    });
  }

  onMoveToSource(event: any) {
    event.items.forEach((item: any) => {
      item.selected = false;
      item.key = undefined;
      item.type = undefined;
      item.props = undefined;
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

  getControlTypeName(type: string) {
    const option = (this.fields[0].props?.options as any[]).find(
      x => x.value === type
    );
    return option?.label;
  }
}
