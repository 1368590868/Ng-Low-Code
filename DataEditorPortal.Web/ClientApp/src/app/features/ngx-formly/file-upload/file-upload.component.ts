import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  forwardRef,
  Inject,
  Input
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core';
import { ConfirmationService } from 'primeng/api';
import { NotifyService } from 'src/app/shared';
@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  providers: [
    ConfirmationService,
    {
      provide: CUSTOM_ELEMENTS_SCHEMA,
      useExisting: FileUploadComponent,
      multi: true
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ]
})
export class FileUploadComponent implements ControlValueAccessor {
  @Input() accept = '.dwg,.dxf,.dgn,.pdf,.ppt,.docx,.doc,.xlsx,.xls,image/*';
  @Input() maxFileSize = 10000;
  newAttachments: any[] = [];
  progress = 0;

  onChange?: any;
  onTouch?: any;
  disabled = false;

  apiUrl = '';

  @Input()
  set value(val: any) {
    if (typeof val === 'string') {
      val = JSON.parse(val);
    }
    this.newAttachments = val ?? [];
  }

  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  constructor(
    private confirmationService: ConfirmationService,
    private notifyService: NotifyService,
    @Inject('API_URL') apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  onUpload(event: any) {
    if (event?.originalEvent?.body?.result) {
      for (const file of event.originalEvent.body.result) {
        this.newAttachments.push(file);
      }
      this.onChange(this.newAttachments ?? []);
    }
  }

  onUploadError(event: any, fileUpload: any) {
    fileUpload.clear();
    this.notifyService.notifyError('Error', 'File Upload Failed');
  }

  onFileUploadProgress(event: any) {
    this.progress = Math.round(
      (event.originalEvent.loaded * 100) / event.originalEvent.total
    );
  }

  tempAttachmentDownload(data: any) {
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');

    a.href = url;
    const fileName = data.name;
    a.download = fileName;
    a.click();
    a.remove();
  }

  tempAttachmentDelete(data: any) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to remove ' + data.name + '?',
      header: 'Delete File',
      icon: 'pi pi-info-circle',

      accept: () => {
        this.newAttachments.find((x: any) => x.name === data.name).isDeleted =
          true;
        this.notifyService.notifySuccess(
          'Success',
          'File Deleted Successfully'
        );
      }
    });
  }

  tempAttachmentRestore(data: any) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to restored ' + data.name + '?',
      header: 'Restored File',
      icon: 'pi pi-info-circle',

      accept: () => {
        this.newAttachments.find((x: any) => x.name === data.name).isDeleted =
          false;
        this.notifyService.notifySuccess(
          'Success',
          'File Restored Successfully'
        );
      }
    });
  }
}

@Component({
  selector: 'app-formly-file-upload',
  template: `<app-file-upload
    [formControl]="formControl"
    [formlyAttributes]="field"
    [accept]="props.accept"
    [maxFileSize]="props.maxFileSize"></app-file-upload>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldFileUploadComponent extends FieldType<
  FieldTypeConfig<
    FormlyFieldProps & { options: any[]; accept: string; maxFileSize: number }
  >
> {}
