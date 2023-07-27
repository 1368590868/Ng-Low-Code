import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, map, switchMap } from 'rxjs';
import { ConfigDataService } from 'src/app/shared';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  public content$!: Observable<SafeHtml>;
  constructor(
    private configDataService: ConfigDataService,
    private domSanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.content$ = this.configDataService.siteGroup$.pipe(
      switchMap(siteGroup => {
        return this.configDataService.getHTMLData('about', siteGroup?.id);
      }),
      map(res => {
        return this.domSanitizer.bypassSecurityTrustHtml(res);
      })
    );
  }
}
