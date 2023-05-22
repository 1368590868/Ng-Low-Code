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
    const msgList = errors.filter(error => error.field === value);
    if (msgList.length === 0) return null;
    const msg = msgList.map(msg => `<li >${msg.errorMsg}</li>`).join('');
    const html = `<ul style='padding-left:1.5rem'>${msg}</ul>`;

    return html ?? null;
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
  progress = 0;
  statusList: any[] = [];
  innerInfoList?: InfoData[] = [];
  columns: any[] = [];
  clickFilterButton = -1;
  stepType = '';

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
    this.isLoading = true;
    this.importExcelService.getImportHistories(this.gridName).subscribe(res => {
      this.isLoading = false;
      this.importFileList = res;
    });
  }

  onNewImport(type: string) {
    this.stepType = type;
    this.currentStep = 2;
    this.step = 2;
  }

  onDownloadTemplate() {
    const url = `${this.apiUrl}import-data/${
      this.gridName
    }/${this.stepType.toLowerCase()}/download-template`;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_black';
    const fileName = this.stepType;
    a.download = fileName;
    a.click();
    a.remove();
  }

  onSelect(event: any) {
    this.progress = 0;
    this.file = null;
    this.currentStep = 2;
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
      .getUploadTemplate(this.file, this.gridName, this.stepType.toLowerCase())
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
              .filter(item => item.header !== '__errors__');

            // group by status
            this.statusList = this.infoList.reduce((acc: any, cur) => {
              const found: { data: InfoData[] } = acc.find(
                (item: { __status__: number }) =>
                  item.__status__ === cur['__status__']
              );
              if (found) {
                found.data.push(cur);
              } else {
                acc.push({ __status__: cur['__status__'], data: [cur] });
              }
              return acc;
            }, []);
          }
        }
        this.isLoading = false;
      });
  }

  onShowInfo(type: number) {
    this.clickFilterButton = type;
    // -1 is all
    if (type !== -1) {
      if (this.innerInfoList) {
        this.infoList = this.innerInfoList.filter(
          item => item['__status__'] === type
        );
      }
    } else {
      this.infoList = this.innerInfoList;
    }
  }

  onFileUploadProgress(event: any) {
    this.progress = event.progress;
  }

  onUploadError(event: any, upload: any) {
    upload.clear();
    this.notifyService.notifyError('Error', 'File Upload Failed');
  }

  onConfirmImport() {
    this.isLoading = true;
    this.importExcelService
      .confirmImport(this.file, this.gridName, this.stepType.toLowerCase())
      .subscribe(res => {
        if (!res.isError) {
          this.file = null;
          setTimeout(() => {
            this.initImportFileList();
            this.currentStep = 1;
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
      this.okLabel = 'Submit';
    } else {
      this.okLabel = 'Next';
    }
    if (this.step === 2 && currentStep === 3) {
      return false;
    }
    if (
      this.innerInfoList &&
      this.innerInfoList.every(item => item['__status__'] === 0) &&
      currentStep === 3 &&
      this.step === 3
    ) {
      return false;
    }
    return true;
  }
  refresh() {
    this.initImportFileList();
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
      this.progress = 0;
    }
  }

  onCancel() {
    this.isLoading = false;
    this.cancelEvent.emit();
  }
}
