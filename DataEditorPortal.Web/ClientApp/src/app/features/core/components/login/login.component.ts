import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, first, tap, withLatestFrom } from 'rxjs';
import { ConfigDataService, UserService } from 'src/app/shared';
import { RouteService } from '../../services/route.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isLoading = true;
  hasLoginError = false;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private routeService: RouteService,
    private configDataServce: ConfigDataService
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        first(),
        tap(qp => {
          const returnUrl = qp && qp['returnUrl'];
          this.attemptLogin(returnUrl);
        })
      )
      .subscribe();
  }

  attemptLogin(returnUrl: string | undefined) {
    this.isLoading = true;
    this.hasLoginError = false;

    this.userService
      .login(returnUrl)
      .pipe(
        withLatestFrom(this.configDataServce.siteGroup$),
        tap(([res, siteGroup]) => {
          if (this.userService.isLogin) {
            this.routeService.resetRoutesConfig(
              res.data?.userMenus || [],
              siteGroup?.name
            );
            this.router.navigateByUrl(returnUrl || '');
          } else {
            this.hasLoginError = true;
          }
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe();
  }

  reload() {
    location.reload();
  }
}
