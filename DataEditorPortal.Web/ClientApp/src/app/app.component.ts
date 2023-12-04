import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { PrimeNGConfig } from 'primeng/api';
import { AuthType, LOGIN_ENV } from './features/http-config/http-config.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'data-editor-portal';

  constructor(
    private primengConfig: PrimeNGConfig,
    @Optional() private authService: MsalService,
    @Inject(LOGIN_ENV) private authConfig: AuthType
  ) {
    if (this.authConfig === 'AzureAd' && this.authService) {
      this.authService.handleRedirectObservable().subscribe();
    }
  }

  ngOnInit(): void {
    this.primengConfig.ripple = false;
  }
}
