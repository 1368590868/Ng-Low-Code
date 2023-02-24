import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent {
  public errorMessage = 'Page Not Found.';
  public errorCode = '404';
  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(qp => {
      if (qp['code'] === '401') {
        this.errorMessage = `You don't have the permissions to access this page`;
        this.errorCode = 'Access Denied';
      }
    });
  }
  goHome() {
    this.router.navigate(['']);
  }
}
