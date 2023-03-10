import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, tap } from 'rxjs';
import { NotifyService, UserService } from 'src/app/shared';

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
    private notifyService: NotifyService
  ) {}

  ngOnInit(): void {
    this.attemptLogin();
  }

  attemptLogin() {
    this.isLoading = true;
    this.hasLoginError = false;

    this.userService
      .login()
      .pipe(
        tap(() => {
          if (this.userService.isLogin) {
            this.route.queryParams
              .pipe(
                tap((qp: any) => {
                  if (qp && qp.returnUrl) {
                    this.router.navigateByUrl(qp.returnUrl);
                  } else {
                    this.router.navigate(['']);
                  }
                })
              )
              .subscribe();
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