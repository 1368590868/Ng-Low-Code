import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { skip, tap } from 'rxjs';
import { NotifyService } from 'src/app/shared';
import { PortalItem, PortalItemData } from '../../../models/portal-item';
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
          field.formControl?.valueChanges
            .pipe(skip(this.itemId ? 1 : 0))
            .subscribe(val => {
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
                  this.portalItemService
                    .nameExists(currVal, this.itemId)
                    .subscribe(res => {
                      res.code === 200
                        ? resolve(!res.data)
                        : reject(res.message);
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
                field.formControl?.markAsDirty();
              });
            }
          });
        }
      }
    },
    {
      key: 'icon',
      type: 'iconSelect',
      props: {
        label: 'Icon',
        placeholder: 'Icon',
        required: true,
        description:
          'Find more icons on <a href="https://fontawesome.com/search?o=r&m=free&s=regular" target="__blank">Font Awesome</a>'
      }
    },
    {
      key: 'parentId',
      type: 'select',
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
              const options = this.getFolders(res, 1);
              options.splice(0, 0, {
                label: 'Root',
                value: '<root>',
                disabled: true
              });

              const findItem = options.find(
                (x: any) => x.value === this.model['parentId']
              );
              if (!findItem) {
                this.model = {
                  ...this.model,
                  parentId: options[1].value
                };
              }
              field.props.options = options;
              this.options.detectChanges?.(field);
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
  set parentFolder(val: string | undefined) {
    this.portalItemService.parentFolder = val;
  }
  get parentFolder() {
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
      this.model = {
        ...this.model,
        parentId: this.parentFolder
      };
      this.isLoading = false;
    }
  }

  getFolders(data: PortalItem[], level: number) {
    let folders: any = [];
    data.forEach((x: any) => {
      if (
        x.data?.['type'] === 'Folder' &&
        x.data?.['id'] !== this.model['id']
      ) {
        const arr = {
          label: `${'—'.repeat(level)}  ${x.data?.['label']}`,
          value: x.data?.['id']
        };
        folders.push(arr);
        if (x.children) {
          folders = folders.concat(this.getFolders(x.children, level + 1));
        }
      }
    });
    return folders;
  }

  onFormSubmit(model: PortalItemData) {
    if (this.form.valid) {
      // save & next
      const data = { ...model };
      data['itemType'] = this.itemType;
      if (data['parentId'] === '<root>') data['parentId'] = null;

      this.isSaving = true;
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
        const next =
          this.itemType == 'single'
            ? `../../edit-single/${this.itemId}/datasource`
            : `../../edit-linked/${this.itemId}/datasource`;
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
