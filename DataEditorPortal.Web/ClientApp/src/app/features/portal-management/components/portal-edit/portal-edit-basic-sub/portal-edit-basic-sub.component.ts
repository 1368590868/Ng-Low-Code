import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { skip, tap } from 'rxjs';
import { NotifyService } from 'src/app/shared';
import { PortalEditStepDirective } from '../../../directives/portal-edit-step.directive';
import { PortalItemData } from '../../../models/portal-item';
import { PortalItemService } from '../../../services/portal-item.service';

@Component({
  selector: 'app-portal-edit-basic-sub',
  templateUrl: './portal-edit-basic-sub.component.html',
  styleUrls: ['./portal-edit-basic-sub.component.scss']
})
export class PortalEditBasicSubComponent extends PortalEditStepDirective implements OnInit {
  @ViewChild('editForm') editForm!: NgForm;

  timer: any;

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
      hooks: {
        onInit: field => {
          field.formControl?.valueChanges.pipe(skip(this.itemId ? 1 : 0)).subscribe(val => {
            if (!val) return;
            if (field && field.parent && field.parent.get) {
              const control = field.parent?.get('name').formControl;
              control?.setValue(val);
            }
          });
        }
      }
    },
    {
      key: 'name',
      type: 'input',
      props: {
        label: 'Name',
        placeholder: 'Name',
        required: true
      },
      modelOptions: {
        updateOn: 'blur'
      },
      asyncValidators: {
        exist: {
          expression: (c: AbstractControl) => {
            const currVal = c.value;
            if (this.timer) clearTimeout(this.timer);
            return new Promise((resolve, reject) => {
              if (!currVal) {
                resolve(true);
              } else {
                this.timer = setTimeout(() => {
                  this.portalItemService.nameExists(currVal, this.itemId).subscribe(res => {
                    res.code === 200 ? resolve(!res.data) : reject(res.message);
                  });
                }, 100);
              }
            });
          },
          message: () => {
            return 'The Portal Name has already been exist.';
          }
        }
      },
      hooks: {
        onInit: field => {
          field.formControl?.valueChanges.subscribe(val => {
            if (val) {
              this.portalItemService.getCodeName(val).subscribe(res => {
                field.formControl?.setValue(res.data, { emitEvent: false });
                this.model['name'] = res.data + '';
                field.formControl?.markAsTouched();
              });
            }
          });
        }
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
    },
    {
      key: 'description',
      type: 'textarea',
      className: 'w-full',
      props: {
        label: 'Description',
        placeholder: 'Description'
      }
    }
  ];

  set itemType(val: string | undefined) {
    this.portalItemService.itemType = val;
  }
  get itemType() {
    return this.portalItemService.itemType;
  }
  set itemId(val: string | undefined) {
    this.portalItemService.itemId = val;
  }
  get itemId() {
    return this.portalItemService.itemId;
  }
  set itemCaption(val: string | undefined) {
    this.portalItemService.itemCaption = val;
  }
  get itemCaption() {
    return this.portalItemService.itemCaption;
  }
  set parentId(val: string | undefined) {
    this.portalItemService.parentFolder = val;
  }
  get parentId() {
    return this.portalItemService.parentFolder;
  }

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
    if (this.itemId) {
      this.portalItemService.getPortalDetails(this.itemId).subscribe(res => {
        this.model = res;

        // enable buttons after data loaded.
        this.isLoading = false;
      });

      this.portalItemService.saveCurrentStep('basic');
    } else {
      this.isLoading = false;
    }
  }

  onFormSubmit(model: PortalItemData) {
    if (this.form.valid) {
      // save & next
      const data = { ...model };
      data['itemType'] = this.itemType;
      data['parentId'] = this.parentId;
      if (this.itemId) {
        this.portalItemService
          .updatePortalDetails(data)
          .pipe(
            tap(res => {
              if (res && res.code === 200) {
                this.itemCaption = data['label'];
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
              if (res && res.code === 200) {
                this.itemId = res.data;
                this.itemCaption = data['label'];
                this.saveSucess(res.data);
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
          x.formControl.markAsTouched();
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
        const next = `../../edit/${this.itemId}/datasource`;
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
        this.router.navigate(['../../'], {
          relativeTo: this.activatedRoute
        });
      } else {
        this.saveDraftEvent.emit();
      }
    }
  }

  onBack() {
    this.backEvent.emit();
  }
}
