import { Pipe, PipeTransform, ViewChild } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  forwardRef,
  HostBinding,
  Inject,
  Input,
  OnInit
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core';
import { ConfirmationService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { startWith } from 'rxjs';
import { NotifyService } from 'src/app/shared';
@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(value: any[]): number {
    return value.filter(x => x.status !== 'Deleted').length;
  }
}
@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  providers: [
    FilterPipe,
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
  @ViewChild(FileUpload) fileUpload!: FileUpload;
  @Input() gridName = '';
  @Input() fieldName: any;
  @Input() accept = '.dwg,.dxf,.dgn,.pdf,.ppt,.docx,.doc,.xlsx,.xls,image/*';
  @Input() maxFileSize = 10000;
  @Input() chooseLabel = 'Browse';
  @Input() multiple = false;
  @Input() fileLimit = 1;
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
    @Inject('API_URL') apiUrl: string,
    private filterPipe: FilterPipe
  ) {
    this.apiUrl = apiUrl;
  }

  onFileUploadSelect(event: any) {
    const files = event.currentFiles;

    // check fileType
    let errorFile = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (this.accept && !(this.fileUpload as any).isFileTypeValid(file)) {
        errorFile.push(file);
      }
    }
    if (errorFile.length > 0) {
      this.notifyService.notifyError(
        'Invalid file type',
        `<ul class="pl-3"><li class="py-1">${errorFile
          .map(f => f.name)
          .join('</li><li class="py-1">')}</li></ul>`
      );
      this.fileUpload.clear();
      return;
    }

    // check maxFileSize
    errorFile = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (this.maxFileSize && file.size > this.maxFileSize) {
        errorFile.push(file);
      }
    }
    if (errorFile.length > 0) {
      this.notifyService.notifyError(
        'Maximum upload size exceeded',
        `<ul class="pl-3"><li>${errorFile
          .map(f => f.name)
          .join('</li><li>')}</li></ul>`
      );
    }

    // check filelimit
    if (this.fileLimit) {
      const isNotDeletedFile = this.filterPipe.transform(this.newAttachments);
      if (files.length + isNotDeletedFile > this.fileLimit) {
        this.notifyService.notifyError(
          'Error',
          `Maximum number of files exceeded, limit is ${this.fileLimit} at most.`
        );
        this.fileUpload.clear();
        return;
      }
    }

    // no errors, start to upload.
    this.fileUpload.upload();
  }

  onUpload(event: any) {
    this.progress = 0;
    if (event?.originalEvent?.body?.result) {
      for (const file of event.originalEvent.body.result) {
        this.newAttachments.push(file);
      }
      this.newAttachments = JSON.parse(JSON.stringify(this.newAttachments));
      this.onChange(JSON.stringify(this.newAttachments ?? []));
    }
  }

  onUploadError(event: any) {
    this.fileUpload.clear();
    this.notifyService.notifyError('Error', 'File Upload Failed');
  }

  onFileUploadProgress(event: any) {
    this.progress = event.progress;
  }

  onEditComments() {
    this.onChange(JSON.stringify(this.newAttachments));
  }

  tempAttachmentDownload(data: any) {
    const url =
      data.status === 'New'
        ? `${this.apiUrl}attachment/download-temp-file/${data.fileId}/${data.fileName}`
        : `${this.apiUrl}attachment/download-file/${this.gridName}/${
            this.fieldName
          }/${data.fileId}/${encodeURIComponent(data.fileName || '')}`;
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

    if (this.newAttachments.length === 0) {
      this.onChange(null);
    } else {
      this.onChange(JSON.stringify(this.newAttachments));
    }
    this.newAttachments = JSON.parse(JSON.stringify(this.newAttachments));
  }

  tempAttachmentRestore(data: any) {
    this.newAttachments.find((x: any) => x.fileId === data.fileId).status =
      'Current';
    this.newAttachments = JSON.parse(JSON.stringify(this.newAttachments));
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
    [fileLimit]="props.fileLimit || 1"
    [gridName]="props.gridName"
    [fieldName]="field.key"></app-file-upload>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldFileUploadComponent
  extends FieldType<
    FieldTypeConfig<
      FormlyFieldProps & {
        options: any[];
        accept: string;
        maxFileSize: number;
        chooseLabel: string;
        multiple: boolean;
        fileLimit: number;
        gridName: string;
        fieldName: any;
      }
    >
  >
  implements OnInit
{
  @HostBinding('style.width') width = '';
  @HostBinding('style.margin-top') marginTop = '0';

  ngOnInit(): void {
    this.formControl.valueChanges
      .pipe(startWith(this.formControl.value))
      .subscribe(val => {
        this.width = val && val !== '[]' ? '100% !important' : '';
        this.marginTop = val && val !== '[]' ? '0.25rem' : '0';
      });
  }
}
