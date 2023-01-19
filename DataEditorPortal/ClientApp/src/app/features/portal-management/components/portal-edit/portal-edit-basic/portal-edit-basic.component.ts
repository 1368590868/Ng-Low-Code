import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { of, switchMap } from 'rxjs';
import { PortalItemService } from '../../../services/portal-item.service';

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
  model: { [name: string]: unknown } = {};
  fields: FormlyFieldConfig[] = [
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
        showClear: false
      },
      hooks: {
        onInit: field => {
          this.portalItemService.getPortalList().subscribe(res => {
            if (field.props) {
              const options = res
                .filter(x => x.data?.['type'] === 'Folder')
                .map(x => {
                  return {
                    label: `- ${x.data?.['label']}`,
                    value: x.data?.['id']
                  };
                });
              options.splice(0, 0, {
                label: 'Root',
                value: '<root>'
              });

              field.props.options = options;
              this.model = { ...this.model, parent: '<root>' };
            }
          });
        }
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

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private portalItemService: PortalItemService
  ) {}

  ngOnInit(): void {
    console.log(this.portalItemService.currentPortalItemId);
    // load basic information
    setTimeout(() => {
      this.isSaving = false;
    }, 1000);
  }

  onFormSubmit(model: { [name: string]: unknown }) {
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
  onBack() {
    this.router.navigate(['/portal-management/list'], {
      relativeTo: this.activatedRoute
    });
  }
}
