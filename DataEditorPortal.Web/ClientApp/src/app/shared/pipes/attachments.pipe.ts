import { Inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
type AttachmentType = {
  fileId?: string;
  fileName?: string;
  status?: string;
  contentType?: string;
  comments?: string;
};

@Pipe({ name: 'attachments' })
export class AttachmentsPipe implements PipeTransform {
  private _apiUrl: string;
  constructor(
    @Inject('API_URL') apiUrl: string,
    private sanitizer: DomSanitizer
  ) {
    this._apiUrl = apiUrl;
  }
  transform(
    value: string,
    gridName: string,
    fieldName: string,
    isShowAll = false
  ) {
    let parseVal: AttachmentType[] = [];
    if (!value) return '';
    try {
      if (typeof value === 'string') parseVal = JSON.parse(value);
    } catch (e) {
      parseVal = [];
    }

    const filterArray = parseVal.filter(item => item?.status !== 'Deleted');
    const result = filterArray
      .map(item => {
        const url = `${
          this._apiUrl
        }attachment/download-file/${gridName}/${fieldName}/${
          item.fileId
        }/${encodeURIComponent(item.fileName || '')}`;
        const html = ` <a href=${url} target="_blank" title="${item?.comments}"  class="no-underline cursor-pointer text-primary"  > ${item.fileName}</a>`;
        return html;
      })
      .join('|');

    if (isShowAll) {
      if (filterArray.length > 0)
        return this.sanitizer.bypassSecurityTrustHtml(
          result.split('|').join('')
        );
      else return '';
    } else {
      if (filterArray.length === 1) return result;
      if (filterArray.length > 1) return `${filterArray.length} attachments`;
      else return '';
    }
  }
}
