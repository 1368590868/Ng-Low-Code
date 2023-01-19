import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, NgForm } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { of, finalize, tap } from 'rxjs';
import { PortalItemData } from '../../../models/portal-item';
import { PortalItemService } from '../../../services/portal-item.service';

@Component({
  selector: 'app-portal-edit-basic',
  templateUrl: './portal-edit-basic.component.html',
  styleUrls: ['./portal-edit-basic.component.scss']
})
export class PortalEditBasicComponent implements OnInit {
  @ViewChild('editForm') editForm!: NgForm;

  isLoading = true;
  isSaving = false;
  isSavingAndNext = false;
  isSavingAndExit = false;

  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model!: PortalItemData;
  fields: FormlyFieldConfig[] = [
    {
      key: 'name',
      type: 'input',
      className: 'w-6',
      props: {
        label: 'Portal Name',
        placeholder: 'Portal Name',
        required: true
      },
      modelOptions: {
        updateOn: 'blur'
      },
      validators: {
        doNotAllowSpecial: {
          expression: (c: AbstractControl) => {
            return /^[a-zA-Z]\w+/.test(c.value);
          },
          message: 'Only number and letter are allowed.'
        }
      },
      asyncValidators: {
        exist: {
          expression: (c: AbstractControl) => {
            return new Promise((resolve, reject) => {
              this.portalItemService
                .nameExists(c.value, this.portalItemService.currentPortalItemId)
                .subscribe(res =>
                  !res.isError ? resolve(!res.result) : reject(res.message)
                );
            });
          },
          message: () => {
            return 'The Portal Name has already been exist.';
          }
        }
      }
    },
    {
      key: 'parentId',
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

              // reset the dropdown value, if the options come after the model value, dropdown may has no options selected
              if (!this.model['parentId'])
                this.model = { ...this.model, parentId: '<root>' };
              else this.model = { ...this.model };
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
      key: 'icon',
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
    // load basic information
    if (this.portalItemService.currentPortalItemId) {
      this.portalItemService
        .getPortalDetails(this.portalItemService.currentPortalItemId)
        .subscribe(res => {
          if (!res['parentId']) res['parentId'] = '<root>';
          this.model = res;

          // enable buttons after data loaded.
          this.isLoading = false;
        });
    }
  }

  onFormSubmit(model: PortalItemData) {
    if (this.form.valid) {
      // save & next
      const data = { ...model };
      if (data['parentId'] === '<root>') data['parentId'] = null;

      this.isSaving = true;
      if (this.portalItemService.currentPortalItemId) {
        this.portalItemService
          .updatePortalDetails(this.portalItemService.currentPortalItemId, data)
          .pipe(
            tap(res => {
              if (res && !res.isError) {
                this.saveSucess();
              }

              this.isSaving = false;
              this.isSavingAndExit = false;
              this.isSavingAndNext = false;
            })
          )
          .subscribe();
      } else {
        this.portalItemService
          .createPortalDetails(data)
          .pipe(
            tap(res => {
              if (res && !res.isError) {
                this.saveSucess();
              }
              this.isSaving = false;
              this.isSavingAndExit = false;
              this.isSavingAndNext = false;
            })
          )
          .subscribe();
      }
    }
  }

  onSaveAndNext() {
    this.isSavingAndNext = true;
    this.editForm.onSubmit(new Event('submit'));
  }

  onSaveAndExit() {
    this.isSavingAndExit = true;
    this.editForm.onSubmit(new Event('submit'));
  }

  saveSucess() {
    let next: unknown[] = [];
    if (this.isSavingAndNext) next = ['../datasource'];
    if (this.isSavingAndExit) next = ['/portal-management/list'];
    this.router.navigate(next, {
      relativeTo: this.activatedRoute
    });
  }

  onBack() {
    this.router.navigate(['/portal-management/list'], {
      relativeTo: this.activatedRoute
    });
  }
}
