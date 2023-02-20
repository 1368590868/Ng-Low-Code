import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { AbstractControl, FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import {
  DictionaryData,
  NotifyService,
  DataDictionaryService
} from 'src/app/shared';

@Component({
  selector: 'app-add-dictionary-dialog',
  templateUrl: './add-dictionary-dialog.component.html',
  styleUrls: ['./add-dictionary-dialog.component.scss']
})
export class AddDictionaryDialogComponent {
  @Input() header = 'Add / Edit';
  @Input() okText = 'Ok';
  @Input() cancelText = 'Cancel';
  @Input() dialogStyle = { width: '40rem' };

  @Output() saved = new EventEmitter<string>();

  @ViewChild('editForm') editForm!: NgForm;

  visible = false;
  isLoading = false;
  buttonDisabled = true;

  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model: DictionaryData = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'label',
      type: 'input',
      props: {
        label: 'Label',
        placeholder: 'Label',
        required: true
      },
      modelOptions: {
        updateOn: 'blur'
      },
      asyncValidators: {
        exist: {
          expression: (c: AbstractControl) => {
            return new Promise((resolve, reject) => {
              resolve(true);
            });
          },
          message: () => {
            return 'The Menu Name has already been exist.';
          }
        }
      }
    },
    {
      key: 'value',
      type: 'input',
      props: {
        label: 'Value',
        placeholder: 'value',
        required: true
      }
    },
    {
      key: 'value1',
      type: 'input',
      props: {
        label: 'Value1',
        placeholder: 'value1',
        required: false
      }
    },
    {
      key: 'value2',
      type: 'input',
      props: {
        label: 'Value2',
        placeholder: 'value2',
        required: false
      }
    },
    {
      key: 'category',
      type: 'input',
      props: {
        label: 'category',
        placeholder: 'category',
        required: true
      }
    }
  ];

  constructor(
    private dataDictionaryService: DataDictionaryService,
    private notifyService: NotifyService
  ) {}
  showDialog() {
    this.isLoading = false;
    this.visible = true;
    this.buttonDisabled = false;
  }

  onHide() {
    this.options.resetModel?.();
  }

  onCancel() {
    this.visible = false;
  }

  onOk() {
    this.editForm.onSubmit(new Event('submit'));
  }

  onFormSubmit(model: DictionaryData) {
    if (this.form.valid) {
      this.isLoading = true;
      if (model['id']) {
        this.dataDictionaryService.updateDictionary(model).subscribe(res => {
          if (!res.isError && res.result) {
            this.notifyService.notifySuccess(
              'Success',
              'Save Successfully Completed.'
            );
            this.visible = false;
            this.saved.emit(res.result);
          } else {
            this.isLoading = false;
          }
        });
      } else {
        this.dataDictionaryService.createDictionary(model).subscribe(res => {
          if (!res.isError && res.result) {
            this.notifyService.notifySuccess(
              'Success',
              'Save Successfully Completed.'
            );
            this.visible = false;
            this.saved.emit(res.result);
          } else {
            this.isLoading = false;
          }
        });
      }
    }
  }
}
