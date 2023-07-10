import {
  Component,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Dropdown } from 'primeng/dropdown';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
  selector: 'app-icon-select',
  templateUrl: './iconselect.component.html',
  styleUrls: ['./iconselect.component.scss'],
  providers: [
    {
      provide: CUSTOM_ELEMENTS_SCHEMA,
      useExisting: IconSelectComponent,
      multi: true
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IconSelectComponent),
      multi: true
    }
  ]
})
export class IconSelectComponent implements ControlValueAccessor {
  public initIcon = [
    'pi pi-eraser',
    'pi pi-stopwatch',
    'pi pi-verified',
    'pi pi-delete-left',
    'pi pi-hourglass',
    'pi pi-truck',
    'pi pi-wrench',
    'pi pi-microphone',
    'pi pi-megaphone',
    'pi pi-arrow-right-arrow-left',
    'pi pi-bitcoin',
    'pi pi-file-edit',
    'pi pi-language',
    'pi pi-file-export',
    'pi pi-file-import',
    'pi pi-file-word',
    'pi pi-gift',
    'pi pi-cart-plus',
    'pi pi-thumbs-down-fill',
    'pi pi-thumbs-up-fill',
    'pi pi-arrows-alt',
    'pi pi-calculator',
    'pi pi-sort-alt-slash',
    'pi pi-arrows-h',
    'pi pi-arrows-v',
    'pi pi-pound',
    'pi pi-prime',
    'pi pi-chart-pie',
    'pi pi-reddit',
    'pi pi-code',
    'pi pi-sync',
    'pi pi-shopping-bag',
    'pi pi-server',
    'pi pi-database',
    'pi pi-hashtag',
    'pi pi-bookmark-fill',
    'pi pi-filter-fill',
    'pi pi-heart-fill',
    'pi pi-flag-fill',
    'pi pi-circle',
    'pi pi-circle-fill',
    'pi pi-bolt',
    'pi pi-history',
    'pi pi-box',
    'pi pi-at',
    'pi pi-arrow-up-right',
    'pi pi-arrow-up-left',
    'pi pi-arrow-down-left',
    'pi pi-arrow-down-right',
    'pi pi-telegram',
    'pi pi-stop-circle',
    'pi pi-stop',
    'pi pi-whatsapp',
    'pi pi-building',
    'pi pi-qrcode',
    'pi pi-car',
    'pi pi-instagram',
    'pi pi-linkedin',
    'pi pi-send',
    'pi pi-slack',
    'pi pi-moon',
    'pi pi-sun',
    'pi pi-youtube',
    'pi pi-vimeo',
    'pi pi-flag',
    'pi pi-wallet',
    'pi pi-map',
    'pi pi-link',
    'pi pi-credit-card',
    'pi pi-discord',
    'pi pi-percentage',
    'pi pi-euro',
    'pi pi-book',
    'pi pi-shield',
    'pi pi-paypal',
    'pi pi-amazon',
    'pi pi-phone',
    'pi pi-filter-slash',
    'pi pi-facebook',
    'pi pi-github',
    'pi pi-twitter',
    'pi pi-step-backward-alt',
    'pi pi-step-forward-alt',
    'pi pi-forward',
    'pi pi-backward',
    'pi pi-fast-backward',
    'pi pi-fast-forward',
    'pi pi-pause',
    'pi pi-play',
    'pi pi-compass',
    'pi pi-id-card',
    'pi pi-ticket',
    'pi pi-file-o',
    'pi pi-reply',
    'pi pi-directions-alt',
    'pi pi-directions',
    'pi pi-thumbs-up',
    'pi pi-thumbs-down',
    'pi pi-sort-numeric-down-alt',
    'pi pi-sort-numeric-up-alt',
    'pi pi-sort-alpha-down-alt',
    'pi pi-sort-alpha-up-alt',
    'pi pi-sort-numeric-down',
    'pi pi-sort-numeric-up',
    'pi pi-sort-alpha-down',
    'pi pi-sort-alpha-up',
    'pi pi-sort-alt',
    'pi pi-sort-amount-up',
    'pi pi-sort-amount-down',
    'pi pi-sort-amount-down-alt',
    'pi pi-sort-amount-up-alt',
    'pi pi-palette',
    'pi pi-undo',
    'pi pi-desktop',
    'pi pi-sliders-v',
    'pi pi-sliders-h',
    'pi pi-search-plus',
    'pi pi-search-minus',
    'pi pi-file-excel',
    'pi pi-file-pdf',
    'pi pi-check-square',
    'pi pi-chart-line',
    'pi pi-user-edit',
    'pi pi-exclamation-circle',
    'pi pi-android',
    'pi pi-google',
    'pi pi-apple',
    'pi pi-microsoft',
    'pi pi-heart',
    'pi pi-mobile',
    'pi pi-tablet',
    'pi pi-key',
    'pi pi-shopping-cart',
    'pi pi-comments',
    'pi pi-comment',
    'pi pi-briefcase',
    'pi pi-bell',
    'pi pi-paperclip',
    'pi pi-share-alt',
    'pi pi-envelope',
    'pi pi-volume-down',
    'pi pi-volume-up',
    'pi pi-volume-off',
    'pi pi-eject',
    'pi pi-money-bill',
    'pi pi-images',
    'pi pi-image',
    'pi pi-sign-in',
    'pi pi-sign-out',
    'pi pi-wifi',
    'pi pi-sitemap',
    'pi pi-chart-bar',
    'pi pi-camera',
    'pi pi-dollar',
    'pi pi-lock-open',
    'pi pi-table',
    'pi pi-map-marker',
    'pi pi-list',
    'pi pi-eye-slash',
    'pi pi-eye',
    'pi pi-folder-open',
    'pi pi-folder',
    'pi pi-video',
    'pi pi-inbox',
    'pi pi-lock',
    'pi pi-unlock',
    'pi pi-tags',
    'pi pi-tag',
    'pi pi-power-off',
    'pi pi-save',
    'pi pi-question-circle',
    'pi pi-question',
    'pi pi-copy',
    'pi pi-file',
    'pi pi-clone',
    'pi pi-calendar-times',
    'pi pi-calendar-minus',
    'pi pi-calendar-plus',
    'pi pi-ellipsis-v',
    'pi pi-ellipsis-h',
    'pi pi-bookmark',
    'pi pi-globe',
    'pi pi-replay',
    'pi pi-filter',
    'pi pi-print',
    'pi pi-align-right',
    'pi pi-align-left',
    'pi pi-align-center',
    'pi pi-align-justify',
    'pi pi-cog',
    'pi pi-cloud-download',
    'pi pi-cloud-upload',
    'pi pi-cloud',
    'pi pi-pencil',
    'pi pi-users',
    'pi pi-clock',
    'pi pi-user-minus',
    'pi pi-user-plus',
    'pi pi-trash',
    'pi pi-window-minimize',
    'pi pi-window-maximize',
    'pi pi-external-link',
    'pi pi-refresh',
    'pi pi-user',
    'pi pi-exclamation-triangle',
    'pi pi-calendar',
    'pi pi-chevron-circle-left',
    'pi pi-chevron-circle-down',
    'pi pi-chevron-circle-right',
    'pi pi-chevron-circle-up',
    'pi pi-angle-double-down',
    'pi pi-angle-double-left',
    'pi pi-angle-double-right',
    'pi pi-angle-double-up',
    'pi pi-angle-down',
    'pi pi-angle-left',
    'pi pi-angle-right',
    'pi pi-angle-up',
    'pi pi-upload',
    'pi pi-download',
    'pi pi-ban',
    'pi pi-star-fill',
    'pi pi-star',
    'pi pi-chevron-left',
    'pi pi-chevron-right',
    'pi pi-chevron-down',
    'pi pi-chevron-up',
    'pi pi-caret-left',
    'pi pi-caret-right',
    'pi pi-caret-down',
    'pi pi-caret-up',
    'pi pi-search',
    'pi pi-check',
    'pi pi-check-circle',
    'pi pi-times',
    'pi pi-times-circle',
    'pi pi-plus',
    'pi pi-plus-circle',
    'pi pi-minus',
    'pi pi-minus-circle',
    'pi pi-circle-on',
    'pi pi-circle-off',
    'pi pi-sort-down',
    'pi pi-sort-up',
    'pi pi-sort',
    'pi pi-step-backward',
    'pi pi-step-forward',
    'pi pi-th-large',
    'pi pi-arrow-down',
    'pi pi-arrow-left',
    'pi pi-arrow-right',
    'pi pi-arrow-up',
    'pi pi-bars',
    'pi pi-arrow-circle-down',
    'pi pi-arrow-circle-left',
    'pi pi-arrow-circle-right',
    'pi pi-arrow-circle-up',
    'pi pi-info',
    'pi pi-info-circle',
    'pi pi-home',
    'pi pi-spinner'
  ];
  public iconList: SelectItem[];
  @ViewChild('dropdown') dropdown!: Dropdown;

  public onChange!: (value: any) => void;
  public onTouch!: () => void;
  public disabled!: boolean;

  set value(val: any) {
    if (/^data:image\/([a-z]+);base64,/.test(val)) {
      this.iconLogo = val;
      this.cdr.detectChanges();
      return;
    }
    this.formControl.setValue(val);
  }

  formControl = new FormControl();

  public iconLogo = '';

  constructor(private cdr: ChangeDetectorRef) {
    this.iconList = this.initIcon.map(icon => ({
      label: icon.replace('pi ', ''),
      value: icon
    }));
  }

  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onDropdownChange(event: any) {
    this.onChange(event.value);
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
          this.iconLogo = res[0] as string;
          this.onChange?.(this.iconLogo);
          this.cdr.detectChanges();
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  removePic() {
    this.iconLogo = '';
    this.onChange?.(null);
  }
}