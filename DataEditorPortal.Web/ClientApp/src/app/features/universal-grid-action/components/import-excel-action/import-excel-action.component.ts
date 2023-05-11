import { Component, Inject, OnInit, Pipe, PipeTransform } from '@angular/core';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { ImportActionService } from '../../services/import-action.service';
import { NotifyService } from 'src/app/shared';
import { ImportStatusComponent } from './import-status.component';
import { InfoData } from '../../models/import';

@Pipe({
  name: 'hasError'
})
export class HasErrorPipe implements PipeTransform {
  transform(value: string, errors: { field: string; errorMsg: string }[] = []) {
    const msg = errors.find(error => error.field === value)?.errorMsg;
    return msg ?? null;
  }
}
@Component({
  selector: 'app-import-excel-action',
  templateUrl: './import-excel-action.component.html',
  styleUrls: ['./import-excel-action.component.scss'],
  styles: [
    `
      :host {
        display: flex;
        flex-flow: column;
        overflow: auto;
      }
    `
  ],
  providers: [HasErrorPipe, ImportActionService, ImportStatusComponent]
})
export class ImportExcelActionComponent
  extends GridActionDirective
  implements OnInit
{
  isLoading = false;
  uploadedFiles: any[] = [];
  okLabel = 'Next';
  step = 1;
  currentStep = 1;
  file: any = null;
  statusList: any[] = [];
  innerInfoList?: InfoData[] = [];
  columns: any[] = [];

  importFileList: any[] = [];
  infoList?: InfoData[] = [];

  constructor(
    private importExcelService: ImportActionService,
    @Inject('API_URL') public apiUrl: string,
    private notifyService: NotifyService
  ) {
    super();
  }
  ngOnInit(): void {
    this.loadedEvent.emit();
    this.initImportFileList();
  }

  initImportFileList() {
    this.importExcelService.getImportHistories(this.gridName).subscribe(res => {
      this.importFileList = res;
    });
  }

  onNewImport() {
    this.currentStep = 2;
    this.step = 2;
  }

  onDownloadTemplate() {
    const url = `${this.apiUrl}attachment/download-temp-file/af06da4a-1d5f-4eaa-8610-b6e42bf42647/test.xlsx`;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_black';
    const fileName = 'template';
    a.download = fileName;
    a.click();
    a.remove();
  }

  onSelect(event: any, uploadRef: any) {
    uploadRef.upload();
  }

  onUpload(event: any) {
    if (event?.originalEvent?.body?.result) {
      for (const file of event.originalEvent.body.result) {
        if (file) {
          this.file = file;
          // upload file to server
          this.currentStep = 3;
        }
      }
    }
  }

  onUploadExcelTemplate() {
    this.isLoading = true;
    this.importExcelService
      .getFileInfo(this.file, this.gridName)
      .subscribe(res => {
        if (res?.data) {
          if (res?.data?.length > 0) {
            this.step = 3;
          } else {
            this.notifyService.notifyWarning(
              'Warning',
              'The uploaded file data is empty.'
            );
          }
          this.infoList = res?.data;
          this.innerInfoList = res?.data;
          if (this.infoList && this.infoList.length > 0) {
            this.columns = Object.keys(this.infoList[0])
              .map(key => ({
                header: key
              }))
              .filter(
                item =>
                  item.header !== 'errors' && item.header !== this.recordKey
              );

            // group by status
            this.statusList = this.infoList.reduce((acc: any, cur) => {
              const found: { data: InfoData[] } = acc.find(
                (item: { status: number }) => item.status === cur.status
              );
              if (found) {
                found.data.push(cur);
              } else {
                acc.push({ status: cur.status, data: [cur] });
              }
              return acc;
            }, []);
          }
        }
        this.isLoading = false;
      });
  }

  onShowInfo(type: number) {
    if (type !== -1) {
      if (this.innerInfoList) {
        this.infoList = this.innerInfoList.filter(item => item.status === type);
      }
    } else {
      this.infoList = this.innerInfoList;
    }
  }

  onUploadError(event: any, upload: any) {
    upload.clear();
    this.notifyService.notifyError('Error', 'File Upload Failed');
  }

  onConfirmImport() {
    this.isLoading = true;
    this.importExcelService
      .confirmImport(this.file, this.gridName)
      .subscribe(res => {
        if (!res.isError) {
          this.file = null;
          this.initImportFileList();
          this.currentStep = 1;
          setTimeout(() => {
            this.step = this.currentStep;
            this.isLoading = false;
          }, 1000);
        } else {
          this.isLoading = false;
        }
      });
  }

  validDisabled(currentStep: number) {
    if (this.step === 3) {
      this.okLabel = 'Finish';
    } else {
      this.okLabel = 'Next';
    }
    if (this.step === 2 && currentStep === 3) {
      return false;
    }
    if (
      this.innerInfoList &&
      this.innerInfoList.every(item => item.status !== 0) &&
      currentStep === 3 &&
      this.step === 3
    ) {
      return false;
    }
    return true;
  }

  onOk() {
    if (this.step === 3) {
      this.onConfirmImport();
    }
    if (this.step === 2 && this.currentStep === 3) {
      this.onUploadExcelTemplate();
      return;
    }
    this.step = this.currentStep;
  }
  onBack() {
    this.step -= 1;
    if (this.step === 1) {
      this.file = null;
    }
  }

  onCancel() {
    this.isLoading = false;
    this.cancelEvent.emit();
  }
}
