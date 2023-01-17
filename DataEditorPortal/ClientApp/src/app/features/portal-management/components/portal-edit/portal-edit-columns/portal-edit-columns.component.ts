import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { Dialog } from 'primeng/dialog';
import { filter } from 'rxjs';

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
  @ViewChild('configDialog') configDialog!: Dialog;

  // configuration dialog variables
  class = 'mr-2';
  label = 'Add New';
  icon = 'pi pi-plus';
  buttonStyleClass = '';
  header = 'Configuration for Column';
  okText = 'Ok';
  cancelText = 'Cancel';
  dialogStyle = { width: '40rem' };
  visible = false;
  isLoading = false;
  buttonDisabled = true;

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
  }

  onConfigColumn(column: any) {
    this.header = `Configuration for column ${column.name}`;
    this.model = {
      header: column.name,
      name: column.name,
      filterType: column.filterType,
      width: column.width,
      sortable: column.sortable
    };
    this.visible = true;
  }

  onSaveAndNext() {
    this.isSaving = true;
    setTimeout(() => {
      this.router.navigate(['../columns'], {
        relativeTo: this.activatedRoute
      });
    }, 1000);
  }

  onBack() {
    this.router.navigate(['../datasource'], {
      relativeTo: this.activatedRoute
    });
  }

  // configuration dialog methods
  onShow() {
    this.buttonDisabled = false;
  }

  onHide() {
    this.options.resetModel?.();
  }
  onCancel() {
    this.visible = false;
  }

  onOk() {
    if (this.form.valid) {
      const column = this.targetColumns.find(
        x => x.name === this.model['name']
      );
      if (column) {
        column.header = this.model.header;
        column.width = this.model.width;
        column.filterType = this.model.filterType;
        column.sortable = this.model.sortable;
      }
      this.visible = false;
    }
  }

  onFormSubmit(model: any) {
    console.log(model);
  }
}
