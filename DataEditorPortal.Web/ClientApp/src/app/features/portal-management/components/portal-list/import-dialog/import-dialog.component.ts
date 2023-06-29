import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NotifyService } from 'src/app/shared';
import { PortalItemService } from '../../../services/portal-item.service';
import { ImportPortal } from '../../../models/portal-item';
@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss']
})
export class ImportDialogComponent {
  @Input() header = 'Import Portal Item';
  @Input() cancelText = 'Cancel';
  @Input() dialogStyle = { width: '45rem', height: '30rem' };

  @Output() saved = new EventEmitter<string>();

  visible = false;
  isLoading = false;

  selection: ImportPortal[] = [];
  dataSource: ImportPortal[] = [];

  options: { label?: string; value?: string }[] = [];
  parentFolderControl = new FormControl();
  step = 1;

  progress = 0;
  file: any = null;

  constructor(
    private portalItemService: PortalItemService,
    private notifyService: NotifyService,
    @Inject('API_URL') public apiUrl: string
  ) {}

  showDialog() {
    this.isLoading = false;
    this.visible = true;

    this.portalItemService.getPortalList().subscribe(res => {
      this.options = res
        .filter(x => x.data?.['type'] === 'Folder')
        .map(x => {
          return {
            label: `- ${x.data?.['label']}`,
            value: x.data?.['id']
          };
        });
      this.options.splice(0, 0, {
        label: 'Root',
        value: '<root>'
      });
    });

    this.parentFolderControl.reset();
    this.parentFolderControl.setValue('<root>');
    this.step = 1;
    this.file = null;
  }

  onFileUploadProgress(event: any) {
    this.progress = event.progress;
  }

  onSelect(event: any) {
    this.progress = 0;
    this.file = null;
  }

  onRowCheckBoxClick(event: MouseEvent) {
    console.log(this.selection);
    event.stopPropagation();
  }

  onUpload(event: any) {
    if (event?.originalEvent?.body?.result) {
      for (const file of event.originalEvent.body.result) {
        if (file) {
          this.file = file;
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
      console.log(1);
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
            if (!res.isError) {
              this.step = 2;
              this.dataSource = res.result || [];
              this.selection = res.result || [];
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
          if (!res.isError && res.result) {
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
}
