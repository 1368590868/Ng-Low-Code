import { Inject, Pipe, PipeTransform } from '@angular/core';

type UploadType = {
  fileId?: string;
  fileName?: string;
  status?: string;
  contentType?: string;
};

@Pipe({ name: 'upload' })
export class UploadPipe implements PipeTransform {
  private _apiUrl: string;
  constructor(@Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }
  transform(value: string, isShowAll = false): string {
    let parseVal: UploadType[] = [];
    if (!value) return '';
    if (typeof value === 'string') parseVal = JSON.parse(value);

    const filterArray = parseVal.filter(item => item?.status !== 'Deleted');
    const result = filterArray
      .map(item => {
        const url = `${this._apiUrl}attachment/download-file/${item.fileId}/${item.fileName}`;
        const html = `<a href=${url} target="_blank" class="no-underline cursor-pointer text-primary">${item.fileName}</a>`;
        return html;
      })
      .join('|');

    if (isShowAll) {
      if (filterArray.length > 0) return result.split('|').join('');
      else return '';
    } else {
      console.log(result);
      if (filterArray.length === 1) return result;
      if (filterArray.length > 1) return `${filterArray.length} attachments`;
      else return '';
    }
  }
}
