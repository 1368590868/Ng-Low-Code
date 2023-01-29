import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent {
  public errorMessage = 'Page Not Found.';
  public errorCode = 404;
  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(qp => {
      if (qp['code'] === '401') {
        this.errorMessage = 'Unauthorized Access.';
        this.errorCode = 401;
      }
    });
  }
  goHome() {
    this.router.navigate(['']);
  }
}
