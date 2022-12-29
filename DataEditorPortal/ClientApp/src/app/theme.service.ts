import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  primaryColor: string;
  constructor() {
    this.primaryColor = '#3F51B5';
  }

  changePrimaryColor(color: string) {
    this.primaryColor = color;
    document.documentElement.style.cssText = `
    --diy-color-primary: ${this.primaryColor};
    --diy-text-color-primary: #ffffff;
    `;
  }
}
