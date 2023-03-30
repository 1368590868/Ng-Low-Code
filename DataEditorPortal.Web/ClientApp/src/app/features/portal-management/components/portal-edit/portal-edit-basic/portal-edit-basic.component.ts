import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { tap } from 'rxjs';
import { NotifyService } from 'src/app/shared';
import { PortalItemData } from '../../../models/portal-item';
import { PortalItemService } from '../../../services/portal-item.service';
import { PortalEditStepDirective } from '../../../directives/portal-edit-step.directive';

@Component({
  selector: 'app-portal-edit-basic',
  templateUrl: './portal-edit-basic.component.html',
  styleUrls: ['./portal-edit-basic.component.scss']
})
export class PortalEditBasicComponent
  extends PortalEditStepDirective
  implements OnInit
{
  @ViewChild('editForm') editForm!: NgForm;

  isLoading = true;
  isSaving = false;
  isSavingAndNext = false;
  isSavingAndExit = false;

  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model: PortalItemData = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'label',
      type: 'input',
      props: {
        label: 'Menu Label',
        placeholder: 'Menu Label',
        required: true
      },
      modelOptions: {
        updateOn: 'blur'
      },
      asyncValidators: {
        exist: {
          expression: (c: AbstractControl) => {
            return new Promise((resolve, reject) => {
              this.portalItemService
                .nameExists(c.value, this.portalItemService.itemId)
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
      key: 'icon',
      type: 'iconSelect',
      props: {
        label: 'Icon',
        placeholder: 'Icon',
        required: true
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
              if (this.model && !this.model['parentId'])
                this.model = { ...this.model, parentId: '<root>' };
              else this.model = { ...this.model };
            }
          });
        }
      }
    },
    {
      key: 'description',
      type: 'textarea',
      className: 'w-full',
      props: {
        label: 'Description',
        placeholder: 'Description'
      }
    },
    {
      key: 'helpUrl',
      type: 'input',
      className: 'w-full',
      props: {
        label: 'Help Url',
        placeholder: 'Help Url'
      }
    }
  ];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private portalItemService: PortalItemService,
    private notifyService: NotifyService
  ) {
    super();
  }

  ngOnInit(): void {
    // load basic information
    if (this.portalItemService.itemId) {
      this.portalItemService.getPortalDetails().subscribe(res => {
        if (!res['parentId']) res['parentId'] = '<root>';
        this.model = res;

        // enable buttons after data loaded.
        this.isLoading = false;
      });

      this.portalItemService.saveCurrentStep('basic');
    } else {
      this.model = {
        ...this.model,
        parentId: this.portalItemService.parentFolder
      };
      this.isLoading = false;
    }
  }

  onFormSubmit(model: PortalItemData) {
    if (this.form.valid) {
      // save & next
      const data = { ...model };
      if (data['parentId'] === '<root>') data['parentId'] = null;

      this.isSaving = true;
      if (this.portalItemService.itemId) {
        this.portalItemService
          .updatePortalDetails(data)
          .pipe(
            tap(res => {
              if (res && !res.isError) {
                this.portalItemService.itemCaption = data['label'];
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
                this.portalItemService.itemId = res.result;
                this.portalItemService.itemCaption = data['label'];
                this.saveSucess(res.result);
              }
              this.isSaving = false;
              this.isSavingAndExit = false;
              this.isSavingAndNext = false;
            })
          )
          .subscribe();
      }
    } else {
      this.fields.forEach(x => {
        if (x.formControl?.invalid) {
          x.formControl.markAsDirty();
          x.formControl.updateValueAndValidity();
        }
      });
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

  saveSucess(id?: string) {
    if (this.isSavingAndNext) {
      if (id) {
        // it is adding, redirect to edit.
        this.portalItemService.saveCurrentStep('datasource');
        const next = `../../edit-single/${this.portalItemService.itemId}/datasource`;
        this.router.navigate([next], {
          relativeTo: this.activatedRoute
        });
      } else {
        // it is edting, go to next
        this.saveNextEvent.emit();
      }
    }
    if (this.isSavingAndExit) {
      if (id) {
        this.router.navigate(['../../list'], {
          relativeTo: this.activatedRoute
        });
      } else {
        this.saveDraftEvent.emit();
      }
    }
  }

  // onBack() {
  //   this.backEvent.emit();
  // }
}
