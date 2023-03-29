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
  @Input() chooseLabel = 'Browse';
  @Input() multiple = false;
  @Input() fileLimit: any = null;
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
      if (
        this.fileLimit &&
        event.originalEvent.body.result.length > this.fileLimit
      ) {
        this.notifyService.notifyError('Error', 'File Limit Exceeded');
        return;
      }
      for (const file of event.originalEvent.body.result) {
        this.newAttachments.push(file);
      }
      this.onChange(JSON.stringify(this.newAttachments ?? []));
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

  onEditComments() {
    this.onChange(JSON.stringify(this.newAttachments));
  }

  tempAttachmentDownload(data: any) {
    const url =
      data.status === 'New'
        ? `${this.apiUrl}attachment/download-temp-file/${data.fileId}/${data.fileName}`
        : `${this.apiUrl}attachment/download-file/${data.fileId}/${data.fileName}`;
    const a = document.createElement('a');

    a.href = url;
    a.target = '_black';
    const fileName = data.name;
    a.download = fileName;
    a.click();
    a.remove();
  }

  tempAttachmentDelete(data: any) {
    if (data.status === 'New') {
      this.newAttachments = this.newAttachments.filter(
        (x: any) => x.fileId !== data.fileId
      );
    } else {
      this.newAttachments.find((x: any) => x.fileId === data.fileId).status =
        'Deleted';
    }
    this.onChange(JSON.stringify(this.newAttachments));
  }

  tempAttachmentRestore(data: any) {
    this.newAttachments.find((x: any) => x.fileId === data.fileId).status =
      'Current';
    this.onChange(JSON.stringify(this.newAttachments));
  }
}

@Component({
  selector: 'app-formly-file-upload',
  template: `<app-file-upload
    [formControl]="formControl"
    [formlyAttributes]="field"
    [accept]="props.accept"
    [maxFileSize]="props.maxFileSize"
    [chooseLabel]="props.chooseLabel || 'Browse'"
    [multiple]="props.multiple"
    [fileLimit]="props.fileLimit"></app-file-upload>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldFileUploadComponent extends FieldType<
  FieldTypeConfig<
    FormlyFieldProps & {
      options: any[];
      accept: string;
      maxFileSize: number;
      chooseLabel: string;
      multiple: boolean;
      fileLimit: number;
    }
  >
> {}
