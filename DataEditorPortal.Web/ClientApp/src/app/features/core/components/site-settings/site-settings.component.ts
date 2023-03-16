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

  public siteLogo = '';
  public formControlSiteName = new FormControl('');
  public formControlAboutEditor = new FormControl('');
  public formControlContactEditor = new FormControl('');

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
            this.siteLogo = res.result.siteLogo || '';
            this.formControlSiteName.setValue(res.result.siteName);
          }
        })
      )
      .subscribe();
    this.configDataService.getHTMLData().subscribe(res => {
      this.formControlAboutEditor.setValue(res?.aboutHtml || '');
      this.formControlContactEditor.setValue(res?.contactHtml || '');
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
          tap((res: { isError: boolean }) => {
            if (!res.isError) {
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
        if (!res.isError) {
          this.notifyService.notifySuccess('Success', 'Save Success');
        }
      });
  }

  onSaveContact() {
    if (!this.formControlContactEditor.value) {
      this.notifyService.notifyWarning('', 'Please input content');
      return;
    }
    console.log(this.formControlContactEditor.value);
    this.configDataService
      .saveHTMLData({
        pageName: 'contact',
        html: this.formControlContactEditor.value
      })
      .subscribe(res => {
        if (!res.isError) {
          this.notifyService.notifySuccess('Success', 'Save Success');
        }
      });
  }
  onCancle() {
    history.back();
  }
}
