import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, tap } from 'rxjs/operators';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  isLoading: boolean;
  hasLoginError: boolean;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    this.attemptLogin();
  }


  attemptLogin() {
    this.isLoading = true;
    this.hasLoginError = false;

    this.userService.login().pipe(
      tap(() => {
        if (this.userService.USER) {
          this.route.queryParams.pipe(
            tap(qp => {
              if (qp && qp.returnUrl) {
                console.log('login route navigate', qp.returnUrl); 
//                this.router.navigate([qp.returnUrl.split('?')[0]], { queryParams : qp});
                  this.router.navigateByUrl(qp.returnUrl); 
              } else {
                this.router.navigate(['/']);
              }
            })
          ).subscribe();
        } else {
          this.hasLoginError = true;
        }
      }),
      catchError(err => {
        this.hasLoginError = true;
        return this.notificationService.notifyErrorInPipe(err);
      }),
      finalize(() => this.isLoading = false),
    ).subscribe();
  }
}
