import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'data-editor-portal';

  constructor(
    private primengConfig: PrimeNGConfig,
    private authService: MsalService
  ) {
    this.authService.handleRedirectObservable().subscribe();
  }

  ngOnInit(): void {
    this.primengConfig.ripple = false;
  }
}
