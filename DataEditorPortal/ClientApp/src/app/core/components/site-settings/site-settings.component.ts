import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { tap } from 'rxjs';
import { ConfigDataService } from '../../services/config-data.service';
import { NotifyService } from '../../utils/notify.service';
@Component({
  selector: 'app-site-settings',
  templateUrl: './site-settings.component.html',
  styleUrls: ['./site-settings.component.scss']
})
export class SiteSettingsComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @ViewChild('file') file: any;
  public picTips = false;
  public isLoading = false;

  public siteSettings = {
    siteName: new FormControl(''),
    siteLogo: ''
  };

  constructor(
    public configDataService: ConfigDataService,
    private notifyService: NotifyService
  ) {}

  ngOnInit(): void {
    this.configDataService
      .getSiteSettings()
      .pipe(
        tap(res => {
          if (!res.isError && res.result) {
            this.siteSettings = {
              siteLogo: res.result.siteLogo || '',
              siteName: new FormControl(res.result.siteName)
            };
          }
        })
      )
      .subscribe();
  }
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
          this.siteSettings.siteLogo = res[0] as string;
          this.notifyService.notifySuccess('Success', 'Upload Success');
        }
      })
      .catch(err => {
        this.notifyService.notifyError('Error', err);
      });
  }

  removePic() {
    this.siteSettings.siteLogo = '';
  }
  onSave() {
    this.siteSettings.siteName.markAsDirty();
    if (!this.siteSettings.siteLogo) {
      this.picTips = true;
      return;
    } else {
      this.picTips = false;
    }

    this.isLoading = true;
    if (this.siteSettings.siteName.valid) {
      const { siteName, siteLogo } = this.siteSettings;
      this.configDataService
        .saveData({
          siteName: siteName.value || '',
          siteLogo: siteLogo
        })
        .pipe(
          tap((res: { isError: boolean }) => {
            if (!res.isError) {
              this.configDataService.siteSettings = {
                siteName: siteName.value || '',
                siteLogo: siteLogo
              };
              this.notifyService.notifySuccess('Success', 'Save Success');
            }
          })
        )
        .subscribe(() => (this.isLoading = false));
    }
  }
  onCancle() {
    history.back();
  }
}
