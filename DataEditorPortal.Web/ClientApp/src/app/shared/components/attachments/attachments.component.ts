import { Component, Inject, Input } from '@angular/core';
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
    this.tooltipList = parseVal
      .map(item => {
        const comments = item?.comments;
        if (!comments) return '';
        const commentsList = comments.split('\n');
        return commentsList.map(comment => {
          if (comment === '') return '';
          return `${item.fileName} : ${comment} \n`;
        });
      })
      .join('');
  }

  @Input() gridName = '';
  @Input() fieldName = '';
  @Input() showAll = false;

  tooltipList: any = [];
  fileList: AttachmentType[] = [];

  constructor(@Inject('API_URL') public apiUrl: string) {}
}
