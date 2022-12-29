import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { PrimeNGConfig } from 'primeng/api';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'data-editor-portal';
  bgColor = 'bg-primary';
  inputValue = '#3F51B5';

  constructor(
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig,
    private themeService: ThemeService
  ) {}
  ngOnInit(): void {
    this.primengConfig.ripple = true;

    // init the theme style
    this.themeService.changePrimaryColor(this.themeService.primaryColor);
  }

  onSearch() {
    this.handleClick();
  }

  handleClick() {
    this.themeService.changePrimaryColor(this.inputValue);
    console.log(1);
  }
}
