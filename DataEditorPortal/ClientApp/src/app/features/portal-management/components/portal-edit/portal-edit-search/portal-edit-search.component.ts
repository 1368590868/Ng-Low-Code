import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { PrimeNGConfig } from 'primeng/api';
import { PickList } from 'primeng/picklist';
import { distinctUntilChanged, tap } from 'rxjs';

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
            value: 'checkbox',
            filterType: 'boolean'
          },
          {
            label: 'Checkbox List',
            value: 'checkboxList',
            filterType: 'array'
          },
          {
            label: 'Date',
            value: 'datepicker',
            filterType: 'date'
          },
          {
            label: 'Dropdown',
            value: 'select',
            filterType: 'text'
          },
          {
            label: 'Multiple Dropdown',
            value: 'multiSelect',
            filterType: 'array'
          },
          {
            label: 'Radio List',
            value: 'radio',
            filterType: 'text'
          },
          {
            label: 'Textbox',
            value: 'input',
            filterType: 'text'
          },
          {
            label: 'Textarea',
            value: 'textarea',
            filterType: 'text'
          }
        ]
      },
      hooks: {
        onInit: field => {
          field.formControl?.valueChanges
            .pipe(
              distinctUntilChanged(),
              tap(value => {
                this.model.selected = false;
                this.changeDetectorRef.detectChanges();
                this.model.selected = true;
                this.changeDetectorRef.detectChanges();
              })
            )
            .subscribe();
        }
      }
    },
    {
      wrappers: ['divider'],
      props: {
        label: 'Properties'
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

  constructor(
    private primeNGConfig: PrimeNGConfig,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

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
      this.router.navigate(['../form'], {
        relativeTo: this.activatedRoute
      });
    }, 1000);
  }

  onBack() {
    this.router.navigate(['../columns'], {
      relativeTo: this.activatedRoute
    });
  }

  getControlFilterType(type: string) {
    const option = (this.fields[0].props?.options as any[]).find(
      x => x.value === type
    );
    return option?.filterType;
  }

  getFilterMatchModeOptions(type: string) {
    const filterType = this.getControlFilterType(type);
    if (filterType === 'array')
      return [{ label: 'In selected values', value: 'in' }];
    if (filterType === 'boolean') return [{ label: 'Equals', value: 'equals' }];
    return (this.primeNGConfig.filterMatchModeOptions as any)[filterType]?.map(
      (key: any) => {
        return { label: this.primeNGConfig.getTranslation(key), value: key };
      }
    );
  }

  cloneColumn(column: any) {
    return [JSON.parse(JSON.stringify(column))];
  }
}
