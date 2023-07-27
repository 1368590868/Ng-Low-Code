import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, map, switchMap, tap } from 'rxjs';
import { ConfigDataService } from 'src/app/shared';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  public content$!: Observable<SafeHtml>;
  constructor(
    private configDataService: ConfigDataService,
    private domSanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.content$ = this.configDataService.siteGroup$.pipe(
      switchMap(siteGroup => {
        return this.configDataService.getHTMLData('contact', siteGroup?.id);
      }),
      map(res => {
        return this.domSanitizer.bypassSecurityTrustHtml(res);
      })
    );
  }
}
