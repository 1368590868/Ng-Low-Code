import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SiteSettingsService } from '../../services/site-settings.service';
import { UserService } from '../../services/user.service';
import { NotifyService } from '../../utils/notify.service';
@Component({
  selector: 'app-site-settings',
  templateUrl: './site-settings.component.html',
  styleUrls: ['./site-settings.component.scss']
})
export class SiteSettingsComponent implements OnInit {
  constructor(
    private siteSettingsService: SiteSettingsService,
    private notifyService: NotifyService,
    private userService: UserService
  ) {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @ViewChild('file') file: any;
  public picture = '';
  public picTips = false;
  public siteTitle = new FormControl('');

  ngOnInit() {
    this.userService.USER.picture =
      'https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png';
    this.userService.USER.siteTitle = 'GIS Work Order Tracking System(WOTS)';

    this.picture = this.userService.USER.picture || '';
    this.siteTitle.setValue(this.userService.USER.siteTitle || '');
  }

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          this.picture = res[0] as string;
          this.notifyService.notifySuccess('Success', 'Upload Success');
        }
      })
      .catch(err => {
        this.notifyService.notifyError('Error', err);
      });
  }

  removePic() {
    this.picture = '';
  }
  onSave() {
    this.siteTitle.markAsDirty();
    if (this.picture === '') {
      this.picTips = true;
      return;
    } else {
      this.picTips = false;
    }
    if (this.siteTitle.valid) {
      this.siteSettingsService.saveData({
        siteTitle: this.siteTitle.value || '',
        picture: this.picture
      });
      // View Data Change
      this.userService.USER.siteTitle = this.siteTitle.value || '';
    }
  }
  onCancle() {
    history.back();
  }
}
