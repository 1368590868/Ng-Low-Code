import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, FormGroup, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { tap } from 'rxjs';
import { NotifyService } from 'src/app/shared';
import { PortalEditStepDirective } from '../../../directives/portal-edit-step.directive';
import { PortalItemData } from '../../../models/portal-item';
import { PortalItemService } from '../../../services/portal-item.service';

@Component({
  selector: 'app-portal-edit-basic-sub',
  templateUrl: './portal-edit-basic-sub.component.html',
  styleUrls: ['./portal-edit-basic-sub.component.scss']
})
export class PortalEditBasicSubComponent
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
                .nameExists(c.value, this.itemId)
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
              if (res && !res.isError) {
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
              if (res && !res.isError) {
                this.itemId = res.result;
                this.itemCaption = data['label'];
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
