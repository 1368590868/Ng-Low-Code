import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { Subject, takeUntil } from 'rxjs';
import { GroupDetail, NotifyService, SiteGroupService } from 'src/app/shared';

@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.scss']
})
export class AddGroupComponent {
  @Input() header = 'Add / Edit';
  @Input() okText = 'Ok';
  @Input() cancelText = 'Cancel';
  @Input() dialogStyle = { width: '62rem' };

  @Output() saved = new EventEmitter<string>();

  @ViewChild('editForm') editForm!: NgForm;

  visible = false;
  isLoading = false;
  buttonDisabled = true;
  timer: any;

  id = '';
  destroy$ = new Subject();

  formControlAboutEditor = new FormControl('');
  formControlContactEditor = new FormControl('');

  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model: GroupDetail = {};
  fields: FormlyFieldConfig[] = [];

  constructor(private siteGroupService: SiteGroupService, private notifyService: NotifyService) {}
  showDialog() {
    this.isLoading = false;
    this.visible = true;
    this.buttonDisabled = false;

    if (this.id) {
      this.getDetail();
    } else {
      this.getFields();
      this.options?.resetModel?.();
      this.formControlAboutEditor.reset();
      this.formControlContactEditor.reset();
    }
  }

  getFields() {
    this.fields = [
      {
        fieldGroup: [
          {
            className: 'w-6',
            key: 'title',
            type: 'input',
            props: {
              label: 'Title',
              placeholder: 'Title',
              required: true
            },
            modelOptions: {
              updateOn: 'blur'
            },
            hooks: {
              onInit: field => {
                field.formControl?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(val => {
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
            className: 'w-6',
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
                        this.siteGroupService.nameExists(currVal, this.id).subscribe(res => {
                          res.code === 200 ? resolve(!res.data) : reject(res.message);
                        });
                      }, 100);
                    }
                  });
                },
                message: () => {
                  return 'The Name has already been exist.';
                }
              }
            },
            hooks: {
              onInit: field => {
                field.formControl?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(val => {
                  if (val) {
                    this.siteGroupService.getCodeName(val).subscribe(res => {
                      field.formControl?.setValue(res.data, {
                        emitEvent: false
                      });
                      this.model['name'] = res.data + '';
                      field.formControl?.markAsTouched();
                    });
                  }
                });
              }
            }
          }
        ]
      },

      {
        key: 'description',
        type: 'textarea',
        props: {
          label: 'Description',
          placeholder: 'Description'
        }
      }
    ];
  }

  getDetail() {
    this.isLoading = true;
    this.siteGroupService.getGroupInfo(this.id).subscribe(res => {
      if (res.code === 200 && res.data) {
        this.model = { ...this.model, ...res.data };
        this.formControlAboutEditor.setValue(res.data?.aboutPageContent ?? '');
        this.formControlContactEditor.setValue(res.data?.contactPageContent ?? '');
        this.isLoading = false;
      }
      this.getFields();
      this.isLoading = false;
    });
  }

  onHide() {
    this.options.resetModel?.();
    this.destroy$.next(null);
  }

  onCancel() {
    this.destroy$.next(null);
    this.visible = false;
  }

  onOk() {
    this.editForm.onSubmit(new Event('submit'));
  }

  onFormSubmit(model: GroupDetail) {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.isLoading = true;
      if (this.id) {
        this.siteGroupService
          .updateGroup(
            {
              ...model,
              aboutPageContent: this.formControlAboutEditor.value ?? '',
              contactPageContent: this.formControlContactEditor.value ?? ''
            },
            this.id
          )
          .subscribe(res => {
            if (res.code === 200 && res.data) {
              this.notifyService.notifySuccess('Success', 'Save Successfully Completed.');
              this.visible = false;
              this.saved.emit(res.data);
            } else {
              this.isLoading = false;
            }
          });
      } else {
        this.siteGroupService
          .createGroup({
            ...model,
            aboutPageContent: this.formControlAboutEditor.value ?? '',
            contactPageContent: this.formControlContactEditor.value ?? ''
          })
          .subscribe(res => {
            if (res.code === 200 && res.data) {
              this.notifyService.notifySuccess('Success', 'Save Successfully Completed.');
              this.visible = false;
              this.saved.emit(res.data);
            } else {
              this.isLoading = false;
            }
          });
      }
    }
  }
}
