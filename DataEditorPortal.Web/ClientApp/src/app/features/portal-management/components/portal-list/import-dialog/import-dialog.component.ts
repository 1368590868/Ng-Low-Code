import {
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { NotifyService } from 'src/app/shared';
import { PortalItemService } from '../../../services/portal-item.service';
import { ImportPortal, PortalItem } from '../../../models/portal-item';
import { Dialog } from 'primeng/dialog';
@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss']
})
export class ImportDialogComponent {
  @Input() header = 'Import Portal Item';
  @Input() cancelText = 'Cancel';

  @Output() saved = new EventEmitter<string>();
  @ViewChild(Dialog) dialog!: Dialog;

  visible = false;
  isLoading = false;

  selection: ImportPortal[] = [];
  dataSource: ImportPortal[] = [];

  options: { label?: string; value?: string; disabled?: boolean }[] = [];
  parentFolderControl = new FormControl();
  step = 1;

  progress = 0;
  file: any = null;
  fileLabel = '';

  constructor(
    private portalItemService: PortalItemService,
    private notifyService: NotifyService,
    @Inject('API_URL') public apiUrl: string
  ) {}

  showDialog() {
    this.isLoading = false;
    this.visible = true;
    this.progress = 0;
    this.parentFolderControl.reset();

    this.portalItemService.getPortalList().subscribe(res => {
      this.options = this.getFolders(res, 1);

      this.options.splice(0, 0, {
        label: 'Root',
        value: '<root>'
      });
      this.parentFolderControl.setValue(this.options[0].value);
    });

    this.step = 1;
    this.file = null;
  }

  getFolders(data: PortalItem[], level: number) {
    let folders: any = [];
    data.forEach(x => {
      if (x.data?.['type'] === 'Folder') {
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

  disableRow(row: any) {
    return (
      row.type === 'Portal Item' ||
      (row.type === 'DataSource Connection' && !row.exist)
    );
  }

  onFileUploadProgress(event: any) {
    this.progress = event.progress;
  }

  onSelect(event: any) {
    this.progress = 0;
    this.file = null;
  }

  onRowCheckBoxClick(event: MouseEvent) {
    event.stopPropagation();
  }

  onUpload(event: any) {
    if (event?.originalEvent?.body?.data) {
      for (const file of event.originalEvent.body.data) {
        if (file) {
          this.file = file;
          this.fileLabel = this.file.fileName;
          if (this.fileLabel.length > 30) {
            const regex = /^(.{14}).*(.{14})$/;
            this.fileLabel = this.fileLabel.replace(regex, '$1...$2');
          }
        }
      }
    }
  }

  onUploadError(event: any, upload: any) {
    upload.clear();
    this.notifyService.notifyError('Error', 'File Upload Failed');
  }

  validDisabled() {
    if (this.step === 1) {
      return !this.file;
    }

    return false;
  }

  onCancel() {
    this.visible = false;
  }

  onBack() {
    this.step -= 1;
  }

  onOk() {
    if (this.step === 1) {
      this.parentFolderControl.markAsDirty();
      if (this.parentFolderControl.valid) {
        if (!this.file) {
          return;
        }
        this.isLoading = true;

        this.portalItemService
          .importPortalItem({
            attachment: this.file,
            parentId:
              this.parentFolderControl.value === '<root>'
                ? null
                : this.parentFolderControl.value
          })
          .subscribe(res => {
            if (res.code === 200) {
              this.step = 2;
              this.dataSource = res.data || [];
              this.selection = res.data || [];
              this.markDialogForChange();
            }
            this.isLoading = false;
          });
      }
    }

    if (this.step === 2) {
      if (this.selection.length === 0) {
        this.notifyService.notifyWarning('Warning', 'Please select items');
        return;
      }
      this.isLoading = true;

      const selectedObjects = this.selection.map((x: any) => x.key);

      this.portalItemService
        .confirmPortalItem({
          attachment: this.file,
          parentId:
            this.parentFolderControl.value === '<root>'
              ? null
              : this.parentFolderControl.value,
          selectedObjects
        })
        .subscribe(res => {
          if (res.code === 200 && res.data) {
            this.visible = false;
            this.saved.emit();
            this.notifyService.notifySuccess(
              'Success',
              'Imported Successfully'
            );
          }
          this.isLoading = false;
        });
    }
  }

  markDialogForChange() {
    (this.dialog as any).cd.markForCheck();
  }
}
