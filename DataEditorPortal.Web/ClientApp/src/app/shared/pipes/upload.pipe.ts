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
  transform(value: UploadType[]): string[] {
    if (!value) return [];
    if (typeof value === 'string') value = JSON.parse(value);

    return value.map((item: UploadType) => {
      if (item.status !== 'Deleted') {
        const url = `${this._apiUrl}attachment/download-file/${item.fileId}/${item.fileName}`;
        const html = `<a href=${url} target="_blank">${item.fileName}</a>`;
        console.log(html);
        return html;
      }

      return '';
    });
  }
}
