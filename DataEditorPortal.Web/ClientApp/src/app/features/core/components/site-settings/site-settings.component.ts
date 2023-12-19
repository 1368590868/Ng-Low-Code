import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { tap } from 'rxjs';
import { NotifyService, ConfigDataService } from 'src/app/shared';

@Component({
  selector: 'app-site-settings',
  templateUrl: './site-settings.component.html',
  styleUrls: ['./site-settings.component.scss']
})
export class SiteSettingsComponent implements OnInit {
  @ViewChild('file') file!: HTMLInputElement;
  public picTips = false;
  public isLoading = false;
  public siteLicense = '';
  public visible = false;

  public siteLogo = '';
  public formControlSiteName = new FormControl('');
  public formControlAboutEditor = new FormControl('');
  public formControlContactEditor = new FormControl('');
  public formControlLicense = new FormControl('');

  constructor(public configDataService: ConfigDataService, private notifyService: NotifyService) {}

  ngOnInit(): void {
    if (!this.configDataService.licenseExpired) {
      this.configDataService
        .getSiteSettings()
        .pipe(
          tap(res => {
            if (res.code === 200 && res.data) {
              this.siteLogo = res.data.siteLogo || '';
              this.formControlSiteName.setValue(res.data.siteName);
            }
          })
        )
        .subscribe();
      this.configDataService.getHTMLData('about').subscribe(res => {
        this.formControlAboutEditor.setValue(res);
      });
      this.configDataService.getHTMLData('contact').subscribe(res => {
        this.formControlContactEditor.setValue(res);
      });
    }

    this.configDataService.getLicense().subscribe(res => {
      if (res.isExpired) {
        this.configDataService.licenseExpired = true;
      }
      this.siteLicense = res.license;
    });
  }
  picChange(event: Event) {
    const files = (event.target as HTMLInputElement).files || {};
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
        reader.onload = (event: ProgressEvent<FileReader>) => {
          const result = event.target?.result;
          if (typeof result === 'string') {
            const picture = `data:${file.type};base64,${btoa(result)}`;
            resolve(picture);
          }
        };
      });
    });

    Promise.all(filePromise)
      .then((res: Array<string | unknown>) => {
        if (res[0] !== undefined) {
          this.siteLogo = res[0] as string;
        }
      })
      .catch(err => {
        this.notifyService.notifyError('Error', err);
      });
  }

  removePic() {
    this.siteLogo = '';
  }
  onSave() {
    this.formControlSiteName.markAsDirty();
    if (!this.siteLogo) {
      this.picTips = true;
      return;
    } else {
      this.picTips = false;
    }

    this.isLoading = true;
    if (this.formControlSiteName.valid) {
      this.configDataService
        .saveData({
          siteName: this.formControlSiteName.value || '',
          siteLogo: this.siteLogo
        })
        .pipe(
          tap(res => {
            if (res.code === 200) {
              this.configDataService.siteSettings = {
                siteName: this.formControlSiteName.value || '',
                siteLogo: this.siteLogo
              };
              this.notifyService.notifySuccess('Success', 'Save Success');
            }
          })
        )
        .subscribe(() => (this.isLoading = false));
    }
  }

  onSaveAbout() {
    if (!this.formControlAboutEditor.value) {
      this.notifyService.notifyWarning('', 'Please input content');
      return;
    }
    this.configDataService
      .saveHTMLData({
        pageName: 'about',
        html: this.formControlAboutEditor.value
      })
      .subscribe(res => {
        if (res.code === 200) {
          this.notifyService.notifySuccess('Success', 'Save Success');
        }
      });
  }

  onSaveContact() {
    if (!this.formControlContactEditor.value) {
      this.notifyService.notifyWarning('', 'Please input content');
      return;
    }
    this.configDataService
      .saveHTMLData({
        pageName: 'contact',
        html: this.formControlContactEditor.value
      })
      .subscribe(res => {
        if (res.code === 200) {
          this.notifyService.notifySuccess('Success', 'Save Success');
        }
      });
  }

  onSaveLicense() {
    if (!this.formControlLicense.valid) {
      this.formControlLicense.markAsDirty();
      return;
    }
    if (!this.formControlLicense.value) {
      return;
    }
    this.configDataService.saveLicense(this.formControlLicense.value).subscribe(res => {
      if (res.code === 200) {
        this.notifyService.notifySuccess('Success', 'Save Success');
        this.configDataService.licenseExpiredChange$.next(false);
        this.onCancel();
      }
    });
  }

  onCancel() {
    this.formControlLicense.reset();
    this.visible = false;
  }
}
