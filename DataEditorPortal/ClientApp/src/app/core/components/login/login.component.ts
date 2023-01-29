import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, tap } from 'rxjs';
import { UserService } from '../../services/user.service';
import { NotifyService } from '../../utils/notify.service';

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
          if (JSON.stringify(this.userService.USER) !== '{}') {
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
