import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-portal-edit-basic',
  templateUrl: './portal-edit-basic.component.html',
  styleUrls: ['./portal-edit-basic.component.scss']
})
export class PortalEditBasicComponent implements OnInit {
  @ViewChild('editForm') editForm!: NgForm;

  isSaving = false;
  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model = {
    name: ''
  };
  fields: FormlyFieldConfig[] = [
    {
      key: 'type',
      type: 'select',
      className: 'w-6',
      defaultValue: 'Portal Item',
      props: {
        label: 'Type',
        required: true,
        showClear: false,
        placeholder: 'Please Select',
        options: [
          {
            label: 'Portal Item',
            value: 'Portal Item'
          },
          {
            label: 'External',
            value: 'External'
          },
          {
            label: 'System',
            value: 'System'
          }
        ]
      }
    },
    {
      key: 'name',
      type: 'input',
      className: 'w-6',
      props: {
        label: 'Portal Name',
        placeholder: 'Portal Name',
        required: true
      }
    },
    {
      key: 'parent',
      type: 'select',
      className: 'w-full',
      props: {
        label: 'Parent Folder',
        placeholder: 'Please Select',
        required: true,
        showClear: false,
        options: [
          {
            label: 'Portal Item',
            value: 'Portal Item'
          }
        ]
      }
    },
    {
      key: 'label',
      type: 'input',
      props: {
        label: 'Menu Label',
        placeholder: 'Menu Label',
        required: true
      }
    },
    {
      key: 'Icon',
      type: 'input',
      props: {
        label: 'Icon',
        placeholder: 'Icon',
        required: true
      }
    },
    {
      key: 'description',
      type: 'textarea',
      className: 'w-full',
      props: {
        label: 'Description',
        placeholder: 'description'
      }
    }
  ];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    // load basic information
    setTimeout(() => {
      this.isSaving = false;
    }, 1000);
  }

  onFormSubmit(model: any) {
    if (this.form.valid) {
      // save & next
      this.isSaving = true;
      setTimeout(() => {
        this.router.navigate(['../datasource'], {
          relativeTo: this.activatedRoute
        });
      }, 1000);
    }
  }

  onSaveAndNext() {
    this.editForm.onSubmit(new Event('submit'));
  }
}
