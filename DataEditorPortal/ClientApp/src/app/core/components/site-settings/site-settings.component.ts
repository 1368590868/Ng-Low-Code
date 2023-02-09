import { Component, ViewChild } from '@angular/core';
import { tap } from 'rxjs';
import { SiteSettingsService } from '../../services/site-settings.service';
import { NotifyService } from '../../utils/notify.service';
@Component({
  selector: 'app-site-settings',
  templateUrl: './site-settings.component.html',
  styleUrls: ['./site-settings.component.scss']
})
export class SiteSettingsComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @ViewChild('file') file: any;
  public picTips = false;

  constructor(
    public siteSettingsService: SiteSettingsService,
    private notifyService: NotifyService
  ) {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  picChange(event: any) {
    const files = event.target.files;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filePromise = Object.entries(files).map((item: any) => {
      return new Promise((resolve, reject) => {
        const [, file] = item;

        if (file.type.split('/')[0] !== 'image') {
          return reject('Only Support Image');
        }
        if (file.size > 1024 * 1024 * 2) {
          return reject('File Size Max 2M');
        }

        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = (event: ProgressEvent<any>) => {
          console.log(typeof event.target.result);
          const picture = `data:${file.type};base64,${btoa(
            event.target.result
          )}`;
          resolve(picture);
        };
      });
    });

    Promise.all(filePromise)
      .then((res: Array<string | unknown>) => {
        if (res[0] !== undefined) {
          this.siteSettingsService.siteSettings.siteIcon = res[0] as string;
          this.notifyService.notifySuccess('Success', 'Upload Success');
        }
      })
      .catch(err => {
        this.notifyService.notifyError('Error', err);
      });
  }

  removePic() {
    this.siteSettingsService.siteSettings.siteIcon = '';
  }
  onSave() {
    this.siteSettingsService.siteSettings.siteName.markAsDirty();
    if (!this.siteSettingsService.siteSettings.siteIcon) {
      this.picTips = true;
      return;
    } else {
      this.picTips = false;
    }
    if (this.siteSettingsService.siteSettings.siteName.valid) {
      this.siteSettingsService
        .saveData({
          siteName: this.siteSettingsService.siteSettings.siteName.value || '',
          siteIcon: this.siteSettingsService.siteSettings.siteIcon
        })
        .pipe(
          tap((res: { isError: boolean }) => {
            if (!res.isError) {
              this.siteSettingsService.convertNewSiteSettings();
              this.notifyService.notifySuccess('Success', 'Save Success');
            }
          })
        )
        .subscribe();
    }
  }
  onCancle() {
    history.back();
  }
}
