import { Component, Inject, Input } from '@angular/core';
import { SystemLogService } from '../../services/system-log.service';
type AttachmentType = {
  fileId?: string;
  fileName?: string;
  status?: string;
  contentType?: string;
  comments?: string;
};

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss']
})
export class AttachmentsComponent {
  @Input()
  set data(value: AttachmentType[]) {
    let parseVal: AttachmentType[] = [];
    if (!value) this.fileList = [];
    try {
      if (typeof value === 'string') parseVal = JSON.parse(value);
    } catch (e) {
      parseVal = [];
    }

    this.fileList = parseVal.filter(item => item?.status !== 'Deleted');
    const msg = this.fileList
      .map(item => {
        return `<li >${item.fileName}</li>`;
      })
      .join('');
    const html = `<ul style='padding-left:1.5rem'>${msg}</ul>`;
    this.tooltipList = html;
  }

  @Input() gridName = '';
  @Input() fieldName = '';
  @Input() showAll = false;

  tooltipList: any = [];
  fileList: AttachmentType[] = [];

  constructor(
    @Inject('API_URL') public apiUrl: string,
    private systemLogService: SystemLogService
  ) {}

  onEventLog(file: AttachmentType) {
    this.systemLogService.addSiteVisitLog({
      action: 'Download Attachment',
      section: this.gridName,
      params: JSON.stringify(file)
    });
  }
}
